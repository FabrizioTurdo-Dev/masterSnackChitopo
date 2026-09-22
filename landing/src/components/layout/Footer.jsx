import { MapPin, Clock, Truck, MessageCircle, ArrowUpRight } from "lucide-react";
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
import { COMPANY, BRANDS, CHITOPO } from "../../data/brands";
import { CATALOGO_URL, HOME_URL, brandUrl } from "../../lib/urls";
import { useBrand, useTone } from "../../lib/brand";

const TONES = {
  chitopo: {
    footer: "bg-ink text-cream border-ink",
    soft: "text-cream/80",
    softer: "text-cream/70",
    dev: "text-cream/80 hover:text-cream",
    link: "text-cream",
    rule: "border-cream/15",
  },
  mastersnacks: {
    footer: "halftone-night text-snow border-night",
    soft: "text-snow/80",
    softer: "text-snow/70",
    dev: "text-snow/80 hover:text-snow",
    link: "text-snow",
    rule: "border-snow/15",
  },
};

function Item({ icon: Icon, className, children }) {
  return (
    <li className={`flex items-start gap-2 text-[13px] leading-relaxed ${className}`}>
      <Icon size={14} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

// Los enlaces del footer necesitan área táctil propia: sin padding quedan
// en ~13px de alto, muy poco para el pulgar.
const FOOT_LINK =
  "inline-flex items-center gap-2 min-h-[32px] py-1.5 text-[13px] no-underline transition-colors";

const HEADING = "font-condensed text-sm text-gold uppercase tracking-[0.12em] font-normal";

// Pie de las dos páginas: en la home firma la empresa y lista sus marcas;
// en la de Chitopo firma la marca y lleva a la empresa.
export default function Footer() {
  const isChitopo = useBrand() === "chitopo";
  const t = useTone(TONES);

  return (
    <footer className={`on-dark relative z-10 border-t-[3px] ${t.footer}`}>
      <div className="contenedor py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-gold">
            {isChitopo ? (
              <>
                <Logo height={44} withTagline />
                <p className={`text-[13px] leading-relaxed mt-4 max-w-[280px] ${t.soft}`}>
                  Suflés horneados y maní hechos en La Pintana, para almacenes,
                  distribuidoras y locales de barrio.
                </p>
              </>
            ) : (
              <>
                <MasterSnacksLogo
                  alt={COMPANY.name}
                  height={96}
                  className="-rotate-3 transition-transform duration-300 hover:rotate-2 hover:scale-105"
                />
                <p className={`text-[13px] leading-relaxed mt-4 max-w-[280px] ${t.soft}`}>
                  Snacks hechos en nuestra fábrica de La Pintana, para almacenes,
                  distribuidoras y locales de barrio.
                </p>
              </>
            )}
          </div>

          <div>
            <h3 className={`${HEADING} mb-3`}>Pedidos</h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} ${t.link} hover:text-green font-semibold`}
                >
                  WhatsApp {SELLER_PHONE_PRETTY}
                </a>
              </li>
              <li>
                <a
                  href={CATALOGO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} ${t.link} hover:text-gold font-semibold`}
                >
                  Catálogo mayorista
                </a>
              </li>
              <Item icon={Clock} className={t.soft}>{COMPANY.schedule}</Item>
              <Item icon={Truck} className={t.soft}>{COMPANY.shipping}</Item>
              <Item icon={Truck} className={t.soft}>
                Pedido mínimo: {STORE_CONFIG.minOrderUnits} unidades
              </Item>
            </ul>
          </div>

          {isChitopo ? (
            <div>
              <a
                href={HOME_URL}
                className="group inline-flex flex-col items-start gap-2 mb-4 no-underline"
                aria-label={`Chitopo es una marca de ${COMPANY.name}: ir al sitio de la empresa`}
              >
                <span className={HEADING}>Una marca de</span>
                <MasterSnacksLogo
                  variant="sticker-cafe"
                  alt=""
                  height={72}
                  className="-rotate-3 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
                />
              </a>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                <Item icon={MapPin} className={t.soft}>{COMPANY.address}</Item>
                <li>
                  <a
                    href={`https://instagram.com/${CHITOPO.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${FOOT_LINK} ${t.link} hover:text-gold`}
                  >
                    <InstagramIcon size={14} /> @{CHITOPO.instagram}
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className={`${HEADING} mb-3`}>Nuestras marcas</h3>
              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                {BRANDS.map((b) => (
                  <li key={b.id} className="flex flex-col gap-1">
                    <a
                      href={brandUrl(b)}
                      className={`${FOOT_LINK} ${t.link} hover:text-gold font-semibold`}
                    >
                      {b.name} · {b.descriptor}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                    <a
                      href={`https://instagram.com/${b.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${FOOT_LINK} ${t.soft} hover:text-gold`}
                    >
                      <InstagramIcon size={14} /> @{b.instagram}
                    </a>
                  </li>
                ))}
                <Item icon={MapPin} className={t.soft}>{COMPANY.address}</Item>
              </ul>
            </div>
          )}
        </div>

        <div className={`mt-10 pt-6 border-t-2 flex flex-col gap-4 ${t.rule}`}>
          <p className={`text-[11px] leading-relaxed max-w-3xl m-0 ${t.softer}`}>
            {COMPANY.sesma} · Hecho en Chile. Productos con sello de advertencia según la
            Ley 20.606 de Etiquetado de Alimentos. Este sitio está dirigido a personas adultas:
            no constituye publicidad dirigida a menores de 14 años.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className={`text-[11px] m-0 ${t.softer}`}>
              &copy; {COMPANY.copyrightYear}{" "}
              {isChitopo ? `${CHITOPO.name} — ${COMPANY.legalName}` : COMPANY.legalName}
            </p>

            <a
              href={DEV_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Desarrollado por ${DEV_CREDIT.name} — escríbele por WhatsApp`}
              className={`group self-start sm:self-auto inline-flex items-center gap-2 min-h-[44px] text-[12px] no-underline transition-colors ${t.dev}`}
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
