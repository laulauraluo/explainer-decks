---
name: workshop-deck
description: Turns a technical idea into an animated explainer slide deck in which every concept is drawn as a small isometric machine in colour (a card printer for a producer, a roller track for a queue, a card reader for a consumer), built from many solid parts with anatomy's isometric kit. Output is one self-contained HTML file on a 1920x1080 stage with keyboard navigation and a timeline per slide, plus a PNG of every slide and a PDF from a zero-dependency script. Use when someone wants explainer slides, a system-design or architecture talk, a teaching walkthrough, or a concept shown with motion (queues, caches, pipelines, load balancers, protocols), or asks for isometric, diorama or 3D-looking slides. Typical requests are "make slides explaining how a message queue works", "an animated deck on how our cache and read replica handle requests", "isometric slides for my system design talk" and "turn this concept into an explainer deck with a PDF". Not for .pptx output, corporate templates or chart-heavy data decks.
license: MIT (workshop-deck); the bundled kit and adapted references are anatomy's, MIT, see kit/LICENSE-anatomy
compatibility: Agent Skills format. Needs Node 20+ and Google Chrome or Chromium (CHROME_PATH to override) for scripts/shoot.mjs screenshots and PDF. The deck itself runs in any modern browser; fonts load from Google Fonts with system fallbacks.
---

# workshop-deck

Explain a technical idea one slide at a time, and on each slide show it as a real, well-made machine whose working *is* the idea. Words stay on tags and captions; the drawing carries the mechanism.

## Credits

The figures are built on **anatomy** by Ryan, [github.com/wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) (MIT). workshop-deck bundles its isometric kit unchanged (`kit/iso-kit.mjs`, `kit/lathe.mjs`, with `kit/LICENSE-anatomy`) and adapts its craft rules and workflow (`references/craft.md`, `kit.md`, `motion.md`, `verify.md`, `walkthrough.md`, each marked at the top). What workshop-deck adds: a colour system per role on the kit's tone ramp, the 16:9 slide engine (type floor, `#s=N&t=T`, reduced motion, print to PDF, `scripts/shoot.mjs`), and scenes sized for slides.

## Files

- `template/deck.html` - copy this: deck engine, the inlined kit (`ISO`, `G`), the bridge (`figure`, `part`, `roleVars`) and sample slides.
- `examples/message-queue/` - a 6-slide deck; slides 1 and 4 are the reference figures (printer, roller track, reader). Read them before your first deck.
- `kit/` - anatomy's kit and licence. `scripts/inline-kit.mjs deck.html` re-inlines it into a deck between the `iso-kit:begin/end` markers.
- `scripts/shoot.mjs` - shoots every slide at its final state (plus `--frame N:T`) and prints the PDF.
- `references/style.md` - the colour system, proportions, do / don't. `references/craft.md`, `kit.md`, `motion.md`, `verify.md`, `walkthrough.md` - anatomy's references with workshop-deck notes.

## The one idea that matters

**The object is the explanation** (anatomy). Don't draw boxes, arrows and labels; invent a physical thing whose mechanism maps one-to-one onto the concept, and build it from many small, precise, purposeful parts. A cube is allowed only where a block is the honest shape (a crate, a base plate). From the example:

| Concept | Object | What moves and what it means |
|---|---|---|
| producer | card printer with a paper roll | a card comes out of the print slot, the print lamp flashes: one message sent |
| message | printed card (the accent) | it rides the track: the message in transit |
| queue | accumulation roller track with a stop pin and a slot ruler | cards wait in order against the pin; the rider marks the tail: queue depth |
| consumer | card reader with intake slot, busy beacon, 4-LED progress strip, output bin | the pin drops, one card enters, the LEDs fill while it is read, it drops in the bin |
| slow consumer | the same reader, LEDs filling over 2 s | the track fills while the reader works |

## Workflow (anatomy's, for slides)

Run `date` at the start and at each step.

1. **Outline.** Write the talk as 4-8 one-line claims; each becomes a slide title. One idea per slide: a slide shows one change over time.
2. **Size it.** Per slide: **Figure** (one mechanism, 40-80 parts) or **Hero** (a dense object or the title slide, 80-150 parts). An **Epic** (a whole plant) does not fit a slide: propose a Hero that keeps the core. Count parts as anatomy does: solids, screws, slots, lamps.
3. **Truth first.** Collect the real numbers (rates, sizes, timeouts). The motion, the tags and the caption must agree with them, and with each other at every `t`.
4. **Invent the object.** Write the concept -> object table (above) for the whole deck before any geometry. One object per concept, the same object and hue on every slide.
5. **Parts list.** Per object: base (plate, feet, groove, corner screws, label plate), structure (housing, rails, posts), mechanism (rollers, pin, slot, roll), controls and indicators (buttons, lamps, LEDs), the subject (the accent). Each part sits on another part.
6. **Plan the world.** World units are about 1 px of the real object; x and y on the floor, z up. Run flows along -y. Camera azimuth 35-45, elevation 30 (`figure(S, { azimuth })`). 1-2 objects per slide must read at slide size; the engine fits the camera to the scene box and its tags.
7. **Build geometry once.** Static parts as kit SVG strings in a `part`; moving parts built once and moved with `move`, rebuilt only when their shape changes (a card cut by a slot, a pin rising).
8. **Painter's order.** Within a part, emit back to front. Between parts the engine sorts by `ISO.depthOf(at)`. Use `base: true` for things everything else stands on, and an explicit `depth` where a long part spans others (the reader is drawn before the track it receives). See `references/craft.md`, section 5.
9. **Frame it (slides).** Each `<section>` has a `.kicker`, an `<h1>`, a `.scene` and a `.cap`; tags name the objects (1-4 words, live numbers allowed). No words in the drawing.
10. **Make it live.** `update(t)` is a pure function of time: ease motion, crossfade states, end in a frame that tells the whole story (shots, PDF and reduced motion see only the final frame).
11. **Verify like a critic** (below).

