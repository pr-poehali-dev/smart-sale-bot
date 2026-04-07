import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/26d7caba-5a8b-413a-b308-fef7deb6f19a";
const PRODUCTS_URL = "https://functions.poehali.dev/d1e74874-75cb-449b-86eb-b00ba1e99888";

const SESSION_KEY = "market_session";

const CATEGORIES = ["Все", "Электроника", "Аксессуары", "Часы", "Кухня", "Одежда", "Книги", "Другое"];

type Tab = "home" | "search" | "add" | "profile";
type AuthMode = "login" | "register";

interface User { id: number; name: string; email: string; }
interface Product {
  id: number; user_id: number; seller: string; title: string;
  description: string | null; price: number; old_price: number | null;
  category: string; image_url: string | null; badge: string | null; created_at: string;
}

function getSession() { return localStorage.getItem(SESSION_KEY) || ""; }
function saveSession(sid: string) { localStorage.setItem(SESSION_KEY, sid); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [addForm, setAddForm] = useState({ title: "", description: "", price: "", old_price: "", category: "Другое", image_url: "", badge: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    const sid = getSession();
    if (!sid) { setAuthChecked(true); return; }
    fetch(AUTH_URL, { headers: { "X-Session-Id": sid } })
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); else clearSession(); })
      .catch(() => clearSession())
      .finally(() => setAuthChecked(true));
  }, []);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    fetch(`${PRODUCTS_URL}?action=list`)
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "Все" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleWishlist = (id: number) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const body: Record<string, string> = { action: authMode, email: authForm.email, password: authForm.password };
      if (authMode === "register") body.name = authForm.name;
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Ошибка"); return; }
      saveSession(data.session_id);
      setUser(data.user);
    } catch { setAuthError("Ошибка сети"); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    const sid = getSession();
    if (sid) await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Session-Id": sid }, body: JSON.stringify({ action: "logout" }) }).catch(() => {});
    clearSession(); setUser(null); setActiveTab("home");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(""); setAddLoading(true);
    try {
      const sid = getSession();
      const res = await fetch(PRODUCTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sid },
        body: JSON.stringify({
          title: addForm.title,
          description: addForm.description || undefined,
          price: parseInt(addForm.price),
          old_price: addForm.old_price ? parseInt(addForm.old_price) : undefined,
          category: addForm.category,
          image_url: addForm.image_url || undefined,
          badge: addForm.badge || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Ошибка"); return; }
      setAddSuccess(true);
      setAddForm({ title: "", description: "", price: "", old_price: "", category: "Другое", image_url: "", badge: "" });
      loadProducts();
      setTimeout(() => { setAddSuccess(false); setActiveTab("home"); }, 1500);
    } catch { setAddError("Ошибка сети"); }
    finally { setAddLoading(false); }
  };

  // ── Splash ────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-foreground flex items-center justify-center">
            <Icon name="ShoppingBag" size={22} className="text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // ── Auth Screen ───────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-3xl bg-foreground flex items-center justify-center mb-4 shadow-lg">
              <Icon name="ShoppingBag" size={30} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Маркет</h1>
            <p className="text-sm text-muted-foreground mt-1">Покупай и продавай просто</p>
          </div>

          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map(mode => (
              <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === mode ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >{mode === "login" ? "Войти" : "Регистрация"}</button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === "register" && (
              <div className="animate-fade-in">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Имя</label>
                <input className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                  placeholder="Алексей Морозов" value={authForm.name}
                  onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
              <input type="email" className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                placeholder="email@example.com" value={authForm.email}
                onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Пароль</label>
              <input type="password" className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                placeholder={authMode === "register" ? "Минимум 6 символов" : "••••••••"} value={authForm.password}
                onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
                <Icon name="AlertCircle" size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}
            <button type="submit" disabled={authLoading}
              className="w-full bg-foreground text-primary-foreground font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >{authLoading ? "Подождите..." : authMode === "login" ? "Войти" : "Создать аккаунт"}</button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">Нажимая кнопку, вы соглашаетесь с условиями использования</p>
        </div>
      </div>
    );
  }

  // ── Main App ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">

      {/* Product Detail */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
          <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-border">
            <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ChevronLeft" size={20} /><span className="text-sm">Назад</span>
            </button>
            <button onClick={() => toggleWishlist(selectedProduct.id)}>
              <Icon name="Heart" size={20} className={wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="aspect-square w-full bg-secondary">
              {selectedProduct.image_url
                ? <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Icon name="ImageOff" size={48} className="text-muted-foreground/30" /></div>
              }
            </div>
            <div className="px-5 py-6 space-y-4 animate-slide-up">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{selectedProduct.category}</span>
                <h2 className="text-2xl font-bold mt-1 leading-tight">{selectedProduct.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{selectedProduct.price.toLocaleString()} ₽</span>
                {selectedProduct.old_price && <span className="text-lg text-muted-foreground line-through">{selectedProduct.old_price.toLocaleString()} ₽</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{selectedProduct.seller[0]}</div>
                <span className="text-sm font-medium">{selectedProduct.seller}</span>
              </div>
              {selectedProduct.description && (
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm leading-relaxed text-foreground/80">{selectedProduct.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pb-4">
                <button className="bg-secondary text-foreground font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  <Icon name="MessageCircle" size={16} />Написать
                </button>
                <button className="bg-foreground text-primary-foreground font-semibold py-3.5 rounded-xl text-sm">Купить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-14 pb-4 bg-background sticky top-0 z-30 border-b border-border">
        {activeTab === "home" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Привет, {user.name.split(" ")[0]}</p>
              <h1 className="text-xl font-bold tracking-tight">Витрина</h1>
            </div>
            <button onClick={() => setActiveTab("add")} className="flex items-center gap-2 bg-foreground text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold">
              <Icon name="Plus" size={16} className="text-primary-foreground" />Продать
            </button>
          </div>
        )}
        {activeTab === "search" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
              <Icon name="Search" size={17} className="text-muted-foreground shrink-0" />
              <input className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Поиск товаров..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} autoFocus />
              {searchQuery && <button onClick={() => setSearchQuery("")}><Icon name="X" size={15} className="text-muted-foreground" /></button>}
            </div>
          </div>
        )}
        {activeTab === "add" && (
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("home")} className="text-muted-foreground"><Icon name="ChevronLeft" size={22} /></button>
            <h1 className="text-xl font-bold tracking-tight">Разместить товар</h1>
          </div>
        )}
        {activeTab === "profile" && <h1 className="text-xl font-bold tracking-tight">Профиль</h1>}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* HOME */}
        {activeTab === "home" && (
          <div className="animate-fade-in">
            <div className="px-5 py-4">
              <button onClick={() => setActiveTab("search")}
                className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 text-muted-foreground text-sm"
              ><Icon name="Search" size={17} />Найти товар...</button>
            </div>
            <div className="px-5 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-foreground text-primary-foreground" : "bg-secondary text-foreground"}`}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="px-5 mb-3 flex items-center justify-between">
              <h2 className="font-bold text-base">{activeCategory === "Все" ? "Все товары" : activeCategory}</h2>
              <span className="text-sm text-muted-foreground">{filteredProducts.length}</span>
            </div>
            {productsLoading ? (
              <div className="px-5 grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border">
                    <div className="aspect-square ai-shimmer" />
                    <div className="p-3 space-y-2"><div className="ai-shimmer h-3 rounded-full w-3/4" /><div className="ai-shimmer h-3 rounded-full w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="Package" size={44} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-semibold text-muted-foreground">Товаров пока нет</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Будь первым продавцом!</p>
                <button onClick={() => setActiveTab("add")}
                  className="mt-5 bg-foreground text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
                >Разместить товар</button>
              </div>
            ) : (
              <div className="px-5 grid grid-cols-2 gap-3">
                {filteredProducts.map((product, i) => (
                  <button key={product.id} onClick={() => setSelectedProduct(product)}
                    className="bg-card rounded-2xl overflow-hidden text-left card-hover border border-border animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="aspect-square bg-secondary relative">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Icon name="ImageOff" size={28} className="text-muted-foreground/30" /></div>
                      }
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-foreground text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{product.badge}</span>
                      )}
                      <button onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
                      >
                        <Icon name="Heart" size={13} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-foreground/60"} />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-muted-foreground mb-0.5">{product.category}</p>
                      <p className="text-sm font-semibold leading-tight mb-1.5 line-clamp-2">{product.title}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">{product.price.toLocaleString()} ₽</p>
                          {product.old_price && <p className="text-[10px] text-muted-foreground line-through">{product.old_price.toLocaleString()} ₽</p>}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[60px]">{product.seller}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="animate-fade-in">
            <div className="px-5 py-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-foreground text-primary-foreground" : "bg-secondary text-foreground"}`}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="px-5 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Icon name="SearchX" size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="font-semibold">Ничего не найдено</p>
                </div>
              ) : filteredProducts.map(product => (
                <button key={product.id} onClick={() => setSelectedProduct(product)}
                  className="w-full flex gap-4 bg-card border border-border rounded-2xl p-3 text-left card-hover"
                >
                  <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      : <Icon name="ImageOff" size={22} className="text-muted-foreground/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground">{product.category}</p>
                    <p className="font-semibold text-sm leading-tight mt-0.5 line-clamp-2">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-sm">{product.price.toLocaleString()} ₽</span>
                      {product.old_price && <span className="text-xs text-muted-foreground line-through">{product.old_price.toLocaleString()} ₽</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.seller}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ADD PRODUCT */}
        {activeTab === "add" && (
          <div className="px-5 py-4 animate-fade-in">
            {addSuccess ? (
              <div className="flex flex-col items-center justify-center py-20 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Icon name="CheckCircle" size={36} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Товар добавлен!</h3>
                <p className="text-sm text-muted-foreground mt-1">Возвращаемся на витрину...</p>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Название *</label>
                  <input className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                    placeholder="Например: Кожаная сумка для камеры"
                    value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Цена ₽ *</label>
                    <input type="number" min="1"
                      className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                      placeholder="8500" value={addForm.price}
                      onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Старая цена ₽</label>
                    <input type="number" min="1"
                      className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                      placeholder="12000" value={addForm.old_price}
                      onChange={e => setAddForm(f => ({ ...f, old_price: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Категория</label>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.filter(c => c !== "Все").map(cat => (
                      <button type="button" key={cat} onClick={() => setAddForm(f => ({ ...f, category: cat }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${addForm.category === cat ? "bg-foreground text-primary-foreground" : "bg-secondary text-foreground"}`}
                      >{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Описание</label>
                  <textarea className="w-full bg-secondary rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-foreground/20 h-24 placeholder:text-muted-foreground"
                    placeholder="Расскажите о товаре подробнее..."
                    value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ссылка на фото (URL)</label>
                  <input className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                    placeholder="https://..." value={addForm.image_url}
                    onChange={e => setAddForm(f => ({ ...f, image_url: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Бейдж (необязательно)</label>
                  <input className="w-full bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 placeholder:text-muted-foreground"
                    placeholder="Новинка / Горячее / Скидка" value={addForm.badge}
                    onChange={e => setAddForm(f => ({ ...f, badge: e.target.value }))} />
                </div>
                {addError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <Icon name="AlertCircle" size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{addError}</p>
                  </div>
                )}
                <button type="submit" disabled={addLoading}
                  className="w-full bg-foreground text-primary-foreground font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >{addLoading ? "Сохраняем..." : "Разместить товар"}</button>
              </form>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-fade-in">
            <div className="px-5 py-6 flex flex-col items-center text-center border-b border-border">
              <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center text-primary-foreground text-3xl font-bold mb-3">
                {user.name[0]}
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <div className="px-5 py-4 space-y-2">
              <button onClick={() => setActiveTab("add")}
                className="w-full flex items-center gap-4 bg-foreground text-primary-foreground rounded-2xl p-4"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Icon name="Plus" size={18} className="text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">Разместить товар</p>
                  <p className="text-xs text-primary-foreground/60">Добавить на витрину</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-primary-foreground/60" />
              </button>
              {[
                { icon: "Heart", label: "Избранное", sub: `${wishlist.length} товаров` },
                { icon: "Bell", label: "Уведомления", sub: "Включены" },
                { icon: "Settings", label: "Настройки", sub: "" },
              ].map(item => (
                <button key={item.label}
                  className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:bg-secondary transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-4 bg-card border border-red-100 rounded-2xl p-4 text-left hover:bg-red-50 transition-colors mt-2"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Icon name="LogOut" size={18} className="text-red-500" />
                </div>
                <p className="font-medium text-sm text-red-500">Выйти из аккаунта</p>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur border-t border-border z-40">
        <div className="flex items-center justify-around px-4 py-2 pb-6">
          {([
            { id: "home" as Tab, icon: "Home", label: "Витрина" },
            { id: "search" as Tab, icon: "Search", label: "Поиск" },
            { id: "add" as Tab, icon: "PlusCircle", label: "Продать" },
            { id: "profile" as Tab, icon: "User", label: "Профиль" },
          ] as { id: Tab; icon: string; label: string }[]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl relative transition-all ${activeTab === tab.id ? "text-foreground" : "text-muted-foreground"}`}
            >
              <Icon name={tab.icon} size={22} strokeWidth={activeTab === tab.id ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-foreground rounded-full" />}
            </button>
          ))}
        </div>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
