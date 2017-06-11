import {mat4} from "gl-matrix";

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

        // compile shaders
        function compileShader(src : string, type) {
            let shader : WebGLShader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error("Couldn't compile " +
                    (type == gl.VERTEX_SHADER ? "vertex" : "fragment")  + " shader)!\n" +
                    gl.getShaderInfoLog(shader));
            }
            return shader;
        }
        let vertShader = compileShader(vertShaderSrc, gl.VERTEX_SHADER);
        let fragShader = compileShader(fragShaderSrc, gl.FRAGMENT_SHADER);

        // link program
        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Couldn't not initialise shaders");
        }
        gl.useProgram(shaderProgram);
        this.shaderProgram = shaderProgram;

        // save addition properties
        this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        if (this.vertexPositionAttribute != -1)  gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        if (this.vertexColorAttribute != -1) gl.enableVertexAttribArray(this.vertexColorAttribute);
        this.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        this.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

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