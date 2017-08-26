import {Environment} from "./Environment";
import {Euler} from "./integrator/Euler";
import {HeunOriginal} from "./integrator/HeunOriginal";
import {HeunNaive} from "./integrator/HeunNaive";
import {HeunFast} from "./integrator/HeunFast";
import {TimeStepping} from "./TimeStepping";
import {Integrator} from "./integrator/Integrator";
import {IntegratorType, TimeSteppingMode, BoundaryType} from "../util/Enums";
import {SimulationOptions} from "./SimulationOptions";



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


	public constructor(options? : SimulationOptions) {
		this.reset(options);
	}


	public reset(options? : SimulationOptions) {
		if (!options) options = new SimulationOptions();

		// create env -> will set all environment values based on options
		this.env = new Environment(options);

		// set simulation values from options
		this.setIntegratorType(options.integratorType);
		this.setBoundaryType(options.boundaryType); // depends on integrator
		this.setSmoothingLength(options.smoothingLength); // depends on integrator
		this.setTimeSteppingMode(options.timeSteppingMode);
		this.setFixedTimeStep(options.fixedTimeStep);
		this.dtLimit = options.timeStepLimit;
		this.maxTime = options.timeMax;

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
