import {Particle} from "./Particle";

export class TimeStepping {

    /**
     * Calculate maximal time step:
     * dt = factor * smoothing length / (max particle speed + wave propagation speed)
     */
    public static getMaxTimeStepStable(particles : Array<Particle>, smoothingLength : number, gAcceleration : number) : number {
        let maxSpeed = 0;
        for (let i = 0; i < particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(particles[i].speedX));
        }

        let ci = Math.sqrt(gAcceleration * smoothingLength); // wave propagation speed
        let dt = smoothingLength / (maxSpeed + ci);
        if (maxSpeed == 0) {
            return dt * 0.10;
        }
        return dt * 0.20;
    }

    /**
     * Maximal particle speed has less influence on the time step. Fast moving particles
     * create oscillations, that are damped with higher time steps.
     *
     * dt = factor * smoothing length / (max particle speed * 0.2 + wave propagation speed)
     */
    public static getMaxTimeStepFast(particles : Array<Particle>, smoothingLength : number, gAcceleration : number) : number {
        let maxSpeed = 0;
        for (let i = 0; i < particles.length; i++) {
            maxSpeed = Math.max(maxSpeed, Math.abs(particles[i].speedX));
        }

        let ci = Math.sqrt(gAcceleration * smoothingLength); // wave propagation speed
        let dt = smoothingLength / (maxSpeed * 0.2 + ci);
        if (maxSpeed == 0) return dt * 0.055;
        return dt * 0.11;

    }


}