#!/usr/bin/env node
// block-deck shoot: screenshot every slide at its final state and print the deck to PDF.
// Usage: node scripts/shoot.mjs path/to/deck.html [--out shots/] [--frame N:T ...] [--no-check]
// Zero dependencies (Node 20+). Needs Google Chrome or Chromium; set CHROME_PATH to override.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
let deck = null, out = null, check = true;
const frames = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') out = args[++i];
  else if (a === '--frame') frames.push(args[++i]);
  else if (a === '--no-check') check = false;
  else if (a === '-h' || a === '--help') { usage(0); }
  else if (!deck) deck = a;
  else usage(1, `unexpected argument: ${a}`);
}
if (!deck) usage(1, 'missing deck.html');

function usage(code, msg) {
  if (msg) console.error(`shoot: ${msg}`);
  console.error('usage: node scripts/shoot.mjs path/to/deck.html [--out shots/] [--frame N:T] [--no-check]');
  process.exit(code);
}

// Resolve real paths so symlinked dirs (macOS /tmp -> /private/tmp) give Chrome a path it can write.
if (!fs.existsSync(deck)) usage(1, `no such file: ${deck}`);
const deckReal = fs.realpathSync(deck);
const outDir = out ?? path.join(path.dirname(deckReal), 'shots');
fs.mkdirSync(outDir, { recursive: true });
const outReal = fs.realpathSync(outDir);

function findChrome() {
  const c = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  const hit = c.find((p) => fs.existsSync(p));
  if (!hit) { console.error('shoot: Chrome not found. Set CHROME_PATH=/path/to/chrome'); process.exit(1); }
  return hit;
}
const chrome = findChrome();

// Slide count = <section> elements in the markup (comments, scripts and styles stripped).
const html = fs.readFileSync(deckReal, 'utf8').replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '');
const n = (html.match(/<section\b/g) || []).length;
if (!n) { console.error('shoot: no <section> slides found'); process.exit(1); }

const profile = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'block-deck-'));
const base = [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--force-device-scale-factor=1', '--window-size=1920,1080', '--virtual-time-budget=6000',
  '--run-all-compositor-stages-before-draw', `--user-data-dir=${profile}`,
];
const url = pathToFileURL(deckReal).href;

function run(extra, target, hash) {
  try { fs.rmSync(target, { force: true }); } catch {}
  let err = '';
  try {
    execFileSync(chrome, [...base, ...extra, `${url}#${hash}`], { stdio: 'pipe', timeout: 90_000 });
  } catch (e) {
    err = String(e.stderr || e.message).slice(-400); // Chrome exits non-zero on harmless GPU noise; judge by the file
  }
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    console.error(`shoot: Chrome wrote nothing to ${target}${err ? `\n${err}` : ''}`);
    process.exitCode = 1;
    return false;
  }
  return true;
}

const pad = (k) => String(k).padStart(2, '0');
const chk = check ? '&check' : '';
let pngs = 0;
for (let k = 1; k <= n; k++) {
  const png = path.join(outReal, `slide-${pad(k)}.png`);
  if (run([`--screenshot=${png}`], png, `s=${k}&t=end${chk}`)) pngs++;
}
for (const f of frames) {
  const [s, t] = f.split(':');
  const png = path.join(outReal, `slide-${pad(+s)}-t${t}.png`);
  run([`--screenshot=${png}`], png, `s=${+s}&t=${t}${chk}`);
}
const pdf = path.join(outReal, 'deck.pdf');
let pages = '?';
if (run(['--print-to-pdf=' + pdf, '--no-pdf-header-footer'], pdf, 's=1&t=end')) {
  const m = fs.readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page(?![s\w])/g);
  if (m) pages = m.length;
}
fs.rmSync(profile, { recursive: true, force: true });
console.log(`block-deck shoot: ${n} slides -> ${pngs} PNG + deck.pdf (${pages} pages) in ${outReal}${pages !== '?' && pages !== n ? '  WARNING: page count != slide count' : ''}`);
