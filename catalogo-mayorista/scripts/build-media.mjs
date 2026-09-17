// scripts/build-media.mjs
// Procesa el material nuevo que llega a landing/src/assets y lo deja listo
// para la web. Se corre a mano cuando cambian los originales:
//
//   npm run media            (todo)
//   npm run media -- tocino  (un solo paso)
//
// Necesita ffmpeg en el PATH para los videos.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CATALOGO = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANDING = join(CATALOGO, "..", "landing");
const SRC = join(LANDING, "src", "assets");

// ── Relleno desde los bordes ────────────────────────────────────────────
// Recorre el fondo plano desde el perímetro de la imagen y lo vuelve
// transparente. `alphaOf(i)` estima cuánto de primer plano tiene cada píxel:
// lo que ya es opaco frena el relleno, así nunca entra a lo que está
// encerrado por un contorno. En el borde, cada píxel es una mezcla de fondo y
// primer plano; se le descuenta el fondo para que no quede halo.
function floodAlpha(data, W, H, bg, alphaOf) {
  const seen = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0;
  let tail = 0;
  const push = (x, y) => {
    const p = y * W + x;
    if (seen[p]) return;
    seen[p] = 1;
    queue[tail++] = p;
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  while (head < tail) {
    const p = queue[head++];
    const x = p % W;
    const y = (p / W) | 0;
    const i = p * 4;
    const a = alphaOf(i);
    // Ya es contorno opaco: no se toca y el relleno no sigue por ahí.
    if (a > 0.92) continue;

    if (a < 0.06) {
      data[i + 3] = 0;
    } else {
      for (let k = 0; k < 3; k++) {
        const clean = (data[i + k] - (1 - a) * bg[k]) / a;
        data[i + k] = Math.max(0, Math.min(255, Math.round(clean)));
      }
      data[i + 3] = Math.round(a * 255);
    }
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }
}

// Recorte al área con tinta, con un margen mínimo.
function inkRegion(data, W, H, padRatio = 0.01) {
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = Math.round((maxX - minX) * padRatio);
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  return {
    left,
    top,
    width: Math.min(W, maxX + pad + 1) - left,
    height: Math.min(H, maxY + pad + 1) - top,
  };
}

// ── Logo ────────────────────────────────────────────────────────────────
// El original viene sobre un naranja plano. Como el logotipo tiene contorno
// blanco cerrado, el relleno nunca entra a las letras. El alfa sale de
// proyectar cada píxel sobre la recta naranja→blanco, así no queda halo
// naranja sobre el fondo de la web.
async function buildLogo() {
  const { data, info } = await sharp(join(SRC, "logo-chitopo-fondo.png"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = (x, y) => (y * W + x) * 4;

  // Color de fondo: promedio de las cuatro esquinas.
  const bg = [0, 0, 0];
  let n = 0;
  for (const [cx, cy] of [[0, 0], [W - 24, 0], [0, H - 24], [W - 24, H - 24]]) {
    for (let y = cy; y < cy + 24; y++) {
      for (let x = cx; x < cx + 24; x++) {
        const i = px(x, y);
        bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2];
        n++;
      }
    }
  }
  bg.forEach((_, k) => (bg[k] /= n));

  const fg = [255, 255, 255];
  const axis = fg.map((v, k) => v - bg[k]);
  const axisLen2 = axis.reduce((s, v) => s + v * v, 0);
  const alphaOf = (i) => {
    let dot = 0;
    for (let k = 0; k < 3; k++) dot += (data[i + k] - bg[k]) * axis[k];
    return Math.max(0, Math.min(1, dot / axisLen2));
  };

  floodAlpha(data, W, H, bg, alphaOf);
  const region = inkRegion(data, W, H);

  const png = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract(region)
    .resize(900, null, { withoutEnlargement: true })
    // Con paleta pesa una fracción: el logotipo tiene cuatro colores planos.
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toBuffer();

  for (const app of [LANDING, CATALOGO]) {
    await sharp(png).toFile(join(app, "src", "assets", "logo-chitopo.png"));
  }
  console.log(`  ✓ logo-chitopo.png  (${region.width}×${region.height} → 900 px, landing + catálogo)`);
}

// ── Bolsa de Tocino Merkén recortada ────────────────────────────────────
// Es un render 3D sobre blanco, así que no le sirve el tratamiento de bolsa
// que el hero le aplica al arte plano. Se saca el blanco con el mismo
// relleno; como acá el primer plano no es un color fijo, el alfa sale de
// cuánto se aleja del blanco el canal más oscuro. La sombra gris suave del
// render queda translúcida, que sobre el fondo de color se ve natural.
async function buildTocinoCutout() {
  const { data, info } = await sharp(join(LANDING, "public", "img", "productos", "tocino-merken.webp"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  const alphaOf = (i) => {
    const darkest = Math.min(data[i], data[i + 1], data[i + 2]);
    // Los primeros 10 niveles son ruido de compresión del blanco.
    return Math.max(0, Math.min(1, (255 - darkest - 10) / 150));
  };

  floodAlpha(data, W, H, [255, 255, 255], alphaOf);
  const region = inkRegion(data, W, H, 0.005);

  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract(region)
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(join(LANDING, "public", "img", "productos", "tocino-merken-cutout.webp"));
  console.log(`  ✓ tocino-merken-cutout.webp  (${region.width}×${region.height})`);
}

// ── Reverso Tocino Merkén ───────────────────────────────────────────────
// Plancha completa del envase. Se corta la franja de arriba, donde el arte
// trae un recuadro blanco suelto, y se deja ancha para que la tabla
// nutricional se lea en el lightbox.
async function buildReverso() {
  const img = sharp(join(SRC, "TCM.png"));
  const { width, height } = await img.metadata();
  const top = Math.round(height * 0.05);
  const buffer = await img
    .extract({ left: 0, top, width, height: height - top })
    .resize(1600, null, { withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();

  // Va en las dos apps: en producción el catálogo pide /img/productos/ a la
  // raíz del sitio, que es la landing.
  for (const app of [LANDING, CATALOGO]) {
    const out = join(app, "public", "img", "productos");
    await mkdir(out, { recursive: true });
    await sharp(buffer).toFile(join(out, "tocino-merken-reverso.webp"));
  }
  console.log("  ✓ tocino-merken-reverso.webp  (landing + catálogo)");
}

// ── Post de suflés ──────────────────────────────────────────────────────
async function buildPost() {
  const out = join(LANDING, "public", "img", "redes");
  await mkdir(out, { recursive: true });
  await sharp(join(SRC, "sufles-papa-queso.jpeg"))
    .resize(800, 800, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(join(out, "sufles-horneados.webp"));
  console.log("  ✓ img/redes/sufles-horneados.webp");
}

// ── Videos de fábrica ───────────────────────────────────────────────────
// Sin audio (se reproducen en silencio igual), a 30 fps y con faststart
// para que empiecen a verse antes de terminar de bajar.
const VIDEOS = [
  { src: "fabrica3.mp4", out: "fabrica-produccion", poster: 13 },
  { src: "Fabrica.mp4", out: "fabrica-envasado", poster: 4 },
];

function ffmpeg(args, opts = {}) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], {
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
  if (r.error) throw new Error(`No se pudo correr ffmpeg: ${r.error.message}`);
  if (r.status !== 0) throw new Error(r.stderr.toString());
  return r.stdout;
}

async function buildVideos() {
  const out = join(LANDING, "public", "video");
  await mkdir(out, { recursive: true });

  for (const { src, out: name, poster } of VIDEOS) {
    const input = join(SRC, src);
    ffmpeg([
      "-i", input,
      "-an",
      "-vf", "fps=30",
      "-c:v", "libx264",
      "-profile:v", "high",
      "-crf", "26",
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      join(out, `${name}.mp4`),
    ]);

    const frame = ffmpeg([
      "-ss", String(poster),
      "-i", input,
      "-frames:v", "1",
      "-f", "image2pipe",
      "-vcodec", "png",
      "-",
    ]);
    await sharp(frame).webp({ quality: 80 }).toFile(join(out, `${name}.webp`));
    console.log(`  ✓ video/${name}.mp4 + poster`);
  }
}

// Se puede correr un solo paso: `npm run media -- tocino`. Los videos
// necesitan ffmpeg, así que conviene no rehacerlos si no cambiaron.
const STEPS = [
  ["logo", "Logo", buildLogo],
  ["reverso", "Catálogo", buildReverso],
  ["tocino", "Bolsa recortada", buildTocinoCutout],
  ["post", "Redes", buildPost],
  ["videos", "Videos", buildVideos],
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
