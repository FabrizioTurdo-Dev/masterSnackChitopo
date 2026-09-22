// Datos operativos que la landing muestra. La identidad de la empresa y de
// cada marca vive en brands.js. Espejo recortado de
// catalogo-mayorista/src/data/store.js.

export const STORE_CONFIG = {
  minOrderUnits: 100,
};

// WhatsApp del socio — formato internacional sin +
export const SELLER_PHONE = "56978632055";
export const SELLER_PHONE_PRETTY = "+56 9 7863 2055";
export const WHATSAPP_LINK = `https://wa.me/${SELLER_PHONE}`;

// Link de WhatsApp con el mensaje ya escrito.
export function whatsappWith(text) {
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(text)}`;
}

// Crédito de desarrollo del footer. Celular de Buenos Aires en formato
// internacional: 54 + 9 (móvil) + 11 5492-2800. El mensaje queda abierto
// para que quien escribe complete de qué es su negocio.
export const DEV_CREDIT = { name: "Fabrizio Turdo", phone: "5491154922800" };
const DEV_MESSAGE =
  "¡Hola Fabrizio! Vi la web de Master Snacks y quiero una para mi negocio. Te cuento de qué se trata: ";
export const DEV_WHATSAPP_LINK = `https://wa.me/${DEV_CREDIT.phone}?text=${encodeURIComponent(DEV_MESSAGE)}`;

// Acento por sabor (los tokens viven en shared/marca/tokens.css). Sobre el
// dorado no llegan a 4.5:1, así que son para rellenos y letra grande con
// contorno.
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
