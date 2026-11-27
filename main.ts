// best-household-budget-site entry: hands the site in for judging.
// Copies app/ and screenshots/ from this file's directory into the output
// directory (MAKEFUN_OUTPUT_DIR, /output inside the grader container) and
// writes output/dossier.json with the vendored make.fun frontend library.
// vendor/makefun-frontend.ts stays untouched: the scorer requires
// dossier.json to be byte for byte what its own copy of that file writes.
//
// Node 22, standard library only — plain `node main.ts`, no build step.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(entryDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(entryDir, 'screenshots'))) {
  cpSync(join(entryDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Dossier caps from the scorer's gate (reference/gate.json): text_max_bytes
// shapes the dossier's bytes; the other caps only refuse what the scorer
// itself would refuse, so we pass them too.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
