import {RenderLoop} from "../rendering/RenderLoop";
import {Renderer} from "../rendering/Renderer";
import {Simulation, ParticleDistributionPreset, TimeSteppingMode} from "../simulation/Simulation";
import {GLCanvas} from "../rendering/glUtil/GLCanvas";
import {BoundaryType} from "../simulation/boundary/Boundary";
import {IntegratorType} from "../simulation/integrator/Integrator";

/**
 * Contains render loop, updates simulation, calls the renderer and handles user input.
 */
export class Controller {

    private numParticles : number;
    private canvas : GLCanvas;

    private renderLoop : RenderLoop;
    private simulation : Simulation;
    private renderer : Renderer;

    private maxTime = 0.1;

    // UI
    private btnAnim : HTMLElement;
    private divTotalTime : HTMLElement;
    private btnOneStep : HTMLElement;
    private trOneStep : HTMLElement;
    private divDtDynStable : HTMLElement;
    private divDtDynFast : HTMLElement;
    private btnReset : HTMLElement;
    private trReset : HTMLElement;
    private sldNumParticles : HTMLInputElement;
    private divNumParticles : HTMLElement;
    private sldSmoothing : HTMLInputElement;
    private divSmoothing : HTMLElement;
    private sldSmoothingVisu : HTMLInputElement;
    private divSmoothingVisu : HTMLElement;
    private sldDtFixed : HTMLInputElement;
    private divDtFixed : HTMLElement;
    private optEuler : HTMLInputElement;
    private optHeun : HTMLInputElement;
    private optHeunNaive : HTMLInputElement;
    private optHeunReduced : HTMLInputElement;
    private sldPointSize : HTMLInputElement;
    private divPointSize : HTMLInputElement;

    private chkLimitMaxDt : HTMLInputElement;

    private divMaxTime : HTMLElement;
    private txtMaxTime : HTMLInputElement;

    private optDtFixed : HTMLInputElement;
    private optDtDynStable : HTMLInputElement;
    private optDtDynFast : HTMLInputElement;

	private optBoundaryCyclic : HTMLInputElement;
	private optBoundarySolid : HTMLInputElement;

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

        this.defaultUIValues();
        this.initSimulationAndRenderer();
        this.updateSimAndRendFromUI();
        this.initListeners();

