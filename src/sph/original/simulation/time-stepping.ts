import { Particle } from './particle';

function maxAbsSpeed(particles: Particle[]): number {
  let maxSpeed = 0;
  for (const p of particles) {
    maxSpeed = Math.max(maxSpeed, Math.abs(p.speedX));
  }
  return maxSpeed;
}

/**
 * Maximal time step:
 * dt = factor * smoothing length / (max particle speed + wave propagation speed)
 */
export function maxTimeStepStable(particles: Particle[], smoothingLength: number, gravity: number): number {
  const maxSpeed = maxAbsSpeed(particles);
  const ci = Math.sqrt(gravity * smoothingLength); // wave propagation speed
  const dt = smoothingLength / (maxSpeed + ci);
  return maxSpeed == 0 ? dt * 0.1 : dt * 0.2;
}

/**
 * Maximal particle speed has less influence on the time step. Fast moving particles
 * create oscillations, that are damped with higher time steps.
 *
 * dt = factor * smoothing length / (max particle speed * 0.2 + wave propagation speed)
 */
export function maxTimeStepFast(particles: Particle[], smoothingLength: number, gravity: number): number {
  const maxSpeed = maxAbsSpeed(particles);
  const ci = Math.sqrt(gravity * smoothingLength); // wave propagation speed
  const dt = smoothingLength / (maxSpeed * 0.2 + ci);
  return maxSpeed == 0 ? dt * 0.055 : dt * 0.11;
}
