import {Bounds} from "../util/Bounds";
import {Environment} from "./Environment";
import {Euler} from "./integrator/Euler";
import {HeunOriginal} from "./integrator/HeunOriginal";
import {HeunNaive} from "./integrator/HeunNaive";
import {HeunFast} from "./integrator/HeunFast";
import {TimeStepping} from "./TimeStepping";
import {Integrator} from "./integrator/Integrator";
import {Defaults} from "../util/Defaults";
import {ParticleDistributionPreset, IntegratorType, TimeSteppingMode, BoundaryType} from "../util/Enums";



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
 * - time step limit
 * - fixed time step
 *
 * Runtime changeable environment properties:
 * - smoothing length
 * - ground
 * - boundary
 * - gravity
 * - particleVolume
 */
export class Simulation {

    private env : Environment;
    private integrator : Integrator;

	private dtMode : TimeSteppingMode;
    private dtFixed : number;
    private dtLimit : number;
    private maxTime : number;


	public constructor(numParticles : number, distribution : ParticleDistributionPreset, bounds : Bounds) {

		// create env -> will set all default values
		this.env = new Environment(numParticles, distribution, bounds);

		this.setIntegratorType(Defaults.SIM_INTEGRATOR);
		this.setSmoothingLength(Defaults.SIM_SMOOTHING_LENGTH);
		this.setBoundaryType(Defaults.SIM_BOUNDARY);
		this.setTimeSteppingMode(Defaults.SIM_TIME_STEPPING_MODE);
		this.setFixedTimeStep(Defaults.SIM_FIXED_TIME_STEP);

		// no time step limit, no max time
		this.dtLimit = -1;
		this.maxTime = -1;
	}


	public update() {
		let dt = this.getNextTimeStep();
		// total time is updated by the integrator
		this.integrator.integrate(dt);
	}

	// INTEGRATOR

	public setIntegratorType(type : IntegratorType) {
		switch(type) {
			case IntegratorType.EULER:
				this.integrator = new Euler(this.env);
				break;
			case IntegratorType.HEUN_STD:
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


	// SMOOTHING LENGTH

	public setSmoothingLength(h : number) {
		this.integrator.setSmoothingLength(h);
	}

	public getSmoothingLength() : number {
		return this.env.getSmoothingLength();
	}


	// TIME STEPPING

	public setTimeSteppingMode(mode : TimeSteppingMode) {
		this.dtMode = mode;
	}

	/**
	 * Calculate the next time step based on mode, limit (if set) and maxTime (if set).
	 * @returns {number} next time step
	 */
	public getNextTimeStep() : number {
		let dtNext = this.getTimeStepForMode(this.dtMode);
		if (this.dtLimit > 0) {
			dtNext = Math.min(dtNext, this.dtLimit);
		}
		if (this.maxTime > 0 && this.env.getTotalTime() + dtNext > this.maxTime) {
			dtNext = this.maxTime - this.env.getTotalTime();
		}
		return dtNext;

	}

	/**
	 * Calculate next time step depending on the mode (no limit).
	 * @param mode
	 * @returns {number}
	 */
	public getTimeStepForMode(mode) : number {
		switch (mode) {
			case TimeSteppingMode.FIXED:
				return this.dtFixed;

			case TimeSteppingMode.FAST:
				return TimeStepping.getMaxTimeStepFast(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());

			case TimeSteppingMode.STABLE:
				return TimeStepping.getMaxTimeStepStable(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());

			default:
				throw new Error("Unknown time stepping mode!");
		}
	}
	public setFixedTimeStep(dt : number) {
		this.dtFixed = dt;
	}
	public setTimeStepLimit(limit : number) {
		this.dtLimit = limit;
	}
	public setMaxTime(maxTime : number) {
		this.maxTime = maxTime;
	}

	public getTotalTime() : number {
		return this.env.getTotalTime();
	}

	// BOUNDARY

    public setBoundaryType(type : BoundaryType) {
        this.integrator.setBoundaryType(type);
    }

	// ENVIRONMENT

    public getEnvironment() : Environment {
        return this.env;
    }


}
