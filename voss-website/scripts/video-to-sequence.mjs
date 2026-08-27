/**
 * VOSS — video → scroll-scrub frame sequence.
 *
 * There is no ffmpeg on this machine, so frames are decoded in headless Chrome
 * (playwright-core driving the installed browser, the pattern already used for
 * visual checks here) and encoded with the `sharp` dependency we already have.
 *
 * Why a frame sequence and not a <video>: scrubbing a video means seeking on
 * every scroll tick, which is the jankiest thing you can ask a mid-tier Android
 * to do. Decoded AVIF stills draw in a single canvas op.
 *
 * Serves the source over loopback rather than file:// so no browser flags are
 * needed and the page and the media share an origin.
 *
 *   node scripts/video-to-sequence.mjs <input.mp4> [outDir] [frameCount]
 *
 * Output matches what useFrameSequence.ts expects:
 *   <outDir>/w480/f00.avif … and <outDir>/w768/f00.avif …
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

/**
 * playwright-core is a build-time tool, not a site dependency, so it is not in
 * package.json. Resolve it normally if it is installed; otherwise accept a path
 * via PLAYWRIGHT_CORE. To make this self-sufficient: npm i -D playwright-core
 * (~3 MB, dev only, never shipped — it drives the browser already on the machine
 * rather than downloading one).
 */
async function loadChromium() {
  try {
    return (await import("playwright-core")).chromium;
  } catch {
    const override = process.env.PLAYWRIGHT_CORE;
    if (!override) {
      console.error(
        "playwright-core not found. Install it (npm i -D playwright-core)\n" +
          "or set PLAYWRIGHT_CORE=/path/to/playwright-core"
      );
      process.exit(1);
    }
    // playwright-core is CommonJS, so require it rather than import().
    const req = createRequire(pathToFileURL(path.resolve(override, "package.json")).href);
    const pw = req(path.resolve(override));
    return pw.chromium ?? pw.default?.chromium;
  }
}
const chromium = await loadChromium();

const SRC = process.argv[2];
const OUT = process.argv[3] ?? "public/sequence/reveal";
const COUNT = Number(process.argv[4] ?? 48);

/** PixVerse burns its watermark into the top band of every frame. */
const WATERMARK_CROP = Number(process.env.WATERMARK_CROP ?? 84);

/** Match the existing sequence exactly so the canvas aspect never moves. */
const WIDTHS = [
  { dir: "w480", w: 480, h: 593 },
  { dir: "w768", w: 768, h: 948 },
];

const CHROME =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

if (!SRC || !fs.existsSync(SRC)) {
  console.error("usage: node scripts/video-to-sequence.mjs <input.mp4> [outDir] [frameCount]");
  process.exit(1);
}

/* ── serve the clip on loopback ─────────────────────────────────────────── */
const video = fs.readFileSync(SRC);
/**
 * The frame is read off a <canvas>, not the <video>.
 * Headless Chrome does not composite video surfaces into element screenshots —
 * doing that returns 48 identical black frames that still encode to a
 * convincing-looking 257KB. drawImage into a canvas is composited normally.
 */
const page = `<!doctype html><meta charset=utf-8>
<style>html,body{margin:0;background:#000}canvas,video{display:block}</style>
<video id=v src="/clip.mp4" preload=auto muted playsinline></video>
<canvas id=c></canvas>`;

const server = http.createServer((req, res) => {
  if (req.url === "/clip.mp4") {
    res.writeHead(200, { "content-type": "video/mp4", "content-length": video.length });
    res.end(video);
  } else {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page);
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

/* ── decode ─────────────────────────────────────────────────────────────── */
const browser = await chromium.launch({ executablePath: CHROME });
const tab = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
await tab.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });

const meta = await tab.evaluate(async () => {
  const v = document.getElementById("v");
  if (v.readyState < 1) await new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }));
  v.width = v.videoWidth;
  v.height = v.videoHeight;
  return { w: v.videoWidth, h: v.videoHeight, dur: v.duration };
});
console.log(`source ${meta.w}×${meta.h}  ${meta.dur.toFixed(2)}s → ${COUNT} frames`);

