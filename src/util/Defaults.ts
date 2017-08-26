import {IntegratorType, BoundaryType, GroundPreset, TimeSteppingMode, ParticleDistribution} from "./Enums";
import {Bounds} from "./Bounds";

export class Defaults {

	public static readonly SIM_INTEGRATOR : IntegratorType = IntegratorType.HEUN_STD;
	public static readonly SIM_BOUNDARY_SIZE : Bounds = { xMin : -3, xMax : 3, yMin : -0.3, yMax : 1.1924 };
	public static readonly SIM_BOUNDARY_TYPE : BoundaryType = BoundaryType.SOLID;
	public static readonly SIM_GROUND_DEFAULT_PRESET : GroundPreset = GroundPreset.CONST_ZERO;
	public static readonly SIM_SMOOTHING_LENGTH : number = 0.02;
	public static readonly SIM_PARTICLE_NUMBER : number = 500;
	public static readonly SIM_PARTICLE_DISTRIBUTION : ParticleDistribution = ParticleDistribution.DAM_BREAK;
	public static readonly SIM_TIME_STEP_SIZE_FIXED : number = 0.001;
	public static readonly SIM_TIME_STEP_MODE : TimeSteppingMode = TimeSteppingMode.STABLE;
	public static readonly SIM_TIME_STEP_LIMIT = -1;
	public static readonly SIM_TIME_START = 0;
	public static readonly SIM_TIME_MAX = -1;
	public static readonly SIM_FLUID_VOLUME : number = 4.75;
	public static readonly SIM_GRAVITY : number = 9.81;

	public static readonly REND_PARTICLE_SIZE : number = 2;
	public static readonly REND_SMOOTHING_LENGTH : number = Defaults.SIM_SMOOTHING_LENGTH;



}
