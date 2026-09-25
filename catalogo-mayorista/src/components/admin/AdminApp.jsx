import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { COMPANY } from "../../data/brands";
import { isSupabaseConfigured } from "../../config/supabase";
import { ordersService } from "../../services/ordersService";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProductsTable from "./ProductsTable";
import OrdersList from "./OrdersList";
import SettingsPanel from "./SettingsPanel";

export default function AdminApp() {
  const { products, orders, setOrders, stockThreshold } = useApp();
  const prefersReduced = useReducedMotion();
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Los pedidos se cargan acá y no en su pestaña: el sidebar y el dashboard
  // también muestran cuántos hay nuevos.
  const [ordersSync, setOrdersSync] = useState({
    loading: isSupabaseConfigured,
    error: null,
    at: null,
  });

  const refreshOrders = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setOrdersSync(s => ({ ...s, loading: true }));
    const res = await ordersService.list();
    if (res.success) {
      setOrders(res.data);
      setOrdersSync({ loading: false, error: null, at: new Date() });
    } else {
      setOrdersSync(s => ({ ...s, loading: false, error: res.error }));
    }
  }, [setOrders]);

  // Los pedidos entran desde el celular de los clientes: se vuelven a pedir
  // al volver a la pestaña y cada minuto mientras el panel está abierto.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    refreshOrders();
    const onFocus = () => document.visibilityState === "visible" && refreshOrders();
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(onFocus, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      clearInterval(timer);
    };
  }, [refreshOrders]);

  const newOrders = orders.filter(o => o.status === "nuevo").length;
  const stockAlerts = products.filter(p =>
    (p.formats || []).some(f => f.stock > 0 && f.stock <= stockThreshold)
  ).length;

  const sections = {
    dashboard: <Dashboard products={products} orders={orders} setPage={setPage} stockThreshold={stockThreshold} />,
    products:  <ProductsTable stockThreshold={stockThreshold} />,
    orders:    <OrdersList sync={ordersSync} onRefresh={refreshOrders} />,
    settings:  <SettingsPanel />,
  };

  return (
    <div className="min-h-screen font-sans flex">
      {/* Sidebar desktop */}
      <aside className="on-dark hidden sm:flex w-[232px] bg-night text-snow border-r-[3px] border-night flex-col px-3 py-5 sticky top-0 h-screen shrink-0">
        <Sidebar page={page} setPage={setPage} newOrders={newOrders} stockAlerts={stockAlerts} />
      </aside>

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
              className="fixed inset-0 bg-night/60 z-[100] sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={prefersReduced ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={prefersReduced ? { x: 0 } : { x: "-100%" }}
              transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 250 }}
              className="on-dark fixed top-0 left-0 bottom-0 w-[260px] bg-night text-snow border-r-[3px] border-gold z-[101] flex flex-col px-3 py-5 sm:hidden"
            >
              <Sidebar page={page} setPage={(p) => { setPage(p); setSidebarOpen(false); }} newOrders={newOrders} stockAlerts={stockAlerts} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 overflow-auto py-5 px-4 sm:py-8 sm:px-8">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-6 sm:hidden -mx-4 -mt-5 px-4 py-3 bg-snow border-b-[3px] border-night">
          <button
            onClick={() => setSidebarOpen(true)}
            className="size-11 grid place-items-center bg-snow text-night border-2 border-night [box-shadow:3px_3px_0_var(--color-night)] nb-press cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2.5">
            <MasterSnacksLogo height={38} alt="" className="-rotate-3" />
            <div>
              <div className="font-condensed uppercase tracking-[0.12em] text-lg leading-none text-night">Panel</div>
              <div className="text-[11px] text-night-soft">{COMPANY.name}</div>
            </div>
          </div>
        </div>

        {sections[page]}
      </main>
    </div>
  );
}
