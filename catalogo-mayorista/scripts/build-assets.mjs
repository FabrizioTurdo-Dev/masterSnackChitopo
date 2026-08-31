// scripts/build-assets.mjs
// Convierte los assets de marca (SVG vectorizados y fotos de empaque) en
// imágenes web optimizadas. Se corre a mano cuando cambian los originales:
//
//   npm run assets
//
// Los originales viven fuera del proyecto, en la carpeta de marca:
//   ../Logos vectorizados/marketing/

import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "..", "Logos vectorizados", "marketing");
const OUT = join(ROOT, "public", "img", "productos");
const BRAND = join(ROOT, "public");

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

async function buildBrand() {
  const logo = join(SRC, "Logos vectorizados", "Logo_Chitopo_transparente.svg");

  // El SVG del logo, tal cual, para usarlo inline en la UI
  await copyFile(logo, join(ROOT, "src", "assets", "logo-chitopo.svg"));
  console.log("  ✓ src/assets/logo-chitopo.svg");

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

await mkdir(OUT, { recursive: true });
console.log("Empaques:");
await buildPacks();
console.log("Marca:");
await buildBrand();
console.log("\nListo.");
