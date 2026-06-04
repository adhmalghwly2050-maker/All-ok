import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo_temp_tabs.zip');

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
  await downloadFile(ZIP_URL, tempZip);
  const zip = new AdmZip(tempZip);
  const entries = zip.getEntries();
  
  console.log('--- SCANNING REPO FOR UI FILES starting with T-Z ---');
  for (const e of entries) {
    if (e.isDirectory) continue;
    if (e.entryName.includes('components/ui/')) {
      const fileName = path.basename(e.entryName);
      if (fileName[0].toLowerCase() >= 'r' && fileName[0].toLowerCase() <= 'z') {
        console.log('UI FILE found:', e.entryName, 'size:', e.header.size);
      }
    }
  }
  
  fs.unlinkSync(tempZip);
}

main().catch(console.error);
