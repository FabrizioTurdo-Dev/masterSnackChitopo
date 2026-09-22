import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pause, Play, Factory, ShieldCheck, Flame } from "lucide-react";
import InstagramIcon from "../brand/InstagramIcon";
import StampBadge from "../brand/StampBadge";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import { STORE_CONFIG } from "../../data/store";
import { prefersReducedMotion } from "../../lib/useLenis";
import { useBurst } from "../../lib/burst";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Los dos videos cuentan el proceso en orden: primero se hace el suflé,
// después se embolsa. Los genera `npm run media` en el catálogo.
const PASOS = [
  {
    n: "01",
    video: "/video/fabrica-produccion.mp4",
    title: "Sale de la extrusora",
    text: "Maíz adentro, suflé afuera. Después pasa al bombo, donde agarra el sabor.",
    label: "Video de la extrusora sacando suflés y del bombo donde se sazonan",
  },
  {
    n: "02",
    video: "/video/fabrica-envasado.mp4",
    poster: "/video/fabrica-envasado.webp",
    title: "Directo a la bolsa",
    text: "La envasadora pesa, llena y sella. De ahí salen las cajas a los almacenes.",
    label: "Video de la envasadora sellando bolsas de Chitopo en la cinta",
  },
];

const DATOS = [
  { icon: Factory, text: "Galpón propio en La Pintana" },
  { icon: ShieldCheck, text: "Resolución sanitaria SESMA al día" },
];

