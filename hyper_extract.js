import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const ZIP_URL = 'https://github.com/Adhamalghooly/Deflections-fix-change-beam-name-done/archive/refs/heads/main.zip';
const cleanZip = path.join(process.cwd(), 'hyper_repo.zip');

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
  if (fs.existsSync(cleanZip)) {
    try { fs.unlinkSync(cleanZip); } catch (e) {}
  }

  console.log('Hyper-Downloading fresh ZIP...');
  await downloadFile(ZIP_URL, cleanZip);
  const size = fs.statSync(cleanZip).size;
  console.log(`Downloaded. Size: ${size} bytes`);

  const zip = new AdmZip(cleanZip);
  const entries = zip.getEntries();
  console.log(`Zip contains ${entries.length} entries.`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  // We will build a list of write-actions to process in parallel
  const writePromises = [];

  // Phase 1: Read all base files from nested folder and place in memory/schedule write
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      
      writePromises.push((async () => {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.writeFile(destPath, entry.getData());
      })());
    }
  }

  // Phase 2: Read of modified files from the root src/ (to overwrite nested ones)
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);

      writePromises.push((async () => {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.writeFile(destPath, entry.getData());
      })());
    }
  }

  // Phase 3: Project Configurations
  const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;

    if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        const destPath = path.join(process.cwd(), relPath);
        
        writePromises.push((async () => {
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
          await fs.promises.writeFile(destPath, entry.getData());
        })());
      }
    }
  }

  console.log(`Scheduling ${writePromises.length} parallel write jobs to disk...`);
  await Promise.all(writePromises);
  console.log('All parallel write jobs completed successfully.');

  // Check and preserve App.tsx router configuration
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

  await fs.promises.writeFile(appPath, customAppCode);
  console.log('App.tsx router confirmed.');

  // Clean up zip
  try { fs.unlinkSync(cleanZip); } catch (e) {}
  console.log('Extraction sequence finished with hyper-mode.');
}

main().catch(err => {
  console.error('Fatal hyper extraction error:', err);
  process.exit(1);
});
