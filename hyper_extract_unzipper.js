import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

const cleanZip = path.join(process.cwd(), 'repo.zip');

async function main() {
  if (!fs.existsSync(cleanZip)) {
    console.error(`repo.zip not found at: ${cleanZip}`);
    process.exit(1);
  }

  console.log('Opening local repo.zip with unzipper...');
  const directory = await unzipper.Open.file(cleanZip);
  console.log(`Zip contains ${directory.files.length} entries.`);

  const rootPrefix = 'Deflections-fix-change-beam-name-done-main/';
  const nestedSrcPrefix = 'Deflections-fix-change-beam-name-done-main/foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/';
  const mainSrcPrefix = 'Deflections-fix-change-beam-name-done-main/src/';

  const writePromises = [];

  // Phase 1: Base files from nested folder
  for (const entry of directory.files) {
    if (entry.type === 'Directory') continue;
    const entryName = entry.path;

    if (entryName.startsWith(nestedSrcPrefix)) {
      const relPath = entryName.substring(nestedSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);
      
      const bufferPromise = entry.buffer().then(async (buf) => {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.writeFile(destPath, buf);
      });
      writePromises.push(bufferPromise);
    }
  }

  // Phase 2: Custom modifications overwriting base files
  for (const entry of directory.files) {
    if (entry.type === 'Directory') continue;
    const entryName = entry.path;

    if (entryName.startsWith(mainSrcPrefix)) {
      const relPath = entryName.substring(mainSrcPrefix.length);
      const destPath = path.join(process.cwd(), 'src', relPath);

      const bufferPromise = entry.buffer().then(async (buf) => {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.writeFile(destPath, buf);
      });
      writePromises.push(bufferPromise);
    }
  }

  // Phase 3: Project Configurations
  const rootConfigs = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'components.json', 'postcss.config.js', 'tailwind.config.js'];
  for (const entry of directory.files) {
    if (entry.type === 'Directory') continue;
    const entryName = entry.path;

    if (entryName.startsWith(rootPrefix)) {
      const relPath = entryName.substring(rootPrefix.length);
      if (rootConfigs.includes(relPath)) {
        const destPath = path.join(process.cwd(), relPath);
        
        const bufferPromise = entry.buffer().then(async (buf) => {
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
          await fs.promises.writeFile(destPath, buf);
        });
        writePromises.push(bufferPromise);
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

  console.log('Extraction sequence finished completely.');
}

main().catch(err => {
  console.error('Fatal hyper extraction error:', err);
  process.exit(1);
});
