import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MessageCircle, Pause, Play } from "lucide-react";
import Button from "../ui/Button";
import FlavorChips from "../ui/FlavorChips";
import StampBadge from "../brand/StampBadge";
import { HeroBackdrop, HeroFloaters, BagStack } from "./FlavorStage";
import { CATALOGO_URL } from "../../lib/catalogoUrl";
import { WHATSAPP_LINK, flavorAccent } from "../../data/store";
import { prefersReducedMotion } from "../../lib/useLenis";
import { useBurst } from "../../lib/burst";
import PRODUCTS from "../../data/products";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const N = PRODUCTS.length;
// Segundos que se queda cada sabor mientras pasan solos.
const INTERVAL = 3.5;

const circle = (r, { x, y }) => `circle(${r} at ${x}px ${y}px)`;

// Afiche: titular gigante detrás, la bolsa viva al centro y chitopos
// flotando alrededor. Sin pin de scroll: la gente sentía eterno el hero
// pineado, así que los sabores pasan solos y el scroll suelta la página.
export default function Hero() {
  const root = useRef(null);
  const headline = useRef(null);
  const poster = useRef(null);
  const anchor = useRef(null);
  const intro = useRef(null);
  const float = useRef(null);
  const tilt = useRef(null);
  const stage = useRef(null);
  const bags = useRef([]);
  const base = useRef(null);
  const wipe = useRef(null);
  const label = useRef(null);
  const tag = useRef(null);
  const ctl = useRef(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const press = useRef(null);

  const [active, setActive] = useState(0);
  // Estado del autoplay para la barra de los chips: null sin animaciones.
  const [auto, setAuto] = useState(null);
  const [paused, setPaused] = useState(false);
  const [announce, setAnnounce] = useState("");
  const fire = useBurst();

  const burstAtBag = useCallback(
    (flavor) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      fire(r.left + r.width / 2, r.top + r.height * 0.4, flavorAccent(flavor));
    },
    [fire]
  );

  useGSAP(
    (_, contextSafe) => {
      const reduced = prefersReducedMotion();

      // Centro de la bolsa en coordenadas de la sección: de ahí nace el
      // círculo que tiñe el fondo.
      const bagCenter = () => {
        const r = stage.current.getBoundingClientRect();
        const R = root.current.getBoundingClientRect();
        return { x: r.left - R.left + r.width / 2, y: r.top - R.top + r.height / 2 };
      };

      let wipeTween = null;

      const show = contextSafe((i, manual = false) => {
        const from = activeRef.current;
        if (i === from) return;
        activeRef.current = i;
        setActive(i);
        // Solo se anuncia lo que eligió la persona: anunciar el autoplay
        // cada 3.5 s sería ruido para un lector de pantalla.
        if (manual) setAnnounce(`${PRODUCTS[i].name}, ${PRODUCTS[i].grams} gramos`);

        const next = PRODUCTS[i];
        const outEl = bags.current[from];
        const inEl = bags.current[i];

        // Si se cambia muy rápido, una bolsa puede quedar a medio vuelo.
        bags.current.forEach((el, k) => {
          if (k === i || k === from) return;
          gsap.killTweensOf(el);
          gsap.set(el, { autoAlpha: 0 });
        });

        if (reduced) {
          gsap.set(base.current, { backgroundColor: next.stage });
          gsap.set(outEl, { autoAlpha: 0 });
          gsap.set(inEl, { autoAlpha: 1 });
          return;
        }

        wipeTween?.progress(1);
        const c = bagCenter();
        gsap.set(wipe.current, { backgroundColor: next.stage, clipPath: circle("0%", c) });
        wipeTween = gsap.to(wipe.current, {
          clipPath: circle("150%", c),
          duration: 0.75,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(base.current, { backgroundColor: next.stage });
            gsap.set(wipe.current, { clipPath: circle("0%", c) });
          },
        });

        gsap.killTweensOf([outEl, inEl]);
        gsap.to(outEl, {
          yPercent: 30,
          rotation: 16,
          scale: 0.8,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.in",
        });
        gsap
          .timeline()
          .fromTo(
            inEl,
            { autoAlpha: 1, yPercent: -85, rotation: -14, scaleX: 0.9, scaleY: 0.9 },
            { yPercent: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.62, ease: "back.out(1.5)" },
            0.12
          )
          // Aplaste al aterrizar: es lo que le da peso a la bolsa.
          .to(
            inEl,
            {
              scaleY: 0.93,
              scaleX: 1.05,
              transformOrigin: "50% 100%",
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
            },
            0.5
          )
          .add(() => burstAtBag(next.flavor), 0.5);
      });

      if (reduced) {
        ctl.current = { go: (i) => show(i, true), sync() {} };
        return () => {
          ctl.current = null;
        };
      }

      // ── Entrada ─────────────────────────────────────────────────────
      // words,chars: con chars sueltos el navegador puede cortar una
      // palabra al medio. autoSplit vuelve a dividir cuando carga Anton.
      const split = SplitText.create(headline.current, {
        type: "words,chars",
        wordsClass: "hw",
        mask: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 130,
            rotation: 10,
            duration: 0.85,
            delay: 0.15,
            stagger: 0.035,
            ease: "expo.out",
          }),
      });

      const c0 = bagCenter();
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        base.current,
        { clipPath: circle("0%", c0) },
        { clipPath: circle("150%", c0), duration: 0.95, ease: "expo.inOut", clearProps: "clipPath" },
        0
      )
        // Solo transform en la bolsa: animar su opacidad atrasa el LCP.
        .from(intro.current, { yPercent: -130, rotation: -18, duration: 0.95, ease: "back.out(1.3)" }, 0.3)
        .add(() => burstAtBag(PRODUCTS[0].flavor), 0.95)
        .from(
          ".hero-floater-bob",
          { scale: 0, duration: 0.6, stagger: { each: 0.05, from: "random" }, ease: "back.out(2)" },
          0.85
        )
        .from(".hero-stamp", { scale: 0, rotation: -120, duration: 0.8, ease: "back.out(1.6)" }, 0.95)
        .from(".hero-fade", { autoAlpha: 0, y: 22, duration: 0.6, stagger: 0.08 }, 0.7);

      // ── En reposo ───────────────────────────────────────────────────
      gsap.fromTo(
        float.current,
        { y: 8, rotation: -1.2 },
        { y: -10, rotation: 1.2, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
      gsap.utils.toArray(".hero-floater-bob").forEach((el) => {
        gsap.to(el, {
          y: gsap.utils.random(-22, 22),
          x: gsap.utils.random(-12, 12),
          rotation: gsap.utils.random(-30, 30),
          duration: gsap.utils.random(2.2, 4.2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.5),
        });
      });

      // ── Salida con scroll, sin pin ──────────────────────────────────
      // Cada capa se va a su velocidad: da profundidad y la página suelta
      // el hero en un solo gesto.
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
        })
        .to(headline.current, { yPercent: -30, ease: "none" }, 0)
        .to(anchor.current, { y: -70, scale: 0.92, ease: "none" }, 0)
        .to(".hero-floaters-front", { y: -220, ease: "none" }, 0)
        .to(".hero-floaters-back", { y: -60, ease: "none" }, 0);

      // ── Autoplay ────────────────────────────────────────────────────
      let hover = false;
      let focused = false;
      let inView = true;
      let cycle = 0;

      const canPlay = () => !pausedRef.current && !hover && !focused && inView && !document.hidden;

      const timer = gsap.delayedCall(INTERVAL, () => {
        show((activeRef.current + 1) % N);
        restart();
      });

      const sync = () => {
        const playing = canPlay();
        timer.paused(!playing);
        setAuto({ cycle, paused: !playing, duration: INTERVAL });
      };

      function restart() {
        cycle += 1;
        timer.restart(true);
        sync();
      }

      // Fuera de pantalla no tiene sentido seguir cambiando de sabor.
      const view = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          sync();
        },
      });
      inView = view.isActive;

      ctl.current = {
        go(i) {
          show(((i % N) + N) % N, true);
          restart();
        },
        sync,
      };

      const stageEl = stage.current;
      const rootEl = root.current;
      const onVisibility = () => sync();

      // Con el mouse encima de la bolsa, el sabor no cambia solo.
      const onEnter = (e) => {
        if (e.pointerType !== "mouse") return;
        hover = true;
        sync();
        gsap.to(label.current, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2)" });
      };
      const onLeave = (e) => {
        if (e.pointerType !== "mouse") return;
        hover = false;
        sync();
        gsap.to(label.current, { scale: 0, autoAlpha: 0, duration: 0.2, ease: "power2.in" });
      };

      // Con foco de teclado adentro tampoco: quien navega con teclado tiene
      // que poder leer el sabor que eligió.
      const onFocusIn = (e) => {
        focused = e.target.matches(":focus-visible");
        sync();
      };
      const onFocusOut = (e) => {
        if (rootEl.contains(e.relatedTarget)) return;
        focused = false;
        sync();
      };

      document.addEventListener("visibilitychange", onVisibility);
      stageEl.addEventListener("pointerenter", onEnter);
      stageEl.addEventListener("pointerleave", onLeave);
      rootEl.addEventListener("focusin", onFocusIn);
      rootEl.addEventListener("focusout", onFocusOut);

      // ── Mouse: la bolsa se inclina y los chitopos se corren ─────────
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (min-width: 1024px)", () => {
        gsap.set(label.current, { scale: 0, autoAlpha: 0 });
        const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.6, ease: "power3" });
        const lx = gsap.quickTo(label.current, "x", { duration: 0.25, ease: "power3" });
        const ly = gsap.quickTo(label.current, "y", { duration: 0.25, ease: "power3" });
        const floaters = gsap.utils.toArray(".hero-floater").map((el) => {
          const k = (Number(el.dataset.depth) + 1) * 14;
          return {
            k,
            x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
            y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
          };
        });

        const onMove = (e) => {
          const R = rootEl.getBoundingClientRect();
          const nx = (e.clientX - R.left) / R.width - 0.5;
          const ny = (e.clientY - R.top) / R.height - 0.5;
          ry(nx * 18);
          rx(-ny * 12);
          floaters.forEach((f) => {
            f.x(nx * -f.k);
            f.y(ny * -f.k);
          });
          const P = poster.current.getBoundingClientRect();
          lx(e.clientX - P.left + 18);
          ly(e.clientY - P.top + 18);
        };
        const onOut = () => {
          rx(0);
          ry(0);
          floaters.forEach((f) => {
            f.x(0);
            f.y(0);
          });
        };

        rootEl.addEventListener("pointermove", onMove);
        rootEl.addEventListener("pointerleave", onOut);
        return () => {
          rootEl.removeEventListener("pointermove", onMove);
          rootEl.removeEventListener("pointerleave", onOut);
        };
      });

      restart();

      return () => {
        ctl.current = null;
        split.revert();
        document.removeEventListener("visibilitychange", onVisibility);
        stageEl.removeEventListener("pointerenter", onEnter);
        stageEl.removeEventListener("pointerleave", onLeave);
        rootEl.removeEventListener("focusin", onFocusIn);
        rootEl.removeEventListener("focusout", onFocusOut);
        setAuto(null);
      };
    },
    { scope: root }
  );

  // El botón de pausa manda sobre todo lo demás (WCAG 2.2.2).
  useEffect(() => {
    pausedRef.current = paused;
    ctl.current?.sync();
  }, [paused]);

  // La etiqueta del sabor entra rotada con cada cambio.
  useEffect(() => {
    if (prefersReducedMotion() || !tag.current) return;
    gsap.fromTo(
      tag.current,
      { scale: 0, rotation: -30 },
      { scale: 1, rotation: -6, duration: 0.55, delay: 0.45, ease: "back.out(2)" }
    );
  }, [active]);

  const go = (i) => ctl.current?.go(i);

  // Deslizar la bolsa cambia de sabor; tocarla, pasa al siguiente con
  // estallido. Se hace a mano con pointer events y touch-action: pan-y, así
  // el gesto vertical sigue scrolleando la página.
  const onPointerDown = (e) => {
    press.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(activeRef.current + (dx < 0 ? 1 : -1));
    } else if (Math.hypot(dx, dy) < 10) {
      burstAtBag(PRODUCTS[activeRef.current].flavor);
      go(activeRef.current + 1);
    }
  };
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, Enter: 1, " ": 1 }[e.key];
    if (!step) return;
    e.preventDefault();
    go(activeRef.current + step);
  };

  const product = PRODUCTS[active];
  const badge = product.status === "proximamente" ? "Próximamente" : product.tag;

  return (
    <section
      id="inicio"
      ref={root}
      aria-roledescription="carrusel"
      aria-label="Sabores de Chitopo"
      className="hero relative overflow-hidden bg-ink min-h-[100svh] flex flex-col"
      style={{ "--hero-accent": product.snack }}
    >
      <HeroBackdrop baseRef={base} wipeRef={wipe} initial={PRODUCTS[0].stage} />
      <HeroFloaters layer="back" />

      <div className="relative z-10 flex-1 flex flex-col contenedor pt-20 sm:pt-24 pb-6 sm:pb-8">
        <p className="hero-fade self-center m-0 bg-cream border-[3px] border-ink px-3 py-1 font-condensed uppercase tracking-[0.2em] text-[11px] sm:text-xs text-ink shadow-[3px_3px_0_var(--color-ink)]">
          Snack 100% chileno · La Pintana
        </p>

        <div ref={poster} className="relative flex-1 flex flex-col items-center justify-center min-h-0 lg:min-h-[440px] mt-4 lg:mt-2">
          {/* Dos líneas decididas a mano. En computadora "El sufle," va
              arriba de lado a lado y la bolsa apenas le pisa el pie; "po'"
              cae abajo a la derecha de la bolsa, así se lee en diagonal.
              En teléfono quedan apiladas arriba. */}
          <h1
            ref={headline}
            className="hero-title font-title uppercase m-0 leading-[0.86] text-[clamp(4.2rem,21vw,7rem)] lg:text-[clamp(7rem,min(14.5vw,24svh),15rem)] text-center w-full lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-between"
          >
            <span className="block whitespace-nowrap">El sufle,</span>
            <span className="block whitespace-nowrap translate-x-[20%] lg:translate-x-[27%]">po'</span>
          </h1>

          <div ref={anchor} className="relative z-10 mt-3 sm:mt-0 lg:mt-0 lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2">
            <div ref={intro}>
              <div ref={float} className="[perspective:1100px]">
                <div ref={tilt} className="relative">
                  <div
                    ref={stage}
                    tabIndex={0}
                    role="group"
                    aria-label={`${product.name}. Toca la bolsa o usa las flechas para cambiar de sabor.`}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => (press.current = null)}
                    onKeyDown={onKeyDown}
                    className="relative h-[min(36svh,340px)] lg:h-[min(47svh,560px)] aspect-[0.7] cursor-pointer select-none touch-pan-y"
                  >
                    <BagStack products={PRODUCTS} itemRefs={bags} />

                    <StampBadge className="hero-stamp absolute top-[34%] -right-10 w-20 sm:w-24 lg:top-[30%] lg:right-auto lg:-left-32 lg:w-32 z-10" />

                    <div
                      ref={tag}
                      key={active}
                      className="absolute -left-8 sm:-left-12 lg:-left-28 bottom-[10%] z-10 flex flex-col items-start gap-1.5 -rotate-6 pointer-events-none"
                    >
                      <span className="bg-ink text-cream font-condensed uppercase text-lg sm:text-2xl leading-none px-3 py-2 border-[3px] border-ink shadow-[4px_4px_0_var(--color-cream)] whitespace-nowrap">
                        {product.short} · {product.grams}
                        <span className="normal-case"> g</span>
                      </span>
                      {badge && (
                        <span className="bg-fire text-cream font-condensed uppercase text-xs sm:text-sm leading-none px-2 py-1.5 border-[3px] border-ink rotate-6 whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <span
            ref={label}
            className="hidden lg:inline-block absolute top-0 left-0 z-30 pointer-events-none bg-cream text-ink border-[3px] border-ink px-2.5 py-1 font-condensed uppercase tracking-[0.08em] text-sm shadow-[3px_3px_0_var(--color-ink)] invisible"
            aria-hidden="true"
          >
            ¡Dale un toque!
          </span>
        </div>

        <div className="relative z-30 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col gap-3 min-w-0">
            <p className="hero-fade m-0 text-ink text-sm sm:text-base font-semibold max-w-md">
              Suflés horneados y maní, hechos por una pyme de La Pintana. ¿Cuál es el tuyo?
            </p>
            <div className="hero-fade flex items-center gap-2 min-w-0">
              <FlavorChips products={PRODUCTS} active={active} onSelect={go} auto={auto} />
              {auto && (
                <button
                  type="button"
                  onClick={() => setPaused((v) => !v)}
                  aria-label={paused ? "Reanudar el cambio automático de sabores" : "Pausar el cambio automático de sabores"}
                  className="shrink-0 mb-1.5 grid place-items-center size-11 bg-cream text-ink border-[3px] border-ink shadow-[3px_3px_0_var(--color-ink)] cursor-pointer nb-press"
                >
                  {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>

          <div className="hero-fade flex gap-3">
            <Button
              href={CATALOGO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <span className="sm:hidden">Ver catálogo</span>
              <span className="hidden sm:inline">Ver catálogo mayorista</span>
            </Button>
            <Button
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              className="flex-1 sm:flex-none"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Escríbenos
            </Button>
          </div>
        </div>
      </div>

      <HeroFloaters layer="front" />

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
