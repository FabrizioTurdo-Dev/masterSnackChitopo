import { createContext, useCallback, useContext, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./useLenis";
import ChitopoShapes from "../components/brand/ChitopoShapes";

const POOL = 18;
const COOLDOWN = 850; // ms mínimos entre estallidos, global

const BurstCtx = createContext(() => {});

/** Dispara el estallido: fire(x, y, colorDeSabor) en coords de viewport. */
export const useBurst = () => useContext(BurstCtx);

export function BurstProvider({ children }) {
  const layer = useRef(null);
  const origin = useRef(null);
  const nodes = useRef([]);
  const tl = useRef(null);
  const last = useRef(0);

  // Los valores al azar viven acá y se re-sortean antes de cada disparo.
  // El timeline los lee con valores función, así que con invalidate()
  // toma los nuevos sin reconstruirse.
  const seeds = useRef(
    Array.from({ length: POOL }, () => ({ x: 0, up: 0, down: 0, rot: 0, scale: 1 }))
  );

  const reroll = useCallback(() => {
    seeds.current.forEach((s) => {
      // Abanico hacia arriba y afuera, entre -155° y -25°.
      const ang = gsap.utils.random(-155, -25) * (Math.PI / 180);
      const power = gsap.utils.random(90, 230);
      s.x = Math.cos(ang) * power;
      s.up = Math.sin(ang) * power * 0.75;
      s.down = gsap.utils.random(220, 340);
      s.rot = gsap.utils.random(-620, 620);
      s.scale = gsap.utils.random(0.55, 1.25);
    });
  }, []);

  const build = useCallback(() => {
    const t = gsap.timeline({ paused: true });

    nodes.current.forEach((el, i) => {
      if (!el) return;
      const s = () => seeds.current[i];

      t.set(el, { x: 0, y: 0, rotation: 0, scale: 0, autoAlpha: 1 }, 0);

      // X: sale disparado y se va frenando, como si el aire lo resistiera.
      t.to(el, { x: () => s().x, duration: 1.05, ease: "power2.out" }, 0);

      // Y: subida corta y caída acelerada. Eso es lo que le da peso.
      t.to(el, { y: () => s().up, duration: 0.3, ease: "power2.out" }, 0).to(
        el,
        { y: () => s().down, duration: 0.85, ease: "power2.in" },
        0.3
      );

      // El giro no desacelera: el momento angular se conserva.
      t.to(el, { rotation: () => s().rot, duration: 1.15, ease: "none" }, 0);

      t.to(el, { scale: () => s().scale, duration: 0.22, ease: "back.out(2.4)" }, 0);

      // Recién se apaga al final, no durante todo el vuelo.
      t.to(el, { autoAlpha: 0, duration: 0.28, ease: "power1.in" }, 0.87);
    });

    return t;
  }, []);

  const fire = useCallback(
    (x, y, accent) => {
      if (prefersReducedMotion()) return;

      const now = performance.now();
      if (now - last.current < COOLDOWN) return;
      last.current = now;

      if (!tl.current) tl.current = build();

      if (accent) layer.current?.style.setProperty("--burst-accent", accent);
      gsap.set(origin.current, { x, y });

      reroll();
      // invalidate() es imprescindible: sin él, restart() reusa los valores
      // ya calculados y los 18 chitopos salen siempre igual.
      tl.current.invalidate().restart();
    },
    [build, reroll]
  );

  return (
    <BurstCtx.Provider value={fire}>
      {children}
      <div
        ref={layer}
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden="true"
      >
        <ChitopoShapes />
        <div ref={origin} className="absolute top-0 left-0 will-change-transform">
          {Array.from({ length: POOL }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                nodes.current[i] = el;
              }}
              className="burst-particle absolute -translate-x-1/2 -translate-y-1/2"
            >
              <svg width="34" height="34" viewBox="0 0 40 40">
                <use href={`#chitopo-${["a", "b", "c"][i % 3]}`} />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </BurstCtx.Provider>
  );
}
