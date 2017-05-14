export class GLContext {

    public viewportWidth : number;
    public viewportHeight : number;
    public gl : WebGLRenderingContext;
    public canvas : HTMLCanvasElement;

    public shaderProgram : WebGLProgram;
    public vertexPositionAttribute : number;
    public pMatrixUniform : WebGLUniformLocation;
    public mvMatrixUniform : WebGLUniformLocation;



    public constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
        this.viewportWidth = canvas.width;
        this.viewportHeight = canvas.height;
    }

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
        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        this.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    }

    public setMatrixUniforms(pMatrix, mvMatrix) {
        this.gl.uniformMatrix4fv(this.pMatrixUniform, false, pMatrix);
        this.gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvMatrix);
    }
}