import {Component, Output, EventEmitter} from "@angular/core";
import {Defaults} from "../../util/Defaults";

@Component({
	selector: 'websph-settings-rendering',
	templateUrl: 'rendering.component.html'
})
export class RenderingComponent {

	public setVisuSmoothingLengthSendNoEvents(vh : number) {
		this._visuSmoothingLength = vh;
	}

	@Output() visuSmoothingLengthNotify : EventEmitter<number> = new EventEmitter<number>();
	private _visuSmoothingLength : number = Defaults.getDefaultRendererOptions().smoothingLength;
	set visuSmoothingLength(vh : number) {
		this._visuSmoothingLength = vh;
		this.visuSmoothingLengthNotify.emit(this._visuSmoothingLength);
	}
	get visuSmoothingLength() {
		return this._visuSmoothingLength;
	}

	// particle size
	public setParticleSizeSendNoEvents(pSize : number) {
		this._pSize = pSize;
	}

	@Output() pSizeNotify : EventEmitter<number> = new EventEmitter<number>();
	public sizes : Array<number> = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
	];
	private _pSize : number = Defaults.getDefaultRendererOptions().particleSize;
	get pSize() {
		return this._pSize;
	}
	set pSize(size : number) {
		this._pSize = size;
		this.pSizeNotify.emit(this._pSize);
	}

	public fps : number = 0;

}
