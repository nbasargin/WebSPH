import {SWEnvironment1D} from "../SWEnvironment1D";
import {SWIntegrator1D} from "./SWIntegrator1D";

/**
 * Reduced Heun's method: predicts position and acceleration
 * for the next step and uses those values for this step.
 * No averaging with current acceleration.
 */
export class HeunReduced extends SWIntegrator1D {

	private envPred : SWEnvironment1D;

	public constructor(env : SWEnvironment1D) {
		super(env);

		this.envPred = new SWEnvironment1D(env.particles.length, env.bounds, env.fluidVolume, env.gravity);
	}


	public integrate(dt : number, smoothingLength : number) {// check if prediction has the same size as particles

		let env = this.getEnvironment();
		let particles = env.particles;

		let particlesPred = this.envPred.particles;

		if (particles.length != particlesPred.length) {
			console.log("Invalid number of particles!");
			return;
		}

		// given: pos_0, speed_0 -> calc: pos_1
		for (let i = 0; i < particles.length; i++) {
			let part = particles[i];
			let pred = particlesPred[i];
			// calc: pos_1          = pos_0 + speed_0 * dt
			let pos = part.posX + part.speedX * dt;
			pred.posX = this.envPred.mapXInsideDomainCyclic(pos);
		}

		// UPDATE PRED BOUNDARY HERE

		// given: pos_1 -> calc: acc_1
		for (let i = 0; i < particlesPred.length; i++) {
			let pred = particlesPred[i];
			// calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )
			pred.accX = this.envPred.getFluidAcc(pred.posX, smoothingLength);
		}

		// given: acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
		for (let i = 0; i < particles.length; i++) {
			let part = particles[i];
			let pred = particlesPred[i];

			// calc: NEW speed_0    = OLD speed_0 + acc_1 * dt
			part.speedX += pred.accX * dt;

			// calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt
			let pos = part.posX + part.speedX * dt;
			part.posX = env.mapXInsideDomainCyclic(pos);
		}

		// water height
		for (let i = 0; i < particles.length; i++) {
			let pi = particles[i];
			pi.posY = env.getFluidHeight(pi.posX, smoothingLength);
		}

	}

}
