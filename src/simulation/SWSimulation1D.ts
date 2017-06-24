import {Bounds} from "../util/Bounds";
import {SWEnvironment1D} from "./SWEnvironment1D";
import {IntegratorEuler} from "./integrator/IntegratorEuler";
import {IntegratorHeun} from "./integrator/IntegratorHeun";

/**
 * Main simulation class, contains the integrator and the environment.
 */
export class SWSimulation1D {

    public env : SWEnvironment1D;
    private euler : IntegratorEuler;
    private heun : IntegratorHeun;

    public dt = 0.001;
    public smoothingLength = 0.02;
    public useHeun = true;

    public totalTime = 0;

    public constructor(numParticles : number, bounds : Bounds) {
        this.env = new SWEnvironment1D(numParticles, bounds, 1, 9.81);
        this.euler = new IntegratorEuler(this.env);
        this.heun = new IntegratorHeun(this.env);
    }

    public update(dt : number = this.dt, smoothingLength : number = this.smoothingLength) {
        this.totalTime += dt;
        if (this.useHeun) {
            this.heun.integrate(dt, smoothingLength);
        } else {
            this.euler.integrate(dt, smoothingLength);
        }
    }

    public reset() {
        this.totalTime = 0;
        this.env.resetParticles();
        this.update(0);
    }

    /**
     * Calculate maximal time step:
     * dt = smoothing length / max speed / 2
     */
    public getMaxTimeStep(smoothingLength : number = this.smoothingLength) {
        let maxSpeed = 0;
        for (let i = 0; i < this.env.particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(this.env.particles[i].speed[0]));
        }
        if (maxSpeed > 0) {
            let dt = smoothingLength / maxSpeed / 2;
            return dt * 0.9;
        }
        return 0.001; // no speed (could be initial condition) -> allow a small time step to get some real speed
    }

}