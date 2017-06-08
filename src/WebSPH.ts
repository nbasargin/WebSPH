import {GLContext} from "./util/GLContext";
import {ShallowWater1D} from "./scenes/ShallowWater1D";
import {RenderLoop} from "./util/RenderLoop";
/**
 * Main browser entry point.
 */
let renderLoop : RenderLoop;

export let main = function() {

    // create GL context from canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    // set up scene
    //let scene = new DummyScene(glContext);
    //let scene = new MovingParticles(glContext);
    let scene = new ShallowWater1D(glContext);

    let oneFrame = function() {
        scene.update(0);
        scene.render();
    };

    let animate = true;
    if (animate) {
        // start render loop
        renderLoop = new RenderLoop(scene, document.getElementById("websph-fps"));
        renderLoop.start();
    } else {
        // next frame on keypress
        oneFrame();
    }


    document.onkeypress = function (ke : KeyboardEvent) {
        if (!animate) {
            if (ke.code == "ArrowRight") oneFrame();
        } else {
            if (ke.code == "ArrowRight") {
                if (renderLoop.isRunning()) {
                    renderLoop.stop();
                } else {
                    renderLoop.start();
                }
            }

        }
    };



};
