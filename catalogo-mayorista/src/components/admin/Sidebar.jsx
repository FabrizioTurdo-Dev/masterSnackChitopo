import { Package, ShoppingCart, BarChart3, Settings, ExternalLink } from "lucide-react";
import { STORE_CONFIG } from "../../data/store";
import Logo from "../brand/Logo";

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3 },
  { id: "products",  label: "Productos",  icon: Package },
  { id: "orders",    label: "Pedidos",    icon: ShoppingCart },
  { id: "settings",  label: "Config",     icon: Settings },
];

export default function Sidebar({ page, setPage, pending, stockAlerts }) {
  function Content() {
    return (
      <>
        <div className="px-3 mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Logo height={26} />
            <div>
              <div className="text-sm font-bold text-text tracking-tight">Admin</div>
              <div className="text-[11px] text-muted">{STORE_CONFIG.name}</div>
            </div>
          </div>
          <div className="text-[10px] text-faint mt-2.5 px-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${pending > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500"} mr-1.5`} />
            {pending > 0 ? `${pending} pendiente${pending !== 1 ? "s" : ""}` : "Sin novedades"}
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(n => {
            const Icon = n.icon;
            const badge =
              n.id === "orders" && pending > 0 ? pending :
              n.id === "products" && stockAlerts > 0 ? stockAlerts : null;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  page === n.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
                aria-label={n.label}
                aria-current={page === n.id ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="flex-1">{n.label}</span>
                {badge !== null && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                    n.id === "orders"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500/10 text-amber-400"
                  }`} aria-label={`${badge} notificaciones`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <a
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-faint hover:text-muted hover:bg-surface-2 transition-colors duration-200 no-underline mt-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <ExternalLink size={14} aria-hidden="true" />
          Ver el catálogo
        </a>
      </>
    );
  }

  return <Content />;
}
