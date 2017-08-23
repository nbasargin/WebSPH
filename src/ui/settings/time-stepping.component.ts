import {Component, Output, EventEmitter} from "@angular/core";
import {TimeSteppingMode} from "../../util/Enums";

@Component({
	selector: 'websph-settings-time-stepping',
	templateUrl: 'time-stepping.component.html'
})
export class TimeSteppingComponent {

	public constructor() {
		this.updateFinalDt();
	}

	public getFinalDt() : number {
		let dt : number;
		switch (this._dtMode) {
			case TimeSteppingMode.FIXED:
				dt = this._dtFixed; break;

			case TimeSteppingMode.STABLE:
				dt = this._dtDynStable; break;

			case TimeSteppingMode.FAST:
				dt = this._dtDynFast; break;

			default:
				console.log("TimeSteppingMode invalid!");
				dt = 0;
		}

		return (this._dtLimitEnabled) ? Math.min(dt, this._dtLimit) : dt;
	}


	private _dtFixed : number = 0.001;
	set dtFixed(dtFixed) {
		this._dtFixed = dtFixed;
		this.updateFinalDt();
	}
	get dtFixed() {
		return this._dtFixed;
	}

	private _dtDynStable : number = 0;
	set dtDynStable(dtDynStable : number) {
		this._dtDynStable = dtDynStable;
		this.updateFinalDt();
	}
	get dtDynStable(): number {
		return this._dtDynStable;
	}


	private _dtDynFast : number = 0;
	set dtDynFast(dtDynFast : number) {
		this._dtDynFast = dtDynFast;
		this.updateFinalDt();
	}
	get dtDynFast() : number {
		return this._dtDynFast;
	}


	private _dtMode = 'fixed';
	get dtMode() {
		return this._dtMode;
	}
	set dtMode(mode) {
		this._dtMode = mode;
		this.updateFinalDt();
	}


	private _dtLimit : number = 0.005;
	get dtLimit() {
		return this._dtLimit;
	}
	set dtLimit(limit) {
		this._dtLimit = limit;
		this.updateFinalDt();
	}

	public dtLimitText : string = "Set limit";
	private _dtLimitEnabled : boolean = false;
	get dtLimitEnabled() {
		return this._dtLimitEnabled;
	}
	set dtLimitEnabled(dtLimitEnabled) {
		this._dtLimitEnabled = dtLimitEnabled;
		this.updateFinalDt();
		this.dtLimitText = dtLimitEnabled ? "Limit to: " : "Set limit";
	}


	public dtTotal : number = 0;

	@Output() dtTotalNotify : EventEmitter<number> = new EventEmitter<number>();

	private updateFinalDt() {
		let newDt = this.getFinalDt();
		if (newDt != this.dtTotal) {
			this.dtTotal = newDt;
			this.dtTotalNotify.emit(this.dtTotal);
		}

	}






}

