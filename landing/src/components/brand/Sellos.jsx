import Reveal from "../ui/Reveal";
import { useTone } from "../../lib/brand";

// Sellos que trae el envase y que nos separan de la competencia. Los
// íconos salen de shared/marca/sellos/ (ver .sello en base.css) y toman el
// color del texto donde aparecen. Espejo de catalogo-mayorista.
export const SELLOS = [
  { id: "sin-gluten", label: "Sin gluten", text: "Nuestros suflés no llevan gluten, tal como lo indica el empaque." },
  { id: "no-frito", label: "No frito", text: "Horneados: todo el crunch, con harto menos grasa." },
  { id: "no-gmo", label: "No GMO", text: "Hechos sin ingredientes transgénicos." },
];

export function Sello({ id, className = "" }) {
  return <span className={`sello sello-${id} ${className}`} aria-hidden="true" />;
}

const TONES = {
  chitopo: {
    band: "bg-gold border-ink",
    badge: "bg-cream text-ink",
    title: "text-ink",
    text: "text-ink-soft",
  },
  mastersnacks: {
    band: "bg-snow border-night",
    badge: "bg-gold text-night",
    title: "text-night",
    text: "text-night-soft",
  },
};

// Franja fija bajo la cinta del hero, en las tres páginas: los tres sellos
// grandes, cada uno en su círculo con borde y sombra dura, con el nombre y
// una línea.
export function SellosFranja() {
  const t = useTone(TONES);
  return (
    <section aria-label="Sellos de nuestros productos" className={`border-b-[3px] py-10 sm:py-14 ${t.band}`}>
      <Reveal stagger grid as="ul" className="contenedor list-none m-0 grid grid-cols-3 gap-3 sm:gap-8">
        {SELLOS.map(({ id, label, text }) => (
          <li key={id} className="flex flex-col items-center text-center gap-3 sm:gap-4">
            <span
              className={`grid place-items-center size-20 sm:size-28 lg:size-32 rounded-full border-[3px] border-(--line) shadow-[4px_4px_0_var(--line)] ${t.badge}`}
            >
              <Sello id={id} className="size-[78%]" />
            </span>
            <span className={`font-title uppercase text-lg sm:text-2xl lg:text-3xl leading-none ${t.title}`}>
              {label}
            </span>
            <span className={`hidden sm:block text-sm lg:text-base leading-snug max-w-[26ch] ${t.text}`}>{text}</span>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
