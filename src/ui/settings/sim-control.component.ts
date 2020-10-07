import { Component, EventEmitter, Output } from '@angular/core';
import { Defaults } from '../../util/Defaults';

@Component({
    selector: 'websph-settings-sim-control',
    templateUrl: 'sim-control.component.html'
})
export class SimControlComponent {

    // TOTAL TIME
    public totalTime: number = Defaults.getDefaultSimulationOptions().timeStart;

    // MAX TIME

    // used to update UI only
    public setMaxTimeSendNoEvents(maxTime: number) {
        this._parsedMaxTime = maxTime;
        if (maxTime > 0) this._maxTimeUserInput = '' + maxTime; // change only if enabled
        this._maxTimeEnabled = maxTime > 0;
    }

    // max time
    @Output() maxTimeNotify: EventEmitter<number> = new EventEmitter<number>();

    // max time ENABLED
    private _maxTimeEnabled: boolean = false;
    set maxTimeEnabled(enabled: boolean) {
        this._maxTimeEnabled = enabled;

        // update _parsedMaxTime
        if (enabled) {
            let parsed = parseFloat(this._maxTimeUserInput);
            if (isNaN(parsed) || parsed <= 0) {
                this._parsedMaxTime = -1;
            } else {
                this._parsedMaxTime = parsed;
            }
        }

        // send events
        if (this._maxTimeEnabled && this._parsedMaxTime > 0) {
            this.maxTimeNotify.emit(this._parsedMaxTime);
        } else {
            this.maxTimeNotify.emit(-1);
        }
    }

    get maxTimeEnabled() {
        return this._maxTimeEnabled;
    }

    // max time VALUE
    private _maxTimeUserInput: string = ''; // what is inside the input box
    private _parsedMaxTime: number = -1; // what is the value
    set maxTimeUserInput(mt: string) {
        this._maxTimeUserInput = mt;
        // check if input is valid
        let parsed = parseFloat(mt);
        if (isNaN(parsed) || parsed <= 0) {
            this._parsedMaxTime = -1;
        } else {
            this._parsedMaxTime = parsed;
        }
        // inform parent
        if (this._maxTimeEnabled) {
            this.maxTimeNotify.emit(this.parsedMaxTime);
        }
    }

    get maxTimeUserInput() {
        return this._maxTimeUserInput;
    }

    get parsedMaxTime() {
        return this._parsedMaxTime;
    }


    // DO STEPS

    @Output() doStepsNotify: EventEmitter<number> = new EventEmitter<number>();

    public onDoStepsClick() {
        this.doStepsNotify.emit(this.numSteps);
    }

    public stepValues: Array<number> = [
        1, 2, 5, 10, 20, 50, 100
    ];
    public numSteps = 1;


    // RESET

    // resetSimulationAndRenderer particles
    @Output() resetNotify: EventEmitter<number> = new EventEmitter<number>();

    public onResetClick() {
        this.resetNotify.emit(this.numParticles);
    }

    public particleValues: Array<number> = [
        1, 10, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000
    ];
    public numParticles = 500;


    // START STOP

    public stopSimulation() {
        this.isRunning = false;
        this.stopNotify.emit();
    }

    @Output() startNotify: EventEmitter<number> = new EventEmitter<number>();
    @Output() stopNotify: EventEmitter<number> = new EventEmitter<number>();
    public isRunning = false;

    public onStartStopClick() {
        if (!this.isRunning) {
            // start
            this.isRunning = true;
            this.startNotify.emit();
        } else {
            // stop
            this.isRunning = false;
            this.stopNotify.emit();
        }
    }


}
