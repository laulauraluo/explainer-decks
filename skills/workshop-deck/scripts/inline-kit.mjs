#!/usr/bin/env node
// Inline kit/iso-kit.mjs and kit/lathe.mjs (from anatomy by Ryan, github.com/wheresryan22/anatomy, MIT;
// see ../kit/LICENSE-anatomy) into a deck as classic scripts, so the deck stays one self-contained file.
// Usage: node scripts/inline-kit.mjs path/to/deck.html [more decks...]
// Replaces everything between the markers /* iso-kit:begin */ and /* iso-kit:end */ in each deck.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kit = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'kit');
const read = (f) => fs.readFileSync(path.join(kit, f), 'utf8');

// one ES module -> an IIFE returning its exports; `imports` are bound from already-built globals
function wrap(name, src, imports = '') {
  const names = [...src.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]);
  const body = src.replace(/^import .*$/gm, '').replace(/^export /gm, '');
  // a literal "</script" inside the kit (pageHtml) would end the deck's <script> element early
  return `var ${name}=(function(){'use strict';${imports}\n${body.replace(/<\/script/gi, '<\\/script')}\nreturn {${names.join(',')}};})();\n`;
}

const license = read('LICENSE-anatomy').trim().replace(/\*\//g, '* /');
const block = `/* iso-kit:begin */
/* The code between these markers is anatomy's isometric kit (kit/iso-kit.mjs as ISO, kit/lathe.mjs as G),
   by Ryan, github.com/wheresryan22/anatomy, inlined by scripts/inline-kit.mjs. Do not edit here.
${license}
*/
${wrap('ISO', read('iso-kit.mjs'))}${wrap('G', read('lathe.mjs'), 'var cameraOf=ISO.cameraOf,iso=ISO.iso,pathOf=ISO.pathOf;')}/* iso-kit:end */`;

const decks = process.argv.slice(2);
if (!decks.length) { console.error('usage: node scripts/inline-kit.mjs path/to/deck.html'); process.exit(1); }
for (const deck of decks) {
  const html = fs.readFileSync(deck, 'utf8');
  const re = /\/\* iso-kit:begin \*\/[\s\S]*?\/\* iso-kit:end \*\//;
  if (!re.test(html)) { console.error(`inline-kit: no iso-kit markers in ${deck}`); process.exitCode = 1; continue; }
  fs.writeFileSync(deck, html.replace(re, () => block));
  console.log(`inline-kit: ${deck} (${(block.length / 1024).toFixed(0)} KB of kit)`);
}
