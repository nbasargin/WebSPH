/** Time integration scheme, advances the state of an environment by dt. */
export interface Integrator {
  integrate(dt: number): void;
}
