import {GLContext} from "./util/GLContext";
import {mat4} from "gl-matrix";
import {DummyScene} from "./scenes/DummyScene";

/**
 * Main browser entry point.
 */
export let main = function() {

    // create GL context from canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    // set up scene
    let scene = new DummyScene(glContext);

    // start render loop
    function renderLoop() {
        scene.update();
        scene.render();
        window.requestAnimationFrame(renderLoop);
    }
    renderLoop();

};
