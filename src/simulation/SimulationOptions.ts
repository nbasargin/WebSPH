import {Defaults} from "../util/Defaults";

export class SimulationOptions {

	public integratorType = Defaults.SIM_INTEGRATOR;
	public boundaryType = Defaults.SIM_BOUNDARY;
	public groundPreset = Defaults.SIM_GROUND;
	public smoothingLength = Defaults.SIM_SMOOTHING_LENGTH;
	public particleNumber = Defaults.SIM_PARTICLE_NUMBER;
	public particleDistribution = Defaults.SIM_PARTICLE_DISTRIBUTION;
	public fixedTimeStep = Defaults.SIM_FIXED_TIME_STEP;
	public timeSteppingMode = Defaults.SIM_TIME_STEPPING_MODE;
	public fluidVolume = Defaults.SIM_FLUID_VOLUME;
	public gravity = Defaults.SIM_GRAVITY;

}
