import { GroundProfile } from './ground-profile';

/** Product of two sine waves, one of them moving over time; grows from flat ground during the first seconds. */
export class DynamicDoubleSineGround implements GroundProfile {
  private readonly x1Factor = 4;
  private readonly x2Factor = 0.4;
  private readonly tFactor = 0.6;
  private readonly tShift = 3.2;
  private readonly yScale = 0.35;

  height(x: number, t: number): number {
    const scale = Math.min(this.yScale, t * 0.1);
    const a = this.x1Factor;
    const b = this.x2Factor;
    const c = this.tFactor * t + this.tShift;
    return scale * (Math.sin(a * x) + 1) * (Math.sin(b * x + c) + 1);
  }

  slope(x: number, t: number): number {
    const scale = Math.min(this.yScale, t * 0.1);
    const a = this.x1Factor;
    const b = this.x2Factor;
    const c = this.tFactor * t + this.tShift;
    return scale * (b * (Math.sin(a * x) + 1) * Math.cos(b * x + c) + a * Math.cos(a * x) * (Math.sin(b * x + c) + 1));
  }
}
