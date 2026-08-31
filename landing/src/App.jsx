import { useLenis } from "./lib/useLenis";
import { BurstProvider } from "./lib/burst";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Marquee from "./components/ui/Marquee";
import Hero from "./components/sections/Hero";
import Historia from "./components/sections/Historia";
import ProductosDestacados from "./components/sections/ProductosDestacados";
import PorQueElegirnos from "./components/sections/PorQueElegirnos";
import RedesSociales from "./components/sections/RedesSociales";
import CtaCatalogo from "./components/sections/CtaCatalogo";
import Faq from "./components/sections/Faq";
import Contacto from "./components/sections/Contacto";

const CINTA = [
  "El sufle, po'",
  "Queso",
  "Papa",
  "Frutos del bosque",
  "Maní",
  "Tocino merkén",
  "Hecho en Chile",
];

export default function App() {
  useLenis();

  return (
    <BurstProvider>
      <div className="grain">
        <Header />
        <main className="relative z-10">
          <Hero />
          <Marquee items={CINTA} />
          <Historia />
          <ProductosDestacados />
          <Marquee
            items={["Super BKN crunchy", "Horneado, no frito", "Pyme chilena"]}
            duration={22}
          />
          <PorQueElegirnos />
          <RedesSociales />
          <CtaCatalogo />
          <Faq />
          <Contacto />
        </main>
        <Footer />
      </div>
    </BurstProvider>
  );
}
