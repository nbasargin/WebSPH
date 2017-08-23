import {Component, Output, EventEmitter} from "@angular/core";
import {TimeSteppingMode, EnumChecker} from "../../util/Enums";
import {Defaults} from "../../util/Defaults";

@Component({
	selector: 'websph-settings-time-stepping',
	templateUrl: 'time-stepping.component.html'
})
export class TimeSteppingComponent {

	public constructor() {
	}




	@Output() dtFixedNotify : EventEmitter<number> = new EventEmitter<number>();
	private _dtFixed : number = Defaults.SIM_FIXED_TIME_STEP;
	get dtFixed() {
		return this._dtFixed;
	}
	set dtFixed(dtFixed) {
		this._dtFixed = dtFixed;
		this.dtFixedNotify.emit(dtFixed);

	}

	public dtDynStable : number = 0;
	public dtDynFast : number = 0;

	public dtTotal : number = 0;



	@Output() dtModeNotify : EventEmitter<string> = new EventEmitter<string>();
	private _dtMode = Defaults.SIM_TIME_STEPPING_MODE + "";
	get dtMode() {
		return this._dtMode;
	}
	set dtMode(mode) {
		if (!EnumChecker.isValidValue(TimeSteppingMode, mode)) {
			console.log("[!!] invalid enum type: " + mode);
		}
		this._dtMode = mode;
		this.dtModeNotify.emit(mode);
	}



	@Output() dtLimitNotify : EventEmitter<number> = new EventEmitter<number>();
	private _dtLimit : number = 0.005;
	get dtLimit() {
		return this._dtLimit;
	}
	set dtLimit(limit) {
		this._dtLimit = limit;
		if (this._dtLimitEnabled) this.dtLimitNotify.emit(limit);
	}

	public dtLimitText : string = "Set limit";
	private _dtLimitEnabled : boolean = false;
	get dtLimitEnabled() {
		return this._dtLimitEnabled;
	}
	set dtLimitEnabled(dtLimitEnabled) {
		this._dtLimitEnabled = dtLimitEnabled;
		if (dtLimitEnabled) {
			this.dtLimitText = "Limit to:";
			this.dtLimitNotify.emit(-1);

		} else {
			this.dtLimitText = "Set limit";
			this.dtLimitNotify.emit(this._dtLimit);
		}
	}







}

