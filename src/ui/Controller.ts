import {SettingsComponent} from "./settings/settings.component";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {Renderer} from "../rendering/Renderer";
import {Defaults} from "../util/Defaults";
import {Simulation} from "../simulation/Simulation";
import {RenderLoop2} from "../rendering/RenderLoop2";
import {TimeSteppingMode} from "../util/Enums";

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
		let bounds = {
			xMin : -3,
			xMax : 3,
			yMin : -0.45,
			yMax : 1.2
		};
		this.simulation = new Simulation(Defaults.SIM_PARTICLE_NUMBER, Defaults.SIM_PARTICLE_DISTRIBUTION, bounds);
		this.renderer = new Renderer(this.glCanvas, this.simulation.getEnvironment());

		this.renderLoop = new RenderLoop2((lastFrameDuration, avgFPS) => {
			//console.log("render loop here! fps: " + avgFPS.toFixed(3));
			this.settingsUI.setFPS(avgFPS);

			this.oneStep();

		});

		// TODO: ground profile
		// TODO: particle distribution

		//this.oneStep();
		this.renderer.render();

		// update timing in ui
		this.settingsUI.setDtDynFast(this.simulation.getTimeStepForMode(TimeSteppingMode.FAST));
		this.settingsUI.setDtDynStable(this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE));
		this.settingsUI.setDtNext(this.simulation.getNextTimeStep());

	}

	public oneStep() {
		this.simulation.update();
		this.renderer.render();

		// update timing in ui
		this.settingsUI.setDtDynFast(this.simulation.getTimeStepForMode(TimeSteppingMode.FAST));
		this.settingsUI.setDtDynStable(this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE));
		this.settingsUI.setDtNext(this.simulation.getNextTimeStep());

		this.settingsUI.setTotalTime(this.simulation.getTotalTime());

	}

	public startRenderLoop() {
		this.renderLoop.start();
	}

	public stopRenderLoop() {
		this.renderLoop.stop();
	};

	public resetParticles(numParticles : number) {

	}


}
