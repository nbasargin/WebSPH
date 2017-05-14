import {ShaderLoader} from "./util/shader-loader";
import {GLBuffer} from "./util/gl-buffer";
import {GLContext} from "./util/gl-context";

let glMatrix = require('../js-lib/gl-matrix-2.2.1.js');


export let browserEntryPoint = function() {


    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let fragShaderSrc = ShaderLoader.getDummyFragShader();
    let vertShaderSrc = ShaderLoader.getDummyVertShader();

    let glContext = new GLContext(canvas);
    let gl = glContext.gl;
    glContext.initShaders(vertShaderSrc, fragShaderSrc);

    // matrices
    let mvMatrix = glMatrix.mat4.create();
    let pMatrix = glMatrix.mat4.create();

    // buffers
    let triangleVertices = [
        0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0
    ];
    let triangleBuffer = new GLBuffer(glContext.gl, triangleVertices, 3);
    let quadVertices = [
        1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
        1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    let quadBuffer = new GLBuffer(glContext.gl, quadVertices, 3);


    // draw scene!
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0, 0, glContext.viewportWidth, glContext.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    glMatrix.mat4.perspective (pMatrix, 45.0, glContext.viewportWidth / glContext.viewportHeight, 0.1, 100.0);
    glMatrix.mat4.identity(mvMatrix);
    // triangle
    glMatrix.mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -5.4]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer.buffer);
    gl.vertexAttribPointer(glContext.vertexPositionAttribute, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
    glContext.setMatrixUniforms(pMatrix, mvMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, triangleBuffer.numItems);
    // quad
    glMatrix.mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buffer);
    gl.vertexAttribPointer(glContext.vertexPositionAttribute, quadBuffer.itemSize, gl.FLOAT, false, 0, 0);
    glContext.setMatrixUniforms(pMatrix, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);

    console.log("done!");

};
