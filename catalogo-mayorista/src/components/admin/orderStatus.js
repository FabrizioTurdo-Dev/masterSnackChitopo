// Recorrido de un pedido. El local lo manda por WhatsApp y entra "nuevo";
// después los dueños lo van avanzando desde el panel a medida que responden.
export const ORDER_STEPS = [
  {
    id: "nuevo",
    label: "Nuevo",
    hint: "Llegó por WhatsApp. Falta mandar la cotización.",
    next: "Ya envié la cotización",
  },
  {
    id: "pendiente",
    label: "Pendiente",
    hint: "Cotización enviada. Esperando que el cliente confirme.",
    next: "El cliente confirmó",
  },
  {
    id: "confirmado",
    label: "Confirmado",
    hint: "El cliente aceptó. Falta despachar.",
    next: "Marcar como enviado",
  },
  {
    id: "enviado",
    label: "Enviado",
    hint: "Pedido despachado.",
  },
];

export const CANCELLED = {
  id: "cancelado",
  label: "Cancelado",
  hint: "No se concretó.",
};

export const ALL_STATUSES = [...ORDER_STEPS, CANCELLED];

export const stepIndex = status => ORDER_STEPS.findIndex(s => s.id === status);
