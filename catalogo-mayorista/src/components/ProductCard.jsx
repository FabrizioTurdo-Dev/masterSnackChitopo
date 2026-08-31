import { useState, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Minus, Bell } from "lucide-react";
import SelloAdvertencia from "./brand/SelloAdvertencia";
import { formatPrice, hasPrice, flavorAccent, formatsOf, SELLER_PHONE } from "../data/store";

const ProductCard = memo(function ProductCard({ product, onAdd, onDetail, stockThreshold }) {
  const prefersReduced = useReducedMotion();
  const accent = flavorAccent(product.flavor);
  const available = formatsOf(product);
  const soon = product.status === "proximamente";

  const [selectedId, setSelectedId] = useState(available[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  if (!product.active) return null;

  const selected = available.find(f => f.id === selectedId) || null;
  const maxQty = selected ? selected.stock : 1;
  const seal = product.claims?.seals?.[0];

  function notifyMe() {
    const msg = `¡Hola! Quiero que me avisen cuando llegue el ${product.name} de Chitopo.`;
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <motion.div
      layout
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.4 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface overflow-hidden"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
    >
      {product.tag && (
        <span
          className="absolute top-4 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider text-text"
          style={{ backgroundColor: accent }}
        >
          {product.tag}
        </span>
      )}

      {soon && (
        <span className="absolute top-4 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-surface-3 text-accent border border-accent/30">
          Se viene
        </span>
      )}

      <div
        className="relative h-60 overflow-hidden cursor-pointer flex items-center justify-center p-4"
        style={{ background: `radial-gradient(circle at 50% 40%, ${accent}26, transparent 70%)` }}
        onClick={() => onDetail(product)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && onDetail(product)}
        aria-label={`Ver ficha de ${product.name}`}
      >
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={`Empaque de ${product.name}`}
            onError={() => setImgError(true)}
            loading="lazy"
            className={`max-h-full w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 ${soon ? "opacity-80" : ""}`}
          />
        ) : (
          <div className="text-6xl" aria-hidden="true">{product.emoji}</div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div
          className="cursor-pointer"
          onClick={() => onDetail(product)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onDetail(product)}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: accent }}>
              {product.grams} g
            </span>
            {product.claims?.baked && (
              <span className="text-[10px] text-faint">Horneado, no frito</span>
            )}
          </div>
          <h3 className="font-display text-[17px] font-bold text-text mt-0.5 leading-tight text-pretty">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          {hasPrice(selected?.price) ? (
            <div className="text-xl font-bold text-accent tabular-nums">{formatPrice(selected.price)}</div>
          ) : (
            <div className="text-sm font-bold text-muted">Precio a consultar</div>
          )}
          {seal && <SelloAdvertencia seal={seal} size={38} />}
        </div>

        {soon ? (
          <>
            <p className="text-xs text-faint leading-relaxed">
              Todavía no sale a la venta. Te avisamos apenas esté disponible.
            </p>
            <button
              onClick={notifyMe}
              className="mt-auto w-full py-3 rounded-xl text-sm font-bold border border-accent/40 text-accent hover:bg-accent/10 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Bell size={16} aria-hidden="true" />
              Avísame cuando llegue
            </button>
          </>
        ) : available.length === 0 ? (
          <span className="text-xs font-bold text-red-400 mt-auto" role="alert">
            Sin stock por ahora
          </span>
        ) : (
          <>
            <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Formato de venta">
              {available.map(f => {
                const isLow = f.stock <= stockThreshold;
                const isSel = selectedId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { setSelectedId(f.id); setQty(1); }}
                    role="radio"
                    aria-checked={isSel}
                    aria-label={`${f.label} de ${f.units} unidades, ${f.stock} disponibles`}
                    className={`relative px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                      isSel
                        ? "bg-accent text-bg border-accent"
                        : "bg-transparent text-text border-border hover:border-muted"
                    }`}
                  >
                    {f.label}
                    <span className={isSel ? "text-bg/70" : "text-faint"}> ×{f.units}</span>
                    {isLow && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
                        aria-label="Stock bajo"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted uppercase">Cant:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={12} aria-hidden="true" />
                  </button>
                  <span
                    className="text-sm font-bold text-text min-w-[20px] text-center tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(q + 1, maxQty))}
                    disabled={qty >= maxQty}
                    className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={12} aria-hidden="true" />
                  </button>
                </div>
                <span className="text-[10px] text-faint tabular-nums ml-auto">
                  {selected.units * qty} {selected.units * qty === 1 ? "bolsa" : "bolsas"}
                </span>
              </div>
            )}

            <button
              disabled={!selected}
              onClick={() => onAdd(product, selected, qty)}
              className={`mt-auto w-full py-3 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                selected
                  ? "bg-accent text-bg hover:bg-accent-light active:scale-[0.97]"
                  : "bg-surface-2 text-faint cursor-not-allowed"
              }`}
              aria-label={
                selected
                  ? `Agregar ${qty} ${selected.label} de ${product.name}`
                  : "Elige un formato primero"
              }
            >
              <Plus size={16} aria-hidden="true" />
              Agregar{qty > 1 ? ` (×${qty})` : ""}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
});

export default ProductCard;
