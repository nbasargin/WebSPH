# Plan

## Roadmap

⬜ not started · 🟨 in progress · ✅ done

1. ✅ **Agentic structure** – `AGENTS.md` and `planning/`.
2. ✅ **Toolchain modernization (v1.0.0)** – Angular 10 → 22, keeping functionality, look and feel. Steps:
   1. ✅ Reference data from the original simulation (`src/sph/original/test/`), then Euler fix + regenerated reference.
   2. ✅ Fresh Angular 22 scaffold (setup as in `homepage`, Node 26), remove old configs and leftovers.
   3. ✅ `git mv` sources into the new layout, kebab-case file names: `src/sph/original/` (simulation, rendering, scenarios), `src/app/original/` (thesis UI).
   4. ✅ Prettier reformat only.
   5. ✅ Migration + simplification (see below), Jest reference test passes bit-exact.
   6. ✅ Docs, changelog, visual and performance check against the live demo, version `1.0.0`.
3. ✅ **GitHub Pages** – deploy action, `/WebSPH/` base href, `404.html` routing workaround, README update.
   The commit that completes it gets tag `v1.0.0`, and its message names the version.
4. ✅ **Rename `master` → `main`**.
5. 🟨 **Routing + new UI (v2.0.0)** – new minimalistic UI with Angular Material; thesis UI kept on a separate route.
   Design and steps in [`new-ui.md`](new-ui.md), work on branch `new-ui`.
6. ⬜ **Faster simulation** – new variant faster than O(N²), see [`ideas/fast-neighbor-search.md`](ideas/fast-neighbor-search.md).
   Generator can be pointed to the migrated code to serve as reference.
7. ⬜ **More features** – pick from [`ideas/`](ideas/).

### Migration details (step 2)

- Simulation core: plain fields instead of getters/setters, functions instead of static-only classes,
  string union types instead of enums + `toEnum`/`EnumChecker`, no defensive self-checks, scenarios as plain objects.
- `Environment` split into state (positions, ghost positions, time) and parameters; integrators keep only
  preallocated prediction arrays instead of `Environment` copies (no `copy()`, no syncing of h/boundary).
- Ghost particles as positions only, particle color moved to the renderer; single `GRAVITY` constant.
- Rendering: no gl-matrix (own ortho matrix), no base square, visualization smoothing length passed as parameter.
- UI: one signal-based service instead of `Controller` + `SettingsComponent` relay; zoneless, standalone components, SCSS.
- Remove unused code (`ConstSineGround`, `DynamicSmoothingKernelGround`, `GroundPresets`, misc component, `RenderLoop`, …).

## Decisions

- 2026-11-26 Work on branch `modernization`, based on `update-angular` – contains the 2020 Angular 10 upgrade and cleanup (rejected: restart from `master`).
- 2026-11-26 Planning lives in Markdown in the repo – explicit and shared across sessions (rejected: agent memory).
- 2026-11-26 Target the latest stable Angular (22 at time of writing) – no reason to stop at an older major.
- 2026-11-26 Setup aligned with `homepage`: Prettier config in `package.json`, no ESLint, strict TS, `src/app/` structure – consistency across repos.
- 2026-11-26 Host on GitHub Pages, deployed by a GitHub Action on push to branch `deploy` – same as `homepage`.
- 2026-11-26 Rename `master` → `main` after GitHub Pages works, before the new UI.
- 2026-11-26 New UI uses Angular Material – same design system as `homepage`.
- 2026-11-26 Original thesis UI stays on its own route – preserved for reference.
- 2026-11-26 Faster simulation is added alongside the O(N²) one – original serves as correctness reference (rejected: in-place rewrite).
- 2026-11-26 Tests with Jest, minimal setup (config in `package.json`).
- 2026-11-26 Azure demo stays online as "original demo" – the thesis links to it.
- 2026-11-26 Remove outdated code instead of keeping it – git history is the archive.
- 2026-11-26 Versions: 0.9.2 = thesis version (tagged), 1.0.0 = modernized, 2.0.0 = new UI; changelog at the bottom of `README.md`.
- 2026-11-26 Migration keeps simulation results bit-exact, verified by reference data (positions + speeds, float64, scenario defaults, 200 steps) – any difference is a regression.
- 2026-11-26 Exception: Euler now computes the acceleration before moving particles – previously the first step after reset/integrator switch used acc = 0 or a stale value.
- 2026-11-26 Gravity is a single constant (`9.81`) – it was never configurable in the UI.
- 2026-11-26 String union types instead of enums – plain string literals work in templates, no runtime code (rejected: TS string enums).
- 2026-11-26 Pushing branches and tags is left to the user.
- 2026-11-27 Deployment uses the built-in `GITHUB_TOKEN` instead of a personal access token – no token renewal (rejected: official Pages actions without `gh-pages` branch, to stay similar to `homepage`).
- 2026-11-27 `deploy` branch is created from `modernization`; `master` stays untouched until the rename to `main`.
- 2026-11-27 `master` renamed to `main` and fast-forwarded to the modernized state; development continues on `main`.
- 2026-11-27 Deployment switched to the official Pages actions (`upload-pages-artifact`, `deploy-pages`) – no committed builds in a `gh-pages` branch (supersedes the `GITHUB_TOKEN` + `gh-pages` decision above).
- 2026-11-27 New UI at `/`, thesis UI at `/original` – showcase first (rejected: separate landing page linking `/original` and `/updated`).
- 2026-11-27 Scenarios via URL: `?scenario=<preset>` plus overriding parameters; copy link contains only differences to the preset – shareable without encoding all defaults (rejected: switching to `custom` on any change).
- 2026-11-27 Particle count, distribution and ground are fixed per simulation, set only before start – changing them requires a reset anyway.
- 2026-11-27 UI mockups as local standalone HTML files before Angular code – cheap to compare and discard.
- 2026-11-28 Layout "immersive" (mockup A): full-screen canvas, controls in sky and ground areas, scenario sheet – uncluttered, clear selection step (rejected: page with cards below the canvas, side panel).
- 2026-11-28 One smoothing length for simulation and visualization, no rendering settings – simpler UI (rejected: separate visualization h as in the thesis UI).
- 2026-11-28 Boundaries shown with ~10% margins: solid = gray wall with half-transparent mirrored fluid, cyclic = thin line and continued fluid – makes the boundary condition visible (rejected: drawing only the 2h ghost zone).
- 2026-11-26 Hot loops use index loops and compute abs/sign via comparisons – `for...of` was ~40% slower in Firefox, global `Math` lookups ~150x slower in Jest's vm contexts (rejected: other test runner, caching `Math.abs` – ~8% slower in Firefox).

## Known quirks (kept for now)

- Analytical dam break overlay assumes the wet dam break setup (dam at x = 0.5, heights 1 and 0.5).
- Cyclic boundary with different ground heights at both ends is a discontinuity, particles jump in height (see `new-ui.md`).
