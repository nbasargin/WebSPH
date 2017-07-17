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

		this.envPred1 = env.copy();
		this.envPred2 = env.copy();
	}

	public integrate(dt: number) {

		let env = this.getEnvironment();
		let particles = env.getParticles();

		if (particles.length != this.envPred1.getParticles().length) {
			console.log("Invalid number of particles!");
			return;
		}
		if (this.env.getSmoothingLength() != this.envPred1.getSmoothingLength()) {
			this.envPred1.setSmoothingLength(this.env.getSmoothingLength());
			this.envPred2.setSmoothingLength(this.env.getSmoothingLength());
		}


		// EULER STEP 1
		for (let i = 0; i < particles.length; i++) {
			let pi = particles[i];

			// acc_0 = ShallowWaterPhysics1D.getAcc(particles)
			pi.accX = env.getFluidAcc(pi.posX);

			// pos_1 = pos_0 + speed_0 * dt
			this.envPred1.getParticles()[i].posX = pi.posX + pi.speedX * dt;
			// no mapping into domain here -> could create problems for averaging

			// speed_1 = speed_0 + acc_0 * dt
			this.envPred1.getParticles()[i].speedX = pi.speedX + pi.accX * dt;
		}
		this.envPred1.getBoundary().updateBoundary();


		// EULER STEP 2
		for (let i = 0; i < particles.length; i++) {
			let p1i = this.envPred1.getParticles()[i];
			let p2i = this.envPred2.getParticles()[i];

			// acc_1 = ShallowWaterPhysics1D.getAcc(prediction1)
			p1i.accX = this.envPred1.getFluidAcc(p1i.posX);

			// pos_2 = pos_1 + speed_1 * dt
			p2i.posX = p1i.posX + p1i.speedX * dt;
			// no mapping into domain here -> could create problems for averaging

			// speed_2 = speed_1 + acc_1 * dt
			p2i.speedX = p1i.speedX + p1i.accX * dt;
		}
		this.envPred2.getBoundary().updateBoundary();

		// AVERAGING
		for (let i = 0; i < particles.length; i++) {
			let p2i = this.envPred2.getParticles()[i];

			// pos_new = (pos_0 + pos_2) / 2
			particles[i].posX = env.getBoundary().mapPositionInsideEnv((particles[i].posX + p2i.posX) / 2);

			// speed_new = (speed_0 + speed_2) / 2
			particles[i].speedX = (particles[i].speedX + p2i.speedX) / 2;
		}
		env.getBoundary().updateBoundary();

		// water height
		for (let i = 0; i < particles.length; i++) {
			let pi = particles[i];
			pi.posY = env.getFluidHeight(pi.posX);
		}



	}

}