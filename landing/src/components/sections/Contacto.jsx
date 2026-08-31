import { MessageCircle, Clock, MapPin, Truck } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import {
  STORE_CONFIG,
  WHATSAPP_LINK,
  SELLER_PHONE_PRETTY,
} from "../../data/store";

const DATOS = [
  { icon: Clock, label: STORE_CONFIG.schedule },
  { icon: Truck, label: STORE_CONFIG.shipping },
  { icon: MapPin, label: STORE_CONFIG.address },
];

export default function Contacto() {
  return (
    <Section
      id="contacto"
      eyebrow="Hablemos"
      title="Escribinos y listo"
      intro="No hay formulario ni esperas raras. Nos escribís por WhatsApp y te contesta una persona."
    >
      <Reveal stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nb-soft bg-surface p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <p className="font-condensed uppercase tracking-[0.14em] text-accent text-xs mb-2">
              WhatsApp
            </p>
            <p className="font-condensed text-3xl sm:text-4xl text-text m-0">
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

        <ul className="nb-soft bg-surface p-6 sm:p-8 list-none m-0 flex flex-col gap-4">
          {DATOS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-start gap-3 text-muted leading-relaxed">
              <Icon size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
