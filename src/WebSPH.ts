import {GLCanvas} from "./rendering/glUtil/GLCanvas";
import {SWController1D} from "./controller/SWController1D";
import {SWRenderer1D} from "./rendering/SWRenderer1D";
import {SWSimulation1D} from "./simulation/SWSimulation1D";


export let main = function() {

    // canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glCanvas = new GLCanvas(canvas);

    // simulation
    let numParticles = 500;
    let bounds = glCanvas.getOrthographicBounds();
    let simulation = new SWSimulation1D(numParticles, bounds);

    // renderer
    let renderer = new SWRenderer1D(glCanvas, simulation.env);

    // controller
    new SWController1D(simulation, renderer);

};
