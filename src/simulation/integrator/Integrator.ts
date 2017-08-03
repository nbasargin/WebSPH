import {Environment} from "../Environment";

export enum IntegratorType {
    EULER,
    HEUN_NAIVE,
    HEUN_ORIGINAL,
    HEUN_FAST
}

/**
 * Abstract integrator class for 1D shallow water environments.
 */
export abstract class Integrator {

    protected env : Environment;

    public constructor(env : Environment) {
        this.env = env;
    }

    public getEnvironment() : Environment {
        return this.env;
    }

    public abstract integrate(dt : number);


    public abstract setBoundaryType(type : number);

    public abstract setSmoothingLength(h : number);

    public abstract getType() : IntegratorType;
}