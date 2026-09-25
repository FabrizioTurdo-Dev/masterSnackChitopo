import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Factory, Users, Sparkles, ArrowDown } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import { prefersReducedMotion } from "../../lib/useLenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HITOS = [
  {
    icon: Users,
    title: "Tres socios, una idea",
    text: "Nos conocimos en el rubro de los snacks y nos cansamos de ver siempre lo mismo en la góndola.",
  },
  {
    icon: Factory,
    title: "Fábrica propia en La Pintana",
    text: "Producimos nosotros mismos, con resolución sanitaria al día. Nada de terceros ni humo.",
    link: { href: "#fabrica", label: "Mírala por dentro" },
  },
  {
    icon: Sparkles,
    title: "Recién arrancando",
    text: "Seis meses en la calle con Chitopo: dos sabores a la venta y tres en camino. Esto está partiendo no más.",
  },
];

export default function Historia() {
  const sticker = useRef(null);

  // El sticker de Master Snacks se pega en la esquina de la cita cuando
  // aparece: llega grande y torcido, y asienta con rebote.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      sticker.current,
      { autoAlpha: 0, scale: 1.6, rotate: -20 },
      {
        autoAlpha: 1,
        scale: 1,
        rotate: 8,
        duration: 0.5,
        delay: 0.15,
        ease: "back.out(2)",
        scrollTrigger: { trigger: sticker.current, start: "top 92%", once: true },
      }
    );
  });

  return (
    <Section
      id="nosotros"
      title={
        <>
          Somos los nuevos
          <br />
          del barrio
        </>
      }
      intro="Esto partió como cualquier idea de amigos en una junta: tres locos con hartas ganas y cero plata de multinacional. Hoy tenemos un galpón en La Pintana y una máquina que no para; cada producto lo armamos con nuestras propias manos. El precio lo pensamos pa' ti, no pa' que se lo lleve una corporación. Puras ganas de que pruebes lo que hacemos, cachái."
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6"
      >
        {HITOS.map(({ icon: Icon, title, text, link }) => (
          <article
            key={title}
            className="nb-soft bg-snow p-6 flex flex-col gap-3"
          >
            <span className="grid place-items-center size-12 bg-gold border-[3px] border-night" aria-hidden="true">
              <Icon size={24} className="text-night" />
            </span>
            <h3 className="font-title uppercase text-xl sm:text-2xl text-night m-0 leading-tight">
              {title}
            </h3>
            <p className="text-night-soft text-sm leading-relaxed m-0">{text}</p>
            {link && (
              <a
                href={link.href}
                className="mt-auto inline-flex items-center gap-1.5 min-h-[44px] font-condensed uppercase tracking-[0.08em] text-sm text-night hover:text-electric underline decoration-electric decoration-[3px] underline-offset-4"
              >
                {link.label}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            )}
          </article>
        ))}
      </Reveal>

      <Reveal className="mt-10">
        <blockquote className="nb halftone-electric text-snow p-6 sm:p-10 m-0 -rotate-1">
          <p className="font-condensed uppercase text-2xl sm:text-4xl leading-[1.05] m-0">
            “Si lo hacemos nosotros, tiene que quedar bueno de verdad.”
          </p>
          <div className="flex items-end justify-between gap-4 mt-4">
            <cite className="block font-sans text-sm not-italic opacity-90">
              — El equipo de Master Snacks
            </cite>
            {/* Sobresale de la esquina de la tarjeta, como un sticker pegado
                encima. La inclinación va inline porque la anima GSAP. Gira y
                escala desde abajo a la derecha: desde el centro, el estado
                inicial agrandado se salía de la pantalla en mobile. Entre sm
                y lg el margen de la página es de 24px y no alcanza para todo
                el vuelo a la derecha: se pasaba del borde y ensanchaba la
                página en tablet. */}
            <span
              ref={sticker}
              className="block shrink-0 origin-bottom-right -mb-12 sm:-mb-20 -mr-5 sm:-mr-10 lg:-mr-14"
              style={{ transform: "rotate(8deg)" }}
            >
              {/* Troquelado: el logo sin troquel se pierde sobre el azul. */}
              <MasterSnacksLogo
                variant="sticker"
                alt=""
                className="h-20 sm:h-28 w-auto transition-transform duration-300 hover:scale-105 hover:-rotate-6"
              />
            </span>
          </div>
        </blockquote>
      </Reveal>
    </Section>
  );
}
