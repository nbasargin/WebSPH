import {SWIntegrator1D} from "./SWIntegrator1D";
import {Particle} from "../Particle";
import {SWEnvironment1D} from "../SWEnvironment1D";

/**
 * Naive Heun's method: Does two Euler steps and takes the
 * average between the second step and current state.
 */
export class HeunNaive extends SWIntegrator1D {


    private prediction1 : Array<Particle>;
    private prediction2 : Array<Particle>;


    public constructor(env : SWEnvironment1D) {
        super(env);

        this.prediction1 = [];
        this.prediction2 = [];
        for (let i = 0; i < env.particles.length; i++) {
            this.prediction1[i] = new Particle();
            this.prediction2[i] = new Particle();
        }
    }

    public integrate(dt: number, smoothingLength: number) {


        let env = this.getEnvironment();
        let particles = env.particles;

        if (particles.length != this.prediction1.length) {
            console.log("Invalid number of particles!");
            return;
        }

        // EULER STEP 1
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];

            // acc_0 = ShallowWaterPhysics1D.getAcc(particles)
            pi.accX = env.getFluidAcc(pi.posX, smoothingLength, particles);

            // pos_1 = pos_0 + speed_0 * dt
            this.prediction1[i].posX = pi.posX + pi.speedX * dt;

            // speed_1 = speed_0 + acc_0 * dt
            this.prediction1[i].speedX = pi.speedX + pi.accX * dt;
        }

        // EULER STEP 2
        for (let i = 0; i < particles.length; i++) {

            // acc_1 = ShallowWaterPhysics1D.getAcc(prediction1)
            this.prediction1[i].accX = env.getFluidAcc(this.prediction1[i].posX, smoothingLength, this.prediction1);

            // pos_2 = pos_1 + speed_1 * dt
            this.prediction2[i].posX = this.prediction1[i].posX + this.prediction1[i].speedX * dt;

            // speed_2 = speed_1 + acc_1 * dt
            this.prediction2[i].speedX = this.prediction1[i].speedX + this.prediction1[i].accX * dt;
        }

        // AVERAGING
        for (let i = 0; i < particles.length; i++) {
            // pos_new = (pos_0 + pos_2) / 2
            particles[i].posX = (particles[i].posX + this.prediction2[i].posX) / 2;

            // speed_new = (speed_0 + speed_2) / 2
            particles[i].speedX = (particles[i].speedX + this.prediction2[i].speedX) / 2;
        }


        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.posY = env.getFluidHeight(pi.posX, smoothingLength, particles);
        }



    }

}