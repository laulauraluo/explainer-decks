# Changelog

## 0.2.0 (2026-11-24)

- **Renamed `block-deck` to `workshop-deck`.** If you installed `block-deck`, remove it and run `npx skills add laulauraluo/explainer-decks` again (or install `skills/workshop-deck/` by hand); the old folder gets no further updates.
- `workshop-deck` now draws each idea as an isometric machine in colour, built on [anatomy](https://github.com/wheresryan22/anatomy)'s kit and craft rules (MIT, credited in `kit/LICENSE-anatomy`). The message-queue example and the template were rebuilt; a surfing example deck was added.
- README: recorded GIFs, examples gallery, when-to-use section and comparison table; `scripts/capture-gifs.mjs` records the GIFs.

## 0.1.0 (2026-11-22)

- `pixel-deck`: 16-bit RPG pixel style, 23 sprites, deck engine, `shoot.mjs` (PNG + PDF + layout check), CDN demo deck.
- `block-deck`: isometric toy-block style with its own iso engine, `shoot.mjs`, message-queue demo deck.
- Evals, repository checks, CI, install docs for 16 agents.
