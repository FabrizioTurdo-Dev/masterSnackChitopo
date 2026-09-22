import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Instancia viva de Lenis. Cualquier scroll programático tiene que pasar
// por acá: window.scrollTo lo pelea y Lenis lo devuelve a su posición.
let _lenis = null;
export const getLenis = () => _lenis;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Elemento del ancla con que se abrió la página, si existe.
function hashTarget() {
  const hash = window.location.hash;
  if (hash.length < 2) return null;
  try {
    return document.querySelector(decodeURIComponent(hash));
  } catch {
    return null;
  }
}

// Smooth scroll inercial sincronizado con el ticker de GSAP, para que
// ScrollTrigger lea la misma posición que pinta Lenis.
export function useLenis() {
  useEffect(() => {
    // Al llegar con un ancla desde la otra página (/#fabrica desde
    // /chitopo/), el salto nativo del navegador ocurre antes de que React
    // pinte la sección. Se repite cuando ya cargaron las fuentes y
    // ScrollTrigger acomodó sus medidas.
    const fonts = document.fonts?.ready ?? Promise.resolve();

    if (prefersReducedMotion()) {
      fonts.then(() => hashTarget()?.scrollIntoView());
      return;
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    _lenis = lenis;

    fonts.then(() => {
      const target = hashTarget();
      if (!target || _lenis !== lenis) return;
      ScrollTrigger.refresh();
      lenis.scrollTo(target, { offset: -72, immediate: true });
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Los anchors del nav tienen que pasar por Lenis, si no el salto
    // nativo pelea con el scroll suavizado.
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      _lenis = null;
    };
  }, []);
}
