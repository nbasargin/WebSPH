import {GLContext} from "./util/GLContext";
import {mat4} from "gl-matrix";
import {DummyScene} from "./scenes/DummyScene";
import {MovingParticles} from "./scenes/MovingParticles";

/**
 * Main browser entry point.
 */
export let main = function() {

    // create GL context from canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    // set up scene
    //let scene = new DummyScene(glContext);
    let scene = new MovingParticles(glContext);

    let lastFrameTime = Date.now();

    // start render loop
    function renderLoop() {
        let now = Date.now();
        let dt = now - lastFrameTime;
        lastFrameTime = now;

        scene.update(dt);
        scene.render();
        window.requestAnimationFrame(renderLoop);
    }
    renderLoop();

};
