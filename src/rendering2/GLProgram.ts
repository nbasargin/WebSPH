/**
 * Wrapper for WebGLProgram, can be created from shader source code.
 */
export class GLProgram {

    public gl : WebGLRenderingContext;
    public program : WebGLProgram;


    public constructor(gl : WebGLRenderingContext, vertShaderSrc : string, fragShaderSrc : string) {
        let vertShader = GLProgram.compileShader(gl, vertShaderSrc, gl.VERTEX_SHADER);
        let fragShader = GLProgram.compileShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
        this.program = GLProgram.createProgram(gl, vertShader, fragShader);
        this.gl = gl;
    }

    // compile shader from source code
    // type can be "gl.VERTEX_SHADER" or "gl.VERTEX_SHADER"
    private static compileShader(gl : WebGLRenderingContext, srcCode : string, type : number) : WebGLShader {
        let shader : WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, srcCode);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error("Couldn't compile " +
                (type == gl.VERTEX_SHADER ? "vertex" : "fragment")  + " shader)!\n" +
                gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    // create and link gl program based on vertex and fragment shaders.
    private static createProgram(gl : WebGLRenderingContext, vertShader : WebGLShader, fragShader : WebGLShader) : WebGLProgram {
        let program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Couldn't initialize shaders");
        }
        return program;
    }

    /**
     * Use this program, wrapper for "gl.useProgram"
     */
    public use() {
        this.gl.useProgram(this.program);
    }

    /**
     * Get attribute location, wrapper for "gl.getAttribLocation".
     * @param attribute     attribute name (in shader source code)
     * @returns {number}    attribute location
     */
    public getAttrLoc(attribute : string) : number {
        return this.gl.getAttribLocation(this.program, attribute);
    }

    /**
     * Get uniform location, wrapper for "gl.getUniformLocation".
     * @param uniform                       uniform name (in shader source code)
     * @returns {WebGLUniformLocation}      uniform location
     */
    public getUnifLoc(uniform : string) : WebGLUniformLocation {
        return this.gl.getUniformLocation(this.program, uniform);
    }


}