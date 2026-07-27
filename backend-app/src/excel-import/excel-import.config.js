import fs from 'node:fs';
import path from 'node:path';

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function positiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function readAllowedGroup(value) {
    const groupId = String(value || 'Admin').trim();
    if (!/^[A-Za-z0-9_.@-]{1,50}$/.test(groupId)) {
        throw new Error('EXCEL_IMPORT_ALLOWED_GROUP không hợp lệ.');
    }
    return groupId;
}

function resolveTempDir(documentConfig, value) {
    const configured = String(value || '').trim();
    if (!configured) return path.join(documentConfig.paths.storageDir, 'excel-import');
    return path.isAbsolute(configured)
        ? path.resolve(configured)
        : path.resolve(documentConfig.paths.backendRoot, configured);
}

export function createExcelImportConfig(documentConfig, env = process.env) {
    const maxFileMb = positiveNumber(env.EXCEL_IMPORT_MAX_FILE_MB, 25);
    const maxRows = positiveInteger(env.EXCEL_IMPORT_MAX_ROWS, 200_000);
    const previewRows = Math.min(20, positiveInteger(env.EXCEL_IMPORT_PREVIEW_ROWS, 20));
    const batchSize = positiveInteger(env.EXCEL_IMPORT_BATCH_SIZE, 10_000);
    const maxErrors = positiveInteger(env.EXCEL_IMPORT_MAX_ERRORS, 200);
    const ttlMinutes = positiveInteger(env.EXCEL_IMPORT_TTL_MINUTES, 30);
    const timeoutMs = positiveInteger(env.EXCEL_IMPORT_TIMEOUT_MS, 300_000);
    const maxColumns = Math.min(512, positiveInteger(env.EXCEL_IMPORT_MAX_COLUMNS, 256));
    const maxHeaderRow = Math.min(200, positiveInteger(env.EXCEL_IMPORT_MAX_HEADER_ROW, 20));
    const maxSheets = Math.min(100, positiveInteger(env.EXCEL_IMPORT_MAX_SHEETS, 50));
    const maxPendingPerUser = positiveInteger(env.EXCEL_IMPORT_MAX_PENDING_PER_USER, 3);
    const maxConcurrent = positiveInteger(env.EXCEL_IMPORT_MAX_CONCURRENT, 2);
    const maxUncompressedMb = Math.max(maxFileMb, positiveNumber(
        env.EXCEL_IMPORT_MAX_UNCOMPRESSED_MB,
        Math.min(512, Math.max(64, maxFileMb * 20))
    ));

    const config = Object.freeze({
        enabled: readBoolean(env.EXCEL_IMPORT_ENABLED, true),
        allowedGroupId: readAllowedGroup(env.EXCEL_IMPORT_ALLOWED_GROUP),
        tempDir: resolveTempDir(documentConfig, env.EXCEL_IMPORT_TEMP_DIR),
        maxFileBytes: Math.floor(maxFileMb * 1024 * 1024),
        maxUncompressedBytes: Math.floor(maxUncompressedMb * 1024 * 1024),
        maxRows,
        previewRows,
        batchSize,
        maxErrors,
        ttlMs: ttlMinutes * 60 * 1000,
        timeoutMs,
        maxColumns,
        maxHeaderRow,
        maxSheets,
        maxPendingPerUser,
        maxConcurrent,
        maxRowsPerForm: maxRows,
        allowedExtensions: Object.freeze(['.xlsx', '.tsv']),
        supportedMimeTypes: Object.freeze({
            '.xlsx': Object.freeze([
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/octet-stream',
                'application/zip'
            ]),
            '.tsv': Object.freeze([
                'text/tab-separated-values',
                'text/plain',
                'application/octet-stream'
            ])
        })
    });

    fs.mkdirSync(config.tempDir, { recursive: true });
    return config;
}
