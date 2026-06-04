import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

const tempZip = path.join(process.cwd(), 'repo_temp5.zip');

async function main() {
  const file = fs.existsSync(tempZip) ? tempZip : path.join(process.cwd(), 'repo_clean.zip');
  if (!fs.existsSync(file)) {
    console.log('Zip file not found!');
    return;
  }
  const zip = new AdmZip(file);
  const entries = zip.getEntries();
  console.log('Looking for tabs related files:');
  for (const entry of entries) {
    if (entry.entryName.toLowerCase().includes('tabs')) {
      console.log('-', entry.entryName);
    }
  }
}

main().catch(console.error);
