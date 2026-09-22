import { useId } from "react";
import { useTone } from "../../lib/brand";

// Papel del sello y centro de la estrella según la marca. Las líneas siguen
// la tinta de la marca (--line).
const TONES = {
  chitopo: { paper: "var(--color-cream)", center: "var(--color-fire)" },
  mastersnacks: { paper: "var(--color-snow)", center: "var(--color-electric)" },
};

// Sello circular con texto que gira lento alrededor de una estrella, como
// los stickers del packaging. Decorativo: lo que dice ya está en la página.
// El posicionamiento (relative/absolute) lo pone quien lo usa: si viene
// también de acá, las dos clases pelean y gana la que Tailwind ordene después.
// Con `children`, el centro queda del color del papel y lo que venga va ahí en vez de la
// estrella (el sello de la fábrica lleva el logo de Master Snacks). El centro
// no gira: solo gira el texto.
export default function StampBadge({
  text = "Horneado · No frito · Hecho en Chile · ",
  className = "",
  children,
}) {
  const id = useId();
  const t = useTone(TONES);
  // Radio de la línea base del texto. Con logo va centrado en el anillo
  // entre el borde de afuera (55.5) y el círculo interior (38): las
  // mayúsculas de Anton miden 0.875 em, ~11 a este tamaño, y sobran ~3.3
  // por lado. El largo acompaña al radio para que el texto cierre la vuelta.
  const r = children ? 41.3 : 44;
  const textLength = Math.round(2 * Math.PI * r * 0.991);

  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <circle cx="60" cy="60" r="57" fill={t.paper} stroke="var(--line)" strokeWidth="3" />
        {children ? (
          <circle cx="60" cy="60" r="37" fill="none" stroke="var(--line)" strokeWidth="2" />
        ) : (
          <>
            <circle cx="60" cy="60" r="30" fill={t.center} stroke="var(--line)" strokeWidth="3" />
            <text
              x="60"
              y="71"
              textAnchor="middle"
              fontSize="32"
              fill="var(--color-gold)"
              stroke="var(--line)"
              strokeWidth="1.5"
              paintOrder="stroke"
            >
              ★
            </text>
          </>
        )}
      </svg>

      {children && (
        <div className="absolute inset-[23%] grid place-items-center">{children}</div>
      )}

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
