import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const releaseRoot = path.join(repositoryRoot, 'sql', 'ProductionDatabaseRelease');
const analysisRoot = path.join(releaseRoot, 'analysis');
const reportsRoot = path.join(releaseRoot, 'reports');
const sourceRoot = path.join(releaseRoot, 'source');
const archiveRoot = path.join(releaseRoot, 'archive');
const zipPath = path.resolve(process.argv[2] || '');
const releaseId = 'HRM_DB_CLEANUP_20260729';
const requiredEntryNames = new Map([
    ['schemadatagoc.sql', 'original'],
    ['schemadatatest.sql', 'test']
]);

if (!process.argv[2] || !fs.existsSync(zipPath)) {
    console.error('MISSING_SCHEMA_PACKAGE');
    process.exit(2);
}

const require = createRequire(import.meta.url);
const yauzl = require(path.join(repositoryRoot, 'backend-app', 'node_modules', 'yauzl'));

const objectTypeOrder = new Map([
    ['Table', 1],
    ['Constraint', 2],
    ['Index', 3],
    ['View', 4],
    ['Function', 5],
    ['StoredProcedure', 6],
    ['Trigger', 7]
]);

const frameworkNames = new Set([
    'API_TruyVanDong_V2',
    'API_LuuDong_V2',
    'API_XoaDong_V2',
    'API_Web_FieldContractResolveV2',
    'API_Web_GridFieldSchemaV2',
    'API_Web_GridFieldCompareV2',
    'API_Web_JoinFieldSchemaV2',
    'API_Web_LookupSchemaV2',
    'API_Web_UpdateFieldFormat',
    'API_Web_DiscoverFieldContractCandidatesV2',
    'API_Web_SeedSafeFieldContractsV2',
    'API_Web_CutoverSafeFieldContractsV2',
    'API_Web_RollbackFieldContractV2',
    'API_Web_GroupFormPermissionV2',
    'API_Phase3SimpleCrudRegistry',
    'API_Phase4JoinRegistry',
    'API_FieldMetadataContractRegistry'
]);

const dashboardNames = new Set([
    'API_HR_Dashboard_AuthorizedBranches',
    'API_HR_Dashboard_GetBranches',
    'API_HR_Dashboard_OverviewToday',
    'API_HR_Dashboard_Demographics',
    'API_HR_Dashboard_Department',
    'API_HR_Dashboard_Birthdays',
    'API_HR_Dashboard_Payroll',
    'API_HR_Dashboard_ContractsExpiring'
]);

const legacyCompatibilityNames = new Set([
    'API_TruyVanDong',
    'API_LuuDong',
    'API_XoaDong'
]);

const safeOriginalOnlyNames = new Set(['API_BaoHiem_PersonLookup']);
const explicitDeprecatedNames = new Set(['API_BangThueTNCN_V2']);
const metadataTableNames = new Set(['WA_API', 'SY_FrmLstTbl']);

function normalizeLineEndings(value) {
    return String(value || '').replace(/\r\n?/g, '\n');
}

function trimLineEnds(value) {
    return normalizeLineEndings(value)
        .split('\n')
        .map((line) => line.replace(/[ \t]+$/g, ''))
        .join('\n')
        .trimEnd();
}

function semanticDefinition(value) {
    return trimLineEnds(value)
        .replace(/\/\*{5,}\s*Object:[\s\S]*?Script Date:[\s\S]*?\*{5,}\//gi, '')
        .replace(/^\s*USE\s+\[[^\]]+\]\s*;?\s*$/gim, '')
        .replace(/\b(CREATE\s+OR\s+ALTER|ALTER)\s+(PROCEDURE|PROC|VIEW|FUNCTION|TRIGGER)\b/i, 'CREATE $2')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function sha256(value, encoding = 'utf8') {
    return crypto.createHash('sha256').update(value, encoding).digest('hex');
}

function sqlModuleHash(value) {
    const normalized = trimLineEnds(value);
    return crypto.createHash('sha256').update(Buffer.from(normalized, 'utf16le')).digest('hex');
}

function normalizedName(value) {
    return String(value || '').replace(/^\[|\]$/g, '').trim();
}

function objectKey(object) {
    const parent = object.parentName ? `:${object.parentName.toLowerCase()}` : '';
    return `${object.type.toLowerCase()}:${object.schema.toLowerCase()}:${object.name.toLowerCase()}${parent}`;
}

function compareObjects(left, right) {
    return (objectTypeOrder.get(left.type) || 99) - (objectTypeOrder.get(right.type) || 99)
        || left.schema.localeCompare(right.schema)
        || left.name.localeCompare(right.name)
        || String(left.parentName || '').localeCompare(String(right.parentName || ''));
}

function parseQualifiedName(value) {
    const cleaned = String(value || '').trim();
    const parts = cleaned.split('.').map(normalizedName).filter(Boolean);
    if (parts.length >= 2) {
        return { schema: parts.at(-2), name: parts.at(-1) };
    }
    return { schema: 'dbo', name: parts[0] || '' };
}

function parseObjectHeader(line) {
    const moduleMatch = line.match(
        /^\s*(CREATE(?:\s+OR\s+ALTER)?|ALTER)\s+(PROCEDURE|PROC|VIEW|FUNCTION|TRIGGER|TABLE)\s+((?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*))?)/i
    );
    if (moduleMatch) {
        const rawType = moduleMatch[2].toUpperCase();
        const type = rawType === 'PROC' || rawType === 'PROCEDURE'
            ? 'StoredProcedure'
            : rawType[0] + rawType.slice(1).toLowerCase();
        const qualified = parseQualifiedName(moduleMatch[3].replace(/\s+/g, ''));
        return { type, ...qualified, header: moduleMatch[0] };
    }

    const indexMatch = line.match(
        /^\s*CREATE\s+(?:UNIQUE\s+)?(?:CLUSTERED\s+|NONCLUSTERED\s+)?INDEX\s+(\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)\s+ON\s+((?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*))?)/i
    );
    if (indexMatch) {
        const parent = parseQualifiedName(indexMatch[2].replace(/\s+/g, ''));
        return {
            type: 'Index',
            schema: parent.schema,
            name: normalizedName(indexMatch[1]),
            parentName: parent.name,
            header: indexMatch[0]
        };
    }

    const constraintMatch = line.match(
        /^\s*ALTER\s+TABLE\s+((?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*))?)\s+(?:WITH\s+(?:CHECK|NOCHECK)\s+)?ADD\s+(?:CONSTRAINT\s+)?(\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_$#]*)/i
    );
    if (constraintMatch) {
        const parent = parseQualifiedName(constraintMatch[1].replace(/\s+/g, ''));
        return {
            type: 'Constraint',
            schema: parent.schema,
            name: normalizedName(constraintMatch[2]),
            parentName: parent.name,
            header: constraintMatch[0]
        };
    }
    return null;
}

