// Datos de negocio de Chitopo. Espejo de catalogo-mayorista/src/data/store.js,
// recortado a lo que la landing necesita mostrar.

export const STORE_CONFIG = {
  name: "Chitopo",
  tagline: "El sufle, po'",
  producer: "Master Snacks Inversiones SpA",

  schedule: "Lun a Vie 9:00–18:00",
  shipping: "Despachos en la Región Metropolitana",
  address: "Doctor Amador Neghme 03639 M 28, La Pintana, Santiago",
  sesma: "Resolución SESMA N° 2313426436 (16/08/2023, Región Metropolitana)",
  instagram: "chitoposnakcs.cl",
  website: "www.mastersnackschile.com",
  minOrderUnits: 24,
  copyrightYear: 2026,
};

// WhatsApp del socio — formato internacional sin +
export const SELLER_PHONE = "56978632055";
export const SELLER_PHONE_PRETTY = "+56 9 7863 2055";
export const WHATSAPP_LINK = `https://wa.me/${SELLER_PHONE}`;

// Acento por sabor (los tokens viven en index.css).
// Estos son para rellenos, bordes y tipografía de 24px o más.
export const FLAVOR_ACCENTS = {
  queso: "#e23a2e",
  papa: "#3fa34d",
  frutos: "#b5179e",
  mani: "#c98a2b",
  tocino: "#ff3b14",
};

// Variantes para texto bajo 24px: sobre --color-surface, queso quedaba
// en 4.21:1 y frutos en 3.09:1, los dos bajo el mínimo de 4.5:1.
export const FLAVOR_ACCENTS_TEXT = {
  queso: "#f0584a",
  papa: "#3fa34d",
  frutos: "#d94bbd",
  mani: "#c98a2b",
  tocino: "#ff3b14",
};

export function flavorAccent(flavor) {
  return FLAVOR_ACCENTS[flavor] || "#fbc610";
}

export function flavorAccentText(flavor) {
  return FLAVOR_ACCENTS_TEXT[flavor] || "#fbc610";
}
