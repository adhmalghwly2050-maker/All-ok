import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const url = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const cleanZip = 'repo_clean.zip';

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    console.log("Downloading from:", fileUrl);
    
    // Parse URL to pass headers
    const parsedUrl = new URL(fileUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0NodeJS'
      }
    };

    https.get(options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
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
  
  console.log("Extracting entries...");
  const zip = new AdmZip(cleanZip);
  const entries = zip.getEntries();
  console.log(`Total ZIP entries: ${entries.length}`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  let nestedCount = 0;
  let mainCount = 0;
  let rootCount = 0;

  // Extract nested source files
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      nestedCount++;
    }
  }

  // Extract main source files (overwriting any nested)
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, entry.getData());
      mainCount++;
    }
  }

  // Extract root files
  const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        const destPath = path.join(process.cwd(), relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        rootCount++;
      }
    }
  }

  // Rewrite standard App.tsx
  const appPath = path.join(process.cwd(), 'src/App.tsx');
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
  console.log(`Done! Extracted ${nestedCount} nested, ${mainCount} main, and ${rootCount} root config files.`);
}

main().catch(err => console.error("Error running download/extract script:", err));
