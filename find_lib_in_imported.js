import fs from 'fs';
import path from 'path';

const libDir = 'foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/lib';
if (fs.existsSync(libDir)) {
  console.log("Files in imported lib folder:", fs.readdirSync(libDir));
} else {
  console.log("imported lib folder NOT found");
}

const hooksDir = 'foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/hooks';
if (fs.existsSync(hooksDir)) {
  console.log("Files in imported hooks folder:", fs.readdirSync(hooksDir));
} else {
  console.log("imported hooks folder NOT found");
}

const slabFEMEngineDir = 'foundation-designer-pro-dd7dc040-main/imported/artifacts/structural-app/src/slabFEMEngine';
if (fs.existsSync(slabFEMEngineDir)) {
  console.log("Files in imported slabFEMEngine folder:", fs.readdirSync(slabFEMEngineDir));
} else {
  console.log("imported slabFEMEngine folder NOT found");
}
