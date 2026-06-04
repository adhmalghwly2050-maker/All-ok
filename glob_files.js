import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    // skip node_modules
    if (file === 'node_modules' || file === '.git') return;
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

console.log("Searching entire workspace...");
const all = walk('.');
all.forEach(p => {
  const lowercase = p.toLowerCase();
  if (lowercase.includes('analyze3d') || lowercase.includes('capacitor') || lowercase.includes('autodesigner') || lowercase.includes('constructionsheets')) {
    console.log("Found matching file in workspace:", p);
  }
});
console.log(`Total non-node_modules files scanned: ${all.length}`);
