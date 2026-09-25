// src/context/AppContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MOCK_PRODUCTS, STORE_CONFIG } from "../data/store";
import { ordersOnline, sendOrder } from "../lib/sendOrder";
import { dbOnline, fetchCatalog } from "../lib/supabaseRest";

const AppContext = createContext(null);

// Estado de los productos:
//   loading → pidiéndolos a la base
//   db      → vienen de la base (lo que editan los dueños en el panel)
//   local   → sin credenciales (desarrollo, modo demo): products.js en memoria
//   error   → la base no respondió; se muestra products.js para que el
//             catálogo no quede vacío, y el panel no deja editar
export function AppProvider({ children }) {
  const [products, setProducts] = useState(dbOnline ? [] : MOCK_PRODUCTS);
  const [productsStatus, setProductsStatus] = useState(dbOnline ? "loading" : "local");
  const [stockThreshold, setStockThreshold] = useState(STORE_CONFIG.defaultStockThreshold);
  const [orders, setOrders] = useState([]);

  const reloadProducts = useCallback(async () => {
    if (!dbOnline) return;
    try {
      const { products: rows, lowStock } = await fetchCatalog();
      setProducts(rows);
      if (lowStock !== null) setStockThreshold(lowStock);
      setProductsStatus("db");
    } catch (err) {
      console.error("No se pudieron cargar los productos de la base:", err.message);
      setProducts(prev => (prev.length ? prev : MOCK_PRODUCTS));
      setProductsStatus("error");
    }
  }, []);

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
        stockThreshold,
        setStockThreshold,
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
