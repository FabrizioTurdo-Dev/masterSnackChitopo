import { useId } from "react";

// Sello circular con texto que gira lento alrededor de una estrella, como
// los stickers del packaging. Decorativo: lo que dice ya está en la página.
// El posicionamiento (relative/absolute) lo pone quien lo usa: si viene
// también de acá, las dos clases pelean y gana la que Tailwind ordene después.
export default function StampBadge({
  text = "Horneado · No frito · Hecho en Chile · ",
  className = "",
}) {
  const id = useId();

  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <circle cx="60" cy="60" r="57" fill="var(--color-snow)" stroke="var(--color-night)" strokeWidth="3" />
        <circle cx="60" cy="60" r="30" fill="var(--color-electric)" stroke="var(--color-night)" strokeWidth="3" />
        <text
          x="60"
          y="71"
          textAnchor="middle"
          fontSize="32"
          fill="var(--color-gold)"
          stroke="var(--color-night)"
          strokeWidth="1.5"
          paintOrder="stroke"
        >
          ★
        </text>
      </svg>

      {/* El giro va en un svg aparte: rotar un <g> por CSS obliga a pelear
          con transform-box, un elemento HTML gira sobre su centro solo. */}
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 w-full h-full">
        <defs>
          <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text
          fontFamily="Anton, sans-serif"
          fontSize="12.5"
          letterSpacing="1.2"
          fill="var(--color-night)"
          style={{ textTransform: "uppercase" }}
        >
          <textPath href={`#${id}`} textLength="274" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
