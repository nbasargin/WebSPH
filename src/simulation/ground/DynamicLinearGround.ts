import { GroundProfile } from './GroundProfile';

export class DynamicLinearGround extends GroundProfile {

    private yIntercept: number;
    private maxSlope: number;
    private slopeChangeSpeed: number;

    /**
     * Linear ground profile: y = slope * x + yIntercept
     * Slope is changing over time.
     *
     * @param yIntercept
     * @param maxSlope
     * @param slopeChangeSpeed
     */
    public constructor(yIntercept: number, maxSlope: number, slopeChangeSpeed: number) {
        super();
        this.yIntercept = yIntercept;
        this.maxSlope = maxSlope;
        this.slopeChangeSpeed = slopeChangeSpeed;
    }


    public getGroundHeight(x: number, t: number): number {
        return this.getGroundSlope(x, t) * x + this.yIntercept;
    }

    public getGroundSlope(x: number, t: number): number {
        return this.maxSlope * Math.sin(t * this.slopeChangeSpeed);
    }

}
