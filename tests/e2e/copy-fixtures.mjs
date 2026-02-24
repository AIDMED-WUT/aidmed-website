// Runs before `npm run build` in the Playwright webServer command.
// Copies test fixture content files into the content collections so they are
// compiled into the static build.  The reverse operation (cleanup) is handled
// by global-teardown.ts after the test run finishes.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '../../../');
const FIXTURES_SRC = path.join(root, 'tests/fixtures/seminars');
const CONTENT_DEST = path.join(root, 'src/content/seminars');

for (const file of fs.readdirSync(FIXTURES_SRC)) {
  fs.copyFileSync(path.join(FIXTURES_SRC, file), path.join(CONTENT_DEST, file));
  console.log(`[fixture] copied ${file} → src/content/seminars/`);
}
