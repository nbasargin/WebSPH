/** Ground height and slope as functions of position x and time t. */
export interface GroundProfile {
  height(x: number, t: number): number;
  slope(x: number, t: number): number;
}
