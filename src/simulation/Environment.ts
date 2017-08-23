import {Bounds} from "../util/Bounds";
import {Particle} from "./Particle";
import {SmoothingKernel} from "./SmoothingKernel";
import {CyclicBoundary} from "./boundary/CyclicBoundary";
import {Boundary} from "./boundary/Boundary";
import {SolidBoundary} from "./boundary/SolidBoundary";
import {GroundProfile} from "./ground/GroundProfile";
import {ConstLinearGround} from "./ground/ConstLinearGround";
import {ConstSineGround} from "./ground/ConstSineGround";
import {DynamicLinearGround} from "./ground/DynamicLinearGround";
import {DynamicSmoothingKernelGround} from "./ground/DynamicSmoothingKernelGround";
import {GroundPreset, BoundaryType, ParticleDistributionPreset} from "../util/Enums";

export class Environment {


	// read write
	private totalTime = 0;
	private smoothingLength : number;

	// read only
	private particleVolume : number;
	private gravity : number;
	private boundary : Boundary;
	private ground : GroundProfile;
    private particles : Array<Particle>;


    public constructor(numParticles : number, distribution : ParticleDistributionPreset, bounds : Bounds) {

		this.totalTime = 0;
		this.smoothingLength = 0.02;
		this.gravity = 9.81;

		this.boundary = new SolidBoundary(bounds);
		this.setGroundPreset(GroundPreset.DYN_SMOOTHING_KERNEL);

		// particles (numParticles + distribution) + volume
		this.particles = [];
		for (let i = 0; i < numParticles; i++) {
			this.particles[i] = new Particle();
		}
		this.setParticleDistributionFromPreset(distribution);
		this.setFluidVolume(2.5);

    }

    public copy() : Environment {
		let numPs = this.getParticles().length;
		let bounds = this.getBoundary();

		let env2 = new Environment(numPs, ParticleDistributionPreset.UNIFORM, bounds);
		env2.setTotalTime(this.getTotalTime());
		env2.setSmoothingLength(this.getSmoothingLength());
		env2.setParticleVolume(this.getParticleVolume());
		env2.setGravity(this.getGravity());
		env2.setBoundaryType(bounds.getType());
		env2.setGround(this.ground);

		return env2;
	}


	// smoothing length
	public getSmoothingLength() : number {
    	return this.smoothingLength;
	}
	public setSmoothingLength(smoothingLength : number) {
    	if (smoothingLength == this.smoothingLength) return;
    	if (smoothingLength <= 0) return;

    	this.smoothingLength = smoothingLength;
    	this.boundary.update(this);
	}

	// particles
	public getParticles() : Array<Particle> {
    	return this.particles;
	}


	// fluid volume
	public setFluidVolume(fluidVolume : number) {
    	this.particleVolume = fluidVolume / this.particles.length;
	}
	public getParticleVolume() {
    	return this.particleVolume;
	}
	public setParticleVolume(particleVolume : number) {
    	this.particleVolume = particleVolume;
	}


    // gravity
	public setGravity(gravity : number) {
		this.gravity = gravity;
	}
	public getGravity() : number {
		return this.gravity;
	};

	// total time
	public getTotalTime() : number {
		return this.totalTime;
	};
	public setTotalTime(newTime : number) {
		this.totalTime = newTime;
	}




	// ground
	public setGround(ground : GroundProfile) {
		this.ground = ground;
	}

	public setGroundPreset(preset : GroundPreset) {
		switch (preset) {
			case GroundPreset.CONST_ZERO:
				this.ground = new ConstLinearGround(0 /*slope*/, 0 /*yIntercept*/);
				break;

			case GroundPreset.CONST_SLOPE:
				this.ground = new ConstLinearGround(0.5 /*slope*/, 0 /*yIntercept*/);
				break;

			case GroundPreset.CONST_SINE:
				this.ground = new ConstSineGround(0.2 /*scale*/, 10 /*period*/, 0 /*phase*/);
				break;

			case GroundPreset.DYN_SLOPE:
				this.ground = new DynamicLinearGround( 0 /*yIntercept*/, 0.2 /*maxSlope*/, 4 /*slopeChangeSpeed*/);
				break;

			case GroundPreset.DYN_SMOOTHING_KERNEL:
				this.ground = new DynamicSmoothingKernelGround(0.75 /*maxScale*/, 3 /*growSpeed*/, 0.4 /*groundSmoothingLength*/);
				break;

			default:
				throw new Error("unknown ground preset");
		}
	}

