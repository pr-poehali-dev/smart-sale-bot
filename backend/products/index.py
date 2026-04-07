"""
Товары пользователей.
GET  ?action=list    — список всех товаров (публичный)
GET  ?action=my      — мои товары (требует X-Session-Id)
POST (action=create) — создать товар (требует X-Session-Id)
"""

import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }


def get_session_user(conn, session_id: str):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = %s",
            (session_id,)
        )
        row = cur.fetchone()
        if row:
            return {"id": row[0], "name": row[1], "email": row[2]}
    return None


def row_to_product(row):
    return {
        "id": row[0],
        "user_id": row[1],
        "seller": row[2],
        "title": row[3],
        "description": row[4],
        "price": row[5],
        "old_price": row[6],
        "category": row[7],
        "image_url": row[8],
        "badge": row[9],
        "created_at": row[10].isoformat() if row[10] else None,
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id") or ""
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "list")

    conn = get_conn()

    try:
        # ── GET list (public) ────────────────────────────────────────
        if method == "GET" and action == "list":
            with conn.cursor() as cur:
                cur.execute(
                    """SELECT p.id, p.user_id, u.name, p.title, p.description, p.price, p.old_price,
                              p.category, p.image_url, p.badge, p.created_at
                       FROM products p JOIN users u ON u.id = p.user_id
                       ORDER BY p.created_at DESC LIMIT 100"""
                )
                products = [row_to_product(r) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"products": products})}

        # ── GET my ───────────────────────────────────────────────────
        if method == "GET" and action == "my":
            if not session_id:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"})}
            user = get_session_user(conn, session_id)
            if not user:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"})}
            with conn.cursor() as cur:
                cur.execute(
                    """SELECT p.id, p.user_id, u.name, p.title, p.description, p.price, p.old_price,
                              p.category, p.image_url, p.badge, p.created_at
                       FROM products p JOIN users u ON u.id = p.user_id
                       WHERE p.user_id = %s ORDER BY p.created_at DESC""",
                    (user["id"],)
                )
                products = [row_to_product(r) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"products": products})}

        # ── POST create ──────────────────────────────────────────────
        if method == "POST":
            if not session_id:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"})}
            user = get_session_user(conn, session_id)
            if not user:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"})}

            body = json.loads(event.get("body") or "{}")
            title = (body.get("title") or "").strip()
            price_raw = body.get("price")
            category = (body.get("category") or "Другое").strip()

            if not title or price_raw is None:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Укажите название и цену"})}

            try:
                price = int(price_raw)
            except (ValueError, TypeError):
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Цена должна быть числом"})}

            old_price = body.get("old_price")
            if old_price:
                try:
                    old_price = int(old_price)
                except (ValueError, TypeError):
                    old_price = None

            description = (body.get("description") or "").strip() or None
            image_url = (body.get("image_url") or "").strip() or None
            badge = (body.get("badge") or "").strip() or None

            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO products (user_id, title, description, price, old_price, category, image_url, badge)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                       RETURNING id, user_id, title, description, price, old_price, category, image_url, badge, created_at""",
                    (user["id"], title, description, price, old_price, category, image_url, badge)
                )
                row = cur.fetchone()
            conn.commit()

            product = {
                "id": row[0], "user_id": row[1], "seller": user["name"],
                "title": row[2], "description": row[3], "price": row[4],
                "old_price": row[5], "category": row[6], "image_url": row[7],
                "badge": row[8], "created_at": row[9].isoformat() if row[9] else None
            }
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"product": product})}

        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Неверный запрос"})}

    finally:
        conn.close()
