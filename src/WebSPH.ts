import {GLContext} from "./util/GLContext";
import {Timing} from "./util/Timing";
import {Speed1D} from "./scenes/Speed1D";
import {ShallowWater1D} from "./scenes/ShallowWater1D";
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
    //let scene = new InteractingParticles(glContext);
    //let scene = new Speed1D(glContext);
    let scene = new ShallowWater1D(glContext);

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

/*
    function oneFrame() {
        scene.update(0);
        scene.render();
    }
    document.onkeypress = function (ke : KeyboardEvent) {
        if (ke.code == "ArrowRight") oneFrame();
    };
    oneFrame();
*/
};
