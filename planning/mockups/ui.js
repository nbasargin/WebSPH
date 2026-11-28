// Shared mockup widgets: scenario cards, settings panel, custom builder dialog, snackbar, play button binding.
'use strict';

const UI = {
  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  },

  snackbar(text) {
    let s = document.querySelector('.snackbar');
    if (!s) document.body.append((s = UI.el('<div class="snackbar"></div>')));
    s.textContent = text;
    s.classList.add('show');
    clearTimeout(UI.snackTimer);
    UI.snackTimer = setTimeout(() => s.classList.remove('show'), 3000);
  },

  /** Scenario cards incl. "Custom"; onPick(id). */
  cards(container, onPick, ctl) {
    container.classList.add('cards');
    for (const [id, p] of Object.entries(PRESETS)) {
      const card = UI.el(`<button class="card" data-id="${id}"><canvas></canvas>
        <div class="body"><div class="title">${p.title}</div><p>${p.text}</p></div></button>`);
      card.onclick = () => onPick(id);
      container.append(card);
      // draw when visible (the sheet may start hidden)
      const cv = card.querySelector('canvas');
      new ResizeObserver(() => cv.clientWidth && drawThumbnail(cv, id)).observe(cv);
    }
    const custom = UI.el(`<button class="card" data-id="custom"><div class="thumb"><span class="icon">tune</span></div>
      <div class="body"><div class="title">Custom</div><p>Choose particles, initial distribution, ground and boundary yourself.</p></div></button>`);
    custom.onclick = () => onPick('custom');
    container.append(custom);
    const mark = () =>
      container
        .querySelectorAll('.card')
        .forEach((c) => c.classList.toggle('selected', c.dataset.id === ctl.config.scenario));
    ctl.on((type) => type === 'load' && mark());
    mark();
  },

  seg(options, value, onChange) {
    const s = UI.el('<div class="seg"></div>');
    for (const [k, label] of Object.entries(options)) {
      const b = UI.el(`<button class="${k === value ? 'on' : ''}">${label}</button>`);
      b.onclick = () => {
        s.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        onChange(k);
      };
      s.append(b);
    }
    return s;
  },

  select(options, value, onChange) {
    const s = UI.el('<select></select>');
    for (const [k, label] of Object.entries(options)) s.append(new Option(label, k, false, k === value));
    s.onchange = () => onChange(s.value);
    return s;
  },

  /**
   * Settings form for a target { config, set(k, v), nextDt?() }: basic (h, boundary, stop at) + collapsed advanced
   * (time stepping, integrator). Used by the settings panel (target = controller) and the custom builder (plain config).
   */
  form(container, target, openKey) {
    const c = target.config;
    container.replaceChildren();
    container.classList.add('settings');
    const row = (parent, label, control) => {
      const r = UI.el(`<div class="row"><span class="label">${label}</span></div>`);
      r.append(control);
      parent.append(r);
      return r;
    };
    row(
      container,
      'Smoothing length',
      UI.slider(0.005, 0.1, 0.001, c.h, 3, '', (v) => target.set('h', v)),
    );
    row(
      container,
      'Boundary',
      UI.seg({ solid: 'Solid', cyclic: 'Cyclic' }, c.boundary, (v) => target.set('boundary', v)),
    );
    const maxRow = UI.el('<div class="switch-row"></div>');
    const cb = UI.el(`<input type="checkbox" ${c['max-time'] > 0 ? 'checked' : ''}>`);
    const num = UI.el(
      `<input type="number" step="0.5" min="0.5" style="width: 90px" value="${c['max-time'] || 5}" ${c['max-time'] > 0 ? '' : 'disabled'}>`,
    );
    const apply = () => target.set('max-time', cb.checked ? +num.value : 0);
    cb.onchange = () => ((num.disabled = !cb.checked), apply());
    num.onchange = apply;
    maxRow.append(cb, num, UI.el('<span class="label">s</span>'));
    row(container, 'Stop at', maxRow);

    const adv = UI.el(
      '<details><summary><span class="icon">chevron_right</span>Advanced</summary><div class="settings"></div></details>',
    );
    adv.open = !!UI.open[openKey];
    adv.ontoggle = () => (UI.open[openKey] = adv.open);
    const inner = adv.querySelector('.settings');
    // time stepping: mode + one slider (fixed value, or limit for the dynamic modes); same row structure for all
    // modes (checkbox only hidden for fixed), so switching does not move the layout
    const dtRow = UI.el('<div class="row"></div>');
    const renderDt = () => {
      dtRow.replaceChildren();
      const fixed = c['time-stepping'] === 'fixed';
      const limit = c['dt-limit'];
      const lab =
        UI.el(`<label class="switch-row label" style="min-width: 90px"><input type="checkbox" ${limit > 0 ? 'checked' : ''}
        style="visibility: ${fixed ? 'hidden' : 'visible'}">${fixed ? 'Value' : 'Limit to'}</label>`);
      const sl = UI.slider(0.0001, 0.01, 0.0001, fixed ? c.dt : limit || 0.005, 4, ' s', (v) =>
        target.set(fixed ? 'dt' : 'dt-limit', v),
      );
      const input = sl.querySelector('input');
      input.disabled = !fixed && !(limit > 0);
      lab.querySelector('input').onchange = (e) => {
        input.disabled = !e.target.checked;
        target.set('dt-limit', e.target.checked ? +input.value : 0);
      };
      dtRow.append(lab, sl);
    };
    row(
      inner,
      'Time step',
      UI.seg(STEPPING_LABELS, c['time-stepping'], (v) => (target.set('time-stepping', v), renderDt())),
    );
    renderDt();
    inner.append(dtRow);
    if (target.nextDt) {
      const next = UI.el('<span class="mono"></span>');
      row(inner, 'Next time step', next);
      container.refresh = () => (next.textContent = `${target.nextDt().toFixed(4)} s`);
      container.refresh();
    }
    row(
      inner,
      'Integrator',
      UI.select(INTEGRATOR_LABELS, c.integrator, (v) => target.set('integrator', v)),
    );
    container.append(adv);
  },
  open: {},

  /** Runtime settings panel bound to the controller, rebuilt on load. */
  settings(container, ctl) {
    const build = () =>
      UI.form(
        container,
        { config: ctl.config, set: (k, v) => ctl.set(k, v), nextDt: () => ctl.sim.nextTimeStep() },
        'panel',
      );
    ctl.on((type) => (type === 'load' ? build() : container.refresh && container.refresh()));
    build();
  },

  /** Range slider with numeric readout and unit. */
  slider(min, max, step, value, digits, unit, onInput) {
    const wrap = UI.el('<div class="switch-row" style="min-width: 220px; flex: 1; max-width: 320px"></div>');
    const out = UI.el(
      `<span class="mono" style="min-width: 64px; text-align: right">${(+value).toFixed(digits)}${unit}</span>`,
    );
    const input = UI.el(`<input type="range" min="${min}" max="${max}" step="${step}" value="${value}">`);
    input.oninput = () => ((out.textContent = (+input.value).toFixed(digits) + unit), onInput(+input.value));
    wrap.append(input, out);
    return wrap;
  },

  /** Dialog for the custom simulation: start configuration + the same settings form as the panel. */
  builder(ctl) {
    const d = UI.el(`<dialog><h2>Custom simulation</h2><div class="settings start"></div><div class="form"></div>
      <div class="actions"><button class="btn text" value="cancel">Cancel</button><button class="btn filled" value="start">Start</button></div></dialog>`);
    document.body.append(d);
    const start = d.querySelector('.start');
    let c;
    const row = (label, control) => {
      const r = UI.el(`<div class="row"><span class="label">${label}</span></div>`);
      r.append(control);
      start.append(r);
    };
    const open = () => {
      c = ctl.config.scenario === 'custom' ? { ...ctl.config } : presetConfig('custom');
      start.replaceChildren();
      row(
        'Particles',
        UI.slider(100, 2000, 50, c.particles, 0, '', (v) => (c.particles = v)),
      );
      row(
        'Initial water',
        UI.select(DISTRIBUTION_LABELS, c.distribution, (v) => (c.distribution = v)),
      );
      row(
        'Ground',
        UI.select(GROUND_LABELS, c.ground, (v) => (c.ground = v)),
      );
      UI.form(d.querySelector('.form'), { config: c, set: (k, v) => (c[k] = v) }, 'builder');
      d.showModal();
    };
    d.querySelector('[value=cancel]').onclick = () => d.close();
    d.querySelector('[value=start]').onclick = () => {
      d.close();
      ctl.load(c);
    };
    return open;
  },

  /** Play/pause button + time label + max-time snackbar. */
  bindPlay(btn, timeEl, ctl) {
    const update = () => {
      btn.querySelector('.icon').textContent = ctl.running ? 'pause' : 'play_arrow';
      if (timeEl) timeEl.textContent = `${ctl.sim.totalTime.toFixed(2)} s`;
    };
    btn.onclick = () => ctl.toggle();
    ctl.on((type) => {
      if (type === 'max-time') UI.snackbar('Stop time reached – reset or change "Stop at" to continue');
      update();
    });
    update();
  },

  copyLink(ctl) {
    navigator.clipboard?.writeText(ctl.link).catch(() => {});
    UI.snackbar('Link copied: ' + ctl.link.replace(location.origin, ''));
  },

  pick(ctl, id, openBuilder) {
    if (id === 'custom') return openBuilder();
    ctl.load(presetConfig(id));
  },

  ignoredNotice() {
    const { ignored } = configFromUrl();
    if (ignored.length) UI.snackbar(`Ignored URL parameters: ${ignored.join(', ')}`);
  },

  switcher(current) {
    const s = UI.el('<div class="mock-switcher">Mockup:</div>');
    for (const v of ['a', 'a2', 'b', 'c']) {
      const a = UI.el(`<a href="mockup-${v}.html${location.search}">${v.toUpperCase()}</a>`);
      if (v === current) a.style.fontWeight = '700';
      s.append(a);
    }
    document.body.append(s);
  },
};