	// boundary
	public setBoundaryType(type : BoundaryType) {
		if (type == BoundaryType.CYCLIC) {
			this.boundary = new CyclicBoundary(this.getBoundary());
			this.boundary.update(this);
		} else if (type == BoundaryType.SOLID) {
			this.boundary = new SolidBoundary(this.getBoundary());
			this.boundary.update(this);
		} else {
			console.log("invalid boundary type");
		}
	}
	public getBoundary() : Boundary {
		return this.boundary;
	}
	public updateBoundary() {
		this.boundary.update(this);
	}



	private setParticleDistributionFromPreset(distribution : ParticleDistributionPreset) {
		switch (distribution) {

			// Resets particles to the same water level.
			case ParticleDistributionPreset.UNIFORM:
				this.distributeParticles(this.boundary.xMin, this.boundary.xMax, 0, this.particles.length - 1);
				break;

			// Resets particles to the initial state of a dam break.
			case ParticleDistributionPreset.DAM_BREAK:
				let lastDamBreakID = Math.floor(this.particles.length * 2 / 3) - 1;
				this.distributeParticles(this.boundary.xMin, 0.5, 0, lastDamBreakID);
				this.distributeParticles(0.5, this.boundary.xMax, lastDamBreakID + 1, this.particles.length - 1);
				break;

			// Resets particles to the initial state of a water column.
			case ParticleDistributionPreset.WATER_DROP:
				let numStackedParticles = Math.floor(this.particles.length / 10);
				let lastWaterDropID = this.particles.length - numStackedParticles - 1;
				this.distributeParticles(this.boundary.xMin, this.boundary.xMax, 0, lastWaterDropID);
				this.distributeParticles(0, 0.2, lastWaterDropID + 1, this.particles.length - 1);
				break;

			default:
				throw new Error("Unknown particle distribution");
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
    private distributeParticles(xMin : number, xMax : number, firstID : number, lastID : number) {
        if (firstID < 0) firstID = 0;
        if (lastID > this.particles.length) lastID = this.particles.length;
        let width = xMax - xMin;

        for (let i = firstID; i <= lastID; i++) {
            this.particles[i].posX = xMin + width  *  (i + 0.5 - firstID) / (lastID - firstID + 1);
            this.particles[i].speedX = 0;
        }
    }







    //region physics

	public getGroundHeight(x : number) : number {
		return this.ground.getGroundHeight(x, this.totalTime);
	}
	public getGroundSlope(x : number) : number {
		return this.ground.getGroundSlope(x, this.totalTime);
	}

    /**
     * Calculates the fluid height at specified x position.
     * Fluid height is not affected by ground height.
	 *
     * @param x                     position
     * @returns {number}            fluid height at the position
     */
    public getFluidHeight(x : number) : number {
        let particles = this.particles;

        let height = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = x - particles[i].posX;
            height += SmoothingKernel.cubic1D(dist, this.smoothingLength);  // W
        }
        // boundaries
        if (this.boundary.isInsideLeftInnerBoundary(x, this.smoothingLength) ) {
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

    public getFluidHeightForSpecificSmoothingLength(x : number, newSmoothingLength : number) : number {
    	let previousSmoothingLength = this.smoothingLength;
    	this.setSmoothingLength(newSmoothingLength);
    	let height = this.getFluidHeight(x);
    	this.setSmoothingLength(previousSmoothingLength);
		return height;
	}


    /**
     * Calculates the fluid accX at specified x position.
     *
     * @param x                     position
     * @returns {number}            fluid height at the position
     */
    public getFluidAcc(x : number) : number {
        let particles = this.particles;
        let acc = 0;

        for (let i = 0; i < particles.length; i++) {
            let dist = x - particles[i].posX;
            acc += SmoothingKernel.dCubic1D(dist, this.smoothingLength); // dW
        }
		// boundaries
		if (this.boundary.isInsideLeftInnerBoundary(x, this.smoothingLength) ) {
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
