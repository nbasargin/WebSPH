import {Boundary} from "./Boundary";
import {Particle} from "../Particle";
import {Environment} from "../Environment";
import {Bounds} from "../../util/Bounds";
import {BoundaryType} from "../../util/Enums";

export class SolidBoundary extends Boundary {

	public constructor(bounds : Bounds) {
		super(bounds);
	}


	/**
	 * Simulates solid wall at the boundary. Force acting to the wall is
	 * returned to the particles next to the wall. This is done by creating
	 * a copy of next-to-wall particles.
	 */
	public update(env : Environment) {
		let xMax = this.xMax;
		let xMin = this.xMin;
		let ps = env.getParticles();
		let h = env.getSmoothingLength();

		// clear boundary
		this.particlesLeft = [];
		this.particlesRight = [];

		// copy particles
		for (let i = 0; i < ps.length; i++) {
			if (this.isInsideRightInnerBoundary(ps[i].posX, h)) {
				// inside right inner boundary
				// -> mirror at the boundary to the outer part
				let p = new Particle();
				p.posX = xMax + (xMax - ps[i].posX);
				this.particlesRight[this.particlesRight.length] = p;
			}

			if (this.isInsideLeftInnerBoundary(ps[i].posX, h)) {
				// inside left inner boundary
				// -> mirror at the boundary to the outer part
				let p = new Particle();
				p.posX = xMin - (ps[i].posX - xMin);
				this.particlesLeft[this.particlesLeft.length] = p;
			}

		}


	}

	public mapParticleInsideBoundary(p: Particle) {
		let xMax = this.xMax;
		let xMin = this.xMin;

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

	public getType() : BoundaryType {
		return BoundaryType.SOLID;
	}

}
