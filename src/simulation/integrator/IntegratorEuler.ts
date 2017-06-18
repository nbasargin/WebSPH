import {SWEnvironment1D} from "../SWEnvironment1D";
import {SWIntegrator1D} from "./SWIntegrator1D";

export class IntegratorEuler extends SWIntegrator1D {

    public constructor(env : SWEnvironment1D) {
        super(env);
    }

    public integrate(dt : number, smoothingLength : number) {
        let env = this.getEnvironment();
        let particles = env.particles;

        // position & speed update
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            // speed
            pi.speed[0] += pi.acceleration * dt;
            // position
            let newPos = pi.pos[0] + pi.speed[0] * dt;
            particles[i].pos[0] = env.mapXInsideDomainCyclic(newPos);
        }

        // force computation
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.acceleration = env.getFluidAcc(pi.pos[0], smoothingLength, particles);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.pos[1] = env.getFluidHeight(pi.pos[0], smoothingLength, particles);
        }

    }

}