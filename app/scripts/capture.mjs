/* Captura de revisão: 8 frames (0…100%) e uma gravação do scroll completo.
   Usa o Google Chrome instalado via puppeteer-core (sem download).
   Uso: node scripts/capture.mjs [baseUrl] [outDir] [support=a|b]
   Requer o dev server no ar (npm run dev) e ffmpeg no PATH. */

import puppeteer from "puppeteer-core";
import { mkdirSync, existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3030";
const out = process.argv[3] ?? path.resolve("../docs/review-frames-hero-v2");
const support = process.argv[4] ?? "a";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const STEPS = [0, 0.14, 0.3, 0.44, 0.56, 0.7, 0.86, 1.0];
const SCROLL_MS = 30000;

mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: process.env.HEADED ? false : true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars",
    "--autoplay-policy=no-user-gesture-required",
    "--window-size=1440,900",
  ],
});

const page = await browser.newPage();
const url = `${base}/?at=0&capture=1&support=${support}`;
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => window.__b2030 && window.__b2030.ready(), { timeout: 240000, polling: 500 });
await new Promise((r) => setTimeout(r, 1200));

for (const P of STEPS) {
  await page.evaluate((p) => window.__b2030.goto(p), P);
  await new Promise((r) => setTimeout(r, 1600));
  const file = path.join(out, `frame-${String(Math.round(P * 100)).padStart(3, "0")}.png`);
  await page.screenshot({ path: file });
  console.log("frame", P, file);
}

await page.evaluate(() => window.__b2030.goto(0));
await new Promise((r) => setTimeout(r, 600));
const webm = path.join(out, "scroll.webm");
const recorder = await page.screencast({ path: webm });
await page.evaluate((ms) => window.__b2030.play(ms), SCROLL_MS);
await new Promise((r) => setTimeout(r, 1500));
await recorder.stop();
await new Promise((r) => setTimeout(r, 2500));
console.log("recording", webm);

await browser.close();
await new Promise((r) => setTimeout(r, 1500));

const mp4 = path.join(out, "scroll.mp4");
const ff = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", webm, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
if (ff.status === 0 && existsSync(mp4)) {
  console.log("mp4", mp4);
} else {
  console.log("ffmpeg falhou; mantido o webm");
  if (existsSync(webm) && !existsSync(mp4)) renameSync(webm, webm);
}
