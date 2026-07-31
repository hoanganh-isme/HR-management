import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlRoot = path.join(root, 'sql');
const outputRoot = path.join(root, 'docs', 'phase2-api-migration');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ['.git', 'node_modules', 'storage', 'uploads'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function isAuditSql(file) {
  const rel = relative(file).toLowerCase();
  const base = path.basename(file).toLowerCase();
  return rel.startsWith('sql/api/')
    || rel.startsWith('sql/insert/')
    || rel.startsWith('sql/modules/')
    || rel.startsWith('sql/update/')
    || rel.startsWith('sql/phase2apimigration/')
    || base.startsWith('combined')
    || base.startsWith('install-order')
    || base.startsWith('verify')
    || base.startsWith('rollback');
}

function stripComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\r\n]*/g, ' ');
}

function compact(value, max = 600) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers, rows) {
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')).join('\n')}\n`;
}

const sqlFiles = walk(sqlRoot).filter((file) => file.toLowerCase().endsWith('.sql') && isAuditSql(file));
const sqlSources = sqlFiles.map((file) => ({ file, rel: relative(file), text: fs.readFileSync(file, 'utf8') }));
const frontendSources = walk(path.join(root, 'src'))
  .filter((file) => /\.(?:js|html)$/i.test(file) && !file.endsWith('app.bundle.js'))
  .map((file) => ({ rel: relative(file), lower: fs.readFileSync(file, 'utf8').toLowerCase() }));

const registrations = new Map();
const registrationPattern = /\(\s*(?:\d+\s*,\s*)?N?'([^']+)'\s*,\s*N?'(View|Execute|Save|Delete)'\s*,\s*N?'([A-Za-z0-9_.]+)'/gi;
for (const source of sqlSources) {
  let match;
  while ((match = registrationPattern.exec(source.text)) !== null) {
    const key = match[3].replace(/^dbo\./i, '').toLowerCase();
    const item = `${match[1]}:${match[2]}`;
    const values = registrations.get(key) || new Set();
    values.add(item);
    registrations.set(key, values);
  }
}

const definitions = [];
const definitionPattern = /\b(?:CREATE\s+(?:OR\s+ALTER\s+)?|ALTER\s+)PROCEDURE\s+(?:\[?dbo\]?\s*\.\s*)?\[?([A-Za-z0-9_]+)\]?/gi;
for (const source of sqlSources) {
  const matches = [];
  let match;
  while ((match = definitionPattern.exec(source.text)) !== null) matches.push({ name: match[1], index: match.index });
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const end = index + 1 < matches.length ? matches[index + 1].index : source.text.length;
    definitions.push({ file: source.rel, procedure: current.name, body: source.text.slice(current.index, end) });
  }
}

