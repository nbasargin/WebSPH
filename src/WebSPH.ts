import {GLContext} from "./util/GLContext";
import {ShallowWater1D} from "./scenes/ShallowWater1D";
import {RenderLoop} from "./util/RenderLoop";
import {Scene} from "./scenes/Scene";
/**
 * Main browser entry point.
 */

let animate = false;


let renderLoop : RenderLoop;
let scene : Scene;

let oneFrame = function() {
    scene.update(0);
    scene.render();
};

export let main = function() {

    // create GL context from canvas
    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    // set up scene
    //let scene = new DummyScene(glContext);
    //let scene = new MovingParticles(glContext);
    scene = new ShallowWater1D(glContext);


    renderLoop = new RenderLoop(scene, document.getElementById("websph-fps"));
    oneFrame();


    // UI
    let btnAnimID = "websph-btn-animation";
    let btnOneStepID = "websph-btn-onestep";
    let trOneStepID = "websph-tr-onestep";

    let btnAnim = document.getElementById(btnAnimID);
    let btnOneStep = document.getElementById(btnOneStepID);
    let trOneStep = document.getElementById(trOneStepID);

    btnAnim.onclick = function() {
        if (!animate) {
            btnAnim.innerText = "Stop";
            trOneStep.style.visibility = "hidden";
            animate = true;
            renderLoop.start();
        } else {
            btnAnim.innerText = "Start";
            trOneStep.style.visibility = "visible";
            animate = false;
            renderLoop.stop();
        }
    };

    btnOneStep.onclick = function() {
        oneFrame();
    };




};
