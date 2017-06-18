import {RenderLoop} from "./rendering/RenderLoop";
import {ShallowWater1D} from "./rendering/ShallowWater1D";
import {GLCanvas} from "./rendering/GLCanvas";
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

    let glCanvas = new GLCanvas(canvas);

    // set up scene
    //let scene = new DummyScene(glContext);
    //let scene = new MovingParticles(glContext);
    scene = new ShallowWater1D(glCanvas);


    renderLoop = new RenderLoop(scene, document.getElementById("websph-fps"));
    oneFrame();


    // UI elements
    let btnAnim = document.getElementById("websph-btn-animation");
    let btnOneStep = document.getElementById("websph-btn-onestep");
    let trOneStep = document.getElementById("websph-tr-onestep");
    let sldSmoothing : HTMLInputElement = <HTMLInputElement> document.getElementById("websph-sld-smoothing");
    let divSmoothing = document.getElementById("websph-div-smoothing");
    let sldSmoothingVisu : HTMLInputElement = <HTMLInputElement> document.getElementById("websph-sld-smoothing-visu");
    let divSmoothingVisu = document.getElementById("websph-div-smoothing-visu");
    let sldDt = <HTMLInputElement> document.getElementById("websph-sld-dt");
    let divDt = document.getElementById("websph-div-dt");
    let optEuler = <HTMLInputElement> document.getElementById("websph-opt-euler");
    let optHeun = <HTMLInputElement> document.getElementById("websph-opt-heun");
    let sldPointSize = <HTMLInputElement> document.getElementById("websph-sld-point-size");
    let divPointSize = <HTMLInputElement> document.getElementById("websph-div-point-size");

    // UI default values
    sldSmoothing.value = "" + scene.smoothingLength;
    divSmoothing.innerText = "" + scene.smoothingLength;

    sldSmoothingVisu.value = "" + scene.visualizationSmoothingLength;
    divSmoothingVisu.innerText = "" + scene.visualizationSmoothingLength;

    sldPointSize.value = "" + 3;
    divPointSize.innerText = "" + 3;
    scene.setPointSize(3);

    sldDt.value = "" + scene.dt;
    divDt.innerText = "" + scene.dt;

    optHeun.checked = true;

    // UI listeners
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

        scene.visualizationSmoothingLength = parseFloat(sldSmoothing.value);
        sldSmoothingVisu.value = sldSmoothing.value;
        divSmoothingVisu.innerText = "" + scene.visualizationSmoothingLength;

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

    sldDt.onchange = function() {
        scene.dt = parseFloat(sldDt.value);
        divDt.innerText = "" + scene.dt;
    };

    optHeun.onclick = function() {
        scene.useHeun = optHeun.checked;
    };
    optEuler.onclick = optHeun.onclick;


    sldPointSize.onchange = function() {
        divPointSize.innerText = "" + parseFloat(sldPointSize.value);
        scene.setPointSize(parseFloat(sldPointSize.value));
        scene.render();
    }



};
