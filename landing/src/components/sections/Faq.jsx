import { ChevronDown } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import { preguntasDe } from "../../data/faq";
import { useTone } from "../../lib/brand";

const TONES = {
  chitopo: { card: "bg-cream", q: "text-ink", icon: "text-fire", a: "text-ink-soft" },
  mastersnacks: { card: "bg-snow", q: "text-night", icon: "text-electric", a: "text-night-soft" },
};

// `scope`: "empresa" en la home, el id de la marca en su página (ver data/faq.js).
export default function Faq({ scope = "empresa" }) {
  const t = useTone(TONES);

  return (
    <Section
      id="faq"
      // Sin padding propio: el aire ya lo ponen el bloque del catálogo de
      // arriba y Contacto de abajo, y sumado quedaba un hueco muy grande.
      className="pt-0 sm:pt-0 lg:pt-0 pb-0 sm:pb-0 lg:pb-0"
      title="Lo que siempre nos preguntan"
      intro="Si tienes un almacén, distribuidora o local de barrio, esto es lo que necesitas saber."
    >
      <Reveal stagger className="flex flex-col gap-3 max-w-4xl">
        {preguntasDe(scope).map(({ q, a }) => (
          <details key={q} className={`group nb-soft ${t.card}`}>
            <summary className={`flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-condensed uppercase text-lg sm:text-xl ${t.q}`}>
              {q}
              <ChevronDown
                size={22}
                className={`shrink-0 transition-transform duration-300 group-open:rotate-180 ${t.icon}`}
                aria-hidden="true"
              />
            </summary>
            <p className={`text-sm sm:text-base leading-relaxed px-5 pb-5 m-0 ${t.a}`}>
              {a}
            </p>
          </details>
        ))}
      </Reveal>
    </Section>
  );
}
