// Generates optimised web assets from the raw art in /assests.
//   node scripts/prepare-assets.mjs
//
// Hero layers are placed from the separate transparent art layers in /assests
// (anvil, crystal, flames, hoards, nebula, fog, glow, haze, obsidian) onto a
// shared 16:9 frame, so every layer lines up when stacked full-bleed.
// The title lockup comes from `node scripts/render-title.mjs`.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assests";
const OUT = "public";

// Composition is authored on a 1920x1080 frame; hero layers are written at 2400x1350.
const FRAME_W = 1920;
const FRAME_H = 1080;
const HERO_W = 2400;
const HERO_H = 1350;
const K = HERO_W / FRAME_W;

const CARDS = [
  ["Goldrax_the_Dread_MASTER.png", "goldrax"],
  ["Polyphius_Forgeknight_MASTER.png", "polyphius"],
  ["Quasar_Regent_MASTER.png", "quasar"],
];

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// Anvil, crystal and flames are one group, scaled toward the bottom edge so the
// title lockup (a separate DOM layer) has clear headroom under the nav.
const GROUP = 0.92;
const g = (x, y, w) => ({ x: FRAME_W / 2 + (x - FRAME_W / 2) * GROUP, y: FRAME_H - (FRAME_H - y) * GROUP, w: w * GROUP });

// Each layer: a separate transparent asset placed on the frame (x, y = top-left, w = width), or full-frame.
const LAYERS = {
  glow: { file: "02- Teal Ambient Glow 1.png", full: true },
  fog: { file: "Atmospheric Fog 1.png", full: true },
  flames: { file: "MintForge_Original_Arcane_Flames_4x_300PPI 1.png", ...g(339, 357, 1229) },
  // x chosen so the gem (opaque centre at 49.9% of its canvas) sits dead-centre over the anvil.
  crystal: { file: "Diamond 1.png", ...g(817, 245, 287) },
  anvil: { file: "ANVIL-1 1.png", ...g(398, 490, 1125) },
  nebula: { file: "Cosmic Nebula Foundation Connector 1.png", x: 580, y: 905, w: 760 },
  "gold-left": { file: "Dwarven Cosmic Treasure Hoard 1.png", x: -14, y: 800, w: 900 },
  "gold-right": { file: "Golden Dragon’s Enchanted Treasure Hoard 1.png", x: 1056, y: 788, w: 880 },
};
// Paint order for the flat composite (loader paint target).
const STACK = ["glow", "flames", "crystal", "anvil", "nebula", "gold-left", "gold-right", "fog"];

