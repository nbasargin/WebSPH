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
            pi.speedX += pi.accX * dt;
            // position
            let newPos = pi.posX + pi.speedX * dt;
            particles[i].posX = env.mapXInsideDomainCyclic(newPos);
        }

        env.cyclicBoundary.updateBoundary(smoothingLength);

        // force computation
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.accX = env.getFluidAcc(pi.posX, smoothingLength);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.posY = env.getFluidHeight(pi.posX, smoothingLength);
        }

    }

}