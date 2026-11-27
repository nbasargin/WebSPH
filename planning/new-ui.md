# New UI (step 5, v2.0.0)

Simple to use and to showcase: pick a scenario with one click, hit play. Full control in a custom mode that still looks clean.

## Routes and URL

- `/` – new UI: scenario cards, then the simulation view. `/original` – thesis UI, unchanged.
- `/?scenario=<preset>` selects a preset; further query parameters override it, e.g. `?scenario=wet-dam-break&particles=2000`.
- `scenario=custom` is a preset with default values, configured by the custom builder or by parameters.
- Parameter names and values in kebab-case. Particle distribution and ground shape are separate parameters
  (`distribution`, `ground`). Invalid or unknown parameters are ignored with a short notice.
- The URL is read once on load. UI changes do not update it (avoids edge cases like switching integrators mid-run).
- "Copy link" button: URL of the current preset plus all settings that differ from that preset
  (start configuration and runtime settings). Settings equal to the preset default are omitted.

## Simulation lifecycle

- Start configuration: particle count, distribution, ground (and initial boundary, h). Fixed once the simulation exists;
  changed only in the custom builder before starting, or by URL. Presets use a fixed particle count.
- Runtime settings: play/pause, max time, time stepping, integrator (expert: h, boundary, rendering options).
- Reset restores the start state and time, keeps the runtime settings (as in the thesis UI).

## Layout

- Full-screen canvas; controls as overlays that never cover the water: only the sky above the domain
  and the ground area below it.
- Always visible: play/pause, reset, scenario selection, copy link. Collapsible panel: max time, time stepping, integrator.
- Narrow / portrait screens: domain gets a taller aspect ratio (to try), controls move below the canvas, page scrolls.
- Desktop first; on mobile at least "pick a preset, play" must work well.

## Scenario selection

- Cards with thumbnail and short explanation, one click starts. "Custom" is one of the cards and opens the builder
  (particle count, distribution, ground, boundary, h, integrator, time stepping).
- Thumbnails: placeholders first, static screenshots later (no live previews).

## Boundary visualization

The view shows ~10% of the domain width beyond each side (the ghost zone alone, 2h, is too small to see).

- Solid: gray wall beyond the boundary, overdrawn with the mirrored fluid in a half-transparent tone.
- Cyclic: no wall, a thin line marks the boundary; the fluid continues with the opposite side.
- Limitation: cyclic boundary with different ground heights at both ends is a discontinuity – drawn as is
  (abrupt ground step, particles teleport up or down when crossing, gaining or losing energy).
  Idea for later: offset the continuation by the height difference so the ground appears continuous
  (left height 0, right height 1 → continuation on the right drawn 1 higher).

## Look

Angular Material 3 matching `homepage`: dark scheme, cyan palette, Fira Sans. Simulation colors adapted to the theme.
Light theme only if cheap.

## Architecture

- New renderer in `src/sph/updated/rendering/` (starts as a copy) for the full-screen layout and boundary visualization;
  original renderer untouched.
- Uses the original O(N²) simulation; the faster one from step 6 replaces it later.
- Thesis UI styles scoped to `/original` (currently global in `src/styles.scss`).

## Workflow

1. 2–3 standalone HTML mockups with the real simulation (local scratchpad files), compared on desktop and mobile
   (browser dev tools); decide the layout and boundary visualization.
2. Implementation on branch `new-ui` in small reviewable slices:
   routing + Material theme + scoped thesis styles → canvas + play/pause → scenario cards + URL presets →
   collapsible controls + copy link → custom builder → boundary visualization → thumbnails.
3. Claude checks slices in Chrome (Claude in Chrome extension) at several widths; the user reviews with `npm start`.
