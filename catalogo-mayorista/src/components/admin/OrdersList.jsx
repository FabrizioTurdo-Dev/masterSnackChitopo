import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Truck, ShoppingCart, Package } from "lucide-react";
import Badge from "./ui/Badge";
import Btn from "./ui/Btn";
import { useApp } from "../../context/AppContext";
import { formatPrice, hasPrice } from "../../data/store";

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function OrdersList() {
  const { orders, setOrders } = useApp();
  const prefersReduced = useReducedMotion();
  const [filter, setFilter] = useState("todos");

  function setStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  function sendWA(order) {
    const detalle = order.items
      .map(i => `• ${i.name} — ${i.format} ×${i.units} · ${i.qty}`)
      .join("\n");
    const cierre = hasPrice(order.total)
      ? `\nMonto: ${formatPrice(order.total)}`
      : "\n\nTe pasamos los precios por acá para confirmar.";
    const msg =
      `¡Hola ${order.client}! Confirmamos tu pedido #${order.id}:\n\n` +
      detalle +
      `\n\nTotal: ${order.units} bolsas` +
      cierre +
      "\n\nCoordinamos el despacho al tiro.";
    window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const counts = {
    todos: orders.length,
    pendiente:  orders.filter(o => o.status === "pendiente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    enviado:    orders.filter(o => o.status === "enviado").length,
  };
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-text">Pedidos</h2>
        <p className="text-xs text-muted">{orders.length} pedidos en total · Se guardan en memoria mientras dure la sesión</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(counts).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
              filter === k
                ? "bg-accent text-bg"
                : "bg-surface-2 text-muted border border-border hover:border-muted"
            }`}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)} ({v})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-faint">
            {orders.length === 0 ? (
              <>
                <Package size={44} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
                <p className="text-sm font-bold text-muted">Sin pedidos todavía</p>
                <p className="text-xs text-faint mt-1">Van a aparecer acá cuando un local mande su pedido desde el catálogo</p>
              </>
            ) : (
              <>
                <ShoppingCart size={44} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
                <p className="text-sm font-bold text-muted">Sin resultados</p>
                <p className="text-xs text-faint mt-1">No hay pedidos en esta categoría</p>
              </>
            )}
          </div>
        )}
        {filtered.map(order => (
          <motion.div
            key={order.id}
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.3 }}
            className="bg-surface rounded-xl border border-border p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span className="text-base font-bold text-text">{order.client}</span>
                  <Badge status={order.status} />
                </div>
                <div className="text-[11px] text-muted">
                  Pedido #{order.id} · {order.date}
                  {order.contact ? ` · ${order.contact}` : ""}
                </div>
              </div>
              <div className="text-right">
                {hasPrice(order.total) && (
                  <div className="text-lg font-bold text-accent tabular-nums">{formatPrice(order.total)}</div>
                )}
                <div className="text-[11px] text-muted tabular-nums">{order.units} bolsas</div>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {order.items.map((item, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-1 rounded-lg bg-surface-2 text-muted border border-border"
                >
                  {item.name} · {item.format} ×{item.units} · {item.qty}
                </span>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Btn small variant="success" onClick={() => sendWA(order)}>
                <WhatsAppIcon size={13} /> Confirmar por WA
              </Btn>
              {order.status === "pendiente" && (
                <Btn small variant="accent" onClick={() => setStatus(order.id, "confirmado")}>
                  <Check size={13} /> Confirmar
                </Btn>
              )}
              {order.status === "confirmado" && (
                <Btn small variant="ghost" onClick={() => setStatus(order.id, "enviado")}>
                  <Truck size={13} /> Marcar enviado
                </Btn>
              )}
              {order.status !== "cancelado" && (
                <Btn small variant="danger" onClick={() => setStatus(order.id, "cancelado")}>
                  Cancelar
                </Btn>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
