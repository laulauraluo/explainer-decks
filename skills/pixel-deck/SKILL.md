---
name: pixel-deck
description: Turns a technical idea into an animated explainer slide deck in a warm parchment, 16-bit RPG pixel style, with pixel-bordered windows, 23 original sprites (user, laptop, server, database, chest, lock, key and more) and a timeline per slide. Output is one self-contained HTML file on a 1920x1080 stage, plus a PNG of every slide and a PDF from a zero-dependency script. Use when someone wants slides for a talk, a lightning talk, a tech explainer or a teaching walkthrough with a playful look, or wants to show how a system works step by step (requests, caches, queues, pipelines, protocols). Typical requests are "make me slides in pixel / retro / 8-bit / game style", "a 5-slide lightning talk on how HTTPS keeps a login safe, with a PDF" and "explain how a CDN serves a request as an animated deck". Not for .pptx output, corporate templates or chart-heavy data decks.
license: MIT
compatibility: Agent Skills format. The deck is a single HTML file that runs in any modern browser. scripts/shoot.mjs (screenshots, PDF, layout check) needs Node 20+ and Google Chrome or Chromium; set CHROME_PATH if Chrome is not in a standard location. Fonts load from Google Fonts and fall back to system fonts offline.
---

# pixel-deck

One HTML file per deck. Copy `template/deck.html`, replace the slides and scenes, then shoot and read every PNG. `examples/cdn/deck.html` is a finished 6-slide deck to copy patterns from.

## Workflow

1. **Outline.** Write the deck as a list of one-sentence claims. One idea per slide; the claim becomes the `<h1>`. 4 to 8 slides for a lightning talk.
2. **Pick a scene per slide.** Ask: what moves? A request travelling, a box filling, a cache row lighting up, a bar growing. Pick actors from the sprite library. If nothing moves, use a step list instead of a scene.
3. **Build.** Copy `template/deck.html` next to where the deck should live. Edit the `<section class="slide">` blocks and the `SCENES` script. Leave the engine script alone.
4. **Shoot.** `node scripts/shoot.mjs path/to/deck.html --out path/to/shots/`. It writes `slide-NN.png` (final state of each slide, 1920x1080), `deck.pdf` (one page per slide), and prints layout-check issues. Exit code 2 means issues or a page-count mismatch.
5. **Read every PNG**, not just the summary line. Look for: text over sprites or paths, empty or lopsided scenes, labels that do not match the readout, a scene that is not in its finished state. Check one mid-animation frame per scene with Chrome: `--headless=new --window-size=1920,1080 --virtual-time-budget=8000 --screenshot=f.png "file:///abs/deck.html#s=3&t=1.5"`.
6. **Fix and re-shoot** until the check says 0 issues and the PNGs read cleanly.

## Slide markup

```html
<section class="slide" data-scene="hit">
  <header>
    <p class="kicker">Step 2 · Cache hit</p>
    <h1>Hit: the edge already has a fresh copy</h1>
    <p class="sub">One or two sentences: the mechanism in plain words.</p>
  </header>
  <div class="content">
    <div class="win" style="flex:1.9"><h2>At the edge</h2>
      <div class="screen"><svg role="img" aria-label="What the scene shows"></svg></div>
      <p class="cap" data-at="3.6">The one thing to notice.</p>
    </div>
    <div class="win"><h2>Readout</h2>
      <div class="readout">
        <div class="item" data-at="1.6"><b>Key</b><p>Short sentence.</p></div>
      </div>
    </div>
  </div>
</section>
```

- `.content` is a flex row under the header; each `.win` takes its share via `style="flex:N"`. Use `<div class="col">` to stack windows vertically.
- `.cover` on the first slide gives a larger title.
- `data-at="seconds"` on any element fades it in at that time. The slide duration is the larger of the scene duration and the last `data-at`.
- Components: `.win` + `<h2>` title tab, `.screen` (holds the scene SVG), `.readout .item` (`<b>` key + `<p>`), `ol.steps > li` (numbered pixel badges), `.chip` / `.chip.good` / `.chip.bad` inside `.chips`, `.cap` caption, `.note` muted small text, `.btn`.

## Scene API

