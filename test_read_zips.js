import AdmZip from 'adm-zip';
import fs from 'fs';

console.log("=== Local Zip Read Diagnostic ===");

function checkZip(filename) {
  if (!fs.existsSync(filename)) {
    console.log(`${filename} does NOT exist.`);
    return;
  }
  const size = fs.statSync(filename).size;
  console.log(`\nChecking ${filename} (size: ${size} bytes)...`);
  try {
    const zip = new AdmZip(filename);
    const entries = zip.getEntries();
    console.log(`${filename} is VALID! Found ${entries.length} entries.`);
    entries.slice(0, 10).forEach(e => console.log("-", e.entryName));
    if (entries.length > 10) console.log("...");
  } catch (err) {
    console.log(`Failed to read ${filename} with AdmZip:`, err.message);
  }
}

checkZip('repo.zip');
checkZip('repo_clean.zip');
checkZip('deflections_fix.zip');
