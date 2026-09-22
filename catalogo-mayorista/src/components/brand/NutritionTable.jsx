// Tabla nutricional del producto. Los valores vienen del arte del empaque;
// el estilo imita la etiqueta impresa: borde grueso y encabezado negro.

const ROWS = [
  { key: "energia", label: "Energía", unit: "kcal" },
  { key: "proteinas", label: "Proteínas", unit: "g" },
  { key: "grasas", label: "Grasas totales", unit: "g" },
  { key: "hidratos", label: "Hidratos de carbono", unit: "g" },
  { key: "azucares", label: "Azúcares totales", unit: "g" },
  { key: "fibra", label: "Fibra dietética", unit: "g" },
  { key: "sodio", label: "Sodio", unit: "mg" },
];

export default function NutritionTable({ nutrition }) {
  if (!nutrition) {
    return (
      <p className="text-sm text-night-soft italic m-0">
        Tabla nutricional en preparación — este producto todavía no sale a la venta.
      </p>
    );
  }

  const rows = ROWS.filter(r => nutrition.per100g?.[r.key] !== undefined);

  return (
    <div className="border-[3px] border-night bg-snow">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2 bg-night text-snow">
        <span className="font-condensed uppercase tracking-[0.1em] text-sm">
          Información nutricional
        </span>
        <span className="text-[11px] text-snow/80 tabular-nums">
          Porción {nutrition.serving}
          {nutrition.portions ? ` · ${nutrition.portions} por envase` : ""}
        </span>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-[3px] border-night text-night">
            <th className="text-left font-bold px-3 py-1.5">Por 100 g</th>
            <th className="text-right font-bold px-3 py-1.5">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-t border-night/20 first:border-t-0">
              <td className="px-3 py-1.5 text-night">{r.label}</td>
              <td className="px-3 py-1.5 text-right text-night font-semibold tabular-nums">
                {nutrition.per100g[r.key]} {r.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
