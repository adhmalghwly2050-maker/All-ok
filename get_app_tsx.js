import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const tempZip = path.join(process.cwd(), 'repo_temp.zip');

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
  
  const mainPrefix = 'Deflections-fix-change-beam-name-done-main/src/App.tsx';
  const nestedPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/App.tsx';
  
  let entry = entries.find(e => e.entryName === mainPrefix);
  if (!entry) {
    entry = entries.find(e => e.entryName === nestedPrefix);
  }
  
  if (entry) {
    const code = entry.getData().toString('utf8');
    console.log('FOUND App.tsx CONENT:');
    console.log(code);
    fs.writeFileSync('src/App.tsx', code);
    console.log('App.tsx written to src/App.tsx');
  } else {
    console.log('App.tsx NOT found in ZIP!');
  }
  
  fs.unlinkSync(tempZip);
}

main().catch(console.error);
