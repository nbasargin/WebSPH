import {GLContext} from "./util/GLContext";
import {mat4} from "gl-matrix";
import {DummyScene} from "./scenes/DummyScene";


export let browserEntryPoint = function() {

    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("web-gl-canvas");
    let glContext = new GLContext(canvas);

    let scene = new DummyScene(glContext);
    scene.update();
    scene.render();

    console.log("done!");

};
