import fs from 'fs';
import path from 'path';

console.log("Files at CWD matching zip or directories:");
fs.readdirSync('.').forEach(f => {
  if (f.endsWith('.zip') || fs.statSync(f).isDirectory()) {
    const size = fs.statSync(f).size;
    console.log("-", f, `(${size} bytes)`);
  }
});
