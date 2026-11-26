# Plan

## Roadmap

⬜ not started · 🟨 in progress · ✅ done

1. ✅ **Agentic structure** – `AGENTS.md` and `planning/`.
2. 🟨 **Toolchain modernization (v1.0.0)** – Angular 10 → 22, keeping functionality, look and feel. Steps:
   1. ✅ Reference data from the original simulation (`src/sph/original/test/`), then Euler fix + regenerated reference.
   2. ✅ Fresh Angular 22 scaffold (setup as in `homepage`, Node 26), remove old configs and leftovers.
   3. ✅ `git mv` sources into the new layout, kebab-case file names: `src/sph/original/` (simulation, rendering, scenarios), `src/app/original/` (thesis UI).
   4. ✅ Prettier reformat only.
   5. ✅ Migration + simplification (see below), Jest reference test passes bit-exact.
   6. 🟨 Docs and changelog ✅; visual check against the live demo (user), then version `1.0.0`.
3. ⬜ **GitHub Pages** – deploy action, `/WebSPH/` base href, `404.html` routing workaround, README update.
4. ⬜ **Rename `master` → `main`**.
5. ⬜ **Routing + new UI (v2.0.0)** – new minimalistic UI with Angular Material; thesis UI kept on a separate route.
   Original UI styles are global (`src/styles.scss`) and must be scoped to the original page then.
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
- 2026-11-26 Hot loops use index loops and compute abs/sign via comparisons – `for...of` was ~40% slower in Firefox, global `Math` lookups ~150x slower in Jest's vm contexts (rejected: other test runner, caching `Math.abs` – ~8% slower in Firefox).

## Open questions

- Route names, e.g. landing page at `/` linking to `/original` and `/updated`?

## Known quirks (kept for now)

- Analytical dam break overlay assumes the wet dam break setup (dam at x = 0.5, heights 1 and 0.5).
