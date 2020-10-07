import { Bounds } from '../util/Bounds';
import { Defaults } from '../util/Defaults';
import { BoundaryType, ParticleDistribution } from '../util/Enums';
import { Boundary } from './boundary/Boundary';
import { CyclicBoundary } from './boundary/CyclicBoundary';
import { SolidBoundary } from './boundary/SolidBoundary';
import { GroundProfile } from './ground/GroundProfile';
import { Particle } from './Particle';
import { SimulationOptions } from './SimulationOptions';
import { SmoothingKernel } from './SmoothingKernel';

export class Environment {

    // read write
    private totalTime: number;
    private smoothingLength: number;

    // read only
    private particleVolume: number;
    private gravity: number;
    private boundary: Boundary;
    private boundarySize: Bounds;
    private ground: GroundProfile;
    private particles: Array<Particle>;


    public constructor(options: SimulationOptions) {

        this.totalTime = options.timeStart;
        this.smoothingLength = options.smoothingLength;
        this.gravity = options.gravity;
        this.boundarySize = options.boundarySize;

        // particles (numParticles + distribution) + volume
        this.particles = [];
        for (let i = 0; i < options.particleNumber; i++) {
            this.particles[i] = new Particle();
        }
        this.setBoundaryType(options.boundaryType);
        this.setGround(options.ground);

        this.setFluidVolume(options.fluidVolume);
        this.setParticleDistributionFromPreset(options.particleDistribution);

    }

    public copy(): Environment {

        let options = Defaults.getDefaultSimulationOptions();
        options.particleNumber = this.getParticles().length;
        options.boundaryType = this.getBoundary().getType();
        options.boundarySize = this.getBoundary();
        options.smoothingLength = this.getSmoothingLength();
        options.gravity = this.getGravity();
        options.timeStart = this.totalTime;

        let env2 = new Environment(options);
        env2.setParticleVolume(this.getParticleVolume());
        env2.setGround(this.ground);

        // checks
        if (!this.isEqualToEnvironment(env2)) {
            console.log('[!!] Copy environment failed!');
            console.log('me: ', this);
            console.log('copy: ', env2);
        }

        return env2;
    }

    private isEqualToEnvironment(env: Environment) {
        if (this.boundarySize.xMin != env.boundarySize.xMin) return false;
        if (this.boundarySize.xMax != env.boundarySize.xMax) return false;
        if (this.boundarySize.yMin != env.boundarySize.yMin) return false;
        if (this.boundarySize.yMax != env.boundarySize.yMax) return false;

        if (this.boundary.getType() != env.boundary.getType()) return false;
        if (this.particles.length != env.particles.length) return false;
        if (this.ground != env.ground) return false;
        if (this.totalTime != env.totalTime) return false;
        if (this.gravity != env.getGravity()) return false;
        if (this.particleVolume != env.particleVolume) return false;
        if (this.smoothingLength != env.smoothingLength) return false;

        // should be equal
        return true;
    }


    // smoothing length
    public getSmoothingLength(): number {
        return this.smoothingLength;
    }

    public setSmoothingLength(smoothingLength: number) {
        if (smoothingLength == this.smoothingLength) return;
        if (smoothingLength <= 0) return;

        this.smoothingLength = smoothingLength;
        this.boundary.update(this);
    }

    // particles
    public getParticles(): Array<Particle> {
        return this.particles;
    }


    // fluid volume
    public setFluidVolume(fluidVolume: number) {
        this.particleVolume = fluidVolume / this.particles.length;
    }

    public getParticleVolume() {
        return this.particleVolume;
    }

    public setParticleVolume(particleVolume: number) {
        this.particleVolume = particleVolume;
    }


    // gravity
    public setGravity(gravity: number) {
        this.gravity = gravity;
    }

    public getGravity(): number {
        return this.gravity;
    };

    // total time
    public getTotalTime(): number {
        return this.totalTime;
    };

    public setTotalTime(newTime: number) {
        this.totalTime = newTime;
    }


    // ground
    public setGround(ground: GroundProfile) {
        this.ground = ground;
    }

    // boundary
    public setBoundaryType(type: BoundaryType) {
        if (type == BoundaryType.CYCLIC) {
            this.boundary = new CyclicBoundary(this.boundarySize);
            this.boundary.update(this);
        } else if (type == BoundaryType.SOLID) {
            this.boundary = new SolidBoundary(this.boundarySize);
            this.boundary.update(this);
        } else {
            console.log('invalid boundary type');
        }
    }

    public getBoundary(): Boundary {
        return this.boundary;
    }

    public updateBoundary() {
        this.boundary.update(this);
    }