function extractParameters(definition) {
    if (!/^\s*(?:CREATE(?:\s+OR\s+ALTER)?|ALTER)\s+(?:PROCEDURE|PROC|FUNCTION)\b/i.test(definition)) {
        return [];
    }
    const headerEnd = definition.search(/\bAS\b|\bRETURNS\b/i);
    const header = headerEnd >= 0 ? definition.slice(0, headerEnd) : definition.slice(0, 4000);
    const parameters = [];
    const pattern = /@([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?)(?:\s*=\s*([^,\n]+))?(?:\s+(OUTPUT|OUT|READONLY))?/gi;
    let match;
    while ((match = pattern.exec(header))) {
        parameters.push({
            name: `@${match[1]}`,
            dataType: match[2].replace(/\s+/g, ' ').trim(),
            defaultValue: String(match[3] || '').trim() || null,
            modifier: String(match[4] || '').toUpperCase() || null
        });
    }
    return parameters;
}

function extractObjectSignals(definition) {
    const names = new Set();
    const pattern = /\b(?:FROM|JOIN|UPDATE|INTO|MERGE\s+INTO|DELETE\s+FROM|EXEC(?:UTE)?)\s+(?:dbo\.)?\[?([A-Za-z_][A-Za-z0-9_$#]*)\]?/gi;
    let match;
    while ((match = pattern.exec(definition))) names.add(match[1]);
    return {
        referencedObjects: [...names].sort(),
        usesTransaction: /\bBEGIN\s+TRAN(?:SACTION)?\b/i.test(definition),
        usesSoftDelete: /\b(?:isDeleted|DeletedAt|isDelete)\b/i.test(definition),
        usesAuditFields: /\b(?:CreatedAt|CreatedBy|UpdatedAt|UpdatedBy|UserAutoID)\b/i.test(definition),
        returnsCodeMessage: /\bcode\b[\s\S]{0,300}\b(?:msg|message)\b/i.test(definition),
        usesBranchPolicy: /\b(?:BranchID|TenantID|CompanyID|DonViID)\b/i.test(definition)
    };
}

function finalizeObject(header, lines, sourceName, startLine, endLine) {
    const definition = trimLineEnds(lines.join('\n'));
    const signals = extractObjectSignals(definition);
    return {
        type: header.type,
        schema: header.schema || 'dbo',
        name: header.name,
        ...(header.parentName ? { parentName: header.parentName } : {}),
        sourceName,
        startLine,
        endLine,
        definition,
        sha256: sha256(definition),
        semanticSha256: sha256(semanticDefinition(definition)),
        sqlModuleSha256: ['StoredProcedure', 'View', 'Function', 'Trigger'].includes(header.type)
            ? sqlModuleHash(toCreateOrAlter(definition))
            : null,
        parameters: extractParameters(definition),
        ...signals
    };
}

function splitSqlList(value) {
    const result = [];
    let current = '';
    let depth = 0;
    let quoted = false;
    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        const next = value[index + 1];
        if (char === "'") {
            current += char;
            if (quoted && next === "'") {
                current += next;
                index += 1;
            } else {
                quoted = !quoted;
            }
            continue;
        }
        if (!quoted) {
            if (char === '(') depth += 1;
            if (char === ')') depth -= 1;
            if (char === ',' && depth === 0) {
                result.push(current.trim());
                current = '';
                continue;
            }
        }
        current += char;
    }
    if (current.trim() || value.trim().endsWith(',')) result.push(current.trim());
    return result;
}

function matchingParenthesis(value, openIndex) {
    let depth = 0;
    let quoted = false;
    for (let index = openIndex; index < value.length; index += 1) {
        const char = value[index];
        const next = value[index + 1];
        if (char === "'") {
            if (quoted && next === "'") {
                index += 1;
            } else {
                quoted = !quoted;
            }
            continue;
        }
        if (quoted) continue;
        if (char === '(') depth += 1;
        if (char === ')') {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}

function decodeSqlValue(value) {
    const trimmed = String(value || '').trim();
    if (/^NULL$/i.test(trimmed)) return null;
    const stringMatch = trimmed.match(/^N?'([\s\S]*)'$/i);
    if (stringMatch) return stringMatch[1].replace(/''/g, "'");
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (/^(?:CAST|CONVERT)\s*\(/i.test(trimmed)) return trimmed;
    return trimmed;
}

function parseInsertStatement(statement) {
    const tableMatch = statement.match(
        /\bINSERT\s+(?:INTO\s+)?(?:(?:\[dbo\]|dbo)\s*\.\s*)?(\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_]*)\s*/i
    );
    if (!tableMatch) return null;
    const tableName = normalizedName(tableMatch[1]);
    if (!metadataTableNames.has(tableName)) return null;
    const columnsOpen = statement.indexOf('(', tableMatch.index + tableMatch[0].length);
    if (columnsOpen < 0) return null;
    const columnsClose = matchingParenthesis(statement, columnsOpen);
    if (columnsClose < 0) return null;
    const valuesMatch = statement.slice(columnsClose + 1).match(/\bVALUES\s*/i);
    if (!valuesMatch) return null;
    const valuesOffset = columnsClose + 1 + valuesMatch.index + valuesMatch[0].length;
    const valuesOpen = statement.indexOf('(', valuesOffset);
    if (valuesOpen < 0) return null;
    const valuesClose = matchingParenthesis(statement, valuesOpen);
    if (valuesClose < 0) return null;
    const columns = splitSqlList(statement.slice(columnsOpen + 1, columnsClose)).map(normalizedName);
    const values = splitSqlList(statement.slice(valuesOpen + 1, valuesClose)).map(decodeSqlValue);
    if (columns.length !== values.length) return null;
    return {
        tableName,
        row: Object.fromEntries(columns.map((column, index) => [column, values[index]])),
        statement: trimLineEnds(statement)
    };
}

function createSqlCollector(sourceName) {
    const objectsByKey = new Map();
    const metadata = { WA_API: [], SY_FrmLstTbl: [] };
    let activeHeader = null;
    let activeLines = [];
    let activeStartLine = 0;
    let metadataLines = [];
    let metadataStartLine = 0;
    let lineNumber = 0;

    function finishObject(endLine = lineNumber) {
        if (!activeHeader) return;
        const object = finalizeObject(
            activeHeader,
            activeLines,
            sourceName,
            activeStartLine,
            endLine
        );
        objectsByKey.set(objectKey(object), object);
        activeHeader = null;
        activeLines = [];
        activeStartLine = 0;
    }

    function finishMetadata() {
        if (!metadataLines.length) return;
        const parsed = parseInsertStatement(metadataLines.join('\n'));
        if (parsed) {
            metadata[parsed.tableName].push({
                ...parsed.row,
                _sourceLine: metadataStartLine,
                _statementSha256: sha256(parsed.statement)
            });
        }
        metadataLines = [];
        metadataStartLine = 0;
    }

    function accept(rawLine) {
        lineNumber += 1;
        const line = lineNumber === 1 ? rawLine.replace(/^\uFEFF/, '') : rawLine;
        if (/^\s*GO(?:\s+\d+)?\s*(?:--.*)?$/i.test(line)) {
            finishObject(lineNumber - 1);
            finishMetadata();
            return;
        }

        if (activeHeader) {
            activeLines.push(line);
            return;
        }

        if (metadataLines.length) {
            metadataLines.push(line);
            const parsed = parseInsertStatement(metadataLines.join('\n'));
            if (parsed) finishMetadata();
            else if (metadataLines.join('\n').length > 2 * 1024 * 1024) {
                throw new Error(`Metadata INSERT vượt giới hạn an toàn tại ${sourceName}:${metadataStartLine}`);
            }
            return;
        }

        if (/\bINSERT\s+(?:INTO\s+)?(?:(?:\[dbo\]|dbo)\s*\.\s*)?\[?(?:WA_API|SY_FrmLstTbl)\]?\b/i.test(line)) {
            metadataLines = [line];
            metadataStartLine = lineNumber;
            if (parseInsertStatement(line)) finishMetadata();
            return;
        }

        const header = parseObjectHeader(line);
        if (header) {
            activeHeader = header;
            activeLines = [line];
            activeStartLine = lineNumber;
        }
    }

    function finish() {
        finishObject(lineNumber);
        finishMetadata();
        return {
            objects: [...objectsByKey.values()].sort(compareObjects),
            metadata,
            linesRead: lineNumber
        };
    }

    return { accept, finish };
}

function openZip(filePath) {
    return new Promise((resolve, reject) => {
        yauzl.open(filePath, {
            lazyEntries: true,
            autoClose: false,
            decodeStrings: true,
            validateEntrySizes: true,
            strictFileNames: true
        }, (error, zipFile) => error ? reject(error) : resolve(zipFile));
    });
}

function openEntryStream(zipFile, entry) {
    return new Promise((resolve, reject) => {
        zipFile.openReadStream(entry, (error, stream) => error ? reject(error) : resolve(stream));
    });
}

async function parseDumpEntry(zipFile, entry, sourceName) {
    const collector = createSqlCollector(entry.fileName);
    const stream = await openEntryStream(zipFile, entry);
    const decoder = new TextDecoder('utf-16le', { fatal: true });
    let carry = '';
    for await (const chunk of stream) {
        const text = carry + decoder.decode(chunk, { stream: true });
        const lines = text.split(/\r\n|\n|\r/);
        carry = lines.pop() || '';
        for (const line of lines) collector.accept(line);
    }
    carry += decoder.decode();
    if (carry) collector.accept(carry);
    const parsed = collector.finish();
    return {
        source: sourceName,
        zipEntry: entry.fileName,
        uncompressedBytes: entry.uncompressedSize,
        compressedBytes: entry.compressedSize,
        ...parsed
    };
}

async function parseZipDumps() {
    const zipFile = await openZip(zipPath);
    const entries = [];
    return new Promise((resolve, reject) => {
        zipFile.on('error', reject);
        zipFile.on('entry', (entry) => {
            const baseName = path.posix.basename(entry.fileName).toLowerCase();
            if (requiredEntryNames.has(baseName)) entries.push(entry);
            zipFile.readEntry();
        });
        zipFile.on('end', async () => {
            try {
                const found = new Set(entries.map((entry) => path.posix.basename(entry.fileName).toLowerCase()));
                for (const required of requiredEntryNames.keys()) {
                    if (!found.has(required)) throw new Error(`Thiếu ZIP entry bắt buộc: ${required}`);
                }
                const output = {};
                for (const entry of entries) {
                    const key = requiredEntryNames.get(path.posix.basename(entry.fileName).toLowerCase());
                    output[key] = await parseDumpEntry(zipFile, entry, key);
                }
                zipFile.close();
                resolve(output);
            } catch (error) {
                zipFile.close();
                reject(error);
            }
        });
        zipFile.readEntry();
    });
}

function countsFor(parsed) {
    const count = (type) => parsed.objects.filter((object) => object.type === type).length;
    return {
        Table: count('Table'),
        View: count('View'),
        StoredProcedure: count('StoredProcedure'),
        ApiStoredProcedure: parsed.objects.filter((object) =>
            object.type === 'StoredProcedure' && object.name.toUpperCase().startsWith('API_')
        ).length,
        Function: count('Function'),
        Trigger: count('Trigger'),
        Index: count('Index'),
        Constraint: count('Constraint')
    };
}

function assertReliableCounts(original, test) {
    const expected = {
        original: { Table: 57, View: 139, StoredProcedure: 165, ApiStoredProcedure: 87 },
        test: { Table: 63, View: 140, StoredProcedure: 218, ApiStoredProcedure: 139 }
    };
    const tolerance = { Table: 3, View: 5, StoredProcedure: 8, ApiStoredProcedure: 8 };
    const actual = { original: countsFor(original), test: countsFor(test) };
    const failures = [];
    for (const source of ['original', 'test']) {
        for (const key of Object.keys(expected[source])) {
            if (Math.abs(actual[source][key] - expected[source][key]) > tolerance[key]) {
                failures.push(`${source}.${key}: ${actual[source][key]} (expected about ${expected[source][key]})`);
            }
        }
    }
    if (failures.length) {
        throw new Error(`SCHEMA_PARSER_RESULT_UNRELIABLE\n${failures.join('\n')}`);
    }
    return actual;
}

async function walkFiles(root, predicate, output = []) {
    const entries = await fsp.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue;
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            if (fullPath === releaseRoot) continue;
            await walkFiles(fullPath, predicate, output);
        } else if (predicate(fullPath)) {
            output.push(fullPath);
        }
    }
    return output;
}

function relativePath(filePath) {
    return path.relative(repositoryRoot, filePath).replace(/\\/g, '/');
}

function isRepositorySqlCandidate(filePath) {
    const relative = relativePath(filePath);
    if (!relative.toLowerCase().endsWith('.sql')) return false;
    if (/Combined_|_GENERATED|Phase2RuntimeTests|Query\/Test_|\/Deploy\/HRM_Web_Install/i.test(relative)) return false;
    return true;
}

function repositoryPriority(filePath) {
    const value = relativePath(filePath).replace(/\\/g, '/');
    const rollout = value.match(/sql\/UnifiedContractRollout\/(\d+)/i);
    if (rollout) return 1000 + Number(rollout[1]);
    if (/API_Dashboard_MultiTemplate/i.test(value)) return 950;
    if (/sql\/Phase4Join/i.test(value)) return 800;
    if (/sql\/Phase3SimpleCrud/i.test(value)) return 700;
    if (/sql\/FieldSyncPhase1/i.test(value)) return 600;
    if (/sql\/Phase2ApiMigration/i.test(value)) return 500;
    if (/sql\/API\/APINEW/i.test(value)) return 400;
    if (/sql\/API/i.test(value)) return 300;
    return 100;
}

async function parseRepositoryObjects() {
    const files = await walkFiles(path.join(repositoryRoot, 'sql'), isRepositorySqlCandidate);
    const candidates = new Map();
    for (const filePath of files.sort()) {
        const collector = createSqlCollector(relativePath(filePath));
        const content = normalizeLineEndings(await fsp.readFile(filePath, 'utf8'));
        for (const line of content.split('\n')) collector.accept(line);
        for (const object of collector.finish().objects) {
            object.repositoryFile = relativePath(filePath);
            const key = objectKey(object);
            if (!candidates.has(key)) candidates.set(key, []);
            candidates.get(key).push(object);
        }
    }
    const canonical = new Map();
    for (const [key, items] of candidates) {
        items.sort((left, right) =>
            repositoryPriority(right.repositoryFile) - repositoryPriority(left.repositoryFile)
            || left.repositoryFile.localeCompare(right.repositoryFile)
        );
        const selected = items[0];
        selected.repositoryCandidates = items.map((item) => ({
            file: item.repositoryFile,
            sha256: item.sha256,
            semanticSha256: item.semanticSha256
        }));
        canonical.set(key, selected);
    }
    return { candidates, canonical };
}

function referenceArea(filePath) {
    const relative = relativePath(filePath);
    if (relative === 'env.js' || relative.startsWith('src/')) return 'frontend';
    if (relative.startsWith('backend-app/')) return 'backend';
    if (relative.startsWith('sql/')) return 'sql';
    return 'other';
}

function isReferenceFile(filePath) {
    const relative = relativePath(filePath);
    if (/(^|\/)(tests?|scratch)(\/|$)/i.test(relative)) return false;
    if (/\.(?:test|spec)\.(?:js|mjs|cjs)$/i.test(relative)) return false;
    if (/app\.bundle\.js$|styles\.bundle\.css$/i.test(relative)) return false;
    return /\.(?:js|mjs|cjs|json|html|sql|md)$/i.test(relative);
}

async function scanReferences() {
    const files = await walkFiles(repositoryRoot, isReferenceFile);
    const references = new Map();
    for (const filePath of files.sort()) {
        const content = await fsp.readFile(filePath, 'utf8');
        const counts = new Map();
        const pattern = /\b(?:API|WA|SY|VNPT)_[A-Za-z0-9_]+\b/g;
        let match;
        while ((match = pattern.exec(content))) {
            counts.set(match[0], (counts.get(match[0]) || 0) + 1);
        }
        for (const [name, count] of counts) {
            const key = name.toLowerCase();
            if (!references.has(key)) references.set(key, { name, files: [] });
            references.get(key).files.push({
                file: relativePath(filePath),
                area: referenceArea(filePath),
                count
            });
        }
    }
    return references;
}

function objectMap(parsed) {
    return new Map(parsed.objects.map((object) => [objectKey(object), object]));
}

function objectsByName(parsed) {
    const result = new Map();
    for (const object of parsed.objects) {
        const key = object.name.toLowerCase();
        if (!result.has(key)) result.set(key, []);
        result.get(key).push(object);
    }
    return result;
}

function rowsByRoute(rows) {
    const map = new Map();
    for (const row of rows) {
        const list = String(row.list ?? row.List ?? '').trim();
        const func = String(row.func ?? row.Func ?? '').trim();
        if (!list || !func) continue;
        const key = `${list.toLowerCase()}|${func.toLowerCase()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
    }
    return map;
}

function routeProcedure(row) {
    const value = String(row.SQL ?? row.Sql ?? row.sql ?? '').trim();
    return value.split('.').at(-1)?.replace(/[[\]]/g, '').trim() || '';
}

function routeReferencesObject(rows, objectName) {
    const expected = objectName.toLowerCase();
    return rows.some((row) => (
        String(row.list ?? row.List ?? '').trim().toLowerCase() === expected
        || routeProcedure(row).toLowerCase() === expected
    ));
}

function hasAreaReference(references, name, area, repositoryDefinitionFiles = []) {
    const item = references.get(name.toLowerCase());
    if (!item) return false;
    return item.files.some((entry) => {
        if (entry.area !== area) return false;
        if (area === 'sql' && repositoryDefinitionFiles.includes(entry.file) && entry.count <= 1) return false;
        return true;
    });
}

function canonicalRepositoryObject(repository, name) {
    const candidates = [...repository.canonical.values()].filter((object) =>
        object.name.toLowerCase() === name.toLowerCase()
    );
    candidates.sort(compareObjects);
    return candidates.find((object) => object.type === 'StoredProcedure')
        || candidates.find((object) => object.type === 'Function')
        || candidates[0]
        || null;
}

function buildDecisionMatrix(original, test, repository, references) {
    const originalByName = objectsByName(original);
    const testByName = objectsByName(test);
    const names = new Set();
    for (const object of [...original.objects, ...test.objects, ...repository.canonical.values()]) {
        if (/^API_/i.test(object.name)) names.add(object.name);
    }
    const originalRoutes = original.metadata.WA_API;
    const testRoutes = test.metadata.WA_API;
    const matrix = [];

    for (const objectName of [...names].sort((a, b) => a.localeCompare(b))) {
        const originalObject = (originalByName.get(objectName.toLowerCase()) || [])
            .find((object) => ['StoredProcedure', 'Function'].includes(object.type)) || null;
        const testObject = (testByName.get(objectName.toLowerCase()) || [])
            .find((object) => ['StoredProcedure', 'Function'].includes(object.type)) || null;
        const repositoryObject = canonicalRepositoryObject(repository, objectName);
        const definitionFiles = repositoryObject?.repositoryCandidates?.map((item) => item.file) || [];
        const frontend = hasAreaReference(references, objectName, 'frontend', definitionFiles);
        const backend = hasAreaReference(references, objectName, 'backend', definitionFiles);
        const sqlReference = hasAreaReference(references, objectName, 'sql', definitionFiles);
        const registeredOriginal = routeReferencesObject(originalRoutes, objectName);
        const registeredTest = routeReferencesObject(testRoutes, objectName);
        const definitionsDiffer = Boolean(
            originalObject && testObject
            && originalObject.semanticSha256 !== testObject.semanticSha256
        );
        const category = legacyCompatibilityNames.has(objectName)
            ? 'LEGACY_COMPATIBILITY'
            : frameworkNames.has(objectName)
                ? 'FRAMEWORK_V2'
                : dashboardNames.has(objectName)
                    ? 'DASHBOARD'
                    : /(?:Attach|Document|HopDong|BaoHiem|NghiPhep|Payroll|CaLamViec|Report)/i.test(objectName)
                        ? 'BUSINESS_COMPLEX'
                        : 'BUSINESS_OR_LOOKUP';

        let decision;
        let canonicalSource;
        let reason;
        let manualReviewReason = '';

        if (legacyCompatibilityNames.has(objectName)) {
            decision = 'COMPATIBILITY_KEEP';
            canonicalSource = originalObject ? 'DB_ORIGINAL' : repositoryObject ? 'REPOSITORY' : 'DB_TEST';
            reason = 'API legacy còn cần cho form chưa migrate và rollback; release không được xóa.';
        } else if (frameworkNames.has(objectName) || dashboardNames.has(objectName)) {
            if (repositoryObject) {
                decision = 'KEEP_REPOSITORY';
                canonicalSource = 'REPOSITORY';
                reason = frameworkNames.has(objectName)
                    ? 'Object Web/framework-owned có canonical source mới nhất trong repository.'
                    : 'Dashboard backend hiện tại gọi trực tiếp procedure canonical trong repository.';
            } else if (testObject) {
                decision = 'KEEP_TEST';
                canonicalSource = 'DB_TEST';
                reason = 'Runtime hiện tại cần object, DB gốc chưa có canonical repository; dùng definition đã có bằng chứng ở DB test.';
            } else {
                decision = 'REVIEW_REQUIRED';
                canonicalSource = 'NONE';
                reason = 'Runtime yêu cầu object nhưng không tìm thấy definition hợp lệ.';
                manualReviewReason = 'BLOCKING_MISSING_DEPENDENCY';
            }
        } else if (originalObject) {
            if (definitionsDiffer && repositoryObject && (frontend || backend)) {
                decision = 'MERGE_REQUIRED';
                canonicalSource = 'DB_ORIGINAL';
                reason = 'Business API đang có caller và definition DB gốc/test/repository khác nhau; giữ production, không tự ALTER.';
                manualReviewReason = 'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED';
            } else {
                decision = 'KEEP_ORIGINAL';
                canonicalSource = 'DB_ORIGINAL';
                reason = definitionsDiffer
                    ? 'Business/ERP object giữ definition production; bản test khác chỉ là bằng chứng để review.'
                    : 'Object production giữ nguyên; không có bằng chứng an toàn để thay hoặc xóa.';
                if (definitionsDiffer) manualReviewReason = 'TEST_DEFINITION_DIFFERS_RETAINED_ORIGINAL';
            }
        } else if (testObject) {
            if (explicitDeprecatedNames.has(objectName)) {
                decision = 'DEPRECATE_NOT_DEPLOY';
                canonicalSource = 'NONE';
                reason = 'Prototype V2 đã được generic API_TruyVanDong_V2 thay thế; không deploy và chưa drop.';
                manualReviewReason = 'MONITOR_BEFORE_DROP';
            } else if ((frontend || backend || registeredTest) && repositoryObject) {
                decision = 'KEEP_REPOSITORY';
                canonicalSource = 'REPOSITORY';
                reason = 'Object test-only có caller/route hiện tại và canonical repository.';
            } else if (frontend || backend) {
                decision = 'KEEP_TEST';
                canonicalSource = 'DB_TEST';
                reason = 'Object test-only có caller hiện tại; dùng definition test và đánh dấu nguồn rõ ràng.';
                manualReviewReason = 'NO_REPOSITORY_CANONICAL_DEFINITION';
            } else {
                decision = 'REVIEW_REQUIRED';
                canonicalSource = 'DB_TEST';
                reason = 'Object test-only chưa có đủ bằng chứng để đưa vào production.';
                manualReviewReason = 'TEST_ONLY_WITHOUT_ACTIVE_CALLER';
            }
        } else if (repositoryObject) {
            if (frontend || backend) {
                decision = 'KEEP_REPOSITORY';
                canonicalSource = 'REPOSITORY';
                reason = 'Source hiện tại gọi object canonical repository chưa có trong baseline.';
            } else {
                decision = 'REVIEW_REQUIRED';
                canonicalSource = 'REPOSITORY';
                reason = 'Repository có definition nhưng không có bằng chứng runtime active.';
                manualReviewReason = 'REPOSITORY_ONLY_WITHOUT_ACTIVE_CALLER';
            }
        } else {
            decision = 'REVIEW_REQUIRED';
            canonicalSource = 'NONE';
            reason = 'Không xác định được canonical source.';
            manualReviewReason = 'NO_CANONICAL_SOURCE';
        }

        if (safeOriginalOnlyNames.has(objectName)) {
            decision = 'KEEP_ORIGINAL';
            canonicalSource = 'DB_ORIGINAL';
            reason = 'API bảo hiểm original-only thuộc nghiệp vụ deferred; không suy diễn thay thế theo tên gần giống.';
            manualReviewReason = 'COMPARE_WITH_WA_BaoHiem_PersonLookup_BEFORE_ANY_MERGE';
        }

        const inboundDefinitions = [...original.objects, ...test.objects]
            .filter((object) =>
                object.name.toLowerCase() !== objectName.toLowerCase()
                && object.referencedObjects.some((name) => name.toLowerCase() === objectName.toLowerCase())
            ).length;
        const deploymentOrder = decision === 'KEEP_REPOSITORY' || decision === 'KEEP_TEST'
            ? frameworkNames.has(objectName) ? 500
                : dashboardNames.has(objectName) ? 700
                    : 600
            : 0;
        matrix.push({
            ObjectName: objectName,
            ExistsInOriginal: Boolean(originalObject),
            ExistsInTest: Boolean(testObject),
            ExistsInRepository: Boolean(repositoryObject),
            ReferencedByFrontend: frontend,
            ReferencedByBackend: backend,
            ReferencedBySQL: sqlReference,
            RegisteredInWA_APIOriginal: registeredOriginal,
            RegisteredInWA_APITest: registeredTest,
            DependencyCount: inboundDefinitions,
            Category: category,
            Decision: decision,
            CanonicalSource: canonicalSource,
            Reason: reason,
            DeploymentOrder: deploymentOrder,
            RollbackSource: originalObject ? 'DB_ORIGINAL' : 'DISABLE_ROUTE_KEEP_OBJECT',
            SafeToDrop: false,
            ManualReviewReason: manualReviewReason,
            OriginalSemanticSha256: originalObject?.semanticSha256 || null,
            TestSemanticSha256: testObject?.semanticSha256 || null,
            RepositorySemanticSha256: repositoryObject?.semanticSha256 || null,
            RepositoryCanonicalFile: repositoryObject?.repositoryFile || null
        });
    }
    return matrix;
}

function buildObjectDiff(original, test, repository) {
    const originalMap = objectMap(original);
    const testMap = objectMap(test);
    const keys = new Set([...originalMap.keys(), ...testMap.keys()]);
    const repositoryByName = new Map();
    for (const object of repository.canonical.values()) {
        const key = object.name.toLowerCase();
        if (!repositoryByName.has(key)) repositoryByName.set(key, []);
        repositoryByName.get(key).push(object);
    }
    return [...keys].map((key) => {
        const left = originalMap.get(key);
        const right = testMap.get(key);
        const reference = left || right;
        const repositoryObjects = repositoryByName.get(reference.name.toLowerCase()) || [];
        return {
            ObjectType: reference.type,
            SchemaName: reference.schema,
            ObjectName: reference.name,
            ParentName: reference.parentName || null,
            ExistsInOriginal: Boolean(left),
            ExistsInTest: Boolean(right),
            SameDefinition: Boolean(left && right && left.semanticSha256 === right.semanticSha256),
            OriginalSha256: left?.sha256 || null,
            TestSha256: right?.sha256 || null,
            OriginalSemanticSha256: left?.semanticSha256 || null,
            TestSemanticSha256: right?.semanticSha256 || null,
            ParameterSignatureChanged: Boolean(
                left && right
                && JSON.stringify(left.parameters) !== JSON.stringify(right.parameters)
            ),
            ReadWriteSignalsChanged: Boolean(
                left && right
                && JSON.stringify(left.referencedObjects) !== JSON.stringify(right.referencedObjects)
            ),
            RepositoryCandidates: repositoryObjects.map((object) => ({
                type: object.type,
                file: object.repositoryFile,
                semanticSha256: object.semanticSha256
            }))
        };
    }).sort((left, right) =>
        left.ObjectType.localeCompare(right.ObjectType)
        || left.ObjectName.localeCompare(right.ObjectName)
    );
}

function toCreateOrAlter(definition) {
    return trimLineEnds(definition)
        .replace(
            /^(\s*)(?:CREATE(?:\s+OR\s+ALTER)?|ALTER)\s+(PROCEDURE|PROC|VIEW|FUNCTION|TRIGGER)\b/i,
            '$1CREATE OR ALTER $2'
        );
}

function sqlLiteral(value) {
    if (value === null || value === undefined) return 'NULL';
    return `N'${String(value).replace(/'/g, "''")}'`;
}

function csvCell(value) {
    const text = Array.isArray(value) ? value.join(';') : String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
}

function markdownTable(columns, rows) {
    const header = `| ${columns.join(' | ')} |`;
    const divider = `| ${columns.map(() => '---').join(' | ')} |`;
    const body = rows.map((row) =>
        `| ${columns.map((column) => String(row[column] ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`
    );
    return [header, divider, ...body].join('\n');
}

function tableColumns(table) {
    const lines = normalizeLineEndings(table.definition).split('\n');
    const columns = [];
    for (const line of lines) {
        const match = line.match(
            /^\s*\[([^\]]+)\]\s+\[?([A-Za-z0-9_]+)\]?(?:\s*\(([^)]*)\))?\s*(IDENTITY\s*\([^)]*\))?\s*(NULL|NOT\s+NULL)?/i
        );
        if (!match) continue;
        columns.push({
            name: match[1],
            type: match[2].toLowerCase(),
            length: match[3] || '',
            identity: Boolean(match[4]),
            nullable: String(match[5] || '').toUpperCase() || 'UNSPECIFIED',
            computed: /\bAS\s*\(/i.test(line),
            default: /\bDEFAULT\b/i.test(line)
        });
    }
    return columns;
}

