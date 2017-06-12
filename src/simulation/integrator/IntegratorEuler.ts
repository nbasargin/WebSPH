import {ShallowWaterPhysics1D} from "../ShallowWaterPhysics1D";
import {Particle} from "../Particle";

export class IntegratorEuler {

    private particleVolume;
    private swPhysics : ShallowWaterPhysics1D;


    public constructor(swPhysicis : ShallowWaterPhysics1D, pVolume : number) {
        this.particleVolume = pVolume;
        this.swPhysics = swPhysicis;
    }

    public integrate(particles : Array<Particle>, dt : number, smoothingLength : number) {
        // position & speed update
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            // speed
            pi.speed[0] += pi.acceleration * dt;
            // position
            let newPos = pi.pos[0] + pi.speed[0] * dt;
            particles[i].pos[0] = this.swPhysics.domain.mapXInsideDomainCyclic(newPos);
        }

        // force computation
        let g = 9.81;
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.acceleration = g * this.particleVolume * this.swPhysics.getAcceleration(pi.pos[0], particles, smoothingLength);
        }

        // water height
        for (let i = 0; i < particles.length; i++) {
            let pi = particles[i];
            pi.pos[1] = this.particleVolume * this.swPhysics.getWaterHeight(pi.pos[0], particles, smoothingLength);
        }

    }


}