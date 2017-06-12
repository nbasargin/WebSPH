import {ShallowWaterPhysics1D} from "../ShallowWaterPhysics1D";
import {Particle} from "../Particle";

export class IntegratorHeun {

    private particleVolume : number;
    private swPhysics : ShallowWaterPhysics1D;

    private prediction : Array<Particle>;



    public constructor(swPhysicis : ShallowWaterPhysics1D, pVolume : number, numParticles : number) {
        this.particleVolume = pVolume;
        this.swPhysics = swPhysicis;

        // predicted particles
        this.prediction = [];
        for (let i = 0; i < numParticles; i++) {
            this.prediction[i] = new Particle();
        }
    }


    public integrate(particles : Array<Particle>, dt : number, smoothingLength : number) {
        // check if prediction has the same size as particles
        if (particles.length != this.prediction.length) {
            console.log("Invalid number of particles!");
            return;
        }

        // given: pos_0, speed_0
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            // calc: acc_0          = ShallowWaterPhysics1D.getAcc (particles)
            pi.acceleration = this.swPhysics.getAcceleration(pi.pos[0], particles, smoothingLength);
            // calc: pos_1          = pos_0 + speed_0 * dt



        }

        // calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )    // (stored in prediction)
        // calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
        // calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt




    }


}