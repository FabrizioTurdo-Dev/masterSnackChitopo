// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin credenciales el panel anda en modo demo, en memoria. Sin esta guarda
// createClient revienta al arrancar cuando .env.local está vacío.
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Supabase no está configurado. Completa VITE_SUPABASE_URL y " +
              "VITE_SUPABASE_ANON_KEY en .env.local."
          );
        },
      }
    );
