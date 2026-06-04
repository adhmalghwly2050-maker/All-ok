import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'components', 'ui');
const destDir = path.join(process.cwd(), 'src', 'components', 'ui');

if (!fs.existsSync(srcDir)) {
  console.log('No /components/ui directory found.');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir);

for (const f of files) {
  const srcFile = path.join(srcDir, f);
  const destFile = path.join(destDir, f);
  fs.renameSync(srcFile, destFile);
  console.log(`Moved: ${f} to src/components/ui/`);
}

// remove components directory
fs.rmSync(path.join(process.cwd(), 'components'), { recursive: true, force: true });
console.log('Cleaned up root components folder.');
