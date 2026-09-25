// Acceso a la API REST de Supabase con fetch directo, para el catálogo
// público: supabase-js lo carga solo el panel, y el catálogo es lo que se
// abre desde el celular. Con la clave pública solo se puede leer productos y
// config, y crear pedidos "nuevo" (ver las políticas RLS en supabase/).

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin credenciales (desarrollo, modo demo) todo queda en memoria.
export const dbOnline = Boolean(URL && KEY);

export function rest(path, { headers, ...init } = {}) {
  return fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      ...headers,
    },
  });
}

async function readJson(path) {
  const res = await rest(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path.split("?")[0]}`);
  return res.json();
}

// Productos y umbral de stock bajo, lo que el catálogo necesita al abrir.
export async function fetchCatalog() {
  const [products, config] = await Promise.all([
    readJson("productos?select=*&order=id.asc"),
    readJson("config?select=low_stock&order=id.asc&limit=1"),
  ]);
  return { products, lowStock: config[0]?.low_stock ?? null };
}
