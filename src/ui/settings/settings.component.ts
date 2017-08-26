import {Component, Input, ViewChild} from "@angular/core";
import {Controller} from "../Controller";
import {SimControlComponent} from "./sim-control.component";
import {TimeSteppingComponent} from "./time-stepping.component";
import {RenderingComponent} from "./rendering.component";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {RendererOptions} from "../../rendering/RendererOptions";
import {TimeSteppingMode} from "../../util/Enums";

@Component({
	selector: 'websph-settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {

	// logging
	private logInfo = true;
	private simOptions : SimulationOptions;
	private rendOptions : RendererOptions;


	@Input() private controller : Controller;

	// @ViewChild('scenario') private compScenario : ScenarioComponent;
	@ViewChild('simControl') private compSimControl : SimControlComponent;
	// @ViewChild('simOptions') private compSimOptions : SimOptionsComponent;
	@ViewChild('timeStepping') private compTimeStepping : TimeSteppingComponent;
	@ViewChild('rendering') private compRendering : RenderingComponent;
	// @ViewChild('misc') private compMisc : MiscComponent;


	public constructor() {
		this.simOptions = new SimulationOptions();
		this.rendOptions = new RendererOptions();
	}



	// direct property access

	public setDtDynStable(dtDynStable : number) {
		this.compTimeStepping.dtDynStable = dtDynStable;
	}
	public setDtDynFast(dtDynFast : number) {
		this.compTimeStepping.dtDynFast = dtDynFast;
	}
	public setDtNext(dtNext : number) {
		this.compTimeStepping.dtNext = dtNext;
	}

	public setTotalTime(totalTime : number) {
		this.compSimControl.totalTime = totalTime;
	}

	public setFPS(fps : number) {
		this.compRendering.fps = fps;
	}


	// event listeners

	// time stepping
	public onDtFixedChanged(newDtFixed : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] new fixed dt: " + newDtFixed);
		this.simOptions.fixedTimeStep = newDtFixed;
		this.controller.updateTiming(this.simOptions);
	}

	public onDtLimitChanged(newDtLimit : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] new dt limit: " + newDtLimit);
		this.simOptions.timeStepLimit = newDtLimit;
		this.controller.updateTiming(this.simOptions);
	}

	public onDtModeChanged(newDtMode : TimeSteppingMode) {
		if (this.logInfo) console.log("[SettingsComponent Info] new dt mode: " + newDtMode);
		this.simOptions.timeSteppingMode = newDtMode;
		this.controller.updateTiming(this.simOptions);
	}



	// simulation control
	public onDoSteps(numSteps : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] do " + numSteps + " steps");
		for (let i = 0; i < numSteps; i++) {
			this.controller.oneStep();
		}

	}
	public onReset(numParticles : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] resetSimulationAndRenderer to " + numParticles + " particles");
		this.simOptions.particleNumber = numParticles;
		this.controller.resetSimulationAndRenderer(this.simOptions, this.rendOptions);
	}

	public onStart() {
		if (this.logInfo) console.log("[SettingsComponent Info] start");
		this.controller.startRenderLoop();
	}
	public onStop() {
		if (this.logInfo) console.log("[SettingsComponent Info] stop");
		this.controller.stopRenderLoop();
	}


	// simulation options
	public onIntegratorChanged(integrator : string) {
		if (this.logInfo) console.log("[SettingsComponent Info] integrator changed to " + integrator);
	}
	public onSmoothingLengthChanged(h : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] smoothing length changed to " + h);
		this.compRendering.visuSmoothingLength = h;

		this.simOptions.smoothingLength = h;
		this.rendOptions.smoothingLength = h;
	}
	public onBoundaryChanged(boundary : string) {
		if (this.logInfo) console.log("[SettingsComponent Info] boundary changed to " + boundary);
	}


	// rendering
	public onVisuSmoothingLengthChanged(vh : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] visualization smoothing length changed to: " + vh);
		this.rendOptions.smoothingLength = vh;
	}
	public onParticleSizeChanged(pSize : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] visualization particle size changed to: " + pSize);
		this.rendOptions.particleSize = pSize;
	}
}
