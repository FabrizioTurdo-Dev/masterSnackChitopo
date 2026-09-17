import { Factory, Users, Sparkles, ArrowDown } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";

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
    text: "Seis meses en la calle y ya vamos por el cuarto sabor. Esto está partiendo no más.",
  },
];

export default function Historia() {
  return (
    <Section
      id="nosotros"
      eyebrow="Quiénes somos"
      title={
        <>
          Somos los nuevos
          <br />
          del barrio
        </>
      }
      intro="Esto partió como cualquier idea de amigos en una junta: 3 locos con hartas ganas y cero plata de multinacional. Hoy tenemos un galpón en La Pintana, una máquina que no para, y cada producto armado con nuestras propias manos. El precio lo pensamos pa' ti, no pa' que se lo lleve una corporación. Puras ganas de que pruebes lo que hacemos, cachái."
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6"
      >
        {HITOS.map(({ icon: Icon, title, text, link }) => (
          <article
            key={title}
            className="nb-soft bg-cream p-6 flex flex-col gap-3"
          >
            <span className="grid place-items-center size-12 bg-gold border-[3px] border-ink" aria-hidden="true">
              <Icon size={24} className="text-ink" />
            </span>
            <h3 className="font-condensed uppercase text-xl sm:text-2xl text-ink m-0 leading-tight">
              {title}
            </h3>
            <p className="text-ink-soft text-sm leading-relaxed m-0">{text}</p>
            {link && (
              <a
                href={link.href}
                className="mt-auto inline-flex items-center gap-1.5 min-h-[44px] font-condensed uppercase tracking-[0.08em] text-sm text-ink hover:text-fire underline decoration-fire decoration-[3px] underline-offset-4"
              >
                {link.label}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            )}
          </article>
        ))}
      </Reveal>

      <Reveal className="mt-10">
        <blockquote className="nb bg-fire text-cream p-6 sm:p-10 m-0 -rotate-1">
          <p className="font-condensed uppercase text-2xl sm:text-4xl leading-[1.05] m-0">
            “Si lo hacemos nosotros, tiene que quedar bueno de verdad.”
          </p>
          <cite className="block font-sans text-sm not-italic mt-4 opacity-90">
            — El equipo de Master Snacks
          </cite>
        </blockquote>
      </Reveal>
    </Section>
  );
}
