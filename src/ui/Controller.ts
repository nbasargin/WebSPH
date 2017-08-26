import {SettingsComponent} from "./settings/settings.component";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";
import {Simulation} from "../simulation/Simulation";
import {SimulationOptions} from "../simulation/SimulationOptions";
import {RendererOptions} from "../rendering/RendererOptions";

export class Controller {

	private settingsUI : SettingsComponent;
	private glCanvas : GLCanvas;

	private simulation : Simulation;
	private renderer : Renderer;

	private calculatedDtDynStable : number = 0;
	private calculatedDtDynFast : number = 1;

	public constructor(settingsComponent : SettingsComponent) {

		// settings UI
		if (!settingsComponent)	console.log("[!!] Controller constructor: settingsComponent is not set!");
		this.settingsUI = settingsComponent;

		// GL canvas
		let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("websph-gl-canvas");
		this.glCanvas = new GLCanvas(canvas);

		// init simulation and renderer
		let simOptions = new SimulationOptions();
		this.simulation = new Simulation(simOptions);
		let rendOptions = new RendererOptions();
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment(), rendOptions);

		this.renderer.render();
	}

	public oneStep() {
		console.log("one step start, using dt: " + this.settingsUI.getFinalDt());
		this.settingsUI.setDtDynFast(++this.calculatedDtDynFast);
		this.settingsUI.setDtDynStable(++this.calculatedDtDynStable);

		this.simulation.update();
		this.renderer.render();

		console.log("one step done, new dt set");
	}

	public resetParticles(numParticles : number) {

	}


}
