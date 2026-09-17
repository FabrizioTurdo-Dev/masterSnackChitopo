// src/services/productsService.js
// Acceso a productos. Con MOCK_MODE activo trabaja contra los datos locales
// de src/data/products.js; con MOCK_MODE en false pega contra Supabase.
//
// Todas las funciones devuelven { success, data } o { success:false, error }.

import { MOCK_MODE, MOCK_PRODUCTS } from "../data/store";
import { supabase } from "../config/supabase";

const TABLE = "productos";

// Columnas que viajan a la base. Se listan explícitamente para no mandar
// campos calculados ni el id en los insert.
const COLUMNS = [
  "slug",
  "name",
  "line",
  "flavor",
  "grams",
  "status",
  "active",
  "tag",
  "emoji",
  "image",
  "gallery",
  "barcode",
  "claims",
  "formats",
  "ingredients",
  "allergens",
  "nutrition",
];

function toRow(product) {
  const row = {};
  for (const key of COLUMNS) {
    if (product[key] !== undefined) row[key] = product[key];
  }
  return row;
}

function fail(action, error) {
  console.error(`Error al ${action} productos:`, error.message);
  return { success: false, error: error.message };
}

export const productsService = {
  async list() {
    if (MOCK_MODE) return { success: true, data: MOCK_PRODUCTS };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return fail("listar", error);
    }
  },

  async create(product) {
    if (MOCK_MODE) {
      return { success: true, data: { ...product, id: Date.now() } };
    }
    try {
      const { data, error } = await supabase.from(TABLE).insert([toRow(product)]).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return fail("crear", error);
    }
  },

  async update(id, product) {
    if (MOCK_MODE) return { success: true, data: { ...product, id } };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update(toRow(product))
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return fail("actualizar", error);
    }
  },

  async remove(id) {
    if (MOCK_MODE) return { success: true, data: { id } };
    try {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
      return { success: true, data: { id } };
    } catch (error) {
      return fail("eliminar", error);
    }
  },

  async toggleActive(id, active) {
    if (MOCK_MODE) return { success: true, data: { id, active } };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ active })
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return fail("actualizar", error);
    }
  },
};
