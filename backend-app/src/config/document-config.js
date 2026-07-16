import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(configDir, '..', '..');
const repositoryRoot = path.resolve(backendRoot, '..');

function loadDotEnv(filePath) {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const separator = trimmed.indexOf('=');
        if (separator < 1) return;
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
    });
}

function readDevelopmentSqlApiBase() {
    const envFile = path.join(repositoryRoot, 'env.js');
    if (!fs.existsSync(envFile)) return '';
    const contents = fs.readFileSync(envFile, 'utf8');
    const match = contents.match(/API_BASE\s*:\s*['"`](.*?)['"`]/);
    return match && match[1] ? match[1].trim() : '';
}

function trimTrailingSlash(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

function readPositiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    return String(value).toLowerCase() === 'true' || String(value) === '1';
}

function persistDevelopmentSecret(secretFile) {
    if (fs.existsSync(secretFile)) {
        const stored = fs.readFileSync(secretFile, 'utf8').trim();
        if (stored) return stored;
    }

    const secret = crypto.randomBytes(48).toString('base64url');
    const temporaryFile = `${secretFile}.new`;
    fs.writeFileSync(temporaryFile, secret, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporaryFile, secretFile);
    return secret;
}

loadDotEnv(path.join(backendRoot, '.env'));

const environment = String(process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = environment === 'production';
const storageDir = path.join(backendRoot, 'storage');
const samplesDir = path.join(backendRoot, 'samples');
const uploadsDir = path.join(backendRoot, 'uploads');
const contractDraftsDir = path.join(storageDir, 'contract-drafts');
const templateWorkspacesDir = path.join(storageDir, 'template-workspaces');
const templateBackupsDir = path.join(samplesDir, 'backups');

[storageDir, samplesDir, uploadsDir, contractDraftsDir, templateWorkspacesDir, templateBackupsDir].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
});

const sqlApiBase = trimTrailingSlash(
    process.env.SQL_API_BASE || (!isProduction ? readDevelopmentSqlApiBase() : '')
);
if (!sqlApiBase) {
    throw new Error('SQL_API_BASE là bắt buộc trong production; development cần SQL_API_BASE hoặc API_BASE hợp lệ trong env.js.');
}

const signingSecretFile = path.join(storageDir, '.draft-signing-secret');
let draftSigningSecret = String(process.env.DRAFT_SIGNING_SECRET || '').trim();
if (!draftSigningSecret) {
    if (isProduction) throw new Error('Thiếu DRAFT_SIGNING_SECRET trong production.');
    draftSigningSecret = persistDevelopmentSecret(signingSecretFile);
}

const onlyOfficeJwtEnabled = readBoolean(process.env.ONLYOFFICE_JWT_ENABLED, false);
const onlyOfficeJwtSecret = String(process.env.ONLYOFFICE_JWT_SECRET || '').trim();
if (onlyOfficeJwtEnabled && !onlyOfficeJwtSecret) {
    throw new Error('ONLYOFFICE_JWT_ENABLED=true nhưng thiếu ONLYOFFICE_JWT_SECRET.');
}

const defaultOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:4173',
    'http://localhost:4173'
];

export const documentConfig = Object.freeze({
    environment,
    isProduction,
    port: Math.trunc(readPositiveNumber(process.env.PORT, 8081)),
    sqlApiBase,
    sqlApiUser: String(process.env.SQL_API_USER || '').trim(),
    documentPublicBaseUrl: trimTrailingSlash(process.env.DOCUMENT_PUBLIC_BASE_URL || 'http://127.0.0.1:8081'),
    documentInternalBaseUrl: trimTrailingSlash(process.env.DOCUMENT_INTERNAL_BASE_URL || 'http://host.docker.internal:8081'),
    onlyOfficePublicUrl: trimTrailingSlash(process.env.ONLYOFFICE_PUBLIC_URL || 'http://127.0.0.1:8001'),
    onlyOfficeJwtEnabled,
    onlyOfficeJwtSecret,
    draftSigningSecret,
    draftTtlHours: readPositiveNumber(process.env.DRAFT_TTL_HOURS, 24),
    maxDocxSizeBytes: Math.trunc(readPositiveNumber(process.env.MAX_DOCX_SIZE_MB, 20) * 1024 * 1024),
    corsAllowedOrigins: String(process.env.CORS_ALLOWED_ORIGINS || defaultOrigins.join(','))
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    contractFormName: 'WA_HopDongLaoDongFrm',
    templateListName: 'HR_HopDongAddfile',
    attachmentListName: 'API_HopDongLaoDong_Attach',
    paths: Object.freeze({
        backendRoot,
        repositoryRoot,
        storageDir,
        samplesDir,
        uploadsDir,
        contractDraftsDir,
        templateWorkspacesDir,
        templateBackupsDir,
        signingSecretFile
    })
});
