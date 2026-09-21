import stickerUrl from "../../assets/logo-mastersnacks-sticker.png";
import plainUrl from "../../assets/logo-mastersnacks.png";
import transparenteUrl from "../../assets/logo-mastersnacks-transparente.png";

// Logo de Master Snacks, la empresa que fabrica Chitopo (sticker y plain los
// genera `npm run media -- mastersnacks` en el catálogo). Por defecto sale
// como sticker, troquelado en crema con filo café, porque el gorro azul y los
// contornos negros no se leen solos sobre café. `plain` es el logo sin
// troquel, para cuando el fondo ya es claro. `transparente` es el PNG limpio
// que mandaron los dueños, sin troquel: va sobre el rojo de la cita.
const VERSIONES = {
  sticker: { src: stickerUrl, width: 480, height: 467 },
  plain: { src: plainUrl, width: 400, height: 389 },
  transparente: { src: transparenteUrl, width: 480, height: 464 },
};

export default function MasterSnacksLogo({
  height,
  variant = "sticker",
  alt = "Master Snacks",
  className = "",
  style,
}) {
  const v = VERSIONES[variant] ?? VERSIONES.sticker;

  return (
    <img
      src={v.src}
      width={v.width}
      height={v.height}
      alt={alt}
      style={height ? { height, width: "auto", ...style } : style}
      className={`block ${className}`}
      translate="no"
      loading="lazy"
      decoding="async"
    />
  );
}
