import { flavorAccentText } from "../../data/store";

// Previsualización de los 5 sabores: dice cuáles hay, en cuál estamos y
// —sobre todo— que hay que seguir scrolleando.
export default function FlavorDots({ products, active, onSelect }) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <span className="font-condensed text-xl sm:text-2xl tabular-nums leading-none shrink-0">
        <span style={{ color: flavorAccentText(products[active].flavor) }}>
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="text-faint">/{String(products.length).padStart(2, "0")}</span>
      </span>

      <ul className="flex items-center gap-2 sm:gap-3 list-none m-0 p-0">
        {products.map((p, i) => {
          const on = i === active;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Ver ${p.name}`}
                aria-current={on ? "true" : undefined}
                className="group flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer min-h-[44px]"
              >
                <span
                  className="block h-[3px] transition-all duration-300"
                  style={{
                    width: on ? 34 : 16,
                    backgroundColor: on ? flavorAccentText(p.flavor) : "var(--color-surface-3)",
                  }}
                />
                <span
                  className={`font-condensed uppercase tracking-[0.1em] text-[11px] sm:text-xs transition-colors duration-300 ${
                    on ? "text-text" : "text-faint group-hover:text-muted"
                  }`}
                >
                  {p.short}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
