import { useLenis } from "../lib/useLenis";
import { BurstProvider } from "../lib/burst";
import { BrandProvider } from "../lib/brand";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Marquee from "../components/ui/Marquee";
import Hero from "../components/sections/Hero";
// Productos queda afuera por ahora para acortar el recorrido: los 5 sabores
// ya se ven en el hero. Se reactiva descomentando esto, el <ProductosDestacados />
// de abajo y la entrada "Productos" del NAV.
// import ProductosDestacados from "../components/sections/ProductosDestacados";
import PorQueElegirnos from "../components/sections/PorQueElegirnos";
import HechoPorMasterSnacks from "../components/sections/HechoPorMasterSnacks";
import RedesSociales from "../components/sections/RedesSociales";
import CtaCatalogo from "../components/sections/CtaCatalogo";
import Faq from "../components/sections/Faq";
import Contacto from "../components/sections/Contacto";

const NAV = [
  // { href: "#productos", label: "Productos" },
  { href: "#por-que", label: "Por qué" },
  { href: "#quien-lo-hace", label: "Quién lo hace" },
  { href: "#redes", label: "Instagram" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

const CINTA = [
  "El sufle, BKN",
  "Queso",
  "Papa",
  "Frutos del bosque",
  "Maní",
  "Tocino merkén",
  "Hecho en Chile",
];

// /chitopo/ — la marca de horneados de Master Snacks. La historia y la
// fábrica son de la empresa y viven en la home; acá quedan los sabores y
// una franja que lleva hacia allá.
export default function ChitopoPage() {
  useLenis();

  return (
    <BrandProvider brand="chitopo">
      <BurstProvider>
        <div className="grain">
          <Header nav={NAV} />
          <main className="relative z-10">
            <Hero />
            <Marquee items={CINTA} />
            {/* <ProductosDestacados /> */}
            <PorQueElegirnos />
            <HechoPorMasterSnacks />
            <RedesSociales />
            <CtaCatalogo />
            <Faq scope="chitopo" />
            <Contacto />
          </main>
          <Footer />
        </div>
      </BurstProvider>
    </BrandProvider>
  );
}