const ensure = (d) => mkdir(d, { recursive: true });
const asset = (f) => path.join(SRC, f);
const blank = () => sharp({ create: { width: HERO_W, height: HERO_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

/** Place one asset on a transparent HERO_W x HERO_H canvas (cropping anything off-frame). */
async function placed(def) {
  if (def.full) return sharp(asset(def.file)).resize(HERO_W, HERO_H).png().toBuffer();
  const img = await sharp(asset(def.file)).resize(Math.round(def.w * K)).png().toBuffer();
  const { width, height } = await sharp(img).metadata();
  const x = Math.round(def.x * K);
  const y = Math.round(def.y * K);
  const left = Math.max(0, -x);
  const top = Math.max(0, -y);
  const w = Math.min(width - left, HERO_W - Math.max(x, 0));
  const h = Math.min(height - top, HERO_H - Math.max(y, 0));
  const part = await sharp(img).extract({ left, top, width: w, height: h }).toBuffer();
  return blank().composite([{ input: part, left: Math.max(x, 0), top: Math.max(y, 0) }]).png().toBuffer();
}

// Warm rust bloom at top centre, as in the key art; laid over the obsidian plate.
function rustSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${HERO_W}" height="${HERO_H}" viewBox="0 0 ${FRAME_W} ${FRAME_H}">
  <defs>
    <radialGradient id="r" cx="0.5" cy="-0.06" r="0.66" gradientTransform="translate(0.5 0) scale(1 1.1) translate(-0.5 0)">
      <stop offset="0" stop-color="#9a4a22" stop-opacity="0.85"/>
      <stop offset="0.45" stop-color="#6a3320" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#3a2620" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#r)"/>
</svg>`);
}

async function hero() {
  await ensure(`${OUT}/hero`);
  const webp = { quality: 84, alphaQuality: 90 };

  // Backdrop: obsidian + rust bloom + molten haze.
  const plate = await sharp(asset("Obsidian 1.png"))
    .resize(HERO_W, HERO_H)
    .composite([{ input: rustSvg() }, { input: await sharp(asset("MOLTEN HAZE 1.png")).resize(HERO_W, HERO_H).png().toBuffer() }])
    .flatten()
    .png()
    .toBuffer();
  await sharp(plate).webp({ quality: 85 }).toFile(`${OUT}/hero/plate.webp`);

  const layers = {};
  for (const [name, def] of Object.entries(LAYERS)) {
    layers[name] = await placed(def);
    // Soft full-frame atmospheres scale up invisibly, so ship them at half size.
    const out = def.full ? sharp(layers[name]).resize(HERO_W / 2) : sharp(layers[name]);
    await out.webp(webp).toFile(`${OUT}/hero/${name}.webp`);
  }

  // Flat composite (no title): what the loader paints in, and the Merch desk-mat preview.
  const full = await sharp(plate).composite(STACK.map((k) => ({ input: layers[k] }))).png().toBuffer();
  await sharp(full).webp({ quality: 82 }).toFile(`${OUT}/hero/full.webp`);

  // Heat haze band that leads the rising gold sheet.
  await sharp(asset("Molten Haze-1 1.png")).resize(HERO_W).webp(webp).toFile(`${OUT}/hero/heat.webp`);

  // Title lockup (own layer, positioned by CSS) and a tight crystal for card art windows.
  await sharp(asset("MintForge_Eternal_Title.png")).resize(2000).webp(webp).toFile(`${OUT}/hero/title.webp`);
  await sharp(asset("Diamond 1.png")).resize({ height: 720 }).webp(webp).toFile(`${OUT}/hero/gem.webp`);

  // Key art with the title, for the desk-mat merch tile.
  const title = await sharp(asset("MintForge_Eternal_Title.png")).resize(Math.round(1240 * K)).png().toBuffer();
  const { width: tw } = await sharp(title).metadata();
  await sharp(full)
    .composite([{ input: title, left: Math.round((HERO_W - tw) / 2), top: Math.round(40 * K) }])
    .webp({ quality: 82 })
    .toFile(`${OUT}/hero/keyart.webp`);

  console.log("hero layers ok");
  return full;
}

// Black ink on parchment: Sobel edge magnitude on a softened greyscale image of the hero composite.
async function lineart(source) {
  await ensure(`${OUT}/loader`);
  const W = 1920;
  const H = 1080;
  const g = await sharp(source).resize(W, H).removeAlpha().greyscale().blur(1.1).raw().toBuffer();
  const ink = Buffer.alloc(W * H, 255);
  const at = (x, y) => g[y * W + x];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const gx = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      const mag = Math.sqrt(gx * gx + gy * gy);
      // Soft threshold: faint texture vanishes, real contours become ink.
      ink[y * W + x] = clamp(255 - (mag - 38) * 3.2);
    }
  }
  const lines = await sharp(ink, { raw: { width: W, height: H, channels: 1 } }).toColourspace("srgb").png().toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: "#efe6d4" } })
    .composite([{ input: lines, blend: "multiply" }])
    .webp({ quality: 82 })
    .toFile(`${OUT}/loader/lineart.webp`);
  console.log("lineart ok");
}

async function cards() {
  await ensure(`${OUT}/cards`);
  for (const [file, slug] of CARDS) {
    for (const w of [800, 1400]) {
      await sharp(path.join(SRC, file))
        .resize(w)
        .webp({ quality: 84 })
        .toFile(`${OUT}/cards/${slug}-${w}.webp`);
    }
  }
  console.log("cards ok");
}

await Promise.all([hero().then(lineart), cards()]);
