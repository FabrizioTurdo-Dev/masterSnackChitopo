import { useId } from "react";
import { useTone } from "../../lib/brand";
import bandera from "../../assets/bandera-chile.webp";

// Papel del sello según la marca. Las líneas siguen la tinta de la marca
// (--line).
const PAPER = {
  chitopo: "var(--color-cream)",
  mastersnacks: "var(--color-snow)",
};

// Sello circular con texto que gira lento alrededor de un centro fijo, como
// los stickers del packaging. Decorativo: lo que dice ya está en la página.
// El posicionamiento (relative/absolute) lo pone quien lo usa: si viene
// también de acá, las dos clases pelean y gana la que Tailwind ordene después.
// El centro lleva la bandera de Chile; con `children` va eso en su lugar (el
// sello de la fábrica lleva el logo de Master Snacks). Solo gira el texto.
export default function StampBadge({
  text = "Horneado · No frito · Hecho en Chile · ",
  className = "",
  children,
}) {
  const id = useId();
  const paper = useTone(PAPER);
  // Radio de la línea base del texto: centrado en el anillo entre el borde
  // de afuera (55.5) y el círculo interior (38). Las mayúsculas de Anton
  // miden 0.875 em, ~11 a este tamaño, y sobran ~3.3 por lado. El largo
  // acompaña al radio para que el texto cierre la vuelta.
  const r = 41.3;
  const textLength = Math.round(2 * Math.PI * r * 0.991);

  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <circle cx="60" cy="60" r="57" fill={paper} stroke="var(--line)" strokeWidth="3" />
        <circle cx="60" cy="60" r="37" fill="none" stroke="var(--line)" strokeWidth="2" />
      </svg>

      <div className="absolute inset-[23%] grid place-items-center">
        {children ?? (
          // El filo de tinta separa el cuarto blanco de la bandera del papel.
          <img
            src={bandera}
            width="240"
            height="240"
            alt=""
            decoding="async"
            className="block w-full h-auto rounded-full ring-2 ring-[var(--line)]"
          />
        )}
      </div>

      {/* El giro va en un svg aparte: rotar un <g> por CSS obliga a pelear
          con transform-box, un elemento HTML gira sobre su centro solo. */}
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 w-full h-full">
        <defs>
          <path id={id} d={`M60,60 m-${r},0 a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 -${2 * r},0`} />
        </defs>
        <text
          fontFamily="Anton, sans-serif"
          fontSize="12.5"
          letterSpacing="1.2"
          fill="var(--line)"
          style={{ textTransform: "uppercase" }}
        >
          <textPath href={`#${id}`} textLength={textLength} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
