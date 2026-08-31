// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import { MOCK_MODE, MOCK_PRODUCTS, INITIAL_PRODUCTS, INITIAL_ORDERS } from "../data/store";

const DEFAULT_PRODUCTS = MOCK_MODE ? MOCK_PRODUCTS : INITIAL_PRODUCTS;
const DEFAULT_ORDERS   = INITIAL_ORDERS;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [orders, setOrders]     = useState(DEFAULT_ORDERS);

  function addOrder(order) {
    setOrders(prev => [
      { ...order, id: Date.now(), date: new Date().toISOString().split("T")[0], status: "pendiente" },
      ...prev,
    ]);
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