function buildTableDiff(original, test) {
    const originalTables = new Map(
        original.objects.filter((object) => object.type === 'Table')
            .map((object) => [object.name.toLowerCase(), object])
    );
    const testTables = new Map(
        test.objects.filter((object) => object.type === 'Table')
            .map((object) => [object.name.toLowerCase(), object])
    );
    const rows = [];
    for (const name of new Set([...originalTables.keys(), ...testTables.keys()])) {
        const left = originalTables.get(name);
        const right = testTables.get(name);
        const leftColumns = new Map((left ? tableColumns(left) : []).map((column) => [column.name.toLowerCase(), column]));
        const rightColumns = new Map((right ? tableColumns(right) : []).map((column) => [column.name.toLowerCase(), column]));
        const columnChanges = [];
        for (const columnName of new Set([...leftColumns.keys(), ...rightColumns.keys()])) {
            const leftColumn = leftColumns.get(columnName);
            const rightColumn = rightColumns.get(columnName);
            if (!leftColumn) columnChanges.push(`ADD ${rightColumn.name} ${rightColumn.type}`);
            else if (!rightColumn) columnChanges.push(`TEST_MISSING ${leftColumn.name}`);
            else if (JSON.stringify(leftColumn) !== JSON.stringify(rightColumn)) {
                columnChanges.push(`DIFF ${leftColumn.name}: ${leftColumn.type}(${leftColumn.length}) ${leftColumn.nullable} -> ${rightColumn.type}(${rightColumn.length}) ${rightColumn.nullable}`);
            }
        }
        rows.push({
            TableName: left?.name || right?.name,
            ExistsInOriginal: Boolean(left),
            ExistsInTest: Boolean(right),
            SameDefinition: Boolean(left && right && left.semanticSha256 === right.semanticSha256),
            ColumnChanges: columnChanges.join('; ') || 'None',
            DeploymentDecision: !left && right
                ? ['WA_FieldContractRegistry', 'WA_FieldDatasetRegistry', 'WA_FieldContractRouteBackup'].includes(right.name)
                    ? 'KEEP_REPOSITORY'
                    : 'REVIEW_REQUIRED'
                : 'KEEP_ORIGINAL_NO_DESTRUCTIVE_ALTER'
        });
    }
    return rows.sort((left, right) => left.TableName.localeCompare(right.TableName));
}

function routeDiffRows(originalRows, testRows) {
    const originalMap = rowsByRoute(originalRows);
    const testMap = rowsByRoute(testRows);
    const rows = [];
    for (const key of new Set([...originalMap.keys(), ...testMap.keys()])) {
        const leftRows = originalMap.get(key) || [];
        const rightRows = testMap.get(key) || [];
        const sample = leftRows[0] || rightRows[0];
        const left = leftRows[0];
        const right = rightRows[0];
        rows.push({
            List: sample.list ?? sample.List ?? '',
            Func: sample.func ?? sample.Func ?? '',
            OriginalCount: leftRows.length,
            TestCount: rightRows.length,
            OriginalProcedure: left ? routeProcedure(left) : '',
            TestProcedure: right ? routeProcedure(right) : '',
            ParaChanged: Boolean(left && right && String(left.Para ?? '') !== String(right.Para ?? '')),
            Classification: leftRows.length > 1 || rightRows.length > 1
                ? 'DUPLICATE'
                : !left ? 'TEST_ONLY'
                    : !right ? 'ORIGINAL_ONLY'
                        : routeProcedure(left) !== routeProcedure(right) || String(left.Para ?? '') !== String(right.Para ?? '')
                            ? 'CHANGED'
                            : /_V2$/i.test(routeProcedure(right)) ? 'V2' : 'UNCHANGED'
        });
    }
    return rows.sort((left, right) => left.List.localeCompare(right.List) || left.Func.localeCompare(right.Func));
}

function metadataDiffRows(originalRows, testRows, keyCandidates) {
    const keyOf = (row) => keyCandidates.map((key) => String(row[key] ?? '').trim().toLowerCase()).join('|');
    const originalMap = new Map(originalRows.map((row) => [keyOf(row), row]));
    const testMap = new Map(testRows.map((row) => [keyOf(row), row]));
    const rows = [];
    for (const key of new Set([...originalMap.keys(), ...testMap.keys()])) {
        const left = originalMap.get(key);
        const right = testMap.get(key);
        rows.push({
            Key: key,
            ExistsInOriginal: Boolean(left),
            ExistsInTest: Boolean(right),
            SameRow: Boolean(left && right && sha256(JSON.stringify(left)) === sha256(JSON.stringify(right))),
            Original: left || null,
            Test: right || null
        });
    }
    return rows;
}

function chooseDeployObjects(matrix, original, test, repository, references) {
    const originalByName = objectsByName(original);
    const testByName = objectsByName(test);
    const selected = new Map();
    const blocking = [];

    function add(object, source, reason) {
        if (!object) return;
        const key = objectKey(object);
        const existing = selected.get(key);
        if (existing && existing.object.semanticSha256 !== object.semanticSha256) {
            blocking.push(`DUPLICATE_CANONICAL_SOURCE:${object.schema}.${object.name}`);
            return;
        }
        selected.set(key, { object, source, reason });
    }

    for (const row of matrix) {
        const runtimeRequired = row.Category === 'FRAMEWORK_V2'
            || row.Category === 'DASHBOARD'
            || (!row.ExistsInOriginal && (row.ReferencedByFrontend || row.ReferencedByBackend));
        if (row.Decision === 'DEPRECATE_NOT_DEPLOY') continue;
        if (!runtimeRequired) continue;
        if (row.Decision === 'KEEP_REPOSITORY') {
            add(canonicalRepositoryObject(repository, row.ObjectName), 'REPOSITORY', row.Reason);
        } else if (row.Decision === 'KEEP_TEST') {
            const object = (testByName.get(row.ObjectName.toLowerCase()) || [])
                .find((candidate) => ['StoredProcedure', 'Function', 'View'].includes(candidate.type));
            add(object, 'DB_TEST', row.Reason);
        } else if (!row.ExistsInOriginal) {
            blocking.push(`BLOCKING_MISSING_DEPENDENCY:${row.ObjectName}`);
        }
    }

    const mandatoryHelpers = [
        ...frameworkNames,
        ...dashboardNames
    ];
    for (const name of mandatoryHelpers) {
        const repositoryObject = canonicalRepositoryObject(repository, name);
        const originalObject = (originalByName.get(name.toLowerCase()) || [])[0];
        const testObject = (testByName.get(name.toLowerCase()) || [])[0];
        if (repositoryObject) add(repositoryObject, 'REPOSITORY', 'Runtime framework/dashboard dependency.');
        else if (testObject) add(testObject, 'DB_TEST', 'Runtime dependency recovered from tested schema.');
        else if (!originalObject) blocking.push(`BLOCKING_MISSING_DEPENDENCY:${name}`);
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const selectedItem of [...selected.values()]) {
            for (const dependencyName of selectedItem.object.referencedObjects) {
                const dependencyKey = dependencyName.toLowerCase();
                const existsOriginal = (originalByName.get(dependencyKey) || []).length > 0;
                if (existsOriginal) continue;
                const repositoryObject = canonicalRepositoryObject(repository, dependencyName);
                const testObject = (testByName.get(dependencyKey) || [])
                    .find((candidate) => ['StoredProcedure', 'Function', 'View', 'Table'].includes(candidate.type));
                const dependency = repositoryObject || testObject;
                if (dependency && !selected.has(objectKey(dependency))) {
                    add(dependency, repositoryObject ? 'REPOSITORY' : 'DB_TEST', `Dependency of ${selectedItem.object.name}.`);
                    changed = true;
                }
            }
        }
    }

    const runtimeReferences = [...references.values()]
        .filter((item) => item.files.some((file) => ['frontend', 'backend'].includes(file.area)))
        .map((item) => item.name.toLowerCase());
    const testRoutes = rowsByRoute(test.metadata.WA_API);
    const originalRoutes = rowsByRoute(original.metadata.WA_API);
    const routeSeeds = [];

    for (const [key, rows] of testRoutes) {
        if (rows.length !== 1) continue;
        const row = rows[0];
        const list = String(row.list ?? row.List ?? '').trim();
        const procedure = routeProcedure(row);
        if (explicitDeprecatedNames.has(list) || explicitDeprecatedNames.has(procedure)) continue;
        if (dashboardNames.has(list) || dashboardNames.has(procedure)) continue;
        if (['API_Web_CutoverSafeFieldContractsV2', 'API_Web_DiscoverFieldContractCandidatesV2',
            'API_Web_SeedSafeFieldContractsV2', 'API_Web_RollbackFieldContractV2'].includes(list)) continue;

        let selectedProcedure = [...selected.values()].some((item) =>
            item.object.name.toLowerCase() === procedure.toLowerCase()
        );
        const calledByRuntime = runtimeReferences.includes(list.toLowerCase())
            || runtimeReferences.includes(procedure.toLowerCase());

        const existsInOriginal = (originalByName.get(procedure.toLowerCase()) || [])
            .some((candidate) => candidate.type === 'StoredProcedure');
        if (calledByRuntime && !selectedProcedure && !existsInOriginal) {
            const repositoryObject = canonicalRepositoryObject(repository, procedure);
            const testObject = (testByName.get(procedure.toLowerCase()) || [])
                .find((candidate) => candidate.type === 'StoredProcedure');
            const routeDependency = procedure === 'API_KinhPhiCongDoan'
                ? testObject
                : (repositoryObject || testObject);
            if (routeDependency) {
                add(
                    routeDependency,
                    procedure === 'API_KinhPhiCongDoan'
                        ? 'DB_TEST_ROUTE_CONTRACT'
                        : (repositoryObject ? 'REPOSITORY' : 'DB_TEST'),
                    `Direct runtime dependency resolved from WA_API route ${list}|${String(row.func ?? row.Func ?? '').trim()}.`
                );
                selectedProcedure = true;

                const matrixRow = matrix.find((candidate) =>
                    candidate.ObjectName.toLowerCase() === procedure.toLowerCase()
                );
                if (matrixRow && matrixRow.Decision === 'REVIEW_REQUIRED' && !repositoryObject) {
                    matrixRow.Decision = 'KEEP_TEST';
                    matrixRow.CanonicalSource = 'DB_TEST';
                    matrixRow.Reason = 'Route runtime hiện tại cần procedure; dùng definition đã kiểm tra trong DB test.';
                    matrixRow.DeploymentOrder = 600;
                    matrixRow.RollbackSource = 'DISABLE_ROUTE_KEEP_OBJECT';
                    matrixRow.ManualReviewReason = 'NO_REPOSITORY_CANONICAL; ROUTE_CONTRACT_VERIFIED';
                }
            } else {
                blocking.push(`BLOCKING_MISSING_DEPENDENCY:${procedure}`);
            }
        }

        if (!selectedProcedure && !calledByRuntime) continue;
        const originalForKey = originalRoutes.get(key) || [];
        if (originalForKey.length > 1) {
            blocking.push(`DUPLICATE_ORIGINAL_ROUTE:${list}|${String(row.func ?? row.Func ?? '')}`);
            continue;
        }
        const isFrameworkRoute = frameworkNames.has(list) || frameworkNames.has(procedure);
        if (!originalForKey.length || isFrameworkRoute) {
            routeSeeds.push({
                list,
                func: String(row.func ?? row.Func ?? '').trim(),
                procedure,
                para: row.Para ?? row.para ?? null,
                originalProcedure: originalForKey[0] ? routeProcedure(originalForKey[0]) : null,
                originalPara: originalForKey[0]?.Para ?? originalForKey[0]?.para ?? null
            });
        }
    }

    for (const name of frameworkNames) {
        if (!/^API_Web_/i.test(name)) continue;
        const selectedObject = [...selected.values()].find((item) =>
            item.object.name.toLowerCase() === name.toLowerCase()
        )?.object;
        if (selectedObject?.type === 'Function') continue;
        const hasRoute = routeSeeds.some((route) =>
            route.list.toLowerCase() === name.toLowerCase()
            || route.procedure.toLowerCase() === name.toLowerCase()
        ) || routeReferencesObject(original.metadata.WA_API, name);
        if (!hasRoute && !['API_Web_CutoverSafeFieldContractsV2', 'API_Web_RollbackFieldContractV2',
            'API_Web_DiscoverFieldContractCandidatesV2', 'API_Web_SeedSafeFieldContractsV2'].includes(name)) {
            blocking.push(`BLOCKING_MISSING_ROUTE_DEFINITION:${name}`);
        }
    }

    return {
        selected: [...selected.values()].sort((left, right) => compareObjects(left.object, right.object)),
        routeSeeds: routeSeeds.sort((left, right) => left.list.localeCompare(right.list) || left.func.localeCompare(right.func)),
        blocking: [...new Set(blocking)].sort()
    };
}

