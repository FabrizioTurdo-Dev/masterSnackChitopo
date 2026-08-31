// En producción landing y catálogo comparten dominio (VITE_CATALOGO_URL=/catalogo/).
// Sin la variable definida, apunta al dev server local del catálogo.
export const CATALOGO_URL = import.meta.env.VITE_CATALOGO_URL || "http://localhost:5173";
