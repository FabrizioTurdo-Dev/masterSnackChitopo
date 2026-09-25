import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";
import Input from "../components/admin/ui/Input";
import { ERROR_TEXT } from "../components/admin/ui/styles";
import AdminApp from "../components/admin/AdminApp";
import MasterSnacksLogo from "../components/brand/MasterSnacksLogo";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { STORE_CONFIG } from "../data/store";
import { COMPANY } from "../data/brands";

export default function Admin() {
  // Se entra desde el pie del catálogo: sin esto el panel abre scrolleado
  // hasta donde estaba el pie.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center gap-2 font-condensed uppercase tracking-[0.12em] text-night">
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
    <div className="grain min-h-screen flex items-center justify-center font-sans px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 240 }}
        className="relative z-10 bg-snow nb p-6 sm:p-8 w-full max-w-[400px]"
      >
        <div className="text-center mb-7 flex flex-col items-center">
          <MasterSnacksLogo height={96} alt={COMPANY.name} loading="eager" className="-rotate-3" />
          <h1 className="hero-title font-title uppercase text-6xl leading-none mt-5 mb-0">
            Panel
            <span className="sr-only"> de administración</span>
          </h1>
          <p className="font-condensed uppercase tracking-[0.14em] text-sm text-night-soft mt-3 mb-0" aria-hidden="true">
            Administración · {STORE_CONFIG.subtitle}
          </p>
        </div>
        {children}
        <a
          href="#/"
          className="mt-5 flex items-center justify-center min-h-[44px] font-condensed uppercase tracking-[0.08em] text-sm text-night-soft hover:text-electric no-underline transition-colors"
        >
          ← Volver al catálogo
        </a>
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
          <div className="flex gap-2.5 items-start border-2 border-night bg-gold p-3">
            <ShieldAlert size={18} className="text-night shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-night leading-relaxed m-0">
              Supabase no está configurado. Este acceso de prueba solo existe en
              desarrollo: los cambios no se guardan en ningún lado.
            </p>
          </div>
          <button
            onClick={enterDemo}
            className="w-full min-h-[50px] bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-royal cursor-pointer"
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
          label="Correo"
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
              className={`${ERROR_TEXT} text-center m-0`}
              role="alert"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[50px] mt-1 bg-electric text-snow font-condensed uppercase tracking-[0.06em] text-lg nb nb-press hover:bg-royal cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {loading ? "Entrando…" : "Entrar →"}
        </button>

        <p className="text-xs text-night-faint text-center mt-2 mb-0 leading-relaxed">
          Acceso solo para cuentas autorizadas de {COMPANY.legalName}.
        </p>
      </form>
    </Shell>
  );
}
