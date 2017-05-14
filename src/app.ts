import {ShaderLoader} from "./util/shader-loader";

let glMatrix = require('../js-lib/gl-matrix-2.2.1.js');

export let browserEntryPoint = function() {
    console.log("dummy vertex shader:\n", ShaderLoader.getDummyVertShader());
    console.log("dummy fragment shader:\n", ShaderLoader.getDummyFragShader());

    console.log(glMatrix.vec3.fromValues(1,2,3));
};
