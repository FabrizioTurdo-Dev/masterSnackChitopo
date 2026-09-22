import stickerUrl from "../../assets/logo-mastersnacks-sticker.png";
import stickerCafeUrl from "../../assets/logo-mastersnacks-sticker-cafe.png";
import hdUrl from "../../assets/logo-mastersnacks-hd.webp";
import plainUrl from "../../assets/logo-mastersnacks.png";
import transparenteUrl from "../../assets/logo-mastersnacks-transparente.png";

// Logo de Master Snacks, la empresa (sticker, sticker-cafe, hd y plain los
// genera `npm run media -- mastersnacks` en el catálogo).
//   sticker       troquelado en blanco frío con filo negro: sobre fondos de
//                 color u oscuros, donde el gorro azul no se leería solo.
//   sticker-cafe  el mismo troquel en crema y café, para la página de Chitopo.
//   hd            el sticker grande, para el hero de la home.
//   plain         sin troquel, para cuando el fondo ya es claro.
//   transparente  el PNG limpio que mandaron los dueños, sin troquel.
const VERSIONES = {
  sticker: { src: stickerUrl, width: 480, height: 467 },
  "sticker-cafe": { src: stickerCafeUrl, width: 480, height: 467 },
  hd: { src: hdUrl, width: 1200, height: 1167 },
  plain: { src: plainUrl, width: 400, height: 389 },
  transparente: { src: transparenteUrl, width: 480, height: 464 },
};

export default function MasterSnacksLogo({
  height,
  variant = "sticker",
  alt = "Master Snacks",
  className = "",
  style,
  loading = "lazy",
  ...props
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
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}
