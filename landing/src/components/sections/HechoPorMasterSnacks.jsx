import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import { BrandIsland } from "../../lib/brand";
import { useBurst } from "../../lib/burst";
import { COMPANY } from "../../data/brands";
import { HOME_URL } from "../../lib/urls";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Franja de /chitopo/ que presenta a la empresa: una isla con la identidad
// de Master Snacks dentro de la página de Chitopo. Lleva a la home, donde
// están la historia y la fábrica.
export default function HechoPorMasterSnacks() {
  const root = useRef(null);
  const fire = useBurst();

  // El logo llega como sticker: grande y torcido, se pega con rebote y al
  // golpear saltan chitopos, que es lo que sale de esa fábrica.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sticker = root.current.querySelector(".hp-sticker");
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } })
          .from(".hp-fade", { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power3.out" })
          .fromTo(
            sticker,
            { autoAlpha: 0, scale: 1.8, rotate: -28 },
            { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.45, ease: "power4.in" },
            0.1
          )
          .add(() => {
            const r = sticker.getBoundingClientRect();
            fire(r.left + r.width / 2, r.top + r.height / 2, "var(--color-gold)");
          })
          .to(sticker, { scale: 0.92, duration: 0.07, ease: "power1.out" })
          .to(sticker, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    },
    { scope: root }
  );

  return (
    <BrandIsland
      brand="mastersnacks"
      as="section"
      id="quien-lo-hace"
      ref={root}
      className="relative scroll-mt-20 overflow-hidden halftone-electric text-snow border-y-[3px] border-night"
    >
      <div className="contenedor py-14 sm:py-20 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center">
        {/* La inclinación va inline porque la anima GSAP. */}
        <div
          className="hp-sticker justify-self-center md:justify-self-start"
          style={{ transform: "rotate(-6deg)" }}
        >
          <MasterSnacksLogo
            variant="sticker"
            alt={COMPANY.name}
            className="w-40 sm:w-56 lg:w-64 h-auto"
          />
        </div>

        <div>
          <p className="hp-fade font-condensed uppercase tracking-[0.22em] text-gold text-xs sm:text-sm mb-3 before:content-['★'] before:mr-2">
            Quién lo hace
          </p>
          <h2 className="hp-fade hero-title title-on-electric font-title uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.92] m-0">
            Chitopo lo hace
            <br />
            Master Snacks
          </h2>
          <p className="hp-fade text-snow/90 text-base sm:text-lg leading-relaxed mt-5 max-w-2xl">
            Somos tres socios con fábrica propia en La Pintana. Chitopo es nuestra marca de
            horneados: el suflé sale de nuestra máquina, agarra sabor en nuestro bombo y cae a
            la bolsa ahí mismo. Y ya estamos preparando lo que viene.
          </p>

          <div className="hp-fade mt-8 flex flex-col sm:flex-row gap-3">
            <Button href={`${HOME_URL}#fabrica`} variant="gold">
              Mira la fábrica
              <ArrowRight size={20} aria-hidden="true" />
            </Button>
            <Button href={HOME_URL} variant="secondary">
              Conoce {COMPANY.name}
            </Button>
          </div>
        </div>
      </div>
    </BrandIsland>
  );
}
