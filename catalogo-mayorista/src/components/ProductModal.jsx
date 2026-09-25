import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Plus, Bell, WheatOff, Flame, Maximize2 } from "lucide-react";
import SelloAdvertencia from "./brand/SelloAdvertencia";
import NutritionTable from "./brand/NutritionTable";
import ImageLightbox from "./ImageLightbox";
import { Bag, QtyStepper } from "./ProductCard";
import { useBurst } from "../lib/burst";
import BrandMark from "./brand/BrandMark";
import { formatPrice, hasPrice, flavorAccent, formatsOf, SELLER_PHONE } from "../data/store";
import { brandOf } from "../data/brands";

function Dato({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <h4 className="font-condensed uppercase tracking-[0.1em] text-sm text-night m-0 mb-1">{label}</h4>
      <p className="text-sm text-night-soft leading-relaxed m-0">{children}</p>
    </div>
  );
}

const CLAIM = "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-snow-2 text-night border-2 border-night";

export default function ProductModal({ product, onClose, onAdd, stockThreshold }) {
  const prefersReduced = useReducedMotion();
  const available = formatsOf(product || {});
  const [selectedId, setSelectedId] = useState(available[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [viewIdx, setViewIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const zoomTrigger = useRef(null);
  const closeBtn = useRef(null);
  const addBtn = useRef(null);
  const fire = useBurst();

  // Escape cierra la ficha (el visor de imagen ataja su propio Escape).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = e => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!product) return null;

  // Frente (`image`) + las imágenes extra de `gallery`, en ese orden.
  const views = [
    product.image && { src: product.image, label: "Frente", alt: `Empaque de ${product.name}` },
    ...(product.gallery || []).map(g => ({
      src: g.src,
      label: g.label,
      alt: `${g.label} del empaque de ${product.name}`,
    })),
  ].filter(Boolean);
  const current = views[viewIdx] || views[0] || null;

  const accent = flavorAccent(product.flavor);
  const soon = product.status === "proximamente";
  const selected = available.find(f => f.id === selectedId) || null;
  const maxQty = selected ? selected.stock : 1;

  function notifyMe() {
    const msg = `¡Hola! Quiero que me avisen cuando llegue ${product.name}, de ${brandOf(product.brand).name}.`;
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function add() {
    const r = addBtn.current?.getBoundingClientRect();
    if (r) fire(r.left + r.width / 2, r.top + 6, accent);
    onAdd(product, selected, qty);
    onClose();
  }

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.2 }}
      className="fixed inset-0 bg-night/70 backdrop-blur-[2px] flex items-center justify-center z-[300] p-3 sm:p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${product.name}`}
    >
      <motion.div
        initial={prefersReduced ? false : { scale: 0.94, y: 24, rotate: -1, opacity: 0 }}
        animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
        exit={prefersReduced ? { opacity: 1 } : { scale: 0.96, y: 12, opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 22, stiffness: 300 }}
        className="bg-snow nb w-full max-w-lg md:max-w-4xl max-h-[92vh] overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="sticky top-0 z-20 bg-snow flex items-center justify-between gap-4 pl-5 pr-3 py-3 border-b-[3px] border-night">
          <h2 className="font-title uppercase text-xl text-night truncate m-0">{product.name}</h2>
          <button
            ref={closeBtn}
            onClick={onClose}
            className="size-10 shrink-0 grid place-items-center bg-snow text-night border-2 border-night hover:bg-snow-2 transition-colors cursor-pointer"
            aria-label="Cerrar ficha"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="p-5 md:sticky md:top-[67px] md:self-start">
            <div className="relative h-72 md:h-[420px] bg-snow-2 border-[3px] border-night overflow-hidden flex items-center justify-center p-5">
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(circle at 50% 45%, ${accent}, transparent 68%)` }}
                aria-hidden="true"
              />
              {current && !(viewIdx === 0 && imgError) ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.src}
                    initial={prefersReduced ? false : { opacity: 0, scale: 0.94, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.94, rotate: 3 }}
                    transition={{ duration: prefersReduced ? 0 : 0.2 }}
                    className="relative"
                  >
                    <Bag
                      src={current.src}
                      alt={current.alt}
                      onError={() => viewIdx === 0 && setImgError(true)}
                      imgClassName={`h-56 md:h-80 ${soon ? "opacity-80" : ""}`}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="relative text-7xl" aria-hidden="true">{product.emoji}</div>
              )}

              {product.claims?.seals?.length > 0 && (
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  {product.claims.seals.map(s => (
                    <SelloAdvertencia key={s} seal={s} size={46} />
                  ))}
                </div>
              )}

              {views.length > 1 && current && (
                <button
                  ref={zoomTrigger}
                  onClick={() => setZoomed(true)}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 min-h-[40px] px-3 bg-snow text-night font-condensed uppercase tracking-[0.06em] text-xs border-2 border-night [box-shadow:3px_3px_0_var(--color-night)] nb-press cursor-pointer"
                >
                  <Maximize2 size={14} aria-hidden="true" />
                  Ver en grande
                </button>
              )}
            </div>

            {views.length > 1 && (
              <div className="flex gap-2 mt-3" role="group" aria-label="Imágenes del producto">
                {views.map((v, i) => {
                  const on = i === viewIdx;
                  return (
                    <button
                      key={v.src}
                      onClick={() => setViewIdx(i)}
                      aria-pressed={on}
                      className={`flex items-center gap-2 pr-3 border-2 border-night overflow-hidden font-condensed uppercase tracking-[0.06em] text-xs transition-colors cursor-pointer ${
                        on ? "bg-night text-gold" : "bg-snow text-night hover:bg-snow-2"
                      }`}
                    >
                      <img
                        src={v.src}
                        alt=""
                        aria-hidden="true"
                        className="size-11 object-cover bg-snow-2 border-r-2 border-night"
                      />
                      {v.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-5 pt-0 md:pt-5 md:border-l-[3px] md:border-night flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-3 flex-wrap text-xs text-night-faint">
                <BrandMark brand={product.brand} height={22} />
                <span className="font-semibold text-night">{product.grams} g</span>
                {soon && (
                  <span className="font-condensed uppercase tracking-[0.08em] text-xs px-2 py-0.5 bg-night text-gold">
                    Próximamente
                  </span>
                )}
              </div>
              <h3 className="font-title uppercase text-3xl sm:text-4xl leading-[1.02] text-night mt-1.5 mb-0 text-pretty">
                {product.name}
              </h3>
              {hasPrice(selected?.price) ? (
                <p className="font-condensed text-3xl text-electric mt-2 mb-0 tabular-nums">
                  {formatPrice(selected.price)}
                </p>
              ) : (
                <p className="text-sm font-semibold text-night-soft mt-2 mb-0">
                  Precio a consultar por WhatsApp
                </p>
              )}
            </div>

            {(product.claims?.baked || product.claims?.glutenFree) && (
              <div className="flex gap-2 flex-wrap items-center">
                {product.claims?.baked && (
                  <span className={CLAIM}>
                    <Flame size={13} aria-hidden="true" /> Horneado, no frito
                  </span>
                )}
                {product.claims?.glutenFree && (
                  <span className={CLAIM}>
                    <WheatOff size={13} aria-hidden="true" /> Libre de gluten
                  </span>
                )}
              </div>
            )}

            {soon ? (
              <div className="dots-snow border-[3px] border-night px-4 py-4 flex flex-col gap-3">
                <p className="text-sm text-night-soft leading-relaxed m-0">
                  Este sabor está en camino. Si quieres reservar cajas para el lanzamiento,
                  escríbenos y te avisamos apenas salga.
                </p>
                <button
                  onClick={notifyMe}
                  className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 bg-snow text-night font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-snow-2 cursor-pointer"
                >
                  <Bell size={18} aria-hidden="true" />
                  Avísame cuando llegue
                </button>
              </div>
            ) : available.length === 0 ? (
              <p
                className="px-4 py-3 bg-snow-2 text-electric font-condensed uppercase tracking-[0.06em] border-[3px] border-night text-center m-0"
                role="alert"
              >
                Sin stock por ahora
              </p>
            ) : (
              <>
                <div>
                  <p className="font-condensed uppercase tracking-[0.12em] text-sm text-night-soft m-0 mb-2">
                    Elige el formato
                  </p>
                  <div className="flex gap-2.5 flex-wrap" role="radiogroup" aria-label="Formatos disponibles">
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
                          className={`px-4 py-2 text-left border-[3px] border-night transition-colors cursor-pointer ${
                            isSel ? "bg-night text-gold" : "bg-snow text-night hover:bg-snow-2"
                          }`}
                        >
                          <span className="font-condensed uppercase tracking-[0.04em] text-lg leading-none">
                            {f.label} ×{f.units}
                          </span>
                          <span className={`block text-[11px] font-semibold mt-1 ${isSel ? "text-gold/75" : isLow ? "text-electric" : "text-night-faint"}`}>
                            {isLow ? `Quedan ${f.stock}` : `${f.stock} disponibles`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selected && (
                  <div className="bg-snow-2 border-2 border-night p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-sm text-night font-semibold">
                          {selected.label} de {selected.units} bolsas
                        </span>
                        <span className="block text-xs text-night-faint tabular-nums">
                          Stock: {selected.stock} {selected.stock === 1 ? "bulto" : "bultos"}
                        </span>
                      </div>
                      <QtyStepper qty={qty} max={maxQty} onChange={setQty} size="lg" />
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-night/20">
                      <span className="text-sm text-night-soft">{selected.units * qty} bolsas en total</span>
                      <span className="font-condensed text-xl text-electric tabular-nums">
                        {hasPrice(selected.price) ? formatPrice(selected.price * qty) : "A consultar"}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  ref={addBtn}
                  disabled={!selected}
                  onClick={add}
                  className="w-full min-h-[54px] inline-flex items-center justify-center gap-2 bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-xl nb nb-press hover:bg-royal cursor-pointer disabled:bg-snow-2 disabled:text-night-faint disabled:cursor-not-allowed"
                  aria-label={selected ? `Agregar ${qty} ${selected.label}` : "Elige un formato primero"}
                >
                  <Plus size={22} aria-hidden="true" />
                  Agregar al pedido{qty > 1 ? ` (×${qty})` : ""}
                </button>
              </>
            )}

            <div className="flex flex-col gap-4 border-t-[3px] border-night pt-5">
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
        </div>
      </motion.div>

      <AnimatePresence>
        {zoomed && current && (
          <ImageLightbox
            src={current.src}
            alt={current.alt}
            title={`${product.name} · ${current.label}`}
            onClose={() => {
              setZoomed(false);
              zoomTrigger.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
