// Configuración de la tienda (fila única de `config`) desde el panel. El
// catálogo la lee por su lado con src/lib/supabaseRest.js.
import { supabase, isSupabaseConfigured } from "../config/supabase";
import { friendlyError, noRowsError } from "./dbError";

export const configService = {
  // Sin credenciales (desarrollo, modo demo) el cambio queda en memoria.
  async update(configData) {
    if (!isSupabaseConfigured) return { success: true, data: configData };
    try {
      const { data, error } = await supabase
        .from("config")
        .update(configData)
        .eq("id", 1)
        .select();
      if (error) throw error;
      if (!data?.length) throw noRowsError();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error al guardar config:", error.message);
      return { success: false, error: friendlyError(error, "guardar la configuración") };
    }
  },
};
