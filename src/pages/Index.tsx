import { useState } from "react";
import Icon from "@/components/ui/icon";

const PRODUCTS = [
  {
    id: 1,
    title: "Кожаная сумка для камеры",
    price: 8500,
    oldPrice: 12000,
    category: "Аксессуары",
    seller: "Алексей М.",
    rating: 4.9,
    reviews: 23,
    image: "https://cdn.poehali.dev/projects/5b181c86-f5af-424e-8406-390733bb3979/files/2ea82c2e-764f-4a9d-97d7-d477ed2edd01.jpg",
    badge: "Горячее",
    description: "Ручная работа, натуральная кожа full-grain, подходит для зеркальных камер и беззеркалок. Внутри мягкие перегородки.",
  },
  {
    id: 2,
    title: "Беспроводные наушники",
    price: 14900,
    oldPrice: null,
    category: "Электроника",
    seller: "TechStore",
    rating: 4.7,
    reviews: 58,
    image: "https://cdn.poehali.dev/projects/5b181c86-f5af-424e-8406-390733bb3979/files/c8b0b6d0-551f-444c-88d7-60d2a244f47b.jpg",
    badge: null,
    description: "Active Noise Cancellation, 30 ч автономной работы, быстрая зарядка 10 мин = 3 часа воспроизведения.",
  },
  {
    id: 3,
    title: "Механические часы",
    price: 32000,
    oldPrice: 45000,
    category: "Часы",
    seller: "VintageTime",
    rating: 5.0,
    reviews: 12,
    image: "https://cdn.poehali.dev/projects/5b181c86-f5af-424e-8406-390733bb3979/files/6e938604-6f50-4151-ae8a-65273b9ed3d3.jpg",
    badge: "Скидка",
    description: "Швейцарский механизм ETA, водонепроницаемость 50м, сапфировое стекло, серебристый корпус.",
  },
  {
    id: 4,
    title: "Керамический пуровер",
    price: 3200,
    oldPrice: null,
    category: "Кухня",
    seller: "CeramicArt",
    rating: 4.8,
    reviews: 34,
    image: "https://cdn.poehali.dev/projects/5b181c86-f5af-424e-8406-390733bb3979/files/5aa4050f-0daa-459c-9bf3-639d652faf14.jpg",
    badge: "Новинка",
    description: "Ручная работа, пористая керамика для идеальной фильтрации. В наборе подставка и мерная ложка.",
  },
];

const DEALS = [
  { id: 1, title: "Кожаная сумка для камеры", buyer: "Иван П.", status: "Завершена", date: "03 апр", amount: 8500, statusColor: "text-green-600" },
  { id: 2, title: "Механические часы", buyer: "Мария С.", status: "В процессе", date: "06 апр", amount: 32000, statusColor: "text-amber-600" },
  { id: 3, title: "Беспроводные наушники", buyer: "Пётр К.", status: "Ожидание", date: "07 апр", amount: 14900, statusColor: "text-muted-foreground" },
];

const CHATS = [
  { id: 1, name: "Иван П.", lastMsg: "Спасибо за покупку!", time: "10:42", unread: 0, avatar: "И", product: "Кожаная сумка" },
  { id: 2, name: "Мария С.", lastMsg: "Можно примерить перед покупкой?", time: "Вчера", unread: 2, avatar: "М", product: "Часы" },
  { id: 3, name: "TechStore", lastMsg: "Доставка завтра утром", time: "Вчера", unread: 1, avatar: "T", product: "Наушники" },
  { id: 4, name: "CeramicArt", lastMsg: "Есть в наличии!", time: "2 апр", unread: 0, avatar: "C", product: "Пуровер" },
];

const CATEGORIES = ["Все", "Электроника", "Аксессуары", "Часы", "Кухня", "Одежда", "Книги"];

