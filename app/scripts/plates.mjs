/* Plates do mundo 3D para o filme: frames PNG determinísticos a 1920×1080.
   Uso: node scripts/plates.mjs <nome> <P0> <P1> <segundos> [fps] [baseUrl]
   Ex.: node scripts/plates.mjs sistema 0.66 0.92 8
   Sai em ../build2030-film/public/plates/<nome>/f0001.png … e um .mp4 de conferência. */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const [name, p0s, p1s, secs, fpsS = "30", base = "http://localhost:3030"] = process.argv.slice(2);
if (!name || !p0s || !p1s || !secs) {
  console.error("uso: node scripts/plates.mjs <nome> <P0> <P1> <segundos> [fps] [baseUrl]");
  process.exit(1);
}
const P0 = Number(p0s), P1 = Number(p1s), fps = Number(fpsS);
const frames = Math.round(Number(secs) * fps);
const out = path.resolve("../build2030-film/public/plates", name);
mkdirSync(out, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  // Headed: usa a GPU de verdade (swiftshader headless levava ~30 s por frame). Uma janela do Chrome aparece durante o render.
  headless: false,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: ["--ignore-gpu-blocklist", "--hide-scrollbars", "--window-size=1920,1080", "--window-position=0,0"],
});
const page = await browser.newPage();
await page.goto(`${base}/?at=${P0}&capture=1&plate=1`, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => window.__b2030 && window.__b2030.ready(), { timeout: 240000, polling: 500 });
await page.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); });
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const k = i / Math.max(1, frames - 1);
  const P = P0 + (P1 - P0) * k;
  const tMs = 4000 + (i / fps) * 1000;
  await page.evaluate((p, t) => window.__b2030.render(p, t), P, tMs);
  await page.evaluate(() => new Promise((r) => { let done = false; const t0 = setTimeout(() => { if (!done) { done = true; r(0); } }, 400); requestAnimationFrame(() => requestAnimationFrame(() => { if (!done) { done = true; clearTimeout(t0); r(1); } })); }));
  await page.screenshot({ path: path.join(out, `f${String(i + 1).padStart(4, "0")}.png`) });
  if (i % 30 === 0) console.log(name, i, "/", frames, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
const mp4 = path.resolve("../build2030-film/public/plates", `${name}.mp4`);
spawnSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(fps), "-i", path.join(out, "f%04d.png"), "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", mp4]);
console.log("plate", name, frames, "frames →", mp4);
