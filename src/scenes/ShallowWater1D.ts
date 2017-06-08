import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {Particle} from "../sph/Particle";
import {GLBuffer} from "../util/GLBuffer";
import {ShaderLoader} from "../util/ShaderLoader";
import {SmoothingKernel} from "../sph/SmoothingKernel";
import {Coloring} from "../util/Coloring";

export class ShallowWater1D extends Scene {

    // global simulation vars
    private numParticles = 500;
    public dt = 0.001;
    public smoothingLength = 0.03;

    // drawing options
    private drawParticles = true;
    private drawWaterHeight = true;

    // particles
    private particles : Array<Particle>;

    private particlePosXY : Float32Array;
    private particleColRGBA : Float32Array;

    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;

    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;

    // water height
    private waterHeightSamples = 300;
    private waterHeightPosXY : Float32Array;
    private waterHeightColRGBA : Float32Array;
    private glWaterHeightPosBuffer : GLBuffer;
    private glWaterHeightColBuffer : GLBuffer;


    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // generate particles
        let stackedParticles = this.numParticles / 10;
        let bounds = this.getOrthographicBounds();
        this.particles = this.genParticles(this.numParticles - stackedParticles, bounds.xMin, bounds.xMax);
        this.particles = this.particles.concat(this.genParticles(stackedParticles, 0, 0.2));

        if (this.drawParticles) {// (empty) buffers
            this.particlePosXY = new Float32Array(this.numParticles * 2);
            this.particleColRGBA = new Float32Array(this.numParticles * 4);
            this.glParticlePosBuffer = new GLBuffer(this.glContext.gl, this.particlePosXY, 2);
            this.glParticleColBuffer = new GLBuffer(this.glContext.gl, this.particleColRGBA, 4);
        }

        // border lines
        let lines = [];
        lines = lines.concat([0,0,  1,0]); // y = 0
        lines = lines.concat([0,1,  1,1]); // y = 1
        lines = lines.concat([0,0,  0,1]); // x = 0
        lines = lines.concat([1,0,  1,1]); // x = 1
        let colors = [];
        this.glLinePosBuffer = new GLBuffer(this.glContext.gl, new Float32Array(lines), 2);
        for (let i = 0; i < this.glLinePosBuffer.numItems; i++) colors = colors.concat([1,1,1,1]);
        this.glLineColBuffer = new GLBuffer(this.glContext.gl, new Float32Array(colors), 4);

        // water height
        if (this.drawWaterHeight) {
            // position
            let bounds = this.getOrthographicBounds();
            this.waterHeightPosXY = new Float32Array(this.waterHeightSamples * 4); // (x,y) ground; (x,y) water
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / (this.waterHeightSamples - 1);
                this.waterHeightPosXY[i*4    ] = x;             // x ground
                this.waterHeightPosXY[i*4 + 1] = bounds.yMin;   // y ground
                this.waterHeightPosXY[i*4 + 2] = x;             // x water
                this.waterHeightPosXY[i*4 + 3] = 0;             // y water
            }
            this.glWaterHeightPosBuffer = new GLBuffer(this.glContext.gl, this.waterHeightPosXY, 2);

