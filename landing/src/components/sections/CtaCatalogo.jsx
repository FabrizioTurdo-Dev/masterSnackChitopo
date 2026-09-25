import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Store, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import { CATALOGO_URL } from "../../lib/urls";
import { STORE_CONFIG } from "../../data/store";
import { prefersReducedMotion } from "../../lib/useLenis";
import { useTone } from "../../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TONES = {
  chitopo: "damero-fire text-cream",
  mastersnacks: "halftone-electric text-snow",
};

// Clímax de la página: el bloque que manda al catálogo.
export default function CtaCatalogo() {
  const root = useRef(null);
  const box = useTone(TONES);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current.querySelector(".cta-box"), {
        opacity: 0,
        scale: 0.95,
        y: 30,
        duration: 0.6,
        ease: "back.out(1.3)",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section id="catalogo" ref={root} className="relative scroll-mt-20 py-16 sm:py-24">
      <div className="contenedor">
        <div className={`cta-box nb p-7 sm:p-14 text-center ${box}`}>
          <Store size={40} className="mx-auto mb-5" aria-hidden="true" />

          <h2 className="font-title uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.92] m-0">
            ¿Tienes un almacén?
          </h2>

          <p className="text-base sm:text-xl leading-relaxed mt-5 max-w-2xl mx-auto font-medium">
            Arma tu pedido al por mayor en el catálogo: eliges los formatos y ves el mínimo.
            Después te confirmamos precio y despacho por WhatsApp.
          </p>

          <div className="mt-9 flex justify-center">
            <Button
              href={CATALOGO_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="gold"
              className="w-full sm:w-auto"
            >
              Ver catálogo mayorista
              <ArrowRight size={20} aria-hidden="true" />
            </Button>
          </div>

          <p className="text-sm mt-6 opacity-90">
            Cotizas online, cerramos por WhatsApp · Pedido mínimo{" "}
            {STORE_CONFIG.minOrderUnits} unidades
          </p>
        </div>
      </div>
    </section>
  );
}
