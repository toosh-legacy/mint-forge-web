// Generates optimised web assets from the raw art in /assests.
//   node scripts/prepare-assets.mjs
//
// Hero layers are cut from the flat key art with feathered polygon masks.
// To swap in hand-made layers later, drop transparent 2400x1350 WebPs with the
// same names into public/hero/ (and skip the HERO step below).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assests";
const OUT = "public";
const KEY_ART = path.join(SRC, "MintForge_UI.png");

// Mask coordinates are authored on a 2000x1125 grid (key art is 3840x2160).
const GRID_W = 2000;
const GRID_H = 1125;
const HERO_W = 2400;
const HERO_H = 1350;

const CARDS = [
  ["Goldrax_the_Dread_MASTER.png", "goldrax"],
  ["Polyphius_Forgeknight_MASTER.png", "polyphius"],
  ["Quasar_Regent_MASTER.png", "quasar"],
];

// Colour keys (0..255 alpha from an RGB pixel). They separate subjects from the
// smooth, dark, low-saturation backdrop.
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const KEYS = {
  // Mint/teal lettering, crystal and flames: green/blue well above red.
  teal: (r, g, b) => clamp(((g + b) / 2 - r - 18) * 5),
  // Anything that isn't the smooth backdrop: far from the rebuilt plate colour, or texturally busy.
  busy: (r, g, b, i, ctx) => {
    const p = ctx.plate;
    const diff = (Math.abs(r - p[i * 3]) + Math.abs(g - p[i * 3 + 1]) + Math.abs(b - p[i * 3 + 2])) / 3;
    return clamp(Math.max((diff - 20) * 5, (ctx.detail[i] - 5) * 14));
  },
};

// Each layer = feathered polygon ∩ (optional) colour key, ∪ (optional) solid silhouette.
const LAYERS = {
  title: {
    shape: `<rect x="270" y="115" width="1500" height="215" rx="40"/>`,
    feather: 6,
    key: "teal",
    grow: 3,
  },
  crystal: {
    shape: `<ellipse cx="1020" cy="482" rx="165" ry="162"/>`,
    feather: 22,
    key: "teal",
    grow: 7,
    // Dark metal frame around the gem.
    solid: `<polygon points="1021,334 1066,362 1096,392 1100,560 1060,596 1022,618 982,596 944,560 948,392 978,362"/>`,
  },
  anvil: {
    // Bounding region for flames (keyed teal); the stone itself is a hand-traced silhouette.
    shape: `<polygon points="500,575 900,575 900,622 1140,622 1140,575 1620,575 1620,880 1400,905 1255,945 1245,1125 755,1125 715,935 525,915 500,880"/>`,
    feather: 6,
    key: "teal",
    grow: 2,
    solid: `<polygon points="546,662 560,642 790,636 1215,636 1462,646 1480,664 1476,690 1300,715 1250,770 1215,790 1180,880 1230,905 1285,960 1285,1125 720,1125 722,960 770,905 830,880 790,790 745,765 690,715 560,698"/>`,
  },
  "gold-left": {
    shape: `<polygon points="0,898 150,842 400,842 540,885 600,935 705,952 738,1125 0,1125"/>`,
    feather: 4,
    key: "busy",
    grow: 4,
    close: 14,
    solid: `<polygon points="0,1000 700,1000 738,1125 0,1125"/>`,
  },
  "gold-right": {
    shape: `<polygon points="1262,1125 1272,955 1395,915 1600,885 1720,905 1850,872 2000,872 2000,1125"/>`,
    feather: 4,
    key: "busy",
    grow: 4,
    close: 14,
    solid: `<polygon points="1268,1030 2000,1000 2000,1125 1262,1125"/>`,
  },
};

const ensure = (d) => mkdir(d, { recursive: true });

