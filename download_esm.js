import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const url = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const cleanZip = 'repo_clean.zip';

console.log("=== Node ESM Downloader ===");

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    console.log("Downloading from:", fileUrl);
    
    const parsedUrl = new URL(fileUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    https.get(options, (response) => {
      console.log("Status Code:", response.statusCode);
      
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);
        // CRITICAL: Resume response to free socket before following redirect
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
  if (fs.existsSync(cleanZip)) fs.unlinkSync(cleanZip);
  
  await downloadFile(url, cleanZip);
  
  console.log("Reading ZIP using AdmZip...");
  const zip = new AdmZip(cleanZip);
  const entries = zip.getEntries();
  console.log(`Total ZIP entries: ${entries.length}`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  let nestedCount = 0;
  let mainCount = 0;
  let rootCount = 0;

  console.log("Extracting nested files...");
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join('src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      nestedCount++;
    }
  }

  console.log("Extracting main files...");
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join('src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      mainCount++;
    }
  }

  console.log("Extracting root config files...");
  const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        const destPath = relPath;
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        rootCount++;
      }
    }
  }

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
  
  if (fs.existsSync(cleanZip)) fs.unlinkSync(cleanZip);
  console.log(`SUCCESS! Extracted ${nestedCount} nested, ${mainCount} main, and ${rootCount} root files.`);
}

main().catch(err => console.error("Error running download_esm.js:", err));
