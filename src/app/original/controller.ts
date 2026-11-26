import { Injectable, OnDestroy, signal } from '@angular/core';
import { Renderer } from '../../sph/original/rendering/renderer';
import { RendererOptions } from '../../sph/original/rendering/renderer-options';
import { RenderLoop } from '../../sph/original/rendering/render-loop';
import { Scenario, scenarios } from '../../sph/original/scenarios/scenarios';
import { Simulation } from '../../sph/original/simulation/simulation';
import {
  BoundaryType,
  IntegratorType,
  SimulationOptions,
  TimeSteppingMode,
} from '../../sph/original/simulation/simulation-options';

/**
 * State of the original (thesis) UI and its connection to simulation, renderer and render loop.
 * UI state is exposed as signals; user actions are methods that update both the state and the simulation.
 */
@Injectable()
export class SimController implements OnDestroy {
  // scenario
  readonly selectedScenario = signal<Scenario>(scenarios[0]);

  // simulation control
  readonly running = signal(false);
  readonly totalTime = signal(0);
  readonly maxTimeEnabled = signal(false);
  readonly maxTimeInput = signal('');
  readonly parsedMaxTime = signal(-1);
  readonly numSteps = signal(1);
  readonly numParticles = signal(500);

  // simulation options
  readonly integrator = signal<IntegratorType>('heunFast');
  readonly smoothingLength = signal(0);
  readonly boundary = signal<BoundaryType>('solid');

  // time stepping
  readonly dtMode = signal<TimeSteppingMode>('dynStable');
  readonly dtFixed = signal(0);
  readonly dtLimitEnabled = signal(false);
  readonly dtLimit = signal(0.005);
  readonly dtNext = signal(0);
  readonly dtDynStable = signal(0);
  readonly dtDynFast = signal(0);

  // rendering
  readonly fps = signal(0);
  readonly visuSmoothingLength = signal(0);
  readonly particleSize = signal(2);

  /** options used on reset, modified by the UI */
  private simOptions!: SimulationOptions;
  private rendOptions!: RendererOptions;

