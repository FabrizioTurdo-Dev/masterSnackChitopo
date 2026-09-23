import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import StampBadge from "./brand/StampBadge";
import BrandMark from "./brand/BrandMark";
import { STORE_CONFIG, FLAVOR_ACCENTS } from "../data/store";
import { BRANDS } from "../data/brands";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(SplitText, useGSAP);

const STEPS = [
  { title: "Elige", text: "Sabor y formato: caja, display o unidad." },
  {
    title: `Suma ${STORE_CONFIG.minOrderUnits}`,
    text: "Es el pedido mínimo. Puedes mezclar sabores.",
  },
  { title: "Envía", text: "Te respondemos por WhatsApp con precio y despacho." },
];

// Chitopos sueltos alrededor del titular, en huecos que quedan libres en
// cada ancho: los de computadora sobre el eyebrow y entre el titular y el
// sello; el de teléfono (`mobile`), debajo del sello. x/y en % de la sección.
// Las formas son los <symbol> de ChitopoShapes que monta BurstProvider.
const STICKERS = [
  { x: 64, y: 11, size: 50, shape: "a", rot: -14, color: FLAVOR_ACCENTS.queso },
  { x: 79, y: 30, size: 40, shape: "b", rot: 30, color: FLAVOR_ACCENTS.papa },
  { x: 90, y: 31, size: 42, shape: "c", rot: -40, color: FLAVOR_ACCENTS.mani, mobile: true },
];

// Afiche corto: el catálogo es una herramienta y la gente viene a pedir,
// así que el titular y los pasos entran en una pantalla junto con el
// comienzo de la grilla.
export default function CatalogHero() {
  const root = useRef(null);
  const title = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Mismo gesto que el titular de la landing: letras que suben desde
      // una máscara por palabra.
      SplitText.create(title.current, {
        type: "words,chars",
        wordsClass: "hw",
        mask: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 130,
            rotation: 10,
            duration: 0.8,
            delay: 0.1,
            stagger: 0.03,
            ease: "expo.out",
          }),
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".ch-fade", { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.07 }, 0.25)
        .from(".ch-step", { autoAlpha: 0, y: 26, rotation: -2, duration: 0.6, stagger: 0.08, ease: "back.out(1.6)" }, 0.45)
        .from(".ch-stamp", { scale: 0, rotation: -120, duration: 0.8, ease: "back.out(1.6)" }, 0.5)
        .from(".ch-sticker-bob", { scale: 0, duration: 0.55, stagger: { each: 0.06, from: "random" }, ease: "back.out(2)" }, 0.6);

      gsap.utils.toArray(".ch-sticker-bob").forEach((el) => {
        gsap.to(el, {
          y: gsap.utils.random(-14, 14),
          x: gsap.utils.random(-8, 8),
          rotation: gsap.utils.random(-25, 25),
          duration: gsap.utils.random(2.4, 4),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.2),
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {STICKERS.map((s, i) => (
          <span
            key={i}
            className={`chitopo-sticker absolute -translate-x-1/2 -translate-y-1/2 ${s.mobile ? "sm:hidden" : "hidden lg:block"}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, color: s.color }}
          >
            <span className="ch-sticker-bob block w-full h-full">
              <svg viewBox="0 0 40 40" className="block w-full h-full overflow-visible" style={{ transform: `rotate(${s.rot}deg)` }}>
                <use href={`#chitopo-${s.shape}`} />
              </svg>
            </span>
          </span>
        ))}
      </div>

      <StampBadge
        text="Pedido mínimo 100 u · Cerramos por WhatsApp · "
        className="ch-stamp absolute right-3 top-4 w-20 sm:right-6 sm:top-6 sm:w-28 lg:right-8 lg:top-8 lg:w-36 z-10"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-12 sm:pb-14">
        <p className="ch-fade font-condensed uppercase tracking-[0.12em] sm:tracking-[0.22em] text-night text-xs sm:text-sm m-0 mb-3 pr-24 sm:pr-0 before:content-['★'] before:text-electric before:mr-2">
          Para almacenes, distribuidoras y locales de barrio
        </p>

        <h1
          ref={title}
          className="hero-title font-title uppercase m-0 leading-[0.9] text-[clamp(2.9rem,12vw,4.5rem)] sm:text-[clamp(2.8rem,6.4vw,5.1rem)]"
        >
          Catálogo <br className="sm:hidden" />
          mayorista
        </h1>

        <div className="mt-4 sm:mt-8 grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] xl:items-end">
          <div className="max-w-xl">
            <p className="ch-fade text-night-soft text-base sm:text-lg leading-relaxed font-medium m-0">
              Snacks de nuestra fábrica en La Pintana, al por mayor. Arma tu pedido acá y lo
              cerramos por WhatsApp: precio, pago y despacho, al tiro.
            </p>
            <ul className="ch-fade list-none p-0 m-0 mt-4 flex flex-wrap items-center gap-2" aria-label="Marcas del catálogo">
              {BRANDS.map(b => (
                <li
                  key={b.id}
                  className="inline-flex items-center gap-2 bg-snow border-2 border-night pl-2 pr-2.5 py-1 shadow-[3px_3px_0_var(--color-night)]"
                >
                  <BrandMark brand={b.id} height={20} />
                  <span className="font-condensed uppercase tracking-[0.1em] text-[11px] text-night-soft">
                    {b.descriptor}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ol className="grid grid-cols-3 gap-2 sm:gap-3 list-none p-0 m-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="ch-step nb-soft bg-snow p-2 sm:p-3 flex flex-col sm:flex-row items-start gap-1.5 sm:gap-3">
                <span
                  className="shrink-0 grid place-items-center size-7 sm:size-9 bg-electric text-snow border-2 border-night font-condensed text-base sm:text-xl leading-none"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-condensed uppercase text-base sm:text-lg leading-tight text-night">
                    {s.title}
                  </span>
                  <span className="hidden sm:block text-xs text-night-soft leading-snug mt-0.5">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
