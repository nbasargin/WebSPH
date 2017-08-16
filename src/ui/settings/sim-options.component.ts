import {Component, Output, EventEmitter} from "@angular/core";

@Component({
	selector: 'websph-settings-sim-settings',
	templateUrl: 'sim-options.component.html'
})
export class SimOptionsComponent {


	@Output() integratorNotify : EventEmitter<string> = new EventEmitter<string>();
	private _integrator : string = "heunStd";
	set integrator(i : string) {
		this._integrator = i;
		this.integratorNotify.emit(this._integrator);
	}
	get integrator() {
		return this._integrator
	}


	@Output() smoothingLengthNotify : EventEmitter<number> = new EventEmitter<number>();
	private _smoothingLength : number = 0.015;
	set smoothingLength(h : number) {
		this._smoothingLength = h;
		this.smoothingLengthNotify.emit(this._smoothingLength);
	}
	get smoothingLength() {
		return this._smoothingLength;
	}


	@Output() boundaryNotify : EventEmitter<string> = new EventEmitter<string>();
	private _boundary : string = "solid";
	set boundary(b : string) {
		this._boundary = b;
		this.boundaryNotify.emit(this._boundary);
	}
	get boundary() {
		return this._boundary;
	}


}
