import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const releaseRoot = path.join(repositoryRoot, 'sql', 'ProductionDatabaseRelease');
const generatedRoot = path.join(releaseRoot, 'generated');
const manifestPath = path.join(releaseRoot, 'release-manifest.json');

function normalize(value) {
    return String(value || '').replace(/\r\n?/g, '\n').trimEnd();
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function relativePath(filePath) {
    return path.relative(repositoryRoot, filePath).replace(/\\/g, '/');
}

function parseQualifiedName(value) {
    const parts = String(value || '')
        .replace(/\s+/g, '')
        .split('.')
        .map((part) => part.replace(/^\[|\]$/g, ''))
        .filter(Boolean);
    return {
        schema: parts.length > 1 ? parts.at(-2) : 'dbo',
        name: parts.at(-1) || ''
    };
}

function findCanonicalObjectHeaders(sql, sourceFile) {
    const results = [];
    const modulePattern = /^\s*(?:CREATE(?:\s+OR\s+ALTER)?|ALTER)\s+(PROCEDURE|PROC|VIEW|FUNCTION|TRIGGER|TABLE)\s+((?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*))?)/gim;
    let match;
    while ((match = modulePattern.exec(sql))) {
        const type = /PROC/i.test(match[1]) ? 'PROCEDURE' : match[1].toUpperCase();
        const qualified = parseQualifiedName(match[2]);
        results.push({
            key: `${type}:${qualified.schema.toLowerCase()}.${qualified.name.toLowerCase()}`,
            type,
            schema: qualified.schema,
            name: qualified.name,
            sourceFile
        });
    }
    const indexPattern = /^\s*CREATE\s+(?:UNIQUE\s+)?(?:CLUSTERED\s+|NONCLUSTERED\s+)?INDEX\s+(\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)\s+ON\s+((?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*))?)/gim;
    while ((match = indexPattern.exec(sql))) {
        const parent = parseQualifiedName(match[2]);
        const name = match[1].replace(/^\[|\]$/g, '');
        results.push({
            key: `INDEX:${parent.schema.toLowerCase()}.${parent.name.toLowerCase()}.${name.toLowerCase()}`,
            type: 'INDEX',
            schema: parent.schema,
            name,
            parentName: parent.name,
            sourceFile
        });
    }
    return results;
}

async function readSource(relativeFile) {
    const absolutePath = path.resolve(repositoryRoot, relativeFile);
    const expectedRoot = `${path.resolve(releaseRoot)}${path.sep}`.toLowerCase();
    if (!absolutePath.toLowerCase().startsWith(expectedRoot)) {
        throw new Error(`Manifest source nằm ngoài ProductionDatabaseRelease: ${relativeFile}`);
    }
    const content = normalize(await fsp.readFile(absolutePath, 'utf8'));
    return { relativeFile, absolutePath, content, sha256: sha256(content) };
}

function sqlHeader(kind, manifest, packageManifestSha256) {
    const labels = {
        install: 'INSTALL_ALL',
        verify: 'VERIFY_ALL',
        rollback: 'ROLLBACK_ALL',
        dropCandidates: 'DROP_CANDIDATES'
    };
    return normalize(`
/*
  ${labels[kind]} - ${manifest.releaseId}
  FILE SINH TỰ ĐỘNG. KHÔNG SỬA TRỰC TIẾP.
  Build: node ./scripts/db-release/build-production-database-release.mjs
  Package manifest SHA-256: ${packageManifestSha256}
*/
:on error exit
:setvar TargetDatabase "${manifest.targetDatabaseDefault}"
:setvar ReleaseMode "${manifest.releaseModeDefault}"

USE [$(TargetDatabase)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
`);
}

