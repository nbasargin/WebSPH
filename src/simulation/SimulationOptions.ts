import {Defaults} from "../util/Defaults";

export class SimulationOptions {

	public integratorType = Defaults.SIM_INTEGRATOR;
	public boundaryType = Defaults.SIM_BOUNDARY_TYPE;
	public boundarySize = Defaults.SIM_BOUNDARY_SIZE;
	public groundPreset = Defaults.SIM_GROUND_DEFAULT_PRESET;
	public smoothingLength = Defaults.SIM_SMOOTHING_LENGTH;
	public particleNumber = Defaults.SIM_PARTICLE_NUMBER;
	public particleDistribution = Defaults.SIM_PARTICLE_DISTRIBUTION;
	public fixedTimeStep = Defaults.SIM_TIME_STEP_SIZE_FIXED;
	public timeSteppingMode = Defaults.SIM_TIME_STEP_MODE;
	public timeStepLimit = Defaults.SIM_TIME_STEP_LIMIT;
	public timeStart = Defaults.SIM_TIME_START;
	public timeMax = Defaults.SIM_TIME_MAX;
	public fluidVolume = Defaults.SIM_FLUID_VOLUME;
	public gravity = Defaults.SIM_GRAVITY;

}
