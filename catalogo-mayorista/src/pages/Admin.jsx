import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";
import Input from "../components/admin/ui/Input";
import AdminApp from "../components/admin/AdminApp";
import Logo from "../components/brand/Logo";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { STORE_CONFIG } from "../data/store";

export default function Admin() {
  return (
    <AuthProvider>
      <AdminGate />
    </AuthProvider>
  );
}

function AdminGate() {
  const { status, authorized, demo } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center gap-2 text-muted text-sm">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Verificando sesión…
      </div>
    );
  }

  if (authorized || demo) return <AdminApp />;
  return <Login />;
}

function Shell({ children }) {
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
        {children}
      </motion.div>
    </div>
  );
}

function Login() {
  const { signIn, notice, demoAllowed, enterDemo } = useAuth();
  const [form, setForm] = useState({ email: "", pass: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const res = await signIn(form.email, form.pass);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      setForm(f => ({ ...f, pass: "" }));
    }
  }

  // Sin credenciales de Supabase no hay contra qué autenticar.
  if (demoAllowed) {
    return (
      <Shell>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2.5 items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Supabase no está configurado. Este acceso de prueba solo existe en
              desarrollo: los cambios no se guardan en ningún lado.
            </p>
          </div>
          <button
            onClick={enterDemo}
            className="w-full py-3 rounded-xl bg-surface-2 text-text font-bold text-sm hover:bg-border transition-colors duration-200 cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Entrar en modo demo →
          </button>
        </div>
      </Shell>
    );
  }

  const message = error || notice;

  return (
    <Shell>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.pass}
          onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
          placeholder="Ingresa tu contraseña…"
        />

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-400 text-center"
              role="alert"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent text-bg font-bold text-sm hover:bg-accent-light transition-colors duration-200 cursor-pointer active:scale-[0.98] mt-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {loading ? "Entrando…" : "Entrar →"}
        </button>

        <p className="text-[11px] text-faint text-center mt-2 leading-relaxed">
          Acceso solo para cuentas autorizadas de {STORE_CONFIG.producer}.
        </p>
      </form>
    </Shell>
  );
}
