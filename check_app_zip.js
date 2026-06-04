import AdmZip from 'adm-zip';
import fs from 'fs';

const zip = new AdmZip('repo.zip');
const entries = zip.getEntries();

for (const entry of entries) {
  if (entry.entryName.includes('App.tsx')) {
    console.log('---', entry.entryName, '---');
    console.log(entry.getData().toString('utf8'));
  }
}
