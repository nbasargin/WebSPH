import {IntegratorType, BoundaryType, GroundPreset, TimeSteppingMode, ParticleDistributionPreset} from "./Enums";

export class Defaults {

	public static readonly SIM_INTEGRATOR = IntegratorType.HEUN_STD;
	public static readonly SIM_BOUNDARY = BoundaryType.SOLID;
	public static readonly SIM_GROUND = GroundPreset.CONST_ZERO;
	public static readonly SIM_SMOOTHING_LENGTH = 0.02;
	public static readonly SIM_PARTICLE_NUMBER = 500;
	public static readonly SIM_PARTICLE_DISTRIBUTION = ParticleDistributionPreset.DAM_BREAK;
	public static readonly SIM_FIXED_TIME_STEP = 0.001;
	public static readonly SIM_TIME_STEPPING_MODE = TimeSteppingMode.STABLE;

	public static readonly REND_PARTICLE_SIZE = 2;
	public static readonly REND_SMOOTHING_LENGTH = Defaults.SIM_SMOOTHING_LENGTH;



}
