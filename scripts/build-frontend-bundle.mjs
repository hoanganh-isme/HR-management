import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptsDir, '..');
const srcDir = path.join(rootDir, 'src');
const manifestPath = path.join(scriptsDir, 'frontend-bundle.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const generatedHeader = '/* GENERATED FILE - DO NOT EDIT DIRECTLY */\n';

function buildBundle(files, outputPath, kind) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error(`${kind} manifest is empty`);
  }

  const duplicates = files.filter((file, index) => files.indexOf(file) !== index);
  if (duplicates.length) {
    throw new Error(`${kind} manifest contains duplicates: ${[...new Set(duplicates)].join(', ')}`);
  }

  const sections = files.map((relativePath) => {
    const absolutePath = path.join(srcDir, relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`${kind} source is missing: ${relativePath}`);
    }
    const source = fs.readFileSync(absolutePath, 'utf8').replace(/^\uFEFF/, '');
    return `/* --- ${relativePath} --- */\n${source.trimEnd()}\n`;
  });

  const output = generatedHeader + sections.join('\n');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');
  const size = (Buffer.byteLength(output) / 1024).toFixed(1);
  console.log(`${kind}: ${files.length} files -> ${path.relative(rootDir, outputPath)} (${size}KB)`);
}

buildBundle(manifest.css, path.join(srcDir, 'css', 'styles.bundle.css'), 'CSS');
buildBundle(manifest.js, path.join(srcDir, 'js', 'app.bundle.js'), 'JS');

