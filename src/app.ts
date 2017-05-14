import {ShaderLoader} from "./util/shader-loader";
import {GLBuffer} from "./util/gl-buffer";
import {GLContext} from "./util/gl-context";
import {mat4} from "gl-matrix";
import {MatrixStack} from "./util/matrix-stack";


export let browserEntryPoint = function() {


    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let fragShaderSrc = ShaderLoader.getDummyFragShader();
    let vertShaderSrc = ShaderLoader.getDummyVertShader();

    let glContext = new GLContext(canvas);
    let gl = glContext.gl;
    glContext.initShaders(vertShaderSrc, fragShaderSrc);

    // matrices
    let mvMatrix = new MatrixStack();
    let pMatrix = new MatrixStack();
    let perspective = false;

    if (perspective) {
        mat4.perspective(pMatrix.get(), 45.0, glContext.viewportWidth / glContext.viewportHeight, 0.1, 100.0);
    } else { // orthographic
        pMatrix.loadIdentity();
    }
    mvMatrix.loadIdentity();



    // buffers
    let triangleVertices = [
        0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0
    ];
    let triangleBuffer = new GLBuffer(gl, triangleVertices, 3);
    let quadVertices = [
        1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    let quadBuffer = new GLBuffer(gl, quadVertices, 3);


    // draw scene!
    gl.clearColor(0.0, 0.5, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0, 0, glContext.viewportWidth, glContext.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let scale = Math.random() * 0.2 + 0.2;

    // triangle
    mvMatrix.push();
    mvMatrix.translate3fp(perspective ? [-1.5, 0.0, -5.4] : [-0.5, 0.5, 0.0]);
    mvMatrix.scale3f(scale, scale, scale);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer.buffer);
    gl.vertexAttribPointer(glContext.vertexPositionAttribute, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
    glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
    //gl.drawArrays(gl.TRIANGLES, 0, triangleBuffer.numItems);
    gl.drawArrays(gl.POINTS, 0, triangleBuffer.numItems);
    gl.drawArrays(gl.LINE_LOOP, 0, triangleBuffer.numItems);
    mvMatrix.pop();

    // quad
    mvMatrix.push();
    mvMatrix.translate3fp(perspective ? [1.5, 0.0, -5.0] : [0.5, -0.5, 0.0]);
    mvMatrix.scale3f(scale, scale, scale);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buffer);
    gl.vertexAttribPointer(glContext.vertexPositionAttribute, quadBuffer.itemSize, gl.FLOAT, false, 0, 0);
    glContext.setMatrixUniforms(pMatrix.get(), mvMatrix.get());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
    mvMatrix.pop();

    console.log("done!");

};
