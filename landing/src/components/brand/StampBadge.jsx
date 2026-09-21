import { useId } from "react";

// Sello circular con texto que gira lento alrededor de una estrella, como
// los stickers del packaging. Decorativo: lo que dice ya está en la página.
// El posicionamiento (relative/absolute) lo pone quien lo usa: si viene
// también de acá, las dos clases pelean y gana la que Tailwind ordene después.
// Con `children`, el centro queda crema y lo que venga va ahí en vez de la
// estrella (el sello de la fábrica lleva el logo de Master Snacks). El centro
// no gira: solo gira el texto.
export default function StampBadge({
  text = "Horneado · No frito · Hecho en Chile · ",
  className = "",
  children,
}) {
  const id = useId();

  return (
    <div className={`aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <circle cx="60" cy="60" r="57" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="3" />
        {children ? (
          <circle cx="60" cy="60" r="37" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
        ) : (
          <>
            <circle cx="60" cy="60" r="30" fill="var(--color-fire)" stroke="var(--color-ink)" strokeWidth="3" />
            <text
              x="60"
              y="71"
              textAnchor="middle"
              fontSize="32"
              fill="var(--color-gold)"
              stroke="var(--color-ink)"
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
          <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text
          fontFamily="Anton, sans-serif"
          fontSize="12.5"
          letterSpacing="1.2"
          fill="var(--color-ink)"
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
