import { motion, useReducedMotion } from "framer-motion";

// Sellos que trae el envase y que nos separan de la competencia. Los
// íconos salen de shared/marca/sellos/ (ver .sello en base.css) y toman el
// color del texto donde aparecen. Espejo de landing/src/components/brand.
// `claim` es la clave en product.claims que dice si el producto lo lleva.
export const SELLOS = [
  {
    id: "sin-gluten",
    claim: "glutenFree",
    label: "Sin gluten",
    text: "Nuestros suflés no llevan gluten, tal como lo indica el empaque.",
  },
  { id: "no-frito", claim: "baked", label: "No frito", text: "Horneados: todo el crunch, con harto menos grasa." },
  { id: "no-gmo", claim: "nonGmo", label: "No GMO", text: "Hechos sin ingredientes transgénicos." },
];

// Sellos que lleva un producto, en el orden de SELLOS.
export function sellosDe(product) {
  return SELLOS.filter(s => product?.claims?.[s.claim]);
}

export function Sello({ id, className = "" }) {
  return <span className={`sello sello-${id} ${className}`} aria-hidden="true" />;
}

// Franja fija bajo la cinta del hero, en las tres páginas: los tres sellos
// grandes, cada uno en su círculo con borde y sombra dura, con el nombre y
// una línea.
export function SellosFranja() {
  const prefersReduced = useReducedMotion();
  return (
    <section aria-label="Sellos de nuestros productos" className="bg-gold border-b-[3px] border-night py-8 sm:py-12">
      <ul className="max-w-6xl mx-auto px-4 sm:px-6 list-none m-0 grid grid-cols-3 gap-3 sm:gap-8">
        {SELLOS.map(({ id, label, text }, i) => (
          <motion.li
            key={id}
            initial={prefersReduced ? false : { opacity: 0, y: 24, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center text-center gap-3 sm:gap-4"
          >
            <span className="grid place-items-center size-20 sm:size-28 rounded-full bg-snow text-night border-[3px] border-night [box-shadow:4px_4px_0_var(--color-night)]">
              <Sello id={id} className="size-[78%]" />
            </span>
            <span className="font-title uppercase text-lg sm:text-2xl leading-none text-night">{label}</span>
            <span className="hidden sm:block text-sm leading-snug max-w-[26ch] text-night-soft">{text}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
