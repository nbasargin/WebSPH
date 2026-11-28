// Shared mockup core: presets, URL config, canvas renderer with boundary visualization, sim controller.
// Uses the real simulation (sph.js bundle of src/sph/original). Mockup quality, not production code.
'use strict';

const INTEGRATORS = { euler: 'euler', 'heun-naive': 'heunNaive', 'heun-std': 'heunStd', 'heun-fast': 'heunFast' };
const INTEGRATOR_LABELS = {
  euler: 'Euler',
  'heun-naive': 'Heun (naive)',
  'heun-std': 'Heun (standard)',
  'heun-fast': 'Heun (fast)',
};
const STEPPING = { fixed: 'fixed', 'dyn-stable': 'dynStable', 'dyn-fast': 'dynFast' };
const STEPPING_LABELS = { fixed: 'Fixed', 'dyn-stable': 'Stable', 'dyn-fast': 'Fast' };
const DISTRIBUTIONS = {
  uniform: 'uniform',
  'dam-break-wet': 'damBreakWet',
  'dam-break-dry': 'damBreakDry',
  'water-column': 'waterDrop',
};
const DISTRIBUTION_LABELS = {
  uniform: 'Uniform',
  'dam-break-wet': 'Dam break (wet)',
  'dam-break-dry': 'Dam break (dry)',
  'water-column': 'Water column',
};
const DISTRIBUTION_VOLUME = { uniform: 3, 'dam-break-wet': 4.5, 'dam-break-dry': 3.5, 'water-column': 2 };
const GROUNDS = {
  flat: () => new SPH.ConstLinearGround(0, 0),
  slope: () => new SPH.ConstLinearGround(0.07, -0.4),
  'dynamic-slope': () => new SPH.DynamicLinearGround(0, 0.15, 3),
  waves: () => new SPH.DynamicDoubleSineGround(),
};
const GROUND_LABELS = { flat: 'Flat', slope: 'Constant slope', 'dynamic-slope': 'Tilting', waves: 'Moving waves' };

// config keys = URL parameters (kebab-case)
const PRESETS = {
  'wet-dam-break': {
    title: 'Wet dam break',
    scenario: SPH.wetDamBreak,
    ground: 'flat',
    distribution: 'dam-break-wet',
    text: 'A dam breaks with water on both sides – the classic test case.',
  },
  'dry-dam-break': {
    title: 'Dry dam break',
    scenario: SPH.dryDamBreak,
    ground: 'flat',
    distribution: 'dam-break-dry',
    text: 'A dam breaks onto dry ground. Stops at 0.5 s, before particles get too fast.',
  },
  'collapsing-water-column': {
    title: 'Collapsing column',
    scenario: SPH.collapsingWaterColumn,
    ground: 'flat',
    distribution: 'water-column',
    text: 'A water column collapses into two waves that wrap around the cyclic boundary.',
  },
  'constant-slope': {
    title: 'Slope',
    scenario: SPH.constantSlope,
    ground: 'slope',
    distribution: 'uniform',
    text: 'Water flows down a constant slope and settles.',
  },
  'dynamic-slope': {
    title: 'Tilting ground',
    scenario: SPH.dynamicSlope,
    ground: 'dynamic-slope',
    distribution: 'uniform',
    text: 'The ground tilts back and forth and the water sloshes.',
  },
  'fluid-separation': {
    title: 'Fluid separation',
    scenario: SPH.fluidSeparation,
    ground: 'waves',
    distribution: 'uniform',
    h: 0.05,
    text: 'Moving ground waves split the water into pools and merge them again.',
  },
};

function key(map, value) {
  return Object.keys(map).find((k) => map[k] === value);
}

/** Full config of a preset (all URL parameters with their preset values). */
function presetConfig(id) {
  if (id === 'custom') {
    return {
      scenario: 'custom',
      particles: 750,
      distribution: 'dam-break-wet',
      ground: 'flat',
      boundary: 'solid',
      h: 0.03,
      integrator: 'heun-fast',
      'time-stepping': 'dyn-stable',
      dt: 0.001,
      'dt-limit': 0,
      'max-time': 0,
    };
  }
  const p = PRESETS[id];
  const o = p.scenario.simulationOptions();
  return {
    scenario: id,
    particles: o.particleNumber,
    distribution: p.distribution,
    ground: p.ground,
    boundary: o.boundaryType,
    h: p.h ?? o.smoothingLength,
    integrator: key(INTEGRATORS, o.integratorType),
    'time-stepping': key(STEPPING, o.timeSteppingMode),
    dt: o.fixedTimeStep,
    'dt-limit': Math.max(0, o.timeStepLimit),
    'max-time': Math.max(0, o.timeMax),
  };
}

