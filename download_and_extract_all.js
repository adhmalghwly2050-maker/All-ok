import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo.zip');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Fetching:', url);
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log('Redirecting to:', redirectUrl);
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

      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading ZIP from:', ZIP_URL);
  await downloadFile(ZIP_URL, tempZip);
  console.log('Download complete. Extracting files...');

  const zip = new AdmZip(tempZip);
  const zipEntries = zip.getEntries();
  const matchPath = 'Deflections-fix-change-beam-name-done-main/';
  let extractedCount = 0;

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    // Check if the entry starts with the matchPath prefix
    if (entry.entryName.startsWith(matchPath)) {
      const relPath = entry.entryName.substring(matchPath.length);
      if (!relPath) continue;

      const destPath = path.join(process.cwd(), relPath);
      const destDir = path.dirname(destPath);

      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      extractedCount++;
    }
  }

  console.log(`Successfully extracted ${extractedCount} files directly to the workspace root.`);
  fs.unlinkSync(tempZip);
  console.log('Migration step: Copying successfully completed!');
}

main().catch(err => {
  console.error('Fatal error during download/extraction:', err);
  process.exit(1);
});
