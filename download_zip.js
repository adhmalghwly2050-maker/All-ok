import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const url = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const outputFile = 'deflections_fix.zip';

function downloadFile(fileUrl, targetPath) {
  return new Promise((resolve, reject) => {
    console.log("Downloading from:", fileUrl);
    https.get(fileUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`Redirecting to: ${res.headers.location}`);
        downloadFile(res.headers.location, targetPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Server returned status code: ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log("Download finished. Saved to:", targetPath);
        resolve(targetPath);
      });
    }).on('error', (err) => {
      fs.unlink(targetPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    await downloadFile(url, outputFile);
    const stats = fs.statSync(outputFile);
    console.log(`Downloaded ZIP size: ${stats.size} bytes`);
    
    // Extract using AdmZip
    console.log("Extracting...");
    const zip = new AdmZip(outputFile);
    zip.extractAllTo('extracted_deflections', true);
    console.log("Extraction complete!");

    // List top level inside extracted_deflections
    const dirs = fs.readdirSync('extracted_deflections');
    console.log("Extracted root contents:", dirs);
  } catch (error) {
    console.error("Error in download & extract:", error);
  }
}

run();
