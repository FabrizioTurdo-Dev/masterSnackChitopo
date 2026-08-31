import { MapPin, Clock, Truck, Globe } from "lucide-react";
import Logo from "./brand/Logo";
import { SELLER_PHONE, STORE_CONFIG } from "../data/store";

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
    <li className="flex items-start gap-2 text-[12px] text-muted leading-relaxed">
      <Icon size={14} className="mt-0.5 shrink-0 text-faint" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function Footer() {
  const waLink = `https://wa.me/${SELLER_PHONE}`;

  return (
    <footer className="border-t border-border-soft bg-bg mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Logo height={40} withTagline />
            <p className="text-[11px] text-faint leading-relaxed mt-3 max-w-[260px]">
              Snacks horneados hechos en Chile. Catálogo mayorista para almacenes,
              distribuidoras y locales de barrio.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              Pedidos
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-muted hover:text-green transition-colors no-underline font-semibold"
                >
                  WhatsApp +56 9 7863 2055
                </a>
              </li>
              <Item icon={Clock}>{STORE_CONFIG.schedule}</Item>
              <Item icon={Truck}>{STORE_CONFIG.shipping}</Item>
              <Item icon={Truck}>Pedido mínimo: {STORE_CONFIG.minOrderUnits} bolsas</Item>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              {STORE_CONFIG.producer}
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <Item icon={MapPin}>{STORE_CONFIG.address}</Item>
              <li>
                <a
                  href={`https://instagram.com/${STORE_CONFIG.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[12px] text-muted hover:text-accent transition-colors no-underline"
                >
                  <InstagramIcon /> @{STORE_CONFIG.instagram}
                </a>
              </li>
              <li>
                <a
                  href={`https://${STORE_CONFIG.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[12px] text-muted hover:text-accent transition-colors no-underline"
                >
                  <Globe size={14} aria-hidden="true" /> {STORE_CONFIG.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-soft flex flex-col gap-3">
          <p className="text-[10px] text-faint leading-relaxed max-w-3xl">
            {STORE_CONFIG.sesma} · Hecho en Chile. Productos con sello de advertencia según la
            Ley 20.606 de Etiquetado de Alimentos. Este catálogo es mayorista y está dirigido a
            comerciantes adultos: no constituye publicidad dirigida a menores de 14 años.
          </p>
          <p className="text-[10px] text-faint">
            &copy; {STORE_CONFIG.copyrightYear} {STORE_CONFIG.name} — {STORE_CONFIG.producer}
          </p>
        </div>
      </div>
    </footer>
  );
}
