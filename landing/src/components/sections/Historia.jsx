import { Factory, Users, Sparkles } from "lucide-react";
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
      intro="Chitopo es de Master Snacks, una pyme chilena de La Pintana. No somos una multinacional con departamento de marketing: somos un galpón, una máquina y unas ganas tremendas de que pruebes lo que hacemos."
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6"
      >
        {HITOS.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="nb-soft bg-surface p-6 flex flex-col gap-3"
          >
            <Icon size={30} className="text-accent" aria-hidden="true" />
            <h3 className="font-condensed uppercase text-xl sm:text-2xl text-text m-0 leading-tight">
              {title}
            </h3>
            <p className="text-muted text-sm leading-relaxed m-0">{text}</p>
          </article>
        ))}
      </Reveal>

      <Reveal className="mt-10">
        <blockquote className="nb bg-accent text-bg p-6 sm:p-10 m-0">
          <p className="font-condensed uppercase text-2xl sm:text-4xl leading-[1.05] m-0">
            “Si lo hacemos nosotros, tiene que quedar bueno de verdad.”
          </p>
          <cite className="block font-sans text-sm not-italic mt-4 opacity-80">
            — El equipo de Master Snacks
          </cite>
        </blockquote>
      </Reveal>
    </Section>
  );
}
