import {Bounds} from "../util/Bounds";
import {SWEnvironment1D} from "./SWEnvironment1D";
import {IntegratorEuler} from "./integrator/IntegratorEuler";
import {HeunOriginal} from "./integrator/HeunOriginal";
import {HeunNaive} from "./integrator/HeunNaive";
import {HeunReduced} from "./integrator/HeunReduced";

/**
 * Main simulation class, contains the integrator and the environment.
 */
export class SWSimulation1D {

    public env : SWEnvironment1D;
    private euler : IntegratorEuler;
    private heun : HeunOriginal;
    private heunNaive : HeunNaive;
    private heunReduced : HeunReduced;

    public dt = 0.001;
    public smoothingLength = 0.02;
    //public useHeun = true;
    public useIntegrator : number = 1;

    public totalTime = 0;

    private acceleration = 9.81;
    private fluidVolume = 2.5; // 2.5 for dam break scenario

    public constructor(numParticles : number, bounds : Bounds) {
        this.env = new SWEnvironment1D(numParticles, bounds, this.fluidVolume, this.acceleration);
        this.euler = new IntegratorEuler(this.env);
        this.heun = new HeunOriginal(this.env);
        this.heunNaive = new HeunNaive(this.env);
        this.heunReduced = new HeunReduced(this.env);
    }

    public update(dt : number = this.dt, smoothingLength : number = this.smoothingLength) {
        this.totalTime += dt;

        switch (this.useIntegrator) {
            case 0:
                this.euler.integrate(dt, smoothingLength);
                break;
            case 1:
                this.heun.integrate(dt, smoothingLength);
                break;
            case 2:
                this.heunNaive.integrate(dt, smoothingLength);
                break;
            case 3:
                this.heunReduced.integrate(dt, smoothingLength);
                break;
        }
    }

    /**
     * Calculate maximal time step. The step depends on the integrator.
     */
    public getMaxTimeStep(smoothingLength : number = this.smoothingLength) : number {

        switch (this.useIntegrator) {
            case 0:
                return this.euler.getMaxTimeStep(smoothingLength, this.acceleration);
            case 1:
                return this.heun.getMaxTimeStep(smoothingLength, this.acceleration);
            case 2:
                return this.heunNaive.getMaxTimeStep(smoothingLength, this.acceleration);
            case 3:
                return this.heunReduced.getMaxTimeStep(smoothingLength, this.acceleration);
        }



    }

}