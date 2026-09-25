// src/App.jsx
import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Catalogo from "./pages/Catalogo";
import ReloadBoundary from "./components/ReloadBoundary";

// El panel admin (y con él Supabase) se carga aparte: el catálogo público
// es lo que abren los locales desde el celular y no necesita ese peso.
const Admin = lazy(() => import("./pages/Admin"));

export default function App() {
  return (
    <ReloadBoundary>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Catalogo />} />
            <Route
              path="/admin"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center font-condensed uppercase tracking-[0.12em] text-night">
                      Cargando panel…
                    </div>
                  }
                >
                  <Admin />
                </Suspense>
              }
            />
            {/* Cualquier otro #/… vuelve al catálogo en vez de quedar en blanco. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </ReloadBoundary>
  );
}
