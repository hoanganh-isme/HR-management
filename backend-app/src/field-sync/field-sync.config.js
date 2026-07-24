import { FIELD_CONTRACT_MIGRATION_REGISTRY } from './field-contract.registry.js';

const DEFAULT_CACHE_TTL_MS = 120_000;

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const FIELD_SYNC_CONTRACTS = Object.freeze({
    gridSchema: 'API_Web_GridFieldSchemaV2',
    gridCompare: 'API_Web_GridFieldCompareV2',
    lookupSchema: 'API_Web_LookupSchemaV2',
    updateFieldFormat: 'API_Web_UpdateFieldFormat',
    formatList: 'SY_FmatTbl'
});

// Chỉ các cặp đã được audit chắc chắn mới được đưa vào đây.
export const FIELD_SYNC_FORM_ALIASES = Object.freeze(Object.fromEntries(
    FIELD_CONTRACT_MIGRATION_REGISTRY.map((contract) => [contract.webFormName, contract.erpFormId])
));

export function createFieldSyncConfig(documentConfig, env = process.env) {
    const sqlApiBase = String(documentConfig.sqlApiBase).replace(/\/+$/, '');
    return Object.freeze({
        sqlGatewayUrl: `${sqlApiBase}/api/API_Gateway_Router`,
        authVerifyUrl: `${sqlApiBase}/api/userinfo`,
        cacheTtlMs: positiveInteger(env.FIELD_SYNC_CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS),
        cacheMaxEntries: positiveInteger(env.FIELD_SYNC_CACHE_MAX_ENTRIES, 500),
        authCacheTtlMs: positiveInteger(env.FIELD_SYNC_AUTH_CACHE_TTL_MS, 60_000),
        authCacheMaxEntries: positiveInteger(env.FIELD_SYNC_AUTH_CACHE_MAX_ENTRIES, 1_000),
        requestTimeoutMs: positiveInteger(env.FIELD_SYNC_REQUEST_TIMEOUT_MS, 15_000),
        aliases: FIELD_SYNC_FORM_ALIASES,
        migrationRegistry: FIELD_CONTRACT_MIGRATION_REGISTRY
    });
}