function selectCandidates(body) {
  const clean = stripComments(body);
  const pattern = /\bSELECT\s+([\s\S]{1,3000}?)\s+FROM\s+(?:\[?dbo\]?\s*\.\s*)?\[?([A-Za-z0-9_#@]+)\]?(?:\s+(?:AS\s+)?\[?([A-Za-z0-9_]+)\]?)?/gi;
  const candidates = [];
  let match;
  while ((match = pattern.exec(clean)) !== null) {
    const table = match[2];
    const system = /^(?:sys|sy_|wa_|openjson|string_split|inserted|deleted|#|@)/i.test(table);
    candidates.push({ columns: compact(match[1]), table, alias: match[3] || '', system });
  }
  return candidates;
}

function joinRows(definition, primaryAlias) {
  const clean = stripComments(definition.body);
  const pattern = /\b((?:LEFT|RIGHT|FULL|INNER|CROSS)\s+(?:OUTER\s+)?JOIN|JOIN|OUTER\s+APPLY|CROSS\s+APPLY)\s+(?:\[?dbo\]?\s*\.\s*)?\[?([A-Za-z0-9_#@]+)\]?(?:\s+(?:AS\s+)?\[?([A-Za-z0-9_]+)\]?)?(?:\s+ON\s+([\s\S]*?))?(?=\b(?:LEFT|RIGHT|FULL|INNER|CROSS)\s+(?:OUTER\s+)?JOIN\b|\bJOIN\b|\bOUTER\s+APPLY\b|\bCROSS\s+APPLY\b|\bWHERE\b|\bGROUP\s+BY\b|\bORDER\s+BY\b|;|\bEND\b)/gi;
  const rows = [];
  let match;
  while ((match = pattern.exec(clean)) !== null) {
    rows.push({ type: compact(match[1], 40).toUpperCase(), table: match[2], alias: match[3] || '', condition: compact(match[4], 350), primaryAlias });
  }
  return rows;
}

function flags(definition) {
  const body = stripComments(definition.body);
  return {
    star: /\bSELECT\s+(?:TOP\s*\([^)]*\)\s+|TOP\s+\d+\s+|DISTINCT\s+)*(?:[A-Za-z_][A-Za-z0-9_]*\s*\.\s*)?\*/i.test(body),
    aggregate: /\b(?:GROUP\s+BY|SUM\s*\(|COUNT\s*\(|AVG\s*\(|MIN\s*\(|MAX\s*\()/i.test(body),
    union: /\bUNION(?:\s+ALL)?\b/i.test(body),
    pivot: /\bPIVOT\b/i.test(body),
    blob: /\b(?:Content|Base64Content|FileContent|BinaryData|varbinary|image|xml|text|ntext|sql_variant|geography|geometry|hierarchyid)\b/i.test(body),
    sensitive: /\b(?:Password|PasswordHash|Token|RefreshToken|Secret|RawSql|CommandText|Luong|Salary|BankAccount|CCCD|CMND|BHXH|DiaChi|Address|Phone|DienThoai|Email)\b/i.test(body),
    branch: /\b(?:BranchID|ChiNhanhID|MaChiNhanh)\b/i.test(body),
    permission: /\b(?:WA_UserGroupPermisstion|WA_UserPermisstion|isNotCheckPermission)\b/i.test(body),
    multiResult: (body.match(/\bSELECT\b/gi) || []).length > 3
  };
}

function classify(definition, main, joins, marker) {
  const name = definition.procedure.toLowerCase();
  if (/attach|attachment|document|file|avatar/.test(name) || marker.blob) return 'ATTACHMENT';
  if (/report|baocao|dashboard/.test(name)) return 'REPORT';
  if (/payroll|timesheet|baohiem|insurance|tinhbh|process|calculate|xuly|luu|save|xoa|delete/.test(name)) return 'BUSINESS_ACTION';
  if (/lookup|combo|dropdown/.test(name)) return 'LOOKUP';
  if (marker.union || marker.pivot || marker.multiResult) return 'MULTI_RESULT';
  if (marker.aggregate) return 'AGGREGATE';
  if (joins.length) return 'JOINED_MASTER';
  if (main && !main.system) return 'SIMPLE_SINGLE_TABLE';
  return 'UNKNOWN';
}

function decision(category, marker) {
  if (marker.blob || (marker.star && marker.sensitive)) return 'BLOCKED';
  if (['REPORT', 'AGGREGATE', 'LOOKUP', 'BUSINESS_ACTION', 'ATTACHMENT', 'MULTI_RESULT'].includes(category)) return 'EXCLUDE_PHASE2';
  if (category === 'SIMPLE_SINGLE_TABLE') return marker.sensitive ? 'KEEP_EXPLICIT' : 'CONVERT_MASTER_STAR';
  if (category === 'JOINED_MASTER') return 'REWRITE_SAFE_JOIN';
  return 'BLOCKED';
}

const inventoryRows = [];
const joinsOutput = [];
const starOutput = [];
for (const definition of definitions) {
  const candidates = selectCandidates(definition.body);
  const main = candidates.find((candidate) => !candidate.system) || candidates[0] || null;
  const joins = joinRows(definition, main?.alias || '');
  const marker = flags(definition);
  const category = classify(definition, main, joins, marker);
  const migrationDecision = decision(category, marker);
  const registration = [...(registrations.get(definition.procedure.toLowerCase()) || [])];
  const consumers = frontendSources.filter((source) => source.lower.includes(definition.procedure.toLowerCase())).map((source) => source.rel);
  const joinedTables = [...new Set(joins.map((join) => join.table))];
  const joinedTypes = [...new Set(joins.map((join) => join.type))];
  const risk = migrationDecision === 'BLOCKED' || marker.blob ? 'CRITICAL'
    : marker.sensitive || joins.length || marker.aggregate || marker.union ? 'HIGH'
      : marker.star ? 'MEDIUM' : 'LOW';

  inventoryRows.push({
    File: definition.file,
    Procedure: definition.procedure,
    WAApiList: registration.map((item) => item.split(':')[0]).join('|'),
    WAApiFunc: registration.map((item) => item.split(':')[1]).join('|'),
    MainTable: main?.table || '',
    PrimaryAlias: main?.alias || '',
    JoinTables: joinedTables.join('|'),
    JoinType: joinedTypes.join('|'),
    JoinCondition: joins.map((join) => join.condition).filter(Boolean).join(' | '),
    JoinCardinality: joins.length ? 'CHUA_XAC_MINH_DB' : 'NONE',
    CurrentColumns: main?.columns || '',
    HasSelectStar: marker.star ? 'YES' : 'NO',
    HasAggregate: marker.aggregate ? 'YES' : 'NO',
    HasUnion: marker.union ? 'YES' : 'NO',
    HasBlob: marker.blob ? 'YES' : 'NO',
    HasSensitiveData: marker.sensitive ? 'YES' : 'NO',
    BranchFilter: marker.branch ? 'STATIC_REFERENCE_FOUND' : 'NOT_FOUND_STATIC',
    PermissionFilter: marker.permission ? 'STATIC_REFERENCE_FOUND' : 'NOT_FOUND_STATIC',
    FrontendConsumers: consumers.join('|'),
    Category: category,
    Decision: migrationDecision,
    Risk: risk
  });

  for (const join of joins) {
    const proc = definition.procedure.toLowerCase();
    let duplicateRisk = 'CHUA_XAC_MINH_DB';
    if (proc === 'api_baohiem_detail' && /hr_hopdongtbl/i.test(join.table)) duplicateRisk = 'HIGH_PERSON_HAS_MULTIPLE_CONTRACTS';
    if (proc === 'api_calculate_mucdong_congdoan') duplicateRisk = 'CRITICAL_POSSIBLE_N_X_M';
    if (proc === 'api_hopdonglaodong') duplicateRisk = 'REQUIRES_PK_UNIQUENESS_TEST';
    joinsOutput.push({
      Procedure: definition.procedure,
      MainTable: main?.table || '',
      JoinTable: join.table,
      JoinType: join.type,
      JoinCondition: join.condition,
      ExpectedCardinality: 'CHUA_XAC_MINH_DB',
      ActualDuplicateRisk: duplicateRisk,
      JoinedColumns: main?.columns || '',
      AliasCompatibility: 'REQUIRES_CONTRACT_FIXTURE',
      Decision: category === 'JOINED_MASTER' ? 'KEEP_EXPLICIT_OR_REWRITE_SAFE_JOIN' : 'EXCLUDE_PHASE2'
    });
  }

  const starMatches = [...stripComments(definition.body).matchAll(/\bSELECT\s+(?:TOP\s*\([^)]*\)\s+|TOP\s+\d+\s+|DISTINCT\s+)*((?:[A-Za-z_][A-Za-z0-9_]*\s*\.\s*)?\*)/gi)];
  const seenStarExpressions = new Set();
  for (const match of starMatches) {
    const starExpression = compact(match[1], 80);
    const starKey = starExpression.replace(/\s+/g, '').toLowerCase();
    if (seenStarExpressions.has(starKey)) continue;
    seenStarExpressions.add(starKey);
    const approvedPilot = /MAIN_TABLE_STAR_APPROVED/i.test(definition.body)
      && /T\s*\.\s*\*/i.test(starExpression);
    starOutput.push({
      File: definition.file,
      Procedure: definition.procedure,
      StarExpression: starExpression,
      Classification: approvedPilot ? 'MAIN_TABLE_STAR_APPROVED' : 'UNSAFE_STAR',
      Reason: approvedPilot ? 'Bảng chính lấy từ registry; deny-list, scope và quyền được kiểm tra trước SELECT.' : 'Mã legacy cần rà soát thủ công contract dữ liệu trước khi chuyển đổi.',
      Decision: approvedPilot ? 'PILOT_ONLY' : 'KEEP_EXPLICIT_OR_BLOCK'
    });
  }
}

const referenceRows = [];
for (const base of [path.join(root, 'sql'), path.join(root, 'src'), path.join(root, 'backend-app')]) {
  for (const file of walk(base).filter((item) => /\.(?:sql|js|json|html)$/i.test(item) && !item.endsWith('app.bundle.js'))) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!/SY_FormatFields/i.test(line)) return;
      const rel = relative(file);
      const context = `${rel} ${line}`;
      let roles = [];
      if (/test/i.test(rel)) roles.push('TEST');
      if (/rollback/i.test(rel)) roles.push('ROLLBACK');
      if (/DongBo|LuuTruong|XoaTruong|FormBuilder/i.test(context)) roles.push('FORM_BUILDER_WRITE');
      if (/API_TruyVanDong/i.test(context)) roles.push('GRID_RUNTIME');
      if (/LayCacTruong|DanhSachTruong|DynamicFormEngine|HRMetadataAdapter/i.test(context)) {
        roles.push('ADD_EDIT_RUNTIME', 'FILTER_RUNTIME');
      }
      if (/compare|parity/i.test(context)) roles.push('PARITY');
      if (!roles.length) roles.push('MIGRATION');
      [...new Set(roles)].forEach((role) => referenceRows.push({
          File: rel,
          Line: index + 1,
          Reference: compact(line, 500),
          Role: role,
          FormScope: /WA_BangThueTNCNFrm/i.test(line) ? 'PILOT' : 'GLOBAL_OR_OTHER',
          Phase2Action: role === 'GRID_RUNTIME' ? 'REMOVE_FOR_PILOT_ONLY'
            : role === 'FORM_BUILDER_WRITE' ? 'DISABLE_FOR_PILOT'
              : 'KEEP_WITH_COMPATIBILITY'
        }));
    });
  }
}

inventoryRows.sort((a, b) => `${a.File}:${a.Procedure}`.localeCompare(`${b.File}:${b.Procedure}`));
joinsOutput.sort((a, b) => `${a.Procedure}:${a.JoinTable}`.localeCompare(`${b.Procedure}:${b.JoinTable}`));
starOutput.sort((a, b) => `${a.File}:${a.Procedure}`.localeCompare(`${b.File}:${b.Procedure}`));
referenceRows.sort((a, b) => `${a.File}:${String(a.Line).padStart(8, '0')}`.localeCompare(`${b.File}:${String(b.Line).padStart(8, '0')}`));

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, '01_API_VIEW_INVENTORY.csv'), toCsv([
  'File', 'Procedure', 'WAApiList', 'WAApiFunc', 'MainTable', 'PrimaryAlias', 'JoinTables', 'JoinType', 'JoinCondition',
  'JoinCardinality', 'CurrentColumns', 'HasSelectStar', 'HasAggregate', 'HasUnion', 'HasBlob', 'HasSensitiveData',
  'BranchFilter', 'PermissionFilter', 'FrontendConsumers', 'Category', 'Decision', 'Risk'
], inventoryRows));
fs.writeFileSync(path.join(outputRoot, '02_JOIN_ANALYSIS.csv'), toCsv([
  'Procedure', 'MainTable', 'JoinTable', 'JoinType', 'JoinCondition', 'ExpectedCardinality', 'ActualDuplicateRisk',
  'JoinedColumns', 'AliasCompatibility', 'Decision'
], joinsOutput));
fs.writeFileSync(path.join(outputRoot, '03_SELECT_STAR_EXCEPTIONS.csv'), toCsv([
  'File', 'Procedure', 'StarExpression', 'Classification', 'Reason', 'Decision'
], starOutput));
fs.writeFileSync(path.join(outputRoot, '06_SY_FORMATFIELDS_REMAINING_REFERENCES.csv'), toCsv([
  'File', 'Line', 'Reference', 'Role', 'FormScope', 'Phase2Action'
], referenceRows));

const summary = {
  sqlFiles: sqlFiles.length,
  procedureDefinitions: definitions.length,
  inventoryRows: inventoryRows.length,
  joinRows: joinsOutput.length,
  starRows: starOutput.length,
  unsafeStarRows: starOutput.filter((row) => row.Classification === 'UNSAFE_STAR').length,
  formatFieldReferences: referenceRows.length,
  pilotApprovedStars: starOutput.filter((row) => row.Classification === 'MAIN_TABLE_STAR_APPROVED').length
};
console.log(JSON.stringify(summary, null, 2));
