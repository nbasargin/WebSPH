import {Bounds} from "../util/Bounds";
import {SWEnvironment1D} from "./SWEnvironment1D";
import {IntegratorEuler} from "./integrator/IntegratorEuler";
import {HeunOriginal} from "./integrator/HeunOriginal";
import {HeunNaive} from "./integrator/HeunNaive";
import {HeunFast} from "./integrator/HeunFast";
import {TimeStepping} from "./TimeStepping";
import {SWIntegrator1D} from "./integrator/SWIntegrator1D";

export enum IntegratorType {
    EULER,
    HEUN_NAIVE,
    HEUN_ORIGINAL,
    HEUN_FAST
}

export enum BoundaryType {
    CYCLIC,
    SOLID
}

export enum GroundType {
    // TODO
}

export enum ParticleDistributionType {
    // TODO
}

export enum TimeSteppingType {
    // TODO
}

/**
 * Main simulation class, contains the integrator and the environment.
 */
export class SWSimulation1D {

    // TODO
    private _integratorType : IntegratorType;
    private _boundaryType : BoundaryType;
    private _groundType : GroundType;
    private _particleDistributionType : ParticleDistributionType;
    private _timeSteppingType : TimeSteppingType;


    private env : SWEnvironment1D;
    private integrator : SWIntegrator1D;
    private integratorType : number; // 0: euler,    1: heun,    2: heunNaive,    3: heunReduced

    public dt = 0.001;

    public useTimeSteppingMode : number = 0;  // 0: fixed dt,    1: dynamic stable,     2: dynamic fast

    public constructor(numParticles : number, bounds : Bounds, smoothingLength : number) {
        this.env = new SWEnvironment1D(numParticles, bounds, smoothingLength);
        this.integratorType = 1;
        this.setIntegratorType(this.integratorType);
    }

    public update(dt : number = this.dt) {
        // total time is updated by the integrator
        this.integrator.integrate(dt);

    }

    /**
     * Calculate maximal time step depending on the mode.
     * 0: fixed dt,    1: dynamic stable,     2: dynamic fast
     */
    public getMaxTimeStep(mode : number = this.useTimeSteppingMode) : number {
        switch(mode) {
            case 0:
                return this.dt;
            case 1:
                return TimeStepping.getMaxTimeStepStable(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());
            case 2:
                return TimeStepping.getMaxTimeStepFast(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());
            default:
                return 0;
        }

    }

    public setIntegratorType(type : number) {
        switch(type) {
            case 0:
                this.integrator = new IntegratorEuler(this.env);
                break;
            case 1:
                this.integrator = new HeunOriginal(this.env);
                break;
            case 2:
                this.integrator = new HeunNaive(this.env);
                break;
            case 3:
                this.integrator = new HeunFast(this.env);
                break;
        }
    }
    public getIntegratorType() {
        return this.integratorType;
    }


    public setBoundaryType(type : number) {
        this.integrator.setBoundaryType(type);
    }

    public setSmoothingLength(h : number) {
        this.integrator.setSmoothingLength(h);
    }

    public getSmoothingLength() : number {
        return this.env.getSmoothingLength();
    }

    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public getTotalTime() : number {
        return this.env.getTotalTime();
    }

}