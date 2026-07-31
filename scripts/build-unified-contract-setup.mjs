import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '..');
const installerPath = path.join(
    repositoryRoot,
    'sql',
    'Setup',
    'UnifiedContractRollout_INSTALL_ALL.sql'
);
const outputPath = path.join(
    repositoryRoot,
    'sql',
    'Setup',
    'UnifiedContractRollout_INSTALL_ALL_GENERATED.sql'
);
const includePattern = /^\s*:r\s+(.+?)\s*$/i;

async function expandSql(filePath, stack = []) {
    const absolutePath = path.resolve(filePath);
    if (stack.includes(absolutePath)) {
        throw new Error(`Phát hiện vòng lặp SQLCMD include: ${absolutePath}`);
    }
    const content = await fs.readFile(absolutePath, 'utf8');
    const nextStack = stack.concat(absolutePath);
    const output = [];

    for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
        const match = line.match(includePattern);
        if (!match) {
            output.push(line);
            continue;
        }
        const rawInclude = match[1].trim().replace(/^["']|["']$/g, '');
        const includedPath = path.resolve(path.dirname(absolutePath), rawInclude);
        const relativeName = path.relative(repositoryRoot, includedPath).replace(/\\/g, '/');
        output.push('');
        output.push(`/* ===== BẮT ĐẦU ${relativeName} ===== */`);
        output.push(await expandSql(includedPath, nextStack));
        output.push(`/* ===== KẾT THÚC ${relativeName} ===== */`);
        output.push('');
    }
    return output.join('\n');
}

const expanded = await expandSql(installerPath);
const header = [
    '/*',
    '  FILE SINH TỰ ĐỘNG - KHÔNG SỬA TRỰC TIẾP.',
    '  Nguồn: scripts/build-unified-contract-setup.mjs',
    '*/',
    ''
].join('\n');
await fs.writeFile(outputPath, `${header}${expanded.trimEnd()}\n`, 'utf8');
console.log(path.relative(repositoryRoot, outputPath).replace(/\\/g, '/'));
