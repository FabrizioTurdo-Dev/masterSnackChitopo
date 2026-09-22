import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/useLenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Contador para que cada onda tenga su propio id de trazado: dos en la
// misma página no pueden compartirlo.
let seq = 0;

// Una onda de segmentos cuadráticos: cada medio largo de onda sube o baja.
// Empieza y termina fuera de pantalla para que los recortes de letras de
// los extremos nunca se vean.
function trazado(ancho, alto, largoOnda, amplitud) {
  const cy = alto / 2;
  const medio = largoOnda / 2;
  let x = -largoOnda;
  let d = `M ${x} ${cy}`;
  let arriba = true;
  while (x < ancho + largoOnda) {
    const y = arriba ? cy - amplitud : cy + amplitud;
    d += ` Q ${x + medio / 2} ${y} ${x + medio} ${cy}`;
    x += medio;
    arriba = !arriba;
  }
  return d;
}

// Texto de fondo que corre en loop infinito sobre una onda. Las letras se
// inclinan siguiendo la curva, como una cinta.
//
// El tamaño de letra sale del `className` (se hereda al <text>), así el
// llamador lo puede dar con un clamp. `duration` son los segundos que
// tarda en pasar una repetición, así la velocidad no cambia cuando hacen
// falta más copias para cubrir la pantalla.
export default function WaveMarquee({
  text,
  separator = " · ",
  duration = 26,
  // Fracciones del tamaño de letra y del ancho de la caja.
  amplitude = 0.32,
  wavelength = 0.9,
  color = "var(--color-gold)",
  fillOpacity = 0.06,
  strokeOpacity = 0.3,
  strokeWidth = 2,
  className = "",
}) {
  const root = useRef(null);
  const textEl = useRef(null);
  const pathEl = useRef(null);
  const offset = useRef(null);
  const id = useRef(`onda-${++seq}`).current;

  const [reps, setReps] = useState(2);
  const [geo, setGeo] = useState({ ancho: 0, fs: 0, unidad: 0 });
  const repsRef = useRef(reps);
  repsRef.current = reps;

  const unidadTexto = `${text}${separator}`;
  const amplitudPx = geo.fs * amplitude;
  const alto = geo.fs ? geo.fs * 1.25 + amplitudPx * 2 : 0;
  // La onda tiene que ser más larga que una repetición: el texto arranca
  // corrido hacia la izquierda y esa parte del trazado queda fuera de
  // cuadro, tapando el corte.
  const largoOnda = Math.max(geo.ancho * wavelength, geo.unidad * 1.15, 420);
  const d = geo.ancho && geo.fs ? trazado(geo.ancho, alto, largoOnda, amplitudPx) : "";

  const medir = useRef(() => {});
  medir.current = () => {
    const box = root.current;
    const t = textEl.current;
    if (!box || !t) return;

    const ancho = box.clientWidth;
    const fs = parseFloat(getComputedStyle(t).fontSize) || 0;
    if (!ancho || !fs) return;

    // Largo de una repetición: todas miden lo mismo, así que alcanza con
    // dividir el total por las que hay puestas.
    const unidad = t.getComputedTextLength() / repsRef.current;
    setGeo((prev) =>
      prev.ancho === ancho && prev.fs === fs && Math.abs(prev.unidad - unidad) < 0.5
        ? prev
        : { ancho, fs, unidad }
    );

    const largo = pathEl.current?.getTotalLength();
    if (!largo || !unidad) return;
    // Una repetición de más: mientras una sale por la izquierda, tiene
    // que seguir habiendo texto hasta el final del trazado.
    const necesarias = Math.ceil(largo / unidad) + 1;
    if (necesarias !== repsRef.current) setReps(necesarias);
  };

  // Se vuelve a medir en cada pasada porque el trazado recién existe
  // cuando ya hay ancho, y el largo de una repetición recién se sabe con
  // el texto puesto: se acomoda en dos o tres vueltas y ahí queda quieto.
  useLayoutEffect(() => {
    medir.current();
  });

  useLayoutEffect(() => {
    const box = root.current;
    if (!box) return;
    const ro = new ResizeObserver(() => medir.current());
    ro.observe(box);
    // Anton cambia el ancho del texto recién cuando termina de cargar.
    document.fonts?.ready.then(() => medir.current());
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !geo.unidad || !offset.current) return;

      // Al correr el texto una repetición exacta el dibujo vuelve a ser el
      // mismo, así que el loop no tiene costura.
      const loop = gsap.fromTo(
        offset.current,
        { attr: { startOffset: 0 } },
        { attr: { startOffset: -geo.unidad }, duration, ease: "none", repeat: -1 }
      );
      // Arranca "adelantada" muchas vueltas: con timeScale negativo, una
      // animación en su tiempo 0 se detiene en vez de seguir girando.
      loop.totalTime(loop.duration() * 1000);

      // Con el scroll acelera y toma la dirección en que se mueve la
      // página; al soltar, vuelve sola a su ritmo.
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loop.paused(!self.isActive),
        onUpdate: (self) => {
          const dir = self.direction < 0 ? -1 : 1;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          loop.timeScale(dir * boost);
          gsap.to(loop, { timeScale: 1, duration: 0.9, ease: "power2.out", overwrite: true });
        },
      });
      loop.paused(!st.isActive);
    },
    { scope: root, dependencies: [geo.unidad, duration], revertOnUpdate: true }
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <svg width="100%" height={alto} className="block overflow-visible">
        <defs>
          <path ref={pathEl} id={id} d={d} fill="none" />
        </defs>
        <text
          ref={textEl}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          paintOrder="stroke"
          className="uppercase"
        >
          <textPath ref={offset} href={`#${id}`} startOffset={0}>
            {unidadTexto.repeat(reps)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
