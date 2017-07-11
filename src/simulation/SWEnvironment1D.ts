import {Bounds} from "../util/Bounds";
import {Particle} from "./Particle";
import {SmoothingKernel} from "./SmoothingKernel";

export class SWEnvironment1D {

    public particles : Array<Particle>;
    public bounds : Bounds;
    public fluidVolume : number;
    public gravity : number;


    public constructor(numParticles : number, bounds : Bounds, fluidVolume : number, gravity : number) {

        this.particles = [];
        for (let i = 0; i < numParticles; i++) {
            this.particles[i] = new Particle();
        }

        this.bounds = bounds;
        this.fluidVolume = fluidVolume || 1;
        this.gravity = gravity || 9.81;

        //this.resetParticlesToWaterColumn();
        this.resetParticlesToDamBreak();
    }

    //region particle distribution

    /**
     * Resets particles to the initial state of a water column.
     */
    public resetParticlesToWaterColumn() {
        let numStackedParticles = Math.floor(this.particles.length / 10);
        let lastID = this.particles.length - numStackedParticles - 1;
        this.distributeParticles(this.bounds.xMin, this.bounds.xMax, 0, lastID);
        this.distributeParticles(0, 0.2, lastID + 1, this.particles.length - 1);

    }
    /**
     * Resets particles to the initial state of a dam break.
     */
    public resetParticlesToDamBreak() {

        let lastID = Math.floor(this.particles.length * 2 / 3) - 1;

        this.distributeParticles(this.bounds.xMin, 0.5, 0, lastID);
        this.distributeParticles(0.5, this.bounds.xMax, lastID + 1, this.particles.length - 1);
    }

    /**
     * Evenly distribute particles with IDs in [firstID, lastID] over domain [xMin, xMax].
     * Also sets the speed of the moved particles to 0.
     *
     * @param xMin          min x position
     * @param xMax          max x position
     * @param firstID       first particles ID
     * @param lastID        last particle ID
     */
    public distributeParticles(xMin : number, xMax : number, firstID : number, lastID : number) {
        if (firstID < 0) firstID = 0;
        if (lastID > this.particles.length) lastID = this.particles.length;
        let width = xMax - xMin;

        for (let i = firstID; i <= lastID; i++) {
            this.particles[i].posX = xMin + width  *  (i - firstID) / (lastID - firstID + 1);
            this.particles[i].speedX = 0;
        }
    }

    //endregion

    //region position & distance

    /**
     * Calculates the x distance between two given x positions. Cyclic field
     * is taken into account.
     * @param x1        first position
     * @param x2        second position
     * @returns {number}
     */
    public xDistCyclic(x1 : number, x2 : number) : number {

        let width = this.bounds.xMax - this.bounds.xMin;

        let distNormal = x1 - x2;
        let distCyclic;
        if (x1 < x2) {
            distCyclic = (x1 + width) - x2;
        } else {
            distCyclic = (x1 - width) - x2;
        }

        if (Math.abs(distNormal) < Math.abs(distCyclic)) {
            return distNormal;
        }
        return distCyclic;

    }

    /**
     * Check if x position is inside this domain.
     * If not, move x inside the domain (cyclic field).
     *
     * Note: will produce a valid position only if the
     * distance to the bounds of this domain is less than
     * the domain width (performance reasons).
     *
     * @param x             x position
     * @returns {number}    modified x position inside the domain
     */
    public mapXInsideDomainCyclic(x : number) : number {
        if (x > this.bounds.xMax) {
            x -= this.bounds.xMax - this.bounds.xMin;
        } else if (x < this.bounds.xMin) {
            x += this.bounds.xMax - this.bounds.xMin;
        }
        return x;
    }

    //endregion

    //region physics

    /**
     * Calculates the fluid height at specified x position.
     *
     * @param x                     position
     * @param smoothingLength       SPH smoothing length
     * @param particles             (optional) if not set, particles from this environment will be used
     * @returns {number}            fluid height at the position
     */
    public getFluidHeight(x : number, smoothingLength : number, particles? : Array<Particle>) : number {
        if (!particles) particles = this.particles;

        let height = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = this.xDistCyclic(x, particles[i].posX);
            height += SmoothingKernel.cubic1D(dist, smoothingLength);  // W
        }

        let pVolume = this.fluidVolume / particles.length;
        return height * pVolume;
    }


    /**
     * Calculates the fluid accX at specified x position.
     *
     * @param x                     position
     * @param smoothingLength       SPH smoothing length
     * @param particles             (optional) if not set, particles from this environment will be used
     * @returns {number}            fluid height at the position
     */
    public getFluidAcc(x : number, smoothingLength : number, particles? : Array<Particle>) : number {
        if (!particles) particles = this.particles;
        let acc = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = this.xDistCyclic(x, particles[i].posX);
            acc += SmoothingKernel.dCubic1D(dist, smoothingLength); // dW
        }

        let pVolume = this.fluidVolume / particles.length;
        return acc * pVolume * this.gravity;
    }

    //endregion


}