const NUMERIC = ['particles', 'h', 'dt', 'dt-limit', 'max-time'];
const ENUMS = {
  distribution: DISTRIBUTIONS,
  ground: GROUNDS,
  boundary: { solid: 1, cyclic: 1 },
  integrator: INTEGRATORS,
  'time-stepping': STEPPING,
};

/** Preset from ?scenario plus overriding parameters; returns { config, ignored }. */
function configFromUrl(search = location.search) {
  const params = new URLSearchParams(search);
  const id = params.get('scenario');
  const valid = id && (id === 'custom' || PRESETS[id]);
  const config = presetConfig(valid ? id : 'wet-dam-break');
  const ignored = [];
  for (const [k, v] of params) {
    if (k === 'scenario') continue;
    if (NUMERIC.includes(k) && Number.isFinite(+v) && +v >= 0) config[k] = +v;
    else if (ENUMS[k] && ENUMS[k][v]) config[k] = v;
    else ignored.push(k);
  }
  if (id && !valid) ignored.push('scenario');
  return { config, selected: !!valid, ignored };
}

/** Link to the preset plus all settings that differ from it. */
function linkFor(config) {
  const base = presetConfig(config.scenario);
  const params = new URLSearchParams({ scenario: config.scenario });
  for (const k of Object.keys(base)) if (k !== 'scenario' && config[k] !== base[k]) params.set(k, config[k]);
  return `${location.origin}${location.pathname}?${params}`;
}

function simulationOptions(config) {
  const preset = PRESETS[config.scenario];
  const o = preset
    ? preset.scenario.simulationOptions()
    : {
        bounds: { xMin: -2.5, xMax: 3.5, yMin: -0.6, yMax: 1.4 },
        timeStart: 0,
        timeStepLimit: -1,
        fluidVolume: DISTRIBUTION_VOLUME[config.distribution],
      };
  if (preset && config.ground !== preset.ground) o.ground = GROUNDS[config.ground]();
  if (!preset) o.ground = GROUNDS[config.ground]();
  if (preset && config.distribution !== preset.distribution) o.fluidVolume = DISTRIBUTION_VOLUME[config.distribution];
  return Object.assign(o, {
    particleNumber: config.particles,
    particleDistribution: DISTRIBUTIONS[config.distribution],
    boundaryType: config.boundary,
    smoothingLength: config.h,
    integratorType: INTEGRATORS[config.integrator],
    timeSteppingMode: STEPPING[config['time-stepping']],
    fixedTimeStep: config.dt,
    timeStepLimit: config['dt-limit'] || -1,
    timeMax: config['max-time'] || -1,
  });
}

function visuH(config) {
  const p = PRESETS[config.scenario];
  return p ? p.scenario.rendererOptions().smoothingLength : config.h;
}

// ---------------------------------------------------------------------------------------------------------------
// Renderer: canvas 2D. View = domain + MARGIN on each side, domain mapped into a pixel rect, ground fills to bottom.

const MARGIN = 0.1;

function themeColors() {
  const s = getComputedStyle(document.documentElement);
  const c = (name, fallback) => s.getPropertyValue(name).trim() || fallback;
  return {
    sky: c('--sim-sky', '#0e1516'),
    skyTop: c('--sim-sky-top', '#16272a'),
    water: c('--sim-water', '#36b3c6'),
    waterDeep: c('--sim-water-deep', '#0c4f5b'),
    ground: c('--sim-ground', '#1d2426'),
    groundEdge: c('--sim-ground-edge', '#5d6d70'),
    wall: c('--sim-wall', '#4a5355'),
    line: c('--sim-line', '#9fb5b8'),
    right: c('--sim-right', '#ffb870'),
    left: c('--sim-left', '#8fe3a0'),
    still: c('--sim-still', '#e6f6f8'),
  };
}

/**
 * Draws the simulation. rect = { top, height } of the domain (yMin..yMax) in CSS px; full canvas width is used
 * for xMin - margin .. xMax + margin. Below the domain the ground continues to the canvas bottom.
 */
