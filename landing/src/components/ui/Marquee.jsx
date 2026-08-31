// Cinta infinita. Duplica los items para que el loop no tenga corte visible.
export default function Marquee({ items, duration = 30, className = "" }) {
  const loop = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden border-y-[3px] border-accent bg-accent text-bg py-3 ${className}`}
      aria-hidden="true"
    >
      <div
        className="marquee-track flex w-max items-center gap-8 whitespace-nowrap"
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="font-condensed uppercase text-xl sm:text-3xl tracking-[0.04em] flex items-center gap-8"
          >
            {item}
            <span className="text-bg/50">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
