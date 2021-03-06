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
	public setDtFixedSendNoEvents(dtFixed : number) {
		this._dtFixed = dtFixed;
	}

	@Output() dtFixedNotify : EventEmitter<number> = new EventEmitter<number>();
	private _dtFixed : number = Defaults.getDefaultSimulationOptions().fixedTimeStep;
	get dtFixed() {
		return this._dtFixed;
	}
	set dtFixed(dtFixed) {
		this._dtFixed = dtFixed;
		this.dtFixedNotify.emit(dtFixed);
	}


	// TIME STEP MODE
	public setDtModeSendNoEvents(mode : TimeSteppingMode) {
		this._dtMode = mode + "";
	}

	@Output() dtModeNotify : EventEmitter<TimeSteppingMode> = new EventEmitter<TimeSteppingMode>();
	private _dtMode = Defaults.getDefaultSimulationOptions().timeSteppingMode + "";
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
	public setDtLimitSendNoEvents(limit : number) {
		if (limit > 0) this._dtLimit = limit;
		this._dtLimitEnabled = limit > 0;
	}

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

	private _dtLimitEnabled : boolean = false;
	get dtLimitEnabled() {
		return this._dtLimitEnabled;
	}
	set dtLimitEnabled(dtLimitEnabled) {
		this._dtLimitEnabled = dtLimitEnabled;
		if (dtLimitEnabled) {
			this.dtLimitNotify.emit(this._dtLimit);
		} else {
			this.dtLimitNotify.emit(-1);
		}
	}


}

