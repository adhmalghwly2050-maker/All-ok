import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo.zip');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Fetching ZIP from URL...');
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log('Following redirect to:', redirectUrl);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Status Code: ${response.statusCode}`));
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
  if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

  console.log('Downloading zip...');
  await downloadFile(ZIP_URL, tempZip);
  console.log('Download complete. File size:', fs.statSync(tempZip).size);

  const zip = new AdmZip(tempZip);
  const zipEntries = zip.getEntries();
  const matchPath = 'Deflections-fix-change-beam-name-done-main/';
  let extractedCount = 0;

  console.log('Extracting core web files...');
  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    if (entry.entryName.startsWith(matchPath)) {
      const relPath = entry.entryName.substring(matchPath.length);
      if (!relPath) continue;

      // Skip non-essential heavy directories
      if (relPath.startsWith('android/') || relPath.startsWith('.replit-artifact/') || relPath.startsWith('.github/') || relPath.startsWith('assets/')) {
        continue;
      }

      const destPath = path.join(process.cwd(), relPath);
      const destDir = path.dirname(destPath);

      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      extractedCount++;
    }
  }

  console.log(`Successfully extracted ${extractedCount} web files directly to the workspace.`);
  fs.unlinkSync(tempZip);
  console.log('Done cleanly!');
}

main().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
