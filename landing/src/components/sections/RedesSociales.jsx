import Section from "../ui/Section";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import InstagramIcon from "../brand/InstagramIcon";
import { STORE_CONFIG } from "../../data/store";

export default function RedesSociales() {
  return (
    <Section id="redes" className="pb-0 sm:pb-0 lg:pb-0">
      <Reveal>
        <div className="nb-soft bg-surface p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="font-condensed uppercase tracking-[0.22em] text-accent text-xs sm:text-sm mb-3">
              Seguinos
            </p>
            <h2 className="font-condensed uppercase text-3xl sm:text-5xl leading-[0.95] text-text m-0">
              Todo lo bueno pasa
              <br />
              en el Instagram
            </h2>
            <p className="text-muted text-base leading-relaxed mt-5 max-w-xl">
              Ahí mostramos la fábrica por dentro, los sabores que estamos probando y las
              tonteras del día a día. Si querés enterarte antes que nadie de lo que sale,
              es por ahí.
            </p>
          </div>

          <Button
            href={`https://instagram.com/${STORE_CONFIG.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full lg:w-auto"
          >
            <InstagramIcon size={20} />@{STORE_CONFIG.instagram}
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
