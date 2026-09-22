import { MessageCircle, Clock, MapPin, Truck } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { WHATSAPP_LINK, SELLER_PHONE_PRETTY } from "../../data/store";
import { COMPANY } from "../../data/brands";
import { useTone } from "../../lib/brand";

const DATOS = [
  { icon: Clock, label: COMPANY.schedule },
  { icon: Truck, label: COMPANY.shipping },
  { icon: MapPin, label: COMPANY.address },
];

const TONES = {
  chitopo: {
    card: "bg-cream",
    label: "text-ink-soft",
    phone: "text-ink",
    text: "text-ink-soft",
    icon: "text-fire",
  },
  mastersnacks: {
    card: "bg-snow",
    label: "text-night-soft",
    phone: "text-night",
    text: "text-night-soft",
    icon: "text-electric",
  },
};

export default function Contacto() {
  const t = useTone(TONES);

  return (
    <Section
      id="contacto"
      eyebrow="Hablemos"
      title="Escríbenos y listo"
      intro="No hay formulario ni esperas raras. Nos escribes por WhatsApp y te contesta una persona."
    >
      <Reveal stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`nb-soft p-6 sm:p-8 flex flex-col gap-5 ${t.card}`}>
          <div>
            <p className={`font-condensed uppercase tracking-[0.14em] text-xs mb-2 ${t.label}`}>
              WhatsApp
            </p>
            <p className={`font-condensed text-3xl sm:text-4xl m-0 ${t.phone}`}>
              {SELLER_PHONE_PRETTY}
            </p>
          </div>
          <Button
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="w-full"
          >
            <MessageCircle size={20} aria-hidden="true" />
            Abrir WhatsApp
          </Button>
        </div>

        <ul className={`nb-soft p-6 sm:p-8 list-none m-0 flex flex-col gap-4 ${t.card}`}>
          {DATOS.map(({ icon: Icon, label }) => (
            <li key={label} className={`flex items-start gap-3 leading-relaxed ${t.text}`}>
              <Icon size={20} className={`mt-0.5 shrink-0 ${t.icon}`} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
