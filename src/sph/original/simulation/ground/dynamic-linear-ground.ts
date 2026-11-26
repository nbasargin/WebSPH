import { GroundProfile } from './ground-profile';

/** Linear ground profile: y = slope * x + yIntercept, the slope is changing over time. */
export class DynamicLinearGround implements GroundProfile {
  constructor(
    private readonly yIntercept: number,
    private readonly maxSlope: number,
    private readonly slopeChangeSpeed: number,
  ) {}

  height(x: number, t: number): number {
    return this.slope(x, t) * x + this.yIntercept;
  }

  slope(x: number, t: number): number {
    return this.maxSlope * Math.sin(t * this.slopeChangeSpeed);
  }
}
