// scripts/build-assets.mjs
// Convierte los assets de marca (SVG vectorizados y fotos de empaque) en
// imágenes web optimizadas. Se corre a mano cuando cambian los originales:
//
//   npm run assets               (todo)
//   npm run assets -- marca      (un solo paso: empaques, chitopo, marca)
//
// Los originales viven fuera del proyecto, en la carpeta de marca:
//   ../Logos vectorizados/marketing/
// El paso "marca" (Master Snacks) sale del sticker HD que arma
// `npm run media -- mastersnacks`.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANDING = join(ROOT, "..", "landing");
const SRC = join(ROOT, "..", "Logos vectorizados", "marketing");
const OUT = join(ROOT, "public", "img", "productos");
// Íconos y OG de Chitopo: van en su carpeta de la landing (/chitopo/ los
// pide desde /marcas/chitopo/).
const CHITOPO_OUT = join(LANDING, "public", "marcas", "chitopo");

// Los artes de empaque son planchas completas (dorso + frente + tabla
// nutricional). Recortamos solo el panel frontal, que es lo que sirve como
// foto de producto. Fracciones medidas sobre cada plancha.
const PACKS = [
  { src: "Sufle completo/2.svg", out: "sufle-queso", crop: [0.29, 0.02, 0.44, 0.96] },
  { src: "Sufle completo/1.svg", out: "sufle-papa", crop: [0.29, 0.02, 0.44, 0.96] },
  { src: "Sufle completo/3.svg", out: "sufle-frutos-del-bosque", crop: [0.29, 0.02, 0.44, 0.96] },
  { src: "MANÍ )/1.svg", out: "mani-salado", crop: [0.286, 0.025, 0.421, 0.95] },
  // Render 3D sobre fondo blanco. Recortamos el margen derecho para sacar
  // la marca de agua "Made with AI" de la esquina.
  { src: "tocino merken.jpeg", out: "tocino-merken", crop: [0.02, 0.06, 0.96, 0.93] },
];

const WIDTH = 800;

async function buildPacks() {
  for (const { src, out, crop } of PACKS) {
    const input = join(SRC, src);
    const img = sharp(input, { limitInputPixels: false, density: 200 });
    const meta = await img.metadata();
    const [l, t, w, h] = crop;

    await img
      .extract({
        left: Math.round(meta.width * l),
        top: Math.round(meta.height * t),
        width: Math.round(meta.width * w),
        height: Math.round(meta.height * h),
      })
      .resize(WIDTH, null, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(join(OUT, `${out}.webp`));

    console.log(`  ✓ ${out}.webp  (fuente ${meta.width}×${meta.height})`);
  }
}

async function buildChitopo() {
  // El logo de la UI ya no sale de acá: lo genera build-media.mjs a partir
  // del logo nuevo. Este SVG queda solo para favicons y Open Graph.
  const logo = join(SRC, "Logos vectorizados", "Logo_Chitopo_transparente.svg");
  const BRAND = CHITOPO_OUT;
  await mkdir(BRAND, { recursive: true });

  // Favicons: el logotipo centrado sobre el café de marca
  const marks = [
    ["favicon-32.png", 32],
    ["apple-touch-icon.png", 180],
    ["icon-512.png", 512],
  ];
  for (const [name, size] of marks) {
    const pad = Math.round(size * 0.08);
    const mark = await sharp(logo, { density: 400 })
      .resize(size - pad * 2, size - pad * 2, { fit: "inside" })
      .png()
      .toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: "#5b1106" },
    })
      .composite([{ input: mark, gravity: "center" }])
      .png()
      .toFile(join(BRAND, name));
    console.log(`  ✓ ${name}`);
  }

  // Open Graph 1200×630
  const ogLogo = await sharp(logo, { density: 400 })
    .resize(720, null, { fit: "inside" })
    .png()
    .toBuffer();

  const caption = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
       <text x="600" y="470" text-anchor="middle" fill="#fbc610"
             font-family="Arial, Helvetica, sans-serif" font-size="52"
             font-weight="bold">El sufle, po'</text>
       <text x="600" y="536" text-anchor="middle" fill="#c9a88f"
             font-family="Arial, Helvetica, sans-serif" font-size="30">
         Catálogo mayorista · Hecho en Chile
       </text>
     </svg>`
  );

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: "#1a0704" },
  })
    .composite([
      { input: ogLogo, top: 120, left: 240 },
      { input: caption, top: 0, left: 0 },
    ])
    .png()
    .toFile(join(BRAND, "og-image.png"));
  console.log("  ✓ og-image.png");
}

// ── Master Snacks ───────────────────────────────────────────────────────
// Íconos y OG de la empresa, para la home y el catálogo. Salen del sticker
// HD (troquel blanco con filo negro) sobre los colores del logo.
const MS = {
  gold: "#ffc20e",
  electric: "#001bfa",
  night: "#0b0b1e",
  snow: "#f5f7ff",
};
const MS_STICKER = join(LANDING, "src", "assets", "logo-mastersnacks-hd.webp");

// Fondo azul con trama de puntos, como los bloques de la web.
function halftone(width, height, background, dot, gap = 28, radius = 3.4) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <defs><pattern id="d" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">
         <circle cx="${gap / 2}" cy="${gap / 2}" r="${radius}" fill="${dot}"/>
       </pattern></defs>
       <rect width="100%" height="100%" fill="${background}"/>
       <rect width="100%" height="100%" fill="url(#d)"/>
     </svg>`
  );
}

