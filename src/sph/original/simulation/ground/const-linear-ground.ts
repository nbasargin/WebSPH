import { GroundProfile } from './ground-profile';

/** Linear ground profile: y = slope * x + yIntercept */
export class ConstLinearGround implements GroundProfile {
  constructor(
    private readonly slopeValue: number,
    private readonly yIntercept: number,
  ) {}

  height(x: number): number {
    return this.slopeValue * x + this.yIntercept;
  }

  slope(): number {
    return this.slopeValue;
  }
}
