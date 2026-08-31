import { MOCK_MODE, STORE_CONFIG, SELLER_PHONE } from "../data/store";
import { supabase } from "../config/supabase";

export const configService = {
  async get() {
    if (MOCK_MODE) {
      return {
        success: true,
        data: {
          shop_name: STORE_CONFIG.name,
          phone: SELLER_PHONE,
          min_order: STORE_CONFIG.minOrderUnits,
          currency: STORE_CONFIG.currency.code,
          show_prices: STORE_CONFIG.showPrices,
          low_stock: STORE_CONFIG.defaultStockThreshold,
        },
      };
    }
    try {
      const { data, error } = await supabase
        .from("config")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener config:", error.message);
      return { success: false, error: error.message };
    }
  },

  async update(configData) {
    if (MOCK_MODE) {
      return { success: true, data: configData };
    }
    try {
      const { data, error } = await supabase
        .from("config")
        .update(configData)
        .eq("id", 1)
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error al guardar config:", error.message);
      return { success: false, error: error.message };
    }
  },
};
