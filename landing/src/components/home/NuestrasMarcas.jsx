import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, MessageCircle, Lock } from "lucide-react";
import Section from "../ui/Section";
import Button from "../ui/Button";
import Logo from "../brand/Logo";
import { BrandIsland } from "../../lib/brand";
import { useBurstOnHover } from "../../lib/useBurstOnHover";
import { prefersReducedMotion } from "../../lib/useLenis";
import { brandUrl } from "../../lib/urls";
import { CHITOPO, COMPANY } from "../../data/brands";
import { whatsappWith } from "../../data/store";
import PRODUCTS from "../../data/products";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Las tres bolsas que asoman en la tarjeta de Chitopo, en abanico.
const BOLSAS = ["sufle-queso", "sufle-papa", "tocino-merken"].map((slug) =>
  PRODUCTS.find((p) => p.slug === slug)
);
const ABANICO = [
  { rotate: -12, x: -32, y: 10 },
  { rotate: 2, x: 0, y: -8 },
  { rotate: 14, x: 32, y: 12 },
];

function Bolsa({ p }) {
  const img = (
    <img
      src={p.image}
      width={p.imageSize[0]}
      height={p.imageSize[1]}
      alt=""
      loading="lazy"
      decoding="async"
      className="block w-full h-auto"
    />
  );
  return p.bag === "flat" ? <div className="bag-flat">{img}</div> : img;
}

// Tarjeta de Chitopo: una isla con su identidad (dorado con damero, café y
// rojo) dentro de la home. Al pasar el mouse las bolsas se abren y saltan
// chitopos; toda la tarjeta lleva a /chitopo/.
function ChitopoCard() {
  const card = useRef(null);
  const hover = useRef(null);
  const { ref: burstRef, handlers } = useBurstOnHover("var(--color-fire)");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const bags = gsap.utils.toArray(".mc-bag", card.current);
      hover.current = gsap
        .timeline({ paused: true, defaults: { duration: 0.45, ease: "back.out(2)" } })
        // La apertura se queda dentro de su columna: más ancho tapa el texto.
        .to(bags[0], { rotate: -22, x: -56, y: -4 }, 0)
        .to(bags[1], { rotate: 0, y: -26, scale: 1.06 }, 0)
        .to(bags[2], { rotate: 24, x: 56, y: 0 }, 0)
        .to(".mc-arrow", { x: 4, y: -4, duration: 0.3, ease: "power2.out" }, 0);
    },
    { scope: card }
  );

  const enter = (e) => {
    handlers.onPointerEnter(e);
    hover.current?.play();
  };
  const leave = (e) => {
    handlers.onPointerLeave(e);
    hover.current?.reverse();
  };

  return (
    <BrandIsland
      brand="chitopo"
      as="a"
      href={brandUrl(CHITOPO)}
      ref={(el) => {
        card.current = el;
        burstRef.current = el;
      }}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerDown={handlers.onPointerDown}
      onFocus={() => hover.current?.play()}
      onBlur={() => hover.current?.reverse()}
      aria-label={`${CHITOPO.name}, nuestra marca de ${CHITOPO.descriptor.toLowerCase()}: ver su página`}
      className="mc-card brand-surface nb relative flex flex-col sm:flex-row gap-6 overflow-hidden p-6 sm:p-8 no-underline min-h-[26rem]"
    >
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <Logo height={52} />
          <span className="shrink-0 bg-fire text-cream border-[3px] border-ink px-3 py-1 font-condensed uppercase tracking-[0.1em] text-sm -rotate-3 shadow-[3px_3px_0_var(--color-ink)]">
            {CHITOPO.descriptor}
          </span>
        </div>

        <p className="hero-title font-title uppercase text-4xl sm:text-5xl leading-[0.92] mt-6 mb-0">
          {CHITOPO.tagline}
        </p>
        <p className="text-ink-soft text-base leading-relaxed mt-4 max-w-sm m-0">
          {CHITOPO.blurb} Hoy en la calle: queso y papa. En camino: frutos del bosque, maní y
          tocino merkén.
        </p>

        <span className="mt-auto pt-8 inline-flex items-center gap-2 self-start bg-fire text-cream border-[3px] border-ink px-5 min-h-[48px] font-condensed uppercase tracking-[0.06em] text-lg shadow-[4px_4px_0_var(--color-ink)]">
          Conoce {CHITOPO.name}
          <ArrowUpRight size={20} className="mc-arrow" aria-hidden="true" />
        </span>
      </div>

      <div className="relative sm:w-[46%] h-60 sm:h-auto shrink-0" aria-hidden="true">
        {BOLSAS.map((p, i) => (
          <div
            key={p.slug}
            className="mc-bag absolute left-1/2 top-1/2 w-28 sm:w-32 lg:w-36 -ml-14 sm:-ml-16 lg:-ml-18 -mt-24 sm:-mt-28 drop-shadow-[6px_8px_0_var(--color-ink)]"
            style={{
              transform: `translate(${ABANICO[i].x}px, ${ABANICO[i].y}px) rotate(${ABANICO[i].rotate}deg)`,
              zIndex: i === 1 ? 2 : 1,
            }}
          >
            <Bolsa p={p} />
          </div>
        ))}
      </div>
    </BrandIsland>
  );
}

