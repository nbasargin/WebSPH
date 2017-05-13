import {ShaderLoader} from "./util/shader-loader";

export let browserEntryPoint = function() {
    console.log("dummy vertex shader:\n", ShaderLoader.getDummyVertShader());
    console.log("dummy fragment shader:\n", ShaderLoader.getDummyFragShader());
};
