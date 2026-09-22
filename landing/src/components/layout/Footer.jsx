import { MapPin, Clock, Truck, Globe, MessageCircle } from "lucide-react";
import Logo from "../brand/Logo";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import InstagramIcon from "../brand/InstagramIcon";
import {
  STORE_CONFIG,
  WHATSAPP_LINK,
  SELLER_PHONE_PRETTY,
  DEV_CREDIT,
  DEV_WHATSAPP_LINK,
} from "../../data/store";
import { CATALOGO_URL } from "../../lib/catalogoUrl";

function Item({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-cream/80 leading-relaxed">
      <Icon size={14} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

// Los enlaces del footer necesitan área táctil propia: sin padding quedan
// en ~13px de alto, muy poco para el pulgar.
const FOOT_LINK =
  "inline-flex items-center gap-2 min-h-[32px] py-1.5 text-[13px] no-underline transition-colors";

export default function Footer() {
  return (
    <footer className="on-dark relative z-10 border-t-[3px] border-ink bg-ink text-cream">
      <div className="contenedor py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-gold">
            <Logo height={44} withTagline />
            <p className="text-[13px] text-cream/75 leading-relaxed mt-4 max-w-[280px]">
              Snacks horneados hechos en Chile. Suflés, maní y más, para almacenes,
              distribuidoras y locales de barrio.
            </p>
          </div>

          <div>
            <h3 className="font-condensed text-sm text-gold uppercase tracking-[0.12em] mb-3 font-normal">
              Pedidos
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-cream hover:text-green font-semibold`}
                >
                  WhatsApp {SELLER_PHONE_PRETTY}
                </a>
              </li>
              <li>
                <a
                  href={CATALOGO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-cream hover:text-gold font-semibold`}
                >
                  Catálogo mayorista
                </a>
              </li>
              <Item icon={Clock}>{STORE_CONFIG.schedule}</Item>
              <Item icon={Truck}>{STORE_CONFIG.shipping}</Item>
              <Item icon={Truck}>Pedido mínimo: {STORE_CONFIG.minOrderUnits} unidades</Item>
            </ul>
          </div>

          <div>
            <MasterSnacksLogo
              alt=""
              height={72}
              className="mb-4 -rotate-3 transition-transform duration-300 hover:rotate-2 hover:scale-105"
            />
            <h3 className="font-condensed text-sm text-gold uppercase tracking-[0.12em] mb-3 font-normal">
              {STORE_CONFIG.producer}
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <Item icon={MapPin}>{STORE_CONFIG.address}</Item>
              <li>
                <a
                  href={`https://instagram.com/${STORE_CONFIG.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-cream hover:text-gold`}
                >
                  <InstagramIcon size={14} /> @{STORE_CONFIG.instagram}
                </a>
              </li>
              <li>
                <a
                  href={`https://${STORE_CONFIG.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-cream hover:text-gold`}
                >
                  <Globe size={14} aria-hidden="true" /> {STORE_CONFIG.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-cream/15 flex flex-col gap-4">
          <p className="text-[11px] text-cream/70 leading-relaxed max-w-3xl m-0">
            {STORE_CONFIG.sesma} · Hecho en Chile. Productos con sello de advertencia según la
            Ley 20.606 de Etiquetado de Alimentos. Este sitio está dirigido a personas adultas:
            no constituye publicidad dirigida a menores de 14 años.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[11px] text-cream/70 m-0">
              &copy; {STORE_CONFIG.copyrightYear} {STORE_CONFIG.name} — {STORE_CONFIG.producer}
            </p>

            <a
              href={DEV_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Desarrollado por ${DEV_CREDIT.name} — escríbele por WhatsApp`}
              className="group self-start sm:self-auto inline-flex items-center gap-2 min-h-[44px] text-[12px] text-cream/80 hover:text-cream no-underline transition-colors"
            >
              <MessageCircle
                size={15}
                className="text-green transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
                aria-hidden="true"
              />
              <span>
                Desarrollado por{" "}
                {/* El subrayado crece desde la izquierda al pasar el mouse. */}
                <span className="relative font-semibold text-gold">
                  {DEV_CREDIT.name}
                  <span
                    className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-gold origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
