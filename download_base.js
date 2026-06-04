import https from 'https';
import fs from 'fs';

const BASE_URL = 'https://github.com/adhmalghwly2050-maker/foundation-designer-pro-dd7dc040/archive/refs/heads/main.zip';
const dest = 'base_repo.zip';

function downloadFile(fileUrl, targetPath) {
  return new Promise((resolve, reject) => {
    console.log("Downloading from:", fileUrl);
    const parsedUrl = new URL(fileUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': 'Mozilla/5.0-Node' }
    };
    https.get(options, (res) => {
      console.log("Status:", res.statusCode);
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        downloadFile(res.headers.location, targetPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Status: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(targetPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Saved ${fs.statSync(targetPath).size} bytes to ${targetPath}`);
        resolve();
      });
    }).on('error', reject);
  });
}

downloadFile(BASE_URL, dest)
  .then(() => console.log("Base download success!"))
  .catch(err => console.error("Base download error:", err));
