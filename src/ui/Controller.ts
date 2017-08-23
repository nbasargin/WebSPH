import {SettingsComponent} from "./settings/settings.component";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";
import {Defaults} from "../util/Defaults";
import {Simulation} from "../simulation/Simulation";

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
		let bounds = {
			xMin : -3,
			xMax : 2,
			yMin : -0.5,
			yMax : 1.5
		};
		this.simulation = new Simulation(Defaults.SIM_PARTICLE_NUMBER, Defaults.SIM_PARTICLE_DISTRIBUTION, bounds);
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment());

		// ground profile
		// particle distribution
		this.renderer.setPointSize(Defaults.REND_PARTICLE_SIZE);
		this.renderer.setVisualizationSmoothingLength(Defaults.REND_SMOOTHING_LENGTH);

		this.renderer.render();

		//this.oneStep();
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
