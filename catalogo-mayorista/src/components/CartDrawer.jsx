import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Check, Trash2, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  formatPrice,
  hasPrice,
  totalUnits,
  itemUnits,
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

export default function CartDrawer({ cart, open, onClose, onChangeQty, onRemove, onSent, onClear }) {
  const { addOrder } = useApp();
  const prefersReduced = useReducedMotion();
  const [shop, setShop] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
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

    let msg = "*Nuevo pedido mayorista — Chitopo*\n\n";
    msg += `*Local:* ${shop.trim()}\n`;
    msg += `*Contacto:* ${name.trim()}\n`;
    if (phone.trim()) msg += `*Teléfono:* ${phone.trim()}\n`;
    msg += "\n*Pedido:*\n";
    cart.forEach(item => {
      const line = `• ${item.name} ${item.grams}g — ${item.formatLabel} ×${item.units} · ${item.qty} ${item.qty === 1 ? "bulto" : "bultos"} (${itemUnits(item)} bolsas)`;
      msg += priced ? `${line} = ${formatPrice(item.price * item.qty)}\n` : `${line}\n`;
    });
    msg += "\n─────────────────\n";
    msg += `*Total: ${units} bolsas*`;
    msg += priced
      ? `\n*Monto: ${formatPrice(total)}*`
      : "\n\n_Precios a confirmar por este medio._";

    addOrder({
      client: shop.trim(),
      contact: name.trim(),
      phone: phone.trim(),
      items: cart.map(c => ({
        name: c.name,
        format: c.formatLabel,
        units: c.units,
        qty: c.qty,
      })),
      units,
      total,
    });

    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  }

  function handleClose() {
    if (cart.length > 0 && !window.confirm("Tienes productos en el pedido. ¿Lo cierras igual?")) return;
    onClose();
  }

  function resetCart() {
    setSent(false);
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

  const inputBase =
    "w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors duration-200 placeholder:text-faint bg-bg text-text focus:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2";

  return (
    <AnimatePresence>
      {(open || sent) && (
        <>
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={sent ? resetCart : handleClose}
            aria-hidden="true"
          />
          <motion.div
            initial={prefersReduced ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReduced ? { x: 0 } : { x: "100%" }}
            transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-surface z-[201] border-l border-border flex flex-col font-sans"
            style={{ overscrollBehavior: "contain" }}
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
          >
            {sent ? (
              <div
                className="flex flex-col items-center justify-center flex-1 px-8 text-center"
                role="status"
                aria-live="polite"
              >
                <div className="w-16 h-16 rounded-full bg-green/20 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-green" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-bold text-text mb-2">¡Listo, pedido enviado!</h2>
                <p className="text-sm text-muted mb-8 max-w-xs leading-relaxed">
                  Se abrió WhatsApp con tu pedido. Te confirmamos precios y despacho al tiro.
                </p>
                <button
                  onClick={resetCart}
                  className="px-8 py-3.5 rounded-xl bg-accent text-bg font-bold text-sm hover:bg-accent-light transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Volver al catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-surface-2">
                  <h2 className="font-display text-base font-bold text-text">
                    Tu pedido{" "}
                    <span className="font-sans font-normal text-xs text-muted">
                      ({units} {units === 1 ? "bolsa" : "bolsas"})
                    </span>
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-muted hover:text-text transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    aria-label="Cerrar pedido"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto px-4 sm:px-6 py-4" aria-live="polite">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-faint px-6">
                      <ShoppingCart size={52} className="mb-4 opacity-40" aria-hidden="true" />
                      <p className="text-base font-bold text-muted">Todavía no hay nada</p>
                      <p className="text-xs text-faint mt-2 text-center max-w-[220px] leading-relaxed">
                        Elige cajas o displays del catálogo y arma tu pedido. Los precios los
                        cerramos por WhatsApp.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {cart.map((item, i) => (
                        <motion.div
                          key={`${item.id}-${item.formatId}`}
                          initial={prefersReduced ? false : { opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: prefersReduced ? 0 : 0.3,
                            delay: prefersReduced ? 0 : i * 0.03,
                          }}
                          className="flex items-center gap-3 py-3 border-b border-border-soft last:border-0"
                        >
                          <div className="w-12 h-12 rounded-lg border border-border bg-bg shrink-0 overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-text truncate">{item.name}</div>
                            <div className="text-[11px] text-muted tabular-nums">
                              {item.formatLabel} ×{item.units} · {itemUnits(item)} bolsas
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onChangeQty(item, -1)}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                              aria-label={`Quitar un ${item.formatLabel} de ${item.name}`}
                            >
                              <Minus size={12} aria-hidden="true" />
                            </button>
                            <span className="text-sm font-bold text-text min-w-[20px] text-center tabular-nums">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => onChangeQty(item, 1)}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                              aria-label={`Sumar un ${item.formatLabel} de ${item.name}`}
                            >
                              <Plus size={12} aria-hidden="true" />
                            </button>
                          </div>
                          {hasPrice(item.price) && (
                            <div className="text-sm font-bold text-accent min-w-[70px] text-right tabular-nums">
                              {formatPrice(item.price * item.qty)}
                            </div>
                          )}
                          <button
                            onClick={() => onRemove(item)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-faint hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            aria-label={`Eliminar ${item.name} ${item.formatLabel}`}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="px-4 sm:px-6 py-5 border-t border-border bg-surface-2 flex flex-col gap-3">
                    <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-bg border border-border">
                      <div>
                        <span className="text-sm font-bold text-muted">
                          {priced ? "Total estimado" : "Total del pedido"}
                        </span>
                        <div className="text-[10px] text-faint tabular-nums">
                          {cart.length} {cart.length === 1 ? "producto" : "productos"} · {units} bolsas
                        </div>
                      </div>
                      {priced ? (
                        <span className="text-2xl font-bold text-accent tabular-nums">
                          {formatPrice(total)}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-accent text-right max-w-[130px] leading-tight">
                          Precios a confirmar
                        </span>
                      )}
                    </div>

                    {belowMin && (
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20"
                        role="alert"
                      >
                        <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
                        <span>
                          El pedido mínimo es de {STORE_CONFIG.minOrderUnits} bolsas. Te faltan{" "}
                          {STORE_CONFIG.minOrderUnits - units}.
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div>
                        <label
                          htmlFor="cart-shop"
                          className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1.5 block"
                        >
                          Nombre del local <span className="text-red-400">*</span>
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
                          className={`${inputBase} ${errors.shop ? "border-red-500" : "border-border"}`}
                          aria-invalid={!!errors.shop}
                          aria-describedby={errors.shop ? "cart-shop-error" : undefined}
                        />
                        {errors.shop && (
                          <span id="cart-shop-error" className="text-[10px] text-red-400 mt-1 block" role="alert">
                            {errors.shop}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="cart-name"
                          className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1.5 block"
                        >
                          Tu nombre <span className="text-red-400">*</span>
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
                          className={`${inputBase} ${errors.name ? "border-red-500" : "border-border"}`}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "cart-name-error" : undefined}
                        />
                        {errors.name && (
                          <span id="cart-name-error" className="text-[10px] text-red-400 mt-1 block" role="alert">
                            {errors.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="cart-phone"
                          className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1.5 block"
                        >
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
                          className={`${inputBase} ${errors.phone ? "border-red-500" : "border-border"}`}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "cart-phone-error" : undefined}
                        />
                        {errors.phone && (
                          <span id="cart-phone-error" className="text-[10px] text-red-400 mt-1 block" role="alert">
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleClear}
                        className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2"
                        aria-label="Vaciar pedido"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                      <button
                        onClick={sendToWhatsApp}
                        disabled={belowMin}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 ${
                          belowMin
                            ? "bg-surface-3 text-faint cursor-not-allowed"
                            : "bg-green text-bg hover:bg-green/85"
                        }`}
                      >
                        <WhatsAppIcon size={18} />
                        Enviar por WhatsApp
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-faint leading-relaxed">
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
