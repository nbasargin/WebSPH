import {Scene} from "./Scene";
import {GLContext} from "../rendering/GLContext";
import {Particle} from "../simulation/Particle";
import {GLBuffer} from "../rendering/GLBuffer";
import {ShaderLoader} from "../rendering/ShaderLoader";
import {Coloring} from "../util/Coloring";
import {Domain} from "../simulation/Domain";
import {ShallowWaterPhysics1D} from "../simulation/ShallowWaterPhysics1D";
import {IntegratorEuler} from "../simulation/integrator/IntegratorEuler";
import {IntegratorHeun} from "../simulation/integrator/IntegratorHeun";

export class ShallowWater1D extends Scene {

    // global simulation vars
    private numParticles = 500;
    public dt = 0.001;
    public smoothingLength = 0.03;
    public visualizationSmoothingLength = 0.03;

    // drawing options
    private drawParticles = true;
    private drawWaterHeight = true;
    private drawBaseSquare = false;

    // particles
    private particles : Array<Particle>;
    private particleVolume : number;

    private particlePosXY : Float32Array;
    private particleColRGBA : Float32Array;

    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;

    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;

    // water height
    private waterHeightSamples = 500;
    private waterHeightPosXY : Float32Array;
    private waterHeightColRGBA : Float32Array;
    private glWaterHeightPosBuffer : GLBuffer;
    private glWaterHeightColBuffer : GLBuffer;


    // new physics
    private domain : Domain;
    private swPhysics : ShallowWaterPhysics1D;
    public useHeun = true;
    private integratorEuler : IntegratorEuler;
    private integratorHeun : IntegratorHeun;


    public constructor(glContext : GLContext) {
        super(glContext);

        this.particleVolume = 1 / this.numParticles;

        this.domain = new Domain(this.getOrthographicBounds());
        this.swPhysics = new ShallowWaterPhysics1D(this.domain);
        this.integratorEuler = new IntegratorEuler(this.swPhysics, this.particleVolume);
        this.integratorHeun = new IntegratorHeun(this.swPhysics, this.particleVolume, this.numParticles);



        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // generate particles
        let stackedParticles = this.numParticles / 10;
        let domain = this.domain;
        this.particles = this.genParticles(this.numParticles - stackedParticles, domain.xMin, domain.xMax);
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
            let domain = this.domain;
            this.waterHeightPosXY = new Float32Array(this.waterHeightSamples * 4); // (x,y) ground; (x,y) water
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = domain.xMin + (domain.xMax - domain.xMin) * i / (this.waterHeightSamples - 1);
                this.waterHeightPosXY[i*4    ] = x;             // x ground
                this.waterHeightPosXY[i*4 + 1] = domain.yMin;   // y ground
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


    public update(dt: number): void {

        console.log("using " + (this.useHeun ? "Heun" : "Euler"));

        // fixed timestep
        dt = this.dt;
        if (this.useHeun) {
            this.integratorHeun.integrate(this.particles, dt, this.smoothingLength);
        } else {
            this.integratorEuler.integrate(this.particles, dt, this.smoothingLength);
        }

        if (this.drawParticles) {
            Coloring.speedColoring(this.particles);
        }
        if (this.drawWaterHeight) {
            // update water height
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = this.waterHeightPosXY[i * 4]; // x ground
                let height = this.swPhysics.getWaterHeight(x, this.particles, this.visualizationSmoothingLength);
                this.waterHeightPosXY[i * 4 + 3] = this.particleVolume * height; // y water
            }
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


        // draw base square
        if (this.drawBaseSquare) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glLinePosBuffer.buffer);
            gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.glLinePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glLineColBuffer.buffer);
            gl.vertexAttribPointer(this.glContext.vertexColorAttribute, this.glLineColBuffer.itemSize, gl.FLOAT, false, 0, 0);
            this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
            gl.drawArrays(gl.LINES, 0, this.glLinePosBuffer.numItems);
        }


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