import reference from './reference.json';
import { fromBase64, referenceCases, runCase } from './reference-cases';

function maxDiff(a: Float64Array, b: Float64Array): number {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff = Math.max(diff, Math.abs(a[i] - b[i]));
  return diff;
}

describe('original simulation matches reference.json bit-exact', () => {
  for (const c of referenceCases) {
    test(c.name, () => {
      const expected = reference.cases.find((r) => r.name === c.name)!;
      const actual = runCase(c);
      expect(actual.steps).toBe(expected.steps);
      expect(actual.particles).toBe(expected.particles);
      expect(actual.totalTime).toBe(expected.totalTime);
      // compare max differences first for a readable failure message
      expect(maxDiff(fromBase64(actual.positions), fromBase64(expected.positions))).toBe(0);
      expect(maxDiff(fromBase64(actual.speeds), fromBase64(expected.speeds))).toBe(0);
      expect(actual.positions).toBe(expected.positions);
      expect(actual.speeds).toBe(expected.speeds);
    });
  }
});
