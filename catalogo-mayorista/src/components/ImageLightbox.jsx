import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";

// Imagen a pantalla completa, pensada para leer la letra chica del envase
// (tabla nutricional, ingredientes). Se monta en <body> porque la ficha
// tiene transform y eso descoloca a los position:fixed de adentro.
export default function ImageLightbox({ src, alt, title, onClose }) {
  const prefersReduced = useReducedMotion();
  const [full, setFull] = useState(false);
  const dialog = useRef(null);
  const closeBtn = useRef(null);
  // En ref para que el efecto no se rearme (y robe el foco) cada vez que
  // la ficha vuelve a renderizar con un onClose nuevo.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    closeBtn.current?.focus();

    const onKey = e => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      // Foco atrapado: Tab no se escapa a la ficha que quedó detrás.
      if (e.key !== "Tab" || !dialog.current) return;
      const items = dialog.current.querySelectorAll("button, [tabindex='0']");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, []);

  return createPortal(
    <motion.div
      ref={dialog}
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.18 }}
      className="on-dark fixed inset-0 z-[400] bg-night/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-[3px] border-gold bg-night">
        <p className="font-condensed uppercase tracking-[0.06em] text-snow truncate m-0">{title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFull(f => !f)}
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 bg-night text-gold font-condensed uppercase tracking-[0.06em] text-xs border-2 border-gold hover:bg-gold hover:text-night transition-colors cursor-pointer"
          >
            {full ? <ZoomOut size={15} aria-hidden="true" /> : <ZoomIn size={15} aria-hidden="true" />}
            {full ? "Ajustar a pantalla" : "Tamaño real"}
          </button>
          <button
            ref={closeBtn}
            onClick={onClose}
            className="size-10 grid place-items-center bg-gold text-night border-2 border-gold hover:bg-snow transition-colors cursor-pointer"
            aria-label="Cerrar imagen"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        tabIndex={0}
        className="flex-1 overflow-auto focus-visible:outline-none"
        style={{ overscrollBehavior: "contain" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <img
          src={src}
          alt={alt}
          className={
            full
              ? "block max-w-none w-[1600px] mx-auto"
              : "block w-full max-w-[1600px] h-auto max-h-full object-contain mx-auto sm:p-6"
          }
        />
      </div>
    </motion.div>,
    document.body
  );
}
