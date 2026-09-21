import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Package, RefreshCw, ShoppingCart, X, RotateCcw } from "lucide-react";
import Badge from "./ui/Badge";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { CARD, chip } from "./ui/styles";
import { ORDER_STEPS, ALL_STATUSES, stepIndex } from "./orderStatus";
import { useApp } from "../../context/AppContext";
import { isSupabaseConfigured } from "../../config/supabase";
import { ordersService } from "../../services/ordersService";
import { formatPrice, hasPrice } from "../../data/store";

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function formatDate(order) {
  if (!order.created_at) return order.date || "";
  return new Date(order.created_at).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// El local escribe su número como le sale ("9 1234 5678", "+56 9…").
// wa.me necesita solo dígitos y con código de país.
function waNumber(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("9")) return `56${digits}`;
  return digits;
}

// Recorrido del pedido. Cada paso es un botón: sirve para avanzar y también
// para volver atrás si alguien se equivocó de estado.
function Stepper({ order, onSet }) {
  const cancelled = order.status === "cancelado";
  const current = stepIndex(order.status);
  return (
    <ol className="grid grid-cols-4 gap-1.5 list-none p-0 m-0" aria-label="Estado del pedido">
      {ORDER_STEPS.map((s, i) => {
        const done = !cancelled && i < current;
        const isCurrent = !cancelled && i === current;
        return (
          <li key={s.id}>
            <button
              onClick={() => onSet(order, s.id)}
              aria-pressed={isCurrent}
              title={s.hint}
              className={`w-full flex items-center gap-1.5 min-h-[38px] px-2 border-2 border-ink font-condensed uppercase tracking-[0.04em] text-xs transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-fire text-cream"
                  : done
                    ? "bg-ink text-gold hover:bg-ink/90"
                    : "bg-cream text-ink-soft hover:bg-cream-2"
              } ${cancelled ? "opacity-50" : ""}`}
            >
              <span
                className={`shrink-0 size-5 grid place-items-center border-2 text-[11px] leading-none ${
                  isCurrent ? "border-cream" : done ? "border-gold" : "border-ink"
                }`}
                aria-hidden="true"
              >
                {done ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrdersList({ sync = {}, onRefresh }) {
  const { orders, setOrders } = useApp();
  const prefersReduced = useReducedMotion();
  const [filter, setFilter] = useState("todos");
  const [error, setError] = useState(null);

  async function setStatus(order, status) {
    if (order.status === status) return;
    const prev = order.status;
    setError(null);
    setOrders(list => list.map(o => (o.id === order.id ? { ...o, status } : o)));
    const res = await ordersService.update(order.id, { status });
    if (!res.success) {
      setOrders(list => list.map(o => (o.id === order.id ? { ...o, status: prev } : o)));
      setError(`No se pudo cambiar el estado del pedido de ${order.client}: ${res.error}`);
    }
  }

  function cancel(order) {
    if (window.confirm(`¿Cancelar el pedido de ${order.client}?`)) setStatus(order, "cancelado");
  }

  function openChat(order) {
    const detalle = (order.items || [])
      .map(i => `• ${i.name} — ${i.format} ×${i.units} · ${i.qty}`)
      .join("\n");
    const codigo = order.ref ? ` ${order.ref}` : "";
    const monto = hasPrice(order.total) ? `\nMonto: ${formatPrice(order.total)}` : "";
    const msg =
      `¡Hola ${order.client}! Te escribimos de Chitopo por tu pedido${codigo}:\n\n` +
      detalle +
      `\n\nTotal: ${order.units} bolsas` +
      monto;
    window.open(`https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const counts = Object.fromEntries([
    ["todos", orders.length],
    ...ALL_STATUSES.map(s => [s.id, orders.filter(o => o.status === s.id).length]),
  ]);
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  const subtitle = !isSupabaseConfigured
    ? `${orders.length} pedidos · Modo demo: se guardan en memoria mientras dure la sesión`
    : sync.at
      ? `${orders.length} pedidos · Actualizado ${sync.at.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`
      : `${orders.length} pedidos`;

  return (
    <div>
      <PageHeader eyebrow="Ventas" title="Pedidos" subtitle={subtitle}>
        {isSupabaseConfigured && (
          <Btn variant="ghost" onClick={onRefresh} disabled={sync.loading}>
            <RefreshCw size={15} className={sync.loading ? "animate-spin" : ""} aria-hidden="true" />
            {sync.loading ? "Actualizando…" : "Actualizar"}
          </Btn>
        )}
      </PageHeader>

      {(error || sync.error) && (
        <div
          className="mb-5 px-4 py-3 border-[3px] border-ink bg-[#ffd9cc] text-[#8a1c03] text-sm font-semibold"
          role="alert"
        >
          {error || `No se pudieron cargar los pedidos: ${sync.error}`}
        </div>
      )}

      {/* Cómo se usa: los dueños van moviendo cada pedido a medida que responden. */}
      <ol className="dots-cream border-[3px] border-ink p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3 list-none m-0">
        {ORDER_STEPS.map(s => (
          <li key={s.id} className="flex items-start gap-2">
            <Badge status={s.id}>{s.label}</Badge>
            <span className="text-xs text-ink-soft leading-snug">{s.hint}</span>
          </li>
        ))}
      </ol>

      <div className="flex gap-2 mb-5 flex-wrap" role="group" aria-label="Filtrar por estado">
        {[{ id: "todos", label: "Todos" }, ...ALL_STATUSES].map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            aria-pressed={filter === s.id}
            className={chip(filter === s.id)}
          >
            {s.label} ({counts[s.id]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className={`${CARD} text-center py-14 px-6`}>
            {orders.length === 0 ? (
              <>
                <Package size={44} className="mx-auto mb-3 text-ink-faint" aria-hidden="true" />
                <p className="font-condensed uppercase text-xl text-ink m-0">
                  {sync.loading ? "Cargando pedidos…" : "Sin pedidos todavía"}
                </p>
                <p className="text-sm text-ink-soft mt-1 mb-0">
                  Aparecen acá apenas un local manda su pedido por WhatsApp desde el catálogo.
                </p>
              </>
            ) : (
              <>
                <ShoppingCart size={44} className="mx-auto mb-3 text-ink-faint" aria-hidden="true" />
                <p className="font-condensed uppercase text-xl text-ink m-0">Sin resultados</p>
                <p className="text-sm text-ink-soft mt-1 mb-0">No hay pedidos en este estado</p>
              </>
            )}
          </div>
        )}

        {filtered.map(order => {
          const idx = stepIndex(order.status);
          const step = ORDER_STEPS[idx];
          const next = step?.next ? ORDER_STEPS[idx + 1] : null;
          const cancelled = order.status === "cancelado";
          return (
            <motion.article
              key={order.id}
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.3 }}
              className={`${CARD} p-5 flex flex-col gap-4`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-condensed uppercase text-xl leading-tight text-ink">
                      {order.client}
                    </span>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-xs text-ink-faint mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {order.ref && (
                      <span className="font-condensed tracking-[0.06em] text-sm text-ink">{order.ref}</span>
                    )}
                    <span>{formatDate(order)}</span>
                    {order.contact && <span>· {order.contact}</span>}
                    {order.phone && <span className="tabular-nums">· {order.phone}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {hasPrice(order.total) && (
                    <div className="font-condensed text-2xl text-fire tabular-nums">{formatPrice(order.total)}</div>
                  )}
                  <div className="font-condensed uppercase tracking-[0.06em] text-sm text-ink-soft tabular-nums">
                    {order.units} bolsas
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {(order.items || []).map((item, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-cream-2 text-ink border border-ink/30">
                    {item.name} · {item.format} ×{item.units} · {item.qty}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Stepper order={order} onSet={setStatus} />
                <p className="text-xs text-ink-soft m-0">
                  {cancelled ? "Pedido cancelado." : step?.hint}
                </p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                {next && !cancelled && (
                  <Btn small onClick={() => setStatus(order, next.id)}>
                    {step.next} <ArrowRight size={13} aria-hidden="true" />
                  </Btn>
                )}
                {order.phone && (
                  <Btn small variant="success" onClick={() => openChat(order)}>
                    <WhatsAppIcon size={13} /> Escribir por WhatsApp
                  </Btn>
                )}
                {cancelled ? (
                  <Btn small variant="ghost" onClick={() => setStatus(order, "nuevo")}>
                    <RotateCcw size={13} aria-hidden="true" /> Reabrir
                  </Btn>
                ) : (
                  order.status !== "enviado" && (
                    <Btn small variant="danger" onClick={() => cancel(order)}>
                      <X size={13} aria-hidden="true" /> Cancelar
                    </Btn>
                  )
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
