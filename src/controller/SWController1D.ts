import {RenderLoop} from "../rendering/RenderLoop";
import {SWRenderer1D} from "../rendering/SWRenderer1D";
import {SWSimulation1D} from "../simulation/SWSimulation1D";

/**
 * Contains render loop, updates simulation, calls the renderer and handles user input.
 */
export class SWController1D {

    private renderLoop : RenderLoop;
    private simulation : SWSimulation1D;
    private renderer : SWRenderer1D;

    // UI
    private btnAnim : HTMLElement;
    private btnOneStep : HTMLElement;
    private trOneStep : HTMLElement;
    private sldSmoothing : HTMLInputElement;
    private divSmoothing : HTMLElement;
    private sldSmoothingVisu : HTMLInputElement;
    private divSmoothingVisu : HTMLElement;
    private sldDt : HTMLInputElement;
    private divDt : HTMLElement;
    private optEuler : HTMLInputElement;
    private optHeun : HTMLInputElement;
    private sldPointSize : HTMLInputElement;
    private divPointSize : HTMLInputElement;

    public constructor(swSim : SWSimulation1D, swRend : SWRenderer1D) {

        this.simulation = swSim;
        this.renderer = swRend;


        this.renderLoop = new RenderLoop(
            () => {
                this.simulation.update();
                this.renderer.render();
            },
            document.getElementById("websph-fps")
        );
        this.findHTMLElements();
        this.defaultValues();
        this.initListeners();

        // keep particles in place
        this.simulation.update(0);
        this.renderer.render();
    }

    private findHTMLElements() {
        this.btnAnim = document.getElementById("websph-btn-animation");
        this.btnOneStep = document.getElementById("websph-btn-onestep");
        this.trOneStep = document.getElementById("websph-tr-onestep");
        this.sldSmoothing = <HTMLInputElement> document.getElementById("websph-sld-smoothing");
        this.divSmoothing = document.getElementById("websph-div-smoothing");
        this.sldSmoothingVisu = <HTMLInputElement> document.getElementById("websph-sld-smoothing-visu");
        this.divSmoothingVisu = document.getElementById("websph-div-smoothing-visu");
        this.sldDt = <HTMLInputElement> document.getElementById("websph-sld-dt");
        this.divDt = document.getElementById("websph-div-dt");
        this.optEuler = <HTMLInputElement> document.getElementById("websph-opt-euler");
        this.optHeun = <HTMLInputElement> document.getElementById("websph-opt-heun");
        this.sldPointSize = <HTMLInputElement> document.getElementById("websph-sld-point-size");
        this.divPointSize = <HTMLInputElement> document.getElementById("websph-div-point-size");
    }

    private defaultValues() {
        this.sldSmoothing.value = "" + this.simulation.smoothingLength;
        this.divSmoothing.innerText = "" + this.simulation.smoothingLength;

        this.renderer.visualizationSmoothingLength = this.simulation.smoothingLength;
        this.sldSmoothingVisu.value = "" + this.renderer.visualizationSmoothingLength;
        this.divSmoothingVisu.innerText = "" + this.renderer.visualizationSmoothingLength;

        this.sldPointSize.value = "" + 3;
        this.divPointSize.innerText = "" + 3;
        this.renderer.setPointSize(3);
        this.renderer.render();

        this.sldDt.value = "" + this.simulation.dt;
        this.divDt.innerText = "" + this.simulation.dt;

        this.optHeun.checked = true;
    }

    private initListeners() {
        let me = this;

        // ANIMATION
        this.btnAnim.onclick = function() {
            if (!me.renderLoop.isRunning()) {
                me.btnAnim.innerText = "Stop";
                me.trOneStep.style.visibility = "hidden";
                me.renderLoop.start();
            } else {
                me.btnAnim.innerText = "Start";
                me.trOneStep.style.visibility = "visible";
                me.renderLoop.stop();
            }
        };

        // ONE STEP
        this.btnOneStep.onclick = function() {
            me.simulation.update();
            me.renderer.render();
        };

        // SMOOTHING
        this.sldSmoothing.onchange = function () {
            me.simulation.smoothingLength = parseFloat(me.sldSmoothing.value);
            me.divSmoothing.innerText = "" + me.simulation.smoothingLength;

            me.renderer.visualizationSmoothingLength = parseFloat(me.sldSmoothing.value);
            me.sldSmoothingVisu.value = me.sldSmoothing.value;
            me.divSmoothingVisu.innerText = "" + me.renderer.visualizationSmoothingLength;

            // keep particles in place, dt = 0
            me.simulation.update(0);
            me.renderer.render();
        };

        // SMOOTHING VISUALIZATION
        this.sldSmoothingVisu.onchange = function () {
            me.renderer.visualizationSmoothingLength = parseFloat(me.sldSmoothingVisu.value);
            me.divSmoothingVisu.innerText = "" + me.renderer.visualizationSmoothingLength;

            me.renderer.render();
        };

        // DT
        this.sldDt.onchange = function() {
            me.simulation.dt = parseFloat(me.sldDt.value);
            me.divDt.innerText = "" + me.simulation.dt;
        };

        // INTEGRATOR
        this.optHeun.onclick = function() {
            me.simulation.useHeun = me.optHeun.checked;
        };
        this.optEuler.onclick = me.optHeun.onclick;

        // POINT SIZE
        this.sldPointSize.onchange = function() {
            me.divPointSize.innerText = "" + parseFloat(me.sldPointSize.value);
            me.renderer.setPointSize(parseFloat(me.sldPointSize.value));
            me.renderer.render();
        }
    }



}