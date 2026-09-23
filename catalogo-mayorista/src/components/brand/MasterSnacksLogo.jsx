import stickerUrl from "../../assets/logo-mastersnacks-sticker.png";

// Logo de Master Snacks, la empresa (lo genera `npm run media -- mastersnacks`).
// Viene troquelado como sticker, en blanco frío con filo negro: así se lee
// igual sobre el amarillo del catálogo que sobre el negro del footer y del
// panel. Copia de la landing, solo con la versión sticker.
export default function MasterSnacksLogo({
  height,
  alt = "Master Snacks",
  className = "",
  style,
  loading = "lazy",
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
      loading={loading}
      decoding="async"
    />
  );
}
