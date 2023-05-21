import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const SOURCE_DIR = path.join(__dirname, '../../src');
const DOCUMENTATION_DIR = path.join(__dirname, '../../documentation');

const main = async () => {
  // Recursively list .md files in documentation/content/en/methods and its subdirectories
  const entries = fs.readdirSync(
    path.join(DOCUMENTATION_DIR, 'content/en/methods'),
    { withFileTypes: true },
  );
  const files = entries
    .flatMap((entry) => {
      if (!entry.isDirectory()) {
        return entry.name;
      }

      return fs
        .readdirSync(
          path.join(DOCUMENTATION_DIR, 'content/en/methods', entry.name),
          { withFileTypes: true },
        )
        .map((file) => path.join(entry.name, file.name));
    })
    .filter((file) => file.endsWith('.md'));

  console.log(files);
};

main();
