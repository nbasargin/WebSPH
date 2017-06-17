import {GLBuffer} from "./GLBuffer";
import {Environment1D} from "../simulation/Environment";
import {IntegratorHeun2} from "../simulation/integrator/IntegratorHeun";
import {IntegratorEuler2} from "../simulation/integrator/IntegratorEuler";
import {ShaderLoader} from "./ShaderLoader";
import {Bounds} from "../util/Bounds";
import {Coloring} from "./Coloring";
import {GLMatrixStack} from "./GLMatrixStack";
import {GLCanvas} from "./GLCanvas";
import {GLProgram} from "./GLProgram";

export class ShallowWater1D {

    // global simulation vars
    private numParticles = 500;
    public dt = 0.001;
    public smoothingLength = 0.03;
    public visualizationSmoothingLength = 0.03;
    public useHeun = true;

    // drawing options
    private drawParticles = true;
    private drawWaterHeight = true;
    private drawBaseSquare = true;

    // particle buffers
    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;
    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;

    // water height
    private waterHeightSamples = 500;
    private glWaterHeightPosBuffer : GLBuffer;
    private glWaterHeightColBuffer : GLBuffer;


    private env : Environment1D;
    private heun : IntegratorHeun2;
    private euler : IntegratorEuler2;


    // REFACTORING

    public mvMatrix : GLMatrixStack;
    public pMatrix : GLMatrixStack;

    private glCanvas : GLCanvas;
    private glProgram : GLProgram;


