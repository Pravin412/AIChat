import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import process from 'node:process';

const ignored = new Set(['node_modules', 'dist', '.git', 'pnpm-lock.yaml']);
const root = process.cwd();

async function checkDirectory(directory) {
  let failed = false;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.endsWith('.local')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      failed = (await checkDirectory(path)) || failed;
      continue;
    }
    if (!entry.isFile() || /\.(png|jpg|webp|ico)$/.test(entry.name)) continue;
    const content = await readFile(path, 'utf8');
    const lines = content.split('\n').length - Number(content.endsWith('\n'));
    if (lines >= 250) {
      process.stderr.write(
        `${relative(root, path)}: ${lines} lines (must be under 250)\n`,
      );
      failed = true;
    }
  }
  return failed;
}

if (await checkDirectory(root)) process.exitCode = 1;
