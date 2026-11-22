---
name: block-deck
description: Make an animated explainer slide deck in a friendly isometric "toy blocks on a table" style - chunky single-colour blocks with three flat tones, soft long shadows, a warm floor with a faint grid, and rounded word tags pinned to the pieces. One self-contained HTML file (1920x1080 stage, keyboard navigation, replay, per-slide JS timelines, print to PDF) plus a zero-dependency screenshot/PDF script. Use it when someone wants explainer slides, a system-design or architecture talk, a concept walkthrough with motion (queues, caches, pipelines, load balancers, protocols), or asks for slides with isometric blocks, a diorama, board-game pieces or a toy style.
license: MIT
compatibility: Agent Skills format. Needs Node 20+ and Google Chrome or Chromium (CHROME_PATH to override) for scripts/shoot.mjs screenshots and PDF. The deck itself runs in any modern browser; fonts load from Google Fonts with system fallbacks.
---

# block-deck

Explain a technical idea with toy pieces on a table: one idea per slide, one animated block scene per idea, words on rounded tags.

Files:
- `template/deck.html` - copy this; it holds the engine, the iso kit and three sample slides.
- `scripts/shoot.mjs` - shoots every slide at its final state and prints the PDF.
- `examples/message-queue/` - a finished 6-slide deck and its shots; read it before your first deck.
- `references/style.md` - palette, proportions, do / don't.

## Workflow

1. **Outline.** Write the talk as 4-8 one-line claims. Each claim becomes one slide title. Cut anything that is not needed for the last slide's takeaway.
2. **One idea per slide.** A slide shows one change over time: something moves, grows, breaks or comes back. If a slide needs two motions, split it.
3. **Map concepts to pieces.** Before coding, write a small table: concept -> piece -> hue. A service is a `block`, a list or backlog is a `stack` or a row of small blocks on a `slab` tray, a store or timer is a `cylinder`, a request or message is a `token` riding a `floorPath`. Keep a concept's hue the same on every slide.
4. **Build.** Copy `template/deck.html`, replace the `<section>`s and the `scene(...)` calls. Every section needs an `id`, a `.kicker`, an `<h1>` and a `.cap`; the scene with the same id draws into its `.scene` box.
5. **Shoot.** `node scripts/shoot.mjs path/deck.html --out path/shots/ --frame 3:1.5` (add `--frame N:T` for mid-animation moments you care about).
6. **Read every PNG**, then fix and re-shoot. A red `CHECK` banner at the top of a shot lists problems the engine found itself (see Checks).

## Slide markup

```html
<section id="pull">                      <!-- class="cover" for a big title slide -->
  <p class="kicker">2 · Consumers</p>
  <h1>Consumers pull at their own pace</h1>
  <p class="lede">Optional one supporting sentence.</p>
  <div class="scene"></div>              <!-- data-zoom="1" caps the camera scale (default 1.4) -->
  <p class="cap">What the motion shows, in one or two sentences. <em>Key word</em>.</p>
</section>
```
Split layout: wrap `<div class="scene">` and `<ul class="notes"><li style="--dot:#52c0b4"><b>Lead:</b> text</li></ul>` in `<div class="row">`.

## Iso API

Coordinates are world units on the floor: `x` runs to the screen's lower right, `y` to the lower left, `z` is up. `S` is the scene handle passed to your scene function. Hues: `coral tangerine sun leaf teal sky grape rose`, neutrals `cream stone`, or any `[top,left,right]` array.

