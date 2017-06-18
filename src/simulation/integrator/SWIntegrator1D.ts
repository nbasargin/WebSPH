import {SWEnvironment1D} from "../SWEnvironment1D";

export abstract class SWIntegrator1D {

    private env : SWEnvironment1D;

    public constructor(env : SWEnvironment1D) {
        this.env = env;
    }

    public getEnvironment() : SWEnvironment1D {
        return this.env;
    }

    public abstract integrate(dt : number, smoothingLength : number);


}