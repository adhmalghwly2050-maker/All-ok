import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const cleanZip = path.join(process.cwd(), 'repo_clean.zip');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
  });
}

async function main() {
  if (fs.existsSync(cleanZip)) fs.unlinkSync(cleanZip);

  console.log('Downloading fresh repo_clean.zip...');
  await downloadFile(ZIP_URL, cleanZip);
  console.log('Clean download finished. Size:', fs.statSync(cleanZip).size);

  const zip = new AdmZip(cleanZip);
  const entries = zip.getEntries();
  console.log(`Total ZIP entries: ${entries.length}`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  let nestedCount = 0;
  let mainCount = 0;
  let rootCount = 0;

  console.log('Extracting Base UI & Code Files (Step 1)...');
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

  console.log('Extracting/Overwriting Modified Code Files (Step 2)...');
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

  console.log('Extracting Project Configuration Files (Step 3)...');
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

  // Double check that we have a valid App.tsx (ensure we didn't overwrite with a blank one)
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
  console.log('Confirmed valid App.tsx was written to src/App.tsx');

  // Cleanup cleanZip
  fs.unlinkSync(cleanZip);
  console.log('Cleaned up zip.');
  console.log(`COMPLETED SUCCESSFULLY: Extracted ${nestedCount} nested, ${mainCount} modified, ${rootCount} root configs!`);
}

main().catch(err => {
  console.error('Fatal Extraction error:', err);
  process.exit(1);
});