```js
scene('pull', function(S){
  const T = slab(S,{x:0,y:0,w:110,d:500});                 // thin base plate, drawn under pieces
  const A = block(S,{x:-300,y:-330,w:150,d:150,h:120,hue:'teal'});
  const road = floorPath(S,[[55,-14],[55,-80],[-225,-80],[-225,-166]],{hue:'teal'});
  const m = token(S,road,{hue:'sun',size:44});              // a small block that rides the path
  const db = cylinder(S,{x:400,y:0,r:60,h:90,hue:'grape'});
  const q = stack(S,{x:0,y:0,n:5,axis:'z',w:120,d:120,h:30,hue:'sky'}); // q.show(k), k may be fractional
  tag(S,A,'email worker'); tag(S,m,'message',{stem:36});
  return {dur:3, update(t){
    m.at(ease(t,0.5,2), 10*Math.sin(Math.PI*ease(t,0.5,2)));  // at(u, lift)
    A.set({hue: t>2 ? 'stone' : 'teal'});
    q.show(5*ease(t,0,2));
  }};
});
```

- `iso(x,y,z)` -> `[sx,sy]` screen point before the camera.
- `block(S,{x,y,z,w,d,h,hue,o,base,shadow,depth})` -> handle with `set({...})`, `top()`, `p`. `o` is opacity (0 hides it).
- `slab(S,opts)` = a `block` with `h:16, hue:'cream', base:true`. Bases always draw under normal pieces, so things resting on a tray never vanish.
- `cylinder(S,{x,y,z,r,h,hue,sides})` centred on (x,y).
- `stack(S,{n,axis,gap,step,hues,...})` -> `{items, show(k), top()}`.
- `floorPath(S,points,{hue,width,arrow,o})` -> `{at(u), len, points}`; `{o:0,arrow:false}` makes an invisible route.
- `token(S,path,{hue,size,h})` -> block handle plus `at(u,lift)`.
- `tag(S,target,text,{stem,dx,hue,o})` -> HTML label pinned to `target.top()` or a world point `[x,y,z]`; `set({text,o,hue})` while animating.
- Timing: `ease(t,a,b)` (0..1, eased between seconds a and b), `pop(t,a,b)` (overshoot), `seg`, `lerp`, `clamp`, `mix(hexA,hexB,u)`.
- Painter's order is automatic: every frame, pieces re-sort by the depth of their centre (x+y+z). Override with `depth` only for a piece that must sit on top of a larger one.
- Camera: the engine samples the whole timeline, then scales and centres pieces **and tags** to fit the `.scene` box. Tags never scale, so text stays at full size.

## Engine contract

- 1920x1080 stage, letterboxed. Keys: Right / Space / PageDown next, Left / PageUp back, Home / End, R replays. Counter and Replay button top right.
- `#s=N&t=T` opens slide N frozen at T seconds; `t=end` is the final state. `&check` runs the checks.
- `prefers-reduced-motion` shows each slide's final state. Print (or `shoot.mjs`) gives one 16:9 page per slide in its final state.

## Style rules

- One hue per object, 3 flat tones (top light, left mid, right dark). No gradients, outlines, textures or tiny parts. 3-7 pieces per scene.
- Generous spacing: at least half a block between pieces; a path running behind a block needs about 1.2x that block's height of floor between them or the block hides it.
- **Run flows along -y** (screen: lower left to upper right) or -x. An arrow travelling along +x or +y ends on a block's hidden back face.
- Words live in HTML: titles, captions, tags. Tags are 1-4 words. Change a tag's text over time instead of adding more tags.
- Type floor on the 1920x1080 stage: body 28px+, captions 24px+, tags 22px+ (template: lede 30, notes 30, caption 26, tag 24). Never shrink these to fit; cut words or split the slide.
- End every animation in a state that tells the whole story by itself: the PDF and the shots only see the final frame.

## Checks (read every PNG for these)

`shoot.mjs` loads each slide with `&check`. The engine paints a red banner listing: missing title, any text under the type floor, overlapping text (tags, title, caption, notes), text clipped by the slide edge, and a camera scale under 0.45 (too much in one scene). It checks the frozen frame only, so also shoot the busiest mid-animation moments with `--frame N:T`.

By eye, on every PNG: no block drawn over one that stands in front of it; arrows end on visible faces; every tag's stem points at the right piece; the scene is in its final state; nothing important hidden behind a tall block. Confirm the summary line says pages == slides.
