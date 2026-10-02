// src/context/AppContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MOCK_PRODUCTS, DEFAULT_SETTINGS, applySettings, settingsFromRow } from "../data/store";
import { ordersOnline, sendOrder } from "../lib/sendOrder";
import { dbOnline, fetchCatalog } from "../lib/supabaseRest";

const AppContext = createContext(null);

// La última config que llegó de la base queda en el navegador: en la visita
// siguiente el catálogo arranca con el número, el mínimo y los textos
// correctos, sin mostrar un instante los de fábrica. Si el navegador no deja
// guardar (modo privado, datos bloqueados), arranca con los de fábrica.
const SETTINGS_KEY = "ms-config";

function cachedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function cacheSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Sin almacenamiento: la próxima visita vuelve a esperar a la base.
  }
}

// Estado de los productos:
//   loading → pidiéndolos a la base
//   db      → vienen de la base (lo que editan los dueños en el panel)
//   local   → sin credenciales (desarrollo, modo demo): products.js en memoria
//   error   → la base no respondió; se muestra products.js para que el
//             catálogo no quede vacío, y el panel no deja editar
//
// La configuración (WhatsApp, mínimo, precios, textos) llega en el mismo
// pedido que los productos y la editan los dueños desde el panel.
export function AppProvider({ children }) {
  const [products, setProducts] = useState(dbOnline ? [] : MOCK_PRODUCTS);
  const [productsStatus, setProductsStatus] = useState(dbOnline ? "loading" : "local");
  const [settings, setSettings] = useState(() => {
    const initial = dbOnline ? cachedSettings() : DEFAULT_SETTINGS;
    applySettings(initial);
    return initial;
  });
  const [orders, setOrders] = useState([]);

  // Las funciones de precio leen los settings del módulo store.js: se
  // actualizan antes del estado para que el render que sigue ya los vea.
  const updateSettings = useCallback(next => {
    applySettings(next);
    setSettings(next);
    if (dbOnline) cacheSettings(next);
  }, []);

  const reloadProducts = useCallback(async () => {
    if (!dbOnline) return;
    try {
      const { products: rows, config } = await fetchCatalog();
      setProducts(rows);
      if (config) updateSettings(settingsFromRow(config));
      setProductsStatus("db");
    } catch (err) {
      console.error("No se pudieron cargar los productos de la base:", err.message);
      setProducts(prev => (prev.length ? prev : MOCK_PRODUCTS));
      setProductsStatus("error");
    }
  }, [updateSettings]);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // Los pedidos van a Supabase apenas hay credenciales: el local los manda
  // desde su celular y el panel los lee desde otro navegador, así que en
  // memoria nunca se cruzarían.
  function addOrder(order) {
    const row = { ...order, status: "nuevo" };
    if (ordersOnline) {
      return sendOrder(row).catch(err =>
        console.error("No se pudo registrar el pedido:", err.message)
      );
    }
    // Sin Supabase (desarrollo): queda en memoria para verlo en el panel demo.
    setOrders(prev => [{ ...row, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);
  }

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        productsStatus,
        reloadProducts,
        settings,
        updateSettings,
        stockThreshold: settings.lowStock,
        orders,
        setOrders,
        addOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
