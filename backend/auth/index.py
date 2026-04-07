"""
Аутентификация: регистрация, вход, профиль, выход.
Роутинг через ?action= или поле action в теле:
GET  ?action=me       — по сессии (X-Session-Id)
POST action=register  — { name, email, password }
POST action=login     — { email, password }
POST action=logout    — по сессии
"""

import json
import os
import hashlib
import secrets
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


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


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id") or ""

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    body = {}
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        if not action:
            action = body.get("action", "")

    conn = get_conn()

    try:
        # ── GET me ───────────────────────────────────────────────────
        if method == "GET":
            if not session_id:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Не авторизован"})}
            user = get_session_user(conn, session_id)
            if not user:
                return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Сессия истекла"})}
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"user": user})}

        # ── POST register ────────────────────────────────────────────
        if action == "register":
            name = (body.get("name") or "").strip()
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not name or not email or len(password) < 6:
                return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Заполните все поля (пароль ≥ 6 символов)"})}

            pwd_hash = hash_password(password)
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email",
                        (name, email, pwd_hash)
                    )
                    row = cur.fetchone()
                    user = {"id": row[0], "name": row[1], "email": row[2]}
                except psycopg2.errors.UniqueViolation:
                    conn.rollback()
                    return {"statusCode": 409, "headers": cors_headers(), "body": json.dumps({"error": "Email уже зарегистрирован"})}

                sid = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user["id"]))
            conn.commit()
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"session_id": sid, "user": user})}

        # ── POST login ───────────────────────────────────────────────
        if action == "login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            pwd_hash = hash_password(password)

            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s",
                    (email, pwd_hash)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 401, "headers": cors_headers(), "body": json.dumps({"error": "Неверный email или пароль"})}
                user = {"id": row[0], "name": row[1], "email": row[2]}
                sid = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user["id"]))
            conn.commit()
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"session_id": sid, "user": user})}

        # ── POST logout ──────────────────────────────────────────────
        if action == "logout":
            if session_id:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM sessions WHERE id = %s", (session_id,))
                conn.commit()
            return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True})}

        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "Укажите action"})}

    finally:
        conn.close()
