export class GLProgram {

    public gl : WebGLRenderingContext;
    public program : WebGLProgram;


    public constructor(gl : WebGLRenderingContext, vertShaderSrc : string, fragShaderSrc : string) {
        let vertShader = GLProgram.compileShader(gl, vertShaderSrc, gl.VERTEX_SHADER);
        let fragShader = GLProgram.compileShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
        this.program = GLProgram.createProgram(gl, vertShader, fragShader);
        this.gl = gl;
    }

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

    private static createProgram(gl : WebGLRenderingContext, vertShader : WebGLShader, fragShader : WebGLShader) : WebGLProgram {
        let program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Couldn't not initialise shaders");
        }
        return program;
    }

    public use() {
        this.gl.useProgram(this.program);
    }

    public getAttrLoc(attribute : string) : number {
        return this.gl.getAttribLocation(this.program, attribute);
    }


}