import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Plus, Minus, Check, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useBurst } from "../lib/burst";
import { orderRef } from "../lib/sendOrder";
import { newOrderMessage } from "../lib/orderMessage";
import {
  formatPrice,
  hasPrice,
  totalUnits,
  itemUnits,
  flavorAccent,
  SELLER_PHONE,
  STORE_CONFIG,
} from "../data/store";

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// Rojo oscuro para mensajes de error: legible en letra chica sobre las
// superficies claras.
const ERROR_TEXT = "text-xs font-semibold text-[#a32004] mt-1 block";

// Barra hacia el pedido mínimo: se llena en rojo y pasa a verde al llegar.
function MinOrderMeter({ units }) {
  const min = STORE_CONFIG.minOrderUnits;
  const done = units >= min;
  const pct = Math.min(100, Math.round((units / min) * 100));
  return (
    <div role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="font-condensed uppercase tracking-[0.06em] text-base text-night">
          {done ? `¡Listo! ${units} bolsas` : `Llevas ${units} de ${min} bolsas`}
        </span>
        <span className="text-xs font-semibold text-night-soft tabular-nums">
          {done ? "Pedido mínimo cumplido" : `Te faltan ${min - units}`}
        </span>
      </div>
      <div className="h-4 bg-snow border-2 border-night overflow-hidden">
        <div
          className={`h-full transition-[width,background-color] duration-500 ease-out ${
            done ? "bg-green" : "bg-electric"
          } ${pct > 0 && pct < 100 ? "border-r-2 border-night" : ""}`}
          style={{
            width: `${pct}%`,
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.2) 0 6px, transparent 6px 12px)",
          }}
        />
      </div>
    </div>
  );
}

