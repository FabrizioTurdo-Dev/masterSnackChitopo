import { useEffect, useRef } from "react";
import { flavorAccent } from "../../data/store";

// Selector de los 5 sabores. Dice cuáles hay, en cuál estamos y, cuando
// pasan solos, cuánto falta para el siguiente.
// `auto` = { cycle, paused, duration } mientras hay autoplay; null si no.
export default function FlavorChips({ products, active, onSelect, auto = null }) {
  const list = useRef(null);

  // En teléfono la fila no entra entera: cuando el sabor cambia solo o por
  // deslizar la bolsa, el chip activo tiene que quedar a la vista. Se mueve
  // solo la fila; scrollIntoView arrastraría también la página.
  useEffect(() => {
    const ul = list.current;
    const li = ul?.children[active];
    if (!li || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({
      left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    // El padding deja lugar a la sombra dura: el scroll horizontal la cortaría.
    <ul
      ref={list}
      className="relative flex items-center gap-2 list-none m-0 p-0 pr-2 pb-1.5 overflow-x-auto scrollbar-none min-w-0"
    >
      {products.map((p, i) => {
        const on = i === active;
        return (
          <li key={p.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={on}
              aria-label={`${p.name}${p.status === "proximamente" ? " (próximamente)" : ""}`}
              className={`relative overflow-hidden inline-flex items-center gap-2 min-h-[44px] px-3.5 border-[3px] border-ink font-condensed uppercase tracking-[0.08em] text-sm sm:text-base cursor-pointer transition-[background-color,color,transform,box-shadow] duration-200 ${
                on
                  ? "bg-ink text-cream shadow-[3px_3px_0_var(--color-cream)]"
                  : "bg-cream text-ink shadow-[3px_3px_0_var(--color-ink)] hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`size-3 rounded-full border-2 ${on ? "border-cream" : "border-ink"}`}
                style={{ backgroundColor: flavorAccent(p.flavor) }}
                aria-hidden="true"
              />
              {p.short}
              {/* La barra se llena mientras dura el sabor. La key reinicia
                  la animación en cada ciclo; la pausa la congela. */}
              {on && auto && (
                <span
                  key={auto.cycle}
                  className="chip-fill absolute left-0 bottom-0 h-[4px] w-full bg-gold"
                  style={{
                    animationDuration: `${auto.duration}s`,
                    animationPlayState: auto.paused ? "paused" : "running",
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
