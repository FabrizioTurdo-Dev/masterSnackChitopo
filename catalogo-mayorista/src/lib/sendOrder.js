// Registra el pedido en Supabase en el momento en que el local lo manda por
// WhatsApp, para que aparezca en el panel como "nuevo".
//
// Va por la API REST (supabaseRest.js) y no con supabase-js: esa librería
// solo la carga el panel. Además `keepalive` deja terminar la petición
// aunque el teléfono salte a la app de WhatsApp y congele la pestaña.

import { dbOnline, rest } from "./supabaseRest";

// Sin credenciales (desarrollo) el pedido queda en memoria, como antes.
export const ordersOnline = dbOnline;

export function sendOrder(row) {
  return rest("pedidos", {
    method: "POST",
    keepalive: true,
    headers: {
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
// uno con otro. Sin 0/O ni 1/I, que se confunden al leerlos. MS de Master
// Snacks; los pedidos anteriores al cambio de marca quedaron con CH-.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function orderRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "MS-" + Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join("");
}
