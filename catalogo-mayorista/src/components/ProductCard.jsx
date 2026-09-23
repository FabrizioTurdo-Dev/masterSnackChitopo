import { useRef, useState, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Minus, Bell } from "lucide-react";
import SelloAdvertencia from "./brand/SelloAdvertencia";
import BrandMark from "./brand/BrandMark";
import { useBurst } from "../lib/burst";
import { useBurstOnHover } from "../lib/useBurstOnHover";
import { formatPrice, hasPrice, flavorAccent, formatsOf, SELLER_PHONE } from "../data/store";
import { brandOf } from "../data/brands";

// Stepper cuadrado de cantidad; lo comparten la tarjeta y la ficha.
export function QtyStepper({ qty, max, onChange, size = "md" }) {
  const box = size === "lg" ? "size-11" : "size-10";
  const btn = `${box} grid place-items-center text-night hover:bg-snow-2 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent`;
  return (
    <div className="inline-flex items-stretch border-2 border-night bg-snow">
      <button
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        className={btn}
        aria-label="Disminuir cantidad"
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span
        className={`min-w-10 px-1 grid place-items-center border-x-2 border-night font-condensed text-night tabular-nums ${size === "lg" ? "text-xl" : "text-lg"}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>
      <button
        onClick={() => onChange(Math.min(qty + 1, max))}
        disabled={qty >= max}
        className={btn}
        aria-label="Aumentar cantidad"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// Arte plano del envase armado como bolsa (.bag-flat, el mismo del hero
// de la landing) con la sombra dura siguiendo los dientes del sellado.
export function Bag({ src, alt, onError, className = "", imgClassName = "h-48 sm:h-52" }) {
  return (
    <div className={`relative [filter:drop-shadow(6px_8px_0_var(--color-night))] ${className}`}>
      <div className="bag-flat">
        <img
          src={src}
          alt={alt}
          onError={onError}
          loading="lazy"
          draggable={false}
          className={`block w-auto max-w-none select-none ${imgClassName}`}
        />
      </div>
    </div>
  );
}

const ProductCard = memo(function ProductCard({ product, index = 0, onAdd, onDetail, stockThreshold }) {
  const prefersReduced = useReducedMotion();
  const accent = flavorAccent(product.flavor);
  const brand = brandOf(product.brand);
  const available = formatsOf(product);
  const soon = product.status === "proximamente";

  const [selectedId, setSelectedId] = useState(available[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const fire = useBurst();
  const addBtn = useRef(null);
  const { ref: bagRef, handlers } = useBurstOnHover(accent);

  if (!product.active) return null;

  const selected = available.find(f => f.id === selectedId) || null;
  const maxQty = selected ? selected.stock : 1;
  const seal = product.claims?.seals?.[0];

  function notifyMe() {
    const msg = `¡Hola! Quiero que me avisen cuando llegue el ${product.name} de ${brand.name}.`;
    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function add() {
    const r = addBtn.current?.getBoundingClientRect();
    if (r) fire(r.left + r.width / 2, r.top + 6, accent);
    onAdd(product, selected, qty);
  }

  const openDetail = () => onDetail(product);
  const onKey = e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail();
    }
  };

  return (
    <motion.article
      layout={!prefersReduced}
      initial={prefersReduced ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReduced ? 0 : 0.45,
        delay: prefersReduced ? 0 : Math.min(index, 8) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative nb-soft bg-snow flex flex-col overflow-hidden"
    >
      <div
        ref={bagRef}
        {...handlers}
        className="relative h-64 bg-snow-2 border-b-[3px] border-night flex items-center justify-center p-5 cursor-pointer overflow-hidden"
        onClick={openDetail}
        role="button"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={`Ver ficha de ${product.name}`}
      >
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{ background: `radial-gradient(circle at 50% 45%, ${accent}, transparent 68%)` }}
          aria-hidden="true"
        />

        {product.image && !imgError ? (
          <Bag
            src={product.image}
            alt={`Bolsa de ${product.name} ${brand.name} de ${product.grams} gramos`}
            onError={() => setImgError(true)}
            className={`transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 ${soon ? "opacity-75" : ""}`}
          />
        ) : (
          <div className="relative text-6xl" aria-hidden="true">{product.emoji}</div>
        )}

        {seal && (
          <div className="absolute bottom-3 right-3">
            <SelloAdvertencia seal={seal} size={42} />
          </div>
        )}

        {product.tag && (
          <span
            className="absolute top-3 left-3 font-condensed uppercase tracking-[0.08em] text-xs px-2.5 py-1 text-snow border-2 border-night"
            style={{ backgroundColor: accent }}
          >
            {product.tag}
          </span>
        )}

        {soon && (
          <span className="absolute top-3 right-3 font-condensed uppercase tracking-[0.08em] text-xs px-2.5 py-1 bg-night text-gold border-2 border-night">
            Se viene
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="cursor-pointer" onClick={openDetail}>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night-faint m-0">
            <BrandMark brand={product.brand} height={18} />
            <span className="font-semibold text-night">{product.grams} g</span>
            {product.claims?.baked && <span>Horneado, no frito</span>}
            {product.claims?.glutenFree && <span>Libre de gluten</span>}
          </p>
          <h3 className="font-title uppercase text-2xl leading-[1.05] text-night mt-1.5 mb-0 text-pretty">
            {product.name}
          </h3>
          {hasPrice(selected?.price) ? (
            <p className="font-condensed text-2xl text-electric tabular-nums mt-2 mb-0">
              {formatPrice(selected.price)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-night-soft mt-1.5 mb-0">Precio a consultar</p>
          )}
        </div>

        {soon ? (
          <>
            <p className="text-sm text-night-soft leading-relaxed m-0">
              Todavía no sale a la venta. Te avisamos apenas esté disponible.
            </p>
            <button
              onClick={notifyMe}
              className="mt-auto w-full min-h-[50px] inline-flex items-center justify-center gap-2 bg-snow text-night font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-snow-2 cursor-pointer"
            >
              <Bell size={18} aria-hidden="true" />
              Avísame cuando llegue
            </button>
          </>
        ) : available.length === 0 ? (
          <p className="mt-auto font-condensed uppercase tracking-[0.06em] text-electric m-0" role="alert">
            Sin stock por ahora
          </p>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Formato de venta">
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
                    className={`relative min-h-[40px] px-3 text-sm font-bold border-2 border-night transition-colors cursor-pointer ${
                      isSel ? "bg-night text-gold" : "bg-snow text-night hover:bg-snow-2"
                    }`}
                  >
                    {f.label}
                    <span className={isSel ? "text-gold/75" : "text-night-faint"}> ×{f.units}</span>
                    {isLow && (
                      <span
                        className="absolute -top-1.5 -right-1.5 size-3 bg-electric border-2 border-night rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="flex items-center gap-3">
                <span className="font-condensed text-xs uppercase tracking-[0.14em] text-night-soft">
                  Cantidad
                </span>
                <QtyStepper qty={qty} max={maxQty} onChange={setQty} />
                <span className="ml-auto text-xs text-night-faint tabular-nums">
                  {selected.units * qty} {selected.units * qty === 1 ? "bolsa" : "bolsas"}
                </span>
              </div>
            )}

            <button
              ref={addBtn}
              disabled={!selected}
              onClick={add}
              className="mt-auto w-full min-h-[50px] inline-flex items-center justify-center gap-2 bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-royal cursor-pointer disabled:bg-snow-2 disabled:text-night-faint disabled:cursor-not-allowed"
              aria-label={
                selected
                  ? `Agregar ${qty} ${selected.label} de ${product.name}`
                  : "Elige un formato primero"
              }
            >
              <Plus size={20} aria-hidden="true" />
              Agregar{qty > 1 ? ` (×${qty})` : ""}
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
});

export default ProductCard;
