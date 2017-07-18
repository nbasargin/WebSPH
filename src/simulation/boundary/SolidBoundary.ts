import {SWBoundary1D} from "./SWBoundary1D";
import {Particle} from "../Particle";

export class SolidBoundary extends SWBoundary1D {


	/**
	 * Simulates solid wall at the boundary. Force acting to the wall is
	 * returned to the particles next to the wall. This is done by creating
	 * a copy of next-to-wall particles.
	 */
	public updateBoundary() {
		let xMax = this.env.getBounds().xMax;
		let xMin = this.env.getBounds().xMin;
		let ps = this.env.getParticles();

		// clear boundary
		this.particlesLeft = [];
		this.particlesRight = [];

		// copy particles
		for (let i = 0; i < ps.length; i++) {
			if (this.isInsideRightInnerBoundary(ps[i].posX)) {
				// inside right inner boundary
				// -> mirror at the boundary to the outer part
				let p = new Particle();
				p.posX = xMax + (xMax - ps[i].posX);
				this.particlesRight[this.particlesRight.length] = p;
			}

			if (this.isInsideLeftInnerBoundary(ps[i].posX)) {
				// inside left inner boundary
				// -> mirror at the boundary to the outer part
				let p = new Particle();
				p.posX = xMin - (ps[i].posX - xMin);
				this.particlesLeft[this.particlesLeft.length] = p;
			}

		}


	}

	public mapParticleInsideEnv(p: Particle) {
		let xMax = this.env.getBounds().xMax;
		let xMin = this.env.getBounds().xMin;

		// position outside boundary -> move inside and flip speed & acceleration
		if (p.posX > xMax) {
			p.posX = xMax - (p.posX - xMax);
			p.speedX = -p.speedX;
			p.accX = -p.accX;

		} else if (p.posX < xMin) {
			p.posX = xMin + (xMin - p.posX);
			p.speedX = -p.speedX;
			p.accX = -p.accX;

		}

	}


}