import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ShoppingCart, Search, ArrowUpDown, ArrowLeft, MessageCircle } from "lucide-react";

const Footer = lazy(() => import("../components/Footer"));
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import CartDrawer from "../components/CartDrawer";
import CatalogHero from "../components/CatalogHero";
import Marquee from "../components/ui/Marquee";
import Logo from "../components/brand/Logo";
import { BurstProvider } from "../lib/burst";
import { prefersReducedMotion } from "../lib/motion";
import { LANDING_URL } from "../lib/landingUrl";
import { useApp } from "../context/AppContext";
import { STORE_CONFIG, WHATSAPP_LINK, totalUnits } from "../data/store";

// La marca ya la presentó la landing: acá la cinta repite lo que el local
// necesita para pedir, sobre todo el mínimo.
const CINTA = [
  `Pedido mínimo ${STORE_CONFIG.minOrderUnits} unidades`,
  "Mezcla sabores y formatos",
  "Producido por Master Snacks",
  "Despacho en la RM",
];

// Chip de filtro. El elegido queda "hundido" (corrido hacia donde estaría
// la sombra), así se lee como un botón que ya se apretó.
const chip = (active, small = false) =>
  `inline-flex items-center justify-center font-condensed uppercase tracking-[0.06em] border-ink cursor-pointer transition-colors ${
    small ? "min-h-[34px] px-3 text-xs border-2" : "min-h-[40px] px-4 text-sm border-[3px]"
  } ${
    active
      ? "bg-ink text-gold translate-x-[3px] translate-y-[3px]"
      : "bg-cream text-ink hover:bg-cream-2 nb-press [box-shadow:3px_3px_0_var(--color-ink)]"
  }`;

