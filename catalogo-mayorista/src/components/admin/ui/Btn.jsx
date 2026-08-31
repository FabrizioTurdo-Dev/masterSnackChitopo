const VARIANTS = {
  primary: "bg-accent text-bg hover:bg-accent-light",
  ghost:   "bg-transparent text-muted border border-border hover:border-muted hover:text-text",
  danger:  "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20",
  accent:  "bg-accent/10 text-accent border border-[#d4a853]/30 hover:bg-accent/20",
};

export default function Btn({ children, variant = "primary", small, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`${small ? "px-3 py-1.5 text-[12px]" : "px-5 py-2.5 text-sm"} rounded-xl font-bold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
