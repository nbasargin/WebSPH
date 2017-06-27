import {GLCanvas} from "./rendering/glUtil/GLCanvas";
import {SWController1D} from "./controller/SWController1D";


export let main = function() {

    // canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glCanvas = new GLCanvas(canvas);

    // controller
    new SWController1D(glCanvas, 500);

};
