import {GLCanvas} from "./rendering/GLCanvas";
import {SWController1D} from "./controller/SWController1D";
import {SWEnvironment1D} from "./simulation/SWEnvironment1D";
import {SWRenderer1D} from "./rendering/SWRenderer1D";


export let main = function() {

    // canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glCanvas = new GLCanvas(canvas);

    // environment
    let numParticles = 500;
    let bounds = glCanvas.getOrthographicBounds();
    let env = new SWEnvironment1D(numParticles, bounds, 1, 9.81);

    // renderer
    let renderer = new SWRenderer1D(glCanvas, env);
    let controller = new SWController1D(env, renderer);

};
