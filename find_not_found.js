import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo_temp4.zip');

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
  
  for (const e of entries) {
    if (e.entryName.toLowerCase().includes('notfound.tsx') || e.entryName.toLowerCase().includes('notfound')) {
      console.log('Found:', e.entryName);
      // Extract it to src/pages/NotFound.tsx or whatever relPath it should be
      if (e.entryName.includes('/pages/NotFound.tsx')) {
        const dest = path.join(process.cwd(), 'src/pages/NotFound.tsx');
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, e.getData());
        console.log('Successfully extracted NotFound.tsx to src/pages/NotFound.tsx');
      }
    }
  }
  
  fs.unlinkSync(tempZip);
}

main().catch(console.error);
