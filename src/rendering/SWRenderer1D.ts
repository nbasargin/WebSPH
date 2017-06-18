import {GLCanvas} from "./GLCanvas";
import {SWEnvironment1D} from "../simulation/SWEnvironment1D";
import {GLBuffer} from "./GLBuffer";
import {GLMatrixStack} from "./GLMatrixStack";
import {GLProgram} from "./GLProgram";
import {ShaderLoader} from "./ShaderLoader";
import {Coloring} from "./Coloring";

export class SWRenderer1D {

    // environment
    public env : SWEnvironment1D;

    // drawing options
    private drawParticles = true;
    private drawWaterHeight = true;
    private drawBaseSquare = true;
    public visualizationSmoothingLength = 0.03;
    private waterHeightSamples = 500;

    // buffers
    private glParticlePosBuffer : GLBuffer;
    private glParticleColBuffer : GLBuffer;
    private glLinePosBuffer : GLBuffer;
    private glLineColBuffer : GLBuffer;
    private glWaterHeightPosBuffer : GLBuffer;
    private glWaterHeightColBuffer : GLBuffer;

    // rendering
    public mvMatrix : GLMatrixStack;
    public pMatrix : GLMatrixStack;
    public glCanvas : GLCanvas;
    private glProgram : GLProgram;


    public constructor(glCanvas : GLCanvas, env : SWEnvironment1D) {
        this.glCanvas = glCanvas;
        this.env = env;

        this.initShaders();

        // matrices
        this.mvMatrix = new GLMatrixStack(glCanvas.gl, this.glProgram.getUnifLoc("uMVMatrix"));
        this.pMatrix = new GLMatrixStack(glCanvas.gl, this.glProgram.getUnifLoc("uPMatrix"));

        // buffers
        let particlePosXY = new Float32Array(this.env.particles.length * 2);
        let particleColRGBA = new Float32Array(this.env.particles.length * 4);
        this.glParticlePosBuffer = new GLBuffer(this.glCanvas.gl, particlePosXY, 2);
        this.glParticleColBuffer = new GLBuffer(this.glCanvas.gl, particleColRGBA, 4);

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
        let bounds = this.env.bounds;
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

    private initShaders() {
        let fragShaderSrc = ShaderLoader.getDummyColorFragShader();
        let vertShaderSrc = ShaderLoader.getDummyColorVertShader();
        this.glProgram = new GLProgram(this.glCanvas.gl, vertShaderSrc, fragShaderSrc);
        this.glProgram.use();
        this.glProgram.enableVertexAttribArray("aVertexPosition");
        this.glProgram.enableVertexAttribArray("aVertexColor");
    }



    public setPointSize(size : number) {
        this.drawParticles = (size >= 1);
        let uPointSizeLoc = this.glProgram.getUnifLoc("uPointSize");
        this.glCanvas.gl.uniform1f(uPointSizeLoc, size);
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
            particlePosXY[i*2]   = particles[i].pos[0];
            particlePosXY[i*2+1] = particles[i].pos[1];

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


    public render(): void {

        this.updateParticleBuffers();
        this.updateWaterHeightBuffers();



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