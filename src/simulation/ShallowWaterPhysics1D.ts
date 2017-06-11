import {Particle} from "./Particle";
import {Domain} from "./Domain";
import {SmoothingKernel} from "./SmoothingKernel";

export class ShallowWaterPhysics1D {

    private domain : Domain;

    public constructor(domain : Domain) {
        this.domain = domain;
    }


    public getWaterHeight(x : number, particles : Array<Particle>, smoothingLength : number) : number {
        let height = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = this.domain.xDistCyclic(x, particles[i].pos[0]);
            let W = SmoothingKernel.cubic1D(dist, smoothingLength);
            height += W;
        }

        return height;

    }


    public getAcceleration(x : number, particles : Array<Particle>, smoothingLength : number ) : number {
        let acc = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = this.domain.xDistCyclic(x, particles[i].pos[0]);
            let dW = SmoothingKernel.dCubic1D(dist, smoothingLength);
            acc += dW;
        }

        return acc;
    }

}
