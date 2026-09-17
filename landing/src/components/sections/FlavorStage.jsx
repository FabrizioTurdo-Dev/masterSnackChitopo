// Piezas del hero: el fondo que se tiñe con cada sabor, los chitopos que
// flotan alrededor y la pila de bolsas.

// Fondo a pantalla completa. `base` tiene el color del sabor vigente y
// `wipe` se destapa encima con el color nuevo, en un círculo que nace de
// la bolsa; al terminar, base toma ese color y wipe vuelve a cerrarse.
export function HeroBackdrop({ baseRef, wipeRef, initial }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={baseRef} className="absolute inset-0" style={{ backgroundColor: initial }} />
      <div
        ref={wipeRef}
        className="absolute inset-0"
        style={{ clipPath: "circle(0% at 50% 50%)" }}
      />
      <div className="hero-damero" />
      {/* Foco de luz detrás de la bolsa */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_52%,rgb(255_255_255/0.3),transparent_70%)]" />
    </div>
  );
}

// x, y en % de la sección en computadora; `m` es [x, y] en teléfono, donde
// el afiche va en columna y no pueden caer sobre los botones. Sin `m`, en
// teléfono no se muestra. size en px de computadora (en teléfono, 60%).
// depth: 0 atrás (desenfocado), 1 al medio, 2 delante de la bolsa.
// Las formas son los <symbol> de ChitopoShapes, que ya están en la página
// por el estallido. Cuando lleguen las fotos recortadas de chitopos
// sueltos (ASSETS.md §2), el <svg> pasa a ser un <img>.
const FLOATERS = [
  { x: 7, y: 26, size: 46, depth: 0, shape: "b", rot: -20, m: [8, 14] },
  { x: 93, y: 20, size: 40, depth: 0, shape: "a", rot: 15, m: [92, 22] },
  { x: 16, y: 80, size: 38, depth: 0, shape: "c", rot: 30 },
  { x: 86, y: 70, size: 44, depth: 0, shape: "b", rot: 60 },
  { x: 27, y: 40, size: 62, depth: 1, shape: "b", rot: 25, m: [7, 54] },
  { x: 74, y: 44, size: 68, depth: 1, shape: "a", rot: -10, m: [91, 30] },
  { x: 63, y: 50, size: 92, depth: 2, shape: "b", rot: -35, m: [12, 38] },
  { x: 59, y: 80, size: 100, depth: 2, shape: "a", rot: 12, m: [88, 69] },
];

export function HeroFloaters({ layer }) {
  const front = layer === "front";
  const items = FLOATERS.filter((f) => (front ? f.depth === 2 : f.depth < 2));

  return (
    <div
      className={`hero-floaters-${layer} pointer-events-none absolute inset-0 ${front ? "z-20" : "z-0"}`}
      aria-hidden="true"
    >
      {items.map((f, i) => (
        <span
          key={i}
          data-depth={f.depth}
          className={`hero-floater absolute -translate-x-1/2 -translate-y-1/2 left-[var(--mx)] top-[var(--my)] lg:left-[var(--x)] lg:top-[var(--y)] w-[calc(var(--s)*0.6px)] lg:w-[calc(var(--s)*1px)] aspect-square ${
            f.m ? "" : "hidden lg:block"
          }`}
          style={{
            "--x": `${f.x}%`,
            "--y": `${f.y}%`,
            "--mx": `${(f.m ?? [f.x])[0]}%`,
            "--my": `${(f.m ?? [0, f.y])[1]}%`,
            "--s": f.size,
          }}
        >
          <span className="hero-floater-bob block w-full h-full">
            <svg
              viewBox="0 0 40 40"
              className={`block w-full h-full overflow-visible ${
                f.depth === 0 ? "blur-[2px] opacity-80" : ""
              }`}
              style={{ transform: `rotate(${f.rot}deg)` }}
            >
              <use href={`#chitopo-${f.shape}`} />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}

// Las 5 bolsas apiladas; solo la activa se ve. El arte plano ("flat") se
// arma como bolsa con CSS (ver .bag-flat); la recortada va tal cual.
export function BagStack({ products, itemRefs }) {
  return (
    <div className="absolute inset-0">
      {products.map((p, i) => {
        const [w, h] = p.imageSize;
        const img = (
          <img
            src={p.image}
            alt={`Bolsa de ${p.name} Chitopo de ${p.grams} gramos`}
            width={w}
            height={h}
            draggable={false}
            fetchPriority={i === 0 ? "high" : "low"}
            className="block h-full w-auto max-w-none select-none"
          />
        );
        return (
          <div
            key={p.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="bag-item absolute inset-0 flex items-center justify-center will-change-transform"
          >
            {p.bag === "flat" ? <div className="bag-flat h-full">{img}</div> : img}
          </div>
        );
      })}
    </div>
  );
}
