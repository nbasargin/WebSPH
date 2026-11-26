# Plan

## Roadmap

⬜ not started · 🟨 in progress · ✅ done

1. ✅ **Agentic structure** – `AGENTS.md` and `planning/`.
2. ⬜ **Toolchain modernization** – Angular 10 → latest stable, standalone components, strict TS,
   project structure as in `homepage`; remove leftovers along the way. Prettier reformat as a separate commit.
   Done when it runs on current Node and behaves like the live demo.
3. ⬜ **GitHub Pages** – deploy action, `/WebSPH/` base href, `404.html` routing workaround, README update.
4. ⬜ **Rename `master` → `main`**.
5. ⬜ **Routing + new UI** – new minimalistic UI with Angular Material; thesis UI kept on a separate route.
6. ⬜ **Faster simulation** – new variant faster than O(N²), see [`ideas/fast-neighbor-search.md`](ideas/fast-neighbor-search.md).
   Minimal Jest setup for the simulation core (ask the user first, they have an example repo).
7. ⬜ **More features** – pick from [`ideas/`](ideas/).

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
- 2026-11-26 Tests with Jest, minimal setup.
- 2026-11-26 Azure demo stays online for now – the thesis links to it.
- 2026-11-26 Remove outdated code instead of keeping it – git history is the archive.

## Open questions

- Route names, e.g. landing page at `/` linking to `/original` and `/updated`?
