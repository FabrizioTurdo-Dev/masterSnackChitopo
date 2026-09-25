import { MapPin, Clock, Truck, MessageCircle, ArrowLeft, ArrowUpRight, Lock } from "lucide-react";
import MasterSnacksLogo from "./brand/MasterSnacksLogo";
import { LANDING_URL, brandSiteUrl } from "../lib/landingUrl";
import {
  STORE_CONFIG,
  WHATSAPP_LINK,
  SELLER_PHONE_PRETTY,
  DEV_CREDIT,
  DEV_WHATSAPP_LINK,
} from "../data/store";
import { COMPANY, BRANDS } from "../data/brands";

function InstagramIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Item({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-snow/80 leading-relaxed">
      <Icon size={14} className="mt-1 shrink-0 text-gold" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

// Los enlaces del footer necesitan área táctil propia: sin padding quedan
// en ~13px de alto, muy poco para el pulgar.
const FOOT_LINK =
  "inline-flex items-center gap-2 min-h-[32px] py-1.5 text-[13px] no-underline transition-colors";

const HEADING = "font-condensed text-sm text-gold uppercase tracking-[0.12em] mb-3 font-normal";

// Mismo footer que la home de Master Snacks, con el link cruzado al revés
// (acá lleva al sitio) y el aviso legal propio de un catálogo mayorista.
export default function Footer() {
  return (
    <footer className="on-dark relative z-10 border-t-[3px] border-night halftone-night text-snow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <MasterSnacksLogo
              alt={COMPANY.name}
              height={96}
              className="-rotate-3 transition-transform duration-300 hover:rotate-2 hover:scale-105"
            />
            <p className="text-[13px] text-snow/75 leading-relaxed mt-4 max-w-[280px]">
              Snacks hechos en nuestra fábrica de La Pintana. Catálogo mayorista para almacenes,
              distribuidoras y locales de barrio.
            </p>
          </div>

          <div>
            <h3 className={HEADING}>Pedidos</h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-snow hover:text-green font-semibold`}
                >
                  WhatsApp {SELLER_PHONE_PRETTY}
                </a>
              </li>
              <li>
                <a href={LANDING_URL} className={`${FOOT_LINK} text-snow hover:text-gold font-semibold`}>
                  <ArrowLeft size={14} aria-hidden="true" /> Ir al sitio de {COMPANY.name}
                </a>
              </li>
              <Item icon={Clock}>{COMPANY.schedule}</Item>
              <Item icon={Truck}>{COMPANY.shipping}</Item>
              <Item icon={Truck}>Pedido mínimo: {STORE_CONFIG.minOrderUnits} unidades</Item>
            </ul>
          </div>

          <div>
            <h3 className={HEADING}>Nuestras marcas</h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {BRANDS.map(b => (
                <li key={b.id} className="flex flex-col gap-1">
                  <a
                    href={brandSiteUrl(b)}
                    className={`${FOOT_LINK} text-snow hover:text-gold font-semibold`}
                  >
                    {b.name} · {b.descriptor}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <a
                    href={`https://instagram.com/${b.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${FOOT_LINK} text-snow/80 hover:text-gold`}
                  >
                    <InstagramIcon size={14} /> @{b.instagram}
                  </a>
                </li>
              ))}
              <Item icon={MapPin}>{COMPANY.address}</Item>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-snow/15 flex flex-col gap-4">
          <p className="text-[11px] text-snow/70 leading-relaxed max-w-3xl m-0">
            {COMPANY.sesma} · Hecho en Chile. Productos con sello de advertencia según la
            Ley 20.606 de Etiquetado de Alimentos. Este catálogo es mayorista y está pensado para
            comerciantes adultos: no constituye publicidad dirigida a menores de 14 años.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* El acceso al panel va acá, chico, para que los dueños lo
                encuentren sin que les llame la atención a los clientes. El
                catálogo usa HashRouter: el hash cambia de ruta sin recargar. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4">
              <p className="text-[11px] text-snow/70 m-0">
                &copy; {COMPANY.copyrightYear} {COMPANY.legalName}
              </p>
              <a
                href="#/admin"
                className="self-start inline-flex items-center gap-1.5 min-h-[44px] text-[11px] text-snow/70 hover:text-gold no-underline transition-colors"
              >
                <Lock size={12} aria-hidden="true" />
                Panel de administración
              </a>
            </div>

            <a
              href={DEV_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Desarrollado por ${DEV_CREDIT.name} — escríbele por WhatsApp`}
              className="group self-start sm:self-auto inline-flex items-center gap-2 min-h-[44px] text-[12px] text-snow/80 hover:text-snow no-underline transition-colors"
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
