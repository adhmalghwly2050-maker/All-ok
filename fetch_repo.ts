import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

function runCmd(cmd: string) {
  try {
    console.log(`Running: ${cmd}`);
    return execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (err: any) {
    console.error(`Failed: ${cmd}`, err.message);
    if (err.stderr) console.error(err.stderr.toString());
    throw err;
  }
}

async function main() {
  console.log("Starting repository import...");
  try {
    // Check if git is available
    console.log("Checking if git is available...");
    try {
      runCmd("git --version");
      console.log("Git is available! Cloning the repository...");
      runCmd("rm -rf temp_repo");
      runCmd("git clone https://github.com/Adhamalghooly/Offline-solve.git temp_repo");
      console.log("Cloned successfully!");
      copyAndCleanup();
      return;
    } catch (e) {
      console.log("Git clone failed or git is not available. Falling back to HTTP zip download...");
    }

    // Fallback: Download ZIP
    await downloadAndExtractZip();
  } catch (err: any) {
    console.error("Critical error in main:", err);
    process.exit(1);
  }
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Don't overwrite the script itself
    if (path.basename(src) !== 'fetch_repo.ts' && path.basename(src) !== 'download.ts') {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
}

function copyAndCleanup() {
  const sourceDir = path.join(process.cwd(), 'temp_repo');
  console.log(`Copying files from ${sourceDir} to ${process.cwd()}...`);
  
  // List files in temp_repo
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    if (file === '.git') continue;
    copyRecursiveSync(path.join(sourceDir, file), path.join(process.cwd(), file));
  }
  
  console.log("Files copied successfully!");
  try {
    // Delete temp_repo
    fs.rmSync(sourceDir, { recursive: true, force: true });
    console.log("Cleanup complete!");
  } catch (err) {
    console.warn("Cleanup warning:", err);
  }
}

async function downloadAndExtractZip() {
  // We can try to download from main or master branch
  const urls = [
    "https://github.com/Adhamalghooly/Offline-solve/archive/refs/heads/main.zip",
    "https://github.com/Adhamalghooly/Offline-solve/archive/refs/heads/master.zip"
  ];
  
  let downloaded = false;
  const zipPath = path.join(process.cwd(), 'repo.zip');
  
  for (const url of urls) {
    try {
      console.log(`Attempting download from: ${url}`);
      await downloadFile(url, zipPath);
      console.log(`Downloaded ZIP to ${zipPath}`);
      downloaded = true;
      break;
    } catch (err) {
      console.warn(`Failed to download from ${url}:`, err);
    }
  }
  
  if (!downloaded) {
    throw new Error("Could not download the repository ZIP file from GitHub.");
  }
  
  // Extract zip using unzip if available, else standard command or library
  try {
    console.log("Attempting unzip using system command...");
    runCmd(`unzip -o ${zipPath} -d temp_unzip`);
  } catch (e) {
    console.log("Unzip command failed or not available.");
    throw new Error("unzip command was not available to extract the ZIP. Please make sure we have unzip available or install the adm-zip package.");
  }
  
  // Locate the extracted directory (usually Offline-solve-main or Offline-solve-master)
  const unzipDir = path.join(process.cwd(), 'temp_unzip');
  const extractedDirs = fs.readdirSync(unzipDir);
  const repoDirName = extractedDirs.find(d => fs.statSync(path.join(unzipDir, d)).isDirectory());
  
  if (!repoDirName) {
    throw new Error("Could not find any directory inside the extracted zip");
  }
  
  const extractedRepoPath = path.join(unzipDir, repoDirName);
  
  // Copy all files from extractedRepoPath
  console.log(`Copying files from ${extractedRepoPath} to ${process.cwd()}...`);
  const files = fs.readdirSync(extractedRepoPath);
  for (const file of files) {
    copyRecursiveSync(path.join(extractedRepoPath, file), path.join(process.cwd(), file));
  }
  
  // Cleanup
  console.log("Cleaning up temporary download files...");
  fs.rmSync(zipPath, { force: true });
  fs.rmSync(unzipDir, { recursive: true, force: true });
  console.log("Fallback ZIP extraction and copy completed successfully!");
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS/Agent' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect status ${res.statusCode} with no location header`));
        }
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Server returned status code: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

main();
