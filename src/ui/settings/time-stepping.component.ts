import {Component, Output, EventEmitter} from "@angular/core";
import {TimeSteppingMode, EnumChecker, TimeSteppingModeString} from "../../util/Enums";
import {Defaults} from "../../util/Defaults";

@Component({
	selector: 'websph-settings-time-stepping',
	templateUrl: 'time-stepping.component.html'
})
export class TimeSteppingComponent {

	public dtDynStable : number = 0;
	public dtDynFast : number = 0;
	public dtNext : number = 0;

	public constructor() {

	}

	// FIXED TIME STEP
	@Output() dtFixedNotify : EventEmitter<number> = new EventEmitter<number>();
	private _dtFixed : number = Defaults.SIM_TIME_STEP_SIZE_FIXED;
	get dtFixed() {
		return this._dtFixed;
	}
	set dtFixed(dtFixed) {
		this._dtFixed = dtFixed;
		this.dtFixedNotify.emit(dtFixed);
	}


	// TIME STEP MODE
	@Output() dtModeNotify : EventEmitter<TimeSteppingMode> = new EventEmitter<TimeSteppingMode>();
	private _dtMode = Defaults.SIM_TIME_STEP_MODE + "";
	get dtMode() {
		return this._dtMode;
	}
	set dtMode(mode : string) {
		if (!EnumChecker.isValidValue(TimeSteppingMode, mode)) {
			console.log("[!!] invalid enum type: " + mode);
		}
		this._dtMode = mode;
		this.dtModeNotify.emit(TimeSteppingModeString.toEnum(mode));
	}


	// TIME STEP LIMIT
	@Output() dtLimitNotify : EventEmitter<number> = new EventEmitter<number>();
	private _dtLimit : number = 0.005;
	get dtLimit() {
		return this._dtLimit;
	}
	set dtLimit(limit) {
		this._dtLimit = limit;
		if (this._dtLimitEnabled) {
			this.dtLimitNotify.emit(limit);
		} else {
			this.dtLimitNotify.emit(-1); // no limit
		}
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
			this.dtLimitNotify.emit(this._dtLimit);
		} else {
			this.dtLimitText = "Set limit";
			this.dtLimitNotify.emit(-1);
		}
	}


}

