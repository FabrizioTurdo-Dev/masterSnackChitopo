// WhatsApp y pedido mínimo que los dueños editan en el panel del catálogo
// (fila única de la tabla `config` en Supabase). La landing los lee con un
// fetch directo, sin supabase-js, y arranca con los de data/store.js: si la
// base no responde, la página queda igual que antes.
//
// La última config leída queda en el navegador, así la visita siguiente
// arranca con los datos correctos sin mostrar un instante los de fábrica.

import { useSyncExternalStore } from "react";
import { SELLER_PHONE, STORE_CONFIG } from "../data/store";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CACHE_KEY = "ms-site-config";

const DEFAULTS = { phone: SELLER_PHONE, minOrder: STORE_CONFIG.minOrderUnits };

function fromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let current = URL && KEY ? fromCache() : DEFAULTS;
const listeners = new Set();

function set(next) {
  current = next;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento: la próxima visita vuelve a esperar a la base.
  }
  listeners.forEach((fn) => fn());
}

// Mismas reglas que el panel: un celular chileno (56 + 9 + 8 dígitos) y un
// mínimo entero. Lo que no las cumpla se ignora y queda el de fábrica.
function fromRow(row) {
  const phone = String(row?.phone ?? "").replace(/\D/g, "");
  return {
    phone: /^569\d{8}$/.test(phone) ? phone : DEFAULTS.phone,
    minOrder: Number.isInteger(row?.min_order) && row.min_order > 0 ? row.min_order : DEFAULTS.minOrder,
  };
}

if (URL && KEY) {
  fetch(`${URL}/rest/v1/config?select=phone,min_order&order=id.asc&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((rows) => rows[0] && set(fromRow(rows[0])))
    .catch((err) => console.error("No se pudo leer la configuración del sitio:", err.message));
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// "56978632055" → "+56 9 7863 2055".
export function phonePretty(digits) {
  const m = /^(56)(9)(\d{4})(\d{4})$/.exec(digits || "");
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}

// { phone, minOrder, phonePretty, whatsappLink, whatsappWith(text) }
export function useSiteConfig() {
  const config = useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
  const whatsappLink = `https://wa.me/${config.phone}`;
  return {
    ...config,
    phonePretty: phonePretty(config.phone),
    whatsappLink,
    whatsappWith: (text) => `${whatsappLink}?text=${encodeURIComponent(text)}`,
  };
}
