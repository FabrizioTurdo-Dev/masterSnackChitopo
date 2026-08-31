import { useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/useLenis";

const VARIANTS = {
  primary: "bg-accent text-bg nb nb-press hover:bg-accent-light",
  secondary: "bg-surface-2 text-text nb nb-press hover:bg-surface-3",
  whatsapp:
    "bg-green text-[#06300f] border-[3px] border-[#106b2c] [box-shadow:5px_5px_0_#106b2c] nb-press hover:brightness-110",
};

// Botón con imán: en desktop sigue levemente al cursor. En touch y con
// reduced-motion queda quieto.
export default function Button({
  as = "a",
  variant = "primary",
  className = "",
  children,
  magnetic = true,
  ...props
}) {
  const ref = useRef(null);
  const Tag = as;

  const canMagnet = () =>
    magnetic &&
    !prefersReducedMotion() &&
    window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  const onMove = (e) => {
    if (!canMagnet() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    gsap.to(ref.current, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.25,
      y: (e.clientY - (r.top + r.height / 2)) * 0.35,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 font-condensed uppercase tracking-[0.06em] text-base sm:text-lg no-underline cursor-pointer ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