```js
scene("hit", 4.4, (svg, w, h) => {      // name matches data-scene; 4.4 s timeline
  backdrop(svg, w, h);                   // svg viewBox is w x h stage pixels, so sizes are 1:1
  const user = sprite(svg, "user", null, 7, 60, 200);       // name, palette (null = default), scale, x, y
  const path = dots(svg, [[130, 250], [300, 250]], C.good); // dotted pixel path
  const pkt = sprite(svg, "mail", null, 5);
  const ok = tag(svg, 215, 120, "200 OK", {anchor:"middle"});
  return t => {                          // called every frame with seconds t; must be a pure function of t
    path.reveal(seg(t, .2, .6));
    const [x, y] = along([[130, 250], [300, 250]], seg(t, .4, 1.2)); at(pkt, x - 22, y - 18);
    op(ok, seg(t, 1.4, 1.7));
  };
});
```

- Drawing: `E(tag, attrs, parent)`, `R(p, x, y, w, h, fill)`, `T(p, x, y, text, {size, fill, w, anchor, px})` (size defaults to 24, floored at 22), `pbox(p, x, y, w, h, fill, line, shadow)` notched pixel box returning `{g, e, f}` with `setBox(box, fill, line)`, `tag(p, x, y, text, {anchor, bg, line, fill})` box sized to its text, `arrow(p, x1, y1, x2, y2, color)` axis-aligned pixel arrow, `dots(p, points, color)` with `.reveal(k)`, `along(points, k)`, `backdrop(svg, w, h, {sky, ground})` for sky and ground bands.
- Sprites: `sprite(p, name | rows, palette, scale, x, y)` returns a group with `.w` and `.h`. Library: user, laptop, phone, server, database, cloud, gear, scroll, page, lock, key, chest, clock, check, cross, mail, globe, bolt, hourglass, warn, flag, tree, puff. Recolor with a palette override: `sprite(g, "server", {...PAL.server, G:C.red}, 6, x, y)`. New sprite: rows of characters, `.` transparent, one char per pixel, plus a palette object `{K:C.k, ...}`.
- Timing: `seg(t, a, b)` eased 0 to 1 between a and b, `lerp`, `clamp`, `at(el, x, y)`, `op(el, v)` SVG opacity, `hop(el, v)` HTML opacity, `vis(el, on)`, `blink(t, hz)`.
- Colors: `C` holds the palette (ink, line, muted, accent, good/goodF, red/redF, blue/blueF, gold, wood, metal, sky, ...).

## Style rules

- Small uppercase labels (window tabs, kickers, readout keys) use Press Start 2P at 24 px, not Pixelify Sans: at that size Pixelify draws C almost like O ("THE OAST"). Pixelify stays for big headings.
- Parchment page, cream windows, dark-brown 4 px pixel borders, offset shadow, title tab on every window. See `references/style.md`.
- Type floor on the 1920x1080 stage: body 28 px, captions and keys 24 px, any label inside a diagram 22 px. Never shrink text to make it fit; cut words or split the slide.
- Every word is HTML or SVG text, never baked into a sprite. Every slide has a visible `<h1>`.
- One scene per slide, 3 to 7 seconds. Motion explains something: a request moves, a state changes. No decorative loops.
- Final state carries the meaning: whoever sees only the PDF must get the full idea. Fade out only what would clutter the end frame.
- Keep labels off paths and sprites; leave 16 px between text and anything else.
- Numbers that are illustrative say so on the slide.

## Engine contract

- Keys: Right, Space, PageDown next; Left, PageUp previous; Home, End; R replays. Counter and Replay button at bottom right (hidden in screenshots and print).
- `#s=N` opens slide N and plays it; `#s=N&t=T` freezes slide N at T seconds (`t=end` for the final state); `#check` runs the layout check and writes a JSON report into `<pre id="pd-report">`.
- `prefers-reduced-motion` shows each slide's final state.
- Print or "Save as PDF" gives one 16:9 page per slide in its final state.

## Checks before you hand it over

- `shoot.mjs` reports 0 issues (type floor, clipped text, overlapping text, missing title) and the PDF page count equals the slide count.
- You opened every PNG and one mid-animation frame per scene.
- The deck is technically correct; claims in readouts match what the scene shows.
- Delete the template's "Sprite library" reference slide and its `gallery` scene.
