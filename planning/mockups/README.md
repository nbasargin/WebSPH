# New UI mockup

Standalone HTML mockup of the chosen layout ("immersive", see [`../new-ui.md`](../new-ui.md)), running the original
simulation. Reference for the Angular implementation, not production code: canvas 2D instead of WebGL, CSS imitating
Angular Material.

Run from the repository root:

```sh
npx esbuild planning/mockups/entry.ts --bundle --format=iife --global-name=SPH --outfile=planning/mockups/sph.js
node planning/mockups/serve.js
```

Then open http://localhost:4300/mockup.html (phone sizes: `phones.html`). URL parameters work as planned, e.g.
`mockup.html?scenario=custom&particles=1000&ground=waves`.