type Tab = "home" | "deals" | "chat" | "search" | "profile";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStep, setAiStep] = useState<"form" | "loading" | "result">("form");
  const [aiDesc, setAiDesc] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "Все" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAiGenerate = () => {
    setAiStep("loading");
    setTimeout(() => {
      setAiResult(
        `${aiDesc.trim() ? aiDesc : "Товар"} — ${
          ["премиального качества, сделан вручную из натуральных материалов",
           "идеальный выбор для ценителей стиля и функциональности",
           "ограниченная серия с уникальным дизайном"][Math.floor(Math.random() * 3)]
        }. Отличное состояние, оригинальная упаковка сохранена. Готов к быстрой отправке по всей России.`
      );
      setAiStep("result");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
          <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-border">
            <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ChevronLeft" size={20} />
              <span className="text-sm">Назад</span>
            </button>
            <button
              onClick={() => toggleWishlist(selectedProduct.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon
                name="Heart"
                size={20}
                className={wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""}
              />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="aspect-square w-full bg-secondary">
              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
            </div>
            <div className="px-5 py-6 space-y-5 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-bold mt-1 leading-tight">{selectedProduct.title}</h2>
                </div>
                {selectedProduct.badge && (
                  <span className="bg-foreground text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mt-1 shrink-0">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{selectedProduct.price.toLocaleString()} ₽</span>
                {selectedProduct.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">{selectedProduct.oldPrice.toLocaleString()} ₽</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                  {selectedProduct.seller[0]}
                </div>
                <span className="text-sm font-medium">{selectedProduct.seller}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{selectedProduct.rating}</span>
                  <span className="text-sm text-muted-foreground">({selectedProduct.reviews})</span>
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-sm leading-relaxed text-foreground/80">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-4">
                <button className="bg-secondary text-foreground font-semibold py-3.5 rounded-xl text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <Icon name="MessageCircle" size={16} />
                  Написать
                </button>
                <button className="bg-foreground text-primary-foreground font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
                  Купить сейчас
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end animate-fade-in" onClick={() => { setShowAiModal(false); setAiStep("form"); setAiDesc(""); setAiResult(""); }}>
          <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl p-6 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Icon name="Sparkles" size={16} className="text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold">ИИ-описание товара</h3>
            </div>

            {aiStep === "form" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Кратко о товаре</label>
                  <textarea
                    className="w-full bg-secondary rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-foreground/20 h-28 placeholder:text-muted-foreground"
                    placeholder="Напр.: Vintage Leica M3, 1956 год, состояние 8/10, полный комплект..."
                    value={aiDesc}
                    onChange={(e) => setAiDesc(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Приложите фото — ИИ учтёт внешний вид товара для точного описания</p>
                <div className="border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors">
                  <Icon name="ImagePlus" size={22} />
                  <span className="text-sm">Добавить фото товара</span>
                </div>
                <button
                  onClick={handleAiGenerate}
                  disabled={!aiDesc.trim()}
                  className="w-full bg-foreground text-primary-foreground font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  Сгенерировать описание
                </button>
              </div>
            )}

            {aiStep === "loading" && (
              <div className="space-y-3">
                <div className="ai-shimmer h-4 rounded-full w-full" />
                <div className="ai-shimmer h-4 rounded-full w-5/6" />
                <div className="ai-shimmer h-4 rounded-full w-4/6" />
                <div className="ai-shimmer h-4 rounded-full w-full mt-4" />
                <div className="ai-shimmer h-4 rounded-full w-3/4" />
                <p className="text-center text-sm text-muted-foreground pt-2">Анализирую и пишу описание...</p>
              </div>
            )}

            {aiStep === "result" && (
              <div className="space-y-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm leading-relaxed">{aiResult}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAiStep("form")}
                    className="bg-secondary text-foreground font-semibold py-3 rounded-xl text-sm hover:bg-muted transition-colors"
                  >
                    Переделать
                  </button>
                  <button
                    onClick={() => { setShowAiModal(false); setAiStep("form"); setAiDesc(""); setAiResult(""); }}
                    className="bg-foreground text-primary-foreground font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  >
                    Использовать
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-14 pb-4 bg-background sticky top-0 z-30 border-b border-border">
        {activeTab === "home" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Добро пожаловать</p>
              <h1 className="text-xl font-bold tracking-tight">Маркет</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <Icon name="Bell" size={18} />
              </button>
              <button className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-primary-foreground text-sm font-bold">
                А
              </button>
            </div>
          </div>
        )}
        {activeTab === "search" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
              <Icon name="Search" size={17} className="text-muted-foreground shrink-0" />
              <input
                className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <Icon name="X" size={15} className="text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}
        {activeTab === "deals" && <h1 className="text-xl font-bold tracking-tight">Сделки</h1>}
        {activeTab === "chat" && (
          <div className="flex items-center gap-3">
            {activeChat && (
              <button onClick={() => setActiveChat(null)} className="text-muted-foreground">
                <Icon name="ChevronLeft" size={22} />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight">
              {activeChat ? CHATS.find(c => c.id === activeChat)?.name : "Чаты"}
            </h1>
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
              <button
                onClick={() => setActiveTab("search")}
                className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 text-muted-foreground text-sm"
              >
                <Icon name="Search" size={17} />
                Найти товар...
              </button>
            </div>

            {/* Banner */}
            <div className="mx-5 mb-5 bg-foreground rounded-2xl p-5 flex items-center justify-between overflow-hidden relative">
              <div className="z-10">
                <p className="text-primary-foreground/60 text-xs font-medium mb-1">Новая функция</p>
                <h3 className="text-primary-foreground font-bold text-base leading-tight mb-3">
                  ИИ пишет описание<br/>товара за секунды
                </h3>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="bg-white text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Попробовать
                </button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon name="Sparkles" size={36} className="text-white/80" />
              </div>
            </div>

            {/* Categories */}
            <div className="px-5 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-foreground text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 mb-3 flex items-center justify-between">
              <h2 className="font-bold text-base">
                {activeCategory === "Все" ? "Все товары" : activeCategory}
              </h2>
              <span className="text-sm text-muted-foreground">{filteredProducts.length} товаров</span>
            </div>

            {/* Products grid */}
            <div className="px-5 grid grid-cols-2 gap-3">
              {filteredProducts.map((product, i) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-card rounded-2xl overflow-hidden text-left card-hover border border-border animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="aspect-square bg-secondary relative">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-foreground text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
                    >
                      <Icon
                        name="Heart"
                        size={13}
                        className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-foreground/60"}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">{product.category}</p>
                    <p className="text-sm font-semibold leading-tight mb-1.5 line-clamp-2">{product.title}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{product.price.toLocaleString()} ₽</p>
                        {product.oldPrice && (
                          <p className="text-[10px] text-muted-foreground line-through">{product.oldPrice.toLocaleString()} ₽</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Icon name="Star" size={11} className="fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-semibold">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="animate-fade-in">
            <div className="px-5 py-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-foreground text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Icon name="SearchX" size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="font-semibold">Ничего не найдено</p>
                  <p className="text-sm text-muted-foreground mt-1">Попробуйте другой запрос</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="w-full flex gap-4 bg-card border border-border rounded-2xl p-3 text-left card-hover"
                  >
                    <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">{product.category}</p>
                      <p className="font-semibold text-sm leading-tight mt-0.5 line-clamp-2">{product.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-sm">{product.price.toLocaleString()} ₽</span>
                        {product.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString()} ₽</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="Star" size={11} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs">{product.rating} · {product.seller}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* DEALS */}
        {activeTab === "deals" && (
          <div className="px-5 py-4 animate-fade-in space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Активных", value: "1", icon: "Clock" },
                { label: "Завершено", value: "1", icon: "CheckCircle" },
                { label: "На сумму", value: "55.4к", icon: "Wallet" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center">
                  <Icon name={stat.icon} size={18} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Все сделки</h2>
              {DEALS.map((deal, i) => (
                <div
                  key={deal.id}
                  className="bg-card border border-border rounded-2xl p-4 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm leading-tight">{deal.title}</p>
                    <span className={`text-xs font-semibold shrink-0 ${deal.statusColor}`}>{deal.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {deal.buyer[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{deal.buyer} · {deal.date}</span>
                    </div>
                    <span className="font-bold text-sm">{deal.amount.toLocaleString()} ₽</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && !activeChat && (
          <div className="animate-fade-in">
            <div className="px-5 py-4 space-y-1">
              {CHATS.map((chat, i) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-secondary transition-colors text-left animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {chat.avatar}
                    </div>
                    {chat.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-sm">{chat.name}</p>
                      <p className="text-xs text-muted-foreground">{chat.time}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{chat.product}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && activeChat && (() => {
          const chat = CHATS.find((c) => c.id === activeChat)!;
          return (
            <div className="flex flex-col animate-fade-in" style={{ height: "calc(100vh - 180px)" }}>
              <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm">Добрый день! Интересует товар, он ещё в наличии?</p>
                    <p className="text-[10px] text-muted-foreground mt-1">10:30</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm text-primary-foreground">Да, есть! Могу отправить сегодня</p>
                    <p className="text-[10px] text-primary-foreground/60 mt-1">10:35</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm">{chat.lastMsg}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{chat.time}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border flex items-center gap-3">
                <input
                  className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Сообщение..."
                />
                <button className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                  <Icon name="Send" size={16} className="text-primary-foreground" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-fade-in">
            <div className="px-5 py-6 flex flex-col items-center text-center border-b border-border">
              <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center text-primary-foreground text-3xl font-bold mb-3">
                А
              </div>
              <h2 className="text-xl font-bold">Алексей Морозов</h2>
              <p className="text-sm text-muted-foreground mt-0.5">На маркете с марта 2024</p>
              <div className="flex items-center gap-1 mt-2">
                <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">4.9</span>
                <span className="text-sm text-muted-foreground">(23 отзыва)</span>
              </div>
              <div className="flex gap-6 mt-5">
                {[{ label: "Товаров", value: "4" }, { label: "Сделок", value: "3" }, { label: "Отзывов", value: "23" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-bold text-lg">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 space-y-2">
              <button
                onClick={() => setShowAiModal(true)}
                className="w-full flex items-center gap-4 bg-foreground text-primary-foreground rounded-2xl p-4"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Icon name="Sparkles" size={18} className="text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Добавить товар с ИИ</p>
                  <p className="text-xs text-primary-foreground/60">Описание за секунды</p>
                </div>
                <Icon name="ChevronRight" size={18} className="ml-auto text-primary-foreground/60" />
              </button>

              {[
                { icon: "Package", label: "Мои товары", sub: "4 объявления" },
                { icon: "Heart", label: "Избранное", sub: `${wishlist.length} товаров` },
                { icon: "CreditCard", label: "Платежи и кошелёк", sub: "Настройки оплаты" },
                { icon: "Bell", label: "Уведомления", sub: "Включены" },
                { icon: "Settings", label: "Настройки аккаунта", sub: "" },
              ].map((item) => (
                <button
                  key={item.label}
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
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur border-t border-border z-40">
        <div className="flex items-center justify-around px-4 py-2 pb-6">
          {([ 
            { id: "home" as Tab, icon: "Home", label: "Главная", badge: 0 },
            { id: "deals" as Tab, icon: "Handshake", label: "Сделки", badge: 0 },
            { id: "chat" as Tab, icon: "MessageCircle", label: "Чаты", badge: 3 },
            { id: "search" as Tab, icon: "Search", label: "Поиск", badge: 0 },
            { id: "profile" as Tab, icon: "User", label: "Профиль", badge: 0 },
          ] as { id: Tab; icon: string; label: string; badge: number }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveChat(null); }}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl relative transition-all ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon name={tab.icon} size={22} strokeWidth={activeTab === tab.id ? 2.2 : 1.7} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-foreground rounded-full" />
              )}
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