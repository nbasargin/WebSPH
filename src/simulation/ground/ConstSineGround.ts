import {GroundProfile} from "./GroundProfile";

export class ConstSineGround extends GroundProfile {

    private scale : number;
    private period : number;
    private phase : number;

    public constructor(scale : number, period : number, phase : number) {
        super();
        this.scale = scale;
        this.period = period;
        this.phase = phase;
    }

    public getGroundHeight(x: number, t : number) {
        return this.scale * Math.sin(this.period * x + this.phase);
    }

    public getGroundSlope(x: number, t : number) {
        return this.scale * this.period * Math.cos(this.period * x + this.phase);
    }


}