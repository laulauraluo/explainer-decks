# workshop-deck style

The look: one crafted machine per idea, drawn with anatomy's isometric kit and craft rules, in colour, on a warm floor inside a 16:9 slide. Words live on HTML tags, never in the drawing.

## Credits

The figures are built on **anatomy** by Ryan ([github.com/wheresryan22/anatomy](https://github.com/wheresryan22/anatomy), MIT): its isometric kit (`kit/iso-kit.mjs`, `kit/lathe.mjs`, copied unchanged) and its craft rules (`craft.md`, `kit.md`, `motion.md`, `verify.md`, `walkthrough.md`, adapted). The licence is in `../kit/LICENSE-anatomy`. workshop-deck adds the colour system below, the slide engine and the scene sizing.

## Colour system: one hue per role, on the kit's tone ramp

anatomy keeps a figure monochrome and lights one accent. workshop-deck keeps that structure and gives each **role** its own hue. `roleVars(role)` (in the deck engine) turns a role into the kit's CSS tokens, so every `solidSvg`, line and dot inside a part takes its role's colour with no per-part colours:

| token | lightness (HSL L) | used for |
|---|---|---|
| `--anatomy-top` | 84 | tops (the lightest face) |
| `--anatomy-shade-3` .. `shade-0` | 76, 70, 64, 57 | sides by facing, lit side to dark side |
| `--anatomy-hi` / `mid` / `lo` / `faint` | 22 / 40 / 52 / 63 | outline, structure lines, minor lines, grooves |
| `--anatomy-dot` | 24 | screws and rivets |

| role | hue, saturation | object in the example |
|---|---|---|
| `producer` | 8, 74 (coral) | card printer |
| `queue` | 212, 30 (slate blue) | roller track, stop pin, rider |
| `message` | 44, 95 (sun) | printed cards: **the accent**, the part to watch |
| `consumer` | 172, 50 (teal) | card reader and its bin |
| `failure` | 352, 72 (red) | jams, lost messages, warning lamps |
| `bench` | 32, 26 (warm sand) | base plates |
| `paper` | 40, 30 | paper, ruler strips |

Rules:
- One hue per role for the whole deck; the audience learns "teal = consumer" once.
- Structure and housings stay in their role's mid tones; the accent role (usually `message`) is the brightest and most saturated thing on the slide. Lamps and LEDs light in a brighter variant (`[h, s, +6]`) only while they are on.
- Pass `[hue, saturation, lightness shift]` for a one-off variant (a dull lamp that is off, a darker ruler).
- **It must read in greyscale.** Roles differ in lightness as well as hue, and the accent is the lightest. Check a greyscale copy of every shot.
- Floor `#f8f2e8`, ink `#2d2a35`, muted text `#6e6878`. Fonts: Fredoka (headings) and Nunito (body).

## Proportions (world units, about 1 px of the real object)

- Camera: azimuth 35 for a flow that runs along -y (it shows the long side), elevation 30: `figure(S, { azimuth: 35 })`.
- A machine is 50-70 wide and 45-60 tall; a message card 24 x 16 x 3; screws 0.55-0.75 dots; bevels 0.5-1.4; grooves inset 5.
- 1-2 objects per slide, plus what carries the flow between them. If the camera scale falls under the check's floor, split the slide.

## Do / don't

- **Do** make the object the explanation: a printer, a track, a reader, not a cube with a tag.
- **Do** detail with real parts: feet, seams that wrap the corners, label plates with three rule lines, closed vent slots, lamps in bezels, screws as dots, rollers, rails with a ruler strip.
- **Do** end every line on something: a seam on an edge, ticks hanging from a strip, slots as closed outlines.
- **Don't** put words in the drawing. Tags carry them, at the type floor (body 28 px, captions 24 px, tags 22 px).
- **Don't** shrink tags to fit. Split the slide.
