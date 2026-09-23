import Logo from "./Logo";
import { brandOf } from "../../data/brands";

// Sello con el logo de la marca de un producto. Cada marca nueva suma acá
// su logo; mientras no tenga uno, sale su nombre en letra de rótulo.
const LOGOS = {
  chitopo: Logo,
};

export default function BrandMark({ brand, height = 22, className = "" }) {
  const b = brandOf(brand);
  const Mark = LOGOS[b.id];

  return (
    <span className={`inline-flex items-center ${className}`} title={`Marca ${b.name}`}>
      {Mark ? (
        <Mark height={height} />
      ) : (
        <span className="font-condensed uppercase tracking-[0.08em] text-sm leading-none">{b.name}</span>
      )}
    </span>
  );
}
