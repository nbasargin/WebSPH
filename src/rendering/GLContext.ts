import {mat4} from "gl-matrix";
import {GLProgram} from "../rendering2/GLProgram";

/**
 * Wrapper for the WebGLRenderingContext.
 * Contains some utility functions.
 */
export class GLContext {

    public gl : WebGLRenderingContext;
    public canvas : HTMLCanvasElement;

    public shaderProgram : WebGLProgram;
    public vertexPositionAttribute : number;
    public vertexColorAttribute : number;
    public pMatrixUniform : WebGLUniformLocation;
    public mvMatrixUniform : WebGLUniformLocation;

    public constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
    }

    /**
     * Returns the width of the canvas in pixels.
     * @returns {number}
     */
    public viewWidthPx() {
        return this.canvas.width;
    }

    /**
     * Returns the height of the canvas in pixels.
     * @returns {number}
     */
    public viewHeightPx() {
        return this.canvas.height;
    }

    /**
     * Create a shaderProgram from vertex and fragment shader codes.
     * @param vertShaderSrc     vertex shader source code
     * @param fragShaderSrc     fragment shader source code
     */
    public initShaders(vertShaderSrc : string, fragShaderSrc : string) {
        let gl = this.gl;

        let glProgram = new GLProgram(gl, vertShaderSrc, fragShaderSrc);
        glProgram.use();
        this.shaderProgram = glProgram.program;

        // save addition properties
        this.vertexPositionAttribute = glProgram.getAttrLoc("aVertexPosition");
        if (this.vertexPositionAttribute != -1)  gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.vertexColorAttribute = glProgram.getAttrLoc("aVertexColor");
        if (this.vertexColorAttribute != -1) gl.enableVertexAttribArray(this.vertexColorAttribute);
        this.pMatrixUniform = glProgram.getUnifLoc("uPMatrix");
        this.mvMatrixUniform = glProgram.getUnifLoc("uMVMatrix");

    }

    /**
     * Push projection and modelview matrices to the GPU.
     * @param pMatrix       projection matrix
     * @param mvMatrix      modelview matrix
     */
    public setMatrixUniforms(pMatrix : mat4, mvMatrix : mat4) {
        this.gl.uniformMatrix4fv(this.pMatrixUniform, false, pMatrix);
        this.gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvMatrix);
    }
}