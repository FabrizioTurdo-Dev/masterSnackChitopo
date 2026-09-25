import { useRef } from "react";
import gsap from "gsap";
import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import Logo from "../brand/Logo";
import InstagramIcon from "../brand/InstagramIcon";
import { CHITOPO } from "../../data/brands";
import { prefersReducedMotion } from "../../lib/useLenis";

const INSTAGRAM_URL = `https://instagram.com/${CHITOPO.instagram}`;

// Un post real de la cuenta, presentado como tarjeta de Instagram. En
// computadora se inclina hacia el cursor; en touch y sin animaciones queda
// quieta con su giro de base.
function PostCard() {
  const card = useRef(null);

  const canTilt = () =>
    !prefersReducedMotion() && window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  const onMove = (e) => {
    if (!canTilt() || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card.current, {
      rotateY: px * 14,
      rotateX: -py * 14,
      rotate: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!card.current) return;
    gsap.to(card.current, { rotateY: 0, rotateX: 0, rotate: 3, duration: 0.7, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div className="[perspective:900px]">
      <a
        ref={card}
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        aria-label={`Ver el Instagram @${CHITOPO.instagram}`}
        // El giro de base va en transform y no con la clase rotate-3: esa
        // usa la propiedad `rotate` y se sumaría a la que anima GSAP.
        style={{ transform: "rotate(3deg)" }}
        className="nb block bg-cream no-underline w-full max-w-[290px] sm:max-w-[340px] mx-auto [transform-style:preserve-3d] will-change-transform"
      >
        <span className="flex items-center gap-2.5 px-3 py-2.5 border-b-[3px] border-ink">
          <span className="grid place-items-center size-8 rounded-full bg-fire border-2 border-ink overflow-hidden shrink-0">
            <Logo height={10} />
          </span>
          <span className="font-condensed uppercase tracking-[0.06em] text-sm text-ink truncate">
            {CHITOPO.instagram}
          </span>
          <InstagramIcon size={18} />
        </span>
        <img
          src="/img/redes/sufles-horneados.webp"
          alt="Publicación de Instagram: bolsas de Suflés Papa y Suflés Queso horneados sobre fondo amarillo"
          width="800"
          height="800"
          loading="lazy"
          className="block w-full h-auto"
        />
      </a>
    </div>
  );
}

export default function RedesSociales() {
  return (
    <Section id="redes" className="pb-0 sm:pb-0 lg:pb-0">
      <Reveal>
        <div className="nb-soft bg-cream p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-center">
          <div>
            <p className="font-condensed uppercase tracking-[0.22em] text-ink text-xs sm:text-sm mb-3 before:content-['★'] before:text-fire before:mr-2">
              Síguenos
            </p>
            <h2 className="font-title uppercase text-3xl sm:text-5xl leading-[0.95] text-ink m-0">
              Todo lo bueno pasa
              <br />
              en Instagram
            </h2>
            <p className="text-ink-soft text-base leading-relaxed mt-5 max-w-xl">
              Ahí mostramos la fábrica por dentro, los sabores que estamos probando y las
              tonteras del día a día. Si quieres enterarte antes que nadie de lo que sale,
              es por ahí.
            </p>

            <Button
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto mt-8"
            >
              <InstagramIcon size={20} />@{CHITOPO.instagram}
            </Button>
          </div>

          <PostCard />
        </div>
      </Reveal>
    </Section>
  );
}
