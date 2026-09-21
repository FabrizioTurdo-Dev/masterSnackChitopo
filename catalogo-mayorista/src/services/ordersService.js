import { MOCK_MODE } from "../data/store";
import { supabase } from "../config/supabase";

export const ordersService = {
  async create(orderData) {
    if (MOCK_MODE) {
      return { success: true, data: { id: Date.now(), ...orderData } };
    }
    try {
      // Sin .select(): quien manda el pedido es un visitante anónimo, que
      // puede insertar pero no leer pedidos (ni siquiera el suyo). Pedir la
      // fila de vuelta haría fallar el insert por RLS.
      const { error } = await supabase.from("pedidos").insert([orderData]);
      if (error) throw error;
      return { success: true, data: orderData };
    } catch (error) {
      console.error("Error al crear pedido:", error.message);
      return { success: false, error: error.message };
    }
  },

  async list() {
    if (MOCK_MODE) {
      return { success: true, data: [] };
    }
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error al listar pedidos:", error.message);
      return { success: false, error: error.message };
    }
  },

  async update(id, updates) {
    if (MOCK_MODE) {
      return { success: true, data: { id, ...updates } };
    }
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error al actualizar pedido:", error.message);
      return { success: false, error: error.message };
    }
  },
};
