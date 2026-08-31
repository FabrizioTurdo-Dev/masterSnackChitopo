import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Plus, Minus, Bell, WheatOff, Flame } from "lucide-react";
import SelloAdvertencia from "./brand/SelloAdvertencia";
import NutritionTable from "./brand/NutritionTable";
import { formatPrice, hasPrice, flavorAccent, formatsOf, SELLER_PHONE } from "../data/store";

function Dato({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-1">{label}</h4>
      <p className="text-xs text-text/90 leading-relaxed">{children}</p>
    </div>
  );
}

export default function ProductModal({ product, onClose, onAdd, stockThreshold }) {
  const prefersReduced = useReducedMotion();
  const available = formatsOf(product || {});
  const [selectedId, setSelectedId] = useState(available[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const accent = flavorAccent(product.flavor);
  const soon = product.status === "proximamente";
  const selected = available.find(f => f.id === selectedId) || null;
  const maxQty = selected ? selected.stock : 1;

  function notifyMe() {
    const msg = `¡Hola! Quiero que me avisen cuando llegue el ${product.name} de Chitopo.`;
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.2 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${product.name}`}
    >
      <motion.div
        initial={prefersReduced ? false : { scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.2 }}
        className="bg-surface rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ overscrollBehavior: "contain", borderTopColor: accent, borderTopWidth: 3 }}
      >
        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-base font-bold text-text truncate pr-4">{product.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted hover:bg-surface-3 hover:text-text transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Cerrar ficha"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div
            className="relative h-72 rounded-xl overflow-hidden flex items-center justify-center p-4"
            style={{ background: `radial-gradient(circle at 50% 40%, ${accent}2e, transparent 70%)` }}
          >
            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={`Empaque de ${product.name}`}
                onError={() => setImgError(true)}
                className="max-h-full w-auto object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="text-7xl" aria-hidden="true">{product.emoji}</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] uppercase tracking-[0.15em] font-bold"
                style={{ color: accent }}
              >
                {product.grams} g
              </span>
              {soon && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-surface-3 text-accent border border-accent/30">
                  Próximamente
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl font-bold text-text mt-1 text-pretty">
              {product.name}
            </h3>
            {hasPrice(selected?.price) ? (
              <div className="text-2xl font-bold text-accent mt-2 tabular-nums">
                {formatPrice(selected.price)}
              </div>
            ) : (
              <div className="text-sm font-bold text-muted mt-2">
                Precio a consultar por WhatsApp
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {product.claims?.baked && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-surface-2 text-muted border border-border">
                <Flame size={12} aria-hidden="true" /> Horneado, no frito
              </span>
            )}
            {product.claims?.glutenFree && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-surface-2 text-muted border border-border">
                <WheatOff size={12} aria-hidden="true" /> Libre de gluten
              </span>
            )}
            {product.claims?.seals?.map(s => (
              <SelloAdvertencia key={s} seal={s} size={46} />
            ))}
          </div>

          {soon ? (
            <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-4 flex flex-col gap-3">
              <p className="text-xs text-muted leading-relaxed">
                Este sabor está en camino. Si quieres reservar cajas para el lanzamiento,
                escríbenos y te avisamos apenas salga.
              </p>
              <button
                onClick={notifyMe}
                className="w-full py-3 rounded-xl text-sm font-bold border border-accent/40 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Bell size={16} aria-hidden="true" />
                Avísame cuando llegue
              </button>
            </div>
          ) : available.length === 0 ? (
            <div
              className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/30 text-center"
              role="alert"
            >
              Sin stock por ahora
            </div>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase tracking-[0.05em] block mb-2">
                  Elige el formato
                </label>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Formatos disponibles">
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
                        className={`px-3.5 py-2.5 text-sm font-bold rounded-xl border transition-all duration-150 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                          isSel
                            ? "bg-accent text-bg border-accent"
                            : "bg-transparent text-text border-border hover:border-muted"
                        }`}
                      >
                        <span>{f.label} ×{f.units}</span>
                        <div className={`text-[9px] font-bold mt-0.5 ${isSel ? "text-bg/60" : "text-faint"}`}>
                          {isLow ? `quedan ${f.stock}` : `${f.stock} disponibles`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected && (
                <div className="bg-bg rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted font-medium">
                        {selected.label} de {selected.units} bolsas
                      </span>
                      <div className="text-[10px] text-faint tabular-nums">
                        Stock: {selected.stock} {selected.stock === 1 ? "bulto" : "bultos"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span
                        className="text-lg font-bold text-text min-w-[24px] text-center tabular-nums"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(q => Math.min(q + 1, maxQty))}
                        disabled={qty >= maxQty}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-soft">
                    <span className="text-sm text-muted">
                      {selected.units * qty} bolsas en total
                    </span>
                    <span className="text-lg font-bold text-accent tabular-nums">
                      {hasPrice(selected.price) ? formatPrice(selected.price * qty) : "A consultar"}
                    </span>
                  </div>
                </div>
              )}

              <button
                disabled={!selected}
                onClick={() => { onAdd(product, selected, qty); onClose(); }}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  selected
                    ? "bg-accent text-bg hover:bg-accent-light active:scale-[0.97]"
                    : "bg-surface-2 text-faint cursor-not-allowed"
                }`}
                aria-label={selected ? `Agregar ${qty} ${selected.label}` : "Elige un formato primero"}
              >
                <Plus size={16} aria-hidden="true" />
                Agregar al pedido{qty > 1 ? ` (×${qty})` : ""}
              </button>
            </>
          )}

          <div className="flex flex-col gap-4 border-t border-border-soft pt-4">
            <NutritionTable nutrition={product.nutrition} />
            <Dato label="Ingredientes">{product.ingredients}</Dato>
            <Dato label="Alérgenos">{product.allergens}</Dato>
            {product.barcode && (
              <Dato label="Código de barras">
                <span className="tabular-nums">{product.barcode}</span>
              </Dato>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
