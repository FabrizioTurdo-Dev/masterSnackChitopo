import { flavorAccent, flavorAccentText } from "../../data/store";

// Fondo a pantalla completa: un campo por sabor que se cruza al cambiar.
// Donde el archivo es el arte del envase a sangre, se usa desenfocado como
// textura; donde es una foto sobre blanco, queda el color del sabor solo.
export function FlavorBackground({ products, active }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {products.map((p, i) => (
        <div
          key={p.id}
          className="flavor-field"
          data-active={i === active}
          style={{ backgroundColor: flavorAccent(p.flavor) }}
        >
          {p.artFullBleed && (
            <img src={p.image} alt="" aria-hidden="true" className="flavor-art" />
          )}
        </div>
      ))}
      <div className="flavor-scrim" />
    </div>
  );
}

// Las bolsas, en un riel horizontal. En teléfono se desliza con el dedo
// (scroll nativo con snap); en computadora lo mueve GSAP con el scroll.
export function FlavorFrame({ products, frameRef, trackRef, panelRefs, ...rest }) {
  return (
    <div
      ref={frameRef}
      tabIndex={0}
      role="group"
      aria-label="Sabores de Chitopo"
      className="flavor-frame scrollbar-none w-full max-w-[460px] aspect-[3/4]"
      data-lenis-prevent
      {...rest}
    >
      <div ref={trackRef} className="flavor-track">
        {products.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              if (panelRefs) panelRefs.current[i] = el;
            }}
            className="flavor-panel relative"
            data-panel={i}
          >
            {/* El nombre del sabor viaja detrás de su bolsa */}
            <span
              className="absolute inset-x-0 top-[6%] text-center font-condensed uppercase leading-none pointer-events-none select-none text-[clamp(2.5rem,7vw,4.5rem)]"
              style={{ color: flavorAccentText(p.flavor), opacity: 0.9 }}
              aria-hidden="true"
            >
              {p.short}
            </span>

            <img
              src={p.image}
              alt={`Bolsa de ${p.name} Chitopo de ${p.grams} gramos`}
              width="520"
              height="700"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="relative w-[86%] h-[86%] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
            />

            {p.status === "proximamente" && (
              <span className="absolute bottom-[4%] font-condensed uppercase tracking-[0.1em] text-[11px] px-2.5 py-1 bg-bg/85 text-accent border-2 border-accent -rotate-[6deg]">
                Próximamente
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
