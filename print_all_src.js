import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    const rel = path.relative(process.cwd(), full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(rel);
    }
  });
  return results;
}

console.log("=== All files in src/ ===");
const srcFiles = walk('src');
console.log(`Total files in src/: ${srcFiles.length}`);
srcFiles.forEach(f => console.log("-", f));
