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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={prefersReduced ? false : { scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.2 }}
        className="bg-surface rounded-2xl w-full border border-border shadow-2xl"
        style={{ maxWidth: wide ? 720 : 480, maxHeight: "90vh" }}
      >
        <div className="overflow-y-auto max-h-[90vh]" style={{ overscrollBehavior: "contain" }}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
            <h2 className="text-base font-bold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-muted hover:bg-surface-3 hover:text-text transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Cerrar"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