        // keep particles in place
        this.renderer.render();
        this.divDtDynStable.innerText = this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE).toFixed(5);
        this.divDtDynFast.innerText = this.simulation.getTimeStepForMode(TimeSteppingMode.FAST).toFixed(5);
    }

    private initSimulationAndRenderer() {
        // simulation
        //let bounds = this.canvas.getOrthographicBounds();

        let bounds = {
			xMin : -3,
			xMax : 2,
			yMin : -0.5,
			yMax : 1.5
		};
        this.simulation = new Simulation(this.numParticles, ParticleDistributionPreset.UNIFORM, bounds);
		this.simulation.setSmoothingLength(parseFloat(this.sldSmoothing.value));

        // renderer
        this.renderer = new Renderer(this.canvas, this.simulation.getEnvironment());

    }

    private oneStep() {

        // update
        if (this.chkLimitMaxDt.checked) {
        	this.simulation.setTimeStepLimit(0.01);
		} else {
			this.simulation.setTimeStepLimit(-1);
		}
		this.simulation.setMaxTime(this.maxTime);

        let dt = this.simulation.getNextTimeStep();

        if (dt <= 0 && this.renderLoop.isRunning()) {
            this.btnAnim.onclick(null);
            return;
        }

        this.simulation.update();
        this.renderer.render();
        this.divTotalTime.innerText = this.simulation.getTotalTime().toFixed(3);
        this.divDtDynStable.innerText = this.simulation.getTimeStepForMode(TimeSteppingMode.STABLE).toFixed(5);
        this.divDtDynFast.innerText = this.simulation.getTimeStepForMode(TimeSteppingMode.FAST).toFixed(5);
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
        this.divDtDynStable = document.getElementById("websph-div-dt-dyn-stable");
        this.divDtDynFast = document.getElementById("websph-div-dt-dyn-fast");
        this.sldSmoothing = <HTMLInputElement> document.getElementById("websph-sld-smoothing");
        this.divSmoothing = document.getElementById("websph-div-smoothing");
        this.sldSmoothingVisu = <HTMLInputElement> document.getElementById("websph-sld-smoothing-visu");
        this.divSmoothingVisu = document.getElementById("websph-div-smoothing-visu");
        this.sldDtFixed = <HTMLInputElement> document.getElementById("websph-sld-dt");
        this.divDtFixed = document.getElementById("websph-div-dt-fixed");
        this.optEuler = <HTMLInputElement> document.getElementById("websph-opt-euler");
        this.optHeun = <HTMLInputElement> document.getElementById("websph-opt-heun");
        this.optHeunNaive = <HTMLInputElement> document.getElementById("websph-opt-heun-naive");
        this.optHeunReduced = <HTMLInputElement> document.getElementById("websph-opt-heun-reduced");
        this.sldPointSize = <HTMLInputElement> document.getElementById("websph-sld-point-size");
        this.divPointSize = <HTMLInputElement> document.getElementById("websph-div-point-size");

        this.chkLimitMaxDt = <HTMLInputElement> document.getElementById("websph-chk-limit-max-dt");

        this.divMaxTime = document.getElementById("websph-div-max-time");
        this.txtMaxTime = <HTMLInputElement> document.getElementById("websph-txt-max-time");

        this.optDtFixed = <HTMLInputElement> document.getElementById("websph-opt-dt-fixed");
        this.optDtDynStable = <HTMLInputElement> document.getElementById("websph-opt-dt-dyn-stable");
        this.optDtDynFast = <HTMLInputElement> document.getElementById("websph-opt-dt-dyn-fast");

		this.optBoundaryCyclic = <HTMLInputElement> document.getElementById("websph-opt-cyclic");
		this.optBoundarySolid = <HTMLInputElement> document.getElementById("websph-opt-solid");
    }

    private defaultUIValues() {
        let defaultSmoothingLength = 0.02;
        this.sldSmoothing.value = "" + defaultSmoothingLength;
        this.divSmoothing.innerText = "" + defaultSmoothingLength;

        this.sldNumParticles.value = "" + this.numParticles;
        this.divNumParticles.innerText = "" + this.numParticles;

        this.sldSmoothingVisu.value = "" + defaultSmoothingLength;
        this.divSmoothingVisu.innerText = "" + defaultSmoothingLength;

        this.sldPointSize.value = "" + 3;
        this.divPointSize.innerText = "" + 3;

        this.sldDtFixed.value = "0.00100";
        this.divDtFixed.innerText = "0.00100";

        this.optHeun.checked = true;
        this.optDtFixed.checked = true;

        this.txtMaxTime.value = "";
        this.divMaxTime.innerText = "(not used)";

        this.optBoundaryCyclic.checked = true;
    }

    private updateSimAndRendFromUI() {
        this.simulation.setSmoothingLength(parseFloat(this.sldSmoothing.value));
        this.simulation.setFixedTimeStep(parseFloat(this.sldDtFixed.value));
        this.simulation.setIntegratorType(  this.optEuler.checked ? IntegratorType.EULER :
                                            this.optHeun.checked  ? IntegratorType.HEUN_ORIGINAL :
                                            this.optHeunNaive.checked   ? IntegratorType.HEUN_NAIVE : IntegratorType.HEUN_FAST);


        this.simulation.setBoundaryType(this.optBoundaryCyclic.checked ? BoundaryType.CYCLIC : BoundaryType.SOLID);


        this.simulation.setTimeSteppingMode(this.optDtFixed.checked ? TimeSteppingMode.FIXED :
                                                this.optDtDynStable.checked ? TimeSteppingMode.STABLE : TimeSteppingMode.FAST);

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
                if (me.simulation.getTotalTime() >= me.maxTime) {
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
            if (me.simulation.getTotalTime() >= me.maxTime) {
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

            me.renderer.render();

            me.divTotalTime.innerText = me.simulation.getTotalTime().toFixed(3);
            me.divDtDynStable.innerText = me.simulation.getTimeStepForMode(TimeSteppingMode.STABLE).toFixed(5);
            me.divDtDynFast.innerText = me.simulation.getTimeStepForMode(TimeSteppingMode.FAST).toFixed(5);
        };

        this.sldNumParticles.onchange = function () {
            me.divNumParticles.innerText = me.sldNumParticles.value;
        };

        // TIME STEPPING MODE
        this.optDtFixed.onclick = function() {
            me.simulation.setTimeSteppingMode(me.optDtFixed.checked ? TimeSteppingMode.FIXED :
											me.optDtDynStable.checked ? TimeSteppingMode.STABLE : TimeSteppingMode.FAST);
        };
        this.optDtDynStable.onclick = this.optDtFixed.onclick;
        this.optDtDynFast.onclick = this.optDtFixed.onclick;

        // SMOOTHING
        this.sldSmoothing.onchange = function () {
            me.simulation.setSmoothingLength(parseFloat(me.sldSmoothing.value));
            me.divSmoothing.innerText = "" + me.simulation.getSmoothingLength();

            me.renderer.visualizationSmoothingLength = parseFloat(me.sldSmoothing.value);
            me.sldSmoothingVisu.value = me.sldSmoothing.value;
            me.divSmoothingVisu.innerText = "" + me.renderer.visualizationSmoothingLength;

            // keep particles in place, dt = 0
            me.renderer.render();

			me.divDtDynStable.innerText = me.simulation.getTimeStepForMode(TimeSteppingMode.STABLE).toFixed(5);
			me.divDtDynFast.innerText = me.simulation.getTimeStepForMode(TimeSteppingMode.FAST).toFixed(5);
        };

        // SMOOTHING VISUALIZATION
        this.sldSmoothingVisu.onchange = function () {
            me.renderer.visualizationSmoothingLength = parseFloat(me.sldSmoothingVisu.value);
            me.divSmoothingVisu.innerText = "" + me.renderer.visualizationSmoothingLength;

            me.renderer.render();
        };

        // DT
        this.sldDtFixed.onchange = function() {
            me.simulation.setFixedTimeStep(parseFloat(me.sldDtFixed.value));
            me.divDtFixed.innerText = me.simulation.getTimeStepForMode(TimeSteppingMode.FIXED).toFixed(5);
        };

        // INTEGRATOR
        this.optHeun.onclick = function() {
            me.simulation.setIntegratorType(me.optEuler.checked       ? IntegratorType.EULER :
                                            me.optHeun.checked        ? IntegratorType.HEUN_ORIGINAL :
                                            me.optHeunNaive.checked   ? IntegratorType.HEUN_NAIVE : IntegratorType.HEUN_FAST);
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

        // BOUNDARY
		this.optBoundaryCyclic.onclick = function () {
			me.simulation.setBoundaryType(me.optBoundaryCyclic.checked ? BoundaryType.CYCLIC : BoundaryType.SOLID);
			me.renderer.render();
		};
		this.optBoundarySolid.onclick = this.optBoundaryCyclic.onclick;
    }



}