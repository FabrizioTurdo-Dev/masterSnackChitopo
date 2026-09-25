import { useId } from "react";
import bandera from "../../assets/bandera-chile.webp";

// Sello circular con texto que gira lento alrededor de la bandera de Chile,
// como los stickers del packaging. Decorativo: lo que dice ya está en la
// página. El posicionamiento (relative/absolute) lo pone quien lo usa: si
// viene también de acá, las dos clases pelean y gana la que Tailwind ordene
// después. Mismo sello que el de la landing: solo gira el texto.
export default function StampBadge({
  text = "Horneado · No frito · Hecho en Chile · ",
  className = "",
}) {
  const id = useId();
  // Radio de la línea base del texto: centrado en el anillo entre el borde
  // de afuera (55.5) y el círculo interior (38). El largo acompaña al radio
  // para que el texto cierre la vuelta.
  const r = 41.3;
  const textLength = Math.round(2 * Math.PI * r * 0.991);

  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <circle cx="60" cy="60" r="57" fill="var(--color-snow)" stroke="var(--color-night)" strokeWidth="3" />
        <circle cx="60" cy="60" r="37" fill="none" stroke="var(--color-night)" strokeWidth="2" />
      </svg>

      {/* El filo de tinta separa el cuarto blanco de la bandera del papel. */}
      <div className="absolute inset-[23%] grid place-items-center">
        <img
          src={bandera}
          width="240"
          height="240"
          alt=""
          decoding="async"
          className="block w-full h-auto rounded-full ring-2 ring-night"
        />
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
          fill="var(--color-night)"
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
