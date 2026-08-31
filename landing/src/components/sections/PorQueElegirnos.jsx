import { Flame, MapPin, Handshake, Truck, TrendingUp, Wheat } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";

const RAZONES = [
  {
    icon: Flame,
    title: "Horneado, no frito",
    text: "Todo el crunch, con harta menos grasa que un snack frito.",
  },
  {
    icon: MapPin,
    title: "Hecho en Chile",
    text: "Producción propia en La Pintana, con proveedores de acá.",
  },
  {
    icon: Wheat,
    title: "Libre de gluten",
    text: "Los suflés y el maní vienen sin gluten, declarado en el empaque.",
  },
  {
    icon: Handshake,
    title: "Trato directo",
    text: "Hablás con nosotros, no con un call center. Cero vueltas.",
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
      eyebrow="Por qué Chitopo"
      title="Por qué nos vas a elegir"
    >
      <Reveal
        stagger
        grid
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {RAZONES.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="nb-soft bg-surface p-5 flex items-start gap-4"
          >
            <span
              className="shrink-0 grid place-items-center size-11 bg-accent text-bg"
              aria-hidden="true"
            >
              <Icon size={22} />
            </span>
            <div>
              <h3 className="font-condensed uppercase text-lg sm:text-xl text-text m-0 leading-tight">
                {title}
              </h3>
              <p className="text-muted text-sm leading-relaxed m-0 mt-1.5">{text}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </Section>
  );
}
