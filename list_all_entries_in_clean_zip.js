import AdmZip from 'adm-zip';
import fs from 'fs';

const cleanZip = 'repo_clean.zip';
if (!fs.existsSync(cleanZip)) {
  console.log("repo_clean.zip does not exist.");
  process.exit(1);
}

const zip = new AdmZip(cleanZip);
const entries = zip.getEntries();
console.log(`Searching all entries in ${cleanZip} for foundation-designer-pro subfolder files:`);

let count = 0;
entries.forEach(entry => {
  const name = entry.entryName;
  if (name.includes('foundation-designer-pro-dd7dc040-main')) {
    console.log("-", name);
    count++;
  }
});
console.log(`Total subfolder entries found: ${count}`);
