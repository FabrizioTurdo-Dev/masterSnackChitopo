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
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 py-16 sm:py-24 lg:py-32 ${className}`}
    >
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${innerClassName}`}>
        {(eyebrow || title) && (
          <div className="mb-10 sm:mb-14">
            {eyebrow && (
              <p className="font-condensed uppercase tracking-[0.22em] text-ink text-xs sm:text-sm mb-3 before:content-['★'] before:text-fire before:mr-2">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-condensed uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.92] text-ink m-0">
                {title}
              </h2>
            )}
            {intro && (
              <p className="text-ink-soft text-base sm:text-lg leading-relaxed mt-5 max-w-2xl">
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
