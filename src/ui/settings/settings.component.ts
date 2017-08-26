import {Component, Input, ViewChild} from "@angular/core";
import {Controller} from "../Controller";
import {ScenarioComponent} from "./scenario.component";
import {SimControlComponent} from "./sim-control.component";
import {SimOptionsComponent} from "./sim-options.component";
import {TimeSteppingComponent} from "./time-stepping.component";
import {RenderingComponent} from "./rendering.component";
import {MiscComponent} from "./misc.component";

@Component({
	selector: 'websph-settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {

	// logging
	private logInfo = true;


	@Input() private controller : Controller;

	@ViewChild('scenario') private scenario : ScenarioComponent;
	@ViewChild('simControl') private simControl : SimControlComponent;
	@ViewChild('simOptions') private simOptions : SimOptionsComponent;
	@ViewChild('timeStepping') private timeStepping : TimeSteppingComponent;
	@ViewChild('rendering') private rendering : RenderingComponent;
	@ViewChild('misc') private misc : MiscComponent;


	// direct property access

	public setDtDynStable(dtDynStable : number) {
		this.timeStepping.dtDynStable = dtDynStable;
	}
	public setDtDynFast(dtDynFast : number) {
		this.timeStepping.dtDynFast = dtDynFast;
	}
	public setDtNext(dtNext : number) {
		this.timeStepping.dtNext = dtNext;
	}

	public setTotalTime(totalTime : number) {
		this.simControl.totalTime = totalTime;
	}

	public setFPS(fps : number) {
		this.rendering.fps = fps;
	}


	// event listeners

	// time stepping
	public onDtFixedChanged(newDtFixed : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] new fixed dt: " + newDtFixed);
	}

	public onDtLimitChanged(newDtLimit : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] new dt limit: " + newDtLimit);
	}

	public onDtModeChanged(newDtMode : any) {
		if (this.logInfo) console.log("[SettingsComponent Info] new dt mode: " + newDtMode);
	}



	// simulation control
	public onDoSteps(numSteps : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] do " + numSteps + " steps");
		this.controller.oneStep();
	}
	public onReset(numParticles : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] reset to " + numParticles + " particles");
		this.controller.resetParticles(numParticles);

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
		this.rendering.visuSmoothingLength = h;
	}
	public onBoundaryChanged(boundary : string) {
		if (this.logInfo) console.log("[SettingsComponent Info] boundary changed to " + boundary);
	}


	// rendering
	public onVisuSmoothingLengthChanged(vh : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] visualization smoothing length changed to: " + vh);
	}
	public onParticleSizeChanged(pSize : number) {
		if (this.logInfo) console.log("[SettingsComponent Info] visualization particle size changed to: " + pSize);
	}
}
