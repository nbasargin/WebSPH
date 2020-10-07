import { GLCanvas } from '../rendering/glUtil/GLCanvas';
import { Renderer } from '../rendering/Renderer';
import { RendererOptions } from '../rendering/RendererOptions';
import { RenderLoop2 } from '../rendering/RenderLoop2';
import { Simulation } from '../simulation/Simulation';
import { SimulationOptions } from '../simulation/SimulationOptions';
import { BoundaryType, IntegratorType, TimeSteppingMode } from '../util/Enums';
import { SettingsComponent } from './settings/settings.component';

export class Controller {

    private settingsUI: SettingsComponent;
    private glCanvas: GLCanvas;

    private simulation: Simulation;
    private renderer: Renderer;

    private renderLoop: RenderLoop2;

    public constructor(settingsComponent: SettingsComponent, simOpts: SimulationOptions, rendOpts: RendererOptions) {

        // settings UI
        if (!settingsComponent) console.log('[!!] Controller constructor: settingsComponent is not set!');
        this.settingsUI = settingsComponent;

        // GL canvas
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('websph-gl-canvas');
        this.glCanvas = new GLCanvas(canvas);

        // init simulation and renderer
        this.resetSimulationAndRenderer(simOpts, rendOpts);

        this.renderLoop = new RenderLoop2((lastFrameDuration, avgFPS) => {
            this.settingsUI.setFPS(avgFPS);
            this.oneStep();
        });

        this.renderer.render();
        this.updateUITiming();
    }


    // Simulation control

    public startRenderLoop() {

        if (this.simulation.getNextTimeStep() <= 0) {
            this.settingsUI.showMessage('Maximal simulation time reached!');
            this.settingsUI.stopSimulation();
        } else {
            this.renderLoop.start();
        }

    }

    public stopRenderLoop() {
        this.renderLoop.stop();
    };

    private oneStep() {
        this.simulation.update();
        this.renderer.render();
        // this costs ~ 6 fps with 500 particles and standard heun (38 -> 32 fps)
        // angular change detection is very slow in this context
        // direct DOM access much faster
        this.updateUITiming();

        // stop without message when a few steps were already done
        if (this.simulation.getNextTimeStep() <= 0) {
            this.settingsUI.stopSimulation();
        }
    }

    public doSteps(numSteps: number) {
        for (let i = 0; i < numSteps; i++) {
            if (this.simulation.getNextTimeStep() <= 0) {
                this.settingsUI.stopSimulation();
                if (i == 0) {
                    // show message only if no steps were done
                    this.settingsUI.showMessage('Maximal simulation time reached!');
                }

                break;
            }

            this.oneStep(); // TODO replace with update -> no need to re-render stuff
        }
    }

    public resetSimulationAndRenderer(simOptions: SimulationOptions, rendOptions: RendererOptions) {
        this.simulation = new Simulation(simOptions); // TODO change to simulation.reset
        this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment(), rendOptions);
        this.renderer.render();
        this.updateUITiming();
    }

    // Timing

    public updateSimulationTiming(options: SimulationOptions) {
        this.simulation.setFixedTimeStep(options.fixedTimeStep);
        this.simulation.setTimeStepLimit(options.timeStepLimit);
        this.simulation.setTimeSteppingMode(options.timeSteppingMode);
        this.simulation.setMaxTime(options.timeMax);
        this.updateUITiming();
    }

    private updateUITiming() {
        this.settingsUI.setDtDynFast(this.simulation.getTimeStepForMode(TimeSteppingMode.FAST));
        this.settingsUI.setDtDynStable(this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE));
        this.settingsUI.setDtNext(this.simulation.getNextTimeStep());
        this.settingsUI.setTotalTime(this.simulation.getTotalTime());
    }

    // simulation options

    public setSimulationSmoothingLength(h: number) {
        this.simulation.setSmoothingLength(h);
        this.renderer.render();
        this.updateUITiming();
    }

    public setIntegrator(i: IntegratorType) {
        this.simulation.setIntegratorType(i);
        this.renderer.render();
    }

    public setBoundary(b: BoundaryType) {
        this.simulation.setBoundaryType(b);
        this.renderer.render();
    }

    // renderer options

    public setRendererSmoothingLength(vh: number) {
        this.renderer.setVisualizationSmoothingLength(vh);
        this.renderer.render();
    }

    public setParticleSize(ps: number) {
        this.renderer.setPointSize(ps);
        this.renderer.render();
    }


}
