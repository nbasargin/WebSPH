import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {ShaderLoader} from "../util/ShaderLoader";
import {Particle} from "../sph/Particle";
import {GLBuffer} from "../util/GLBuffer";

/**
 * Scene containing interacting particles.
 */
export class InteractingParticles extends Scene {

    private numParticles = 500;
    private particles : Array<Particle>;

    private particlePosXY : Float32Array;
    private particleColRGBA : Float32Array;

    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;



    public constructor(glContext: GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // particles
        this.genParticles(this.numParticles);

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

            // pos
            let x = bounds.xMax * (Math.random() * 2 - 1) / 2;
            let y = bounds.yMax * (Math.random() * 2 - 1) / 2;
            let z = 0;
            p.pos = [x, y, z];

            // color
            let r = Math.random();
            let g = Math.random();
            let b = Math.random();
            let a = 1.0; // alpha: 1 = opaque; 0 = transparent
            p.color = [r, g, b, a];

            this.particles.push(p);
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

    public update(dt: number): void {
        dt = Math.min(20, dt); // dt will be at most 20 ms

        let bounds = this.getOrthographicBounds();

        // update SPEED of each particle
        for (let i = 0; i < this.numParticles; i++) {
            let xi = this.particles[i].pos[0];
            let yi = this.particles[i].pos[1];

            this.particles[i].speed[1] -= 1; // gravity

            for (let j = i + 1; j < this.numParticles; j++) {
                let xj = this.particles[j].pos[0];
                let yj = this.particles[j].pos[1];

                let distx = xi - xj;
                let disty = yi - yj;
                let dist2 = distx * distx + disty * disty;

                if (dist2 == 0) dist2 = 1E-20; // prevent division by 0

                // speed of particle i
                this.particles[i].speed[0] += 0.001 * Math.sign(distx) / dist2;
                this.particles[i].speed[1] += 0.001 * Math.sign(disty) / dist2;

                // speed of particle j
                this.particles[j].speed[0] -= 0.001 * Math.sign(distx) / dist2;
                this.particles[j].speed[1] -= 0.001 * Math.sign(disty) / dist2;

            }

        }

        // update POSITION of each particle
        // field is cyclic
        for (let i = 0; i < this.numParticles; i++) {
            let xi = this.particles[i].pos[0];
            let yi = this.particles[i].pos[1];

            // speed damping
            this.particles[i].speed[0] *= 0.95;
            this.particles[i].speed[1] *= 0.95;

            xi += this.particles[i].speed[0] * dt * 0.00001;
            yi += this.particles[i].speed[1] * dt * 0.00001;

            if (xi > bounds.xMax) xi = bounds.xMax; //bounds.xMin + (xi-bounds.xMax);
            if (yi > bounds.yMax) yi = bounds.yMax; //bounds.yMin + (yi-bounds.yMax);
            if (xi < bounds.xMin) xi = bounds.xMin; //bounds.xMax - (bounds.xMin - xi);
            if (yi < bounds.yMin) yi = bounds.yMin; //bounds.yMax - (bounds.yMin - yi);

            this.particles[i].pos[0] = xi;
            this.particles[i].pos[1] = yi;
        }

        this.updateBuffers();

    }

    public render(): void {
        let gl = this.glContext.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        this.setOrthographicProjection(-1, 1);

        gl.clearColor(1.0, 0.5, 0.2, 1.0);
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