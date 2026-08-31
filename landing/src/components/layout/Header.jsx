import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import Logo from "../brand/Logo";
import { CATALOGO_URL } from "../../lib/catalogoUrl";
import { WHATSAPP_LINK } from "../../data/store";

const NAV = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#productos", label: "Productos" },
  { href: "#por-que", label: "Por qué" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur border-b-[3px] border-accent" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" className="shrink-0" aria-label="Chitopo — ir al inicio">
          <Logo height={32} />
        </a>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-condensed uppercase tracking-[0.1em] text-sm text-muted hover:text-accent transition-colors no-underline"
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
            className="hidden sm:inline-flex items-center min-h-[44px] px-4 bg-accent text-bg font-condensed uppercase tracking-[0.06em] text-sm no-underline border-[3px] border-accent-dark [box-shadow:3px_3px_0_var(--color-accent-dark)] nb-press"
          >
            Catálogo mayorista
          </a>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="inline-flex items-center justify-center size-11 text-green hover:text-text transition-colors"
          >
            <MessageCircle size={24} aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden inline-flex items-center justify-center size-11 bg-transparent border-0 text-text cursor-pointer p-0"
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="nav-mobile"
          className="md:hidden bg-bg border-b-[3px] border-accent px-4 pb-5 pt-2"
          aria-label="Navegación principal"
        >
          <ul className="list-none p-0 m-0 flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-condensed uppercase tracking-[0.1em] text-lg text-text no-underline border-b border-border-soft"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={CATALOGO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block mt-4 text-center py-3 bg-accent text-bg font-condensed uppercase tracking-[0.06em] text-lg no-underline"
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
