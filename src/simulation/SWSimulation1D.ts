import {Bounds} from "../util/Bounds";
import {SWEnvironment1D} from "./SWEnvironment1D";
import {IntegratorEuler} from "./integrator/IntegratorEuler";
import {HeunOriginal} from "./integrator/HeunOriginal";
import {HeunNaive} from "./integrator/HeunNaive";
import {HeunReduced} from "./integrator/HeunReduced";
import {TimeStepping} from "./TimeStepping";

/**
 * Main simulation class, contains the integrator and the environment.
 */
export class SWSimulation1D {

    private env : SWEnvironment1D;
    private euler : IntegratorEuler;
    private heun : HeunOriginal;
    private heunNaive : HeunNaive;
    private heunReduced : HeunReduced;

    public dt = 0.001;

    public useIntegrator : number = 1; // 0: euler,    1: heun,    2: heunNaive,    3: heunReduced
    public useTimeSteppingMode : number = 0;  // 0: fixed dt,    1: dynamic stable,     2: dynamic fast

    public constructor(numParticles : number, bounds : Bounds, smoothingLength : number) {
        this.env = new SWEnvironment1D(numParticles, bounds, smoothingLength);
        this.euler = new IntegratorEuler(this.env);
        this.heun = new HeunOriginal(this.env);
        this.heunNaive = new HeunNaive(this.env);
        this.heunReduced = new HeunReduced(this.env);
    }

    public update(dt : number = this.dt) {
        this.env.setTotalTime(this.env.getTotalTime() + dt);

        switch (this.useIntegrator) {
            case 0:
                this.euler.integrate(dt);
                break;
            case 1:
                this.heun.integrate(dt);
                break;
            case 2:
                this.heunNaive.integrate(dt);
                break;
            case 3:
                this.heunReduced.integrate(dt);
                break;
        }
    }

    /**
     * Calculate maximal time step depending on the mode.
     * 0: fixed dt,    1: dynamic stable,     2: dynamic fast
     */
    public getMaxTimeStep(mode : number = this.useTimeSteppingMode) : number {
        switch(mode) {
            case 0:
                return this.dt;
            case 1:
                return TimeStepping.getMaxTimeStepStable(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());
            case 2:
                return TimeStepping.getMaxTimeStepFast(this.env.getParticles(), this.env.getSmoothingLength(), this.env.getGravity());
            default:
                return 0;
        }

    }


    public setBoundaryType(type : number) {
        this.euler.setBoundaryType(type);
        this.heun.setBoundaryType(type);
        this.heunNaive .setBoundaryType(type);
        this.heunReduced.setBoundaryType(type);
    }

    public setSmoothingLength(h : number) {
        this.euler.setSmoothingLength(h);
        this.heun.setSmoothingLength(h);
        this.heunNaive.setSmoothingLength(h);
        this.heunReduced.setSmoothingLength(h);
    }

    public getSmoothingLength() : number {
        return this.env.getSmoothingLength();
    }

    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public getTotalTime() : number {
        return this.env.getTotalTime();
    }

}