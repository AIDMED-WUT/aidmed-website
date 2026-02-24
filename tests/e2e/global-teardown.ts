import fs from 'fs';
import path from 'path';

const FIXTURES_SRC = path.resolve('tests/fixtures/seminars');
const CONTENT_DEST = path.resolve('src/content/seminars');

export default async function globalTeardown() {
  for (const file of fs.readdirSync(FIXTURES_SRC)) {
    const dest = path.join(CONTENT_DEST, file);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest);
    }
  }
}
