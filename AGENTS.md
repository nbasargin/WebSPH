# AGENTS.md - WebSPH

## Overview

Interactive web-based fluid simulation: **1D Shallow Water Equations** discretized with
**Smoothed Particle Hydrodynamics (SPH)**, rendered with WebGL. Originally the bachelor's thesis
*"Interactive Simulation of Floods Using the SPH Method"* (TUM, 2017), now being revived.

Roadmap, decisions and ideas are in `planning/` – read `planning/README.md` first and keep it up to date.

## Reference

- `thesis/` – thesis PDF, local only (not committed). Use `pdftotext` to read it.
- Live demo of the original version: http://websph.azurewebsites.net/
- Sibling repos `nbasargin/homepage` and `nbasargin/inat-editor` – reference for project structure,
  Prettier config and GitHub Pages deployment.

## Tech Stack

Angular 10 + TypeScript 4 (migration in progress, see `planning/plan.md`), raw WebGL with `gl-matrix`.

## Project Structure

- `src/simulation/` – framework-agnostic simulation core: `Simulation` (time stepping, integrator),
  `Environment` (particles, SPH height/acceleration sums), integrators, boundaries, ground profiles.
- `src/rendering/` – WebGL renderer and helpers.
- `src/ui/` – Angular components; `Controller.ts` connects UI, simulation and renderer.
- `src/util/` – enums, defaults, predefined scenarios.

## Conventions

- Code is formatted with Prettier.
- Keep `src/simulation/` free of Angular dependencies.
- Remove outdated code instead of commenting it out.
