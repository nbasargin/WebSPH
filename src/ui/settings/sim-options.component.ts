import {Component, Output, EventEmitter} from "@angular/core";
import {Defaults} from "../../util/Defaults";
import {IntegratorType, EnumChecker, BoundaryType} from "../../util/Enums";

@Component({
	selector: 'websph-settings-sim-settings',
	templateUrl: 'sim-options.component.html'
})
export class SimOptionsComponent {


	@Output() integratorNotify : EventEmitter<string> = new EventEmitter<string>();
	private _integrator : string = Defaults.SIM_INTEGRATOR + "";
	set integrator(i : string) {

		if (!EnumChecker.isValidValue(IntegratorType, i)) {
			console.log("[!!] invalid enum type: " + i);
		}

		this._integrator = i;
		this.integratorNotify.emit(this._integrator);
	}
	get integrator() {
		return this._integrator
	}


	@Output() smoothingLengthNotify : EventEmitter<number> = new EventEmitter<number>();
	private _smoothingLength : number = Defaults.SIM_SMOOTHING_LENGTH;
	set smoothingLength(h : number) {
		this._smoothingLength = h;
		this.smoothingLengthNotify.emit(this._smoothingLength);
	}
	get smoothingLength() {
		return this._smoothingLength;
	}


	@Output() boundaryNotify : EventEmitter<string> = new EventEmitter<string>();
	private _boundary : string = Defaults.SIM_BOUNDARY_TYPE + "";
	set boundary(b : string) {
		if (!EnumChecker.isValidValue(BoundaryType, b)) {
			console.log("[!!] invalid enum type: " + b);
		}

		this._boundary = b;
		this.boundaryNotify.emit(this._boundary);
	}
	get boundary() {
		return this._boundary;
	}


}
