#!/usr/bin/env node
// Records the README GIFs from the example decks: plays each slide's real timeline frame by frame
// (the same #s=N&t=T freeze that shoot.mjs uses), screenshots each step, encodes with ffmpeg.
// Usage: node scripts/capture-gifs.mjs [name ...]   Needs Node 22+, Chrome (CHROME_PATH) and ffmpeg.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const ws = "skills/workshop-deck/examples", px = "skills/pixel-deck/examples";
// slides: [slide, its timeline length in s (the scene's dur), hold on the final state in s]
const CLIPS = {
  "workshop-deck-message-queue": { deck: `${ws}/message-queue/deck.html`, fps: 15, width: 1200, slides: [[5, 6.6, 1.6]] },
  "workshop-deck-surfing-tour": { deck: `${ws}/surfing/deck.html`, fps: 12, width: 960, slides: [[2, 6.6, 1], [3, 6.58, 1], [4, 5.0, 1], [5, 3.4, 1], [6, 6.4, 1], [7, 5.6, 1.2]] },
  "pixel-deck-cdn": { deck: `${px}/cdn/deck.html`, fps: 12, width: 1200, slides: [[4, 7, 1.6]] },
};
const pick = process.argv.slice(2);
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(deckUrl) {
  const profile = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "capture-"));
  const proc = spawn(chrome, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1920,1080",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  const portFile = path.join(profile, "DevToolsActivePort");
  while (!fs.existsSync(portFile) || !fs.readFileSync(portFile, "utf8").includes("\n")) await sleep(100);
  const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
  const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
  const sock = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (sock.onopen = r));
  let id = 0; const waiting = new Map();
  sock.onmessage = (e) => { const m = JSON.parse(e.data); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); sock.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: deckUrl });
  await evaluate(`new Promise(r => { const go = () => document.fonts.ready.then(() => setTimeout(r, 1500)); document.readyState === "complete" ? go() : addEventListener("load", go); })`);
  // The prev / replay / next buttons are presenter controls, not slide content.
  await evaluate(`document.head.insertAdjacentHTML("beforeend", "<style>#ui,.ui{display:none!important}</style>"); 1`);
  const close = async () => { sock.close(); proc.kill(); await new Promise((r) => proc.once("exit", r)); fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); };
  return { send, evaluate, close };
}

for (const [name, clip] of Object.entries(CLIPS)) {
  if (pick.length && !pick.includes(name)) continue;
  const tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), `${name}-`));
  const b = await open(pathToFileURL(path.join(root, clip.deck)).href);
  let n = 0;
  for (const [s, dur, hold] of clip.slides) {
    const steps = Math.round(dur * clip.fps), holdFrames = Math.round(hold * clip.fps);
    for (let i = 0; i <= steps + holdFrames; i++) {
      const t = Math.min(i, steps) / clip.fps;
      if (i <= steps) await b.evaluate(`location.hash = "s=${s}&t=${t.toFixed(4)}"; new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
      const shot = await b.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(tmp, `f${String(n++).padStart(4, "0")}.png`), Buffer.from(shot.result.data, "base64"));
    }
  }
  await b.close();
  const out = path.join(root, "assets", `${name}.gif`);
  const scale = `fps=${clip.fps},scale=${clip.width}:-1:flags=lanczos`;
  execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(clip.fps), "-i", path.join(tmp, "f%04d.png"),
    "-filter_complex", `[0:v]${scale},split[a][b];[a]palettegen=max_colors=${clip.colors ?? 192}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
    "-map_metadata", "-1", "-loop", "0", out]);
  // Static fallback: the last frame (the slide's final state), metadata stripped.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(tmp, `f${String(n - 1).padStart(4, "0")}.png`),
    "-vf", `scale=${clip.width}:-1:flags=lanczos`, "-map_metadata", "-1", path.join(root, "assets", `${name}.png`)]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${name}: ${n} frames at ${clip.fps} fps -> assets/${name}.gif (${(fs.statSync(out).size / 1e6).toFixed(2)} MB)`);
}