    private setParticleDistributionFromPreset(distribution: ParticleDistribution) {

        let b = this.boundarySize;

        switch (distribution) {

            // Resets particles to the same water level.
            case ParticleDistribution.UNIFORM:
                this.distributeParticles(b.xMin, b.xMax, 0, this.particles.length - 1);
                break;

            // Resets particles to the initial state of a dam break.
            case ParticleDistribution.DAM_BREAK_WET:
                let leftSpacePercentage = (0.5 - b.xMin) / (b.xMax - b.xMin);
                // 2 left / (2 left + 1 right)
                let leftMassPercentage = (leftSpacePercentage * 2) / (1 + leftSpacePercentage);
                let lastDamBreakID = Math.floor(this.particles.length * leftMassPercentage) - 1;
                // leftMassPercentage equals to 2 * (0.5 - b.xMin) / ((b.xMax - b.xMin) + (0.5 - b.xMin)) @see thesis
                this.distributeParticles(b.xMin, 0.5, 0, lastDamBreakID);
                this.distributeParticles(0.5, b.xMax, lastDamBreakID + 1, this.particles.length - 1);
                break;

            case ParticleDistribution.DAM_BREAK_DRY:
                this.distributeParticles(b.xMin, 0.5, 0, this.particles.length - 1);
                break;

            // Resets particles to the initial state of a water column.
            case ParticleDistribution.WATER_DROP:
                let numStackedParticles = Math.floor(this.particles.length / 3);
                let lastWaterDropID = this.particles.length - numStackedParticles - 1;
                this.distributeParticles(b.xMin, b.xMax, 0, lastWaterDropID);
                this.distributeParticles(0, 1, lastWaterDropID + 1, this.particles.length - 1);
                break;

            default:
                throw new Error('Unknown particle distribution');
        }

        this.boundary.update(this);
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
    private distributeParticles(xMin: number, xMax: number, firstID: number, lastID: number) {
        if (firstID < 0) firstID = 0;
        if (lastID > this.particles.length) lastID = this.particles.length;
        let width = xMax - xMin;

        for (let i = firstID; i <= lastID; i++) {
            this.particles[i].posX = xMin + width * (i + 0.5 - firstID) / (lastID - firstID + 1);
            this.particles[i].speedX = 0;
        }
    }


    //region physics

    public getGroundHeight(x: number): number {
        return this.ground.getGroundHeight(x, this.totalTime);
    }

    public getGroundSlope(x: number): number {
        return this.ground.getGroundSlope(x, this.totalTime);
    }

    /**
     * Calculates the fluid height at specified x position.
     * Fluid height is not affected by ground height.
     *
     * @param x                     position
     * @returns {number}            fluid height at the position
     */
    public getFluidHeight(x: number): number {
        let particles = this.particles;

        let height = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = x - particles[i].posX;
            height += SmoothingKernel.cubic1D(dist, this.smoothingLength);  // W
        }
        // boundaries
        if (this.boundary.isInsideLeftInnerBoundary(x, this.smoothingLength)) {
            let lps = this.boundary.particlesLeft;
            for (let i = 0; i < lps.length; i++) {
                let dist = x - lps[i].posX;
                height += SmoothingKernel.cubic1D(dist, this.smoothingLength);  // W
            }

        } else if (this.boundary.isInsideRightInnerBoundary(x, this.smoothingLength)) {
            let rps = this.boundary.particlesRight;
            for (let i = 0; i < rps.length; i++) {
                let dist = x - rps[i].posX;
                height += SmoothingKernel.cubic1D(dist, this.smoothingLength);  // W
            }
        }

        return height * this.particleVolume;
    }


    /**
     * Calculates the fluid accX at specified x position.
     *
     * @param x                     position
     * @returns {number}            fluid height at the position
     */
    public getFluidAcc(x: number): number {
        let particles = this.particles;
        let acc = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = x - particles[i].posX;
            acc += SmoothingKernel.dCubic1D(dist, this.smoothingLength); // dW
        }
        // boundaries
        if (this.boundary.isInsideLeftInnerBoundary(x, this.smoothingLength)) {
            let lps = this.boundary.particlesLeft;
            for (let i = 0; i < lps.length; i++) {
                let dist = x - lps[i].posX;
                acc += SmoothingKernel.dCubic1D(dist, this.smoothingLength);  // dW
            }
        } else if (this.boundary.isInsideRightInnerBoundary(x, this.smoothingLength)) {
            let rps = this.boundary.particlesRight;
            for (let i = 0; i < rps.length; i++) {
                let dist = x - rps[i].posX;
                acc += SmoothingKernel.dCubic1D(dist, this.smoothingLength);  // dW
            }
        }


        return acc * this.particleVolume * this.gravity - this.getGroundSlope(x) * this.gravity;
    }

    //endregion


}
