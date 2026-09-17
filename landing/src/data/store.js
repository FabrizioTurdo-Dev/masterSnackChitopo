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
  minOrderUnits: 100,
  copyrightYear: 2026,
};

// WhatsApp del socio — formato internacional sin +
export const SELLER_PHONE = "56978632055";
export const SELLER_PHONE_PRETTY = "+56 9 7863 2055";
export const WHATSAPP_LINK = `https://wa.me/${SELLER_PHONE}`;

// Crédito de desarrollo del footer. Celular de Buenos Aires en formato
// internacional: 54 + 9 (móvil) + 11 5492-2800. El mensaje queda abierto
// para que quien escribe complete de qué es su negocio.
export const DEV_CREDIT = { name: "Fabrizio Turdo", phone: "5491154922800" };
const DEV_MESSAGE =
  "¡Hola Fabrizio! Vi la web de Chitopo y quiero una para mi negocio. Te cuento de qué se trata: ";
export const DEV_WHATSAPP_LINK = `https://wa.me/${DEV_CREDIT.phone}?text=${encodeURIComponent(DEV_MESSAGE)}`;

// Acento por sabor (los tokens viven en index.css). Sobre el dorado no
// llegan a 4.5:1, así que son para rellenos y letra grande con contorno.
export const FLAVOR_ACCENTS = {
  queso: "#e23a2e",
  papa: "#3fa34d",
  frutos: "#b5179e",
  mani: "#c98a2b",
  tocino: "#ff3b14",
};

export function flavorAccent(flavor) {
  return FLAVOR_ACCENTS[flavor] || "#d02b05";
}
