import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'scripts', 'frontend-bundle.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const checkOnly = process.argv.includes('--check');

function resolveAll(kind) {
  const files = manifest[kind];
  if (!Array.isArray(files) || files.length === 0) throw new Error(`${kind} manifest must contain at least one file`);
  const seen = new Set();
  return files.map((file) => {
    if (seen.has(file)) throw new Error(`Duplicate ${kind} manifest entry: ${file}`);
    seen.add(file);
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) throw new Error(`Missing ${kind} manifest file: ${file}`);
    return { file, absolute };
  });
}

function bundle(entries, label) {
  return entries.map(({ file, absolute }) => {
    const source = fs.readFileSync(absolute, 'utf8').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
    return `/* --- ${path.basename(file)} --- */\n${source}\n`;
  }).join('\n') + `/* --- end ${label} --- */\n`;
}

const css = resolveAll('css');
const js = resolveAll('js');
const cssOutput = path.join(root, manifest.outputs.css);
const jsOutput = path.join(root, manifest.outputs.js);

if (checkOnly) {
  console.log(`Manifest OK: ${css.length} CSS + ${js.length} JS files`);
  console.log(`Would write ${manifest.outputs.css} and ${manifest.outputs.js}`);
} else {
  fs.writeFileSync(cssOutput, bundle(css, 'css'), 'utf8');
  fs.writeFileSync(jsOutput, bundle(js, 'js'), 'utf8');
  console.log(`Built ${css.length} CSS files -> ${manifest.outputs.css}`);
  console.log(`Built ${js.length} JS files -> ${manifest.outputs.js}`);
}
