// Tabla nutricional del producto. Los valores vienen del arte del empaque.

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
      <p className="text-xs text-faint italic">
        Tabla nutricional en preparación — este producto todavía no sale a la venta.
      </p>
    );
  }

  const rows = ROWS.filter(r => nutrition.per100g?.[r.key] !== undefined);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-baseline justify-between px-3 py-2 bg-surface-2 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Información nutricional
        </span>
        <span className="text-[10px] text-faint tabular-nums">
          Porción {nutrition.serving}
          {nutrition.portions ? ` · ${nutrition.portions} por envase` : ""}
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-faint">
            <th className="text-left font-semibold px-3 py-1.5">Por 100 g</th>
            <th className="text-right font-semibold px-3 py-1.5">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-t border-border-soft">
              <td className="px-3 py-1.5 text-text">{r.label}</td>
              <td className="px-3 py-1.5 text-right text-muted tabular-nums">
                {nutrition.per100g[r.key]} {r.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
