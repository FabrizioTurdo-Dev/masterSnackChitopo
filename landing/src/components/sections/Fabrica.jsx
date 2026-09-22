import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pause, Play, Factory, ShieldCheck, Flame } from "lucide-react";
import InstagramIcon from "../brand/InstagramIcon";
import StampBadge from "../brand/StampBadge";
import MasterSnacksLogo from "../brand/MasterSnacksLogo";
import WaveMarquee from "../ui/WaveMarquee";
import { CHITOPO } from "../../data/brands";
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
      <div className="nb bg-night">
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

          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1.5 bg-night/85 px-2 py-1 font-condensed uppercase tracking-[0.12em] text-[10px] sm:text-xs text-snow">
            <span
              className={`size-2 rounded-full bg-red ${playing ? "motion-safe:animate-pulse" : "opacity-40"}`}
              aria-hidden="true"
            />
            Rec
            <span className="hidden sm:inline text-snow/60">· La Pintana</span>
          </span>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pausar: ${paso.title}` : `Reproducir: ${paso.title}`}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 inline-flex items-center justify-center size-11 bg-gold text-night border-[3px] border-night cursor-pointer nb-press"
          >
            {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>
        </div>

        <figcaption className="flex items-baseline gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 border-t-[3px] border-gold">
          <span className="font-condensed text-gold text-lg sm:text-2xl leading-none">{paso.n}</span>
          <span className="font-condensed uppercase text-snow text-sm sm:text-lg leading-tight">
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

          // La palabra de fondo la mueve <WaveMarquee/>, que tiene su propio
          // loop y su propio empujón con el scroll.

          // El sello de la fábrica cae acelerando y se estampa sobre los
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
              fire(r.left + r.width / 2, r.top + r.height / 2, "var(--color-electric)");
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
          // Recorrido corto: la sección ahora entra en 90vh y recorta lo que
          // se salga, así que las tarjetas no pueden viajar tanto.
          const recorrido = [
            { from: { y: 30, rotate: -4 }, to: { y: -25, rotate: -1.5 } },
            { from: { y: 55, rotate: 4 }, to: { y: -5, rotate: 1.5 } },
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
      className="on-dark relative scroll-mt-20 overflow-hidden halftone-night text-snow border-y-[3px] border-night py-12 sm:py-16 lg:py-[clamp(1.25rem,3.5svh,3rem)]"
    >
      {/* Carrusel de fondo, al medio de la sección. Va antes de la grilla y
          sin z-index: los dos están posicionados, así que el que viene
          después en el DOM queda encima. */}
      <WaveMarquee
        text="La Pintana"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-condensed text-[clamp(3.5rem,min(11vw,16svh),9rem)]"
      />

      <div className="relative contenedor grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
        <div>
          <p className="fab-fade font-condensed uppercase tracking-[0.22em] text-gold text-xs sm:text-sm mb-3">
            La fábrica
          </p>
          {/* En escritorio el tamaño también depende del alto de pantalla:
              la sección tiene que entrar en 90vh. */}
          <h2 className="fab-fade font-title uppercase text-5xl sm:text-7xl lg:text-[clamp(3rem,min(5.6vw,10.5svh),5.5rem)] leading-[0.9] text-snow m-0">
            La máquina
            <br />
            que no para
          </h2>
          <p className="fab-fade text-snow/80 text-base sm:text-lg lg:text-base xl:text-lg leading-relaxed mt-5 lg:mt-[clamp(0.75rem,2.2svh,1.75rem)] max-w-md lg:max-w-xl">
            Así se ve el galpón un día cualquiera. Sin estudio ni actores: el maíz entra
            a la máquina, sale suflé, agarra sabor y cae directo a la bolsa.
          </p>

          <ol className="list-none p-0 m-0 mt-8 lg:mt-[clamp(0.75rem,2.2svh,1.75rem)] flex flex-col gap-5 lg:gap-[clamp(0.5rem,1.8svh,1.25rem)]">
            {PASOS.map((p) => (
              <li key={p.n} className="fab-fade flex gap-4">
                <span className="font-condensed text-3xl sm:text-4xl leading-none text-gold shrink-0 w-12">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-title uppercase text-xl sm:text-2xl lg:text-xl xl:text-2xl text-snow m-0 leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-snow/75 text-sm sm:text-base lg:text-sm xl:text-base leading-relaxed m-0 mt-1">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="list-none p-0 m-0 mt-8 lg:mt-[clamp(0.75rem,2.2svh,1.75rem)] flex flex-wrap gap-2">
            {DATOS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="fab-fade inline-flex items-center gap-2 bg-snow/5 border-[3px] border-gold/40 px-3 py-2 text-sm text-snow"
              >
                <Icon size={16} className="text-gold shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          <a
            href={`https://instagram.com/${CHITOPO.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fab-fade mt-7 lg:mt-[clamp(0.5rem,2svh,1.5rem)] inline-flex items-center gap-2 min-h-[44px] font-condensed uppercase tracking-[0.08em] text-gold hover:text-snow no-underline"
          >
            <InstagramIcon size={18} />
            Más del día a día en @{CHITOPO.instagram}
          </a>
        </div>

        {/* Las tarjetas son 3:4, así que el ancho manda sobre el alto: en
            escritorio se limita según el alto de pantalla para que los dos
            videos y su desfase entren en los 90vh. */}
        <div className="fab-videos relative grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6 items-start lg:max-w-[calc(117svh_-_108px)]">
          <VideoFabrica paso={PASOS[0]} />
          <VideoFabrica paso={PASOS[1]} className="mt-8 sm:mt-12 lg:mt-8" />

          {/* Va en el hueco que deja la segunda tarjeta, que arranca más abajo.
              La inclinación va inline y no con una clase: Tailwind usa la
              propiedad `rotate`, que se sumaría al transform de GSAP. */}
          <div
            className="fab-sello absolute z-20 -top-2 -right-2 w-24 sm:-top-8 sm:right-0 sm:w-36 lg:w-40 lg:-top-10 lg:-right-6"
            style={{ transform: "rotate(-12deg)" }}
          >
            <StampBadge text="Fábrica propia · La Pintana · " className="relative w-full">
              <MasterSnacksLogo variant="plain" alt="" className="w-full h-auto" />
            </StampBadge>
          </div>
        </div>
      </div>
    </section>
  );
}
