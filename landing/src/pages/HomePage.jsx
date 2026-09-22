import { useLenis } from "../lib/useLenis";
import { BurstProvider } from "../lib/burst";
import { BrandProvider } from "../lib/brand";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Marquee from "../components/ui/Marquee";
import HeroEmpresa from "../components/home/HeroEmpresa";
import NuestrasMarcas from "../components/home/NuestrasMarcas";
import Historia from "../components/sections/Historia";
import Fabrica from "../components/sections/Fabrica";
import CtaCatalogo from "../components/sections/CtaCatalogo";
import Faq from "../components/sections/Faq";
import Contacto from "../components/sections/Contacto";

const NAV = [
  { href: "#marcas", label: "Marcas" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#fabrica", label: "Fábrica" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

const CINTA = [
  "Maestros del picoteo",
  "Fábrica propia",
  "La Pintana",
  "Chitopo · Horneados",
  "Hecho en Chile",
];

// / — home de Master Snacks, la empresa. Presenta sus marcas (hoy Chitopo)
// y cuenta la historia y la fábrica, que son de todas.
export default function HomePage() {
  useLenis();

  return (
    <BrandProvider brand="mastersnacks">
      <BurstProvider>
        <div className="grain">
          <Header nav={NAV} />
          <main className="relative z-10">
            <HeroEmpresa />
            <Marquee items={CINTA} tone="night" />
            <NuestrasMarcas />
            <Historia />
            <Fabrica />
            <Marquee
              items={["Trato directo", "Despacho en la RM", "Pyme chilena"]}
              duration={22}
              tone="electric"
              reverse
              tilted
            />
            <CtaCatalogo />
            <Faq scope="empresa" />
            <Contacto />
          </main>
          <Footer />
        </div>
      </BurstProvider>
    </BrandProvider>
  );
}
