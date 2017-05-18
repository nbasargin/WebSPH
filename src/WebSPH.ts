import {GLContext} from "./util/GLContext";
import {mat4} from "gl-matrix";
import {DummyScene} from "./scenes/DummyScene";
import {MovingParticles} from "./scenes/MovingParticles";
import {RingBuffer} from "./util/RingBuffer";
import {Timing} from "./util/Timing";

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

    let timing = new Timing(10);


    // start render loop
    function renderLoop() {
        timing.nextFrame();

        document.getElementById("websph-fps").innerText =
            "FPS: " + timing.getAvgFPS().toFixed(1)  + " (avg)";

        scene.update(timing.getLastFrameDuration());
        scene.render();
        window.requestAnimationFrame(renderLoop);
    }
    renderLoop();

};
