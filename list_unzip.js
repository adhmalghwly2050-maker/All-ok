import unzipper from 'unzipper';
import fs from 'fs';

async function main() {
  const directory = await unzipper.Open.file('repo.zip');
  console.log(`repo.zip has ${directory.files.length} files`);
  directory.files.slice(0, 100).forEach(file => {
    console.log("-", file.path);
  });
  if (directory.files.length > 100) {
    console.log("... and more");
  }
}

main().catch(err => console.error("Error listing unzipper:", err));