    public constructor(glCanvas : GLCanvas) {
        this.glCanvas = glCanvas;

        let bounds : Bounds = glCanvas.getOrthographicBounds();

        this.env = new Environment1D(this.numParticles, bounds, 1, 9.81);
        this.euler = new IntegratorEuler2(this.env);
        this.heun = new IntegratorHeun2(this.env);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glProgram = new GLProgram(glCanvas.gl, vertShaderSrc, fragShaderSrc);
        this.glProgram.use();
        this.glProgram.enableVertexAttribArray("aVertexPosition");
        this.glProgram.enableVertexAttribArray("aVertexColor");


        // matrices
        this.mvMatrix = new GLMatrixStack(glCanvas.gl, this.glProgram.getUnifLoc("uMVMatrix"));
        this.pMatrix = new GLMatrixStack(glCanvas.gl, this.glProgram.getUnifLoc("uPMatrix"));


        // particle buffers
        if (this.drawParticles) {// (empty) buffers
            let particlePosXY = new Float32Array(this.numParticles * 2);
            let particleColRGBA = new Float32Array(this.numParticles * 4);
            this.glParticlePosBuffer = new GLBuffer(this.glCanvas.gl, particlePosXY, 2);
            this.glParticleColBuffer = new GLBuffer(this.glCanvas.gl, particleColRGBA, 4);
        }

        // border lines
        let lines = [];
        lines = lines.concat([0,0,  1,0]); // y = 0
        lines = lines.concat([0,1,  1,1]); // y = 1
        lines = lines.concat([0,0,  0,1]); // x = 0
        lines = lines.concat([1,0,  1,1]); // x = 1
        let colors = [];
        this.glLinePosBuffer = new GLBuffer(this.glCanvas.gl, new Float32Array(lines), 2);
        for (let i = 0; i < this.glLinePosBuffer.numItems; i++) colors = colors.concat([1,1,1,1]);
        this.glLineColBuffer = new GLBuffer(this.glCanvas.gl, new Float32Array(colors), 4);

        // water height
        if (this.drawWaterHeight) {
            // position
            let waterHeightPosXY = new Float32Array(this.waterHeightSamples * 4); // (x,y) ground; (x,y) water
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / (this.waterHeightSamples - 1);
                waterHeightPosXY[i*4    ] = x;             // x ground
                waterHeightPosXY[i*4 + 1] = bounds.yMin;   // y ground
                waterHeightPosXY[i*4 + 2] = x;             // x water
                waterHeightPosXY[i*4 + 3] = 0;             // y water
            }
            this.glWaterHeightPosBuffer = new GLBuffer(this.glCanvas.gl, waterHeightPosXY, 2);

            // color (constant color)
            let waterHeightColRGBA = new Float32Array(this.waterHeightSamples * 8); // 2 points x 4 color values
            for (let i = 0; i < waterHeightColRGBA.length / 4; i++) {
                waterHeightColRGBA[i*4    ] = 0; // r
                waterHeightColRGBA[i*4 + 1] = 0; // g
                waterHeightColRGBA[i*4 + 2] = 1; // b
                waterHeightColRGBA[i*4 + 3] = 1; // a
            }
            this.glWaterHeightColBuffer = new GLBuffer(this.glCanvas.gl, waterHeightColRGBA, 4);
        }


    }


    /**
     * Transfer position & color to the GPU
     */
    private updateParticleBuffers() {
        let particlePosXY = this.glParticlePosBuffer.getData();
        let particleColRGBA = this.glParticleColBuffer.getData();

        if (this.drawParticles) {
            for (let i = 0; i < this.numParticles; i++) {
                // position
                particlePosXY[i*2]   = this.env.particles[i].pos[0];
                particlePosXY[i*2+1] = this.env.particles[i].pos[1];

                // color
                particleColRGBA[i*4]   = this.env.particles[i].color[0];
                particleColRGBA[i*4+1] = this.env.particles[i].color[1];
                particleColRGBA[i*4+2] = this.env.particles[i].color[2];
                particleColRGBA[i*4+3] = this.env.particles[i].color[3];
            }
            this.glParticlePosBuffer.setData(particlePosXY, 2);
            this.glParticleColBuffer.setData(particleColRGBA, 4);
        }

    }


    public update(dt: number): void {
        // fixed timestep
        dt = this.dt;
        if (this.useHeun) {
            this.heun.integrate(dt, this.smoothingLength);
        } else {
            this.euler.integrate(dt, this.smoothingLength);
        }

        if (this.drawParticles) {
            Coloring.speedColoring(this.env.particles);
        }
        if (this.drawWaterHeight) {
            let waterHeightPosXY = this.glWaterHeightPosBuffer.getData();
            // update water height
            for (let i = 0; i < this.waterHeightSamples; i++) {
                let x = waterHeightPosXY[i * 4]; // x ground
                let height = this.env.getFluidHeight(x, this.visualizationSmoothingLength, this.env.particles);
                waterHeightPosXY[i * 4 + 3] = height; // y water
            }
            this.glWaterHeightPosBuffer.flushData();
        }
        this.updateParticleBuffers();
    }

    public render(): void {
        let gl = this.glCanvas.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        pMatrix.setOrthographicProjection(this.glCanvas, -1, 1);

        gl.clearColor(0.5, 0.7, 0.9, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, this.glCanvas.viewWidthPx(), this.glCanvas.viewHeightPx());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        let vertexPositionAttribute = this.glProgram.getAttrLoc("aVertexPosition");
        let vertexColorAttribute = this.glProgram.getAttrLoc("aVertexColor");

        // draw base square
        if (this.drawBaseSquare) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glLinePosBuffer.buffer);
            gl.vertexAttribPointer(vertexPositionAttribute, this.glLinePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glLineColBuffer.buffer);
            gl.vertexAttribPointer(vertexColorAttribute, this.glLineColBuffer.itemSize, gl.FLOAT, false, 0, 0);
            pMatrix.updateUniform();
            mvMatrix.updateUniform();
            gl.drawArrays(gl.LINES, 0, this.glLinePosBuffer.numItems);
        }


        // draw particles
        if (this.drawParticles) {
            mvMatrix.push();
            // positions
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glParticlePosBuffer.buffer);
            gl.vertexAttribPointer(vertexPositionAttribute, this.glParticlePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // colors
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glParticleColBuffer.buffer);
            gl.vertexAttribPointer(vertexColorAttribute, this.glParticleColBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // matrix setup + draw
            pMatrix.updateUniform();
            mvMatrix.updateUniform();
            gl.drawArrays(gl.POINTS, 0, this.glParticlePosBuffer.numItems);
            mvMatrix.pop();
        }


        // draw water level
        if (this.drawWaterHeight) {
            // positions
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glWaterHeightPosBuffer.buffer);
            gl.vertexAttribPointer(vertexPositionAttribute, this.glWaterHeightPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // colors
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glWaterHeightColBuffer.buffer);
            gl.vertexAttribPointer(vertexColorAttribute, this.glWaterHeightColBuffer.itemSize, gl.FLOAT, false, 0, 0);
            // matrix setup + draw
            pMatrix.updateUniform();
            mvMatrix.updateUniform();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.glWaterHeightPosBuffer.numItems);
        }
    }

}