import { MapPin, Clock, Truck, Globe } from "lucide-react";
import Logo from "../brand/Logo";
import InstagramIcon from "../brand/InstagramIcon";
import {
  STORE_CONFIG,
  WHATSAPP_LINK,
  SELLER_PHONE_PRETTY,
} from "../../data/store";
import { CATALOGO_URL } from "../../lib/catalogoUrl";

function Item({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2 text-[12px] text-muted leading-relaxed">
      <Icon size={14} className="mt-0.5 shrink-0 text-faint" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

// Los enlaces del footer necesitan área táctil propia: sin padding quedan
// en ~13px de alto, muy poco para el pulgar.
const FOOT_LINK =
  "inline-flex items-center gap-2 min-h-[32px] py-1.5 text-[12px] no-underline transition-colors";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-[3px] border-accent bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Logo height={44} withTagline />
            <p className="text-[12px] text-faint leading-relaxed mt-4 max-w-[280px]">
              Snacks horneados hechos en Chile. Suflés, maní y más, para almacenes,
              distribuidoras y locales de barrio.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              Pedidos
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-muted hover:text-green font-semibold`}
                >
                  WhatsApp {SELLER_PHONE_PRETTY}
                </a>
              </li>
              <li>
                <a
                  href={CATALOGO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-muted hover:text-accent font-semibold`}
                >
                  Catálogo mayorista
                </a>
              </li>
              <Item icon={Clock}>{STORE_CONFIG.schedule}</Item>
              <Item icon={Truck}>{STORE_CONFIG.shipping}</Item>
              <Item icon={Truck}>Pedido mínimo: {STORE_CONFIG.minOrderUnits} bolsas</Item>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              {STORE_CONFIG.producer}
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <Item icon={MapPin}>{STORE_CONFIG.address}</Item>
              <li>
                <a
                  href={`https://instagram.com/${STORE_CONFIG.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-muted hover:text-accent`}
                >
                  <InstagramIcon size={14} /> @{STORE_CONFIG.instagram}
                </a>
              </li>
              <li>
                <a
                  href={`https://${STORE_CONFIG.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${FOOT_LINK} text-muted hover:text-accent`}
                >
                  <Globe size={14} aria-hidden="true" /> {STORE_CONFIG.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-soft flex flex-col gap-3">
          <p className="text-[10px] text-faint leading-relaxed max-w-3xl">
            {STORE_CONFIG.sesma} · Hecho en Chile. Productos con sello de advertencia según la
            Ley 20.606 de Etiquetado de Alimentos. Este sitio está dirigido a personas adultas:
            no constituye publicidad dirigida a menores de 14 años.
          </p>
          <p className="text-[10px] text-faint">
            &copy; {STORE_CONFIG.copyrightYear} {STORE_CONFIG.name} — {STORE_CONFIG.producer}
          </p>
        </div>
      </div>
    </footer>
  );
}
