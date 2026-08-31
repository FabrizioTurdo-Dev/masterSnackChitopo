export default function Input({ label, id, className = "", ...props }) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-[11px] font-bold text-muted uppercase tracking-[0.05em]">{label}</label>}
      <input
        id={inputId}
        {...props}
        className={`w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm font-medium outline-none transition-colors duration-200 placeholder:text-faint focus:border-[#d4a853] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${className}`}
      />
    </div>
  );
}
