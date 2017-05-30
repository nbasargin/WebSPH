import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {Particle} from "../sph/Particle";
import {GLBuffer} from "../util/GLBuffer";
import {ShaderLoader} from "../util/ShaderLoader";
import {SmoothingKernel} from "../sph/SmoothingKernel";

export class ShallowWater1D extends Scene {


    private numParticles = 100;
    private particles : Array<Particle>;

    private particlePosXY : Float32Array;
    private particleColRGBA : Float32Array;

    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;

    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;


    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // generate particles
        this.genParticles(this.numParticles);

        // (empty) buffers
        this.particlePosXY = new Float32Array(this.numParticles * 2);
        this.particleColRGBA = new Float32Array(this.numParticles * 4);
        this.glParticlePosBuffer = new GLBuffer(this.glContext.gl, this.particlePosXY, 2);
        this.glParticleColBuffer = new GLBuffer(this.glContext.gl, this.particleColRGBA, 4);

        // ground y = 0 line
        this.glLinePosBuffer = new GLBuffer(this.glContext.gl, new Float32Array([-100, 0,   100, 0]), 2);
        this.glLineColBuffer = new GLBuffer(this.glContext.gl, new Float32Array([0,0,0,1,  0,0,0,1]), 4);

    }


    /**
     * Generates particles: x pos is evenly spread over the domain; y pos forms a sin curve.
     * @param numParticles
     */
    private genParticles(numParticles : number) {
        let bounds = this.getOrthographicBounds();
        this.particles = [];

        for (let i = 0; i < numParticles; i++) {
            let p = new Particle();

            // x = min + width * ratio
            let x = bounds.xMin + (bounds.xMax - bounds.xMin) * ((i+0.5) / numParticles);
            let y = 0; // water height will be updated in each timestep
            p.pos = [x, y, 0];

            // color
            p.color = [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5, 1]; // alpha: 1 = opaque; 0 = transparent

            this.particles[i] = p;
        }

        // squeeze some particles

        let squeezeAreaSize = 20;
        let normalSpacing = (bounds.xMax - bounds.xMin) / numParticles;
        for (let i = 0; i < squeezeAreaSize; i++) {
            this.particles[numParticles/2 - squeezeAreaSize + i].pos[0] += i / (squeezeAreaSize) * normalSpacing;
            this.particles[numParticles/2 + squeezeAreaSize - i].pos[0] -= i / (squeezeAreaSize) * normalSpacing;
        }


    }


    /**
     * Transfer position & color to the GPU
     */
    private updateBuffers() {

        for (let i = 0; i < this.numParticles; i++) {
            // position
            this.particlePosXY[i*2]   = this.particles[i].pos[0];
            this.particlePosXY[i*2+1] = this.particles[i].pos[1];

            // color
            this.particleColRGBA[i*4]   = this.particles[i].color[0];
            this.particleColRGBA[i*4+1] = this.particles[i].color[1];
            this.particleColRGBA[i*4+2] = this.particles[i].color[2];
            this.particleColRGBA[i*4+3] = this.particles[i].color[3];
        }
        this.glParticlePosBuffer.updateData(this.particlePosXY, 2);
        this.glParticleColBuffer.updateData(this.particleColRGBA, 4);
    }

    /**
     * Calculates the x distance between particles i and j. Cyclic field
     * is taken into account.
     * @param i  id of the first particle
     * @param j  id of the second particle
     * @returns {number}
     */
    private distBetweenParticles(i : number, j : number) : number {
        let pi = this.particles[i];
        let pj = this.particles[j];

        let bounds = this.getOrthographicBounds();
        let fieldWidth = bounds.xMax - bounds.xMin;

        let distAbs = Math.abs(pi.pos[0] - pj.pos[0]);
        let distCyc;
        if (pi.pos[0] < pj.pos[0]) {
            distCyc = Math.abs(pi.pos[0] + fieldWidth - pj.pos[0]);
        } else {
            distCyc = Math.abs(pj.pos[0] + fieldWidth - pi.pos[0]);
        }

        return Math.min(distAbs, distCyc);
    }

    private speedColoring(useAbsSpeed : boolean) {
        // set new speed/density as speed/density
        let maxSpeed = Number.MIN_VALUE;
        let minSpeed = Number.MAX_VALUE;
        for (let i = 0; i < this.numParticles; i++) {
            let speed = this.particles[i].speed[0];
            if (useAbsSpeed) speed = Math.abs(speed);

            maxSpeed = Math.max(maxSpeed, speed);
            minSpeed = Math.min(minSpeed, speed);
        }

        // update COLOR based on speed
        let speedDiff = maxSpeed - minSpeed;
        if (speedDiff > 0) {
            for (let i = 0; i < this.numParticles; i++) {
                let speed = this.particles[i].speed[0];
                if (useAbsSpeed) {
                    speed = Math.abs(speed);
                }

                let col = (speed - minSpeed) / speedDiff;

                if (useAbsSpeed) {
                    // distinguish direction
                    if (this.particles[i].speed[0] > 0) {
                        this.particles[i].color = [col,0,0,1];
                    } else {
                        this.particles[i].color = [0,col,0,1];
                    }

                } else {
                    this.particles[i].color = [col,col,col,1];
                }
            }
        } else {
            for (let i = 0; i < this.numParticles; i++) {
                this.particles[i].color = [0,0,0,1];
            }
        }

    }


    public update(dt: number): void {

        // fixed timestep
        dt = 0.01;

        // Solving the Shallow Water equations using 2D SPH particles
        // for interactive applications      Hyokwang Lee · Soonhung Han
        // original order:  Integration -> Height approximation -> Force computation
        // new order:       Height approximation -> Force computation -> Integration

        let VOLUME = 1 / this.numParticles; // constant volume
        let smoothingLength = 0.1;

        //Height approximation
        /*
         Height approximation determines the height of particles
         by (13). The z value of each particle is updated with the
         vertical motion of particles in z direction. As a result, the
         particles are positioned on the water surface.

         (13): h_i = sum (j = 1 to N) { V_j * W_ij }
         with   Vj = volume of j = const.
                Wij = Smoothing kernel
         */

        // !! the height HERE is Y !!
        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];
            pi.pos[1] = 0;

            for (let j = 0; j < this.numParticles; j++) {
                if (i==j) continue;

                let dist = this.distBetweenParticles(i, j);
                let W = SmoothingKernel.cubic1D(dist, smoothingLength);
                pi.pos[1] += VOLUME * W;
            }
        }




        //Force computation
        /*
         Force computation computes the force interaction between
         particles where the pressure is determined by (20).

         (20): D u_i / D t = - g * sum (j = 1 to N) {V_j * NABLA W_ij}
         with   g = gravitational acceleration
                NABLA W_ij = derivative of the smoothing kernel
                D u_i / D t = acceleration
         */

        let g = 9.81;

        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];

            for (let j = 0; j < this.numParticles; j++) {
                if (i==j) continue;

                let pj = this.particles[j];

                let dist = this.distBetweenParticles(i, j);
                let W = SmoothingKernel.dCubic1D(dist, smoothingLength);

                let acc =  g * VOLUME * W;

                // determine acceleration direction (cyclic field)!!

                if (Math.abs(pi.pos[0] - pj.pos[0]) < 5 * smoothingLength) {
                    if (pi.pos[0] < pj.pos[0]) {
                        acc *= -1;
                    }
                } else {
                    // wrapping around
                    if (pi.pos[0] < pj.pos[0]) {
                        acc *= -1;
                    }
                }


                pi.speed[0] += acc * dt;
                pi.speed[0] *= 0.99; // stabilize
            }
        }

        this.speedColoring(true);



        //Integration
        /*
         Integration updates the particle’s velocity and position,
         and moves the particle on the x line. The velocity is updated
         with the pressure and viscous force computed at the
         previous time step, and the position is updated with the new
         velocity.
        */


        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];
            pi.pos[0] += pi.speed[0] * dt;
        }

        this.updateBuffers();
    }

    public render(): void {
        let gl = this.glContext.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        this.setOrthographicProjection(-1, 1);

        gl.clearColor(0.5, 0.7, 0.9, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, this.glContext.viewWidthPx(), this.glContext.viewHeightPx());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        // draw zero line
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glLinePosBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.glLinePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glLineColBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexColorAttribute, this.glLineColBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.LINES, 0, this.glLinePosBuffer.numItems);


        // draw particles
        mvMatrix.push();
        // positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glParticlePosBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.glParticlePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glParticleColBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexColorAttribute, this.glParticleColBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // matrix setup + draw
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.POINTS, 0, this.glParticlePosBuffer.numItems);
        mvMatrix.pop();

    }


}