import {SWBoundary1D} from "./SWBoundary1D";
import {Particle} from "../Particle";
import {Bounds} from "../../util/Bounds";
import {SWEnvironment1D} from "../SWEnvironment1D";
import {BoundaryType} from "../SWSimulation1D";

export class CyclicBoundary extends SWBoundary1D {

	public constructor(bounds : Bounds) {
		super(bounds);
	}


	/**
	 * Simulates cyclic field. Particles on the left boundary
	 * affect particles on the right boundary.
	 *
	 * Copy particles:
	 * - from left inner to right outer boundary
	 * - from right inner to left outer boundary
	 */
	public update(env : SWEnvironment1D) {
		let xMax = this.xMax;
		let xMin = this.xMin;
		let width = xMax - xMin;
		let ps = env.getParticles();
		let h = env.getSmoothingLength();

		// clear boundary
		this.particlesLeft = [];
		this.particlesRight = [];

		// copy particles
		for (let i = 0; i < ps.length; i++) {
			if (this.isInsideRightInnerBoundary(ps[i].posX, h)) {
				// inside right inner boundary
				// -> copy to the left outer boundary
				let p = new Particle();
				p.posX = ps[i].posX - width;
				this.particlesLeft[this.particlesLeft.length] = p;
			}

			if (this.isInsideLeftInnerBoundary(ps[i].posX, h)) {
				// inside left inner boundary
				// -> copy to the right outer boundary
				let p = new Particle();
				p.posX = ps[i].posX + width;
				this.particlesRight[this.particlesRight.length] = p;
			}

		}

	}


	public mapParticleInsideBoundary(p : Particle) {
		let xMax = this.xMax;
		let xMin = this.xMin;

		if (p.posX > xMax) {
			p.posX -= xMax - xMin;
		} else if (p.posX < xMin) {
			p.posX += xMax - xMin;
		}

	}


	public getType() : BoundaryType {
		return BoundaryType.CYCLIC;
	}

}