async function ensureDirectories() {
    const directories = [
        analysisRoot,
        reportsRoot,
        archiveRoot,
        path.join(releaseRoot, 'generated'),
        ...Array.from({ length: 16 }, (_, index) => path.join(
            sourceRoot,
            `${String(index).padStart(2, '0')}_${[
                'Precheck', 'Tables', 'ConstraintsAndIndexes', 'Views', 'Functions',
                'FrameworkProcedures', 'BusinessProcedures', 'Dashboard', 'ExcelImport',
                'DocumentsAndAttachments', 'EContract', 'MetadataRegistry', 'SystemSeeds',
                'WaApiCutover', 'Verification', 'Rollback'
            ][index]}`
        ))
    ];
    for (const directory of directories) await fsp.mkdir(directory, { recursive: true });
}

async function writeJson(filePath, value) {
    await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath, value) {
    await fsp.writeFile(filePath, `${trimLineEnds(value)}\n`, 'utf8');
}

function sourceDirectory(index, name) {
    return path.join(sourceRoot, `${String(index).padStart(2, '0')}_${name}`);
}

function renderModuleObjects(items, title) {
    const output = [
        '/*',
        `  ${title}`,
        '  File canonical được sinh từ kết quả audit; mỗi object chỉ có một definition.',
        '*/',
        'SET ANSI_NULLS ON;',
        'GO',
        'SET QUOTED_IDENTIFIER ON;',
        'GO'
    ];
    for (const item of items) {
        output.push('');
        output.push(`/* CanonicalSource: ${item.source}; Object: ${item.object.schema}.${item.object.name}; Input: ${item.object.repositoryFile || item.object.sourceName} */`);
        output.push(toCreateOrAlter(item.object.definition));
        output.push('GO');
    }
    if (!items.length) output.push('', 'PRINT N\'Không có object canonical trong nhóm này.\';', 'GO');
    return output.join('\n');
}

function renderControlTables() {
    return `
/*
  Control tables Web-owned. Chỉ CREATE khi chưa tồn tại; không xóa hoặc rebuild bảng.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.WA_FieldContractRegistry', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldContractRegistry
    (
        WebFormName varchar(100) NOT NULL,
        ERPFormID varchar(100) NOT NULL,
        PermissionFormName varchar(100) NOT NULL,
        ContractType varchar(40) NOT NULL,
        ExpectedTableName sysname NULL,
        ExpectedPrimaryKey sysname NULL,
        ViewList varchar(100) NULL,
        ViewProcedure sysname NULL,
        SaveProcedure sysname NULL,
        DeleteProcedure sysname NULL,
        WritePolicy varchar(40) NOT NULL,
        BranchPolicy varchar(40) NOT NULL,
        DeletePolicy varchar(40) NOT NULL,
        RolloutStatus varchar(20) NOT NULL,
        RolloutReason nvarchar(500) NULL,
        SchemaVersion int NOT NULL,
        IsEnabled bit NOT NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldContractRegistry PRIMARY KEY (WebFormName),
        CONSTRAINT CK_WA_FieldContractRegistry_ContractType CHECK
            (ContractType IN ('SIMPLE_TABLE','JOIN_VIEW_SINGLE_TABLE','MASTER_DETAIL_SIMPLE','READ_ONLY','COMPLEX_DEFERRED','BLOCKED')),
        CONSTRAINT CK_WA_FieldContractRegistry_RolloutStatus CHECK
            (RolloutStatus IN ('ACTIVE','SHADOW','DEFERRED','DISABLED','BLOCKED')),
        CONSTRAINT CK_WA_FieldContractRegistry_SchemaVersion CHECK (SchemaVersion > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.WA_FieldDatasetRegistry', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldDatasetRegistry
    (
        WebFormName varchar(100) NOT NULL,
        DatasetKey varchar(80) NOT NULL,
        ApiList varchar(100) NOT NULL,
        ViewProcedure sysname NULL,
        ExpectedTableName sysname NULL,
        ExpectedPrimaryKey sysname NULL,
        ParentField sysname NULL,
        ChildField sysname NULL,
        IsReadOnly bit NOT NULL,
        SaveProcedure sysname NULL,
        DeleteProcedure sysname NULL,
        WritePolicy varchar(40) NOT NULL,
        BranchPolicy varchar(40) NOT NULL,
        RolloutStatus varchar(20) NOT NULL,
        RolloutReason nvarchar(500) NULL,
        SchemaVersion int NOT NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldDatasetRegistry_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy varchar(100) NOT NULL,
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldDatasetRegistry_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy varchar(100) NOT NULL,
        CONSTRAINT PK_WA_FieldDatasetRegistry PRIMARY KEY (WebFormName, DatasetKey),
        CONSTRAINT FK_WA_FieldDatasetRegistry_Form FOREIGN KEY (WebFormName)
            REFERENCES dbo.WA_FieldContractRegistry(WebFormName),
        CONSTRAINT CK_WA_FieldDatasetRegistry_RolloutStatus CHECK
            (RolloutStatus IN ('ACTIVE','SHADOW','DEFERRED','DISABLED','BLOCKED')),
        CONSTRAINT CK_WA_FieldDatasetRegistry_SchemaVersion CHECK (SchemaVersion > 0),
        CONSTRAINT CK_WA_FieldDatasetRegistry_ReadOnlyMutation CHECK
            (IsReadOnly = 0 OR (SaveProcedure IS NULL AND DeleteProcedure IS NULL))
    );
END;
GO

IF OBJECT_ID(N'dbo.WA_FieldContractRouteBackup', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_FieldContractRouteBackup
    (
        BackupID bigint IDENTITY(1,1) NOT NULL,
        BackupBatchID uniqueidentifier NOT NULL,
        WebFormName varchar(100) NOT NULL,
        ApiList varchar(100) NOT NULL,
        Func varchar(20) NOT NULL,
        RouteExisted bit NOT NULL,
        [SQL] nvarchar(max) NULL,
        Para nvarchar(max) NULL,
        BackupTime datetime2(3) NOT NULL CONSTRAINT DF_WA_FieldContractRouteBackup_Time DEFAULT SYSUTCDATETIME(),
        BackupUser varchar(100) NOT NULL,
        RestoredAt datetime2(3) NULL,
        RestoredBy varchar(100) NULL,
        CONSTRAINT PK_WA_FieldContractRouteBackup PRIMARY KEY (BackupID),
        CONSTRAINT UQ_WA_FieldContractRouteBackup_BatchRoute UNIQUE (BackupBatchID, ApiList, Func)
    );
    CREATE INDEX IX_WA_FieldContractRouteBackup_FormTime
        ON dbo.WA_FieldContractRouteBackup(WebFormName, BackupTime DESC);
END;
GO

IF OBJECT_ID(N'dbo.WA_DatabaseReleaseHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WA_DatabaseReleaseHistory
    (
        ReleaseID varchar(100) NOT NULL,
        InstalledAt datetime2(3) NOT NULL,
        InstalledBy varchar(100) NOT NULL,
        ReleaseMode varchar(30) NOT NULL,
        MetadataRouteBatchID uniqueidentifier NULL,
        FieldRouteBatchID uniqueidentifier NULL,
        Status varchar(30) NOT NULL,
        ManifestSha256 char(64) NOT NULL,
        RolledBackAt datetime2(3) NULL,
        RolledBackBy varchar(100) NULL,
        CONSTRAINT PK_WA_DatabaseReleaseHistory PRIMARY KEY (ReleaseID)
    );
END;
GO
`;
}

function renderPrecheck(blocking, deploySelection, original) {
    const staticBlocking = blocking.length
        ? blocking.map((item) => `N'${item.replace(/'/g, "''")}'`).join(',\n        ')
        : '';
    const originalByName = objectsByName(original);
    const businessConflictRows = deploySelection.selected
        .filter((item) =>
            item.object.type === 'StoredProcedure'
            && !frameworkNames.has(item.object.name)
            && !dashboardNames.has(item.object.name)
            && !(originalByName.get(item.object.name.toLowerCase()) || [])
                .some((candidate) => candidate.type === 'StoredProcedure')
        )
        .map((item) =>
            `        (${sqlLiteral(item.object.name)}, ${sqlLiteral(item.object.sqlModuleSha256)})`
        )
        .join(',\n');
    return `
/*
  Precheck production: read-only, fail-closed, không kết nối database khác.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF DB_ID(N'$(TargetDatabase)') IS NULL
    THROW 56000, N'TARGET_DATABASE_NOT_FOUND', 1;
IF DB_NAME() <> N'$(TargetDatabase)'
    THROW 56001, N'TARGET_DATABASE_CONTEXT_MISMATCH', 1;
IF LOWER(DB_NAME()) IN (N'master', N'tempdb', N'model', N'msdb')
    THROW 56002, N'SYSTEM_DATABASE_IS_FORBIDDEN', 1;
IF TRY_CONVERT(int, SERVERPROPERTY('ProductMajorVersion')) < 13
    THROW 56003, N'SQL_SERVER_2016_OR_NEWER_REQUIRED', 1;
IF ISJSON(N'{"release":"precheck"}') <> 1
    THROW 56004, N'SQL_JSON_SUPPORT_REQUIRED', 1;
IF OBJECT_ID(N'sys.dm_exec_describe_first_result_set_for_object') IS NULL
    THROW 56005, N'DM_EXEC_DESCRIBE_SUPPORT_REQUIRED', 1;

IF OBJECT_ID(N'dbo.WA_API', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SY_FrmLstTbl', N'U') IS NULL
   OR OBJECT_ID(N'dbo.SY_User', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_Menu', N'U') IS NULL
   OR OBJECT_ID(N'dbo.WA_UserGroupPermisstion', N'U') IS NULL
    THROW 56006, N'ORIGINAL_BASELINE_CORE_TABLE_MISSING', 1;

IF OBJECT_ID(N'dbo.API_TruyVanDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_LuuDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_XoaDong', N'P') IS NULL
   OR OBJECT_ID(N'dbo.API_BaoHiem_PersonLookup', N'P') IS NULL
    THROW 56007, N'ORIGINAL_BASELINE_LEGACY_API_MISSING', 1;

IF (OBJECT_ID(N'dbo.WA_FieldContractRegistry',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'WebFormName') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'ContractType') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRegistry',N'RolloutStatus') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_FieldContractRegistry',N'PK') IS NULL))
 OR (OBJECT_ID(N'dbo.WA_FieldDatasetRegistry',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'WebFormName') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'DatasetKey') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldDatasetRegistry',N'ApiList') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_FieldDatasetRegistry',N'PK') IS NULL))
 OR (OBJECT_ID(N'dbo.WA_FieldContractRouteBackup',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'BackupBatchID') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'ApiList') IS NULL
      OR COL_LENGTH(N'dbo.WA_FieldContractRouteBackup',N'Func') IS NULL
      OR OBJECT_ID(N'dbo.UQ_WA_FieldContractRouteBackup_BatchRoute',N'UQ') IS NULL
      OR NOT EXISTS (SELECT 1 FROM sys.indexes
          WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
            AND name=N'IX_WA_FieldContractRouteBackup_FormTime')))
 OR (OBJECT_ID(N'dbo.WA_DatabaseReleaseHistory',N'U') IS NOT NULL
    AND (COL_LENGTH(N'dbo.WA_DatabaseReleaseHistory',N'ReleaseID') IS NULL
      OR COL_LENGTH(N'dbo.WA_DatabaseReleaseHistory',N'ManifestSha256') IS NULL
      OR OBJECT_ID(N'dbo.PK_WA_DatabaseReleaseHistory',N'PK') IS NULL))
    THROW 56011, N'CONTROL_TABLE_SCHEMA_CONFLICT', 1;

DECLARE @ApprovedBusinessModules table(ObjectName sysname PRIMARY KEY, ExpectedSha256 char(64) NOT NULL);
INSERT INTO @ApprovedBusinessModules (ObjectName,ExpectedSha256)
VALUES
${businessConflictRows || `        (N'API_BaoHiem_PersonLookup',N'')`};
IF EXISTS
(
    SELECT 1
    FROM @ApprovedBusinessModules AS E
    CROSS APPLY
    (
        SELECT LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
            REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(N'dbo.'+E.ObjectName))),
                CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
    ) AS H
    WHERE OBJECT_ID(N'dbo.'+E.ObjectName,N'P') IS NOT NULL
      AND ISNULL(H.ActualSha256,'') <> E.ExpectedSha256
)
    THROW 56010, N'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED', 1;

IF EXISTS
(
    SELECT 1 FROM dbo.WA_API
    GROUP BY [list], [func]
    HAVING COUNT(*) > 1
)
    THROW 56008, N'WA_API_DUPLICATE_ROUTE_REVIEW_REQUIRED', 1;

${blocking.length ? `DECLARE @BuildBlocking table (Issue nvarchar(500) NOT NULL);
INSERT INTO @BuildBlocking (Issue)
VALUES
        (${staticBlocking.replace(/,\n        /g, '),\n        (')});
SELECT Issue AS BLOCKING_ISSUE FROM @BuildBlocking;
THROW 56009, N'RELEASE_BUILD_HAS_BLOCKING_ISSUE', 1;` : `PRINT N'Không có BLOCKING_MISSING_DEPENDENCY trong kết quả phân tích.';`}
GO
`;
}