// Un video en loop que solo corre mientras se ve. Sin animaciones
// reducidas arranca solo; con ellas espera a que la persona le dé play.
// El botón existe siempre: nada se mueve más de 5 s sin poder pararlo.
function VideoFabrica({ paso, className = "" }) {
  const ref = useRef(null);
  const [manualPause, setManualPause] = useState(() => prefersReducedMotion());
  const [playing, setPlaying] = useState(false);
  const visible = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React no refleja `muted` como atributo y sin eso el navegador
    // bloquea el play() automático.
    v.muted = true;

    const sync = () => {
      if (visible.current && !manualPause) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    sync();

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("playing", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [manualPause]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      setManualPause(true);
      v.pause();
    } else {
      setManualPause(false);
      v.play().catch(() => {});
    }
  };

  return (
    <figure className={`fab-card relative m-0 ${className}`}>
      <div className="nb bg-ink">
        <div className="fab-media relative aspect-[3/4] overflow-hidden">
          <video
            ref={ref}
            src={paso.video}
            poster={paso.poster}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-label={paso.label}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1.5 bg-ink/85 px-2 py-1 font-condensed uppercase tracking-[0.12em] text-[10px] sm:text-xs text-cream">
            <span
              className={`size-2 rounded-full bg-red ${playing ? "motion-safe:animate-pulse" : "opacity-40"}`}
              aria-hidden="true"
            />
            Rec
            <span className="hidden sm:inline text-cream/60">· La Pintana</span>
          </span>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pausar: ${paso.title}` : `Reproducir: ${paso.title}`}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 inline-flex items-center justify-center size-11 bg-gold text-ink border-[3px] border-ink cursor-pointer nb-press"
          >
            {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>
        </div>

        <figcaption className="flex items-baseline gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 border-t-[3px] border-gold">
          <span className="font-condensed text-gold text-lg sm:text-2xl leading-none">{paso.n}</span>
          <span className="font-condensed uppercase text-cream text-sm sm:text-lg leading-tight">
            {paso.title}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

export default function Fabrica() {
  const root = useRef(null);
  const fire = useBurst();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions;
          if (!motion) return;

          gsap.from(".fab-fade", {
            autoAlpha: 0,
            y: 28,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
          });

          // El video se destapa de abajo hacia arriba, como una persiana.
          // El clip va en el interior y no en el marco, para no cortar la
          // sombra dura del borde.
          gsap.fromTo(
            ".fab-media",
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.18,
              clearProps: "clipPath",
              scrollTrigger: { trigger: ".fab-videos", start: "top 80%", once: true },
            }
          );

          // La palabra de fondo hace una onda vertical continua (arriba-abajo),
          // independiente del scroll. Solo en desktop para no complicar mobile.
          if (desktop) {
            gsap.to(".fab-word", {
              y: 40,        // Amplitud: sube/baja 40px desde el centro
              duration: 5,  // Ciclo completo: 5 segundos
              ease: "sine.inOut", // Movimiento natural, sinusoidal
              repeat: -1,   // Infinito
              yoyo: true,   // Arriba → abajo → arriba
            });
          }

          // El sello de Master Snacks cae acelerando y se estampa sobre los
          // videos: en el golpe se aplasta, la grilla acusa el impacto y
          // saltan chitopos.
          const sello = root.current.querySelector(".fab-sello");
          gsap
            .timeline({ scrollTrigger: { trigger: ".fab-videos", start: "top 65%", once: true } })
            .fromTo(
              sello,
              { autoAlpha: 0, scale: 2.6, rotate: -38 },
              { autoAlpha: 1, scale: 1, rotate: -12, duration: 0.42, ease: "power4.in" }
            )
            .addLabel("golpe")
            .add(() => {
              const r = sello.getBoundingClientRect();
              fire(r.left + r.width / 2, r.top + r.height / 2, "var(--color-fire)");
            }, "golpe")
            .to(sello, { scale: 0.9, duration: 0.07, ease: "power1.out" }, "golpe")
            .to(sello, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" })
            .fromTo(
              ".fab-videos",
              { y: 0 },
              { y: 6, duration: 0.06, yoyo: true, repeat: 1, ease: "power1.inOut" },
              "golpe"
            );

          if (!desktop) return;

          // Dos velocidades distintas y la inclinación que se endereza al
          // llegar al centro: da profundidad sin pinear nada.
          const cards = gsap.utils.toArray(".fab-card");
          const recorrido = [
            { from: { y: 70, rotate: -5 }, to: { y: -50, rotate: -1.5 } },
            { from: { y: 150, rotate: 5 }, to: { y: 10, rotate: 1.5 } },
          ];
          cards.forEach((card, i) => {
            const r = recorrido[i];
            if (!r) return;
            gsap.fromTo(card, r.from, {
              ...r.to,
              ease: "none",
              scrollTrigger: {
                trigger: ".fab-videos",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            });
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      id="fabrica"
      ref={root}
      className="on-dark relative scroll-mt-20 overflow-hidden max-h-[90vh] bg-ink text-cream border-y-[3px] border-ink py-8 sm:py-12 lg:py-16"
    >
      <div className="relative isolate max-w-6xl mx-auto px-3 sm:px-4 lg:px-5 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        <div>
          <p className="fab-fade font-condensed uppercase tracking-[0.22em] text-gold text-xs sm:text-sm mb-3">
            La fábrica
          </p>
          <h2 className="fab-fade font-title uppercase text-5xl sm:text-7xl lg:text-8xl leading-[0.9] text-cream m-0">
            La máquina
            <br />
            que no para
          </h2>
          <p className="fab-fade text-cream/80 text-base sm:text-lg leading-relaxed mt-5 max-w-md">
            Así se ve el galpón un día cualquiera. Sin estudio ni actores: el maíz entra
            a la máquina, sale suflé, agarra sabor y cae directo a la bolsa.
          </p>

          <ol className="list-none p-0 m-0 mt-8 flex flex-col gap-5">
            {PASOS.map((p) => (
              <li key={p.n} className="fab-fade flex gap-4">
                <span className="font-condensed text-3xl sm:text-4xl leading-none text-gold shrink-0 w-12">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-title uppercase text-xl sm:text-2xl text-cream m-0 leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-cream/75 text-sm sm:text-base leading-relaxed m-0 mt-1">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="list-none p-0 m-0 mt-8 flex flex-wrap gap-2">
            {DATOS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="fab-fade inline-flex items-center gap-2 bg-cream/5 border-[3px] border-gold/40 px-3 py-2 text-sm text-cream"
              >
                <Icon size={16} className="text-gold shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          <a
            href={`https://instagram.com/${STORE_CONFIG.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fab-fade mt-7 inline-flex items-center gap-2 min-h-[44px] font-condensed uppercase tracking-[0.08em] text-gold hover:text-cream no-underline"
          >
            <InstagramIcon size={18} />
            Más del día a día en @{STORE_CONFIG.instagram}
          </a>
        </div>

        {/* Palabra de fondo. En celular y tablet va en su propia franja,
            de borde a borde entre el texto y los videos. En escritorio sale
            del flujo y baja a la franja libre bajo los videos, pegada al
            borde izquierdo de la pantalla: al medio de la sección los
            videos la tapaban. El -z-10 (con el isolate de la grilla) la
            deja detrás del texto. */}
        <span
          aria-hidden="true"
          className="fab-word -z-10 pointer-events-none select-none block -mx-4 sm:-mx-6 -my-4 lg:m-0 lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center whitespace-nowrap font-condensed uppercase leading-none text-gold/12 text-[clamp(4rem,15vw,15rem)] [-webkit-text-stroke:2px_rgb(255_194_14/0.50)]"
        >
          La Pintana · La Pintana · La Pintana
        </span>

        <div className="fab-videos relative grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 items-start">
          <VideoFabrica paso={PASOS[0]} />
          <VideoFabrica paso={PASOS[1]} className="mt-10 sm:mt-16" />

          {/* Va en el hueco que deja la segunda tarjeta, que arranca más abajo.
              La inclinación va inline y no con una clase: Tailwind usa la
              propiedad `rotate`, que se sumaría al transform de GSAP. */}
          <div
            className="fab-sello absolute z-20 -top-2 -right-2 w-24 sm:-top-8 sm:right-0 sm:w-36 lg:w-44 lg:-top-12 lg:-right-6"
            style={{ transform: "rotate(-12deg)" }}
          >
            <StampBadge text="Hecho por Master Snacks · La Pintana · " className="relative w-full">
              <MasterSnacksLogo variant="plain" alt="" className="w-full h-auto" />
            </StampBadge>
          </div>
        </div>
      </div>
    </section>
  );
}