export default function CartDrawer({ cart, open, onClose, onChangeQty, onRemove, onSent, onClear }) {
  const { addOrder } = useApp();
  const prefersReduced = useReducedMotion();
  const fire = useBurst();
  const sendBtn = useRef(null);
  const [shop, setShop] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(null); // código del pedido enviado
  const [errors, setErrors] = useState({});

  const units = totalUnits(cart);
  const belowMin = units < STORE_CONFIG.minOrderUnits;

  // Solo hay total real si todos los ítems tienen precio cargado.
  const priced = cart.length > 0 && cart.every(c => hasPrice(c.price));
  const total = priced ? cart.reduce((s, c) => s + c.price * c.qty, 0) : null;

  function validate() {
    const errs = {};
    if (!shop.trim()) errs.shop = "Pon el nombre de tu local";
    if (!name.trim()) errs.name = "Pon tu nombre";
    if (phone.trim() && !/^\d{7,15}$/.test(phone.replace(/[\s\-+]/g, ""))) {
      errs.phone = "Formato inválido (ej: 56912345678)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function sendToWhatsApp() {
    if (!validate()) return;

    const ref = orderRef();
    const msg = newOrderMessage({
      ref,
      shop: shop.trim(),
      contact: name.trim(),
      phone: phone.trim(),
      items: cart,
      units,
      total,
      money: priced ? formatPrice : null,
    });

    // Se registra antes de abrir WhatsApp: en el celular la pestaña puede
    // quedar congelada apenas salta a la app.
    addOrder({
      ref,
      client: shop.trim(),
      contact: name.trim(),
      phone: phone.trim(),
      items: cart.map(c => ({
        brand: c.brand,
        name: c.name,
        format: c.formatLabel,
        units: c.units,
        qty: c.qty,
      })),
      units,
      total,
    });

    const r = sendBtn.current?.getBoundingClientRect();
    if (r) fire(r.left + r.width / 2, r.top + 6);

    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(ref);
  }

  function handleClose() {
    if (cart.length > 0 && !window.confirm("Tienes productos en el pedido. ¿Lo cierras igual?")) return;
    onClose();
  }

  function resetCart() {
    setSent(null);
    setShop("");
    setName("");
    setPhone("");
    setErrors({});
    onSent();
    onClose();
  }

  function handleClear() {
    if (window.confirm("¿Vaciar todo el pedido?")) onClear();
  }

  // text-base y no text-sm: con menos de 16px Safari de iPhone hace zoom
  // al enfocar el campo.
  const inputBase =
    "w-full min-h-[46px] px-3.5 bg-snow text-night text-base font-medium border-2 outline-none transition-shadow duration-150 placeholder:text-night-faint/70 focus:[box-shadow:3px_3px_0_var(--color-night)]";
  const labelBase = "font-condensed uppercase tracking-[0.1em] text-xs text-night-soft mb-1.5 block";
  const stepBtn =
    "size-9 grid place-items-center text-night hover:bg-snow-2 transition-colors cursor-pointer";

  return (
    <AnimatePresence>
      {(open || sent) && (
        <>
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="fixed inset-0 bg-night/60 backdrop-blur-[2px] z-[200]"
            onClick={sent ? resetCart : handleClose}
            aria-hidden="true"
          />
          <motion.div
            initial={prefersReduced ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReduced ? { x: 0 } : { x: "100%" }}
            transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 26, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-snow z-[201] sm:border-l-[3px] border-night flex flex-col font-sans"
            style={{ overscrollBehavior: "contain" }}
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
          >
            {sent ? (
              <div
                className="flex flex-col items-center justify-center flex-1 px-8 text-center dots-snow"
                role="status"
                aria-live="polite"
              >
                <motion.div
                  initial={prefersReduced ? false : { scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 12, stiffness: 220, delay: 0.1 }}
                  className="size-20 grid place-items-center bg-green text-[#06300f] border-[3px] border-night rounded-full [box-shadow:5px_5px_0_var(--color-night)] mb-7"
                >
                  <Check size={40} strokeWidth={3} aria-hidden="true" />
                </motion.div>
                <h2 className="hero-title font-title uppercase text-6xl leading-[0.95] m-0">¡Listo!</h2>
                <p className="font-condensed uppercase tracking-[0.06em] text-xl text-night mt-3 mb-0">
                  Pedido enviado
                </p>
                <p className="text-sm text-night-soft mt-3 mb-5 max-w-xs leading-relaxed">
                  Se abrió WhatsApp con tu pedido. Solo falta que aprietes enviar ahí y te
                  confirmamos precios y despacho al tiro.
                </p>
                <p className="inline-flex items-baseline gap-2 px-3 py-1.5 mb-8 bg-snow border-2 border-night">
                  <span className="font-condensed uppercase tracking-[0.1em] text-xs text-night-soft">
                    Código de pedido
                  </span>
                  <span className="font-condensed text-lg text-night tracking-[0.06em]">{sent}</span>
                </p>
                <button
                  onClick={resetCart}
                  className="inline-flex items-center justify-center min-h-[50px] px-8 bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-royal cursor-pointer"
                >
                  Volver al catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-gold border-b-[3px] border-night">
                  <h2 className="font-title uppercase text-2xl text-night m-0 leading-none">
                    Tu pedido{" "}
                    <span className="font-sans normal-case font-semibold text-sm text-night-soft tabular-nums">
                      ({units} {units === 1 ? "bolsa" : "bolsas"})
                    </span>
                  </h2>
                  <button
                    onClick={handleClose}
                    className="size-10 shrink-0 grid place-items-center bg-snow text-night border-2 border-night hover:bg-snow-2 transition-colors cursor-pointer"
                    aria-label="Cerrar pedido"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto px-4 sm:px-6 py-3" aria-live="polite">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                      <svg viewBox="0 0 40 40" className="chitopo-sticker size-16 text-electric" aria-hidden="true">
                        <use href="#chitopo-b" />
                      </svg>
                      <p className="font-condensed uppercase text-2xl text-night mt-4 mb-0">
                        Todavía no hay nada
                      </p>
                      <p className="text-sm text-night-soft mt-2 mb-6 max-w-[240px] leading-relaxed">
                        Elige cajas o displays del catálogo y arma tu pedido. Los precios los
                        cerramos por WhatsApp.
                      </p>
                      <button
                        onClick={onClose}
                        className="inline-flex items-center min-h-[46px] px-6 bg-electric text-snow font-condensed uppercase tracking-[0.06em] nb nb-press hover:bg-royal cursor-pointer"
                      >
                        Ver productos
                      </button>
                    </div>
                  ) : (
                    <ul className="list-none p-0 m-0">
                      {cart.map((item, i) => (
                        <motion.li
                          key={`${item.id}-${item.formatId}`}
                          initial={prefersReduced ? false : { opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: prefersReduced ? 0 : 0.3,
                            delay: prefersReduced ? 0 : i * 0.04,
                          }}
                          className="flex items-center gap-3 py-3 border-b-2 border-night/15 last:border-0"
                        >
                          <div
                            className="size-14 shrink-0 bg-snow-2 border-2 border-night overflow-hidden grid place-items-center"
                            style={{ boxShadow: `inset 0 -5px 0 ${flavorAccent(item.flavor)}` }}
                          >
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-condensed uppercase text-base leading-tight text-night truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-night-faint tabular-nums">
                              {item.formatLabel} ×{item.units} · {itemUnits(item)} bolsas
                            </div>
                            {hasPrice(item.price) && (
                              <div className="font-condensed text-electric tabular-nums">
                                {formatPrice(item.price * item.qty)}
                              </div>
                            )}
                          </div>
                          <div className="inline-flex items-stretch border-2 border-night bg-snow">
                            <button
                              onClick={() => onChangeQty(item, -1)}
                              className={stepBtn}
                              aria-label={`Quitar un ${item.formatLabel} de ${item.name}`}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="min-w-8 px-1 grid place-items-center border-x-2 border-night font-condensed text-night tabular-nums">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => onChangeQty(item, 1)}
                              className={stepBtn}
                              aria-label={`Sumar un ${item.formatLabel} de ${item.name}`}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemove(item)}
                            className="size-9 shrink-0 grid place-items-center text-night-faint hover:text-electric hover:bg-snow-2 transition-colors cursor-pointer"
                            aria-label={`Eliminar ${item.name} ${item.formatLabel}`}
                          >
                            <X size={16} aria-hidden="true" />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="px-4 sm:px-6 py-5 border-t-[3px] border-night bg-snow-2 flex flex-col gap-4 max-h-[62vh] overflow-y-auto">
                    <MinOrderMeter units={units} />

                    <div className="flex justify-between items-center gap-3 px-4 py-3 bg-snow border-2 border-night">
                      <div>
                        <span className="font-condensed uppercase tracking-[0.06em] text-night">
                          {priced ? "Total estimado" : "Total del pedido"}
                        </span>
                        <div className="text-xs text-night-faint tabular-nums">
                          {cart.length} {cart.length === 1 ? "producto" : "productos"} · {units} bolsas
                        </div>
                      </div>
                      {priced ? (
                        <span className="font-condensed text-3xl text-electric tabular-nums">
                          {formatPrice(total)}
                        </span>
                      ) : (
                        <span className="font-condensed uppercase tracking-[0.04em] text-electric text-right leading-tight">
                          Precios a confirmar
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label htmlFor="cart-shop" className={labelBase}>
                          Nombre del local <span className="text-[#a32004]">*</span>
                        </label>
                        <input
                          id="cart-shop"
                          name="organization"
                          type="text"
                          autoComplete="organization"
                          placeholder="Ej: Distribuidora El Sol"
                          value={shop}
                          spellCheck={false}
                          onChange={e => { setShop(e.target.value); setErrors(p => ({ ...p, shop: null })); }}
                          className={`${inputBase} ${errors.shop ? "border-[#a32004]" : "border-night"}`}
                          aria-invalid={!!errors.shop}
                          aria-describedby={errors.shop ? "cart-shop-error" : undefined}
                        />
                        {errors.shop && (
                          <span id="cart-shop-error" className={ERROR_TEXT} role="alert">
                            {errors.shop}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cart-name" className={labelBase}>
                          Tu nombre <span className="text-[#a32004]">*</span>
                        </label>
                        <input
                          id="cart-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Ej: Camila Rojas"
                          value={name}
                          spellCheck={false}
                          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: null })); }}
                          className={`${inputBase} ${errors.name ? "border-[#a32004]" : "border-night"}`}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "cart-name-error" : undefined}
                        />
                        {errors.name && (
                          <span id="cart-name-error" className={ERROR_TEXT} role="alert">
                            {errors.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cart-phone" className={labelBase}>
                          Tu WhatsApp (opcional)
                        </label>
                        <input
                          id="cart-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="numeric"
                          placeholder="+56 9 1234 5678"
                          value={phone}
                          spellCheck={false}
                          onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: null })); }}
                          className={`${inputBase} ${errors.phone ? "border-[#a32004]" : "border-night"}`}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "cart-phone-error" : undefined}
                        />
                        {errors.phone && (
                          <span id="cart-phone-error" className={ERROR_TEXT} role="alert">
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleClear}
                        className="size-[52px] shrink-0 grid place-items-center bg-snow text-electric border-[3px] border-night [box-shadow:3px_3px_0_var(--color-night)] nb-press hover:bg-[#ffe1d6] cursor-pointer"
                        aria-label="Vaciar pedido"
                      >
                        <Trash2 size={20} aria-hidden="true" />
                      </button>
                      <button
                        ref={sendBtn}
                        onClick={sendToWhatsApp}
                        disabled={belowMin}
                        className={`flex-1 min-h-[52px] inline-flex items-center justify-center gap-2.5 font-condensed uppercase tracking-[0.06em] text-lg border-[3px] border-night ${
                          belowMin
                            ? "bg-snow text-night-faint border-dashed cursor-not-allowed"
                            : "bg-green text-[#06300f] [box-shadow:5px_5px_0_var(--color-night)] nb-press hover:brightness-105 cursor-pointer"
                        }`}
                      >
                        <WhatsAppIcon size={20} />
                        Enviar por WhatsApp
                      </button>
                    </div>
                    <p className="text-center text-xs text-night-soft leading-relaxed m-0">
                      Se abre WhatsApp con el resumen. Ahí coordinamos precio, pago y despacho.
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
