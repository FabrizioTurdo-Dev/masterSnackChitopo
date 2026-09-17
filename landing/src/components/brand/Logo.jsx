import logoUrl from "../../assets/logo-chitopo.png";
import { STORE_CONFIG } from "../../data/store";

// Logotipo de Chitopo con fondo transparente (lo genera `npm run media` en el
// catálogo). `height` en px; el ancho se ajusta solo.
export default function Logo({ height = 32, className = "", withTagline = false }) {
  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <img
        src={logoUrl}
        alt={STORE_CONFIG.name}
        style={{ height }}
        className="w-auto block"
        translate="no"
      />
      {withTagline && (
        <span className="font-condensed text-current text-xs tracking-[0.18em] uppercase mt-1">
          {STORE_CONFIG.tagline}
        </span>
      )}
    </span>
  );
}
