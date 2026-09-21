import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, wide }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.2 }}
      className="fixed inset-0 bg-ink/70 backdrop-blur-[2px] flex items-center justify-center z-[200] p-3 sm:p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={prefersReduced ? false : { scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={prefersReduced ? { opacity: 1 } : { scale: 0.96, y: 10, opacity: 0 }}
        transition={prefersReduced ? { duration: 0 } : { type: "spring", damping: 24, stiffness: 320 }}
        className="bg-cream nb w-full"
        style={{ maxWidth: wide ? 720 : 480, maxHeight: "90vh" }}
      >
        <div className="overflow-y-auto max-h-[90vh]" style={{ overscrollBehavior: "contain" }}>
          <div className="flex items-center justify-between gap-4 pl-4 sm:pl-6 pr-3 py-3 border-b-[3px] border-ink sticky top-0 bg-cream z-10">
            <h2 className="font-title uppercase text-xl text-ink m-0 truncate">{title}</h2>
            <button
              onClick={onClose}
              className="size-10 shrink-0 grid place-items-center bg-cream text-ink border-2 border-ink hover:bg-cream-2 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
