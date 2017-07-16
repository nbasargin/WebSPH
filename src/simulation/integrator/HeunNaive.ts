import {SWIntegrator1D} from "./SWIntegrator1D";
import {SWEnvironment1D} from "../SWEnvironment1D";

/**
 * Naive Heun's method: Does two Euler steps and takes the
 * average between the second step and current state.
 */
export class HeunNaive extends SWIntegrator1D {


	private envPred1 : SWEnvironment1D;
	private envPred2 : SWEnvironment1D;


	public constructor(env : SWEnvironment1D) {
		super(env);

		this.envPred1 = new SWEnvironment1D(env.particles.length, env.bounds, env.fluidVolume, env.gravity);
		this.envPred2 = new SWEnvironment1D(env.particles.length, env.bounds, env.fluidVolume, env.gravity);
	}

	public integrate(dt: number, smoothingLength: number) {

		let env = this.getEnvironment();
		let particles = env.particles;

		if (particles.length != this.envPred1.particles.length) {
			console.log("Invalid number of particles!");
			return;
		}


		// EULER STEP 1
		for (let i = 0; i < particles.length; i++) {
			let pi = particles[i];

			// acc_0 = ShallowWaterPhysics1D.getAcc(particles)
			pi.accX = env.getFluidAcc(pi.posX, smoothingLength);

			// pos_1 = pos_0 + speed_0 * dt
			this.envPred1.particles[i].posX = pi.posX + pi.speedX * dt;
			// no mapping into domain here -> could create problems for averaging

			// speed_1 = speed_0 + acc_0 * dt
			this.envPred1.particles[i].speedX = pi.speedX + pi.accX * dt;
		}
		this.envPred1.cyclicBoundary.updateBoundary(smoothingLength);


		// EULER STEP 2
		for (let i = 0; i < particles.length; i++) {

			// acc_1 = ShallowWaterPhysics1D.getAcc(prediction1)
			this.envPred1.particles[i].accX = this.envPred1.getFluidAcc(this.envPred1.particles[i].posX, smoothingLength);

			// pos_2 = pos_1 + speed_1 * dt
			this.envPred2.particles[i].posX = this.envPred1.particles[i].posX + this.envPred1.particles[i].speedX * dt;
			// no mapping into domain here -> could create problems for averaging

			// speed_2 = speed_1 + acc_1 * dt
			this.envPred2.particles[i].speedX = this.envPred1.particles[i].speedX + this.envPred1.particles[i].accX * dt;
		}
		this.envPred2.cyclicBoundary.updateBoundary(smoothingLength);

		// AVERAGING
		for (let i = 0; i < particles.length; i++) {
			// pos_new = (pos_0 + pos_2) / 2
			particles[i].posX = env.mapXInsideDomainCyclic((particles[i].posX + this.envPred2.particles[i].posX) / 2);

			// speed_new = (speed_0 + speed_2) / 2
			particles[i].speedX = (particles[i].speedX + this.envPred2.particles[i].speedX) / 2;
		}
		env.cyclicBoundary.updateBoundary(smoothingLength);

		// water height
		for (let i = 0; i < particles.length; i++) {
			let pi = particles[i];
			pi.posY = env.getFluidHeight(pi.posX, smoothingLength);
		}



	}

}