async function buildMasterSnacks() {
  // A 32 px el logo entero no se lee: el favicon chico es solo el gorro.
  const meta = await sharp(MS_STICKER).metadata();
  const gorro = await sharp(MS_STICKER)
    .extract({ left: 0, top: 0, width: Math.round(meta.width * 0.6), height: Math.round(meta.height * 0.35) })
    .png()
    .toBuffer();

  const marks = [
    ["favicon-32.png", 32, gorro, 0.04],
    ["apple-touch-icon.png", 180, MS_STICKER, 0.08],
    ["icon-512.png", 512, MS_STICKER, 0.08],
  ];
  const iconDirs = [join(LANDING, "public"), join(ROOT, "public")];
  for (const [name, size, src, padRatio] of marks) {
    const pad = Math.round(size * padRatio);
    const mark = await sharp(src)
      .resize(size - pad * 2, size - pad * 2, { fit: "inside" })
      .png()
      .toBuffer();
    const icon = await sharp({ create: { width: size, height: size, channels: 4, background: MS.gold } })
      .composite([{ input: mark, gravity: "center" }])
      .png()
      .toBuffer();
    for (const dir of iconDirs) await sharp(icon).toFile(join(dir, name));
    console.log(`  ✓ ${name}  (landing + catálogo)`);
  }

  // Open Graph 1200×630: sticker a la izquierda y el lema a la derecha.
  const ogSticker = await sharp(MS_STICKER).resize(null, 470, { fit: "inside" }).png().toBuffer();
  const og = async (subtitle, out) => {
    const text = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
         <g font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="66"
            fill="${MS.gold}" stroke="${MS.night}" stroke-width="6" paint-order="stroke">
           <text x="585" y="285">MAESTROS</text>
           <text x="585" y="365">DEL PICOTEO</text>
         </g>
         <text x="588" y="435" fill="${MS.snow}" font-family="Arial, Helvetica, sans-serif"
               font-size="30" font-weight="bold">${subtitle}</text>
       </svg>`
    );
    await sharp(halftone(1200, 630, MS.electric, "rgba(0,0,0,0.16)"))
      .composite([
        { input: ogSticker, top: 80, left: 70 },
        { input: text, top: 0, left: 0 },
      ])
      .png()
      .toFile(out);
    console.log(`  ✓ ${out.replace(join(ROOT, ".."), "").replaceAll("\\", "/")}`);
  };
  await og("Snacks hechos en La Pintana", join(LANDING, "public", "og-image.png"));
  await og("Catálogo mayorista · Hecho en Chile", join(ROOT, "public", "og-image.png"));
}

const STEPS = [
  ["empaques", "Empaques", async () => {
    await mkdir(OUT, { recursive: true });
    await buildPacks();
  }],
  ["chitopo", "Marca Chitopo", buildChitopo],
  ["marca", "Marca Master Snacks", buildMasterSnacks],
];

const only = process.argv[2];
if (only && !STEPS.some(([key]) => key === only)) {
  console.error(`Paso desconocido: ${only}. Opciones: ${STEPS.map(([k]) => k).join(", ")}`);
  process.exit(1);
}

for (const [key, label, run] of STEPS) {
  if (only && key !== only) continue;
  console.log(`${label}:`);
  await run();
}
console.log("\nListo.");
