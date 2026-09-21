// Mismas variantes que el Button de la landing, sin el efecto imán.
const VARIANTS = {
  primary: "bg-fire text-cream hover:bg-[#c42904]",
  ghost:   "bg-cream text-ink hover:bg-cream-2",
  danger:  "bg-[#ffd9cc] text-[#8a1c03] hover:bg-[#ffc9b8]",
  success: "bg-green text-[#06300f] hover:brightness-105",
  accent:  "bg-gold text-ink hover:bg-[#ffcf3d]",
};

export default function Btn({ children, variant = "primary", small, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`${small ? "min-h-[34px] px-3 text-xs" : "min-h-[44px] px-5 text-sm"} inline-flex items-center justify-center gap-1.5 font-condensed uppercase tracking-[0.06em] border-2 border-ink [box-shadow:3px_3px_0_var(--color-ink)] nb-press cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
