import {Particle} from "../Particle";
import {SWEnvironment1D} from "../SWEnvironment1D";

export abstract class SWBoundary1D {

	public env : SWEnvironment1D;
	public particlesLeft : Array<Particle>;
	public particlesRight : Array<Particle>;


	public constructor(env : SWEnvironment1D) {
		this.env = env;
		this.particlesLeft = [];
		this.particlesRight = [];
	}

	public abstract updateBoundary(smoothingLength : number);

	public abstract mapPositionInsideEnv(xPos : number) : number;

}