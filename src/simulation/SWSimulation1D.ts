import {Bounds} from "../util/Bounds";
import {SWEnvironment1D} from "./SWEnvironment1D";
import {IntegratorEuler} from "./integrator/IntegratorEuler";
import {IntegratorHeun} from "./integrator/IntegratorHeun";

export class SWSimulation1D {

    public env : SWEnvironment1D;
    private euler : IntegratorEuler;
    private heun : IntegratorHeun;

    public dt = 0.001;
    public smoothingLength = 0.03;
    public useHeun = true;

    public constructor(numParticles : number, bounds : Bounds) {
        this.env = new SWEnvironment1D(numParticles, bounds, 1, 9.81);
        this.euler = new IntegratorEuler(this.env);
        this.heun = new IntegratorHeun(this.env);
    }

    public update(dt : number = this.dt, smoothingLength : number = this.smoothingLength) {
        if (this.useHeun) {
            this.heun.integrate(dt, smoothingLength);
        } else {
            this.euler.integrate(dt, smoothingLength);
        }
    }

}