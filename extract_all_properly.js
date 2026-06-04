import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo_temp5.zip');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
  });
}

async function main() {
  console.log('Downloading ZIP from:', ZIP_URL);
  await downloadFile(ZIP_URL, tempZip);
  console.log('Download complete. Parsing ZIP...');

  const zip = new AdmZip(tempZip);
  const entries = zip.getEntries();
  console.log(`ZIP has ${entries.length} entries.`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  let nestedCount = 0;
  let mainCount = 0;
  let rootCount = 0;

  // Track extracted details to see what matched
  const list = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const entryName = entry.entryName;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      nestedCount++;
      list.push(`NESTED -> ${destPath}`);
    } else if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      mainCount++;
      list.push(`MAIN (OVERWRITE) -> ${destPath}`);
    } else if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      // Only extract root config files, avoids overwriting node_modules or heavy stuff
      const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
      if (rootConfigs.includes(relPath)) {
        const destPath = path.join(process.cwd(), relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        rootCount++;
        list.push(`ROOT CONFIG -> ${destPath}`);
      }
    }
  }

  console.log(`SUMMARY:`);
  console.log(`Extracted nested base files: ${nestedCount}`);
  console.log(`Extracted/Overwrote with modified main files: ${mainCount}`);
  console.log(`Extracted root configurations: ${rootCount}`);

  // Write extract report to file for checking
  fs.writeFileSync('extraction_detailed.log', list.join('\n'));
  console.log('Detailed migration logs written to extraction_detailed.log');

  fs.unlinkSync(tempZip);
}

main().catch(err => {
  console.error('Extraction script error:', err);
  process.exit(1);
});
