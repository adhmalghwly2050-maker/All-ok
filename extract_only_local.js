import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const tempZip = path.join(process.cwd(), 'repo.zip');

async function main() {
  if (!fs.existsSync(tempZip)) {
    console.error(`Error: repo.zip does not exist in root directory!`);
    process.exit(1);
  }

  console.log('Found local repo.zip. Extracting all files...');
  const zip = new AdmZip(tempZip);
  const entries = zip.getEntries();
  console.log(`ZIP has ${entries.length} entries.`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  let nestedCount = 0;
  let mainCount = 0;
  let rootCount = 0;

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const entryName = entry.entryName;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      nestedCount++;
    } else if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      mainCount++;
    } else if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
      if (rootConfigs.includes(relPath)) {
        const destPath = path.join(process.cwd(), relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        rootCount++;
      }
    }
  }

  console.log(`Extraction Success:`);
  console.log(`- Extracted nested: ${nestedCount}`);
  console.log(`- Extracted main override: ${mainCount}`);
  console.log(`- Extracted root config: ${rootCount}`);
}

main().catch(err => {
  console.error('Extraction script error:', err);
  process.exit(1);
});
