// src/services/productsService.js
// Productos desde el panel, con la sesión del admin. Sin credenciales de
// Supabase (desarrollo, modo demo) no hay base: el panel trabaja sobre lo
// que hay en memoria y estas funciones solo lo confirman.
//
// Todas las funciones devuelven { success, data } o { success:false, error },
// con el error ya en castellano para mostrarlo en el panel.

import { supabase, isSupabaseConfigured } from "../config/supabase";
import { friendlyError, noRowsError } from "./dbError";

const TABLE = "productos";

// Columnas que viajan a la base. Se listan explícitamente para no mandar
// campos calculados ni el id en los insert.
const COLUMNS = [
  "slug",
  "name",
  "brand",
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
  console.error(`Error al ${action}:`, error.message);
  return { success: false, error: friendlyError(error, action) };
}

// Devuelve la primera fila, o error si la base no devolvió ninguna.
function firstRow(data) {
  if (!data?.length) throw noRowsError();
  return data[0];
}

export const productsService = {
  // data: null = seguir con lo que hay en memoria.
  async list() {
    if (!isSupabaseConfigured) return { success: true, data: null };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return fail("cargar los productos", error);
    }
  },

  async create(product) {
    if (!isSupabaseConfigured) {
      return { success: true, data: { ...product, id: Date.now() } };
    }
    try {
      const { data, error } = await supabase.from(TABLE).insert([toRow(product)]).select();
      if (error) throw error;
      return { success: true, data: firstRow(data) };
    } catch (error) {
      return fail("crear el producto", error);
    }
  },

  async update(id, product) {
    if (!isSupabaseConfigured) return { success: true, data: { ...product, id } };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update(toRow(product))
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data: firstRow(data) };
    } catch (error) {
      return fail("guardar el producto", error);
    }
  },

  async remove(id) {
    if (!isSupabaseConfigured) return { success: true, data: { id } };
    try {
      const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
      if (error) throw error;
      firstRow(data);
      return { success: true, data: { id } };
    } catch (error) {
      return fail("eliminar el producto", error);
    }
  },

  async toggleActive(id, active) {
    if (!isSupabaseConfigured) return { success: true, data: { id, active } };
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ active })
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data: firstRow(data) };
    } catch (error) {
      return fail("cambiar la visibilidad del producto", error);
    }
  },
};
