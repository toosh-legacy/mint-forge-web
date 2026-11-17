// Renders the "MintForge Eternal" title lockup to assests/MintForge_Eternal_Title.png.
//   node scripts/render-title.mjs
//
// The original MINTFORGE lettering (assests/ANVIL 1.png) is kept as-is; "ETERNAL"
// and its crystal-cut rules are drawn in scripts/title-eternal.html with an SVG
// lighting filter that matches the lettering's cyan core, teal bevel, slate
// outline and drop shadow. Uses the locally installed Chrome (same as the tests).
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";
import sharp from "sharp";

const html = pathToFileURL(path.resolve("scripts/title-eternal.html")).href;
const out = path.resolve("assests/MintForge_Eternal_Title.png");

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 2900, height: 900 } });
await page.goto(html);
await page.waitForSelector("body[data-ready]");
const png = await page.locator("#art").screenshot({ omitBackground: true });
await browser.close();

// Trim to the artwork (keeping the soft shadow) with a small even margin.
await sharp(png).trim({ threshold: 1 }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out);
console.log("title ok →", path.relative(process.cwd(), out));
