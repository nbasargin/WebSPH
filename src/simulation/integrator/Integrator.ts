import {Environment} from "../Environment";
import {IntegratorType, BoundaryType} from "../../util/Enums";


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


    public abstract setBoundaryType(type : BoundaryType);

    public abstract setSmoothingLength(h : number);

    public abstract getType() : IntegratorType;
}
