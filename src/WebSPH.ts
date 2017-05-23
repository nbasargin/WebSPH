import {GLContext} from "./util/GLContext";
import {mat4} from "gl-matrix";
import {MovingParticles} from "./scenes/MovingParticles";
import {Timing} from "./util/Timing";
import {InteractingParticles} from "./scenes/InteractingParticles";
import {DummyScene} from "./scenes/DummyScene";

/**
 * Main browser entry point.
 */
export let main = function() {

    // create GL context from canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    // set up scene
    //let scene = new DummyScene(glContext);
    //let scene = new MovingParticles(glContext);
    let scene = new InteractingParticles(glContext);

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
