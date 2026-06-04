import fs from 'fs';

['repo.zip', 'repo_clean.zip'].forEach(f => {
  if (fs.existsSync(f)) {
    console.log(`${f} size: ${fs.statSync(f).size} bytes`);
  } else {
    console.log(`${f} not found`);
  }
});
