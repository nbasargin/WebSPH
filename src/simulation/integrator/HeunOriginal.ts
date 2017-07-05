import {SWEnvironment1D} from "../SWEnvironment1D";
import {Particle} from "../Particle";
import {SWIntegrator1D} from "./SWIntegrator1D";

/**
 * Original Heun's method: Predicts position and acceleration
 * for the next step and takes the average of predicted acceleration
 * and current acceleration.
 */
export class HeunOriginal extends SWIntegrator1D {

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

        // given: pos_0, speed_0 -> calc: acc_0, pos_1
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];
            // calc: acc_0          = ShallowWaterPhysics1D.getAcc (particles)
            part.accX = env.getFluidAcc(part.posX, smoothingLength, particles);
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

        // given: acc_0, acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];

            // calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
            part.speedX += 0.5 * (part.accX + pred.accX) * dt;

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

}