import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { STORE_CONFIG } from "../../data/store";
import Logo from "../brand/Logo";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProductsTable from "./ProductsTable";
import OrdersList from "./OrdersList";
import SettingsPanel from "./SettingsPanel";

export default function AdminApp() {
  const { products, orders } = useApp();
  const prefersReduced = useReducedMotion();
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(STORE_CONFIG.defaultStockThreshold);

  const pending = orders.filter(o => o.status === "pendiente").length;
  const stockAlerts = products.filter(p =>
    (p.formats || []).some(f => f.stock > 0 && f.stock <= stockThreshold)
  ).length;

  const sections = {
    dashboard: <Dashboard products={products} orders={orders} setPage={setPage} stockThreshold={stockThreshold} />,
    products:  <ProductsTable stockThreshold={stockThreshold} />,
    orders:    <OrdersList />,
    settings:  <SettingsPanel stockThreshold={stockThreshold} onStockThresholdChange={setStockThreshold} />,
  };

  return (
    <div className="min-h-screen bg-bg font-sans flex">
      {/* Sidebar desktop */}
      <aside className="hidden sm:flex w-[220px] bg-surface border-r border-border flex-col px-3 py-5 sticky top-0 h-screen shrink-0">
        <Sidebar page={page} setPage={setPage} pending={pending} stockAlerts={stockAlerts} />
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
              className="fixed inset-0 bg-black/60 z-[100] sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={prefersReduced ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={prefersReduced ? { x: 0 } : { x: "-100%" }}
              transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[260px] bg-surface z-[101] flex flex-col px-3 py-5 sm:hidden"
            >
              <Sidebar page={page} setPage={(p) => { setPage(p); setSidebarOpen(false); }} pending={pending} stockAlerts={stockAlerts} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto py-5 px-4 sm:py-7 sm:px-8">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-6 sm:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-surface-2 text-muted hover:text-text transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            aria-label="Abrir menú"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2.5">
            <Logo height={26} />
            <div>
              <div className="text-sm font-bold text-text tracking-tight">Admin</div>
              <div className="text-[11px] text-muted">{STORE_CONFIG.name}</div>
            </div>
          </div>
        </div>

        {sections[page]}
      </main>
    </div>
  );
}
