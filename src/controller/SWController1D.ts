import {RenderLoop} from "../rendering/RenderLoop";
import {SWEnvironment1D} from "../simulation/SWEnvironment1D";
import {SWRenderer1D} from "../rendering/SWRenderer1D";
import {IntegratorHeun} from "../simulation/integrator/IntegratorHeun";
import {IntegratorEuler} from "../simulation/integrator/IntegratorEuler";

export class SWController1D {

    private renderLoop : RenderLoop;

    // Simulation
    private env : SWEnvironment1D;
    private euler : IntegratorEuler;
    private heun : IntegratorHeun;

    public dt = 0.001;
    public smoothingLength = 0.03;
    public useHeun = true;

    // renderer
    private swRend : SWRenderer1D;


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

    public constructor(swEnv : SWEnvironment1D, swRend : SWRenderer1D) {

        this.env = swEnv;
        this.euler = new IntegratorEuler(swEnv);
        this.heun = new IntegratorHeun(swEnv);

        this.swRend = swRend;


        //this.swScene = swScene;
        this.renderLoop = new RenderLoop(
            () => { this.oneFrame();  },
            document.getElementById("websph-fps")
        );
        this.findHTMLElements();
        this.defaultValues();
        this.initListeners();


        this.oneFrame();
    }

    private oneFrame() {
        // simulation
        if (this.useHeun) {
            this.heun.integrate(this.dt, this.smoothingLength);
        } else {
            this.euler.integrate(this.dt, this.smoothingLength);
        }

        // render
        this.swRend.render();
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
        this.sldSmoothing.value = "" + this.smoothingLength;
        this.divSmoothing.innerText = "" + this.smoothingLength;

        this.sldSmoothingVisu.value = "" + this.swRend.visualizationSmoothingLength;
        this.divSmoothingVisu.innerText = "" + this.swRend.visualizationSmoothingLength;

        this.sldPointSize.value = "" + 3;
        this.divPointSize.innerText = "" + 3;
        this.swRend.setPointSize(3);
        this.swRend.render();

        this.sldDt.value = "" + this.dt;
        this.divDt.innerText = "" + this.dt;

        this.optHeun.checked = true;
    }

    private initListeners() {
        let me = this;

        // UI listeners
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

        this.btnOneStep.onclick = function() {
            me.oneFrame();
        };

        this.sldSmoothing.onchange = function () {

            me.smoothingLength = parseFloat(me.sldSmoothing.value);
            me.divSmoothing.innerText = "" + me.smoothingLength;

            me.swRend.visualizationSmoothingLength = parseFloat(me.sldSmoothing.value);
            me.sldSmoothingVisu.value = me.sldSmoothing.value;
            me.divSmoothingVisu.innerText = "" + me.swRend.visualizationSmoothingLength;

            // super hacky way to keep particles in place
            let oldDT = me.dt;
            me.dt = 0;
            me.euler.integrate(0, me.smoothingLength);
            me.swRend.render();
            me.dt = oldDT;

        };

        this.sldSmoothingVisu.onchange = function () {
            me.swRend.visualizationSmoothingLength = parseFloat(me.sldSmoothingVisu.value);
            me.divSmoothingVisu.innerText = "" + me.swRend.visualizationSmoothingLength;

            // super hacky way to keep particles in place
            let oldDT = me.dt;
            me.dt = 0;
            me.euler.integrate(0, me.smoothingLength);
            me.swRend.render();
            me.dt = oldDT;
        };

        this.sldDt.onchange = function() {
            me.dt = parseFloat(me.sldDt.value);
            me.divDt.innerText = "" + me.dt;
        };

        this.optHeun.onclick = function() {
            me.useHeun = me.optHeun.checked;
        };
        this.optEuler.onclick = me.optHeun.onclick;


        this.sldPointSize.onchange = function() {
            me.divPointSize.innerText = "" + parseFloat(me.sldPointSize.value);
            me.swRend.setPointSize(parseFloat(me.sldPointSize.value));
            me.swRend.render();
        }
    }



}