            // color (constant color)
            this.waterHeightColRGBA = new Float32Array(this.waterHeightSamples * 8); // 2 points x 4 color values
            for (let i = 0; i < this.waterHeightColRGBA.length / 4; i++) {
                this.waterHeightColRGBA[i*4    ] = 0; // r
                this.waterHeightColRGBA[i*4 + 1] = 0; // g
                this.waterHeightColRGBA[i*4 + 2] = 1; // b
                this.waterHeightColRGBA[i*4 + 3] = 1; // a
            }
            this.glWaterHeightColBuffer = new GLBuffer(this.glContext.gl, this.waterHeightColRGBA, 4);
        }
    }


    /**
     * Generates particles: x pos is evenly spread over the domain (start to end)
     * @param numParticles
     * @param start         start of the domain
     * @param end           end of the domain
     */
    private genParticles(numParticles : number, start : number, end : number) : Array<Particle> {
        let particles = [];

        for (let i = 0; i < numParticles; i++) {
            let p = new Particle();
            // x = min + width * ratio
            let x = start + (end - start) * (i / numParticles);
            p.pos = [x, 0, 0];
            particles[i] = p;
        }
        return particles;
    }


    /**
     * Transfer position & color to the GPU
     */
    private updateBuffers() {

        if (this.drawParticles) {
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


        if (this.drawWaterHeight) {
            this.glWaterHeightPosBuffer.updateData(this.waterHeightPosXY, 2);
        }
    }

    /**
     * Calculates the x distance between particles i and j. Cyclic field
     * is taken into account.
     * @param i  id of the first particle
     * @param j  id of the second particle
     * @returns {number}
     */
    private xDistBetween(i : number, j : number) : number {
        let pix = this.particles[i].pos[0];
        let pjx = this.particles[j].pos[0];

        return this.xDist(pix, pjx);
    }


    /**
     * Calculates the x distance between two given x positions. Cyclic field
     * is taken into account.
     * @param x1        first position
     * @param x2        second position
     * @returns {number}
     */
    private xDist(x1 : number, x2 : number) : number {

        let bounds = this.getOrthographicBounds();
        let fieldWidth = bounds.xMax - bounds.xMin;

        let distNormal = x1 - x2;
        let distCyclic;
        if (x1 < x2) {
            distCyclic = (x1 + fieldWidth) - x2;
        } else {
            distCyclic = (x1 - fieldWidth) - x2;
        }

        if (Math.abs(distNormal) < Math.abs(distCyclic)) {
            return distNormal;
        }
        return distCyclic;

    }


    public update(dt: number): void {

        // fixed timestep
        dt = this.dt;
        let VOLUME = 1 / this.numParticles; // constant volume
        let smoothingLength = this.smoothingLength;

        // Solving the Shallow Water equations using 2D SPH particles for interactive applications
        // Hyokwang Lee · Soonhung Han
        // original order:  Integration -> Height approximation -> Force computation
        // new order:       Height approximation -> Force computation -> Integration

        /*
         Height approximation determines the height of particles
         by (13). The z value of each particle is updated with the
         vertical motion of particles in z direction. As a result, the
         particles are positioned on the water surface.

         (13): h_i = sum (j = 1 to N) { V_j * W_ij }
         with   Vj = volume of j = const.
                Wij = Smoothing kernel
         */
        // Height approximation
        // !! the height HERE is Y = pos[1] !!
        if (this.drawParticles) {
            for (let i = 0; i < this.numParticles; i++) {
                let pi = this.particles[i];
                pi.pos[1] = 0;

                for (let j = 0; j < this.numParticles; j++) {
                    let dist = this.xDistBetween(i, j);
                    let W = SmoothingKernel.cubic1D(dist, smoothingLength);
                    pi.pos[1] += VOLUME * W;
                }
            }
        }

        // update water height
        if (this.drawWaterHeight) {
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = this.waterHeightPosXY[i*4]; // x ground
                this.waterHeightPosXY[i*4 + 3] = 0; // y water
                for (let j = 0; j < this.particles.length; j++) {
                    let xp = this.particles[j].pos[0];
                    let dist = this.xDist(x, xp);
                    let W = SmoothingKernel.cubic1D(dist, smoothingLength);
                    this.waterHeightPosXY[i*4 + 3] += VOLUME * W; // y water
                }

            }

        }



        /*
         Force computation computes the force interaction between
         particles where the pressure is determined by (20).

         (20): D u_i / D t = - g * sum (j = 1 to N) {V_j * NABLA W_ij}
         with   g = gravitational acceleration
                NABLA W_ij = derivative of the smoothing kernel
                D u_i / D t = acceleration
         */

        // Acceleration computation
        let g = 9.81;
        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];
            pi.acceleration = 0;
            for (let j = 0; j < this.numParticles; j++) {
                let dist = this.xDistBetween(i, j);
                let dW = SmoothingKernel.dCubic1D(dist, smoothingLength);
                pi.acceleration += g * VOLUME * dW;
            }
        }




        /*
         Integration updates the particle’s velocity and position,
         and moves the particle on the x line. The velocity is updated
         with the pressure and viscous force computed at the
         previous step, and the position is updated with the new
         velocity.
        */

        //Integration
        let bounds = this.getOrthographicBounds();
        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];
            // explicit euler
            // speed
            pi.speed[0] += pi.acceleration * dt;
            // position
            let newPos = pi.pos[0] + pi.speed[0] * dt;
            if (newPos > bounds.xMax) newPos -= bounds.xMax - bounds.xMin;
            if (newPos < bounds.xMin) newPos += bounds.xMax - bounds.xMin;
            this.particles[i].pos[0] = newPos;
        }

        if (this.drawParticles) {
            Coloring.speedColoring(this.particles);
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
        if (this.drawParticles) {
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


        // draw water level
        if (this.drawWaterHeight) {
            // positions
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glWaterHeightPosBuffer.buffer);
            gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.glWaterHeightPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // colors
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glWaterHeightColBuffer.buffer);
            gl.vertexAttribPointer(this.glContext.vertexColorAttribute, this.glWaterHeightColBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // matrix setup + draw
            this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.glWaterHeightPosBuffer.numItems);
        }

    }


}