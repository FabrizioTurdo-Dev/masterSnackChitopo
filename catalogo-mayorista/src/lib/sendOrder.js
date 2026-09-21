// Registra el pedido en Supabase en el momento en que el local lo manda por
// WhatsApp, para que aparezca en el panel como "nuevo".
//
// Va con fetch directo y no con supabase-js: esa librería solo la carga el
// panel, y el catálogo público es lo que se abre desde el celular. Además
// `keepalive` deja terminar la petición aunque el teléfono salte a la app de
// WhatsApp y congele la pestaña.

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin credenciales (desarrollo) el pedido queda en memoria, como antes.
export const ordersOnline = Boolean(URL && KEY);

export function sendOrder(row) {
  return fetch(`${URL}/rest/v1/pedidos`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      // El visitante puede insertar pero no leer pedidos: pedir la fila de
      // vuelta haría fallar el insert por RLS.
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
}

// Código corto que va en el mensaje de WhatsApp y en el panel, para cruzar
// uno con otro. Sin 0/O ni 1/I, que se confunden al leerlos.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function orderRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "CH-" + Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join("");
}
