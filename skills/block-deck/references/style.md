# block-deck style

The look: toy pieces on a warm table. Few, chunky, colourful blocks; words on tags.

## Palette

| name | top | left | right | use for |
|---|---|---|---|---|
| coral | `#ff9d8f` | `#f17868` | `#d35a4d` | senders, producers, the "cause" |
| tangerine | `#ffc27a` | `#f5a24c` | `#d68330` | a second sender |
| sun | `#ffe07c` | `#f4c843` | `#d6a82a` | the thing that moves (messages, requests) |
| leaf | `#a6de90` | `#77c466` | `#58a54b` | success, acked, healthy |
| teal | `#88dcd2` | `#52c0b4` | `#379f94` | workers, consumers |
| sky | `#a0caff` | `#6aa3f0` | `#4c83d1` | a second worker, clients |
| grape | `#c3abf8` | `#9a7fe5` | `#7a60c6` | stores, timers, config |
| rose | `#ffb0d2` | `#f283b2` | `#d26392` | warnings that are not errors |
| cream | `#fffaf2` | `#efe3d0` | `#dccbb1` | trays, boards, plinths |
| stone | `#d3d5dc` | `#adb1bd` | `#8b909e` | dead, disabled, out of play |

Floor `#f8f2e8`, grid `#eadfcd`, letterbox `#e7dac4`, ink `#2d2a35`, muted text `#6e6878`.
Fonts: Fredoka (headings) and Nunito (body), both OFL, with `ui-rounded` / `system-ui` fallbacks.

## Proportions

- Service block 150 x 150 x 120. Small piece (message, request) 64-80 wide, 30-44 tall. Tray height 16-18.
- Gap between pieces at least 80 world units; trays leave 16 between slots.
- 3-7 pieces in view; a row of identical small pieces counts as one.
- Tag stem 36-110 px; longer stems lift a tag clear of the pieces under it.

## Do / don't

- **Do** give each concept one hue for the whole deck. The audience learns "teal = worker" once.
- **Do** show state with whole-piece changes: hue swap, height change, appear / disappear. Small details vanish at projector distance.
- **Do** run flows along -y (lower left to upper right). Arrows then end on a visible face.
- **Don't** add bolts, dials, vents, rails or labels painted on faces. Every extra part is noise; the tag carries the meaning.
- **Don't** use a gradient or outline on a face. Three flat tones read as solid at any scale and print cleanly.
- **Don't** shrink tags or captions to fit. The camera shrinks pieces, never words; if it is crowded, split the slide.
- **Don't** let two tags meet. Merge them ("worker A: m1 in flight") or show one at a time.

## How this differs from monochrome technical isometric styles

Technical isometric illustration usually draws one detailed machine in greys with four-tone paper shading, many small precise parts (screws, knurls, gauges, rails) and labels set into the drawing. block-deck goes the other way on purpose:

- **Colour carries meaning**: saturated soft hues, one per concept, instead of a grey ramp with one accent.
- **Few, big parts**: plain boxes, slabs and cylinders with rounded corners, like wooden toys or board-game pieces, not machined assemblies.
- **Three flat tones** per hue and one soft long shadow on the floor, not paper shading and contact lines.
- **Words outside the drawing**: HTML tags on stems, always upright and full size, not text skewed into faces.
- **A table, not a plinth**: warm off-white floor with a faint fading grid; the scene floats on it.
