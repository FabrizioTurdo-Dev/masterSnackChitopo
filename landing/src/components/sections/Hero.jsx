import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowDown, MessageCircle } from "lucide-react";
import Logo from "../brand/Logo";
import Button from "../ui/Button";
import FlavorDots from "../ui/FlavorDots";
import { FlavorBackground, FlavorFrame } from "./FlavorStage";
import { CATALOGO_URL } from "../../lib/catalogoUrl";
import { WHATSAPP_LINK, FLAVOR_ACCENTS } from "../../data/store";
import { prefersReducedMotion, getLenis } from "../../lib/useLenis";
import { useBurst } from "../../lib/burst";
import PRODUCTS from "../../data/products";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const N = PRODUCTS.length;

export default function Hero() {
  const root = useRef(null);
  const headline = useRef(null);
  const frame = useRef(null);
  const track = useRef(null);
  const panels = useRef([]);
  const stRef = useRef(null);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  const fire = useBurst();

  const burstAtFrame = useCallback(
    (flavor) => {
      const el = frame.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      fire(r.left + r.width / 2, r.top + r.height * 0.45, FLAVOR_ACCENTS[flavor]);
    },
    [fire]
  );

  // Cada cambio de sabor dispara el estallido, así el gesto de marca deja
  // de ser un detalle del hover y pasa a ser el latido de la secuencia.
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    burstAtFrame(PRODUCTS[active].flavor);
  }, [active, burstAtFrame]);

  const goTo = useCallback((i) => {
    const st = stRef.current;
    if (st) {
      // En computadora la posición del sabor es un punto del recorrido pineado.
      const y = st.start + (st.end - st.start) * (i / (N - 1));
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo(0, y);
      return;
    }
    // En teléfono alcanza con desplazar el riel.
    panels.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // words,chars y no solo chars: con chars sueltos el navegador puede
      // cortar la línea entre cualquier par de letras y parte las palabras
      // al medio. autoSplit vuelve a dividir cuando termina de cargar Anton.
      const split = SplitText.create(headline.current, {
        type: "words,chars",
        mask: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 120,
            rotateX: -55,
            duration: 0.7,
            stagger: { each: 0.016, from: "start" },
            ease: "expo.out",
          }),
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-stage", { scale: 1.04, duration: 1, ease: "power2.out" }, 0)
        // Sin tocar opacity en la bolsa: animarla atrasa el LCP.
        .from(".hero-frame-wrap", { yPercent: 12, duration: 0.9 }, 0.22)
        .from(".hero-fade", { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.09 }, 0.45)
        .add(() => burstAtFrame(PRODUCTS[0].flavor), 0.62)
        .to(".hero-cue", { y: 6, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 }, 1.1);

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          // ~2 pantallas para los 5 sabores: medio viewport por sabor.
          end: () => "+=" + window.innerHeight * 2,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Sin snap la secuencia queda a mitad de camino entre dos sabores.
          snap: {
            snapTo: 1 / (N - 1),
            duration: { min: 0.15, max: 0.35 },
            delay: 0.02,
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            // gsap.set y no setState: esto corre en cada frame.
            gsap.set(track.current, { xPercent: -100 * self.progress * (N - 1) });
            const i = Math.round(self.progress * (N - 1));
            if (i !== activeRef.current) {
              activeRef.current = i;
              setActive(i);
            }
          },
        });
        stRef.current = st;

        return () => {
          stRef.current = null;
          st.kill();
          // Si se achica la ventana a teléfono, el riel tiene que volver a
          // cero o el scroll nativo arranca corrido.
          gsap.set(track.current, { clearProps: "transform" });
        };
      });

      // useGSAP ya revierte el matchMedia junto con su contexto: llamar a
      // mm.revert() acá además lo mata en el segundo montaje de StrictMode
      // y el pin nunca se vuelve a crear.
      return () => {
        split.revert();
        tl.kill();
      };
    },
    { scope: root }
  );

  // En teléfono no hay pin: el sabor sale de qué panel quedó centrado en
  // el riel. Con snap, el panel es scrollLeft dividido el ancho del marco,
  // que es más directo y predecible que un IntersectionObserver por umbral.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;

    const onScroll = () => {
      // Solo ignorar cuando el riel lo mueve GSAP. Sin animaciones no hay
      // pin ni siquiera en computadora, y ahí el marco vuelve a deslizarse:
      // la condición tiene que ser la misma que la del CSS.
      if (
        window.matchMedia("(min-width: 1024px)").matches &&
        !prefersReducedMotion()
      ) {
        return;
      }
      const w = el.clientWidth;
      if (!w) return;
      const i = Math.max(0, Math.min(N - 1, Math.round(el.scrollLeft / w)));
      if (i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="inicio"
      ref={root}
      className="hero-stage relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-12"
    >
      <FlavorBackground products={PRODUCTS} active={active} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
        <div>
          <Logo height={56} className="hero-fade mb-6 sm:hidden" />

          <p className="hero-fade font-condensed uppercase tracking-[0.24em] text-accent text-xs sm:text-sm mb-4">
            Snack 100% chileno · La Pintana
          </p>

          {/* Dos líneas decididas a mano y con nowrap, en vez de dejar que
              el navegador elija dónde cortar. Tamaño fluido para que nunca
              desborde la columna en anchos intermedios. */}
          <h1
            ref={headline}
            className="font-condensed uppercase leading-[0.84] text-text m-0 text-[clamp(3rem,10vw,7.5rem)]"
          >
            <span className="block whitespace-nowrap">El sufle,</span>
            <span className="block whitespace-nowrap">po'</span>
          </h1>

          <p className="hero-fade text-muted text-base sm:text-lg leading-relaxed mt-5 max-w-lg">
            Suflés horneados, maní y lo que se viene. Hechos acá, por una pyme de verdad,
            con harto sabor y cero pretensión.
          </p>

          <div className="hero-fade flex flex-col sm:flex-row gap-4 mt-7">
            <Button href={CATALOGO_URL} target="_blank" rel="noopener noreferrer">
              Ver catálogo mayorista
            </Button>
            <Button
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Escribinos
            </Button>
          </div>

          <p className="hero-fade hero-cue flex items-center gap-2 text-faint text-xs mt-8">
            <ArrowDown size={14} aria-hidden="true" />
            Seguí bajando y pasan los 5 sabores
          </p>
        </div>

        <div className="hero-frame-wrap flex flex-col items-center lg:items-end gap-5">
          <FlavorFrame
            products={PRODUCTS}
            frameRef={frame}
            trackRef={track}
            panelRefs={panels}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") burstAtFrame(PRODUCTS[active].flavor);
            }}
          />
          <div className="hero-fade w-full max-w-[460px]">
            <FlavorDots products={PRODUCTS} active={active} onSelect={goTo} />
          </div>
        </div>
      </div>
    </section>
  );
}
