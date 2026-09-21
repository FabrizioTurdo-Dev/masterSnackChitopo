import { useCallback, useEffect, useRef } from "react";
import { useBurst } from "./burst";

const INTENT_MS = 110;

// Dispara el estallido desde el centro de un elemento cuando el mouse se
// queda sobre él, y al tocarlo en pantallas táctiles.
export function useBurstOnHover(accent) {
  const fire = useBurst();
  const ref = useRef(null);
  const timer = useRef(null);

  const fireFromCenter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Un poco arriba del centro: las bolsas tienen el cuerpo en la mitad superior.
    fire(r.left + r.width / 2, r.top + r.height * 0.42, accent);
  }, [fire, accent]);

  const onPointerEnter = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      // Esperar un pelo confirma que el mouse se quedó y no que cruzó
      // la grilla en diagonal camino a otra cosa.
      clearTimeout(timer.current);
      timer.current = setTimeout(fireFromCenter, INTENT_MS);
    },
    [fireFromCenter]
  );

  const onPointerLeave = useCallback(() => clearTimeout(timer.current), []);

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === "mouse") return;
      fireFromCenter();
    },
    [fireFromCenter]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  // onPointerEnter y no onMouseOver: mouseover burbujea desde cada hijo,
  // así que se re-dispararía al pasar sobre la imagen, el título, etc.
  return { ref, handlers: { onPointerEnter, onPointerLeave, onPointerDown }, fireFromCenter };
}
