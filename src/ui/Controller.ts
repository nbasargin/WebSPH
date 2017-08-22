import {SettingsComponent} from "./settings/settings.component";
import {Simulation, ParticleDistributionPreset} from "../simulation/Simulation";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";

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
		let numParticles = 500;
		this.simulation = new Simulation(numParticles, ParticleDistributionPreset.UNIFORM, bounds);
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment());

		this.renderer.render();

		//this.oneStep();
	}

	public oneStep() {
		console.log("one step start, using dt: " + this.settingsUI.getFinalDt());
		this.settingsUI.setDtDynFast(++this.calculatedDtDynFast);
		this.settingsUI.setDtDynStable(++this.calculatedDtDynStable);
		console.log("one step done, new dt set");
	}

	public resetParticles(numParticles : number) {

	}


}