function renderRegistrySeed() {
    return `
/*
  Explicit seed cho các contract đã audit. Chỉ INSERT bản ghi thiếu; không ghi đè quyết định manual.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @Now datetime2(3) = SYSUTCDATETIME();
    DECLARE @Actor varchar(100) = 'PRODUCTION_DATABASE_RELEASE';

    INSERT INTO dbo.WA_FieldContractRegistry
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason, SchemaVersion,
        IsEnabled, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT V.*, 2, 1, @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(varchar(100),'HR_BangThueTNCNFrm'),CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(varchar(40),'SIMPLE_TABLE'),CONVERT(sysname,N'HR_BangThueTNCNTbl'),CONVERT(sysname,N'Bac'),CONVERT(varchar(100),'WA_BangThueTNCNFrm'),CONVERT(sysname,N'API_TruyVanDong_V2'),CONVERT(sysname,N'API_LuuDong_V2'),CONVERT(sysname,N'API_XoaDong_V2'),CONVERT(varchar(40),'SAFE_TABLE_COLUMNS'),CONVERT(varchar(40),'LEGACY_GLOBAL_REFERENCE'),CONVERT(varchar(40),'AUTO_SCHEMA'),CONVERT(varchar(20),'SHADOW'),CONVERT(nvarchar(500),N'CONFIRMED_PHASE3_READY_FOR_CUTOVER')),
        ('WA_ChucDanhFrm','WA_ChucDanhFrm','WA_ChucDanhFrm','SIMPLE_TABLE',N'HR_ChucDanhTbl',N'ChucDanhChuyenMon','WA_ChucDanhFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('WA_TitleListFrm','WA_TitleListFrm','WA_TitleListFrm','SIMPLE_TABLE',N'HR_TitleListTbl',N'TitleName','WA_TitleListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('WA_ShiftListFrm','WA_ShiftListFrm','WA_ShiftListFrm','SIMPLE_TABLE',N'HR_ShiftListTbl',N'ShiftID','WA_ShiftListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','LEGACY_GLOBAL_REFERENCE','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE3_READY_FOR_CUTOVER'),
        ('CF_BranchListFrm','CF_BranchListFrm','CF_BranchListFrm','SIMPLE_TABLE',N'CF_BranchTbl',N'BranchID','CF_BranchListFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','BRANCH_SCOPED','AUTO_SCHEMA','SHADOW',N'CONFIRMED_BRANCH_DIRECTORY_READY_FOR_CUTOVER'),
        ('WA_CaLamViecFrm','WA_CaLamViecFrm','WA_CaLamViecFrm','MASTER_DETAIL_SIMPLE',N'HR_SapCaTbl',N'SapCaID','WA_CaLamViecFrm',N'API_TruyVanDong_V2',N'API_LuuDong_V2',N'API_XoaDong_V2','SAFE_TABLE_COLUMNS','AUTO_SCHEMA','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE4_MASTER_DETAIL_READY_FOR_CUTOVER')
    ) AS V
    (
        WebFormName, ERPFormID, PermissionFormName, ContractType,
        ExpectedTableName, ExpectedPrimaryKey, ViewList, ViewProcedure,
        SaveProcedure, DeleteProcedure, WritePolicy, BranchPolicy,
        DeletePolicy, RolloutStatus, RolloutReason
    )
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.WA_FieldContractRegistry AS R
        WHERE R.WebFormName = V.WebFormName
    );

    INSERT INTO dbo.WA_FieldDatasetRegistry
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason, SchemaVersion,
        CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
    )
    SELECT V.*, 2, @Now, @Actor, @Now, @Actor
    FROM (VALUES
        (CONVERT(varchar(100),'WA_CaLamViecFrm'),CONVERT(varchar(80),'SHIFT_DETAIL'),CONVERT(varchar(100),'API_CaLamViec_ChiTiet'),CONVERT(sysname,N'API_CaLamViec_ChiTiet'),CONVERT(sysname,N'HR_SapCaChiTietTbl'),CONVERT(sysname,N'UserAutoID'),CONVERT(sysname,N'SapCaID'),CONVERT(sysname,N'SapCaID'),CONVERT(bit,1),CONVERT(sysname,NULL),CONVERT(sysname,NULL),CONVERT(varchar(40),'READ_ONLY'),CONVERT(varchar(40),'AUTO_SCHEMA'),CONVERT(varchar(20),'SHADOW'),CONVERT(nvarchar(500),N'CONFIRMED_PHASE4_READ_ONLY_READY_FOR_CUTOVER')),
        ('WA_CaLamViecFrm','SHIFT_EMPLOYEES','API_CaLamViec_NhanVien',N'API_CaLamViec_NhanVien',N'HR_SapCaNhanVienTbl',N'UserAutoID',N'SapCaID',N'SapCaID',0,N'API_LuuDong_V2',N'API_XoaDong_V2','VIEW_PHYSICAL_COLUMNS','AUTO_SCHEMA','SHADOW',N'CONFIRMED_PHASE4_EDITABLE_READY_FOR_CUTOVER')
    ) AS V
    (
        WebFormName, DatasetKey, ApiList, ViewProcedure,
        ExpectedTableName, ExpectedPrimaryKey, ParentField, ChildField,
        IsReadOnly, SaveProcedure, DeleteProcedure, WritePolicy,
        BranchPolicy, RolloutStatus, RolloutReason
    )
    WHERE EXISTS (SELECT 1 FROM dbo.WA_FieldContractRegistry AS R WHERE R.WebFormName = V.WebFormName)
      AND NOT EXISTS
      (
          SELECT 1 FROM dbo.WA_FieldDatasetRegistry AS D
          WHERE D.WebFormName = V.WebFormName AND D.DatasetKey = V.DatasetKey
      );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
`;
}

function renderRouteCutover(routeSeeds) {
    const values = routeSeeds.length
        ? routeSeeds.map((route) => `        (${sqlLiteral(route.list)}, ${sqlLiteral(route.func)}, ${sqlLiteral(route.procedure)}, ${sqlLiteral(route.para)}, ${sqlLiteral(route.originalProcedure)})`).join(',\n')
        : '';
    return `
/*
  Route registration/cutover: backup trước, transaction, idempotent, không DELETE hàng loạt.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ReleaseID varchar(100) = '${releaseId}';
DECLARE @Actor varchar(100) = LEFT(COALESCE(NULLIF(CONVERT(varchar(128), SUSER_SNAME()),''),'PRODUCTION_DATABASE_RELEASE'),100);
DECLARE @MetadataBatchID uniqueidentifier = NEWID();
DECLARE @FieldBatchID uniqueidentifier = NEWID();

DECLARE @Targets table
(
    ApiList varchar(100) NOT NULL,
    Func varchar(20) NOT NULL,
    DesiredProcedure sysname NOT NULL,
    DesiredPara nvarchar(max) NULL,
    KnownOriginalProcedure sysname NULL,
    PRIMARY KEY (ApiList, Func)
);
${routeSeeds.length ? `INSERT INTO @Targets (ApiList, Func, DesiredProcedure, DesiredPara, KnownOriginalProcedure)
VALUES
${values};` : `-- Không có route metadata test-only cần thêm.`}

/*
  Chỉ giữ route có caller hiện tại. V2 cho form chỉ được áp dụng với registry đã audit;
  Dashboard gọi direct SQL; procedure quản trị cutover không public qua WA_API.
*/
DELETE FROM @Targets
WHERE ApiList = 'API_BangThueTNCN_V2'
   OR ApiList LIKE 'API_HR_Dashboard[_]%'
   OR ApiList IN
      ('API_Web_CutoverSafeFieldContractsV2','API_Web_DiscoverFieldContractCandidatesV2',
       'API_Web_SeedSafeFieldContractsV2','API_Web_RollbackFieldContractV2');

DELETE FROM @Targets
WHERE DesiredProcedure IN ('API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2')
  AND ApiList NOT IN
      ('WA_BangThueTNCNFrm','WA_ChucDanhFrm','WA_TitleListFrm','WA_ShiftListFrm',
       'WA_CaLamViecFrm','CF_BranchListFrm','API_CaLamViec_NhanVien',
       'API_TruyVanDong_V2','API_LuuDong_V2','API_XoaDong_V2');

/* Kinh phí công đoàn giữ business View và mutation legacy đến khi contract được audit riêng. */
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Save')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Save','API_LuuDong',
         N'@List=N''WA_KinhPhiCongDoanFrm'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);
IF NOT EXISTS (SELECT 1 FROM @Targets WHERE ApiList='WA_KinhPhiCongDoanFrm' AND Func='Delete')
    INSERT INTO @Targets VALUES
        ('WA_KinhPhiCongDoanFrm','Delete','API_XoaDong',
         N'@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''',NULL);

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    GROUP BY T.ApiList, T.Func
    HAVING COUNT(*) > 1
)
    THROW 56300, N'RELEASE_ROUTE_DUPLICATE', 1;

IF EXISTS
(
    SELECT 1 FROM @Targets AS T
    WHERE OBJECT_ID(N'dbo.' + T.DesiredProcedure, N'P') IS NULL
)
    THROW 56301, N'RELEASE_ROUTE_PROCEDURE_MISSING', 1;

IF EXISTS
(
    SELECT 1
    FROM @Targets AS T
    INNER JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) NOT IN
        (T.DesiredProcedure, ISNULL(T.KnownOriginalProcedure,T.DesiredProcedure))
)
    THROW 56302, N'CUSTOMIZED_BUSINESS_API_REVIEW_REQUIRED', 1;

BEGIN TRANSACTION;
BEGIN TRY
    INSERT INTO dbo.WA_FieldContractRouteBackup
    (
        BackupBatchID, WebFormName, ApiList, Func, RouteExisted,
        [SQL], Para, BackupTime, BackupUser
    )
    SELECT
        @MetadataBatchID, T.ApiList, T.ApiList, T.Func,
        CASE WHEN A.[list] IS NULL THEN 0 ELSE 1 END,
        A.[SQL], A.Para, SYSUTCDATETIME(), @Actor
    FROM @Targets AS T
    LEFT JOIN dbo.WA_API AS A ON A.[list] = T.ApiList AND A.[func] = T.Func
    WHERE A.[list] IS NULL
       OR PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    UPDATE A
    SET [SQL] = T.DesiredProcedure, Para = T.DesiredPara
    FROM dbo.WA_API AS A
    INNER JOIN @Targets AS T ON T.ApiList = A.[list] AND T.Func = A.[func]
    WHERE PARSENAME(LTRIM(RTRIM(A.[SQL])),1) <> T.DesiredProcedure
       OR ISNULL(A.Para,N'') <> ISNULL(T.DesiredPara,N'');

    INSERT INTO dbo.WA_API ([list],[func],[SQL],Para)
    SELECT T.ApiList,T.Func,T.DesiredProcedure,T.DesiredPara
    FROM @Targets AS T
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.WA_API AS A
        WHERE A.[list] = T.ApiList AND A.[func] = T.Func
    );

    EXEC dbo.API_Web_CutoverSafeFieldContractsV2
        @WebFormName = NULL,
        @UserName = @Actor,
        @BatchID = @FieldBatchID OUTPUT;

    IF EXISTS (SELECT 1 FROM dbo.WA_DatabaseReleaseHistory WHERE ReleaseID = @ReleaseID)
        UPDATE dbo.WA_DatabaseReleaseHistory
        SET InstalledAt = SYSUTCDATETIME(), InstalledBy = @Actor,
            ReleaseMode = '$(ReleaseMode)', MetadataRouteBatchID = @MetadataBatchID,
            FieldRouteBatchID = @FieldBatchID, Status = 'INSTALLED',
            ManifestSha256 = 'PENDING_BUILD_MANIFEST',
            RolledBackAt = NULL, RolledBackBy = NULL
        WHERE ReleaseID = @ReleaseID;
    ELSE
        INSERT INTO dbo.WA_DatabaseReleaseHistory
        (
            ReleaseID,InstalledAt,InstalledBy,ReleaseMode,MetadataRouteBatchID,
            FieldRouteBatchID,Status,ManifestSha256
        )
        VALUES
        (
            @ReleaseID,SYSUTCDATETIME(),@Actor,'$(ReleaseMode)',@MetadataBatchID,
            @FieldBatchID,'INSTALLED','PENDING_BUILD_MANIFEST'
        );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
`;
}

function renderInstallSummary(deploySelection, matrix) {
    const reviewCount = matrix.filter((row) =>
        ['MERGE_REQUIRED', 'REVIEW_REQUIRED', 'DROP_CANDIDATE_AFTER_MONITORING'].includes(row.Decision)
    ).length;
    return `
SET NOCOUNT ON;
SELECT
    N'${releaseId}' AS ReleaseID,
    N'INSTALL_COMPLETED' AS InstallStatus,
    ${deploySelection.selected.length + 1} AS CanonicalObjectCount,
    ${reviewCount} AS ManualReviewCount,
    SYSUTCDATETIME() AS CompletedAtUtc;
GO
`;
}

