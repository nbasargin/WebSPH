import {SettingsComponent} from "./settings/settings.component";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";
import {Simulation} from "../simulation/Simulation";
import {RenderLoop2} from "../rendering/RenderLoop2";
import {TimeSteppingMode} from "../util/Enums";
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
			//console.log("render loop here! fps: " + avgFPS.toFixed(3));
			this.settingsUI.setFPS(avgFPS);
			this.oneStep();
		});

		this.updateUI();
	}

	private updateUI() {

		// update UI for the first time
		this.renderer.render();
		this.settingsUI.setDtDynFast(this.simulation.getTimeStepForMode(TimeSteppingMode.FAST));
		this.settingsUI.setDtDynStable(this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE));
		this.settingsUI.setDtNext(this.simulation.getNextTimeStep());
		this.settingsUI.setTotalTime(this.simulation.getTotalTime());
	}

	public oneStep() {
		this.simulation.update();
		this.updateUI();
	}

	public startRenderLoop() {
		this.renderLoop.start();
	}

	public stopRenderLoop() {
		this.renderLoop.stop();
	};

	public resetSimulationAndRenderer(simOptions : SimulationOptions, rendOptions : RendererOptions) {
		this.simulation = new Simulation(simOptions);
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment(), rendOptions);
		this.updateUI();
	}


}
