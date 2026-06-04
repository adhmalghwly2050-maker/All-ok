import AdmZip from 'adm-zip';
import fs from 'fs';

const cleanZip = 'repo_clean.zip';

// We need to download repo_clean.zip again or let's see if it is deleted.
// Ah, download_esm.js deletd repo_clean.zip. Let's make the script download it if it doesn't exist.
const url = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(fileUrl);
    https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    });
  });
}

import https from 'https';

async function main() {
  if (!fs.existsSync(cleanZip)) {
    console.log("Downloading ZIP...");
    await downloadFile(url, cleanZip);
  }
  
  const zip = new AdmZip(cleanZip);
  const entries = zip.getEntries();
  console.log(`ZIP has ${entries.length} entries. Examples:`);
  
  // Group prefixes
  const prefixes = new Set();
  entries.forEach(entry => {
    const parts = entry.entryName.split('/');
    if (parts.length > 2) {
      prefixes.add(parts.slice(0, 2).join('/') + '/');
    } else {
      prefixes.add(entry.entryName);
    }
  });
  
  console.log("Unique level-2 prefixes in ZIP:");
  Array.from(prefixes).forEach(p => console.log("-", p));

  console.log("\nSearching ZIP for hooks, slabFEMEngine, and use-toast files:");
  entries.forEach(entry => {
    const name = entry.entryName.toLowerCase();
    if (name.includes('hooks') || name.includes('slabfemengine') || name.includes('use-toast') || name.includes('analyze3dcolumns') || name.includes('capacitordownload') || name.includes('autodesigner')) {
      console.log("MATCH:", entry.entryName);
    }
  });
}

main().catch(console.error);