function renderVerify(deploySelection, matrix, original, test) {
    const deployedRows = deploySelection.selected.map((item) =>
        `        (${sqlLiteral(item.object.type)}, ${sqlLiteral(item.object.schema)}, ${sqlLiteral(item.object.name)}, ${sqlLiteral(item.object.sqlModuleSha256)})`
    ).join(',\n');
    const originalOnly = matrix.filter((row) =>
        row.ExistsInOriginal && !row.ExistsInTest && row.Decision === 'KEEP_ORIGINAL'
    ).map((row) => row.ObjectName);
    const originalOnlyRows = originalOnly.length
        ? originalOnly.map((name) => `        (${sqlLiteral(name)})`).join(',\n')
        : `        (N'API_BaoHiem_PersonLookup')`;
    const decisionCounts = Object.fromEntries(
        ['KEEP_REPOSITORY', 'KEEP_ORIGINAL', 'KEEP_TEST', 'MERGE_REQUIRED', 'COMPATIBILITY_KEEP',
            'DEPRECATE_NOT_DEPLOY', 'REVIEW_REQUIRED', 'DROP_CANDIDATE_AFTER_MONITORING']
            .map((decision) => [decision, matrix.filter((row) => row.Decision === decision).length])
    );
    const reviewCount = decisionCounts.MERGE_REQUIRED + decisionCounts.REVIEW_REQUIRED
        + decisionCounts.DROP_CANDIDATE_AFTER_MONITORING;
    const testOnlyDecisions = matrix.filter((row) => !row.ExistsInOriginal && row.ExistsInTest);
    const testOnlyRows = testOnlyDecisions.length
        ? testOnlyDecisions.map((row) => `        (${sqlLiteral(row.ObjectName)}, ${sqlLiteral(row.Decision)}, ${sqlLiteral(row.Reason)})`).join(',\n')
        : `        (N'(none)',N'REVIEW_REQUIRED',N'No test-only API parsed')`;
    return `
/*
  VERIFY_ALL chỉ SELECT/THROW; không sửa dữ liệu.
*/
SET NOCOUNT ON;
DECLARE @Blocking int = 0;
DECLARE @Review int = ${reviewCount};

DECLARE @ExpectedObjects table
(
    ObjectType varchar(30), SchemaName sysname, ObjectName sysname, ExpectedSha256 char(64) NULL
);
INSERT INTO @ExpectedObjects (ObjectType,SchemaName,ObjectName,ExpectedSha256)
VALUES
${deployedRows || `        (N'StoredProcedure',N'dbo',N'API_TruyVanDong_V2',NULL)`};

/* 1. Release object status. */
SELECT N'01_RELEASE_OBJECT_STATUS' AS VerifyGroup, E.*,
       CASE WHEN OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)) IS NULL THEN 0 ELSE 1 END AS ObjectExists
FROM @ExpectedObjects AS E;
SET @Blocking += (SELECT COUNT(*) FROM @ExpectedObjects AS E
    WHERE OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)) IS NULL);

/* 2. Table/column/constraint/index. */
SELECT N'02_TABLE_SCHEMA' AS VerifyGroup, T.TableName,
       CASE WHEN OBJECT_ID(N'dbo.'+T.TableName,N'U') IS NULL THEN 0 ELSE 1 END AS TableExists
FROM (VALUES (N'WA_FieldContractRegistry'),(N'WA_FieldDatasetRegistry'),
             (N'WA_FieldContractRouteBackup'),(N'WA_DatabaseReleaseHistory')) AS T(TableName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES (N'WA_FieldContractRegistry'),(N'WA_FieldDatasetRegistry'),
    (N'WA_FieldContractRouteBackup'),(N'WA_DatabaseReleaseHistory')) AS T(TableName)
    WHERE OBJECT_ID(N'dbo.'+T.TableName,N'U') IS NULL);

DECLARE @RequiredControlColumns table(TableName sysname,ColumnName sysname);
INSERT INTO @RequiredControlColumns VALUES
 (N'WA_FieldContractRegistry',N'WebFormName'),(N'WA_FieldContractRegistry',N'ContractType'),
 (N'WA_FieldContractRegistry',N'ExpectedTableName'),(N'WA_FieldContractRegistry',N'ExpectedPrimaryKey'),
 (N'WA_FieldContractRegistry',N'ViewProcedure'),(N'WA_FieldContractRegistry',N'SaveProcedure'),
 (N'WA_FieldContractRegistry',N'DeleteProcedure'),(N'WA_FieldContractRegistry',N'RolloutStatus'),
 (N'WA_FieldDatasetRegistry',N'WebFormName'),(N'WA_FieldDatasetRegistry',N'DatasetKey'),
 (N'WA_FieldDatasetRegistry',N'ApiList'),(N'WA_FieldDatasetRegistry',N'ViewProcedure'),
 (N'WA_FieldDatasetRegistry',N'SaveProcedure'),(N'WA_FieldDatasetRegistry',N'DeleteProcedure'),
 (N'WA_FieldDatasetRegistry',N'RolloutStatus'),
 (N'WA_FieldContractRouteBackup',N'BackupBatchID'),(N'WA_FieldContractRouteBackup',N'ApiList'),
 (N'WA_FieldContractRouteBackup',N'Func'),(N'WA_FieldContractRouteBackup',N'SQL'),
 (N'WA_FieldContractRouteBackup',N'Para'),(N'WA_FieldContractRouteBackup',N'RestoredAt'),
 (N'WA_DatabaseReleaseHistory',N'ReleaseID'),(N'WA_DatabaseReleaseHistory',N'MetadataRouteBatchID'),
 (N'WA_DatabaseReleaseHistory',N'FieldRouteBatchID'),(N'WA_DatabaseReleaseHistory',N'Status'),
 (N'WA_DatabaseReleaseHistory',N'ManifestSha256');
SELECT N'02_COLUMN_SCHEMA' AS VerifyGroup,C.TableName,C.ColumnName,
       CASE WHEN COL_LENGTH(N'dbo.'+C.TableName,C.ColumnName) IS NULL THEN 0 ELSE 1 END AS ColumnExists
FROM @RequiredControlColumns AS C;
SET @Blocking += (SELECT COUNT(*) FROM @RequiredControlColumns AS C
    WHERE COL_LENGTH(N'dbo.'+C.TableName,C.ColumnName) IS NULL);

DECLARE @RequiredControlConstraints table(ConstraintName sysname,ObjectType varchar(2));
INSERT INTO @RequiredControlConstraints VALUES
 (N'PK_WA_FieldContractRegistry','PK'),(N'CK_WA_FieldContractRegistry_ContractType','C'),
 (N'CK_WA_FieldContractRegistry_RolloutStatus','C'),(N'CK_WA_FieldContractRegistry_SchemaVersion','C'),
 (N'PK_WA_FieldDatasetRegistry','PK'),(N'FK_WA_FieldDatasetRegistry_Form','F'),
 (N'CK_WA_FieldDatasetRegistry_RolloutStatus','C'),(N'CK_WA_FieldDatasetRegistry_SchemaVersion','C'),
 (N'CK_WA_FieldDatasetRegistry_ReadOnlyMutation','C'),
 (N'PK_WA_FieldContractRouteBackup','PK'),(N'UQ_WA_FieldContractRouteBackup_BatchRoute','UQ'),
 (N'PK_WA_DatabaseReleaseHistory','PK');
SELECT N'02_CONSTRAINT_SCHEMA' AS VerifyGroup,C.ConstraintName,C.ObjectType,
       CASE WHEN OBJECT_ID(N'dbo.'+C.ConstraintName,C.ObjectType) IS NULL THEN 0 ELSE 1 END AS ConstraintExists
FROM @RequiredControlConstraints AS C;
SET @Blocking += (SELECT COUNT(*) FROM @RequiredControlConstraints AS C
    WHERE OBJECT_ID(N'dbo.'+C.ConstraintName,C.ObjectType) IS NULL);

SELECT N'02_INDEX_SCHEMA' AS VerifyGroup,N'IX_WA_FieldContractRouteBackup_FormTime' AS IndexName,
       CASE WHEN EXISTS (SELECT 1 FROM sys.indexes
            WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
              AND name=N'IX_WA_FieldContractRouteBackup_FormTime') THEN 1 ELSE 0 END AS IndexExists;
IF NOT EXISTS (SELECT 1 FROM sys.indexes
    WHERE object_id=OBJECT_ID(N'dbo.WA_FieldContractRouteBackup')
      AND name=N'IX_WA_FieldContractRouteBackup_FormTime')
    SET @Blocking += 1;

/* 3. Stored procedure/view/function tồn tại. */
SELECT N'03_MODULE_EXISTENCE' AS VerifyGroup,ObjectType,SchemaName,ObjectName
FROM @ExpectedObjects
WHERE ObjectType IN ('StoredProcedure','View','Function');

/* 4. Object definition hash. */
SELECT N'04_DEFINITION_HASH' AS VerifyGroup, E.ObjectName, E.ExpectedSha256,
       LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
           REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)))),
               CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
FROM @ExpectedObjects AS E
WHERE E.ExpectedSha256 IS NOT NULL;
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM @ExpectedObjects AS E
    CROSS APPLY
    (
        SELECT LOWER(CONVERT(varchar(64),HASHBYTES('SHA2_256',CONVERT(varbinary(max),
            REPLACE(REPLACE(RTRIM(OBJECT_DEFINITION(OBJECT_ID(QUOTENAME(E.SchemaName)+N'.'+QUOTENAME(E.ObjectName)))),
                CHAR(13)+CHAR(10),CHAR(10)),CHAR(13),CHAR(10)))),2)) AS ActualSha256
    ) AS H
    WHERE E.ExpectedSha256 IS NOT NULL
      AND ISNULL(H.ActualSha256,'') <> E.ExpectedSha256
);

/* 5. WA_API route. */
SELECT N'05_WA_API_ROUTE' AS VerifyGroup,A.[list],A.[func],A.[SQL],A.Para
FROM dbo.WA_API AS A
WHERE A.[SQL] IN (SELECT ObjectName FROM @ExpectedObjects);

/* 6. Route duplicate. */
SELECT N'06_ROUTE_DUPLICATE' AS VerifyGroup,[list],[func],COUNT(*) AS RouteCount
FROM dbo.WA_API GROUP BY [list],[func] HAVING COUNT(*)>1;
SET @Blocking += (SELECT COUNT(*) FROM (SELECT 1 AS X FROM dbo.WA_API GROUP BY [list],[func] HAVING COUNT(*)>1) AS D);

/* 7. Route trỏ procedure không tồn tại. */
SELECT N'07_ROUTE_MISSING_PROCEDURE' AS VerifyGroup,A.[list],A.[func],A.[SQL]
FROM dbo.WA_API AS A
WHERE NULLIF(LTRIM(RTRIM(A.[SQL])),N'') IS NOT NULL
  AND A.[SQL] NOT LIKE N'% %'
  AND OBJECT_ID(N'dbo.'+PARSENAME(LTRIM(RTRIM(A.[SQL])),1),N'P') IS NULL;
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM dbo.WA_API AS A
    WHERE NULLIF(LTRIM(RTRIM(A.[SQL])),N'') IS NOT NULL
      AND A.[SQL] NOT LIKE N'% %'
      AND OBJECT_ID(N'dbo.'+PARSENAME(LTRIM(RTRIM(A.[SQL])),1),N'P') IS NULL
);

/* 8. SY_FrmLstTbl table/PK mismatch. */
SELECT N'08_FORM_TABLE_PK_MISMATCH' AS VerifyGroup,R.WebFormName,R.ExpectedTableName,R.ExpectedPrimaryKey,
       F.TableName AS RegisteredTable,F.PrimaryKey AS RegisteredPrimaryKey
FROM dbo.WA_FieldContractRegistry AS R
LEFT JOIN dbo.SY_FrmLstTbl AS F ON F.FormID=R.WebFormName
WHERE R.IsEnabled=1 AND R.ContractType<>'READ_ONLY'
  AND (F.FormID IS NULL OR F.TableName<>R.ExpectedTableName OR F.PrimaryKey<>R.ExpectedPrimaryKey);
SET @Blocking +=
(
    SELECT COUNT(*)
    FROM dbo.WA_FieldContractRegistry AS R
    LEFT JOIN dbo.SY_FrmLstTbl AS F ON F.FormID=R.WebFormName
    WHERE R.IsEnabled=1 AND R.ContractType<>'READ_ONLY'
      AND (F.FormID IS NULL OR F.TableName<>R.ExpectedTableName OR F.PrimaryKey<>R.ExpectedPrimaryKey)
);

/* 9. Unified Contract registry. */
SELECT N'09_CONTRACT_REGISTRY' AS VerifyGroup,ContractType,RolloutStatus,COUNT(*) AS ContractCount
FROM dbo.WA_FieldContractRegistry GROUP BY ContractType,RolloutStatus;

/* 10. Dataset registry. */
SELECT N'10_DATASET_REGISTRY' AS VerifyGroup,* FROM dbo.WA_FieldDatasetRegistry;

/* 11. Dashboard dependencies. */
SELECT N'11_DASHBOARD' AS VerifyGroup,D.ProcedureName,
       CASE WHEN OBJECT_ID(N'dbo.'+D.ProcedureName,N'P') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES (N'API_HR_Dashboard_GetBranches'),(N'API_HR_Dashboard_OverviewToday'),
 (N'API_HR_Dashboard_Demographics'),(N'API_HR_Dashboard_Department'),
 (N'API_HR_Dashboard_Birthdays'),(N'API_HR_Dashboard_Payroll'),
 (N'API_HR_Dashboard_ContractsExpiring')) AS D(ProcedureName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES (N'API_HR_Dashboard_GetBranches'),(N'API_HR_Dashboard_OverviewToday'),
 (N'API_HR_Dashboard_Demographics'),(N'API_HR_Dashboard_Department'),
 (N'API_HR_Dashboard_Birthdays'),(N'API_HR_Dashboard_Payroll'),
 (N'API_HR_Dashboard_ContractsExpiring')) AS D(ProcedureName)
 WHERE OBJECT_ID(N'dbo.'+D.ProcedureName,N'P') IS NULL);

/* 12. Bulk Import dependencies. */
SELECT N'12_BULK_IMPORT' AS VerifyGroup,T.ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+T.ObjectName,N'U') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES(N'SY_FrmLstTbl'),(N'WA_API'),(N'SY_User'),(N'WA_Menu'),(N'WA_UserGroupPermisstion')) AS T(ObjectName);

/* 13. Attachment/eContract dependencies. */
SELECT N'13_DOCUMENT_ATTACHMENT_ECONTRACT' AS VerifyGroup,V.Feature,V.Decision
FROM (VALUES
 (N'Contract document / attachment',N'KEEP_ORIGINAL_WA_API_BUSINESS_ROUTES'),
 (N'VNPT eContract tables/view',N'REVIEW_REQUIRED_NOT_DEPLOYED_NO_CURRENT_CALLER')
) AS V(Feature,Decision);

/* 14. Branch policy. */
SELECT N'14_BRANCH_POLICY' AS VerifyGroup,WebFormName,BranchPolicy,RolloutStatus
FROM dbo.WA_FieldContractRegistry;

/* 15. Legacy compatibility APIs. */
SELECT N'15_LEGACY_COMPATIBILITY' AS VerifyGroup,L.ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+L.ObjectName,N'P') IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM (VALUES(N'API_TruyVanDong'),(N'API_LuuDong'),(N'API_XoaDong')) AS L(ObjectName);
SET @Blocking += (SELECT COUNT(*) FROM (VALUES(N'API_TruyVanDong'),(N'API_LuuDong'),(N'API_XoaDong')) AS L(ObjectName)
 WHERE OBJECT_ID(N'dbo.'+L.ObjectName,N'P') IS NULL);

/* 16. Complex/deferred forms không bị cutover. */
SELECT N'16_COMPLEX_DEFERRED' AS VerifyGroup,WebFormName,ContractType,RolloutStatus,RolloutReason
FROM dbo.WA_FieldContractRegistry
WHERE ContractType IN ('COMPLEX_DEFERRED','BLOCKED') OR RolloutStatus IN ('DEFERRED','BLOCKED');

/* 17. Original-only object vẫn tồn tại. */
DECLARE @OriginalOnly table(ObjectName sysname);
INSERT INTO @OriginalOnly VALUES
${originalOnlyRows};
SELECT N'17_ORIGINAL_ONLY' AS VerifyGroup,ObjectName,
       CASE WHEN OBJECT_ID(N'dbo.'+ObjectName) IS NULL THEN 0 ELSE 1 END AS ExistsInDatabase
FROM @OriginalOnly;
SET @Blocking += (SELECT COUNT(*) FROM @OriginalOnly WHERE OBJECT_ID(N'dbo.'+ObjectName) IS NULL);

/* 18. Test-only object deploy hoặc loại với lý do. */
SELECT N'18_TEST_ONLY_DECISION' AS VerifyGroup,T.*
FROM (VALUES
${testOnlyRows}
) AS T(ObjectName,Decision,Reason);

/* 19. API decision matrix count. */
SELECT N'19_API_DECISION_COUNT' AS VerifyGroup,D.Decision,D.ObjectCount
FROM (VALUES
${Object.entries(decisionCounts).map(([decision, count]) => ` (N'${decision}',${count})`).join(',\n')}
) AS D(Decision,ObjectCount);

/* 20. Rollback readiness. */
SELECT N'20_ROLLBACK_READINESS' AS VerifyGroup,H.ReleaseID,H.Status,H.MetadataRouteBatchID,H.FieldRouteBatchID,
       CASE WHEN OBJECT_ID(N'dbo.API_Web_RollbackFieldContractV2',N'P') IS NULL THEN 0 ELSE 1 END AS RollbackProcedureExists
FROM dbo.WA_DatabaseReleaseHistory AS H WHERE H.ReleaseID=N'${releaseId}';
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.WA_DatabaseReleaseHistory
    WHERE ReleaseID=N'${releaseId}'
      AND Status='INSTALLED'
      AND ManifestSha256='PENDING_BUILD_MANIFEST'
)
    SET @Blocking += 1;

SELECT CASE WHEN @Blocking>0 THEN N'FAIL'
            WHEN @Review>0 THEN N'PASS_WITH_REVIEW'
            ELSE N'PASS' END AS FinalVerificationStatus,
       @Blocking AS BlockingIssueCount,@Review AS ManualReviewCount,
       ${countsFor(original).StoredProcedure} AS OriginalStoredProcedureAuditCount,
       ${countsFor(test).StoredProcedure} AS TestStoredProcedureAuditCount;
IF @Blocking>0 THROW 56400,N'VERIFY_ALL_FAILED',1;
GO
`;
}

