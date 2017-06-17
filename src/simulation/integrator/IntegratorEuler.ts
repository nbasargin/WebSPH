import {Environment1D} from "../Environment";
export class IntegratorEuler {

    private env : Environment1D;

    public constructor(env : Environment1D) {
        this.env = env;
    }

    public integrate(dt : number, smoothingLength : number) {
        let particles = this.env.particles;

        // position & speed update
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            // speed
            pi.speed[0] += pi.acceleration * dt;
            // position
            let newPos = pi.pos[0] + pi.speed[0] * dt;
            particles[i].pos[0] = this.env.mapXInsideDomainCyclic(newPos);
        }

        // force computation
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.acceleration = this.env.getFluidAcc(pi.pos[0], smoothingLength, particles);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.pos[1] = this.env.getFluidHeight(pi.pos[0], smoothingLength, particles);
        }

    }

}