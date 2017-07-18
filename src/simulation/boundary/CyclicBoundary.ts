import {SWBoundary1D} from "./SWBoundary1D";
import {SWEnvironment1D} from "../SWEnvironment1D";
import {Particle} from "../Particle";

export class CyclicBoundary extends SWBoundary1D {

	public constructor(env : SWEnvironment1D) {
		super(env);
	}

	public updateBoundary() {
		let xMax = this.env.getBounds().xMax;
		let xMin = this.env.getBounds().xMin;
		let width = xMax - xMin;
		let ps = this.env.getParticles();

		// clear boundary
		this.particlesLeft = [];
		this.particlesRight = [];

		// copy particles
		for (let i = 0; i < ps.length; i++) {
			if (this.isInsideRightInnerBoundary(ps[i].posX)) {
				// inside right inner boundary
				// -> copy to the left outer boundary
				let p = new Particle();
				p.posX = ps[i].posX - width;
				this.particlesLeft[this.particlesLeft.length] = p;
			}

			if (this.isInsideLeftInnerBoundary(ps[i].posX)) {
				// inside left inner boundary
				// -> copy to the right outer boundary
				let p = new Particle();
				p.posX = ps[i].posX + width;
				this.particlesRight[this.particlesRight.length] = p;
			}

		}

	}


	public mapParticleInsideEnv(p : Particle) {
		let xMax = this.env.getBounds().xMax;
		let xMin = this.env.getBounds().xMin;

		if (p.posX > xMax) {
			p.posX -= xMax - xMin;
		} else if (p.posX < xMin) {
			p.posX += xMax - xMin;
		}

	}

}
