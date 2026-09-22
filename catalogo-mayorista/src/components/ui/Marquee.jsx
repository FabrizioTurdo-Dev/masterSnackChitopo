import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TONES = {
  electric: { band: "bg-electric text-snow", star: "text-gold" },
  night: { band: "bg-night text-gold", star: "text-electric-light" },
};

// Cinta infinita. El track tiene dos grupos idénticos y se corre -50%: al
// terminar, el segundo grupo quedó justo donde empezó el primero. Para que
// nunca se vea el final, cada grupo repite los items las veces necesarias
// hasta cubrir el ancho de la cinta; con pocas frases cortas y una pantalla
// ancha, duplicar una sola vez dejaba un hueco.
//
// `duration` son los segundos que tarda en pasar un juego de items, así la
// velocidad no cambia cuando hay más repeticiones.
export default function Marquee({
  items,
  duration = 30,
  reverse = false,
  tilted = false,
  tone = "electric",
  className = "",
}) {
  const root = useRef(null);
  const track = useRef(null);
  const group = useRef(null);
  const [reps, setReps] = useState(2);
  const repsRef = useRef(reps);
  repsRef.current = reps;

  useLayoutEffect(() => {
    const box = root.current;
    const g = group.current;
    if (!box || !g) return;

    const measure = () => {
      const setWidth = g.scrollWidth / repsRef.current;
      if (!setWidth) return;
      const next = Math.max(1, Math.ceil(box.clientWidth / setWidth));
      if (next !== repsRef.current) setReps(next);
    };

    // El grupo también se observa: cuando termina de cargar Anton las
    // frases cambian de ancho sin que cambie la ventana.
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(g);
    measure();
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const dir = reverse ? -1 : 1;
      const loop = gsap.fromTo(
        track.current,
        { xPercent: 0 },
        { xPercent: -50, duration: duration * reps, ease: "none", repeat: -1 }
      );
      // Arranca "adelantada" muchas vueltas: con timeScale negativo, una
      // animación en su tiempo 0 se detiene en vez de seguir girando.
      loop.totalTime(loop.duration() * 1000);
      loop.timeScale(dir);

      // Con el scroll acelera y toma la dirección en que se mueve la página;
      // al soltar, vuelve sola a su ritmo.
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loop.paused(!self.isActive),
        onUpdate: (self) => {
          const d = dir * (self.direction < 0 ? -1 : 1);
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          loop.timeScale(d * boost);
          gsap.to(loop, { timeScale: d, duration: 0.9, ease: "power2.out", overwrite: true });
        },
      });
      loop.paused(!st.isActive);
    },
    { scope: root, dependencies: [reps, duration, reverse], revertOnUpdate: true }
  );

  const { band, star } = TONES[tone] ?? TONES.electric;

  return (
    <div
      ref={root}
      className={`relative overflow-hidden border-y-[3px] border-night py-3 ${band} ${
        tilted ? "z-20 -mx-[5%] -my-5 sm:-my-7 -rotate-2 shadow-[0_6px_0_var(--color-night)]" : ""
      } ${className}`}
      aria-hidden="true"
    >
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} ref={copy === 0 ? group : undefined} className="flex shrink-0 items-center">
            {Array.from({ length: reps }, (_, r) =>
              items.map((item, i) => (
                // Espacio con padding y no con gap: así cada grupo mide
                // exactamente la mitad del track y el loop no da un saltito.
                <span
                  key={`${r}-${i}`}
                  className="font-condensed uppercase text-xl sm:text-3xl tracking-[0.04em] whitespace-nowrap flex items-center gap-8 pr-8"
                >
                  {item}
                  <span className={star}>★</span>
                </span>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
