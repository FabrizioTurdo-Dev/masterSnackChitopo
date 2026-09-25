import { COMPANY } from "./brands";
import { STORE_CONFIG } from "./store";

// Preguntas frecuentes. `scope` dice en qué página salen: "todas", solo en
// la home de la empresa ("empresa") o solo en la de una marca ("chitopo").
export const PREGUNTAS = [
  {
    scope: "todas",
    q: "¿Cómo hago un pedido?",
    a: "Entras al catálogo mayorista, armas tu carro con los formatos que necesites y nos lo mandas. Ahí seguimos por WhatsApp para confirmarte precio, pago y despacho.",
  },
  {
    scope: "todas",
    q: "¿Cuál es el pedido mínimo?",
    a: `${STORE_CONFIG.minOrderUnits} unidades. Puedes mezclar productos y formatos para llegar al mínimo: no hace falta que sea todo lo mismo.`,
  },
  {
    scope: "todas",
    q: "¿Hacen despacho?",
    a: `${COMPANY.shipping}. Los coordinamos por WhatsApp cuando cerramos el pedido. Fuera de la RM, consúltanos y vemos.`,
  },
  {
    scope: "empresa",
    q: "¿Qué marcas tienen?",
    a: "Hoy, Chitopo: nuestra marca de horneados, con suflés de queso y papa. Tenemos próximos lanzamientos en preparación; si quieres saber apenas salgan, escríbenos por WhatsApp.",
  },
  {
    scope: "todas",
    q: "¿En qué formatos venden?",
    a: "Caja, display y unidad. El display es el que mejor funciona para el mesón del almacén; la caja conviene si tienes más rotación.",
  },
  {
    scope: "todas",
    q: "¿Emiten boleta o factura?",
    a: `Sí. Somos una pyme formal: ${COMPANY.legalName}, con ${COMPANY.sesma}.`,
  },
  {
    scope: "chitopo",
    q: "¿Cada cuánto sacan sabores nuevos?",
    a: "Vamos rápido: en seis meses ya tenemos dos sabores en la calle. Los que vienen son frutos del bosque, maní y tocino merkén. Si quieres enterarte primero, síguenos en Instagram.",
  },
];

export function preguntasDe(scope) {
  return PREGUNTAS.filter((p) => p.scope === "todas" || p.scope === scope);
}
