import { DEV_CREDIT } from "../data/store";

// Errores de la base → castellano para el panel. El detalle técnico va a la
// consola; en pantalla, lo que el dueño puede hacer. `action` completa la
// frase: "No se pudo guardar el producto…".
export function friendlyError(error, action) {
  const msg = (error?.message || "").toLowerCase();
  const code = error?.code;

  if (msg.includes("failed to fetch") || msg.includes("load failed") || msg.includes("network")) {
    return `No se pudo ${action}: revisa la conexión a internet y vuelve a intentar.`;
  }
  if (code === "23505" || msg.includes("duplicate key")) {
    return `No se pudo ${action}: ya existe un producto con ese nombre.`;
  }
  if (msg.includes("jwt")) {
    return "Tu sesión venció. Cierra sesión, vuelve a entrar y prueba de nuevo.";
  }
  if (error?.noRows || code === "42501" || msg.includes("row-level security") || msg.includes("permission denied")) {
    return `No se pudo ${action}: tu cuenta no tiene permiso para guardar cambios. Avísale a ${DEV_CREDIT.name}.`;
  }
  return `No se pudo ${action}. Si vuelve a pasar, avísale a ${DEV_CREDIT.name}.`;
}

// RLS no da error cuando filtra una escritura: devuelve 0 filas. Sin filas
// es que la base no aceptó el cambio.
export function noRowsError() {
  return Object.assign(new Error("La base no devolvió filas (RLS)"), { noRows: true });
}
