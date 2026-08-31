import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingCart, Search, ArrowUpDown, Package } from "lucide-react";

const Footer = lazy(() => import("../components/Footer"));
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import CartDrawer from "../components/CartDrawer";
import Logo from "../components/brand/Logo";
import { useApp } from "../context/AppContext";
import { STORE_CONFIG, totalUnits } from "../data/store";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="h-60 bg-surface-2 animate-pulse" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-surface-2 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-surface-2 rounded animate-pulse w-2/3" />
        <div className="h-6 bg-surface-2 rounded animate-pulse w-1/4" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-16 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-11 bg-surface-2 rounded-xl animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function Catalogo() {
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

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

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
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const chip = (active) =>
    `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
      active
        ? "bg-accent text-bg"
        : "bg-surface text-muted border border-border hover:border-muted hover:text-text"
    }`;

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border-soft bg-bg/85 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo height={34} />
            <span className="hidden sm:block text-[10px] font-bold text-muted tracking-[0.15em] uppercase border-l border-border pl-3">
              {STORE_CONFIG.subtitle}
            </span>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-bold hover:border-accent/50 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            aria-label={`Ver pedido, ${units} bolsas`}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            {units > 0 && (
              <span className="bg-accent text-bg text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {units}
              </span>
            )}
            <span className="hidden sm:inline">Mi pedido</span>
          </button>
        </div>
      </header>

      <section className="border-b border-border-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-accent leading-tight">
            {STORE_CONFIG.tagline}
          </h1>
          <p className="text-muted text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Snacks horneados hechos en Chile, al por mayor. Arma tu pedido acá y lo cerramos
            por WhatsApp: precio, pago y despacho, al tiro.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input
            type="text"
            placeholder="Busca un sabor o producto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar productos"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-text text-sm outline-none transition-all duration-200 placeholder:text-faint focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2.5 flex-wrap items-center justify-between">
            <div className="flex gap-2.5 flex-wrap">
              {[
                { id: "todos", label: "Todos" },
                ...STORE_CONFIG.lines.map(l => ({ id: l.id, label: `${l.emoji} ${l.labelPlural}` })),
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setLineFilter(id)} className={chip(lineFilter === id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-faint" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Ordenar productos"
                className="px-3 py-2 rounded-xl border border-border bg-surface text-muted text-xs font-bold outline-none cursor-pointer focus:border-accent transition-colors"
              >
                <option value="default">Orden</option>
                <option value="disponibles">Disponibles primero</option>
                <option value="name">A - Z</option>
              </select>
            </div>
          </div>

          {allFormats.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap pb-2 border-b border-border-soft">
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] shrink-0">
                Formato:
              </span>
              <button
                onClick={() => setFormatFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  !formatFilter
                    ? "bg-accent text-bg"
                    : "bg-surface text-muted border border-border hover:border-muted"
                }`}
              >
                Todos
              </button>
              {allFormats.map(f => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    formatFilter === f
                      ? "bg-accent text-bg"
                      : "bg-surface text-muted border border-border hover:border-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-faint mb-6">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          {formatFilter ? ` en ${formatFilter}` : ""}
          {search ? ` · "${search}"` : ""}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                className="text-center py-20 text-faint"
              >
                <Package size={48} className="mx-auto mb-4 opacity-40" aria-hidden="true" />
                <p className="text-base font-bold text-muted">
                  {search ? `Nada por acá con "${search}"` : "No hay productos con esos filtros"}
                </p>
                <p className="text-xs text-faint mt-1">
                  {search ? "Prueba con otra palabra o limpia los filtros" : "Cambia los filtros para ver más"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
              >
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={addToCart}
                    onDetail={setDetailProduct}
                    stockThreshold={STORE_CONFIG.defaultStockThreshold}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-bg px-5 py-3 rounded-xl text-sm font-bold shadow-lg z-[999] text-center max-w-[90vw]"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
