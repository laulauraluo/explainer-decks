# pixel-deck style reference

## Tokens (CSS custom properties on `:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f2e6c8` | parchment slide background (with a 28 px dot grid, `--bg-dot`) |
| `--win` | `#fff8e6` | window fill |
| `--scr` | `#fffdf3` | scene screen fill |
| `--line` | `#4a2c17` | borders, title tabs, pixel outlines |
| `--ink` | `#2b1a10` | body text |
| `--muted` | `#6b4f36` | kicker, notes, secondary labels |
| `--accent` | `#a3271f` | readout keys, kicker arrow |
| `--good` | `#23805d` | success, fresh, hit |
| `--btn` / `--btn-lo` | `#ffe08a` / `#d9a93a` | buttons and step badges |
| `--shadow` | `rgba(74,44,23,.30)` | 8 px offset drop shadow |

In scenes use `C.*` (same family): `C.good`/`C.goodF` for success, `C.red`/`C.redF` for failure, `C.blue`/`C.blueF` for neutral highlights, `C.gold`/`C.yellow` for "looking at this now".

## Type

- Headings: Pixelify Sans 700. Tabs, kickers, readout keys: Press Start 2P 24 px uppercase, because Pixelify's small caps make C look like O ("CACHE" reads "OAOHE"). Body and diagram labels: IBM Plex Sans 400/600. All three are OFL fonts from Google Fonts with system fallbacks.
- Sizes on the 1920x1080 stage: h1 64 px (88 on the cover, auto-shrinks to fit one line, never below 48), sub 30, body 28, captions and keys 24, diagram labels 22 to 26.

## Spacing

- Slide gutter 80 px; header from 52 px; content row from 300 px to 84 px above the bottom; 56 px between windows.
- Windows: 44 px top padding (room for the tab), 24 px sides; 20 px between children.
- Pixel units: borders 4 px, chip borders 3 px, dotted paths 6 px squares every 14 px. Keep sprite scales integer so pixels stay crisp.

## Do and don't

- Do put the claim in the title. Readers skim titles; the PDF has no presenter.
- Do keep one scene per slide. Two simultaneous stories halve attention for each.
- Do use color for state (green fresh, red stale or missing, yellow "now"), always with a word next to it; color alone fails for color-blind readers and in grayscale print.
- Don't bake words into sprites. Text in sprites cannot be resized, translated, searched, or read by screen readers.
- Don't go below the type floor to fit more. A projected 1920x1080 slide is often shown at a third of its size; 22 px becomes about 7 px.
- Don't animate what does not change meaning. Idle motion pulls the eye from the readout.
- Don't use real company logos or brand art in sprites; the library is original and generic for a reason.
