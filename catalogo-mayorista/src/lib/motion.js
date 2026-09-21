// En la landing esto vive en useLenis.js. El catálogo no usa Lenis: el
// pedido y la ficha scrollean por dentro y en el celular no suma nada.
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
