/**
 * Generates reference simulation results (reference.json) used to verify that refactorings
 * of the simulation core do not change its results (see reference.spec.ts).
 *
 * Run from the repository root: npx tsx src/sph/original/test/generate-reference.ts
 *
 * History: first generated with the original (thesis) code, regenerated once for the Euler fix,
 * bit-identical through the migration since.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { referenceCases, runCase } from './reference-cases';

const results = referenceCases.map(runCase);

const file = join(__dirname, 'reference.json');
writeFileSync(file, JSON.stringify({ cases: results }, null, 2) + '\n');
console.log(`Wrote ${results.length} cases to ${file}`);
for (const r of results) {
  console.log(`  ${r.name.padEnd(26)} n=${r.particles} steps=${r.steps} t=${r.totalTime}`);
}
