import {SWEnvironment1D} from "../SWEnvironment1D";

/**
 * Abstract integrator class for 1D shallow water environments.
 */
export abstract class SWIntegrator1D {

    protected env : SWEnvironment1D;

    public constructor(env : SWEnvironment1D) {
        this.env = env;
    }

    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public abstract integrate(dt : number);

}