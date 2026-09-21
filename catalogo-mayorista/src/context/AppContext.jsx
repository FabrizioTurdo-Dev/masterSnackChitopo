// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import { MOCK_MODE, MOCK_PRODUCTS, INITIAL_PRODUCTS, INITIAL_ORDERS } from "../data/store";
import { ordersOnline, sendOrder } from "../lib/sendOrder";

const DEFAULT_PRODUCTS = MOCK_MODE ? MOCK_PRODUCTS : INITIAL_PRODUCTS;
const DEFAULT_ORDERS   = INITIAL_ORDERS;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [orders, setOrders]     = useState(DEFAULT_ORDERS);

  // Los pedidos van a Supabase apenas hay credenciales, aunque los productos
  // sigan en MOCK_MODE: el local los manda desde su celular y el panel los
  // lee desde otro navegador, así que en memoria nunca se cruzarían.
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
    <AppContext.Provider value={{ products, setProducts, orders, setOrders, addOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