function renderRollback(deploySelection, original) {
    const originalByName = objectsByName(original);
    const restore = [];
    for (const item of deploySelection.selected) {
        const originalObject = (originalByName.get(item.object.name.toLowerCase()) || [])
            .find((candidate) => candidate.type === item.object.type);
        if (!originalObject) continue;
        if (originalObject.semanticSha256 === item.object.semanticSha256) continue;
        restore.push({ object: originalObject, source: 'DB_ORIGINAL' });
    }
    const definitions = restore.length
        ? renderModuleObjects(restore, 'Khôi phục module gốc đã bị ALTER trong release.')
        : `PRINT N'Không có module gốc cần khôi phục definition.';\nGO`;
    return `
/*
  ROLLBACK_ALL phục hồi route/snapshot và definition gốc; không xóa business data,
  không drop bảng mới và không restore toàn database.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ReleaseID varchar(100)='${releaseId}';
DECLARE @Actor varchar(100)=LEFT(COALESCE(NULLIF(CONVERT(varchar(128),SUSER_SNAME()),''),'PRODUCTION_DATABASE_ROLLBACK'),100);
DECLARE @MetadataBatchID uniqueidentifier;
DECLARE @FieldBatchID uniqueidentifier;
SELECT @MetadataBatchID=MetadataRouteBatchID,@FieldBatchID=FieldRouteBatchID
FROM dbo.WA_DatabaseReleaseHistory
WHERE ReleaseID=@ReleaseID AND Status='INSTALLED';

IF @FieldBatchID IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.WA_FieldContractRouteBackup WHERE BackupBatchID=@FieldBatchID AND RestoredAt IS NULL)
    EXEC dbo.API_Web_RollbackFieldContractV2
        @WebFormName=NULL,@BatchID=@FieldBatchID,@TargetStatus='SHADOW',@UserName=@Actor;

IF @MetadataBatchID IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.WA_FieldContractRouteBackup WHERE BackupBatchID=@MetadataBatchID AND RestoredAt IS NULL)
    EXEC dbo.API_Web_RollbackFieldContractV2
        @WebFormName=NULL,@BatchID=@MetadataBatchID,@TargetStatus='SHADOW',@UserName=@Actor;
GO

${definitions}

UPDATE dbo.WA_DatabaseReleaseHistory
SET Status='ROLLED_BACK',RolledBackAt=SYSUTCDATETIME(),RolledBackBy=SUSER_SNAME()
WHERE ReleaseID='${releaseId}' AND Status='INSTALLED';
GO

PRINT N'MANUAL_CLEANUP_OPTIONAL: giữ các bảng/control object mới và mọi dữ liệu đã phát sinh; không DROP tự động.';
GO
`;
}

function renderDropCandidates(matrix) {
    const candidates = matrix.filter((row) => row.SafeToDrop);
    const body = candidates.length
        ? candidates.map((row) => `
PRINT N'Candidate: ${row.ObjectName}';
SELECT * FROM sys.sql_expression_dependencies WHERE referenced_id=OBJECT_ID(N'dbo.${row.ObjectName}');
SELECT * FROM dbo.WA_API WHERE PARSENAME(LTRIM(RTRIM([SQL])),1)=N'${row.ObjectName}';
SELECT OBJECT_ID(N'dbo.${row.ObjectName}') AS ObjectID;
-- DROP PROCEDURE dbo.${row.ObjectName};`).join('\n')
        : `PRINT N'Không có object SafeToDrop=true. Release này không sinh lệnh DROP.';`;
    return `
/*
  Không chạy file này trong ngày rollout.
  Chỉ bỏ comment sau giai đoạn monitoring và phê duyệt thủ công.
*/
SET NOCOUNT ON;
${body}
GO
`;
}

async function renderReleaseSources(deploySelection, matrix, original, test) {
    const selected = deploySelection.selected;
    const groups = {
        views: selected.filter((item) => item.object.type === 'View'),
        functions: selected.filter((item) => item.object.type === 'Function'),
        framework: selected.filter((item) =>
            item.object.type === 'StoredProcedure'
            && frameworkNames.has(item.object.name)
        ),
        dashboard: selected.filter((item) =>
            item.object.type === 'StoredProcedure'
            && dashboardNames.has(item.object.name)
        ),
        business: selected.filter((item) =>
            item.object.type === 'StoredProcedure'
            && !frameworkNames.has(item.object.name)
            && !dashboardNames.has(item.object.name)
        )
    };

    const sourceFiles = {
        precheck: path.join(sourceDirectory(0, 'Precheck'), '001_release_precheck.sql'),
        tables: path.join(sourceDirectory(1, 'Tables'), '001_control_tables.sql'),
        constraints: path.join(sourceDirectory(2, 'ConstraintsAndIndexes'), '001_safe_constraints_and_indexes.sql'),
        views: path.join(sourceDirectory(3, 'Views'), '001_canonical_views.sql'),
        functions: path.join(sourceDirectory(4, 'Functions'), '001_canonical_functions.sql'),
        framework: path.join(sourceDirectory(5, 'FrameworkProcedures'), '001_canonical_framework_procedures.sql'),
        business: path.join(sourceDirectory(6, 'BusinessProcedures'), '001_approved_business_procedures.sql'),
        dashboard: path.join(sourceDirectory(7, 'Dashboard'), '001_dashboard_procedures.sql'),
        excel: path.join(sourceDirectory(8, 'ExcelImport'), '001_excel_import_support.sql'),
        documents: path.join(sourceDirectory(9, 'DocumentsAndAttachments'), '001_document_attachment_decision.sql'),
        econtract: path.join(sourceDirectory(10, 'EContract'), '001_econtract_decision.sql'),
        registry: path.join(sourceDirectory(11, 'MetadataRegistry'), '001_field_contract_seed.sql'),
        systemSeeds: path.join(sourceDirectory(12, 'SystemSeeds'), '001_explicit_system_seed.sql'),
        cutover: path.join(sourceDirectory(13, 'WaApiCutover'), '001_route_backup_and_cutover.sql'),
        summary: path.join(sourceDirectory(14, 'Verification'), '001_install_summary.sql'),
        verify: path.join(sourceDirectory(14, 'Verification'), '002_verify_all.sql'),
        rollback: path.join(sourceDirectory(15, 'Rollback'), '001_rollback_all.sql'),
        drop: path.join(sourceDirectory(15, 'Rollback'), '002_drop_candidates_readonly.sql')
    };

    await writeText(
        sourceFiles.precheck,
        renderPrecheck(deploySelection.blocking, deploySelection, original)
    );
    await writeText(sourceFiles.tables, renderControlTables());
    await writeText(sourceFiles.constraints, `
/* Không có ALTER thu hẹp kiểu/nullable, DROP column, rebuild table hoặc constraint phá dữ liệu. */
SET NOCOUNT ON;
PRINT N'Các constraint/index của control table được tạo cùng table; schema business khác biệt chỉ báo cáo để review.';
GO`);
    await writeText(sourceFiles.views, renderModuleObjects(groups.views, 'Canonical views'));
    await writeText(sourceFiles.functions, renderModuleObjects(groups.functions, 'Canonical functions'));
    await writeText(sourceFiles.framework, renderModuleObjects(groups.framework, 'Canonical framework procedures'));
    await writeText(sourceFiles.business, renderModuleObjects(groups.business, 'Business procedures có caller hiện tại và canonical source rõ ràng'));
    await writeText(sourceFiles.dashboard, renderModuleObjects(groups.dashboard, 'Dashboard procedures backend gọi trực tiếp'));
    await writeText(sourceFiles.excel, `
/* Bulk Import dùng #temp table trong transaction; không tạo staging table lâu dài. */
SET NOCOUNT ON;
SELECT N'EXCEL_IMPORT_SUPPORT' AS SupportName,
       N'DIRECT_SQL_WITH_TEMP_TABLE_NO_PERSISTENT_OBJECT' AS Decision;
GO`);
    await writeText(sourceFiles.documents, `
/* Document/attachment hiện dùng business WA_API route; giữ definition/route production. */
SET NOCOUNT ON;
SELECT N'DOCUMENT_AND_ATTACHMENT' AS Feature,N'KEEP_ORIGINAL_BUSINESS_ROUTES' AS Decision;
GO`);
    await writeText(sourceFiles.econtract, `
/* Không seed secret/config từ DB test. Source hiện tại không có caller VNPT eContract trực tiếp. */
SET NOCOUNT ON;
SELECT N'VNPT_ECONTRACT' AS Feature,N'REVIEW_REQUIRED_NOT_DEPLOYED' AS Decision;
GO`);
    await writeText(sourceFiles.registry, renderRegistrySeed());
    await writeText(sourceFiles.systemSeeds, `
/*
  Không replay dump test. Không copy SY_User, permission, menu, nhân sự, lương,
  hợp đồng, bảo hiểm, chấm công hoặc toàn bảng format.
*/
SET NOCOUNT ON;
PRINT N'Không có system seed ngoài registry/route explicit của release.';
GO`);
    await writeText(sourceFiles.cutover, renderRouteCutover(deploySelection.routeSeeds));
    await writeText(sourceFiles.summary, renderInstallSummary(deploySelection, matrix));
    await writeText(sourceFiles.verify, renderVerify(deploySelection, matrix, original, test));
    await writeText(sourceFiles.rollback, renderRollback(deploySelection, original));
    await writeText(sourceFiles.drop, renderDropCandidates(matrix));
    return sourceFiles;
}

function summarizeDecisions(matrix) {
    const result = {};
    for (const row of matrix) result[row.Decision] = (result[row.Decision] || 0) + 1;
    return Object.fromEntries(Object.entries(result).sort());
}

async function writeReports({
    original,
    test,
    counts,
    objectDiff,
    matrix,
    tableDiff,
    routeDiff,
    systemMetadataDiff,
    repository,
    deploySelection
}) {
    const changedSameName = objectDiff.filter((row) =>
        row.ExistsInOriginal && row.ExistsInTest && !row.SameDefinition
    );
    const diffSummary = [
        '# So sánh object database',
        '',
        `- DB gốc: ${counts.original.Table} table, ${counts.original.View} view, ${counts.original.StoredProcedure} stored procedure, ${counts.original.ApiStoredProcedure} API_ procedure.`,
        `- DB test: ${counts.test.Table} table, ${counts.test.View} view, ${counts.test.StoredProcedure} stored procedure, ${counts.test.ApiStoredProcedure} API_ procedure.`,
        `- Object cùng key nhưng khác semantic definition: ${changedSameName.length}.`,
        '',
        markdownTable(
            ['ObjectType', 'ObjectName', 'ExistsInOriginal', 'ExistsInTest', 'SameDefinition', 'ParameterSignatureChanged'],
            objectDiff
        )
    ].join('\n');
    await writeText(path.join(reportsRoot, 'DATABASE_OBJECT_DIFF.md'), diffSummary);

    const matrixColumns = [
        'ObjectName', 'ExistsInOriginal', 'ExistsInTest', 'ExistsInRepository',
        'ReferencedByFrontend', 'ReferencedByBackend', 'ReferencedBySQL',
        'RegisteredInWA_APIOriginal', 'RegisteredInWA_APITest', 'DependencyCount',
        'Category', 'Decision', 'CanonicalSource', 'Reason', 'DeploymentOrder',
        'RollbackSource', 'SafeToDrop', 'ManualReviewReason'
    ];
    await writeText(path.join(reportsRoot, 'API_DECISION_MATRIX.md'), [
        '# Ma trận quyết định API',
        '',
        `Tổng số object API_: ${matrix.length}. Không có quyết định DROP_IMMEDIATELY.`,
        '',
        markdownTable(matrixColumns, matrix)
    ].join('\n'));
    await writeText(path.join(reportsRoot, 'API_DECISION_MATRIX.csv'), [
        matrixColumns.map(csvCell).join(','),
        ...matrix.map((row) => matrixColumns.map((column) => csvCell(row[column])).join(','))
    ].join('\n'));

    await writeText(path.join(reportsRoot, 'TABLE_SCHEMA_DIFF.md'), [
        '# So sánh table/schema',
        '',
        'Release không drop table/column, không thu hẹp kiểu, không đổi NULL thành NOT NULL và không copy business data từ DB test.',
        '',
        markdownTable(['TableName', 'ExistsInOriginal', 'ExistsInTest', 'SameDefinition', 'ColumnChanges', 'DeploymentDecision'], tableDiff)
    ].join('\n'));

    const viewRows = objectDiff.filter((row) => row.ObjectType === 'View');
    await writeText(path.join(reportsRoot, 'VIEW_DIFF.md'), [
        '# So sánh view',
        '',
        markdownTable(['ObjectName', 'ExistsInOriginal', 'ExistsInTest', 'SameDefinition', 'ReadWriteSignalsChanged'], viewRows),
        '',
        'VNPT_EContractHopDongView là test-only nhưng không có caller hiện tại nên REVIEW_REQUIRED, không deploy.'
    ].join('\n'));

    await writeText(path.join(reportsRoot, 'ROUTE_DIFF.md'), [
        '# So sánh WA_API theo List + Func',
        '',
        'Route phức tạp giữ nguyên. Route framework/caller test-only chỉ cutover khi procedure hiện tại thuộc known original/repository và luôn backup trước.',
        '',
        markdownTable(['List', 'Func', 'OriginalCount', 'TestCount', 'OriginalProcedure', 'TestProcedure', 'ParaChanged', 'Classification'], routeDiff)
    ].join('\n'));

    await writeText(path.join(reportsRoot, 'SYSTEM_METADATA_DIFF.md'), [
        '# So sánh system metadata',
        '',
        `- WA_API gốc/test: ${original.metadata.WA_API.length}/${test.metadata.WA_API.length} row parsed.`,
        `- SY_FrmLstTbl gốc/test: ${original.metadata.SY_FrmLstTbl.length}/${test.metadata.SY_FrmLstTbl.length} row parsed.`,
        '- Không replay toàn bộ INSERT test; chỉ registry/route explicit được đưa vào installer.',
        '',
        markdownTable(['Key', 'ExistsInOriginal', 'ExistsInTest', 'SameRow'], systemMetadataDiff)
    ].join('\n'));

    const reviewRows = matrix.filter((row) =>
        row.ManualReviewReason
        || ['MERGE_REQUIRED', 'REVIEW_REQUIRED', 'DROP_CANDIDATE_AFTER_MONITORING'].includes(row.Decision)
    );
    await writeText(path.join(reportsRoot, 'MANUAL_REVIEW_REQUIRED.md'), [
        '# Manual review required',
        '',
        ...deploySelection.blocking.map((issue) => `- BLOCKING: ${issue}`),
        deploySelection.blocking.length ? '' : '- Không có BLOCKING_MISSING_DEPENDENCY trong package build.',
        '- API_BaoHiem_PersonLookup và WA_BaoHiem_PersonLookup phải so sánh contract/caller/permission; release giữ API production và không merge theo tên.',
        '- VNPT eContract test-only không deploy vì source hiện tại không có caller trực tiếp; không seed secret/config test.',
        '',
        markdownTable(['ObjectName', 'Decision', 'CanonicalSource', 'ManualReviewReason', 'Reason'], reviewRows)
    ].join('\n'));

    const deprecated = matrix.filter((row) =>
        ['DEPRECATE_NOT_DEPLOY', 'DROP_CANDIDATE_AFTER_MONITORING'].includes(row.Decision)
    );
    await writeText(path.join(reportsRoot, 'DEPRECATED_OBJECTS.md'), [
        '# Deprecated objects',
        '',
        'Không object nào bị DROP trong INSTALL_ALL. SafeToDrop mặc định false cho đến sau monitoring và phê duyệt thủ công.',
        '',
        markdownTable(['ObjectName', 'Decision', 'SafeToDrop', 'Reason'], deprecated)
    ].join('\n'));

    const superseded = [];
    for (const object of repository.canonical.values()) {
        for (const candidate of object.repositoryCandidates || []) {
            if (candidate.file !== object.repositoryFile) {
                superseded.push({
                    ObjectName: object.name,
                    CanonicalFile: object.repositoryFile,
                    SupersededFile: candidate.file,
                    ExactDuplicate: candidate.semanticSha256 === object.semanticSha256
                });
            }
        }
    }
    await writeText(path.join(reportsRoot, 'SUPERSEDED_SOURCE_FILES.md'), [
        '# Source cũ bị superseded khỏi production manifest',
        '',
        'File phase cũ vẫn được giữ trong repository làm lịch sử; production manifest chỉ dùng canonical source trong ProductionDatabaseRelease/source.',
        '',
        markdownTable(['ObjectName', 'CanonicalFile', 'SupersededFile', 'ExactDuplicate'], superseded)
    ].join('\n'));
}

