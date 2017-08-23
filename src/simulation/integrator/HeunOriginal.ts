import {Integrator} from "./Integrator";
import {Environment} from "../Environment";
import {BoundaryType, IntegratorType} from "../../util/Enums";

export class HeunOriginal extends Integrator {

	private envPred : Environment;

	public constructor(env : Environment) {
		super(env);

		this.envPred = env.copy();
	}


	public integrate(dt : number) {// check if prediction has the same size as particles

		let env = this.getEnvironment();
		let particles = env.getParticles();

		let particlesPred = this.envPred.getParticles();

		if (particles.length != particlesPred.length) {
			console.log("Invalid number of particles!");
			return;
		}
        if (this.env.getSmoothingLength() != this.envPred.getSmoothingLength()) {
            this.envPred.setSmoothingLength(this.env.getSmoothingLength());
        }

		let totalTime = this.env.getTotalTime();


		// given: pos_0, speed_0 -> calc: acc_0, pos_1
		for (let i = 0; i < particles.length; i++) {
			let part = particles[i];
			let pred = particlesPred[i];
			// calc: acc_0          = env.getAcc (pos)
			part.accX = env.getFluidAcc(part.posX);
			// calc: pos_1          = pos_0 + speed_0 * dt
			pred.posX = part.posX + part.speedX * dt;
			this.envPred.getBoundary().mapParticleInsideBoundary(pred);
		}
		this.envPred.setTotalTime(totalTime + dt);
		this.envPred.updateBoundary();

		// given: pos_1 -> calc: acc_1
		for (let i = 0; i < particlesPred.length; i++) {
			let pred = particlesPred[i];
			// calc: acc_1          = prediction.getAcc ( pos )
			pred.accX = this.envPred.getFluidAcc(pred.posX);
		}

		// given: acc_0, acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
		for (let i = 0; i < particles.length; i++) {
			let part = particles[i];
			let pred = particlesPred[i];

			// calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
			part.speedX += 0.5 * (part.accX + pred.accX) * dt;

			// calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt
			part.posX = part.posX + part.speedX * dt;
			env.getBoundary().mapParticleInsideBoundary(part);
		}
		this.env.setTotalTime(totalTime + dt);
		this.env.updateBoundary();

	}


	public setBoundaryType(type: BoundaryType) {
		this.env.setBoundaryType(type);
		this.envPred.setBoundaryType(type);
	}

	public setSmoothingLength(h: number) {
		this.env.setSmoothingLength(h);
		this.envPred.setSmoothingLength(h);
	}


	public getType() {
		return IntegratorType.HEUN_STD;
	}

}
