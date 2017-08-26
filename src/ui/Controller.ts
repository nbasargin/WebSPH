import {SettingsComponent} from "./settings/settings.component";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";
import {Simulation} from "../simulation/Simulation";
import {RenderLoop2} from "../rendering/RenderLoop2";
import {TimeSteppingMode, IntegratorType, BoundaryType} from "../util/Enums";
import {SimulationOptions} from "../simulation/SimulationOptions";
import {RendererOptions} from "../rendering/RendererOptions";

export class Controller {

	private settingsUI : SettingsComponent;
	private glCanvas : GLCanvas;

	private simulation : Simulation;
	private renderer : Renderer;

	private renderLoop : RenderLoop2;

	public constructor(settingsComponent : SettingsComponent) {

		// settings UI
		if (!settingsComponent)	console.log("[!!] Controller constructor: settingsComponent is not set!");
		this.settingsUI = settingsComponent;

		// GL canvas
		let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("websph-gl-canvas");
		this.glCanvas = new GLCanvas(canvas);

		// init simulation and renderer
		let simOptions = new SimulationOptions();
		let rendOptions = new RendererOptions();
		this.resetSimulationAndRenderer(simOptions, rendOptions);

		this.renderLoop = new RenderLoop2((lastFrameDuration, avgFPS) => {
			this.settingsUI.setFPS(avgFPS);
			this.oneStep();
		});

		this.renderer.render();
		this.updateUITiming();
	}


	// Simulation control

	public startRenderLoop() {
		this.renderLoop.start();
	}

	public stopRenderLoop() {
		this.renderLoop.stop();
	};

	public oneStep() {
		this.simulation.update();
		this.renderer.render();
		this.updateUITiming();
	}

	public resetSimulationAndRenderer(simOptions : SimulationOptions, rendOptions : RendererOptions) {
		this.simulation = new Simulation(simOptions);
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment(), rendOptions);
		this.renderer.render();
		this.updateUITiming();
	}

	// Timing

	public updateSimulationTiming(options : SimulationOptions) {
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

	public setSimulationSmoothingLength(h : number) {
		this.simulation.setSmoothingLength(h);
		this.renderer.render();
	}

	public setIntegrator(i : IntegratorType) {
		this.simulation.setIntegratorType(i);
		this.renderer.render();
	}

	public setBoundary(b : BoundaryType) {
		this.simulation.setBoundaryType(b);
		this.renderer.render();
	}

	// renderer options

	public setRendererSmoothingLength(vh : number) {
		this.renderer.setVisualizationSmoothingLength(vh);
		this.renderer.render();
	}

	public setParticleSize(ps : number) {
		this.renderer.setPointSize(ps);
		this.renderer.render();
	}


}
