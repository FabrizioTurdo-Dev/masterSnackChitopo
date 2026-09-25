// src/context/AuthContext.jsx
// Sesión del panel admin contra Supabase Auth.
//
// Vive dentro del chunk lazy de /admin (ver App.jsx): el catálogo público no
// carga ni supabase-js ni este contexto.
//
// La barrera real no es este archivo sino las políticas RLS de la base
// (supabase/migration-auth.sql). Aunque alguien lograra pintar el panel en
// pantalla, sin un JWT cuyo email esté en la tabla `admins` la base rechaza
// toda escritura. Acá solo decidimos qué mostrar.

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../config/supabase";
import { DEV_CREDIT } from "../data/store";

// Sin credenciales de Supabase no hay contra qué autenticar. En desarrollo
// dejamos abrir el panel en modo demo (datos en memoria) para poder mostrarlo;
// en el build de producción `import.meta.env.DEV` es false y esta puerta no
// existe.
const DEMO_ALLOWED = import.meta.env.DEV && !isSupabaseConfigured;

const AuthContext = createContext(null);

// Mensajes de Supabase → castellano. No revelamos si el email existe o no.
function translateError(error) {
  const msg = (error?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("email not confirmed")) return "Esta cuenta todavía no confirma su correo.";
  if (error?.status === 429 || msg.includes("too many requests") || msg.includes("rate limit"))
    return "Demasiados intentos. Espera un minuto y vuelve a probar.";
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return "No se pudo conectar con el servidor. Revisa la conexión.";
  return "No se pudo iniciar sesión. Intenta de nuevo.";
}

// ¿El email de la sesión está en la whitelist? La política RLS de `admins`
// solo deja ver la propia fila, así que esto devuelve la fila o nada.
async function isWhitelisted(user) {
  if (!user?.email) return false;
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    // Falla cerrado: si no se puede confirmar el acceso, no se entra.
    // Casi siempre es que falta correr supabase/migration-auth.sql.
    console.error(
      "No se pudo verificar la whitelist de admins. ¿Está corrido " +
        "supabase/migration-auth.sql?",
      error.message
    );
    return false;
  }
  return Boolean(data);
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(isSupabaseConfigured ? "loading" : "ready");
  const [session, setSession] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [notice, setNotice] = useState("");
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    async function apply(nextSession) {
      if (!nextSession) {
        if (!active) return;
        setSession(null);
        setAuthorized(false);
        setStatus("ready");
        return;
      }
      const ok = await isWhitelisted(nextSession.user);
      if (!active) return;
      if (!ok) {
        await supabase.auth.signOut();
        if (!active) return;
        setSession(null);
        setAuthorized(false);
        setNotice("Esa cuenta no tiene acceso al panel.");
        setStatus("ready");
        return;
      }
      setSession(nextSession);
      setAuthorized(true);
      setStatus("ready");
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        setAuthorized(false);
        return;
      }
      apply(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    setNotice("");
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: `El panel todavía no está habilitado. Avísale a ${DEV_CREDIT.name}.`,
      };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { success: false, error: translateError(error) };
    // El resto (whitelist + sesión) lo resuelve onAuthStateChange.
    return { success: true };
  }

  async function signOut() {
    setNotice("");
    setDemo(false);
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setAuthorized(false);
  }

  const value = {
    status,
    authorized,
    demo,
    demoAllowed: DEMO_ALLOWED,
    notice,
    email: demo ? "modo demo" : session?.user?.email || "",
    signIn,
    signOut,
    enterDemo: () => DEMO_ALLOWED && setDemo(true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
