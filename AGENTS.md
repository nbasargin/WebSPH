# AGENTS.md - WebSPH

## Overview

Interactive web-based fluid simulation: **1D Shallow Water Equations** discretized with
**Smoothed Particle Hydrodynamics (SPH)**, rendered with WebGL. Originally the bachelor's thesis
_"Interactive Simulation of Floods Using the SPH Method"_ (TUM, 2017), now being revived.

Roadmap, decisions and ideas are in `planning/` – read `planning/README.md` first and keep it up to date.

## Reference

- `thesis/` – thesis PDF, local only (not committed). Use `pdftotext` to read it.
- Live demo of the original version: http://websph.azurewebsites.net/
- Sibling repos `nbasargin/homepage` and `nbasargin/inat-editor` – reference for project structure,
  Prettier config and GitHub Pages deployment.

## Tech Stack

Angular 22 (standalone, zoneless, signals) + TypeScript 6, raw WebGL 1, Jest for tests, Prettier (config in `package.json`).
Commands: `npm start` (dev server), `npm run build`, `npm test`, `npm run format`.

## Project Structure

- `src/main.ts` – bootstrap, `src/app/app.ts` – root component, `src/app/routes.ts` – routes.
- `src/sph/original/` – original (thesis) simulation, framework-agnostic, no Angular imports:
  - `simulation/` – `Simulation` (time stepping, integrator), `Environment` (parameters + `FluidState`,
    SPH height/acceleration sums, O(N²)), integrators, boundaries, ground profiles.
  - `rendering/` – WebGL renderer, render loop. `scenarios/` – predefined scenarios.
  - `test/` – reference data, generator and Jest spec.
- `src/app/original/` – original UI: `page-original.ts`, `controller.ts` (signal-based state + actions), `settings/` panels.

## Working Agreement

- Ask clarifying questions before starting; do not assume too much.
- Share suggestions, and point out unfeasible requests or logic errors in instructions.
- Commit only when explicitly asked. If a session is explicitly autonomous, commit after each step;
  when unsure, ask for review instead.
- Before starting a new task, check for uncommitted changes and remind the user if there are any.

## Conventions

- Code is formatted with Prettier.
- Keep `src/sph/` free of Angular dependencies.
- Remove outdated code instead of commenting it out.
- Add a very brief entry to the changelog at the bottom of `README.md` for each significant change since the thesis version (v0.9.2).
- Tests: `npm test` (Jest). Jest runs code in Node vm contexts where global lookups (e.g. `Math`) are ~70x slower;
  cache globals at module level in hot simulation code (see `smoothing-kernel.ts`).
- Simulation results must stay identical to `src/sph/original/test/reference.json` unless a change is intended;
  intended changes regenerate the reference in the same commit and are noted in `planning/plan.md`.
