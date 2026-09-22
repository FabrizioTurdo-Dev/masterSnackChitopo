import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import Logo from "../brand/Logo";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import { CATALOGO_URL, HOME_URL } from "../../lib/urls";
import { WHATSAPP_LINK } from "../../data/store";
import { COMPANY, CHITOPO } from "../../data/brands";
import { useBrand, useTone } from "../../lib/brand";

const TONES = {
  chitopo: {
    scrolled: "bg-cream/95 border-ink",
    link: "text-ink hover:text-fire",
    cta: "bg-fire text-cream border-ink [box-shadow:3px_3px_0_var(--color-ink)]",
    icon: "text-ink",
    mobile: "bg-cream border-ink",
    divider: "border-ink/15",
    mobileLink: "text-ink",
    mobileCta: "bg-fire text-cream",
  },
  mastersnacks: {
    scrolled: "bg-snow/95 border-night",
    link: "text-night hover:text-electric",
    cta: "bg-electric text-snow border-night [box-shadow:3px_3px_0_var(--color-night)]",
    icon: "text-night",
    mobile: "bg-snow border-night",
    divider: "border-night/15",
    mobileLink: "text-night",
    mobileCta: "bg-electric text-snow",
  },
};

// Cabecera fija de las dos páginas. `nav` son los anchors de la página;
// en la de Chitopo suma el sello "una marca de Master Snacks" que lleva a
// la home.
export default function Header({ nav }) {
  const brand = useBrand();
  const t = useTone(TONES);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isChitopo = brand === "chitopo";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? `${t.scrolled} backdrop-blur border-b-[3px]` : "bg-transparent"
      }`}
    >
      <div className="contenedor h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="#inicio"
            className="shrink-0"
            aria-label={`${isChitopo ? CHITOPO.name : COMPANY.name} — ir al inicio`}
          >
            {isChitopo ? (
              <Logo height={32} />
            ) : (
              <MasterSnacksLogo
                variant="transparente"
                height={54}
                alt={COMPANY.name}
                className="-rotate-3 mt-2 transition-transform duration-300 hover:rotate-0 hover:scale-105"
              />
            )}
          </a>

          {isChitopo && (
            <a
              href={HOME_URL}
              className="hidden lg:inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-snow text-night border-2 border-night no-underline font-condensed uppercase tracking-[0.1em] text-[10px] leading-none -rotate-2 transition-transform duration-300 hover:rotate-0"
              aria-label={`Chitopo es una marca de ${COMPANY.name}: ir al sitio de la empresa`}
            >
              una marca de
              <MasterSnacksLogo variant="transparente" height={26} alt="" />
            </a>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-condensed uppercase tracking-[0.1em] text-sm transition-colors no-underline ${t.link}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CATALOGO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:inline-flex items-center min-h-[44px] px-4 font-condensed uppercase tracking-[0.06em] text-sm no-underline border-[3px] nb-press ${t.cta}`}
          >
            Catálogo mayorista
          </a>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className={`inline-flex items-center justify-center size-11 hover:text-[#15803d] transition-colors ${t.icon}`}
          >
            <MessageCircle size={24} aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className={`md:hidden inline-flex items-center justify-center size-11 bg-transparent border-0 cursor-pointer p-0 ${t.icon}`}
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="nav-mobile"
          className={`md:hidden border-b-[3px] px-4 pb-5 pt-2 ${t.mobile}`}
          aria-label="Navegación principal"
        >
          <ul className="list-none p-0 m-0 flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 font-condensed uppercase tracking-[0.1em] text-lg no-underline border-b-2 ${t.mobileLink} ${t.divider}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            {isChitopo && (
              <li>
                <a
                  href={HOME_URL}
                  className={`flex items-center justify-between gap-3 py-3 font-condensed uppercase tracking-[0.1em] text-lg no-underline border-b-2 ${t.mobileLink} ${t.divider}`}
                >
                  Una marca de {COMPANY.name}
                  <MasterSnacksLogo variant="transparente" height={34} alt="" />
                </a>
              </li>
            )}
            <li>
              <a
                href={CATALOGO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`block mt-4 text-center py-3 font-condensed uppercase tracking-[0.06em] text-lg no-underline nb ${t.mobileCta}`}
              >
                Catálogo mayorista
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
