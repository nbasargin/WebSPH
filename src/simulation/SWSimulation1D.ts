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

export enum ParticleDistributionPreset {
    UNIFORM,
	DAM_BREAK,
	WATER_DROP
}

export enum TimeSteppingMode {
    FIXED,
	STABLE,
	FAST
}

export enum GroundPreset {
	CONST_ZERO,
	CONST_SINE,
	CONST_SLOPE,
	DYN_SLOPE,
	DYN_SMOOTHING_KERNEL
}

/**
 * Main simulation class, contains the integrator and the environment.
 *
 * Required environment for init:
 * - number of particles
 * - particle distribution
 * - bounds
 *
 * Runtime changeable simulation settings:
 * - integrator
 * - time stepping mode
 *
 * Runtime changeable environment properties:
 * - smoothing length
 * - ground
 * - boundary
 * - gravity
 * - particleVolume
 */
export class SWSimulation1D {

    private env : SWEnvironment1D;
    private integrator : SWIntegrator1D;

    public dt = 0.001;

    public useTimeSteppingMode : number = 0;  // 0: fixed dt,    1: dynamic stable,     2: dynamic fast



	//////////////////////////////////////////////////////////////////////
	/////////////////////          NEW         ///////////////////////////

	private _timeSteppingMode : TimeSteppingMode;



	public constructor(numParticles : number, distribution : ParticleDistributionPreset, bounds : Bounds) {

		// create env -> will set all default values
		this.env = new SWEnvironment1D(numParticles, distribution, bounds);

		// create default integrator
		this.integrator = new HeunFast(this.env);

		// create default time stepping mode
		this._timeSteppingMode = TimeSteppingMode.FIXED;

	}

	public setIntegratorType(type : IntegratorType) {
		switch(type) {
			case IntegratorType.EULER:
				this.integrator = new IntegratorEuler(this.env);
				break;
			case IntegratorType.HEUN_ORIGINAL:
				this.integrator = new HeunOriginal(this.env);
				break;
			case IntegratorType.HEUN_NAIVE:
				this.integrator = new HeunNaive(this.env);
				break;
			case IntegratorType.HEUN_FAST:
				this.integrator = new HeunFast(this.env);
				break;
			default:
				throw new Error("Unknown integrator type!");
		}
	}


	public setSmoothingLength(h : number) {
		this.integrator.setSmoothingLength(h);
	}

	public getSmoothingLength() : number {
		return this.env.getSmoothingLength();
	}


	public setTimeSteppingMode() {

	}
	public newGetNextTimeStep() {

	}
	public getTimeStepForMode(mode) {

	}





	//////////////////////////////////////////////////////////////////////
	/////////////////////         OLD          ///////////////////////////




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


    public setBoundaryType(type : number) {
        this.integrator.setBoundaryType(type);
    }


    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public getTotalTime() : number {
        return this.env.getTotalTime();
    }

}