// Direcciones entre las páginas del sitio. La landing tiene dos: la home de
// Master Snacks (/) y la de Chitopo (/chitopo/). El catálogo vive aparte.
const BASE = import.meta.env.BASE_URL;

export const HOME_URL = BASE;

// Página propia de una marca (ver `path` en data/brands.js).
export function brandUrl(brand) {
  return BASE + brand.path;
}

// En producción landing y catálogo comparten dominio. Si Netlify no trae
// VITE_CATALOGO_URL, cae igual en /catalogo/; en local, al dev server.
export const CATALOGO_URL =
  import.meta.env.VITE_CATALOGO_URL || (import.meta.env.DEV ? "http://localhost:5173" : "/catalogo/");

// Panel de administración del catálogo (ruta con hash: el catálogo usa HashRouter).
export const ADMIN_URL = `${CATALOGO_URL}#/admin`;
