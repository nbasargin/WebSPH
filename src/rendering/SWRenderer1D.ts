import {GLCanvas} from "./glUtil/GLCanvas";
import {SWEnvironment1D} from "../simulation/SWEnvironment1D";
import {GLBuffer} from "./glUtil/GLBuffer";
import {GLMatrixStack} from "./glUtil/GLMatrixStack";
import {GLProgram} from "./glUtil/GLProgram";
import {ShaderLoader} from "./ShaderLoader";
import {Coloring} from "./Coloring";
import {AnalyticalDamBreak} from "../simulation/validation/AnalyticalDamBreak";

/**
 * Renders the state of the environment to the canvas.
 */
export class SWRenderer1D {

    // environment
    public env : SWEnvironment1D;

    // drawing options
    private drawParticles = true;
    private drawWaterHeight = true;
    private drawBaseSquare = false;
    public visualizationSmoothingLength = 0.03;
    private waterHeightSamples = 500;
    private validationSamples = 1000;

    // buffers
    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;
    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;
    private glWaterHeightPosBuffer : GLBuffer;
    private glWaterHeightColBuffer : GLBuffer;
    private glDamBreakValidationPosBuffer : GLBuffer;
    private glDamBreakValidationColBuffer : GLBuffer;

    // gl stuff
    public mvMatrix : GLMatrixStack;
    public pMatrix : GLMatrixStack;
    public glCanvas : GLCanvas;
    private glProgram : GLProgram;


    public constructor(glCanvas : GLCanvas, env : SWEnvironment1D) {
        this.glCanvas = glCanvas;
        this.env = env;

        this.initShaders();
        this.initMatrices();
        this.initParticleBuffers();
        this.initBorderLines();
        this.initWaterHeightBuffers();
        this.initDamBreakValidationBuffers();
    }

    private initShaders() {
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glProgram = new GLProgram(this.glCanvas.gl, vertShaderSrc, fragShaderSrc);
        this.glProgram.use();
        this.glProgram.enableVertexAttribArray("aVertexPosition");
        this.glProgram.enableVertexAttribArray("aVertexColor");
    }

    private initMatrices() {
        this.mvMatrix = new GLMatrixStack(this.glCanvas.gl, this.glProgram.getUnifLoc("uMVMatrix"));
        this.pMatrix = new GLMatrixStack(this.glCanvas.gl, this.glProgram.getUnifLoc("uPMatrix"));
    }

    private initParticleBuffers() {
        let particlePosXY = new Float32Array(this.env.particles.length * 2);
        let particleColRGBA = new Float32Array(this.env.particles.length * 4);
        this.glParticlePosBuffer = new GLBuffer(this.glCanvas.gl, particlePosXY, 2);
        this.glParticleColBuffer = new GLBuffer(this.glCanvas.gl, particleColRGBA, 4);
    }

    private initWaterHeightBuffers() {
        let bounds = this.env.bounds;
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

    private initDamBreakValidationBuffers() {
        let bounds = this.env.bounds;
        // position
        let validationPosXY = new Float32Array(this.validationSamples * 2);
        for (let i = 0; i < this.validationSamples; i++) {
            let x = bounds.xMin + (bounds.xMax - bounds.xMin) * i / (this.validationSamples - 1);
            validationPosXY[i*2    ] = x;
            validationPosXY[i*2 + 1] = 0; // y
        }
        this.glDamBreakValidationPosBuffer = new GLBuffer(this.glCanvas.gl, validationPosXY, 2);
        // color
        let validationColorRGBA = new Float32Array(this.validationSamples * 4);
        for (let i = 0; i < this.validationSamples; i++) {
            validationColorRGBA[i*4    ] = 1; // r
            validationColorRGBA[i*4 + 1] = 1; // g
            validationColorRGBA[i*4 + 2] = 0; // b
            validationColorRGBA[i*4 + 3] = 1; // a
        }
        this.glDamBreakValidationColBuffer = new GLBuffer(this.glCanvas.gl, validationColorRGBA, 4);


    }

    private initBorderLines() {
        let lines = [];
        lines = lines.concat([0,0,  1,0]); // y = 0
        lines = lines.concat([0,1,  1,1]); // y = 1
        lines = lines.concat([0,0,  0,1]); // x = 0
        lines = lines.concat([1,0,  1,1]); // x = 1
        let colors = [];
        this.glLinePosBuffer = new GLBuffer(this.glCanvas.gl, new Float32Array(lines), 2);
        for (let i = 0; i < this.glLinePosBuffer.numItems; i++) colors = colors.concat([1,1,1,1]);
        this.glLineColBuffer = new GLBuffer(this.glCanvas.gl, new Float32Array(colors), 4);
    }



    /**
     * Transfer position & color to the GPU
     */
    private updateParticleBuffers() {
        let particles = this.env.particles;

        Coloring.speedColoring(particles);

        let particlePosXY = this.glParticlePosBuffer.getData();
        let particleColRGBA = this.glParticleColBuffer.getData();

        for (let i = 0; i < particles.length; i++) {
            // position
            particlePosXY[i*2]   = particles[i].posX;
            particlePosXY[i*2+1] = particles[i].posY;

            // color
            particleColRGBA[i*4]   = particles[i].color[0];
            particleColRGBA[i*4+1] = particles[i].color[1];
            particleColRGBA[i*4+2] = particles[i].color[2];
            particleColRGBA[i*4+3] = particles[i].color[3];
        }

        this.glParticlePosBuffer.flushData(); //setData(particlePosXY, 2);
        this.glParticleColBuffer.flushData(); //setData(particleColRGBA, 4);

    }

    private updateWaterHeightBuffers() {
        let waterHeightPosXY = this.glWaterHeightPosBuffer.getData();
        // update water height
        for (let i = 0; i < this.waterHeightSamples; i++) {
            let x = waterHeightPosXY[i * 4]; // x ground
            let height = this.env.getFluidHeight(x, this.visualizationSmoothingLength, this.env.particles);
            waterHeightPosXY[i * 4 + 3] = height; // y water
        }
        this.glWaterHeightPosBuffer.flushData();
    }

    private updateDamBreakValidation() {
        let t = this.env.totalTime;
        let validator = new AnalyticalDamBreak(9.81);
        let validationPosXY = this.glDamBreakValidationPosBuffer.getData();
        for (let i = 0; i < this.validationSamples; i++) {
            let x = validationPosXY[i*2]; // x
            validationPosXY[i*2 + 1] = validator.h(x, t);
        }
        this.glDamBreakValidationPosBuffer.flushData();
    }


    public setPointSize(size : number) {
        this.drawParticles = (size >= 1);
        let uPointSizeLoc = this.glProgram.getUnifLoc("uPointSize");
        this.glCanvas.gl.uniform1f(uPointSizeLoc, size);
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

            this.updateParticleBuffers();

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

            this.updateWaterHeightBuffers();

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

        // validation
        gl.clear(gl.DEPTH_BUFFER_BIT);
        this.updateDamBreakValidation();
        // pos
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glDamBreakValidationPosBuffer.buffer);
        gl.vertexAttribPointer(vertexPositionAttribute, this.glDamBreakValidationPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // color
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glDamBreakValidationColBuffer.buffer);
        gl.vertexAttribPointer(vertexColorAttribute, this.glDamBreakValidationColBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // matrix setup + draw
        pMatrix.updateUniform();
        mvMatrix.updateUniform();
        gl.drawArrays(gl.LINE_STRIP, 0, this.glDamBreakValidationPosBuffer.numItems);


    }




}