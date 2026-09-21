import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SelloAdvertencia from "../brand/SelloAdvertencia";
import { flavorAccent } from "../../data/store";
import { useBurstOnHover } from "../../lib/useBurstOnHover";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProductoCard({ product }) {
  const accent = flavorAccent(product.flavor);
  const proximo = product.status === "proximamente";

  const article = useRef(null);
  const { ref: bagRef, handlers, fireFromCenter } = useBurstOnHover(accent);

  // Sin mouse no hay hover, así que en touch el estallido se muestra solo
  // una vez, la primera que la tarjeta entra en pantalla.
  useGSAP(
    () => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      ScrollTrigger.create({
        trigger: article.current,
        start: "top 65%",
        once: true,
        onEnter: fireFromCenter,
      });
    },
    { scope: article, dependencies: [fireFromCenter] }
  );

  return (
    <article
      ref={article}
      className="group relative nb-soft bg-cream flex flex-col overflow-hidden"
    >
      <div
        ref={bagRef}
        {...handlers}
        className="relative bg-cream-2 border-b-[3px] border-ink p-6 flex items-center justify-center min-h-[220px]"
      >
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{ background: `radial-gradient(circle at 50% 45%, ${accent}, transparent 68%)` }}
          aria-hidden="true"
        />
        <img
          src={product.image}
          alt={`Bolsa de ${product.name} Chitopo de ${product.grams} gramos`}
          loading="lazy"
          width="320"
          height="320"
          className={`relative w-full max-w-[210px] h-auto transition-transform duration-300 group-hover:scale-105 ${
            proximo ? "opacity-70" : ""
          }`}
        />
        <div className="absolute bottom-3 right-3">
          <SelloAdvertencia seal={product.seal} size={44} />
        </div>
        {product.tag && (
          <span
            className="absolute top-3 left-3 font-condensed uppercase tracking-[0.08em] text-xs px-2.5 py-1 text-cream border-2 border-ink"
            style={{ backgroundColor: accent }}
          >
            {product.tag}
          </span>
        )}
        {proximo && (
          <span className="absolute top-3 right-3 font-condensed uppercase tracking-[0.08em] text-xs px-2.5 py-1 bg-ink text-gold border-2 border-ink">
            Próximamente
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-title uppercase text-2xl leading-tight text-ink m-0">
          {product.name}
        </h3>
        <p className="text-ink-soft text-sm leading-relaxed m-0 flex-1">{product.blurb}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint m-0 mt-1">
          <span className="font-semibold text-ink">
            {product.grams} g
          </span>
          <span>Horneado</span>
          {product.glutenFree && <span>Libre de gluten</span>}
        </p>
      </div>
    </article>
  );
}
