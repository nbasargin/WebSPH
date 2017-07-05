import {SWEnvironment1D} from "../SWEnvironment1D";

/**
 * Abstract integrator class for 1D shallow water environments.
 */
export abstract class SWIntegrator1D {

    protected env : SWEnvironment1D;

    public constructor(env : SWEnvironment1D) {
        this.env = env;
    }

    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public abstract integrate(dt : number, smoothingLength : number);

    /**
     * Calculate maximal time step:
     * dt = factor * smoothing length / (max particle speed + wave propagation speed)
     */
    public getMaxTimeStep(smoothingLength : number, gAcceleration : number) : number {
        let maxSpeed = 0;
        for (let i = 0; i < this.env.particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(this.env.particles[i].speedX));
        }

        let ci = Math.sqrt(gAcceleration * smoothingLength); // wave propagation speed
        let dt = smoothingLength / (maxSpeed + ci);
        return dt * 0.20;
    }


}