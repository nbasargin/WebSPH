import { Component, EventEmitter, Output } from '@angular/core';
import { Defaults } from '../../util/Defaults';
import { BoundaryType, BoundaryTypeString, EnumChecker, IntegratorType, IntegratorTypeString } from '../../util/Enums';

@Component({
    selector: 'websph-settings-sim-settings',
    templateUrl: 'sim-options.component.html'
})
export class SimOptionsComponent {

    public setIntegratorSendNoEvents(i: IntegratorType) {
        this._integrator = i + '';
    }

    @Output() integratorNotify: EventEmitter<IntegratorType> = new EventEmitter<IntegratorType>();
    private _integrator: string = Defaults.getDefaultSimulationOptions().integratorType + '';
    set integrator(i: string) {

        if (!EnumChecker.isValidValue(IntegratorType, i)) {
            console.log('[!!] invalid enum type: ' + i);
        }

        this._integrator = i;
        this.integratorNotify.emit(IntegratorTypeString.toEnum(i));
    }

    get integrator() {
        return this._integrator
    }


    public setSmoothingLengthSendNoEvents(h: number) {
        this._smoothingLength = h;
    }

    @Output() smoothingLengthNotify: EventEmitter<number> = new EventEmitter<number>();
    private _smoothingLength: number = Defaults.getDefaultSimulationOptions().smoothingLength;
    set smoothingLength(h: number) {
        this._smoothingLength = h;
        this.smoothingLengthNotify.emit(this._smoothingLength);
    }

    get smoothingLength() {
        return this._smoothingLength;
    }


    public setBoundarySendNoEvents(b: BoundaryType) {
        this._boundary = b + '';
    }

    @Output() boundaryNotify: EventEmitter<BoundaryType> = new EventEmitter<BoundaryType>();
    private _boundary: string = Defaults.getDefaultSimulationOptions().boundaryType + '';
    set boundary(b: string) {
        if (!EnumChecker.isValidValue(BoundaryType, b)) {
            console.log('[!!] invalid enum type: ' + b);
        }

        this._boundary = b;
        this.boundaryNotify.emit(BoundaryTypeString.toEnum(b));
    }

    get boundary() {
        return this._boundary;
    }


}
