import {IntegratorType, BoundaryType, ParticleDistribution, TimeSteppingMode} from "../util/Enums";
import {Bounds} from "../util/Bounds";
import {GroundProfile} from "./ground/GroundProfile";

export interface SimulationOptions {

	integratorType : IntegratorType;
	boundaryType : BoundaryType;
	boundarySize : Bounds;
	//groundPreset : GroundPreset;
	ground : GroundProfile;
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
