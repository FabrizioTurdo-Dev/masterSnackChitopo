// Clases del panel con el mismo lenguaje que la landing y el catálogo:
// crema sobre el damero, borde café grueso y Anton en los rótulos.

export const CARD = "nb-soft bg-cream";

export const LABEL = "font-condensed uppercase tracking-[0.1em] text-xs text-ink-soft";

// text-sm alcanza en el panel: se usa en computadora, no en el celular de
// un almacenero como el pedido del catálogo.
export const FIELD =
  "w-full min-h-[42px] px-3 bg-cream text-ink text-sm font-medium border-2 border-ink outline-none transition-shadow duration-150 placeholder:text-ink-faint/70 focus:[box-shadow:3px_3px_0_var(--color-ink)]";

export const FIELD_SM =
  "min-h-[38px] px-2.5 bg-cream text-ink text-sm border-2 border-ink outline-none transition-shadow duration-150 placeholder:text-ink-faint/70 focus:[box-shadow:2px_2px_0_var(--color-ink)]";

// Encabezado de tabla sobre fila bg-ink.
export const TH = "text-left px-4 py-3 font-condensed font-normal uppercase tracking-[0.1em] text-xs text-gold";

export const chip = active =>
  `inline-flex items-center min-h-[34px] px-3 font-condensed uppercase tracking-[0.06em] text-xs border-2 border-ink cursor-pointer transition-colors ${
    active ? "bg-ink text-gold" : "bg-cream text-ink hover:bg-cream-2"
  }`;

// Fondos claros con texto oscuro del mismo matiz, todos por encima de 7:1.
export const TONES = {
  gold: "bg-gold text-ink",
  green: "bg-[#c8f0cf] text-[#14532d]",
  blue: "bg-[#d6e6ff] text-[#1e3a8a]",
  red: "bg-[#ffd9cc] text-[#8a1c03]",
  cream: "bg-cream-2 text-ink-soft",
};

export const PILL =
  "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border-2 border-ink whitespace-nowrap";

export const CODE = "font-mono text-[0.92em] px-1 bg-cream-2 border border-ink/30 text-ink";

// Rojo oscuro para errores: el `fire` de marca no llega a 4.5:1 sobre crema-2.
export const ERROR_TEXT = "text-sm font-semibold text-[#a32004]";
