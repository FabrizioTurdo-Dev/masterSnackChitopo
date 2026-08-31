const STYLES = {
  pendiente:  "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  enviado:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  cancelado:  "bg-red-500/10 text-red-400 border-red-500/30",
  activo:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  oculto:     "bg-surface-2 text-faint border-border",
  bajo:       "bg-red-500/10 text-red-400 border-red-500/30",
  alerta:     "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export default function Badge({ status, children }) {
  const style = STYLES[status] || STYLES.pendiente;
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${style}`}>
      {children || status}
    </span>
  );
}
