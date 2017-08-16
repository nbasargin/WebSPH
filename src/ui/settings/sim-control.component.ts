import {Component, Output, EventEmitter} from "@angular/core";

@Component({
	selector: 'websph-settings-sim-control',
	templateUrl: 'sim-control.component.html'
})
export class SimControlComponent {

	// time limit
	private _maxTimeEnabled : boolean = false;
	set maxTimeEnabled(enabled : boolean) {
		this._maxTimeEnabled = enabled;
		this.maxTimeText = enabled ? "Run until:" : "Set maximal time";
	}
	get maxTimeEnabled() {
		return this._maxTimeEnabled;
	}
	public maxTimeText : String = "Set maximal time";



	// do steps
	@Output() doStepsNotify : EventEmitter<number> = new EventEmitter<number>();
	public onDoStepsClick() {
		this.doStepsNotify.emit(this.numSteps);
	}
	public stepValues : Array<number> = [
		1, 2, 5, 10, 20, 50, 100
	];
	public numSteps = 1;


	// reset particles
	@Output() resetNotify : EventEmitter<number> = new EventEmitter<number>();
	public onResetClick() {
		this.resetNotify.emit(this.numParticles);
	}
	public particleValues : Array<number> = [
		1, 10, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000
	];
	public numParticles = 500;


}
