import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

const targetDir = 'extracted_deflections/Deflections-fix-change-beam-name-done-main/src';
if (fs.existsSync(targetDir)) {
  const allFiles = walk(targetDir);
  console.log(`Searching in ${allFiles.length} files...`);
  allFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('use-toast') || content.includes('useToast') || f.includes('toast')) {
      console.log("Match in file:", f);
    }
  });
} else {
  console.log("targetDir not found");
}
