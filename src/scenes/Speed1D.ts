import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {Particle} from "../sph/Particle";
import {GLBuffer} from "../util/GLBuffer";
import {ShaderLoader} from "../util/ShaderLoader";
import {SmoothingKernel} from "../sph/SmoothingKernel";

export class Speed1D extends Scene {

    private numParticles = 100;
    private particles : Array<Particle>;

    private particlePosXY : Float32Array;
    private particleColRGBA : Float32Array;

    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;

    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        this.genParticles(this.numParticles);
        this.particles[0].speed[0] = 0.03;


        // (empty) buffers
        this.particlePosXY = new Float32Array(this.numParticles * 2);
        this.particleColRGBA = new Float32Array(this.numParticles * 4);
        this.glParticlePosBuffer = new GLBuffer(this.glContext.gl, this.particlePosXY, 2);
        this.glParticleColBuffer = new GLBuffer(this.glContext.gl, this.particleColRGBA, 4);

    }

    private genParticles(numParticles : number) {
        let bounds = this.getOrthographicBounds();
        this.particles = [];

        for (let i = 0; i < numParticles; i++) {
            let p = new Particle();

            // x = min + width * ratio
            let x = bounds.xMin + (bounds.xMax - bounds.xMin) * ((i+0.5) / numParticles);
            let y = 0;// 0.2 * ((i+0.5) / numParticles - 0.5);
            p.pos = [x, y, 0];

            // color
            p.color = [Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2, 1]; // alpha: 1 = opaque; 0 = transparent

            this.particles[i] = p;
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

    public update(dt: number): void {
        //dt = Math.min(20, dt); // dt will be at most 20 ms
        dt = 0.001; // use fixed timestep

        // update SPEED
        for (let i = 0; i < this.numParticles; i++) {
            let pi = this.particles[i];

            for (let j = i+1; j < this.numParticles; j++) {
                let pj = this.particles[j];

                let dist = this.distBetweenParticles(i, j);

                let W = SmoothingKernel.cubic(dist, 0.1);

                let V = 0.4; // volume = mass/density

                pi.speedNew[0] += pj.speed[0] * W * V;
                pj.speedNew[0] += pi.speed[0] * W * V;

            }
        }
        // set new speed as speed
        let maxSpeed = Number.MIN_VALUE;
        let minSpeed = Number.MAX_VALUE;
        for (let i = 0; i < this.numParticles; i++) {
            this.particles[i].speed[0] = this.particles[i].speedNew[0];
            this.particles[i].speedNew[0] = 0;

            maxSpeed = Math.max(maxSpeed, this.particles[i].speed[0]);
            minSpeed = Math.min(minSpeed, this.particles[i].speed[0]);
        }

        // update COLOR
        let speedDiff = maxSpeed - minSpeed;
        if (speedDiff > 0) {
            for (let i = 0; i < this.numParticles; i++) {
                let speed = this.particles[i].speed[0];
                let col = (speed - minSpeed) / speedDiff;
                this.particles[i].color = [col,col,col,1];
            }
        } else {
            for (let i = 0; i < this.numParticles; i++) {
                this.particles[i].color = [0,0,0,1];
            }
        }

        // update POSITION
        let bounds = this.getOrthographicBounds();
        for (let i = 0; i < this.numParticles; i++) {
            let newPos = this.particles[i].pos[0] + this.particles[i].speed[0] * dt;
            if (newPos > bounds.xMax) newPos -= bounds.xMax - bounds.xMin;
            if (newPos < bounds.xMin) newPos += bounds.xMax - bounds.xMin;
            this.particles[i].pos[0] = newPos;
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