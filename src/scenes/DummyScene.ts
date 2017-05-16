import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {ShaderLoader} from "../util/ShaderLoader";
import {mat4} from "gl-matrix";
import {GLBuffer} from "../util/GLBuffer";


export class DummyScene extends Scene {

    private perspective = false;
    private scale : number = 1;

    private triangleBuffer : GLBuffer;
    private quadBuffer : GLBuffer;


    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyFragShader();
        let vertShaderSrc = ShaderLoader.getDummyVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // matrix setup
        if (this.perspective) {
            mat4.perspective(this.pMatrix.get(), 45.0, glContext.viewportWidth / glContext.viewportHeight, 0.1, 100.0);
        } else { // orthographic
            this.pMatrix.loadIdentity();
        }
        this.mvMatrix.loadIdentity();

        // buffers
        let triangleVertices = [
            0.0,  1.0,  //0.0,
            -1.0, -1.0,  //0.0,
            1.0, -1.0,  //0.0
        ];
        this.triangleBuffer = new GLBuffer(this.glContext.gl, triangleVertices, 2);
        let quadVertices = [
            1.0,  1.0,  //0.0,
            -1.0,  1.0,  //0.0,
            1.0, -1.0,  //0.0,
            -1.0, -1.0,  //0.0
        ];
        this.quadBuffer = new GLBuffer(this.glContext.gl, quadVertices, 2);

    }

    public update(dt: number = 0): void {
        this.scale = (Math.sin(Date.now() * 1E-3)) * 0.4;

    }

    public render(): void {
        let gl = this.glContext.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        // setup
        gl.clearColor(0.0, 0.5, 0.2, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, this.glContext.viewportWidth, this.glContext.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // triangle
        mvMatrix.push();
        mvMatrix.translate3fp(this.perspective ? [-1.5, 0.0, -5.4] : [-0.5, 0.5, 0.0]);
        mvMatrix.scale3f(this.scale, this.scale, this.scale);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.POINTS, 0, this.triangleBuffer.numItems);
        gl.drawArrays(gl.LINE_LOOP, 0, this.triangleBuffer.numItems); // gl.TRIANGLES
        mvMatrix.pop();

        // quad
        mvMatrix.push();
        mvMatrix.translate3fp(this.perspective ? [1.5, 0.0, -5.0] : [0.5, -0.5, 0.0]);
        mvMatrix.scale3f(this.scale, this.scale, this.scale);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.quadBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.quadBuffer.numItems);
        mvMatrix.pop();

    }


}