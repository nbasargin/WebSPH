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

	/**
	 * Copies all particles near the boundary into boundary arrays.
	 * This is needed each time the position of the particles is changed.
	 */
	public abstract updateBoundary();

	/**
	 * Maps the particle into the environment if its outside the boundary.
	 * Can affect position and speed of the particle (depends on boundary type).
	 *
	 * Note: may produce invalid results if the distance to the bounds of
	 * this domain is greater than the domain width (performance reasons).
	 *
	 * @param p Particle
	 */
	public abstract mapParticleInsideEnv(p : Particle);


	public isInsideLeftInnerBoundary(xPos : number) {
		return xPos < (this.env.getBounds().xMin + 2 * this.env.getSmoothingLength());
	}
	public isInsideRightInnerBoundary(xPos : number) {
		return xPos > (this.env.getBounds().xMax - 2 * this.env.getSmoothingLength());
	}

}