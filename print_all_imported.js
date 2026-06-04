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
  const all = walk(targetDir);
  console.log(`Total files in ${targetDir}:`, all.length);
  all.forEach(p => console.log(p));
} else {
  console.log("Not found");
}
