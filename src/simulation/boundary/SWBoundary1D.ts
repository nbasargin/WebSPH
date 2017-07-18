import {Particle} from "../Particle";
import {SWEnvironment1D} from "../SWEnvironment1D";
import {Bounds} from "../../util/Bounds";

export abstract class SWBoundary1D implements Bounds {

	public xMin : number;
	public xMax : number;
	public yMin : number;
	public yMax : number;

	public particlesLeft : Array<Particle>;
	public particlesRight : Array<Particle>;


	public constructor(bounds : Bounds) {
		this.particlesLeft = [];
		this.particlesRight = [];

		this.xMin = bounds.xMin;
		this.xMax = bounds.xMax;
		this.yMin = bounds.yMin;
		this.yMax = bounds.yMax;

	}

	/**
	 * Copies all particles near the boundary into boundary arrays.
	 * This is needed each time the position of the particles is changed.
	 */
	public abstract update(env : SWEnvironment1D);

	/**
	 * Maps the particle into the environment if its outside the boundary.
	 * Can affect position and speed of the particle (depends on boundary type).
	 *
	 * Note: may produce invalid results if the distance to the bounds of
	 * this domain is greater than the domain width (performance reasons).
	 *
	 * @param p Particle
	 */
	public abstract mapParticleInsideBoundary(p : Particle);


	public isInsideLeftInnerBoundary(xPos : number, smoothingLength : number) {
		return xPos < (this.xMin + 2 * smoothingLength);
	}
	public isInsideRightInnerBoundary(xPos : number, smoothingLength : number) {
		return xPos > (this.xMax - 2 * smoothingLength);
	}

}