import stickerUrl from "../../assets/logo-mastersnacks-sticker.png";

// Logo de Master Snacks, la empresa que fabrica Chitopo (lo genera
// `npm run media -- mastersnacks`). Viene troquelado como sticker, en crema
// con filo café: el gorro azul y los contornos negros no se leen solos sobre
// el café del footer. Copia de la landing, solo con la versión sticker.
export default function MasterSnacksLogo({
  height,
  alt = "Master Snacks",
  className = "",
  style,
}) {
  return (
    <img
      src={stickerUrl}
      width={480}
      height={467}
      alt={alt}
      style={height ? { height, width: "auto", ...style } : style}
      className={`block ${className}`}
      translate="no"
      loading="lazy"
      decoding="async"
    />
  );
}
