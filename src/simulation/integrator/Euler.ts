import {Environment} from "../Environment";
import {Integrator} from "./Integrator";
import {BoundaryType, IntegratorType} from "../../util/Enums";

export class Euler extends Integrator {

    public constructor(env : Environment) {
        super(env);
    }

    public integrate(dt : number) {
        let env = this.getEnvironment();
        let particles = env.getParticles();

        // position & speed update
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            // speed
            pi.speedX += pi.accX * dt;
            // position
            particles[i].posX = pi.posX + pi.speedX * dt;
            env.getBoundary().mapParticleInsideBoundary(particles[i]);
        }
        env.setTotalTime(env.getTotalTime() + dt);
        env.updateBoundary();

        // force computation
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.accX = env.getFluidAcc(pi.posX);
        }
    }


    public setBoundaryType(type: BoundaryType) {
        this.env.setBoundaryType(type);
    }

    public setSmoothingLength(h: number) {
        this.env.setSmoothingLength(h);
    }

    public getType() {
    	return IntegratorType.EULER;
	}

}
