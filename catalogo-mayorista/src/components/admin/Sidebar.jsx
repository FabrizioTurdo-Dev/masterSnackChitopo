import { Package, ShoppingCart, BarChart3, Settings, ExternalLink, LogOut } from "lucide-react";
import { STORE_CONFIG } from "../../data/store";
import { useAuth } from "../../context/AuthContext";
import Logo from "../brand/Logo";

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: BarChart3 },
  { id: "products",  label: "Productos",  icon: Package },
  { id: "orders",    label: "Pedidos",    icon: ShoppingCart },
  { id: "settings",  label: "Config",     icon: Settings },
];

export default function Sidebar({ page, setPage, newOrders, stockAlerts }) {
  const { email, signOut } = useAuth();

  function Content() {
    return (
      <>
        <div className="px-3 mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Logo height={26} />
            <div>
              <div className="font-condensed uppercase tracking-[0.12em] text-lg leading-none text-gold">Admin</div>
              <div className="text-[11px] text-cream/70">{STORE_CONFIG.name}</div>
            </div>
          </div>
          <div className="text-[11px] text-cream/70 mt-3 px-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${newOrders > 0 ? "bg-fire-light animate-pulse" : "bg-green"} mr-1.5`} />
            {newOrders > 0 ? `${newOrders} pedido${newOrders !== 1 ? "s" : ""} nuevo${newOrders !== 1 ? "s" : ""}` : "Sin pedidos nuevos"}
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(n => {
            const Icon = n.icon;
            const badge =
              n.id === "orders" && newOrders > 0 ? newOrders :
              n.id === "products" && stockAlerts > 0 ? stockAlerts : null;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`flex items-center gap-2.5 min-h-[44px] px-3 font-condensed uppercase tracking-[0.08em] text-sm border-2 transition-colors duration-200 cursor-pointer text-left ${
                  page === n.id
                    ? "bg-gold text-ink border-gold [box-shadow:3px_3px_0_var(--color-fire)]"
                    : "border-transparent text-cream/80 hover:bg-cream/10 hover:text-cream"
                }`}
                aria-label={n.label}
                aria-current={page === n.id ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="flex-1">{n.label}</span>
                {badge !== null && (
                  <span className={`font-sans text-[11px] font-bold px-1.5 min-w-[22px] h-[22px] grid place-items-center tabular-nums ${
                    n.id === "orders"
                      ? "bg-fire text-cream"
                      : page === n.id ? "bg-ink text-gold" : "bg-gold text-ink"
                  }`} aria-label={`${badge} notificaciones`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <a
          href="#/"
          className="flex items-center gap-2 min-h-[40px] px-3 text-xs text-cream/75 hover:text-gold transition-colors duration-200 no-underline mt-2"
        >
          <ExternalLink size={14} aria-hidden="true" />
          Ver el catálogo
        </a>

        <div className="mt-2 pt-3 border-t-2 border-cream/15">
          <div className="px-3 text-[11px] text-cream/60 truncate" title={email}>
            {email}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 min-h-[40px] px-3 mt-1 text-xs text-cream/75 hover:text-fire-light hover:bg-cream/10 transition-colors duration-200 cursor-pointer text-left"
          >
            <LogOut size={14} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </>
    );
  }

  return <Content />;
}