function render(canvas, sim, config, rect, opts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = canvas.width / canvas.clientWidth || 1;
  const W = canvas.clientWidth,
    H = canvas.clientHeight;
  const col = opts.colors || themeColors();
  const env = sim.env,
    b = env.bounds,
    t = env.state.time,
    L = b.xMax - b.xMin;
  const m = MARGIN * L,
    vx0 = b.xMin - m,
    vx1 = b.xMax + m;
  const h = opts.h || config.h;
  const cyclic = env.boundary.constructor.name.includes('Cyclic') || config.boundary === 'cyclic';
  const px = (x) => ((x - vx0) / (vx1 - vx0)) * W;
  const py = (y) => rect.top + ((b.yMax - y) / (b.yMax - b.yMin)) * rect.height;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, rect.top + rect.height);
  sky.addColorStop(0, col.skyTop);
  sky.addColorStop(1, col.sky);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // particle positions incl. images beyond the boundaries (mirrored for solid, shifted for cyclic)
  const reach = m + 2 * h;
  const pos = [],
    img = [];
  for (const p of env.state.particles) {
    pos.push(p.posX);
    if (p.posX - b.xMin < reach) img.push(cyclic ? p.posX + L : 2 * b.xMin - p.posX);
    if (b.xMax - p.posX < reach) img.push(cyclic ? p.posX - L : 2 * b.xMax - p.posX);
  }
  const all = pos.concat(img);
  const vol = env.particleVolume;
  const fluid = (x) => {
    let s = 0;
    for (let i = 0; i < all.length; i++) s += SPH.cubic1D(x - all[i], h);
    return s * vol;
  };
  // ground beyond the boundary: mirrored (solid) or continued from the other side (cyclic, discontinuity as is)
  const inside = (x) =>
    x < b.xMin ? (cyclic ? x + L : 2 * b.xMin - x) : x > b.xMax ? (cyclic ? x - L : 2 * b.xMax - x) : x;
  const ground = (x) => env.groundHeight(inside(x), t);

  const N = opts.samples || Math.min(900, Math.round(W));
  const xs = [],
    gs = [],
    ys = [];
  for (let i = 0; i <= N; i++) {
    const x = vx0 + ((vx1 - vx0) * i) / N;
    xs.push(x);
    gs.push(ground(x));
    ys.push(ground(x) + fluid(x));
  }
  const water = ctx.createLinearGradient(0, rect.top, 0, rect.top + rect.height);
  water.addColorStop(0, col.water);
  water.addColorStop(1, col.waterDeep);

  const band = (i0, i1, top, bottom) => {
    ctx.beginPath();
    for (let i = i0; i <= i1; i++) ctx.lineTo(px(xs[i]), py(top[i]));
    for (let i = i1; i >= i0; i--) ctx.lineTo(px(xs[i]), bottom ? py(bottom[i]) : H);
    ctx.closePath();
    ctx.fill();
  };
  const iMin = Math.ceil(((b.xMin - vx0) / (vx1 - vx0)) * N),
    iMax = Math.floor(((b.xMax - vx0) / (vx1 - vx0)) * N);

  // domain: water and ground
  ctx.fillStyle = water;
  band(iMin, iMax, ys, gs);
  ctx.fillStyle = col.ground;
  band(iMin, iMax, gs);
  ctx.strokeStyle = col.groundEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = iMin; i <= iMax; i++) ctx.lineTo(px(xs[i]), py(gs[i]));
  ctx.stroke();

  // margins
  for (const [i0, i1, xb] of [
    [0, iMin, b.xMin],
    [iMax, N, b.xMax],
  ]) {
    if (cyclic) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = col.ground;
      band(i0, i1, gs);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = water;
      band(i0, i1, ys, gs);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col.line;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(xb), rect.top);
      ctx.lineTo(px(xb), H);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = col.wall;
      ctx.fillRect(px(xs[i0]), rect.top, px(xs[i1]) - px(xs[i0]), H - rect.top);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = water;
      band(i0, i1, ys, gs);
      ctx.globalAlpha = 1;
    }
  }

  // particles on the surface, colored by speed
  if (opts.particles !== false) {
    const ps = env.state.particles;
    let max = 1e-9;
    for (const p of ps) max = Math.max(max, Math.abs(p.speedX));
    const r = opts.particleSize || 1.6;
    const dot = (x, y, v, alpha) => {
      const c = Math.sqrt(Math.abs(v) / max);
      ctx.globalAlpha = alpha * (0.35 + 0.65 * c);
      ctx.fillStyle = c < 0.05 ? col.still : v > 0 ? col.right : col.left;
      ctx.fillRect(px(x) - r / 2, py(y) - r / 2, r, r);
    };
    for (const p of ps) dot(p.posX, env.groundHeight(p.posX, t) + fluid(p.posX), p.speedX, 1);
    for (const p of ps) {
      const xs2 = [];
      if (p.posX - b.xMin < m) xs2.push(cyclic ? p.posX + L : 2 * b.xMin - p.posX);
      if (b.xMax - p.posX < m) xs2.push(cyclic ? p.posX - L : 2 * b.xMax - p.posX);
      for (const x of xs2) dot(x, ground(x) + fluid(x), cyclic ? p.speedX : -p.speedX, 0.35);
    }
    ctx.globalAlpha = 1;
  }
}

