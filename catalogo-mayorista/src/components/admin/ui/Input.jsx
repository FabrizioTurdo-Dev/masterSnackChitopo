import { FIELD, LABEL } from "./styles";

export default function Input({ label, id, className = "", ...props }) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className={LABEL}>{label}</label>}
      <input id={inputId} {...props} className={`${FIELD} ${className}`} />
    </div>
  );
}
