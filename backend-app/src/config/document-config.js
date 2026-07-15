import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(currentDir, '..', '..');
const rootDir = path.resolve(backendDir, '..');

function readBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function readPositiveInteger(value, fallback, name) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${name} must be a non-negative integer.`);
  return parsed;
}

function readList(value) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function normalizeHttpOrigin(value, name) {
  const raw = String(value || '').trim();
  if (!raw) throw new Error(`${name} is not configured.`);

  let url;
  try { url = new URL(raw); } catch (error) { throw new Error(`${name} is not a valid URL: ${raw}`); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} only supports HTTP or HTTPS.`);
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  if (/\/api(?:\/API_Gateway_Router)?$/i.test(url.pathname)) {
    throw new Error(`${name} must be an origin without /api or /api/API_Gateway_Router.`);
  }
  return url.toString().replace(/\/+$/, '');
}

function readSqlApiFromLegacyEnv() {
  const candidates = [path.join(rootDir, 'env.js'), path.join(backendDir, 'env.js'), '/env.js', '/app/env.js'];
  const envPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!envPath) return '';
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/API_BASE\s*:\s*['"`](.*?)['"`]/);
  if (!match || !match[1]) return '';
  console.warn(`[CONFIG] SQL_API_BASE is using the development-only env.js fallback: ${envPath}`);
  return match[1].trim();
}

function optionalOrigin(value, name, fallback) {
  return normalizeHttpOrigin(value || fallback, name);
}

function loadDevelopmentSigningSecret() {
  const secretPath = path.join(backendDir, 'storage', '.draft-signing-secret');
  try {
    const current = fs.readFileSync(secretPath, 'utf8').trim();
    if (current) return current;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const generated = crypto.randomBytes(48).toString('hex');
  fs.mkdirSync(path.dirname(secretPath), { recursive: true });
  try {
    fs.writeFileSync(secretPath, `${generated}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    return generated;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    return fs.readFileSync(secretPath, 'utf8').trim() || generated;
  }
}

export function loadDocumentConfig(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || 'development').toLowerCase();
  const production = nodeEnv === 'production';
  const port = readPositiveInteger(env.PORT, 8081, 'PORT');
  const sqlApiRaw = env.SQL_API_BASE || (!production ? readSqlApiFromLegacyEnv() : '');
  const sqlApiBase = normalizeHttpOrigin(sqlApiRaw, 'SQL_API_BASE');
  const localPublicUrl = `http://127.0.0.1:${port}`;

  const requiredProduction = [
    'DOCUMENT_PUBLIC_BASE_URL', 'DOCUMENT_INTERNAL_BASE_URL', 'ONLYOFFICE_PUBLIC_URL',
    'CORS_ALLOWED_ORIGINS', 'DRAFT_SIGNING_SECRET'
  ];
  if (production) {
    const missing = requiredProduction.filter((name) => !String(env[name] || '').trim());
    if (readBoolean(env.ONLYOFFICE_JWT_ENABLED, false) && !String(env.ONLYOFFICE_JWT_SECRET || '').trim()) {
      missing.push('ONLYOFFICE_JWT_SECRET');
    }
    if (missing.length) throw new Error(`Missing production configuration: ${missing.join(', ')}`);
  }

  const signingSecret = env.DRAFT_SIGNING_SECRET || env.ONLYOFFICE_JWT_SECRET || loadDevelopmentSigningSecret();
  if (!production && !env.DRAFT_SIGNING_SECRET && !env.ONLYOFFICE_JWT_SECRET) {
    console.warn('[CONFIG] DRAFT_SIGNING_SECRET is not configured; using the persistent local signing secret.');
  }

  const corsAllowedOrigins = readList(env.CORS_ALLOWED_ORIGINS || [
    'http://127.0.0.1:5500', 'http://localhost:5500',
    'http://127.0.0.1:4173', 'http://localhost:4173'
  ].join(','));

  return Object.freeze({
    nodeEnv,
    production,
    port,
    sqlApiBase,
    sqlApiUser: env.SQL_API_USER || 'admin',
    sqlApiTimeoutMs: readPositiveInteger(env.SQL_API_TIMEOUT_MS, 30000, 'SQL_API_TIMEOUT_MS'),
    sqlApiRetryCount: readPositiveInteger(env.SQL_API_RETRY_COUNT, 2, 'SQL_API_RETRY_COUNT'),
    sqlApiRetryBaseDelayMs: readPositiveInteger(env.SQL_API_RETRY_BASE_DELAY_MS, 300, 'SQL_API_RETRY_BASE_DELAY_MS'),
    sqlApiKeepAlive: readBoolean(env.SQL_API_KEEP_ALIVE, true),
    sqlGatewayMaxGetUrlLength: readPositiveInteger(env.SQL_GATEWAY_MAX_GET_URL_LENGTH, 7000, 'SQL_GATEWAY_MAX_GET_URL_LENGTH'),
    documentPublicBaseUrl: optionalOrigin(env.DOCUMENT_PUBLIC_BASE_URL, 'DOCUMENT_PUBLIC_BASE_URL', localPublicUrl),
    documentInternalBaseUrl: optionalOrigin(env.DOCUMENT_INTERNAL_BASE_URL, 'DOCUMENT_INTERNAL_BASE_URL', `http://host.docker.internal:${port}`),
    onlyOfficePublicUrl: optionalOrigin(env.ONLYOFFICE_PUBLIC_URL, 'ONLYOFFICE_PUBLIC_URL', 'http://127.0.0.1'),
    onlyOfficeJwtEnabled: readBoolean(env.ONLYOFFICE_JWT_ENABLED, false),
    onlyOfficeJwtSecret: env.ONLYOFFICE_JWT_SECRET || '',
    useLegacyHrDocuments: readBoolean(env.USE_LEGACY_HR_DOCUMENTS, false),
    corsAllowedOrigins,
    signingSecret,
    samplesDir: path.join(backendDir, 'samples'),
    uploadsDir: path.join(backendDir, 'uploads'),
    draftsDir: path.join(backendDir, 'storage', 'drafts'),
    templateWorkspacesDir: path.join(backendDir, 'storage', 'template-workspaces')
  });
}

export const documentConfig = loadDocumentConfig();
