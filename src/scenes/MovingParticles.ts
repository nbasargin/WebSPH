import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {GLBuffer} from "../util/GLBuffer";
import {ShaderLoader} from "../util/ShaderLoader";

export class MovingParticles extends Scene {

    private particlePosXY : Float32Array;
    private glParticlePosBuffer : GLBuffer;
    private numParticles = 1000;

    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyFragShader();
        let vertShaderSrc = ShaderLoader.getDummyVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // buffers
        let bounds = this.getOrthographicBounds();
        this.particlePosXY = this.genRndVertexPositions(this.numParticles, bounds.xMax, bounds.yMax);
        this.glParticlePosBuffer = new GLBuffer(this.glContext.gl, this.particlePosXY, 2);

    }

    /**
     * Generates a Float32Array that contains randomized positions (x+y) of the particles:
     *  - x ranges from -xMax to xMax
     *  - y ranges from -yMax to yMax
     * @param numParticles
     * @param xMax
     * @param yMax
     * @returns {Float32Array}
     */
    private genRndVertexPositions(numParticles : number, xMax : number, yMax : number) : Float32Array {
        let positions = new Float32Array(numParticles * 2);
        for (let i = 0; i < numParticles; i++) {
            positions[i*2]      = xMax * (Math.random() * 2 - 1);
            positions[i*2 + 1]  = yMax * (Math.random() * 2 - 1);
        }
        return positions;
    }

    public update(dt: number): void {
        let bounds = this.getOrthographicBounds();

        let xSpeed = 0.000;
        let ySpeed = 0.001;

        // update positions
        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePosXY[i*2];
            let y = this.particlePosXY[i*2 + 1];

            x += xSpeed * dt;
            y += ySpeed * dt;

            if (x > bounds.xMax) x = bounds.xMin;
            if (y > bounds.yMax) y = bounds.yMin;

            this.particlePosXY[i*2] = x;
            this.particlePosXY[i*2 + 1] = y;

        }

        this.glParticlePosBuffer.updateData(this.particlePosXY, 2);
    }

    public render(): void {
        let gl = this.glContext.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        this.setOrthographicProjection(-1, 1);

        gl.clearColor(0.0, 0.3, 0.8, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, this.glContext.viewWidthPx(), this.glContext.viewHeightPx());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // particles
        mvMatrix.push();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glParticlePosBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.glParticlePosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.POINTS, 0, this.glParticlePosBuffer.numItems);
        mvMatrix.pop();


    }



}