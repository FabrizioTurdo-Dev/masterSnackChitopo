// En producción landing y catálogo comparten dominio: la landing está en "/".
// En desarrollo apunta al dev server de la landing.
export const LANDING_URL =
  import.meta.env.VITE_LANDING_URL || (import.meta.env.DEV ? "http://localhost:5174" : "/");

// Página propia de una marca en la landing (ver `path` en data/brands.js).
export function brandSiteUrl(brand) {
  return LANDING_URL.replace(/\/?$/, "/") + brand.path;
}
