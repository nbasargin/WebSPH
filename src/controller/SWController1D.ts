import {RenderLoop} from "../rendering/RenderLoop";
import {SWRenderer1D} from "../rendering/SWRenderer1D";
import {SWSimulation1D} from "../simulation/SWSimulation1D";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";

/**
 * Contains render loop, updates simulation, calls the renderer and handles user input.
 */
export class SWController1D {

    private numParticles : number;
    private canvas : GLCanvas;

    private renderLoop : RenderLoop;
    private simulation : SWSimulation1D;
    private renderer : SWRenderer1D;

    private maxTime = 0.1;

    // UI
    private btnAnim : HTMLElement;
    private divTotalTime : HTMLElement;
    private btnOneStep : HTMLElement;
    private trOneStep : HTMLElement;
    private divMaxTimeStep : HTMLElement;
    private btnReset : HTMLElement;
    private trReset : HTMLElement;
    private sldNumParticles : HTMLInputElement;
    private divNumParticles : HTMLElement;
    private sldSmoothing : HTMLInputElement;
    private divSmoothing : HTMLElement;
    private sldSmoothingVisu : HTMLInputElement;
    private divSmoothingVisu : HTMLElement;
    private trDt : HTMLElement;
    private sldDt : HTMLInputElement;
    private divDt : HTMLElement;
    private optEuler : HTMLInputElement;
    private optHeun : HTMLInputElement;
    private optHeunNaive : HTMLInputElement;
    private optHeunReduced : HTMLInputElement;
    private sldPointSize : HTMLInputElement;
    private divPointSize : HTMLInputElement;

    private chkLimitMaxDt : HTMLInputElement;
    private chkUseMaxDt : HTMLInputElement;

    private divMaxTime : HTMLElement;
    private txtMaxTime : HTMLInputElement;

    public constructor(glCanvas : GLCanvas, numParticles : number) {

        this.canvas = glCanvas;
        this.numParticles = numParticles;

        this.renderLoop = new RenderLoop(
            () => {
                this.oneStep();
            },
            document.getElementById("websph-fps")
        );
        this.findHTMLElements();

        this.initSimulationAndRenderer();
        this.defaultUIValues();
        this.updateSimAndRendFromUI();
        this.initListeners();

        // keep particles in place
        this.simulation.update(0);
        this.renderer.render();
        this.divMaxTimeStep.innerText = this.simulation.getMaxTimeStep().toFixed(5);
    }

    private initSimulationAndRenderer() {
        // simulation
        let bounds = this.canvas.getOrthographicBounds();
        this.simulation = new SWSimulation1D(this.numParticles, bounds);

        // renderer
        this.renderer = new SWRenderer1D(this.canvas, this.simulation.env);

    }

    private oneStep() {

        // update
        let dt = this.simulation.dt;
        if (this.chkUseMaxDt.checked) {
            dt = this.simulation.getMaxTimeStep();
            if (this.chkLimitMaxDt.checked) dt = Math.min(0.01, dt);
        }
        if (this.simulation.totalTime + dt > this.maxTime) {
            dt = this.maxTime - this.simulation.totalTime;
        }
        if (dt <= 0 && this.renderLoop.isRunning()) {
            this.btnAnim.onclick(null);
            return;
        }

        this.simulation.update(dt);

        this.renderer.TIME = this.simulation.totalTime;
        this.renderer.render();
        this.divTotalTime.innerText = this.simulation.totalTime.toFixed(3);
        this.divMaxTimeStep.innerText = this.simulation.getMaxTimeStep().toFixed(5);
    }

    private findHTMLElements() {
        this.btnAnim = document.getElementById("websph-btn-animation");
        this.divTotalTime = document.getElementById("websph-total-time");
        this.btnOneStep = document.getElementById("websph-btn-onestep");
        this.trOneStep = document.getElementById("websph-tr-onestep");
        this.btnReset = document.getElementById("websph-btn-reset");
        this.trReset = document.getElementById("websph-tr-reset");
        this.sldNumParticles = <HTMLInputElement> document.getElementById("websph-sld-num-part");
        this.divNumParticles = document.getElementById("websph-div-num-part");
        this.divMaxTimeStep = document.getElementById("websph-max-time-step");
        this.sldSmoothing = <HTMLInputElement> document.getElementById("websph-sld-smoothing");
        this.divSmoothing = document.getElementById("websph-div-smoothing");
        this.sldSmoothingVisu = <HTMLInputElement> document.getElementById("websph-sld-smoothing-visu");
        this.divSmoothingVisu = document.getElementById("websph-div-smoothing-visu");
        this.trDt = document.getElementById("websph-tr-dt");
        this.sldDt = <HTMLInputElement> document.getElementById("websph-sld-dt");
        this.divDt = document.getElementById("websph-div-dt");
        this.optEuler = <HTMLInputElement> document.getElementById("websph-opt-euler");
        this.optHeun = <HTMLInputElement> document.getElementById("websph-opt-heun");
        this.optHeunNaive = <HTMLInputElement> document.getElementById("websph-opt-heun-naive");
        this.optHeunReduced = <HTMLInputElement> document.getElementById("websph-opt-heun-reduced");
        this.sldPointSize = <HTMLInputElement> document.getElementById("websph-sld-point-size");
        this.divPointSize = <HTMLInputElement> document.getElementById("websph-div-point-size");

        this.chkLimitMaxDt = <HTMLInputElement> document.getElementById("websph-chk-limit-max-dt");
        this.chkUseMaxDt = <HTMLInputElement> document.getElementById("websph-chk-use-max-dt");

        this.divMaxTime = document.getElementById("websph-div-max-time");
        this.txtMaxTime = <HTMLInputElement> document.getElementById("websph-txt-max-time");
    }

