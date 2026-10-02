// src/data/store.js
// Configuración del catálogo mayorista de Master Snacks. La identidad de la
// empresa y de cada marca vive en brands.js.
//
// Con credenciales de Supabase (.env.local, variables de Netlify) los
// productos salen de la base y el panel los guarda ahí. Sin credenciales
// (desarrollo, modo demo) se usan los de products.js en memoria. products.js
// también es el respaldo si la base no responde y la fuente de seed.sql.

import { BRANDS, DEFAULT_BRAND, brandOf } from "./brands";

export { default as MOCK_PRODUCTS } from "./products";

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL NEGOCIO
// ═══════════════════════════════════════════════════════════════

export const STORE_CONFIG = {
  subtitle: "Catálogo mayorista",

  // Moneda: fija en peso chileno. El panel la muestra pero no la cambia.
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

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN EDITABLE DESDE EL PANEL
// ═══════════════════════════════════════════════════════════════
// Vive en la fila única de la tabla `config`. Estos son los valores que
// rigen mientras la base no responde o una columna viene vacía.

export const DEFAULT_WELCOME =
  "Snacks de nuestra fábrica en La Pintana, al por mayor. Arma tu pedido acá: por WhatsApp " +
  "cerramos precio, pago y despacho al tiro.";

export const DEFAULT_SETTINGS = {
  shopName: "Master Snacks",
  // WhatsApp del socio — formato internacional sin +
  phone: "56978632055",
  // En unidades (bolsas)
  minOrder: 100,
  // Con showPrices en false el catálogo funciona como cotizador: no muestra
  // ningún precio y el pedido se cierra por WhatsApp.
  showPrices: false,
  // Umbral de stock bajo, en bultos
  lowStock: 5,
  welcome: DEFAULT_WELCOME,
  // Aviso destacado sobre el catálogo: vacío no se muestra
  notice: "",
};

const text = v => (typeof v === "string" ? v.trim() : "");
const int = (v, fallback) => (Number.isInteger(v) ? v : fallback);

// Fila de `config` → settings, con el valor por defecto donde falte.
export function settingsFromRow(row) {
  if (!row) return DEFAULT_SETTINGS;
  const d = DEFAULT_SETTINGS;
  return {
    shopName: text(row.shop_name) || d.shopName,
    phone: normalizePhone(row.phone) || d.phone,
    minOrder: int(row.min_order, d.minOrder),
    showPrices: typeof row.show_prices === "boolean" ? row.show_prices : d.showPrices,
    lowStock: int(row.low_stock, d.lowStock),
    welcome: text(row.welcome) || d.welcome,
    notice: text(row.notice),
  };
}

// Settings → columnas de `config`. La bajada por defecto se guarda como
// NULL: así, si algún día cambia el texto original, la base no lo pisa.
export function rowFromSettings(s) {
  return {
    shop_name: s.shopName,
    phone: s.phone,
    min_order: s.minOrder,
    show_prices: s.showPrices,
    low_stock: s.lowStock,
    welcome: s.welcome && s.welcome !== DEFAULT_WELCOME ? s.welcome : null,
    notice: s.notice || null,
  };
}

// "+56 9 7863 2055" → "56978632055". Un celular de 9 dígitos escrito sin el
// código de país (978632055) se completa con el 56 de Chile.
export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (/^9\d{8}$/.test(digits)) return `56${digits}`;
  return digits;
}

// Celular chileno: 56 + 9 + 8 dígitos.
export function isValidPhone(digits) {
  return /^569\d{8}$/.test(digits);
}

// "56978632055" → "+56 9 7863 2055". Si no es un celular chileno, lo
// muestra tal cual con el +.
export function phonePretty(digits) {
  const m = /^(56)(9)(\d{4})(\d{4})$/.exec(digits || "");
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}

// Link de WhatsApp, con el mensaje ya escrito si viene.
export function whatsappLink(phone, msg) {
  const base = `https://wa.me/${phone}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

// Settings vigentes para las funciones de precio, que se llaman desde
// muchos componentes. AppContext los actualiza en el mismo paso en que
// cambia su estado, así cada render ya lee el valor nuevo.
let current = DEFAULT_SETTINGS;
export function applySettings(settings) {
  current = settings;
}

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

// Nombre de cada sabor para mostrar en el panel.
export const FLAVOR_LABELS = {
  queso: "Queso",
  papa: "Papa",
  frutos: "Frutos del bosque",
  mani: "Maní",
  tocino: "Tocino merkén",
};

export function flavorLabel(flavor) {
  return FLAVOR_LABELS[flavor] || flavor || "";
}

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

// "1 pedido", "3 pedidos".
export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

// "1 bolsa", "24 bolsas".
export function bolsas(n) {
  return plural(n, "bolsa");
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
  if (!current.showPrices || n === null || n === undefined || n === "") {
    return "A consultar";
  }
  return (
    STORE_CONFIG.currency.symbol +
    Math.round(Number(n)).toLocaleString(STORE_CONFIG.currency.locale)
  );
}

// true si hay algún precio real que mostrar
export function hasPrice(n) {
  return current.showPrices && n !== null && n !== undefined && n !== "";
}
