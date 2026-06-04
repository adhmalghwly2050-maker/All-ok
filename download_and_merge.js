import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

console.log("=== Codebase Downloader and Merger ===");

const BASE_URL = 'https://github.com/adhmalghwly2050-maker/foundation-designer-pro-dd7dc040/archive/refs/heads/main.zip';
const FIX_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';

const baseZipFile = 'base_repo.zip';
const fixZipFile = 'fix_repo.zip';

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    console.log("Downloading from:", fileUrl);
    
    const parsedUrl = new URL(fileUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0-NodeJS'
      }
    };

    https.get(options, (response) => {
      console.log("Status Code:", response.statusCode);
      
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);
        response.resume();
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        } else {
          reject(new Error("Redirect status received without redirect location header"));
        }
        return;
      }
      
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Server returned status code: ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Saved ${fs.statSync(dest).size} bytes to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  // Step 1: Download base zip
  if (fs.existsSync(baseZipFile)) fs.unlinkSync(baseZipFile);
  console.log("\n--- Step 1: Downloading Base Codebase ---");
  await downloadFile(BASE_URL, baseZipFile);
  
  // Step 2: Download fix zip
  if (fs.existsSync(fixZipFile)) fs.unlinkSync(fixZipFile);
  console.log("\n--- Step 2: Downloading Deflections Fix Codebase ---");
  await downloadFile(FIX_URL, fixZipFile);

  // Step 3: Extract Base Codebase
  console.log("\n--- Step 3: Extracting Base Codebase ---");
  const baseZip = new AdmZip(baseZipFile);
  const baseEntries = baseZip.getEntries();
  console.log(`Base ZIP has ${baseEntries.length} entries`);

  const baseSrcPrefix = 'foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  let baseCount = 0;
  for (const entry of baseEntries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;
    if (entryName.startsWith(baseSrcPrefix)) {
      const relPath = entryName.substring(baseSrcPrefix.length);
      const destPath = path.join('src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      baseCount++;
    }
  }
  console.log(`Extracted ${baseCount} files from Base Codebase 'src/' to '/src'.`);

  // Step 4: Extract Deflections Fix (overwriting base files)
  console.log("\n--- Step 4: Extracting and Overwriting with Deflections Fix ---");
  const fixZip = new AdmZip(fixZipFile);
  const fixEntries = fixZip.getEntries();
  console.log(`Fix ZIP has ${fixEntries.length} entries`);

  const fixSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';
  const nestedFixSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  
  let nestedFixCount = 0;
  let fixCount = 0;

  // Extract nested from fix ZIP first (if any)
  for (const entry of fixEntries) {
    if (entry.isDirectory) continue;
    if (entry.entryName.startsWith(nestedFixSrcPrefix)) {
      const relPath = entry.entryName.substring(nestedFixSrcPrefix.length);
      const destPath = path.join('src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      nestedFixCount++;
    }
  }

  // Extract main from fix ZIP (overwriting standard)
  for (const entry of fixEntries) {
    if (entry.isDirectory) continue;
    if (entry.entryName.startsWith(fixSrcPrefix)) {
      const relPath = entry.entryName.substring(fixSrcPrefix.length);
      const destPath = path.join('src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      fixCount++;
    }
  }
  console.log(`Overwrote ${nestedFixCount} nested and ${fixCount} modified files from Deflections Fix.`);

  // Step 5: Extract root configs from Base and Fix
  console.log("\n--- Step 5: Configuring root files ---");
  const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
  
  const baseRootPrefix = 'foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/';
  for (const entry of baseEntries) {
    if (entry.isDirectory) continue;
    if (entry.entryName.startsWith(baseRootPrefix)) {
      const relPath = entry.entryName.substring(baseRootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        fs.writeFileSync(relPath, entry.getData());
      }
    }
  }

  const fixRootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  for (const entry of fixEntries) {
    if (entry.isDirectory) continue;
    if (entry.entryName.startsWith(fixRootPrefix)) {
      const relPath = entry.entryName.substring(fixRootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        fs.writeFileSync(relPath, entry.getData());
      }
    }
  }

  // Rewrite standard App.tsx
  const appPath = 'src/App.tsx';
  const customAppCode = `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;`;

  fs.writeFileSync(appPath, customAppCode);
  console.log("App.tsx configured successfully.");

  // Cleanup Zip files
  if (fs.existsSync(baseZipFile)) fs.unlinkSync(baseZipFile);
  if (fs.existsSync(fixZipFile)) fs.unlinkSync(fixZipFile);
  
  console.log("\nSUCCESS! Whole full-merge is complete!");
}

main().catch(err => console.error("Error in downloader of base + fix:", err));
