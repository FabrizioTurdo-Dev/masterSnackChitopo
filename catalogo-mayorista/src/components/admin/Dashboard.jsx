import { useMemo } from "react";
import { Package, AlertCircle, Boxes, ShoppingCart, Sparkles } from "lucide-react";
import { STORE_CONFIG, lineLabel, totalStock } from "../../data/store";

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-2">
      <div className={color}>{icon}</div>
      <div>
        <div className="text-xl sm:text-2xl font-bold text-text tabular-nums">{value}</div>
        <div className="text-[11px] text-muted">{label}</div>
        {sub && <div className="text-[10px] text-faint mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function StatCard({ label, items }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
      <h3 className="text-xs font-bold text-muted uppercase tracking-[0.08em] mb-3">{label}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-text font-medium">{item.label}</span>
            <span className="text-accent font-bold tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ setPage }) {
  const actions = [
    { label: "Nuevo producto", icon: Package, onClick: () => setPage("products"), variant: "primary" },
    { label: "Pedidos pendientes", icon: ShoppingCart, onClick: () => setPage("orders"), variant: "ghost" },
    { label: "Configuración", icon: Sparkles, onClick: () => setPage("settings"), variant: "ghost" },
  ];

  const base = "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5";
  const styles = {
    primary: `${base} bg-accent text-bg hover:bg-accent-light`,
    ghost: `${base} bg-surface-2 text-muted border border-border hover:border-muted hover:text-text`,
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
      <h3 className="text-xs font-bold text-muted uppercase tracking-[0.08em] mb-3">Acceso rápido</h3>
      <div className="flex gap-2 flex-wrap">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={a.onClick} className={styles[a.variant]}>
              <Icon size={14} /> {a.label}
            </button>
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

    const pendingOrders = orders.filter(o => o.status === "pendiente").length;
    const confirmedOrders = orders.filter(o => o.status === "confirmado").length;

    return { total, visible, hidden, soon, onSale, units, zeroFormats, lowStock, byLine, pendingOrders, confirmedOrders };
  }, [products, orders, stockThreshold]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg font-bold text-text">Dashboard</h2>
        <p className="text-xs text-muted">Resumen del catálogo mayorista</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          icon={<Package size={18} />}
          label="Productos"
          value={metrics.total}
          sub={`${metrics.visible} visibles · ${metrics.hidden} ocultos`}
          color="text-accent"
        />
        <KpiCard
          icon={<Boxes size={18} />}
          label="Bolsas en stock"
          value={metrics.units.toLocaleString(STORE_CONFIG.currency.locale)}
          sub={`${metrics.onSale} a la venta`}
          color="text-blue-400"
        />
        <KpiCard
          icon={<AlertCircle size={18} />}
          label="Stock crítico"
          value={metrics.lowStock}
          sub={`${metrics.zeroFormats} formatos sin stock`}
          color={metrics.lowStock > 0 ? "text-red-400" : "text-emerald-400"}
        />
        <KpiCard
          icon={<ShoppingCart size={18} />}
          label="Pedidos"
          value={metrics.pendingOrders}
          sub={metrics.confirmedOrders > 0 ? `${metrics.confirmedOrders} confirmados` : "Sin confirmar"}
          color="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
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

      {!STORE_CONFIG.showPrices && (
        <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-xs text-muted leading-relaxed">
          <strong className="text-accent">Modo "precio a consultar" activo.</strong> El catálogo
          público no muestra precios y los pedidos llegan como cotización. Para prenderlos, cargá
          los precios de cada formato y poné <code className="text-accent">showPrices: true</code> en{" "}
          <code className="text-accent">src/data/store.js</code>.
        </div>
      )}
    </div>
  );
}
