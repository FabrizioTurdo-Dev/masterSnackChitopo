// src/data/store.js
// Estado compartido y configuración del catálogo mayorista de Master Snacks.
// La identidad de la empresa y de cada marca vive en brands.js.
// MOCK_MODE = true usa los productos locales de products.js.
// Cambia a false y configura .env.local para usar Supabase (ver README).

import { BRANDS, DEFAULT_BRAND, brandOf } from "./brands";

export const MOCK_MODE = true;

export { default as MOCK_PRODUCTS } from "./products";
export const INITIAL_PRODUCTS = [];
export const INITIAL_ORDERS = [];

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL NEGOCIO
// ═══════════════════════════════════════════════════════════════

export const STORE_CONFIG = {
  subtitle: "Catálogo mayorista",

  // ⚠️ Precios: el brief los deja pendientes ("a definir con Alex").
  // Con showPrices en false el catálogo funciona como cotizador:
  // no muestra ningún precio y el pedido se envía a confirmar por WhatsApp.
  // Ponlo en true cuando estén cargados los precios reales.
  showPrices: false,

  // Catálogo
  minOrderUnits: 100,
  defaultStockThreshold: 5,

  // Moneda
  currency: {
    locale: "es-CL",
    symbol: "$",
    code: "CLP",
  },

  // Líneas de producto (reemplazan las categorías adulto/niño del proyecto base)
  lines: [
    { id: "sufles", label: "Suflé", labelPlural: "Suflés", emoji: "🧀" },
    { id: "mani", label: "Maní", labelPlural: "Maní", emoji: "🥜" },
    { id: "aros", label: "Aro", labelPlural: "Aros", emoji: "🌶️" },
  ],

  // Formatos de venta sugeridos al crear un producto nuevo.
  // ⚠️ Cantidades placeholder — confirmar los bultos reales con Alex.
  defaultFormats: [
    { id: "caja-24", label: "Caja", units: 24, stock: 0, price: null },
    { id: "display-12", label: "Display", units: 12, stock: 0, price: null },
    { id: "unidad", label: "Unidad", units: 1, stock: 0, price: null },
  ],
};

// WhatsApp del socio — formato internacional sin +
export const SELLER_PHONE = "56978632055";
export const SELLER_PHONE_PRETTY = "+56 9 7863 2055";
export const WHATSAPP_LINK = `https://wa.me/${SELLER_PHONE}`;

// Crédito de desarrollo del footer, igual que en la landing. Celular de
// Buenos Aires en formato internacional: 54 + 9 (móvil) + 11 5492-2800.
export const DEV_CREDIT = { name: "Fabrizio Turdo", phone: "5491154922800" };
const DEV_MESSAGE =
  "¡Hola, Fabrizio! Vi la web de Master Snacks y quiero una para mi negocio. Te cuento de qué se trata: ";
export const DEV_WHATSAPP_LINK = `https://wa.me/${DEV_CREDIT.phone}?text=${encodeURIComponent(DEV_MESSAGE)}`;

// Acento por sabor (los tokens viven en shared/marca/tokens.css)
export const FLAVOR_ACCENTS = {
  queso: "#e23a2e",
  papa: "#3fa34d",
  frutos: "#b5179e",
  mani: "#c98a2b",
  tocino: "#ff3b14",
};

// Sin sabor conocido cae en el azul de Master Snacks: el dorado no se ve
// sobre las tarjetas blancas.
export function flavorAccent(flavor) {
  return FLAVOR_ACCENTS[flavor] || "#001bfa";
}

// Marcas presentes en una lista de productos, en el orden de BRANDS. Con
// una sola, el catálogo y el panel no muestran filtros ni columnas de marca.
export function brandsIn(products) {
  const ids = new Set((products || []).map(p => p.brand || DEFAULT_BRAND));
  const order = id => {
    const i = BRANDS.findIndex(b => b.id === id);
    return i === -1 ? BRANDS.length : i;
  };
  return [...ids].sort((a, b) => order(a) - order(b)).map(brandOf);
}

// Devuelve los formatos con stock disponible de un producto
export function formatsOf(product) {
  return (product?.formats || []).filter(f => f.stock > 0);
}

// Label de la línea de producto
export function lineLabel(id, plural = false) {
  const l = STORE_CONFIG.lines.find(l => l.id === id);
  if (!l) return id;
  return plural ? l.labelPlural : l.label;
}

// Unidades reales de un ítem del carrito (bolsas, no bultos)
export function itemUnits(item) {
  return (item.units || 1) * item.qty;
}

// Total de bolsas de todo el carrito
export function totalUnits(cart) {
  return cart.reduce((s, c) => s + itemUnits(c), 0);
}

// Stock total de un producto, en bolsas
export function totalStock(product) {
  return (product?.formats || []).reduce((s, f) => s + (f.stock || 0) * (f.units || 1), 0);
}

// Precio de un ítem/formato. Devuelve null si todavía no hay precio cargado.
export function formatPrice(n) {
  if (!STORE_CONFIG.showPrices || n === null || n === undefined || n === "") {
    return "A consultar";
  }
  return (
    STORE_CONFIG.currency.symbol +
    Math.round(Number(n)).toLocaleString(STORE_CONFIG.currency.locale)
  );
}

// true si hay algún precio real que mostrar
export function hasPrice(n) {
  return STORE_CONFIG.showPrices && n !== null && n !== undefined && n !== "";
}
