import { GroundProfile } from './GroundProfile';

export class ConstLinearGround extends GroundProfile {

    private slope: number;
    private yIntercept: number;

    /**
     * Linear ground profile: y = slope * x + yIntercept
     *
     * @param slope
     * @param yIntercept
     */
    public constructor(slope: number, yIntercept: number) {
        super();
        this.slope = slope;
        this.yIntercept = yIntercept;
    }


    public getGroundHeight(x: number, t: number): number {
        return this.slope * x + this.yIntercept;
    }

    public getGroundSlope(x: number, t: number): number {
        return this.slope;
    }


}
