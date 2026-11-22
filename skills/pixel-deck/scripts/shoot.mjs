#!/usr/bin/env node
// Screenshot every slide of a pixel-deck at its final state, print the deck to PDF, and run the layout check.
// Usage: node scripts/shoot.mjs path/to/deck.html [--out shots/]
// Zero dependencies; needs Node 20+ and Chrome or Chromium (set CHROME_PATH if it is not found).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import os from "node:os";

const die = msg => { console.error(`shoot: ${msg}`); process.exit(1); };
const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const outArg = oi >= 0 ? args[oi + 1] : null;
const deckArg = args.find((a, i) => !a.startsWith("--") && i !== oi + 1);
if (!deckArg || (oi >= 0 && !outArg)) die("usage: node scripts/shoot.mjs path/to/deck.html [--out shots/]");
if (!existsSync(deckArg)) die(`deck not found: ${deckArg}`);

// real paths everywhere: Chrome silently writes nothing to some symlinked locations (macOS /tmp -> /private/tmp)
const deck = realpathSync(resolve(deckArg));
const outDir = resolve(outArg || join(dirname(deck), "shots"));
mkdirSync(outDir, { recursive: true });
const out = realpathSync(outDir);

function findChrome() {
  const env = process.env.CHROME_PATH;
  if (env) { if (existsSync(env)) return env; die(`CHROME_PATH does not exist: ${env}`); }
  const pf = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean);
  const cands = {
    darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium",
      join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome")],
    win32: pf.map(p => join(p, "Google/Chrome/Application/chrome.exe")),
  }[process.platform] || [];
  for (const c of cands) if (existsSync(c)) return c;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"]) {
    const r = spawnSync(process.platform === "win32" ? "where" : "which", [name], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split(/\r?\n/)[0];
  }
  die("Chrome not found; set CHROME_PATH to the Chrome or Chromium binary");
}

const chrome = findChrome();
const html = readFileSync(deck, "utf8");
const n = (html.replace(/<!--[\s\S]*?-->/g, "").match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g) || []).length;
if (!n) die(`no <section class="slide"> found in ${deck}`);
const profile = mkdtempSync(join(realpathSync(os.tmpdir()), "pixel-deck-"));
const base = pathToFileURL(deck).href;
const common = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
  "--mute-audio", `--user-data-dir=${profile}`, "--force-device-scale-factor=1", "--window-size=1920,1080",
  "--force-prefers-reduced-motion", "--virtual-time-budget=10000"];
const run = (extra, url) => spawnSync(chrome, [...common, ...extra, url], { encoding: "utf8", timeout: 90000, maxBuffer: 64 << 20 });
const wrote = f => existsSync(f) && statSync(f).size > 0;

try {
  const pngs = [];
  for (let i = 1; i <= n; i++) {
    const png = join(out, `slide-${String(i).padStart(2, "0")}.png`);
    rmSync(png, { force: true });
    const r = run([`--screenshot=${png}`], `${base}#s=${i}&t=end`);
    if (!wrote(png)) die(`slide ${i}: Chrome wrote no screenshot (exit ${r.status})\n${(r.stderr || "").slice(-800)}`);
    pngs.push(png);
  }
  const pdf = join(out, "deck.pdf");
  rmSync(pdf, { force: true });
  const rp = run([`--print-to-pdf=${pdf}`, "--no-pdf-header-footer"], `${base}#s=1&t=end`);
  if (!wrote(pdf)) die(`Chrome wrote no PDF (exit ${rp.status})\n${(rp.stderr || "").slice(-800)}`);
  const pages = (readFileSync(pdf, "latin1").match(/\/Type\s*\/Page\b(?!s)/g) || []).length;

  const rc = run(["--dump-dom"], `${base}#check`);
  const m = (rc.stdout || "").match(/<pre id="pd-report"[^>]*>([\s\S]*?)<\/pre>/);
  let issues = null;
  if (m) {
    const json = m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    issues = JSON.parse(json).issues;
    for (const it of issues) console.log(`  slide ${it.slide}  ${it.kind.padEnd(8)} "${it.text}"${it.detail ? "  " + it.detail : ""}`);
  }
  const check = issues == null ? "check: did not run" : `check: ${issues.length} issue${issues.length === 1 ? "" : "s"}`;
  const pageNote = pages === n ? "" : `  (expected ${n} pages)`;
  console.log(`shoot: ${pngs.length} slides -> ${out}/slide-01..${String(n).padStart(2, "0")}.png, deck.pdf ${pages} pages${pageNote}, ${check}`);
  if (pages !== n || (issues && issues.length)) process.exitCode = 2;
} finally {
  rmSync(profile, { recursive: true, force: true });
}
