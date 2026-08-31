import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/useLenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Reveal al entrar en viewport. `stagger` anima los hijos en cascada;
// `grid` los ordena en oleada para layouts de grilla.
export default function Reveal({
  as = "div",
  stagger = false,
  grid = false,
  delay = 0,
  className = "",
  children,
  ...props
}) {
  const ref = useRef(null);
  const Tag = as;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const el = ref.current;
      const targets = stagger ? el.children : el;
      const trigger = { trigger: el, start: "top 88%", once: true };

      if (stagger) {
        gsap.from(targets, {
          opacity: 0,
          y: 24,
          scale: grid ? 0.94 : 1,
          duration: grid ? 0.45 : 0.5,
          delay,
          ease: grid ? "back.out(1.4)" : "power2.out",
          stagger: grid ? { each: 0.06, from: "start", grid: "auto" } : 0.08,
          scrollTrigger: trigger,
        });
      } else {
        gsap.from(targets, {
          opacity: 0,
          y: 14,
          duration: 0.45,
          delay,
          ease: "power1.out",
          scrollTrigger: trigger,
        });
      }
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