  private canvas!: HTMLCanvasElement;
  private sim!: Simulation;
  private renderer!: Renderer;
  private readonly loop = new RenderLoop((fps) => {
    this.fps.set(fps);
    this.oneStep();
  });

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.applyScenario(this.selectedScenario());
  }

  ngOnDestroy() {
    this.loop.stop();
  }

  // scenario

  applyScenario(scenario: Scenario) {
    this.stop();
    this.simOptions = scenario.simulationOptions();
    this.rendOptions = scenario.rendererOptions();
    this.setStateFromOptions(this.simOptions, this.rendOptions);
    this.resetSimulation();
  }

  private setStateFromOptions(sim: SimulationOptions, rend: RendererOptions) {
    this.parsedMaxTime.set(sim.timeMax);
    if (sim.timeMax > 0) this.maxTimeInput.set('' + sim.timeMax);
    this.maxTimeEnabled.set(sim.timeMax > 0);
    this.totalTime.set(sim.timeStart);
    this.numParticles.set(sim.particleNumber);

    this.boundary.set(sim.boundaryType);
    this.integrator.set(sim.integratorType);
    this.smoothingLength.set(sim.smoothingLength);

    this.dtFixed.set(sim.fixedTimeStep);
    this.dtMode.set(sim.timeSteppingMode);
    if (sim.timeStepLimit > 0) this.dtLimit.set(sim.timeStepLimit);
    this.dtLimitEnabled.set(sim.timeStepLimit > 0);

    this.particleSize.set(rend.particleSize);
    this.visuSmoothingLength.set(rend.smoothingLength);
  }

  private resetSimulation() {
    this.sim = new Simulation(this.simOptions);
    this.renderer = new Renderer(this.canvas, this.sim.env, this.rendOptions);
    this.renderer.render();
    this.updateTiming();
  }

  // simulation control

  toggleRunning() {
    if (this.running()) {
      this.stop();
    } else if (this.sim.nextTimeStep() <= 0) {
      alert('Maximal simulation time reached!');
    } else {
      this.running.set(true);
      this.loop.start();
    }
  }

  doSteps() {
    const numSteps = this.numSteps();
    for (let i = 0; i < numSteps; i++) {
      if (this.sim.nextTimeStep() <= 0) {
        this.stop();
        // show message only if no steps were done
        if (i == 0) alert('Maximal simulation time reached!');
        break;
      }
      this.oneStep();
    }
  }

  reset() {
    this.simOptions.particleNumber = this.numParticles();
    this.resetSimulation();
  }

  setMaxTimeEnabled(enabled: boolean) {
    this.maxTimeEnabled.set(enabled);
    if (enabled) this.parsedMaxTime.set(parseMaxTime(this.maxTimeInput()));
    this.setMaxTime(enabled && this.parsedMaxTime() > 0 ? this.parsedMaxTime() : -1);
  }

  setMaxTimeInput(input: string) {
    this.maxTimeInput.set(input);
    this.parsedMaxTime.set(parseMaxTime(input));
    if (this.maxTimeEnabled()) this.setMaxTime(this.parsedMaxTime());
  }

  private setMaxTime(maxTime: number) {
    this.simOptions.timeMax = maxTime;
    this.sim.maxTime = maxTime;
    this.updateTiming();
  }

  private stop() {
    this.running.set(false);
    this.loop.stop();
  }

  private oneStep() {
    this.sim.update();
    this.renderer.render();
    this.updateTiming();
    // stop without message when a few steps were already done
    if (this.sim.nextTimeStep() <= 0) this.stop();
  }

  private updateTiming() {
    this.dtDynFast.set(this.sim.timeStepForMode('dynFast'));
    this.dtDynStable.set(this.sim.timeStepForMode('dynStable'));
    this.dtNext.set(this.sim.nextTimeStep());
    this.totalTime.set(this.sim.totalTime);
  }

  // simulation options

  setIntegrator(integrator: IntegratorType) {
    this.integrator.set(integrator);
    this.simOptions.integratorType = integrator;
    this.sim.setIntegratorType(integrator);
    this.renderer.render();
  }

  /** Also sets the visualization smoothing length. */
  setSmoothingLength(h: number) {
    this.setVisuSmoothingLength(h);
    this.smoothingLength.set(h);
    this.simOptions.smoothingLength = h;
    this.sim.env.setSmoothingLength(h);
    this.renderer.render();
    this.updateTiming();
  }

  setBoundary(boundary: BoundaryType) {
    this.boundary.set(boundary);
    this.simOptions.boundaryType = boundary;
    this.sim.env.setBoundaryType(boundary);
    this.renderer.render();
  }

  // time stepping

  setDtMode(mode: TimeSteppingMode) {
    this.dtMode.set(mode);
    this.simOptions.timeSteppingMode = mode;
    this.sim.timeSteppingMode = mode;
    this.updateTiming();
  }

  setDtFixed(dt: number) {
    this.dtFixed.set(dt);
    this.simOptions.fixedTimeStep = dt;
    this.sim.fixedTimeStep = dt;
    this.updateTiming();
  }

  setDtLimitEnabled(enabled: boolean) {
    this.dtLimitEnabled.set(enabled);
    this.setTimeStepLimit(enabled ? this.dtLimit() : -1);
  }

  setDtLimit(limit: number) {
    this.dtLimit.set(limit);
    this.setTimeStepLimit(this.dtLimitEnabled() ? limit : -1);
  }

  private setTimeStepLimit(limit: number) {
    this.simOptions.timeStepLimit = limit;
    this.sim.timeStepLimit = limit;
    this.updateTiming();
  }

  // rendering

  setVisuSmoothingLength(h: number) {
    this.visuSmoothingLength.set(h);
    this.rendOptions.smoothingLength = h;
    this.renderer.visualizationSmoothingLength = h;
    this.renderer.render();
  }

  setParticleSize(size: number) {
    this.particleSize.set(size);
    this.rendOptions.particleSize = size;
    this.renderer.setPointSize(size);
    this.renderer.render();
  }
}

/** Positive number or -1 if the input is invalid. */
function parseMaxTime(input: string): number {
  const parsed = parseFloat(input);
  return isNaN(parsed) || parsed <= 0 ? -1 : parsed;
}
