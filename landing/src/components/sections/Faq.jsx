import { ChevronDown } from "lucide-react";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import { STORE_CONFIG } from "../../data/store";

const PREGUNTAS = [
  {
    q: "¿Cómo hago un pedido?",
    a: "Entras al catálogo mayorista, armas tu carro con los formatos que necesites y nos lo mandas. Ahí seguimos por WhatsApp para confirmarte precio, pago y despacho.",
  },
  {
    q: "¿Cuál es el pedido mínimo?",
    a: `${STORE_CONFIG.minOrderUnits} unidades. Puedes mezclar sabores y formatos para llegar al mínimo, no hace falta que sea todo lo mismo.`,
  },
  {
    q: "¿Hacen despacho?",
    a: `${STORE_CONFIG.shipping}. La coordinamos por WhatsApp cuando cerramos el pedido. Fuera de la RM, consúltanos y vemos.`,
  },
  {
    q: "¿En qué formatos venden?",
    a: "Caja, display y unidad. El display es el que mejor funciona para el mesón del almacén; la caja conviene si tienes más rotación.",
  },
  {
    q: "¿Emiten boleta o factura?",
    a: `Sí. Somos una pyme formal: Master Snacks Inversiones SpA, con ${STORE_CONFIG.sesma}.`,
  },
  {
    q: "¿Cada cuánto sacan sabores nuevos?",
    a: "Vamos rápido: en seis meses ya tenemos dos en la calle y tres en camino (frutos del bosque, maní y tocino merkén). Si quieres enterarte primero, síguenos en Instagram.",
  },
];

export default function Faq() {
  return (
    <Section
      id="faq"
      // Sin padding propio: el aire ya lo ponen el bloque del catálogo de
      // arriba y Contacto de abajo, y sumado quedaba un hueco muy grande.
      className="pt-0 sm:pt-0 lg:pt-0 pb-0 sm:pb-0 lg:pb-0"
      title="Lo que siempre nos preguntan"
      intro="Si tienes un almacén, distribuidora o local de barrio, esto es lo que necesitas saber."
    >
      <Reveal stagger className="flex flex-col gap-3 max-w-3xl">
        {PREGUNTAS.map(({ q, a }) => (
          <details key={q} className="group nb-soft bg-cream">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-condensed uppercase text-lg sm:text-xl text-ink">
              {q}
              <ChevronDown
                size={22}
                className="shrink-0 text-fire transition-transform duration-300 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed px-5 pb-5 m-0">
              {a}
            </p>
          </details>
        ))}
      </Reveal>
    </Section>
  );
}
