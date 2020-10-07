import { Controller } from './controller/Controller';
import { GLCanvas } from './rendering/glUtil/GLCanvas';


export let main = function () {

    // canvas
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('web-gl-canvas');
    let glCanvas = new GLCanvas(canvas);

    // controller
    new Controller(glCanvas, 500);

};
