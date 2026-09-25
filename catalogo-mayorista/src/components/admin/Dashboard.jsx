import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Package, AlertCircle, Boxes, ShoppingCart, Sparkles } from "lucide-react";
import Btn from "./ui/Btn";
import PageHeader from "./ui/PageHeader";
import { CARD, TONES } from "./ui/styles";
import { STORE_CONFIG, lineLabel, totalStock, brandsIn, plural } from "../../data/store";
import { DEFAULT_BRAND } from "../../data/brands";

function KpiCard({ icon, label, value, sub, tone, index = 0 }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`${CARD} p-4 sm:p-5 flex flex-col gap-3`}
    >
      <div className={`size-10 grid place-items-center border-2 border-night ${tone}`} aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="font-condensed text-4xl sm:text-5xl leading-none text-night tabular-nums">{value}</div>
        <div className="font-condensed uppercase tracking-[0.1em] text-xs text-night-soft mt-2">{label}</div>
        {sub && <div className="text-xs text-night-faint mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function CardTitle({ children }) {
  return (
    <h3 className="font-condensed uppercase tracking-[0.1em] text-sm text-night m-0 mb-3 pb-2 border-b-2 border-night/15">
      {children}
    </h3>
  );
}

function StatCard({ label, items }) {
  return (
    <div className={`${CARD} p-4 sm:p-5`}>
      <CardTitle>{label}</CardTitle>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-night font-medium">{item.label}</span>
            <span className="font-condensed text-lg text-electric tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ setPage }) {
  const actions = [
    { label: "Nuevo producto", icon: Package, onClick: () => setPage("products"), variant: "primary" },
    { label: "Ver pedidos", icon: ShoppingCart, onClick: () => setPage("orders"), variant: "ghost" },
    { label: "Configuración", icon: Sparkles, onClick: () => setPage("settings"), variant: "ghost" },
  ];

  return (
    <div className={`${CARD} p-4 sm:p-5`}>
      <CardTitle>Acceso rápido</CardTitle>
      <div className="flex gap-2.5 flex-wrap">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Btn key={i} small variant={a.variant} onClick={a.onClick}>
              <Icon size={14} aria-hidden="true" /> {a.label}
            </Btn>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({ products, orders, setPage, stockThreshold }) {
  const metrics = useMemo(() => {
    const total = products.length;
    const visible = products.filter(p => p.active).length;
    const hidden = total - visible;
    const soon = products.filter(p => p.status === "proximamente").length;
    const onSale = products.filter(p => p.status === "activo").length;

    const units = products.reduce((s, p) => s + totalStock(p), 0);
    const zeroFormats = products.reduce(
      (s, p) => s + (p.formats || []).filter(f => f.stock === 0).length,
      0
    );
    const lowStock = products.filter(p =>
      (p.formats || []).some(f => f.stock > 0 && f.stock <= stockThreshold)
    ).length;

    const byLine = STORE_CONFIG.lines.map(l => ({
      label: `${l.emoji} ${l.labelPlural}`,
      value: products.filter(p => p.line === l.id).length,
    }));

    // Solo tiene sentido con más de una marca cargada.
    const brands = brandsIn(products);
    const byBrand =
      brands.length > 1
        ? brands.map(b => ({
            label: b.name,
            value: products.filter(p => (p.brand || DEFAULT_BRAND) === b.id).length,
          }))
        : null;

    const byStatus = status => orders.filter(o => o.status === status).length;
    const ordersBy = {
      nuevo: byStatus("nuevo"),
      pendiente: byStatus("pendiente"),
      confirmado: byStatus("confirmado"),
      enviado: byStatus("enviado"),
    };

    return { total, visible, hidden, soon, onSale, units, zeroFormats, lowStock, byLine, byBrand, ordersBy };
  }, [products, orders, stockThreshold]);

  return (
    <div>
      <PageHeader eyebrow="Panel" title="Resumen" subtitle="Cómo está el catálogo mayorista hoy" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Package size={18} />}
          label="Productos"
          value={metrics.total}
          sub={`${plural(metrics.visible, "visible")} · ${plural(metrics.hidden, "oculto")}`}
          tone={TONES.gold}
          index={0}
        />
        <KpiCard
          icon={<Boxes size={18} />}
          label="Bolsas en stock"
          value={metrics.units.toLocaleString(STORE_CONFIG.currency.locale)}
          sub={`${metrics.onSale} a la venta`}
          tone={TONES.blue}
          index={1}
        />
        <KpiCard
          icon={<AlertCircle size={18} />}
          label="Stock crítico"
          value={metrics.lowStock}
          sub={`${plural(metrics.zeroFormats, "formato")} sin stock`}
          tone={metrics.lowStock > 0 ? TONES.red : TONES.green}
          index={2}
        />
        <KpiCard
          icon={<ShoppingCart size={18} />}
          label="Pedidos nuevos"
          value={metrics.ordersBy.nuevo}
          sub={metrics.ordersBy.nuevo > 0 ? "Falta mandarles la cotización" : "Todos respondidos"}
          tone="bg-electric text-snow"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Pedidos"
          items={[
            { label: "Nuevos", value: metrics.ordersBy.nuevo },
            { label: "Esperando respuesta", value: metrics.ordersBy.pendiente },
            { label: "Por despachar", value: metrics.ordersBy.confirmado },
            { label: "Enviados", value: metrics.ordersBy.enviado },
          ]}
        />
        {metrics.byBrand && <StatCard label="Por marca" items={metrics.byBrand} />}
        <StatCard label="Por línea" items={metrics.byLine} />
        <StatCard
          label="Estado del catálogo"
          items={[
            { label: "A la venta", value: metrics.onSale },
            { label: "Próximamente", value: metrics.soon },
            { label: "Con stock bajo", value: metrics.lowStock },
          ]}
        />
        <QuickActions setPage={setPage} />
      </div>
    </div>
  );
}
