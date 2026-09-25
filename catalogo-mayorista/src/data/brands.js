// Empresa y marcas. Master Snacks es la empresa; cada marca es una línea
// suya con identidad propia (Chitopo = horneados; las no horneadas vienen
// después). Espejo de landing/src/data/brands.js: si cambias algo acá,
// cambia allá también.
//
// JS puro, sin imports de assets, para poder leerlo desde scripts de Node
// (build-seed valida contra BRANDS). Los logos se resuelven en
// components/brand/BrandMark.jsx.
//
// Para sumar una marca: agregarla acá y en la landing, darle su logo en
// BrandMark y, si trae sabores o líneas nuevas, sumarlos en store.js. La
// base no necesita migración: `brand` es texto libre.

export const COMPANY = {
  id: "mastersnacks",
  name: "Master Snacks",
  legalName: "Master Snacks Inversiones SpA",
  schedule: "Lunes a viernes, 9:00 a 18:00",
  shipping: "Despachos en la Región Metropolitana",
  address: "Doctor Amador Neghme 03639 M 28, La Pintana, Santiago",
  sesma: "Resolución SESMA N° 2313426436 (16/08/2023, Región Metropolitana)",
  copyrightYear: 2026,
};

// `path` es relativo a la raíz del sitio (sin barra inicial): la landing y
// el catálogo le anteponen su propia base.
export const BRANDS = [
  {
    id: "chitopo",
    name: "Chitopo",
    descriptor: "Horneados",
    blurb: "Suflés horneados, crujientes y sin fritura.",
    tagline: "El suflé, BKN",
    instagram: "chitoposnack.cl",
    path: "chitopo/",
    baked: true,
  },
];

export const DEFAULT_BRAND = "chitopo";

export function brandOf(id) {
  const key = id || DEFAULT_BRAND;
  return BRANDS.find((b) => b.id === key) ?? { id: key, name: key, descriptor: "" };
}

export const CHITOPO = brandOf("chitopo");
