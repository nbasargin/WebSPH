import {IntegratorType, BoundaryType, GroundPreset, ParticleDistribution, TimeSteppingMode} from "../util/Enums";
import {Bounds} from "../util/Bounds";

export interface SimulationOptions {

	integratorType : IntegratorType;
	boundaryType : BoundaryType;
	boundarySize : Bounds;
	groundPreset : GroundPreset;
	smoothingLength : number;
	particleNumber : number;
	particleDistribution : ParticleDistribution;
	fixedTimeStep : number;
	timeSteppingMode : TimeSteppingMode;
	timeStepLimit : number;
	timeStart : number;
	timeMax : number;
	fluidVolume : number;
	gravity : number;

}