/** Domain rect for a canvas: natural aspect, stretched to at least minFrac of the height (portrait). */
function domainRect(canvas, config, { top = 0, minFrac = 0.35, maxFrac = 0.6, bottomSpace = 0 } = {}) {
  const o = simulationOptions(config).bounds;
  const W = canvas.clientWidth,
    H = canvas.clientHeight;
  const natural = (W / ((o.xMax - o.xMin) * (1 + 2 * MARGIN))) * (o.yMax - o.yMin);
  const avail = H - top - bottomSpace;
  const height = Math.max(Math.min(natural, maxFrac * H, avail), Math.min(minFrac * H, avail));
  return { top, height };
}

function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(canvas.clientWidth * dpr),
    h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Controller: one simulation step per frame (as in the thesis UI).

class SimController {
  constructor(canvas, layout) {
    this.canvas = canvas;
    this.layout = layout; // (canvas, config) => rect
    this.listeners = [];
    this.running = false;
    this.fps = 0;
    this.load(configFromUrl().config);
    new ResizeObserver(() => this.draw()).observe(canvas);
    const frame = (now) => {
      if (this.running) {
        if (this.sim.nextTimeStep() <= 0) {
          this.running = false;
          this.emit('max-time');
        } else this.sim.update();
        this.fps = this.last ? 0.9 * this.fps + 0.1 * (1000 / (now - this.last)) : 0;
        this.last = now;
        this.draw();
        this.emit('tick');
      } else this.last = 0;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  on(fn) {
    this.listeners.push(fn);
  }
  emit(type) {
    for (const fn of this.listeners) fn(type, this);
  }
  /** New simulation from a config (start configuration + runtime settings). */
  load(config) {
    this.config = { ...config };
    this.sim = new SPH.Simulation(simulationOptions(this.config));
    this.running = false;
    this.draw();
    this.emit('load');
  }
  /** Reset keeps the runtime settings. */
  reset() {
    this.load(this.config);
  }
  toggle() {
    if (!this.running && this.sim.nextTimeStep() <= 0) return this.emit('max-time');
    this.running = !this.running;
    this.emit('tick');
  }
  set(k, v) {
    this.config[k] = v;
    const s = this.sim;
    if (k === 'integrator') s.setIntegratorType(INTEGRATORS[v]);
    if (k === 'time-stepping') s.timeSteppingMode = STEPPING[v];
    if (k === 'dt') s.fixedTimeStep = v;
    if (k === 'dt-limit') s.timeStepLimit = v || -1;
    if (k === 'max-time') s.maxTime = v || -1;
    if (k === 'h') s.env.setSmoothingLength(v);
    if (k === 'boundary') s.env.setBoundaryType(v);
    this.draw();
    this.emit('change');
  }
  draw() {
    fitCanvas(this.canvas);
    const rect = this.layout(this.canvas, this.config);
    // one smoothing length for simulation and visualization
    render(this.canvas, this.sim, this.config, rect, { h: this.config.h });
  }
  get link() {
    return linkFor(this.config);
  }
}

/** Static t=0 thumbnail of a preset (placeholder until real screenshots exist). */
function drawThumbnail(canvas, id) {
  fitCanvas(canvas);
  const config = presetConfig(id);
  const sim = new SPH.Simulation(simulationOptions(config));
  render(
    canvas,
    sim,
    config,
    { top: canvas.clientHeight * 0.08, height: canvas.clientHeight * 0.72 },
    { samples: 160, particles: false },
  );
}
