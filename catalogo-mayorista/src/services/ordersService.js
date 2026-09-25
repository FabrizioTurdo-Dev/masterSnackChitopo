import { supabase, isSupabaseConfigured } from "../config/supabase";
import { friendlyError, noRowsError } from "./dbError";

// Lo usa solo el panel. El alta la hace el catálogo con src/lib/sendOrder.js,
// sin cargar supabase-js en el sitio público.
//
// Los pedidos dependen de que haya credenciales: el local
// los crea desde su celular y el panel los lee desde otro navegador, así que
// en memoria nunca llegarían.
export const ordersService = {
  async list() {
    if (!isSupabaseConfigured) {
      return { success: true, data: null }; // null = seguir con lo que hay en memoria
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
      return { success: false, error: friendlyError(error, "cargar los pedidos") };
    }
  },

  async update(id, updates) {
    if (!isSupabaseConfigured) {
      return { success: true, data: { id, ...updates } };
    }
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      // RLS no da error cuando filtra: sin filas es que no se pudo escribir.
      if (!data?.length) throw noRowsError();
      return { success: true, data };
    } catch (error) {
      console.error("Error al actualizar pedido:", error.message);
      return { success: false, error: friendlyError(error, "cambiar el estado del pedido") };
    }
  },
};
