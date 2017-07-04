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
    private fluidVolume = 1;

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

    /*public reset() {
        this.totalTime = 0;
        this.env.resetParticles();
        this.update(0);
    }*/

    /**
     * Calculate maximal time step:
     * dt = factor * smoothing length / (max particle speed + wave propagation speed)
     */
    public getMaxTimeStep(smoothingLength : number = this.smoothingLength) : number {
        let maxSpeed = 0;
        for (let i = 0; i < this.env.particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(this.env.particles[i].speedX));
        }
        let ci = Math.sqrt(this.acceleration * smoothingLength); // wave propagation speed
        if (maxSpeed > 0) {
            let dt = smoothingLength / (maxSpeed + ci);
            return dt * 0.20;
        }
        return 0.001; // no speed (could be initial condition) -> allow a small time step to get some real speed
    }

}