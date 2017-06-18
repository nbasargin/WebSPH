import {SWEnvironment1D} from "../SWEnvironment1D";
import {Particle} from "../Particle";
import {SWIntegrator1D} from "./SWIntegrator1D";

export class IntegratorHeun extends SWIntegrator1D {

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
            part.acceleration = env.getFluidAcc(part.pos[0], smoothingLength, particles);
            // calc: pos_1          = pos_0 + speed_0 * dt
            let pos = part.pos[0] + part.speed[0] * dt;
            pred.pos[0] = env.mapXInsideDomainCyclic(pos);
        }

        // given: pos_1 -> calc: acc_1
        for (let i = 0; i < this.prediction.length; i++) {
            let pred = this.prediction[i];
            // calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )
            pred.acceleration = env.getFluidAcc(pred.pos[0], smoothingLength, this.prediction);
        }

        // given: acc_0, acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];

            // calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
            part.speed[0] += 0.5 * (part.acceleration + pred.acceleration) * dt;

            // calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt
            let pos = part.pos[0] + part.speed[0] * dt;
            part.pos[0] = env.mapXInsideDomainCyclic(pos);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.pos[1] = env.getFluidHeight(pi.pos[0], smoothingLength, particles);
        }

    }

}
