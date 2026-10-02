import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Megaphone } from "lucide-react";
import { prefersReducedMotion } from "../lib/motion";

gsap.registerPlugin(useGSAP);

// Aviso destacado sobre el catálogo («Esta semana no despachamos»). Lo
// escriben los dueños en la pestaña Configuración del panel; vacío, no se
// monta. Entra bajando y el megáfono da un par de sacudones para que se
// note sin quedarse moviendo.
export default function NoticeBar({ text }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ delay: 0.2 })
        .from(root.current, { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: "power3.out" })
        .from(".nb-text", { autoAlpha: 0, x: -12, duration: 0.4, ease: "power2.out" }, "-=0.2")
        .to(".nb-icon", {
          keyframes: { rotation: [0, -18, 14, -10, 6, 0] },
          duration: 0.7,
          ease: "power1.inOut",
        }, "-=0.1");
    },
    { scope: root, dependencies: [text] }
  );

  return (
    <div ref={root} role="status" className="relative z-10 bg-night text-snow border-b-[3px] border-night">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-start sm:items-center gap-3">
        <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 bg-electric text-snow border-2 border-gold font-condensed uppercase tracking-[0.1em] text-xs">
          <Megaphone size={14} className="nb-icon" aria-hidden="true" />
          Aviso
        </span>
        <p className="nb-text m-0 min-w-0 text-sm sm:text-base font-semibold leading-snug whitespace-pre-line break-words">
          {text}
        </p>
      </div>
    </div>
  );
}