// Próximos lanzamientos: todavía bajo llave. La bolsa misteriosa se mece
// sola y el botón deja pedir aviso por WhatsApp.
function ProximamenteCard() {
  const card = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".mc-mystery",
        { rotate: -6 },
        { rotate: 6, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      gsap.fromTo(
        ".mc-q",
        { scale: 0.92 },
        { scale: 1.08, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
    },
    { scope: card }
  );

  return (
    <article
      ref={card}
      className="on-dark nb halftone-night text-snow relative flex flex-col gap-6 overflow-hidden p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="bg-gold text-night border-[3px] border-night px-3 py-1 font-condensed uppercase tracking-[0.1em] text-sm rotate-2">
          Próximamente
        </span>
        <span className="inline-flex items-center gap-1.5 font-condensed uppercase tracking-[0.14em] text-xs text-snow/70">
          <Lock size={14} aria-hidden="true" /> Bajo llave
        </span>
      </div>

      {/* El título va en su propia fila: "lanzamientos" no entra al lado de
          la bolsa en teléfono ni en la columna angosta de computador. */}
      <h3 className="font-title uppercase text-3xl sm:text-4xl leading-[0.95] text-snow m-0">
        Próximos
        <br />
        lanzamientos
      </h3>

      <div className="flex items-center gap-6">
        <div className="mc-mystery shrink-0 w-24 sm:w-28 drop-shadow-[5px_7px_0_var(--color-gold)]" aria-hidden="true">
          <div className="bag-flat halftone-electric aspect-[800/1361] grid place-items-center">
            <span className="mc-q hero-title title-on-electric font-title text-6xl sm:text-7xl leading-none">
              ?
            </span>
          </div>
        </div>
        <p className="text-snow/80 text-sm sm:text-base leading-relaxed m-0">
          Estamos preparando productos nuevos. Nombres, sabores y bolsas: todavía bajo llave.
        </p>
      </div>

      <Button
        href={whatsappWith(
          `¡Hola! Quiero saber de los próximos lanzamientos de ${COMPANY.name}. Mi local es: `
        )}
        target="_blank"
        rel="noopener noreferrer"
        variant="gold"
        className="mt-auto w-full"
      >
        <MessageCircle size={20} aria-hidden="true" />
        Avísame cuando salgan
      </Button>
    </article>
  );
}

export default function NuestrasMarcas() {
  return (
    <Section
      id="marcas"
      eyebrow="Nuestras marcas"
      title={
        <>
          Una misma fábrica,
          <br />
          un universo de sabores
        </>
      }
      intro={`En ${COMPANY.name} no solo producimos, sino que creamos experiencias únicas para cada antojo. Desarrollamos cada línea de productos con su propia identidad, marca y personalidad. Encendimos los motores con los horneados y extruidos de Chitopo. Nuestro equipo ya está cocinando las próximas innovaciones que se sumarán a la familia.`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-stretch">
        <ChitopoCard />
        <ProximamenteCard />
      </div>
    </Section>
  );
}
