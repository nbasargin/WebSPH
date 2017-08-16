import {Component, Output, EventEmitter} from "@angular/core";

@Component({
	selector: 'websph-settings-rendering',
	templateUrl: 'rendering.component.html'
})
export class RenderingComponent {

	@Output() visuSmoothingLengthNotify : EventEmitter<number> = new EventEmitter<number>();
	private _visuSmoothingLength : number = 0.015;
	set visuSmoothingLength(vh : number) {
		this._visuSmoothingLength = vh;
		this.visuSmoothingLengthNotify.emit(this._visuSmoothingLength);
	}
	get visuSmoothingLength() {
		return this._visuSmoothingLength;
	}

	// particle size
	@Output() pSizeNotify : EventEmitter<number> = new EventEmitter<number>();
	public sizes : Array<number> = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
	];
	private _pSize : number = 2;
	get pSize() {
		return this._pSize;
	}
	set pSize(size : number) {
		this._pSize = size;
		this.pSizeNotify.emit(this._pSize);
	}

}
