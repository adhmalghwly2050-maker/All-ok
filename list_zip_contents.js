import AdmZip from 'adm-zip';
import fs from 'fs';

console.log("=== Checking repo.zip ===");
if (fs.existsSync('repo.zip')) {
  try {
    const zip = new AdmZip('repo.zip');
    const entries = zip.getEntries();
    console.log(`repo.zip has ${entries.length} entries`);
    entries.slice(0, 50).forEach(entry => {
      console.log("-", entry.entryName);
    });
    if (entries.length > 50) console.log("... and more");
  } catch (e) {
    console.log("Error reading repo.zip:", e.message);
  }
} else {
  console.log("repo.zip does not exist");
}

console.log("\n=== Checking repo_clean.zip ===");
if (fs.existsSync('repo_clean.zip')) {
  try {
    const zip = new AdmZip('repo_clean.zip');
    const entries = zip.getEntries();
    console.log(`repo_clean.zip has ${entries.length} entries`);
    entries.slice(0, 50).forEach(entry => {
      console.log("-", entry.entryName);
    });
    if (entries.length > 50) console.log("... and more");
  } catch (e) {
    console.log("Error reading repo_clean.zip:", e.message);
  }
} else {
  console.log("repo_clean.zip does not exist");
}
