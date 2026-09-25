// Textos de WhatsApp de los pedidos. Funciones puras (solo leen brands.js),
// así se pueden probar con Node sin levantar la app.
//
// Con productos de una sola marca el detalle va de corrido, como siempre;
// si el pedido mezcla marcas, los ítems se agrupan bajo el nombre de cada
// una para que quien arma el pedido en la fábrica no se confunda.

import { COMPANY, DEFAULT_BRAND, brandOf } from "../data/brands.js";

// "1 bolsa", "24 bolsas". Va acá y no desde store.js, que Node no puede importar.
const bolsas = n => `${n} ${n === 1 ? "bolsa" : "bolsas"}`;

// [[marca, ítems], ...] en el orden en que aparecen en el pedido. Los
// pedidos viejos no traen marca: son de la marca por defecto.
export function groupByBrand(items) {
  const groups = new Map();
  for (const item of items) {
    const id = item.brand || DEFAULT_BRAND;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(item);
  }
  return [...groups].map(([id, list]) => [brandOf(id), list]);
}

function detail(items, line) {
  const groups = groupByBrand(items);
  if (groups.length === 1) return items.map(line).join("\n");
  return groups
    .map(([brand, list]) => `*${brand.name}*\n${list.map(line).join("\n")}`)
    .join("\n\n");
}

// Pedido nuevo que el local le manda a la empresa desde el carro.
// `money` formatea montos; va en null mientras el catálogo no muestre precios.
export function newOrderMessage({ ref, shop, contact, phone, items, units, total, money }) {
  const line = item => {
    const bags = (item.units || 1) * item.qty;
    const base =
      `• ${item.name} ${item.grams} g — ${item.formatLabel} ×${item.units} · ` +
      `${item.qty} ${item.qty === 1 ? "bulto" : "bultos"} (${bolsas(bags)})`;
    return money ? `${base} = ${money(item.price * item.qty)}` : base;
  };

  let msg = `*Nuevo pedido mayorista — ${COMPANY.name}*\n`;
  msg += `*Código:* ${ref}\n\n`;
  msg += `*Local:* ${shop}\n`;
  msg += `*Contacto:* ${contact}\n`;
  if (phone) msg += `*Teléfono:* ${phone}\n`;
  msg += "\n*Pedido:*\n";
  msg += detail(items, line) + "\n";
  msg += "\n─────────────────\n";
  msg += `*Total: ${units} bolsas*`;
  msg += money ? `\n*Monto: ${money(total)}*` : "\n\n_Precios a confirmar por este medio._";
  return msg;
}

// Respuesta de los dueños desde el panel, sobre un pedido guardado.
export function followUpMessage(order, money) {
  const line = i =>
    `• ${i.name} — ${i.format} ×${i.units} · ` +
    `${i.qty} ${i.qty === 1 ? "bulto" : "bultos"} (${bolsas((i.units || 1) * i.qty)})`;
  const codigo = order.ref ? ` ${order.ref}` : "";
  const monto = money ? `\nMonto: ${money(order.total)}` : "";
  return (
    `¡Hola, ${order.client}! Te escribimos de ${COMPANY.name} por tu pedido${codigo}:\n\n` +
    detail(order.items || [], line) +
    `\n\nTotal: ${order.units} bolsas` +
    monto
  );
}
