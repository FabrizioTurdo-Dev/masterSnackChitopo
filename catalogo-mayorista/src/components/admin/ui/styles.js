// Clases del panel con el mismo lenguaje que el catálogo de Master Snacks:
// tarjetas blancas sobre la trama amarilla, borde negro grueso y Anton en
// los rótulos.

export const CARD = "nb-soft bg-snow";

export const LABEL = "font-condensed uppercase tracking-[0.1em] text-xs text-night-soft";

// text-sm alcanza en el panel: se usa en computadora, no en el celular de
// un almacenero como el pedido del catálogo.
export const FIELD =
  "w-full min-h-[42px] px-3 bg-snow text-night text-sm font-medium border-2 border-night outline-none transition-shadow duration-150 placeholder:text-night-faint/70 focus:[box-shadow:3px_3px_0_var(--color-night)]";

export const FIELD_SM =
  "min-h-[38px] px-2.5 bg-snow text-night text-sm border-2 border-night outline-none transition-shadow duration-150 placeholder:text-night-faint/70 focus:[box-shadow:2px_2px_0_var(--color-night)]";

// Encabezado de tabla sobre fila bg-night.
export const TH = "text-left px-4 py-3 font-condensed font-normal uppercase tracking-[0.1em] text-xs text-gold";

export const chip = active =>
  `inline-flex items-center min-h-[34px] px-3 font-condensed uppercase tracking-[0.06em] text-xs border-2 border-night cursor-pointer transition-colors ${
    active ? "bg-night text-gold" : "bg-snow text-night hover:bg-snow-2"
  }`;

// Fondos claros con texto oscuro del mismo matiz, todos por encima de 7:1.
export const TONES = {
  gold: "bg-gold text-night",
  green: "bg-[#c8f0cf] text-[#14532d]",
  blue: "bg-[#d6e6ff] text-[#1e3a8a]",
  red: "bg-[#ffd9cc] text-[#8a1c03]",
  snow: "bg-snow-2 text-night-soft",
};

export const PILL =
  "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border-2 border-night whitespace-nowrap";

export const CODE = "font-mono text-[0.92em] px-1 bg-snow-2 border border-night/30 text-night";

// Rojo oscuro para errores: pasa 4.5:1 también sobre snow-2.
export const ERROR_TEXT = "text-sm font-semibold text-[#a32004]";

// Aviso de error arriba de una página del panel (pedidos, productos, config).
export const ALERT = "px-4 py-3 border-[3px] border-night bg-[#ffd9cc] text-[#8a1c03] text-sm font-semibold";
