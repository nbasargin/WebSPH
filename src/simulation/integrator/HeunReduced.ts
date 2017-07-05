import {SWEnvironment1D} from "../SWEnvironment1D";
import {Particle} from "../Particle";
import {SWIntegrator1D} from "./SWIntegrator1D";

/**
 * Reduced Heun's method: predicts position and acceleration
 * for the next step and uses those values for this step.
 * No averaging with current acceleration.
 */
export class HeunReduced extends SWIntegrator1D {

    private prediction : Array<Particle>;

    public constructor(env : SWEnvironment1D) {
        super(env);

        this.prediction = [];
        for (let i = 0; i < env.particles.length; i++) {
            this.prediction[i] = new Particle();
        }
    }


    public integrate(dt : number, smoothingLength : number) {// check if prediction has the same size as particles

        let env = this.getEnvironment();
        let particles = env.particles;

        if (particles.length != this.prediction.length) {
            console.log("Invalid number of particles!");
            return;
        }

        // given: pos_0, speed_0 -> calc: pos_1
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];
            // calc: pos_1          = pos_0 + speed_0 * dt
            let pos = part.posX + part.speedX * dt;
            pred.posX = env.mapXInsideDomainCyclic(pos);
        }

        // given: pos_1 -> calc: acc_1
        for (let i = 0; i < this.prediction.length; i++) {
            let pred = this.prediction[i];
            // calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )
            pred.accX = env.getFluidAcc(pred.posX, smoothingLength, this.prediction);
        }

        // given: acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];

            // calc: NEW speed_0    = OLD speed_0 + acc_1 * dt
            part.speedX += pred.accX * dt;

            // calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt
            let pos = part.posX + part.speedX * dt;
            part.posX = env.mapXInsideDomainCyclic(pos);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.posY = env.getFluidHeight(pi.posX, smoothingLength, particles);
        }

    }

    /**
     * Calculate special time step for this integrator.
     * Maximal particle speed has less influence on the time step. Fast moving particles
     * create oscillations, that are damped with higher time steps.
     *
     * Base formula:
     *      dt = factor * smoothing length / (max particle speed + wave propagation speed)
     * New adapted formula:
     *      dt = factor * smoothing length / (max particle speed * 0.2 + wave propagation speed)
     */
    public getMaxTimeStep(smoothingLength : number, gAcceleration : number) : number {
        let maxSpeed = 0;
        for (let i = 0; i < this.env.particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(this.env.particles[i].speedX));
        }

        let ci = Math.sqrt(gAcceleration * smoothingLength); // wave propagation speed
        let dt = smoothingLength / (maxSpeed * 0.2 + ci);
        return dt * 0.11;
    }

}
