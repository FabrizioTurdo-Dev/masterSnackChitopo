// Sello de advertencia nutricional del Ministerio de Salud (Ley 20.606).
// Se dibuja como octógono negro con borde blanco, según el reglamento.

const LABELS = {
  "alto-en-calorias": ["ALTO EN", "CALORÍAS"],
  "alto-en-sodio": ["ALTO EN", "SODIO"],
  "alto-en-azucares": ["ALTO EN", "AZÚCARES"],
  "alto-en-grasas-saturadas": ["ALTO EN", "GRASAS SAT."],
};

export default function SelloAdvertencia({ seal, size = 56 }) {
  const lines = LABELS[seal];
  if (!lines) return null;

  const label = lines.join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Sello de advertencia: ${label}`}
      className="shrink-0"
    >
      <title>{label}</title>
      <polygon
        points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"
        fill="#000"
        stroke="#fff"
        strokeWidth="5"
      />
      <text
        textAnchor="middle"
        fill="#fff"
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight="700"
      >
        <tspan x="50" y="42" fontSize="15">
          {lines[0]}
        </tspan>
        <tspan x="50" y="60" fontSize="15">
          {lines[1]}
        </tspan>
        <tspan x="50" y="80" fontSize="9" fontWeight="400">
          Ministerio
        </tspan>
        <tspan x="50" y="89" fontSize="9" fontWeight="400">
          de Salud
        </tspan>
      </text>
    </svg>
  );
}