    private defaultUIValues() {
        let defaultSmoothingLength = 0.02;
        this.sldSmoothing.value = "" + defaultSmoothingLength;
        this.divSmoothing.innerText = "" + defaultSmoothingLength;

        this.sldNumParticles.value = "" + this.numParticles;
        this.divNumParticles.innerText = "" + this.numParticles;

        this.divTotalTime.innerText = this.simulation.totalTime.toFixed(3);
        this.divMaxTimeStep.innerText = this.simulation.getMaxTimeStep().toFixed(5);

        this.sldSmoothingVisu.value = "" + defaultSmoothingLength;
        this.divSmoothingVisu.innerText = "" + defaultSmoothingLength;

        this.sldPointSize.value = "" + 3;
        this.divPointSize.innerText = "" + 3;

        this.sldDt.value = "" + this.simulation.dt;
        this.divDt.innerText = "" + this.simulation.dt;

        this.optHeun.checked = true;
        this.chkUseMaxDt.checked = false;

        this.txtMaxTime.value = "";
        this.divMaxTime.innerText = "(not used)";
    }

    private updateSimAndRendFromUI() {
        this.simulation.smoothingLength = parseFloat(this.sldSmoothing.value);
        this.simulation.dt = parseFloat(this.sldDt.value);
        this.simulation.useIntegrator = this.optEuler.checked       ? 0 :
                                        this.optHeun.checked        ? 1 :
                                        this.optHeunNaive.checked   ? 2 : 3;

        this.renderer.visualizationSmoothingLength = parseFloat(this.sldSmoothingVisu.value);
        this.renderer.setPointSize(parseFloat(this.sldPointSize.value));

        this.maxTime = parseFloat(this.txtMaxTime.value);
        if (isNaN(this.maxTime)) {
            this.maxTime = Number.MAX_VALUE;
            this.divMaxTime.innerText = "(not used)";
        } else {
            this.divMaxTime.innerText = "(used: " + this.maxTime + ")";
        }

    }

    private initListeners() {
        let me = this;

        // ANIMATION
        this.btnAnim.onclick = function() {
            if (!me.renderLoop.isRunning()) {
                if (me.simulation.totalTime >= me.maxTime) {
                    alert("Max time reached");
                    return;
                }

                me.btnAnim.innerText = "Stop";
                me.trOneStep.style.visibility = "hidden";
                me.trReset.style.visibility = "hidden";
                me.renderLoop.start();
            } else {
                me.btnAnim.innerText = "Start";
                me.trOneStep.style.visibility = "visible";
                me.trReset.style.visibility = "visible";
                me.renderLoop.stop();
            }
        };

        // ONE STEP
        this.btnOneStep.onclick = function() {
            if (me.simulation.totalTime >= me.maxTime) {
                alert("Max time reached");
                return;
            }
            me.oneStep();
        };

        // RESET
        this.btnReset.onclick = function() {
            me.numParticles = parseFloat(me.sldNumParticles.value);

            me.initSimulationAndRenderer();
            me.updateSimAndRendFromUI();

            me.simulation.update(0);
            me.renderer.render();

            me.divTotalTime.innerText = me.simulation.totalTime.toFixed(3);
            me.divMaxTimeStep.innerText = me.simulation.getMaxTimeStep().toFixed(5);
        };

        this.sldNumParticles.onchange = function () {
            me.divNumParticles.innerText = me.sldNumParticles.value;
        };

        // USE MAX DT
        this.chkUseMaxDt.onclick = function() {
            me.trDt.style.visibility = me.chkUseMaxDt.checked ? "hidden" : "visible";
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

            me.divMaxTimeStep.innerText = me.simulation.getMaxTimeStep().toFixed(5);
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
            me.simulation.useIntegrator =   me.optEuler.checked       ? 0 :
                                            me.optHeun.checked        ? 1 :
                                            me.optHeunNaive.checked   ? 2 : 3;

            me.divMaxTimeStep.innerText = me.simulation.getMaxTimeStep().toFixed(5);
        };
        this.optEuler.onclick = me.optHeun.onclick;
        this.optHeunNaive.onclick = me.optHeun.onclick;
        this.optHeunReduced.onclick = me.optHeun.onclick;

        // POINT SIZE
        this.sldPointSize.onchange = function() {
            me.divPointSize.innerText = "" + parseFloat(me.sldPointSize.value);
            me.renderer.setPointSize(parseFloat(me.sldPointSize.value));
            me.renderer.render();
        };

        // MAX TIME
        this.txtMaxTime.oninput  = function () {
            me.maxTime = parseFloat(me.txtMaxTime.value);
            if (isNaN(me.maxTime)) {
                me.maxTime = Number.MAX_VALUE;
                me.divMaxTime.innerText = "(not used)";
            } else {
                me.divMaxTime.innerText = "(used: " + me.maxTime + ")";
            }
        };
    }



}