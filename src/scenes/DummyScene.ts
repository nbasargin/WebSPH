import {Scene} from "./Scene";
import {GLContext} from "../util/GLContext";
import {ShaderLoader} from "../util/ShaderLoader";
import {GLBuffer} from "../util/GLBuffer";

/**
 * Draws a triangle and a square on the screen.
 * Size depends on the actual time.
 */
export class DummyScene extends Scene {

    private perspectiveProjection = false;
    private scale : number = 1;

    private triangleBuffer : GLBuffer;
    private quadBuffer : GLBuffer;


    public constructor(glContext : GLContext) {
        super(glContext);

        // shaders
        let fragShaderSrc = ShaderLoader.getDummyFragShader();
        let vertShaderSrc = ShaderLoader.getDummyVertShader();
        this.glContext.initShaders(vertShaderSrc, fragShaderSrc);

        // matrices
        //this.setOrthographicProjection(0.1, 100); // moved to update

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

    /**
     * Update scale based on time, update projection (if canvas size has changed)
     * @param dt not used
     */
    public update(dt: number = 0): void {
        this.scale = (Math.sin(Date.now() * 1E-3)) * 0.4;
    }

    /**
     * Renders a triangle and a square
     */
    public render(): void {
        let gl = this.glContext.gl;
        let mvMatrix = this.mvMatrix;
        let pMatrix = this.pMatrix;

        // setup
        if (this.perspectiveProjection) {
            this.setPerspectiveProjection(45, 0.1, 100);
        } else {
            this.setOrthographicProjection(0.1, 100);
        }
        gl.clearColor(0.0, 0.5, 0.2, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, this.glContext.viewWidth(), this.glContext.viewHeight());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // triangle
        mvMatrix.push();
        mvMatrix.translate3fp(this.perspectiveProjection ? [-1.0, 0.0, -3.0] : [-0.5, 0.5, -3.0]);
        mvMatrix.scale3f(this.scale, this.scale, this.scale);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.POINTS, 0, this.triangleBuffer.numItems);
        gl.drawArrays(gl.LINE_LOOP, 0, this.triangleBuffer.numItems); // gl.TRIANGLES
        mvMatrix.pop();

        // quad
        mvMatrix.push();
        mvMatrix.translate3fp(this.perspectiveProjection ? [1.0, 0.0, -3.0] : [0.5, -0.5, -3.0]);
        mvMatrix.scale3f(this.scale, this.scale, this.scale);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer.buffer);
        gl.vertexAttribPointer(this.glContext.vertexPositionAttribute, this.quadBuffer.itemSize, gl.FLOAT, false, 0, 0);
        this.glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.quadBuffer.numItems);
        mvMatrix.pop();

    }


}