# WebSPH

This project aims to bring an interactive fluid simulation based on the Smoothed Particle Hydrodynamics (SPH) method to the web.

## Web demo

Original demo (thesis version): http://websph.azurewebsites.net/

## How to run locally

Requires Node.js (22.22+, 24.15+ or 26+) with npm.

1. `git clone https://github.com/nbasargin/WebSPH.git` and `npm install`
2. `npm start` starts a dev server at http://localhost:4200/
3. `npm run build` creates a production build in `dist/websph`, `npm test` runs the tests

## Changelog

### v1.0.0 (in progress)

- Toolchain modernized: Angular 22 (standalone components, zoneless, signals), TypeScript 6, npm instead of yarn.
- Code cleanup and simplification with the same look, functionality and simulation results; unused code removed.
- Reference tests (Jest) verify that simulation results stay identical.
- Euler integrator computes the acceleration before moving the particles (first step after a reset no longer ignores forces).

### v0.9.2 – thesis version (2017)

- Version described in the bachelor's thesis _"Interactive Simulation of Floods Using the SPH Method"_ (TUM, 2017).
