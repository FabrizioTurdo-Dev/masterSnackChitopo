import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../components/admin/ui/Input";
import AdminApp from "../components/admin/AdminApp";
import Logo from "../components/brand/Logo";
import { STORE_CONFIG } from "../data/store";

// ⚠️ Esto NO es seguridad real: el bundle es público, así que cualquiera puede
// leer estas credenciales desde el navegador. Es solo una barrera para que el
// panel no quede a la vista. La protección de verdad son las políticas RLS de
// Supabase, que exigen sesión autenticada para escribir.
// Ver supabase/migration-auth.sql para pasar a Supabase Auth.
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "admin";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "chitopo2026";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState(false);

  function handleLogin() {
    if (form.user === ADMIN_USER && form.pass === ADMIN_PASS) {
      setLoggedIn(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  if (loggedIn) return <AdminApp />;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border p-6 sm:p-8 w-full max-w-[380px] shadow-2xl"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo height={44} />
          <h1 className="font-display text-lg font-bold text-text mt-4">Panel de administración</h1>
          <p className="text-xs text-muted mt-1">{STORE_CONFIG.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            label="Usuario"
            name="username"
            autoComplete="username"
            value={form.user}
            onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Usuario"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.pass}
            onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Ingresa tu contraseña…"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400 text-center"
                role="alert"
              >
                Usuario o contraseña incorrectos
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-accent text-bg font-bold text-sm hover:bg-accent-light transition-colors duration-200 cursor-pointer active:scale-[0.98] mt-1 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Entrar →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
