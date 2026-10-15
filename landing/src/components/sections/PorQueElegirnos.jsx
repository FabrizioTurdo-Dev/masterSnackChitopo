import { MapPin, Handshake, Truck, TrendingUp } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";

// Sin gluten y no frito no van acá: ya están en la franja de sellos que
// queda bajo el hero.
const RAZONES = [
  {
    icon: MapPin,
    title: "Hecho en Chile",
    text: "Producción propia en La Pintana, con proveedores de acá.",
  },
  {
    icon: Handshake,
    title: "Trato directo",
    text: "Hablas con nosotros, no con un call center. Cero vueltas.",
  },
  {
    icon: TrendingUp,
    title: "Rota en el local",
    text: "Formato y precio pensados para el almacén de barrio.",
  },
  {
    icon: Truck,
    title: "Despacho en la RM",
    text: "Coordinamos la entrega por WhatsApp y listo.",
  },
];

export default function PorQueElegirnos() {
  return (
    <Section
      id="por-que"
      title="Por qué nos vas a elegir"
      className="dots-cream border-b-[3px] border-ink"
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {RAZONES.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="nb-soft bg-gold p-5 flex items-start gap-4"
          >
            <span
              className="shrink-0 grid place-items-center size-11 bg-fire text-cream border-[3px] border-ink"
              aria-hidden="true"
            >
              <Icon size={22} />
            </span>
            <div>
              <h3 className="font-title uppercase text-lg sm:text-xl text-ink m-0 leading-tight">
                {title}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed m-0 mt-1.5">{text}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </Section>
  );
}
