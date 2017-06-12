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

        let g = 9.81;

        // given: pos_0, speed_0 -> calc: acc_0, pos_1
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];
            // calc: acc_0          = ShallowWaterPhysics1D.getAcc (particles)
            part.acceleration = g * this.particleVolume * this.swPhysics.getAcceleration(part.pos[0], particles, smoothingLength);
            // calc: pos_1          = pos_0 + speed_0 * dt
            let pos = part.pos[0] + part.speed[0] * dt;
            pred.pos[0] = this.swPhysics.domain.mapXInsideDomainCyclic(pos);
        }

        // given: pos_1 -> calc: acc_1
        for (let i = 0; i < this.prediction.length; i++) {
            let pred = this.prediction[i];
            // calc: acc_1          = ShallowWaterPhysics1D.getAcc ( prediction )
            pred.acceleration = g * this.particleVolume * this.swPhysics.getAcceleration(pred.pos[0], this.prediction, smoothingLength);
        }

        // given: acc_0, acc_1, speed_0, pos_0 -> calc: new speed_0, new pos_0
        for (let i = 0; i < particles.length; i++) {
            let part = particles[i];
            let pred = this.prediction[i];

            // calc: NEW speed_0    = OLD speed_0  +  1/2 * (acc_0 + acc_1) * dt
            part.speed[0] += 0.5 * (part.acceleration + pred.acceleration) * dt;

            // calc: NEW pos_0      = OLD pos_0  +  NEW speed_0 * dt
            let pos = part.pos[0] + part.speed[0] * dt;
            part.pos[0] = this.swPhysics.domain.mapXInsideDomainCyclic(pos);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.pos[1] = this.particleVolume * this.swPhysics.getWaterHeight(pi.pos[0], particles, smoothingLength);
        }

    }


}