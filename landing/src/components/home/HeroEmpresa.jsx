import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowRight, ArrowDown } from "lucide-react";
import Button from "../ui/Button";
import StampBadge from "../brand/StampBadge";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import { useBurst } from "../../lib/burst";
import { useBurstOnHover } from "../../lib/useBurstOnHover";
import { CATALOGO_URL } from "../../lib/urls";
import { COMPANY } from "../../data/brands";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Estrellitas de cómic que flotan alrededor del logo: [left, top, tamaño, capa].
const ESTRELLAS = [
  ["6%", "18%", 34, "front"],
  ["84%", "10%", 26, "back"],
  ["90%", "62%", 40, "front"],
  ["2%", "70%", 24, "back"],
  ["48%", "92%", 30, "back"],
];

function Estrella({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="he-floater block">
      <path d="M20 2l5.3 11.6L38 15.2l-9.5 8.6 2.6 12.6L20 30.2 8.9 36.4l2.6-12.6L2 15.2l12.7-1.6z" />
    </svg>
  );
}

// Hero de la home: afiche de cómic con el logo de la empresa. Sin pin: el
// logo se estampa al entrar, flota en reposo, se inclina hacia el cursor y
// cada capa se va a su velocidad con el scroll.
export default function HeroEmpresa() {
  const root = useRef(null);
  const headline = useRef(null);
  const logo = useRef(null);
  const tilt = useRef(null);
  const fire = useBurst();
  const { ref: burstRef, handlers } = useBurstOnHover("var(--color-gold)");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(hover: hover) and (min-width: 1024px)",
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions;
          if (!motion) return;

          // ── Entrada ───────────────────────────────────────────────
          const split = SplitText.create(headline.current, {
            type: "words,chars",
            wordsClass: "hw",
            mask: "words",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 130,
                rotation: 10,
                duration: 0.85,
                delay: 0.2,
                stagger: 0.03,
                ease: "expo.out",
              }),
          });

          const sticker = logo.current;
          // Solo transform en el logo: animar su opacidad atrasa el LCP.
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".he-rays", { scale: 0, rotation: -90, duration: 1.2, ease: "expo.out" }, 0)
            .fromTo(
              sticker,
              { scale: 2.3, rotation: -34, yPercent: -30 },
              { scale: 1, rotation: -5, yPercent: 0, duration: 0.55, ease: "power4.in" },
              0.15
            )
            .addLabel("golpe")
            .add(() => {
              const r = sticker.getBoundingClientRect();
              fire(r.left + r.width / 2, r.top + r.height * 0.55, "var(--color-gold)");
            }, "golpe")
            .to(sticker, { scale: 0.9, duration: 0.07, ease: "power1.out" }, "golpe")
            .to(sticker, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" })
            .fromTo(root.current, { y: 0 }, { y: 7, duration: 0.06, yoyo: true, repeat: 1, ease: "power1.inOut" }, "golpe")
            .from(".he-star", { scale: 0, duration: 0.6, stagger: { each: 0.06, from: "random" }, ease: "back.out(2)" }, "golpe")
            .from(".he-stamp", { scale: 0, rotation: -120, duration: 0.8, ease: "back.out(1.6)" }, "golpe+=0.05")
            .from(".he-fade", { autoAlpha: 0, y: 22, duration: 0.6, stagger: 0.08 }, 0.55);

          // ── En reposo ─────────────────────────────────────────────
          gsap.to(".he-rays", { rotation: "+=360", duration: 90, ease: "none", repeat: -1 });
          gsap.fromTo(
            ".he-bob",
            { y: 6 },
            { y: -12, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 }
          );
          gsap.utils.toArray(".he-star").forEach((el) => {
            gsap.to(el, {
              y: gsap.utils.random(-18, 18),
              rotation: gsap.utils.random(-40, 40),
              duration: gsap.utils.random(2.2, 4),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: gsap.utils.random(0, 1.2),
            });
          });

          // ── Salida con scroll, sin pin ────────────────────────────
          gsap
            .timeline({
              scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
            })
            .to(headline.current, { yPercent: -25, ease: "none" }, 0)
            .to(".he-logo-anchor", { y: -90, rotation: 6, ease: "none" }, 0)
            .to(".he-rays-wrap", { scale: 1.35, ease: "none" }, 0)
            .to(".he-stars-front", { y: -200, ease: "none" }, 0)
            .to(".he-stars-back", { y: -60, ease: "none" }, 0);

          // ── Se inclina hacia el cursor (solo escritorio) ──────────
          if (desktop) {
            const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.6, ease: "power3.out" });
            const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.6, ease: "power3.out" });
            const onMove = (e) => {
              const r = root.current.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 22);
              rx(-((e.clientY - r.top) / r.height - 0.5) * 16);
            };
            const onLeave = () => {
              rx(0);
              ry(0);
            };
            root.current.addEventListener("pointermove", onMove);
            root.current.addEventListener("pointerleave", onLeave);
            return () => {
              root.current?.removeEventListener("pointermove", onMove);
              root.current?.removeEventListener("pointerleave", onLeave);
              split.revert();
            };
          }

          return () => split.revert();
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      id="inicio"
      ref={root}
      className="relative overflow-hidden halftone-electric text-snow border-b-[3px] border-night min-h-[100svh] flex flex-col"
    >
      <div className="relative z-10 contenedor flex-1 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-4 lg:gap-10 pt-20 sm:pt-24 pb-10 sm:pb-14">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="relative order-1 lg:order-2 grid place-items-center [perspective:1000px]">
          <div className="he-rays-wrap absolute inset-[-40%] sm:inset-[-30%] pointer-events-none" aria-hidden="true">
            <div className="he-rays absolute inset-0 rounded-full" />
          </div>

          <div className="he-stars-back absolute inset-0 pointer-events-none" aria-hidden="true">
            {ESTRELLAS.filter(([, , , c]) => c === "back").map(([left, top, size]) => (
              <span key={left + top} className="he-star absolute" style={{ left, top }}>
                <Estrella size={size} />
              </span>
            ))}
          </div>

          <div className="he-logo-anchor relative w-[min(64vw,300px)] sm:w-[min(58vw,420px)] lg:w-[min(40vw,540px)]">
            <div ref={tilt} className="[transform-style:preserve-3d]">
              <div className="he-bob">
                {/* La inclinación de base va inline porque la anima GSAP. */}
                <div
                  ref={(el) => {
                    logo.current = el;
                    burstRef.current = el;
                  }}
                  {...handlers}
                  style={{ transform: "rotate(-5deg)" }}
                  className="drop-shadow-[10px_12px_0_var(--color-night)]"
                >
                  <MasterSnacksLogo
                    variant="hd"
                    alt={COMPANY.name}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            <StampBadge
              text="Maestros del picoteo · Hecho en Chile · "
              className="he-stamp absolute w-20 sm:w-28 lg:w-32 -bottom-2 -left-4 sm:-left-10"
            />
          </div>

          <div className="he-stars-front absolute inset-0 pointer-events-none" aria-hidden="true">
            {ESTRELLAS.filter(([, , , c]) => c === "front").map(([left, top, size]) => (
              <span key={left + top} className="he-star absolute" style={{ left, top }}>
                <Estrella size={size} />
              </span>
            ))}
          </div>
        </div>

        {/* ── Texto ────────────────────────────────────────────────── */}
        <div className="relative order-2 lg:order-1 text-center lg:text-left">
          <p className="he-fade inline-block m-0 bg-gold text-night border-[3px] border-night px-3 py-1 font-condensed uppercase tracking-[0.2em] text-[11px] sm:text-xs shadow-[3px_3px_0_var(--color-night)] -rotate-2">
            Fábrica propia · La Pintana
          </p>

          <h1
            ref={headline}
            // "MAESTROS" tiene que entrar entero en su columna: en escritorio
            // la columna es ~47% del ancho, de ahí el 8.2vw.
            className="hero-title title-on-electric font-title uppercase text-[clamp(3rem,15vw,6.5rem)] lg:text-[min(8.2vw,8rem)] leading-[0.88] mt-5 mb-0"
          >
            Maestros
            <br />
            del picoteo
          </h1>

          <p className="he-fade text-snow text-base sm:text-lg lg:text-xl leading-relaxed mt-5 max-w-xl mx-auto lg:mx-0 font-medium">
            Somos {COMPANY.name}: tres socios con fábrica propia en La Pintana. Hacemos snacks
            para almacenes, distribuidoras y locales de barrio, y cada línea sale con su propia
            marca.
          </p>

          <div className="he-fade mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button href={CATALOGO_URL} target="_blank" rel="noopener noreferrer" variant="gold">
              Ver catálogo mayorista
              <ArrowRight size={20} aria-hidden="true" />
            </Button>
            <Button href="#marcas" variant="secondary">
              Conoce nuestras marcas
              <ArrowDown size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