async function writeReadme(counts, matrix, deploySelection) {
    const decisionCounts = summarizeDecisions(matrix);
    const reviewNames = matrix.filter((row) =>
        ['MERGE_REQUIRED', 'REVIEW_REQUIRED'].includes(row.Decision)
    ).map((row) => row.ObjectName);
    await writeText(path.join(releaseRoot, 'README_TRIEN_KHAI.md'), `
# Triển khai Production Database Release

## Phạm vi và nguồn so sánh

Package được audit từ DB gốc \`X26DIMTUTAC\` trong \`SchemaDataGoc.sql\` và DB test \`X26DIM_TT\` trong \`Schemadatatest.sql\`. Parser đọc ZIP/UTF-16 LE theo stream, không chạy dump và không copy business data.

Canonical source được chọn theo thứ tự trách nhiệm: repository cho Unified Field Contract, CRUD V2, API_Web, Dashboard và dependency backend; DB gốc cho ERP/business/custom/report/legacy; DB test chỉ khi có caller/dependency hiện tại và không có canonical repository. Mỗi object deploy chỉ có một source trong manifest.

## Kết quả audit

- DB gốc: ${counts.original.Table} table, ${counts.original.View} view, ${counts.original.StoredProcedure} stored procedure (${counts.original.ApiStoredProcedure} API_).
- DB test: ${counts.test.Table} table, ${counts.test.View} view, ${counts.test.StoredProcedure} stored procedure (${counts.test.ApiStoredProcedure} API_).
- Object canonical deploy: ${deploySelection.selected.length + 1} table/function/procedure; build manifest sẽ tính thêm index control.
- Decision count: ${Object.entries(decisionCounts).map(([key, value]) => `${key}=${value}`).join(', ')}.
- Compatibility giữ nguyên: API_TruyVanDong, API_LuuDong, API_XoaDong.
- Business API original-only, report và form complex/deferred không bị cutover.
- VNPT eContract test-only không deploy/không seed secret do chưa có caller runtime trực tiếp.
- Cần review: ${reviewNames.length ? reviewNames.join(', ') : 'không có'}.

## Nhóm object triển khai

- Object control mới: \`WA_FieldContractRegistry\`, \`WA_FieldDatasetRegistry\`, \`WA_FieldContractRouteBackup\`, \`WA_DatabaseReleaseHistory\`; chỉ tạo khi chưa tồn tại và không chứa business data.
- Framework/repository: generic CRUD V2, Unified Field Contract/API_Web, Dashboard và các dependency hiện được backend/frontend gọi. Danh sách cùng hash nằm trong \`object-manifest.json\`.
- Nguồn DB test chỉ dùng cho object có caller/route/dependency trực tiếp; danh sách và lý do nằm trong \`api-manifest.json\`.
- DB gốc giữ nguyên các API business/ERP/report; đặc biệt \`API_BaoHiem_PersonLookup\` không bị thay bằng object gần tên.
- Không deploy prototype/test-only chưa có caller và VNPT eContract chưa có bằng chứng runtime trực tiếp. Không object nào bị DROP trong INSTALL_ALL.

## Backup và chạy

1. Tạo full backup và kiểm tra khả năng restore của DB production trước rollout.
2. Mở SQL Server Management Studio, bật **Query > SQLCMD Mode**.
3. Mở \`generated/HRM_DATABASE_INSTALL_ALL.sql\`; đổi \`:setvar TargetDatabase "X26DIMTUTAC"\` nếu clone dùng tên khác.
4. Giữ \`:setvar ReleaseMode "PRODUCTION"\` cho production; chạy toàn file. Precheck sẽ dừng nếu sai DB/system DB/core baseline/route duplicate/dependency.
5. Chạy \`generated/HRM_DATABASE_VERIFY_ALL.sql\`. Kết quả cuối là PASS, PASS_WITH_REVIEW hoặc FAIL.
6. Nếu cần rollback route/object, chạy \`generated/HRM_DATABASE_ROLLBACK_ALL.sql\` trên đúng DB. Rollback không xóa business data, không drop bảng registry có dữ liệu và không restore database.
7. Không chạy \`HRM_DATABASE_DROP_CANDIDATES.sql\` trong cùng ngày rollout. File mặc định chỉ SELECT/PRINT; DROP đều comment.

## WA_API, backend và môi trường

Kiểm tra result set route theo List + Func, duplicate, procedure target và Para trong VERIFY_ALL. Cutover chỉ áp dụng contract SHADOW đã audit, backup trước, transaction/idempotent và từ chối custom route không thuộc known legacy/V2.

Sau verify thành công, restart backend. Backend direct SQL cần \`SQL_SERVER\`, \`SQL_DATABASE\`, \`SQL_USER\`, \`SQL_PASSWORD\`; tùy môi trường có \`SQL_PORT\`, \`SQL_ENCRYPT\`, \`SQL_TRUST_SERVER_CERTIFICATE\`, \`SQL_POOL_MAX\`, \`SQL_CONNECT_TIMEOUT_MS\`, \`SQL_REQUEST_TIMEOUT_MS\`. Contract document gateway cần \`SQL_API_BASE\` và production cần \`DRAFT_SIGNING_SECRET\`; không đưa secret vào installer.

## Checklist monitoring

- Theo dõi lỗi gateway/backend và SQL timeout/deadlock.
- Kiểm tra Dashboard, metadata, Bulk Import, Unified Contract, lookup/filter/master-detail.
- Kiểm tra Bảo hiểm, Hồ sơ nhân viên, Hợp đồng lao động vẫn dùng business/legacy route.
- So sánh row count bảng nhân sự/lương/hợp đồng/bảo hiểm/chấm công trước và sau.
- Kiểm tra attachment/document và quyền theo chi nhánh.
- Giữ snapshot route cho đến hết thời gian monitoring; chỉ xem xét DROP sau phê duyệt thủ công.
`);
    await writeText(path.join(archiveRoot, 'README.md'), `
# Archive

Các phase script cũ vẫn nằm ở vị trí lịch sử trong repository và không được production manifest tham chiếu. Xem \`reports/SUPERSEDED_SOURCE_FILES.md\`.
`);
}

async function writeManifests({
    counts,
    matrix,
    objectDiff,
    deploySelection,
    sourceFiles,
    original,
    test
}) {
    const zipHash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(zipPath)) zipHash.update(chunk);
    const installFiles = [
        sourceFiles.precheck, sourceFiles.tables, sourceFiles.constraints, sourceFiles.views,
        sourceFiles.functions, sourceFiles.framework, sourceFiles.dashboard, sourceFiles.excel,
        sourceFiles.documents, sourceFiles.econtract, sourceFiles.business, sourceFiles.registry,
        sourceFiles.systemSeeds, sourceFiles.cutover, sourceFiles.summary
    ].map(relativePath);
    const manifest = {
        schemaVersion: 1,
        releaseId,
        targetDatabaseDefault: 'X26DIMTUTAC',
        releaseModeDefault: 'PRODUCTION',
        schemaPackage: {
            pathUsedForAnalysis: zipPath,
            sha256: zipHash.digest('hex'),
            originalEntry: original.zipEntry,
            testEntry: test.zipEntry
        },
        counts,
        blockingIssues: deploySelection.blocking,
        decisionCounts: summarizeDecisions(matrix),
        files: {
            install: installFiles,
            verify: [relativePath(sourceFiles.verify)],
            rollback: [relativePath(sourceFiles.rollback)],
            dropCandidates: [relativePath(sourceFiles.drop)]
        },
        generated: {}
    };
    await writeJson(path.join(releaseRoot, 'release-manifest.json'), manifest);
    await writeJson(path.join(releaseRoot, 'api-manifest.json'), {
        schemaVersion: 1,
        releaseId,
        decisionCounts: summarizeDecisions(matrix),
        apis: matrix
    });
    await writeJson(path.join(releaseRoot, 'object-manifest.json'), {
        schemaVersion: 1,
        releaseId,
        changedSameNameCount: objectDiff.filter((row) =>
            row.ExistsInOriginal && row.ExistsInTest && !row.SameDefinition
        ).length,
        blockingIssues: deploySelection.blocking,
        deployedObjects: [{
            deploymentOrder: 1,
            objectType: 'Table',
            schema: 'dbo',
            name: 'WA_DatabaseReleaseHistory',
            canonicalSource: 'REPOSITORY_RELEASE_CONTROL',
            canonicalInput: relativePath(sourceFiles.tables),
            sha256: null,
            semanticSha256: null,
            rollbackSource: 'KEEP_TABLE_MANUAL_CLEANUP_OPTIONAL'
        }, ...deploySelection.selected.map((item, index) => ({
            deploymentOrder: index + 2,
            objectType: item.object.type,
            schema: item.object.schema,
            name: item.object.name,
            canonicalSource: item.source,
            canonicalInput: item.object.repositoryFile || item.object.sourceName,
            sha256: sha256(toCreateOrAlter(item.object.definition)),
            semanticSha256: item.object.semanticSha256,
            rollbackSource: (objectsByName(original).get(item.object.name.toLowerCase()) || []).length
                ? 'DB_ORIGINAL'
                : 'DISABLE_ROUTE_KEEP_OBJECT'
        }))],
        retainedCompatibility: [...legacyCompatibilityNames],
        nonDeployedReview: matrix.filter((row) =>
            !['KEEP_REPOSITORY', 'KEEP_TEST'].includes(row.Decision)
        ).map((row) => ({
            name: row.ObjectName,
            decision: row.Decision,
            reason: row.Reason
        }))
    });
}

async function main() {
    await ensureDirectories();
    console.log(`Đọc schema package theo stream: ${zipPath}`);
    const { original, test } = await parseZipDumps();
    const counts = assertReliableCounts(original, test);
    console.log(`Sanity check: original ${JSON.stringify(counts.original)}, test ${JSON.stringify(counts.test)}`);

    const repository = await parseRepositoryObjects();
    const references = await scanReferences();
    const objectDiff = buildObjectDiff(original, test, repository);
    const matrix = buildDecisionMatrix(original, test, repository, references);
    const tableDiff = buildTableDiff(original, test);
    const routeDiff = routeDiffRows(original.metadata.WA_API, test.metadata.WA_API);
    const systemMetadataDiff = metadataDiffRows(
        original.metadata.SY_FrmLstTbl,
        test.metadata.SY_FrmLstTbl,
        ['FormID']
    );
    const deploySelection = chooseDeployObjects(matrix, original, test, repository, references);

    const referenceOutput = [...references.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((item) => ({
            objectName: item.name,
            frontend: item.files.filter((file) => file.area === 'frontend'),
            backend: item.files.filter((file) => file.area === 'backend'),
            sql: item.files.filter((file) => file.area === 'sql'),
            other: item.files.filter((file) => file.area === 'other')
        }));

    await writeJson(path.join(analysisRoot, 'objects-original.json'), {
        source: original.source,
        zipEntry: original.zipEntry,
        counts: counts.original,
        objects: original.objects
    });
    await writeJson(path.join(analysisRoot, 'objects-test.json'), {
        source: test.source,
        zipEntry: test.zipEntry,
        counts: counts.test,
        objects: test.objects
    });
    await writeJson(path.join(analysisRoot, 'object-diff.json'), objectDiff);
    await writeJson(path.join(analysisRoot, 'api-references.json'), referenceOutput);
    await writeJson(path.join(analysisRoot, 'wa-api-original.json'), original.metadata.WA_API);
    await writeJson(path.join(analysisRoot, 'wa-api-test.json'), test.metadata.WA_API);
    await writeJson(path.join(analysisRoot, 'sy-frmlst-original.json'), original.metadata.SY_FrmLstTbl);
    await writeJson(path.join(analysisRoot, 'sy-frmlst-test.json'), test.metadata.SY_FrmLstTbl);

    const sourceFiles = await renderReleaseSources(deploySelection, matrix, original, test);
    await writeReports({
        original, test, counts, objectDiff, matrix, tableDiff, routeDiff,
        systemMetadataDiff, repository, deploySelection
    });
    await writeReadme(counts, matrix, deploySelection);
    await writeManifests({
        counts, matrix, objectDiff, deploySelection, sourceFiles, original, test
    });

    console.log(`Phân tích hoàn tất: ${relativePath(releaseRoot)}`);
    console.log(`Blocking issues: ${deploySelection.blocking.length}`);
}

main().catch((error) => {
    const message = error?.stack || error?.message || String(error);
    console.error(message);
    if (message.includes('SCHEMA_PARSER_RESULT_UNRELIABLE')) process.exitCode = 3;
    else process.exitCode = 1;
});
