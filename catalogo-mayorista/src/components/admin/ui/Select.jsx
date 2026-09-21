import { FIELD, LABEL } from "./styles";

export default function Select({ label, id, children, className = "", ...props }) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className={LABEL}>{label}</label>}
      <select id={selectId} {...props} className={`${FIELD} cursor-pointer ${className}`}>
        {children}
      </select>
    </div>
  );
}
