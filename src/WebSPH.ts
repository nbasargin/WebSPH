import {GLContext} from "./rendering/GLContext";
import {ShallowWater1D} from "./scenes/ShallowWater1D";
import {RenderLoop} from "./rendering/RenderLoop";
/**
 * Main browser entry point.
 */

let animate = false;


let renderLoop : RenderLoop;
let scene : ShallowWater1D;

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
    let sldSmoothingID = "websph-sld-smoothing";
    let divSmoothingID = "websph-div-smoothing";
    let sldSmoothingVisuID = "websph-sld-smoothing-visu";
    let divSmoothingVisuID = "websph-div-smoothing-visu";


    let btnAnim = document.getElementById(btnAnimID);
    let btnOneStep = document.getElementById(btnOneStepID);
    let trOneStep = document.getElementById(trOneStepID);
    let sldSmoothing : HTMLInputElement = <HTMLInputElement> document.getElementById(sldSmoothingID);
    let divSmoothing = document.getElementById(divSmoothingID);
    let sldSmoothingVisu : HTMLInputElement = <HTMLInputElement> document.getElementById(sldSmoothingVisuID);
    let divSmoothingVisu = document.getElementById(divSmoothingVisuID);


    sldSmoothing.value = "" + scene.smoothingLength;
    divSmoothing.innerText = "" + scene.smoothingLength;

    sldSmoothingVisu.value = "" + scene.visualizationSmoothingLength;
    divSmoothingVisu.innerText = "" + scene.visualizationSmoothingLength;

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

    sldSmoothing.onchange = function () {
        scene.smoothingLength = parseFloat(sldSmoothing.value);
        divSmoothing.innerText = "" + scene.smoothingLength;

        // super hacky way to keep particles in place
        let oldDT = scene.dt;
        scene.dt = 0;
        scene.update(0);
        scene.render();
        scene.dt = oldDT;

    };

    sldSmoothingVisu.onchange = function () {
        scene.visualizationSmoothingLength = parseFloat(sldSmoothingVisu.value);
        divSmoothingVisu.innerText = "" + scene.visualizationSmoothingLength;

        // super hacky way to keep particles in place
        let oldDT = scene.dt;
        scene.dt = 0;
        scene.update(0);
        scene.render();
        scene.dt = oldDT;
    };




};