function maskSvg(shape, feather) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${HERO_W}" height="${HERO_H}" viewBox="0 0 ${GRID_W} ${GRID_H}">
  <defs><filter id="f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${feather}"/></filter></defs>
  <g fill="#fff" filter="url(#f)">${shape}</g></svg>`);
}

async function rasterMask(shape, feather) {
  return sharp(maskSvg(shape, feather)).resize(HERO_W, HERO_H).extractChannel(0).raw().toBuffer();
}

async function buildAlpha(rgb, def, ctx) {
  const n = HERO_W * HERO_H;
  const region = await rasterMask(def.shape, def.feather);
  let alpha = Buffer.from(region);

  if (def.key) {
    const fn = KEYS[def.key];
    const key = Buffer.alloc(n);
    for (let i = 0; i < n; i++) key[i] = fn(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2], i, ctx);
    // Dilate + soften the key so dark outlines/shadows of the subject survive.
    const grown = await sharp(key, { raw: { width: HERO_W, height: HERO_H, channels: 1 } })
      .dilate(def.grow ?? 2)
      .dilate(def.close || 1)
      .erode(def.close || 1)
      .blur(1.2)
      .extractChannel(0)
      .raw()
      .toBuffer();
    for (let i = 0; i < n; i++) alpha[i] = (region[i] * grown[i]) / 255;
  }

  if (def.solid) {
    const solid = await rasterMask(def.solid, 2.5);
    for (let i = 0; i < n; i++) alpha[i] = Math.max(alpha[i], (solid[i] * region[i]) / 255);
  }
  return alpha;
}

// Rebuilt background: sampled rust glow at top centre, charcoal to slate-teal below, plus fine grain.
function plateSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${HERO_W}" height="${HERO_H}" viewBox="0 0 ${GRID_W} ${GRID_H}">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2620"/>
      <stop offset="0.35" stop-color="#332a29"/>
      <stop offset="0.7" stop-color="#262a2c"/>
      <stop offset="1" stop-color="#1e2629"/>
    </linearGradient>
    <radialGradient id="r" cx="0.5" cy="-0.08" r="0.62" gradientTransform="translate(0.5 0) scale(1 1.15) translate(-0.5 0)">
      <stop offset="0" stop-color="#8a421f" stop-opacity="0.95"/>
      <stop offset="0.45" stop-color="#6a3320" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#3a2620" stop-opacity="0"/>
    </radialGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.05 0"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`);
}

async function hero() {
  await ensure(`${OUT}/hero`);
  const rgb = await sharp(KEY_ART).resize(HERO_W, HERO_H).removeAlpha().raw().toBuffer();
  const raw3 = { raw: { width: HERO_W, height: HERO_H, channels: 3 } };

  await sharp(rgb, raw3).webp({ quality: 82 }).toFile(`${OUT}/hero/full.webp`);
  await sharp(plateSvg()).webp({ quality: 85 }).toFile(`${OUT}/hero/plate.webp`);

  // Context for the "busy" key: plate colours + local detail (|grey - blurred grey|).
  const plate = await sharp(plateSvg()).resize(HERO_W, HERO_H).removeAlpha().raw().toBuffer();
  const grey = await sharp(rgb, raw3).greyscale().extractChannel(0).raw().toBuffer();
  const soft = await sharp(grey, { raw: { width: HERO_W, height: HERO_H, channels: 1 } }).blur(3).extractChannel(0).raw().toBuffer();
  const diffMap = Buffer.alloc(grey.length);
  for (let i = 0; i < grey.length; i++) diffMap[i] = Math.abs(grey[i] - soft[i]);
  const detail = await sharp(diffMap, { raw: { width: HERO_W, height: HERO_H, channels: 1 } }).blur(4).extractChannel(0).raw().toBuffer();
  const ctx = { plate, detail };

  for (const [name, def] of Object.entries(LAYERS)) {
    const alpha = await buildAlpha(rgb, def, ctx);
    await sharp(rgb, raw3)
      .joinChannel(alpha, { raw: { width: HERO_W, height: HERO_H, channels: 1 } })
      .webp({ quality: 85, alphaQuality: 90 })
      .toFile(`${OUT}/hero/${name}.webp`);
  }
  console.log("hero layers ok");
}

// Black ink on parchment: Sobel edge magnitude on a softened greyscale image.
async function lineart() {
  await ensure(`${OUT}/loader`);
  const W = 1920;
  const H = 1080;
  const g = await sharp(KEY_ART).resize(W, H).removeAlpha().greyscale().blur(1.1).raw().toBuffer();
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

await Promise.all([hero(), lineart(), cards()]);
