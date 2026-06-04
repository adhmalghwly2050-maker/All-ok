import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== Debug Info ===");
console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("Environment Keys:", Object.keys(process.env).filter(k => k.includes('PATH') || k.includes('PWD') || k.includes('DIR')));
console.log("Files at CWD:", fs.readdirSync('.'));
console.log("Files at / (host):", fs.readdirSync('/'));
if (fs.existsSync('/workspace')) {
  console.log("Files in /workspace:", fs.readdirSync('/workspace'));
}
