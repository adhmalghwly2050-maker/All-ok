import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const dest = path.join(process.cwd(), 'repo_clean.zip');

function download(currentUrl) {
  return new Promise((resolve, reject) => {
    https.get(currentUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`Redirecting to: ${res.headers.location}`);
        download(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Server returned HTTP ${res.statusCode}`));
        return;
      }

      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
      console.log(`Starting download. Total size: ${totalBytes} bytes`);

      const file = fs.createWriteStream(dest);
      res.pipe(file);

      let downloadedBytes = 0;
      res.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const pct = ((downloadedBytes / totalBytes) * 100).toFixed(1);
          console.log(`Progress: ${downloadedBytes}/${totalBytes} bytes (${pct}%)`);
        } else {
          console.log(`Progress: ${downloadedBytes} bytes`);
        }
      });

      file.on('finish', () => {
        file.close(() => {
          console.log(`Download finished successfully. File size on disk: ${fs.statSync(dest).size} bytes`);
          resolve();
        });
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

console.log('Initiating download sequence...');
download(url).catch(err => {
  console.error('Download failed:', err);
  process.exit(1);
});