for (const { dir } of WIDTHS) fs.mkdirSync(path.join(OUT, dir), { recursive: true });

const bytes = Object.fromEntries(WIDTHS.map((w) => [w.dir, 0]));

/**
 * Capture during a single real-time playthrough, not by seeking.
 *
 * Seeking is the obvious way to do this and it silently does not work here:
 * `seeked` fires, and even requestVideoFrameCallback fires, but the compositor
 * never presents the new frame, so every canvas read returns the same stale
 * image. Measured: identical mean luma at eight timestamps across the clip, in
 * both headless and headed Chrome. Playing the video presents frames normally.
 *
 * So: play once, let requestVideoFrameCallback tell us when a frame is actually
 * on screen, and keep the first frame at or past each target timestamp.
 */
const shots = new Map();
await tab.exposeBinding("emit", (_src, { i, url }) => {
  shots.set(i, Buffer.from(url.split(",")[1], "base64"));
});

const targets = Array.from({ length: COUNT }, (_, i) => (i / (COUNT - 1)) * (meta.dur - 0.06));

await tab.evaluate(
  async ([times]) => {
    const v = document.getElementById("v");
    const c = document.getElementById("c");
    if (v.readyState < 2) await new Promise((r) => v.addEventListener("loadeddata", r, { once: true }));
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");

    let next = 0;
    // Half speed so a slow canvas read cannot fall behind presentation.
    v.playbackRate = 0.5;
    await v.play();
    await new Promise((done) => {
      const onFrame = () => {
        // At most ONE target per presented frame. Draining the queue in a
        // `while` here is what previously back-filled the tail of the sequence
        // with 20 copies of a single stale frame when capture fell behind.
        if (next < times.length && v.currentTime >= times[next]) {
          ctx.drawImage(v, 0, 0);
          window.emit({ i: next, url: c.toDataURL("image/png") });
          next++;
        }
        if (next >= times.length || v.ended) {
          v.pause();
          done();
        } else v.requestVideoFrameCallback(onFrame);
      };
      v.requestVideoFrameCallback(onFrame);
    });
  },
  [targets]
);

if (shots.size < COUNT) {
  console.error(`only captured ${shots.size}/${COUNT} frames`);
  await browser.close();
  server.close();
  process.exit(1);
}

// Guard: a run of identical frames means decode silently failed again.
const distinct = new Set([...shots.values()].map((b) => b.length)).size;
if (distinct < COUNT * 0.5) {
  console.error(`frames are not distinct (${distinct} unique of ${COUNT}) — decode failed. Aborting.`);
  await browser.close();
  server.close();
  process.exit(1);
}
console.log(`captured ${shots.size} frames, ${distinct} distinct`);

for (let i = 0; i < COUNT; i++) {
  const png = shots.get(i);
  const name = `f${String(i).padStart(2, "0")}.avif`;

  for (const { dir, w, h } of WIDTHS) {
    const buf = await sharp(png)
      // Crop the top band off first: PixVerse burns its watermark there, and
      // cropping is the only honest way to remove it. Everything below is the
      // object, so this costs nothing compositionally.
      .extract({ left: 0, top: WATERMARK_CROP, width: meta.w, height: meta.h - WATERMARK_CROP })
      .resize(w, h, { fit: "cover", position: "centre", kernel: "lanczos3" })
      .avif({ quality: 46, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, dir, name), buf);
    bytes[dir] += buf.length;
  }
  if ((i + 1) % 8 === 0 || i === COUNT - 1) process.stdout.write(`  ${i + 1}/${COUNT}\n`);
}

await browser.close();
server.close();

const kb = (n) => (n / 1024).toFixed(0) + " KB";
for (const { dir } of WIDTHS) {
  console.log(`${dir}: ${kb(bytes[dir])} across ${COUNT} frames (${kb(bytes[dir] / COUNT)}/frame)`);
}
console.log(`total ${kb(Object.values(bytes).reduce((a, b) => a + b, 0))}`);
