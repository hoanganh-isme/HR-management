import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlRoot = path.join(root, 'sql');
const output = path.join(root, 'docs', 'field-sync-phase1', '01_SQL_DEPENDENCY_INVENTORY.csv');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.sql') ? [absolute] : [];
  });
}

function unique(items, limit = 30) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function matches(source, regex, group = 1) {
  return Array.from(source.matchAll(regex), (match) => match[group]);
}

function csv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function objectNames(source, file) {
  const ddl = matches(source, /\b(?:CREATE\s+OR\s+ALTER|CREATE|ALTER)\s+(?:PROCEDURE|PROC|VIEW|TRIGGER|TABLE)\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_]+)\]?/gim);
  return unique(ddl).join(';') || path.basename(file, '.sql');
}

function tableTargets(source, pattern) {
  return unique(matches(source, pattern).map((name) => name.replace(/[\[\]]/g, ''))).join(';');
}

function classify(relative, source, writes, deletes) {
  const slash = relative.replaceAll('\\', '/');
  if (slash.includes('/FieldSyncPhase1/')) return slash.endsWith('04_DANG_KY_API_READONLY.sql') ? 'REGISTER_ONLY' : 'SAFE_READONLY';
  if (/rollback|restore/i.test(slash)) return 'ROLLBACK';
  if (/verify|\/Query\/|test_/i.test(slash)) return 'VERIFY';
  if (deletes) return 'DESTRUCTIVE_LEGACY';
  if (/\/Insert\/|\/Deploy\/|\/Update\//i.test(slash)) {
    if (/\/Register_/i.test(slash) && !/\b(?:UPDATE|MERGE)\b/i.test(source)) return 'REGISTER_ONLY';
    return 'INSTALLER_LEGACY';
  }
  if (/\/API\/|\/View\/|\/Triggers\/|\/tables\//i.test(slash)) return 'RUNTIME';
  if (!writes && /\bSELECT\b/i.test(source)) return 'SAFE_READONLY';
  return 'INSTALLER_LEGACY';
}

function planFor(classification, source) {
  if (classification === 'SAFE_READONLY') return 'Giữ trong Phase 1; chạy theo đúng thứ tự triển khai/kiểm tra.';
  if (classification === 'REGISTER_ONLY') return 'Không chạy script đăng ký cũ; chỉ dùng 04_DANG_KY_API_READONLY.sql cho contract V2.';
  if (classification === 'DESTRUCTIVE_LEGACY') return 'Cấm chạy trong Phase 1; giữ để tham chiếu và thay bằng script idempotent không cleanup.';
  if (classification === 'INSTALLER_LEGACY') return 'Không chạy trong Phase 1; rà soát riêng trước mọi đợt cài đặt sau.';
  if (classification === 'RUNTIME' && /SY_FormatFields/i.test(source)) return 'Giữ nguyên cho Add/Edit/Filter legacy; Grid V2 không dùng làm nguồn chính.';
  if (classification === 'RUNTIME') return 'Giữ nguyên runtime hiện tại; không sửa trong Phase 1.';
  if (classification === 'VERIFY') return 'Chỉ chạy đọc/kiểm thử ở môi trường phù hợp; không dùng để cài metadata.';
  return 'Giữ làm phương án phục hồi; không chạy trong Phase 1.';
}

const headers = ['File', 'Object', 'Action', 'Reads', 'Writes', 'Deletes', 'Calls', 'FormNames', 'Risk', 'Classification', 'ReplacementPlan'];
const rows = walk(sqlRoot).sort().map((file) => {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const actions = unique(matches(source, /\b(SELECT|INSERT|UPDATE|DELETE|MERGE|CREATE|ALTER|EXEC(?:UTE)?|DROP|TRUNCATE)\b/gim).map((item) => item.toUpperCase())).join(';');
  const reads = tableTargets(source, /\b(?:FROM|JOIN)\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_]+)\]?/gim);
  const writes = tableTargets(source, /\b(?:INSERT\s+INTO|UPDATE|MERGE\s+INTO)\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_]+)\]?/gim);
  const deletes = tableTargets(source, /\b(?:DELETE\s+FROM|TRUNCATE\s+TABLE|DROP\s+TABLE)\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_#]+)\]?/gim);
  const calls = unique(matches(source, /\bEXEC(?:UTE)?\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_]+)\]?/gim)).join(';');
  const formNames = unique(matches(source, /N?'((?:WA|HR|SY|CF)_[A-Za-z0-9_]+Frm)'/gim)).join(';');
  const classification = classify(relative, source, writes, deletes);
  const risk = deletes ? 'CRITICAL' : (/\b(?:UPDATE|MERGE)\b/i.test(source) || /SY_FormatFields|SY_FmtFldTbl|WA_API|WA_Menu|SY_FrmLstTbl/i.test(writes) ? 'HIGH' : (writes ? 'MEDIUM' : 'LOW'));
  return [relative, objectNames(source, file), actions, reads, writes, deletes, calls, formNames, risk, classification, planFor(classification, source)];
});

fs.mkdirSync(path.dirname(output), { recursive: true });
const contents = [headers, ...rows].map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n';
fs.writeFileSync(output, `\uFEFF${contents}`, 'utf8');
console.log(`Đã audit ${rows.length} file SQL -> ${path.relative(root, output)}`);

