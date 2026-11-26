# Fast neighbor search

Status: researching (roadmap step 6)

**Problem:** `Environment.fluidHeight/fluidAcc` sum over all particles → O(N²) per step,
plus O(N) per rendered height sample. The cubic kernel has compact support (|x| < 2h), so most terms are zero.

**Candidates:**

- Uniform buckets with cell size 2h, rebuilt each step (thesis 3.6.1, Goswami et al. 2010).
- 1D-specific: keep particles sorted (nearly sorted between steps → cheap insertion sort), sliding window
  or binary search for queries. Likely simplest and fastest.
- Typed arrays instead of `Particle` objects, Web Workers, WebGPU compute.

**To consider:** boundary ghost particles, cyclic wrap-around, changing h, uneven density;
verify against the O(N²) version; benchmark with 500 → 100k particles.