function renderCombined(kind, manifest, sources, packageManifestSha256) {
    const output = [sqlHeader(kind, manifest, packageManifestSha256)];
    for (const source of sources) {
        output.push('');
        output.push(`/* ===== SOURCE: ${source.relativeFile} | SHA-256: ${source.sha256} ===== */`);
        output.push(source.content.replaceAll('PENDING_BUILD_MANIFEST', packageManifestSha256));
        output.push(`/* ===== END SOURCE: ${source.relativeFile} ===== */`);
    }
    return `${output.join('\n')}\n`;
}

function assertSingleCanonicalSource(sources) {
    const objects = new Map();
    for (const source of sources) {
        for (const object of findCanonicalObjectHeaders(source.content, source.relativeFile)) {
            if (!objects.has(object.key)) objects.set(object.key, []);
            objects.get(object.key).push(object);
        }
    }
    const duplicates = [...objects.values()].filter((items) => items.length > 1);
    if (duplicates.length) {
        const details = duplicates.map((items) =>
            `${items[0].schema}.${items[0].name}: ${items.map((item) => item.sourceFile).join(', ')}`
        );
        throw new Error(`Cùng object có nhiều canonical source:\n${details.join('\n')}`);
    }
    return [...objects.values()].map((items) => items[0]);
}

async function main() {
    const manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'));
    if (!manifest.releaseId || !manifest.files) {
        throw new Error('release-manifest.json không hợp lệ.');
    }
    if (Array.isArray(manifest.blockingIssues) && manifest.blockingIssues.length) {
        console.warn(`Package có ${manifest.blockingIssues.length} blocking issue; INSTALL_ALL sẽ fail ở precheck.`);
    }
    await fsp.mkdir(generatedRoot, { recursive: true });

    const sourceGroups = {};
    for (const kind of ['install', 'verify', 'rollback', 'dropCandidates']) {
        const files = manifest.files[kind];
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error(`Manifest thiếu source group: ${kind}`);
        }
        sourceGroups[kind] = [];
        for (const file of files) sourceGroups[kind].push(await readSource(file));
    }

    const canonicalObjects = assertSingleCanonicalSource(sourceGroups.install);
    const outputNames = {
        install: 'HRM_DATABASE_INSTALL_ALL.sql',
        verify: 'HRM_DATABASE_VERIFY_ALL.sql',
        rollback: 'HRM_DATABASE_ROLLBACK_ALL.sql',
        dropCandidates: 'HRM_DATABASE_DROP_CANDIDATES.sql'
    };
    const generated = {};
    const sourceHashes = {};
    for (const sources of Object.values(sourceGroups)) {
        for (const source of sources) sourceHashes[source.relativeFile] = source.sha256;
    }
    const sortedSourceHashes = Object.fromEntries(Object.entries(sourceHashes).sort());
    const packageManifestSha256 = sha256(JSON.stringify({
        releaseId: manifest.releaseId,
        targetDatabaseDefault: manifest.targetDatabaseDefault,
        releaseModeDefault: manifest.releaseModeDefault,
        files: manifest.files,
        sourceSha256: sortedSourceHashes
    }));

    for (const kind of Object.keys(outputNames)) {
        const content = renderCombined(
            kind,
            manifest,
            sourceGroups[kind],
            packageManifestSha256
        );
        const outputPath = path.join(generatedRoot, outputNames[kind]);
        await fsp.writeFile(outputPath, content, 'utf8');
        generated[outputNames[kind]] = {
            path: relativePath(outputPath),
            sha256: sha256(content),
            bytes: Buffer.byteLength(content, 'utf8')
        };
    }

    manifest.sourceSha256 = sortedSourceHashes;
    manifest.packageManifestSha256 = packageManifestSha256;
    manifest.canonicalObjectCount = canonicalObjects.length;
    manifest.canonicalObjects = canonicalObjects
        .sort((left, right) => left.key.localeCompare(right.key))
        .map(({ key, ...object }) => object);
    manifest.generated = generated;
    await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    for (const [name, details] of Object.entries(generated)) {
        console.log(`${name} ${details.sha256}`);
    }
    console.log(`Canonical objects: ${canonicalObjects.length}`);
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