function ProductCardSkeleton() {
  return (
    <div className="nb-soft bg-cream flex flex-col overflow-hidden" aria-hidden="true">
      <div className="h-60 bg-cream-2 border-b-[3px] border-ink animate-pulse" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-cream-2 animate-pulse w-1/3" />
        <div className="h-6 bg-cream-2 animate-pulse w-2/3" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-20 bg-cream-2 animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-cream-2 animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function Catalogo() {
  return (
    <BurstProvider>
      <CatalogoPage />
    </BurstProvider>
  );
}

function CatalogoPage() {
  const { products } = useApp();
  const [lineFilter, setLineFilter] = useState("todos");
  const [formatFilter, setFormatFilter] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const prefersReduced = useReducedMotion();
  const cartBump = useRef(null);
  const prevUnits = useRef(0);
  const toastTimer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Formatos de venta presentes en el catálogo (Caja, Display, Unidad…)
  const allFormats = useMemo(() => {
    const map = new Map();
    products
      .filter(p => p.active)
      .forEach(p => (p.formats || []).forEach(f => map.set(f.label, f.units)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label]) => label);
  }, [products]);

  const filtered = useMemo(() => {
    const list = products.filter(p => {
      if (!p.active) return false;
      if (lineFilter !== "todos" && p.line !== lineFilter) return false;
      if (formatFilter && !(p.formats || []).some(f => f.label === formatFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.name} ${p.flavor} ${p.line}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "disponibles":
        list.sort((a, b) => (a.status === "activo" ? -1 : 1) - (b.status === "activo" ? -1 : 1));
        break;
      default:
        // Primero lo que está a la venta, después lo que viene en camino.
        list.sort((a, b) => Number(b.status === "activo") - Number(a.status === "activo"));
    }

    return list;
  }, [products, lineFilter, formatFilter, search, sortBy]);

  const units = totalUnits(cart);

  // El botón del pedido rebota cada vez que entra algo. Se anima un
  // envoltorio y no el botón: el transform inline de GSAP le pisaría el
  // hundido de .nb-press.
  useEffect(() => {
    const grew = units > prevUnits.current;
    prevUnits.current = units;
    if (!grew || !cartBump.current || prefersReducedMotion()) return;
    gsap
      .timeline({ overwrite: true })
      .to(cartBump.current, { scale: 1.16, rotation: -5, duration: 0.14, ease: "power2.out" })
      .to(cartBump.current, { scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
  }, [units]);

  function addToCart(product, format, qty = 1) {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id && c.formatId === format.id);
      if (ex) {
        return prev.map(c =>
          c.id === product.id && c.formatId === format.id ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          grams: product.grams,
          image: product.image,
          emoji: product.emoji,
          flavor: product.flavor,
          formatId: format.id,
          formatLabel: format.label,
          units: format.units,
          price: format.price,
          qty,
        },
      ];
    });
    showToast(`${product.name} · ${format.label} ×${qty} agregado`);
  }

  function changeQty(item, delta) {
    setCart(prev =>
      prev
        .map(c =>
          c.id === item.id && c.formatId === item.formatId ? { ...c, qty: c.qty + delta } : c
        )
        .filter(c => c.qty > 0)
    );
  }

  function removeItem(item) {
    setCart(prev => prev.filter(c => !(c.id === item.id && c.formatId === item.formatId)));
  }

  function clearCart() {
    setCart([]);
    showToast("Pedido vaciado");
  }

  function showToast(msg) {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function clearFilters() {
    setLineFilter("todos");
    setFormatFilter(null);
    setSearch("");
  }

  return (
    <div className="grain min-h-screen font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b-[3px] border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <a href={LANDING_URL} className="shrink-0" aria-label="Chitopo — ir al sitio">
              <Logo height={32} />
            </a>
            <span className="hidden md:inline-flex items-center font-condensed uppercase tracking-[0.12em] text-xs px-2.5 py-1 bg-ink text-gold">
              {STORE_CONFIG.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={LANDING_URL}
              className="inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-1 sm:px-2 font-condensed uppercase tracking-[0.1em] text-sm text-ink hover:text-fire no-underline transition-colors"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Volver al sitio</span>
            </a>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="inline-flex items-center justify-center size-11 text-ink hover:text-[#15803d] transition-colors"
            >
              <MessageCircle size={22} aria-hidden="true" />
            </a>

            <span ref={cartBump} className="inline-block">
              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex items-center gap-2 min-h-[44px] px-3 sm:px-4 bg-fire text-cream font-condensed uppercase tracking-[0.06em] text-sm border-[3px] border-ink [box-shadow:3px_3px_0_var(--color-ink)] nb-press cursor-pointer"
                aria-label={`Ver pedido, ${units} bolsas`}
              >
                <ShoppingCart size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Mi pedido</span>
                {units > 0 && (
                  <span className="min-w-[26px] h-6 px-1.5 grid place-items-center bg-gold text-ink border-2 border-ink font-sans text-xs font-bold tabular-nums">
                    {units}
                  </span>
                )}
              </button>
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <CatalogHero />
        <Marquee items={CINTA} duration={26} />

        <section
          id="productos"
          aria-label="Productos"
          className="max-w-6xl mx-auto px-4 sm:px-6 pt-7 pb-16 sm:pt-12 sm:pb-24 w-full"
        >
          <div className="relative mb-5 sm:mb-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Busca un sabor o producto…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar productos"
              className="w-full min-h-[50px] pl-12 pr-4 bg-cream text-ink text-base font-medium border-[3px] border-ink [box-shadow:4px_4px_0_var(--color-ink)] outline-none transition-shadow duration-200 placeholder:text-ink-faint/80 focus:[box-shadow:5px_5px_0_var(--color-fire)]"
            />
          </div>

          <div className="flex flex-col gap-4 mb-5 sm:mb-7">
            <div className="flex gap-3 flex-wrap items-center justify-between">
              <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Línea de producto">
                {[
                  { id: "todos", label: "Todos" },
                  ...STORE_CONFIG.lines.map(l => ({ id: l.id, label: l.labelPlural })),
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setLineFilter(id)}
                    aria-pressed={lineFilter === id}
                    className={chip(lineFilter === id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-ink-soft" aria-hidden="true" />
                <span className="sr-only">Ordenar productos</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="min-h-[40px] pl-3 pr-2 bg-cream text-ink font-condensed uppercase tracking-[0.06em] text-sm border-[3px] border-ink [box-shadow:3px_3px_0_var(--color-ink)] outline-none cursor-pointer focus:[box-shadow:3px_3px_0_var(--color-fire)]"
                >
                  <option value="default">Orden</option>
                  <option value="disponibles">Disponibles primero</option>
                  <option value="name">A - Z</option>
                </select>
              </label>
            </div>

            {allFormats.length > 0 && (
              <div className="flex gap-2 items-center flex-wrap" role="group" aria-label="Formato">
                <span className="font-condensed text-xs text-ink-soft uppercase tracking-[0.14em] shrink-0 mr-1">
                  Formato
                </span>
                <button
                  onClick={() => setFormatFilter(null)}
                  aria-pressed={!formatFilter}
                  className={chip(!formatFilter, true)}
                >
                  Todos
                </button>
                {allFormats.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormatFilter(f)}
                    aria-pressed={formatFilter === f}
                    className={chip(formatFilter === f, true)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="font-condensed uppercase tracking-[0.14em] text-sm text-ink-soft mb-5 m-0" aria-live="polite">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            {formatFilter ? ` en ${formatFilter}` : ""}
            {search ? ` · "${search}"` : ""}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.3 }}
                  className="nb-soft bg-cream max-w-md mx-auto text-center px-6 py-10"
                >
                  <svg viewBox="0 0 40 40" className="chitopo-sticker mx-auto size-16 text-fire" aria-hidden="true">
                    <use href="#chitopo-a" />
                  </svg>
                  <p className="font-condensed uppercase text-2xl text-ink mt-4 mb-0 leading-tight">
                    {search ? `Nada por acá con "${search}"` : "No hay productos con esos filtros"}
                  </p>
                  <p className="text-sm text-ink-soft mt-2 mb-0">
                    {search ? "Prueba con otra palabra o limpia los filtros." : "Cambia los filtros para ver más."}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center min-h-[44px] px-5 bg-fire text-cream font-condensed uppercase tracking-[0.06em] nb nb-press cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={prefersReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={i}
                      onAdd={addToCart}
                      onDetail={setDetailProduct}
                      stockThreshold={STORE_CONFIG.defaultStockThreshold}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <CartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={removeItem}
        onSent={() => setCart([])}
        onClear={clearCart}
      />

      <AnimatePresence>
        {detailProduct && (
          <ProductModal
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onAdd={addToCart}
            stockThreshold={STORE_CONFIG.defaultStockThreshold}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 24, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 18, stiffness: 320 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-fit max-w-[90vw] z-[999] bg-ink text-gold px-5 py-3 border-[3px] border-ink [box-shadow:4px_4px_0_var(--color-fire)] font-condensed uppercase tracking-[0.04em] text-sm sm:text-base text-center"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
