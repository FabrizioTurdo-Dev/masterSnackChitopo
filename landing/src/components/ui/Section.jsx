import { useTone } from "../../lib/brand";

const TONES = {
  chitopo: {
    eyebrow: "text-ink before:text-fire",
    title: "text-ink",
    intro: "text-ink-soft",
  },
  mastersnacks: {
    eyebrow: "text-night before:text-electric",
    title: "text-night",
    intro: "text-night-soft",
  },
};

// Envoltorio estándar de sección: ancho máximo, padding y encabezado opcional.
export default function Section({
  id,
  eyebrow,
  title,
  intro,
  className = "",
  innerClassName = "",
  children,
}) {
  const t = useTone(TONES);

  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-16 sm:py-24 lg:py-32 ${className}`}
    >
      <div className={`contenedor ${innerClassName}`}>
        {(eyebrow || title) && (
          <div className="mb-10 sm:mb-14">
            {eyebrow && (
              <p className={`font-condensed uppercase tracking-[0.22em] text-xs sm:text-sm mb-3 before:content-['★'] before:mr-2 ${t.eyebrow}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className={`font-title uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.92] m-0 ${t.title}`}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={`text-base sm:text-lg leading-relaxed mt-5 max-w-2xl ${t.intro}`}>
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
