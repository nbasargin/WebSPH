export interface Particle {
  posX: number;
  speedX: number;
  accX: number;
}

export function createParticles(n: number): Particle[] {
  return Array.from({ length: n }, () => ({ posX: 0, speedX: 0, accX: 0 }));
}
