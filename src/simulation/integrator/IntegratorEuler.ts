import {SWEnvironment1D} from "../SWEnvironment1D";
import {SWIntegrator1D} from "./SWIntegrator1D";

export class IntegratorEuler extends SWIntegrator1D {

    public constructor(env : SWEnvironment1D) {
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

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.posY = env.getFluidHeight(pi.posX) + env.getGroundHeight(pi.posX);
        }

    }


    public setBoundaryType(type: number) {
        this.env.setBoundaryType(type);
    }

    public setSmoothingLength(h: number) {
        this.env.setSmoothingLength(h);
    }

}