## Slide markup

```html
<section id="slow">
  <p class="kicker">3 · Backlog</p>
  <h1>A slow consumer does not block producers</h1>
  <div class="scene"></div>               <!-- data-zoom caps the camera scale -->
  <p class="cap">What the motion shows, in one or two sentences. <em>Key word</em>.</p>
</section>
```

## Figure API (in the deck engine)

```js
scene('slow', function(S){
  var P = figure(S, { azimuth: 35 });              // anatomy camera; returns the projection
  var plate = part(S, { base: true, role: 'bench', at: [0, 0, -5],
    svg: ISO.solidSvg(ISO.slabOf({x:-40,y:-60,w:80,d:120,r:8}, -10, 10, P, 8, 1.4), {tone:'mid'}) });
  var card = part(S, { role: 'message', at: [0, 0, 1.5], top: [0, 0, 3],
    svg: ISO.solidSvg(ISO.slabOf({x:-12,y:-8,w:24,d:16,r:1.6}, 0, 3, P, 4, 0.5), {tone:'hi'}) });
  tag(S, card, 'message');
  return { dur: 3, update: function(t){ card.set({ move: [0, -80 * ease(t, .5, 2.5), 20] }); } };
});
```

- `figure(S, {azimuth, elevation, zoom, grid})` switches a scene to anatomy's projection (world unit ~ 1 px, default zoom cap 8, no floor grid).
- `part(S, {svg, at, role, base, depth, top, move, o})` -> handle with `set({...})`, `flag(name, on)`, `top()`. Elements marked `data-on="name"` show while the flag is on, `data-off="name"` while it is off (lamps, LEDs).
- `roleVars(role)` -> the CSS tokens for a role; wrap mixed-role sub-parts in `<g style="${roleVars('paper')}">`.
- The kit is `ISO.*` (iso-kit) and `G.*` (lathe): `slabOf`, `cylinder`, `sideSeam`, `planOutline`, `sideTicks`, `sideMatrix`, `dotsSvg`, `G.disc`, `G.prismOf`, `G.sphereOf`, `G.arcOf`, `G.circleOf`. Signatures: `references/kit.md`.
- `tag(S, target, text, {stem, dx, hue, o})` pins an HTML label to a part's `top()` or a world point; `set({text, target, o})` while animating.
- Timing: `ease(t,a,b)`, `pop`, `seg`, `lerp`, `clamp`, `mix`.
- The older block API (`block`, `slab`, `stack`, `cylinder`, `floorPath`, `token`) still works for simple slides; new figures use the kit.

## Engine contract

- 1920x1080 stage, letterboxed. Keys: Right / Space / PageDown next, Left / PageUp back, Home / End, R replays.
- `#s=N&t=T` opens slide N frozen at T seconds (`t=end` = final state); `&check` runs the checks.
- `prefers-reduced-motion` shows each slide's final state. Print (or `shoot.mjs`) gives one 16:9 page per slide in its final state.
- Type floor on the stage: body 28 px+, captions 24 px+, tags 22 px+. Never shrink these; cut words or split the slide.

## Craft rules (anatomy's, short form; full text in `references/craft.md`)

- **Solids, not wireframes**; every part filled and painted in order.
- **Tone hierarchy in colour**: base and feet `lo`/`mid`, structure `mid`, subject `hi`; one accent role, the brightest; everything still reads in greyscale (`references/style.md`).
- **Small precise detail, never noise**: bevels 0.5-1.4, grooves inset 5, screws as 0.55-0.75 dots, label plates with three rule lines, closed vent slots, seams that wrap the visible corners.
- **Lines resolve**: every line ends on an edge, another line or a dot; ticks hang from a ruler strip; only printed rule lines are `free`.
- **Volume**: real thickness, things stand on things, a soft halo under each base plate.
- **Composition**: 1-2 objects fill the scene box; nothing important hidden behind a tall part.

## Verify

1. `node scripts/shoot.mjs deck.html --out shots/ --frame N:T ...` - every slide and the busiest mid-animation moments. The red `CHECK` banner (missing title, text under the floor, overlapping or clipped text, camera scale under 0.45) must not appear; pages must equal slides.
2. Read every PNG.
3. **4x close-ups.** Render a slide at device scale 4 (Chrome `--headless=new --force-device-scale-factor=4 --window-size=1920,1080 --screenshot=out.png "file:///…/deck.html#s=N&t=end"`) and crop at least 6 regions per Hero slide: every object, every contact (feet, rails on a bezel, a card at a slot), every place a texture ends. Fix any bare face, empty corner, line ending in mid-air, part sunk into another, or depth error.
4. Check a greyscale copy of each shot.
