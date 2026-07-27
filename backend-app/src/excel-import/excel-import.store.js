import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { ExcelImportError } from './excel-import.errors.js';

function sameIdentity(left, right) {
    return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function isInside(root, target) {
    const normalizedRoot = path.resolve(root);
    const normalizedTarget = path.resolve(target);
    return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
}

export function createExcelImportStore(config) {
    const records = new Map();

    function activeForUser(userName) {
        return [...records.values()].filter((record) => (
            sameIdentity(record.userName, userName)
            && ['UPLOADED', 'PROCESSING'].includes(record.state)
            && record.expiresAt > Date.now()
        )).length;
    }

    function activeProcessing() {
        return [...records.values()].filter((record) => record.state === 'PROCESSING').length;
    }

    async function removeFile(record) {
        if (!record || !record.tempPath) return;
        if (!isInside(config.tempDir, record.tempPath)) return;
        try {
            await fs.unlink(record.tempPath);
        } catch (error) {
            if (error?.code !== 'ENOENT') console.warn('[EXCEL_IMPORT] Không xóa được file tạm:', error.message);
        } finally {
            record.tempPath = '';
        }
    }

    function assertOwner(record, context, formName) {
        if (!record
            || !sameIdentity(record.userName, context.userName)
            || !sameIdentity(record.branchId, context.branchId)
            || (formName && !sameIdentity(record.formName, formName))) {
            throw new ExcelImportError('Import không thuộc phiên hiện tại.', 'EXCEL_IMPORT_NOT_FOUND', 404);
        }
        if (record.expiresAt <= Date.now() && record.state !== 'PROCESSING') {
            throw new ExcelImportError('Import đã hết hạn.', 'EXCEL_IMPORT_EXPIRED', 410);
        }
    }

    async function create({ file, userName, branchId, formName, sourceType }) {
        if (activeForUser(userName) >= config.maxPendingPerUser) {
            throw new ExcelImportError(
                'Bạn đang có quá nhiều phiên import chưa hoàn tất.',
                'EXCEL_IMPORT_TOO_MANY_PENDING',
                429
            );
        }
        const importId = crypto.randomUUID();
        const createdAt = Date.now();
        const record = {
            importId,
            userName: String(userName || '').trim(),
            branchId: String(branchId || '').trim(),
            formName: String(formName || '').trim(),
            sourceType: String(sourceType || 'FILE').trim().toUpperCase(),
            tempPath: path.resolve(file.path),
            fileName: path.basename(String(file.originalname || 'import.xlsx')).slice(0, 255),
            fileSize: Number(file.size) || 0,
            state: 'UPLOADED',
            createdAt,
            expiresAt: createdAt + config.ttlMs,
            cancelRequested: false,
            summary: null
        };
        if (!isInside(config.tempDir, record.tempPath)) {
            throw new ExcelImportError('File tạm không hợp lệ.', 'EXCEL_IMPORT_FILE_INVALID', 400);
        }
        records.set(importId, record);
        return record;
    }

    function get(importId) {
        return records.get(String(importId || '').trim()) || null;
    }

    function getOwned(importId, context, formName) {
        const record = get(importId);
        assertOwner(record, context, formName);
        return record;
    }

    function claim(importId, context, formName) {
        const record = getOwned(importId, context, formName);
        if (record.state !== 'UPLOADED') {
            throw new ExcelImportError(
                `Import đang ở trạng thái ${record.state}.`,
                'EXCEL_IMPORT_ALREADY_PROCESSED',
                409
            );
        }
        if (activeProcessing() >= config.maxConcurrent) {
            throw new ExcelImportError(
                'Hệ thống đang xử lý các phiên import khác. Vui lòng thử lại sau.',
                'EXCEL_IMPORT_BUSY',
                429
            );
        }
        record.state = 'PROCESSING';
        record.cancelRequested = false;
        return record;
    }

    function requestCancel(importId, context, formName) {
        const record = getOwned(importId, context, formName);
        if (record.state === 'UPLOADED') {
            record.state = 'CANCELLED';
            return removeFile(record).then(() => record);
        }
        if (record.state === 'PROCESSING') {
            record.cancelRequested = true;
            return Promise.resolve(record);
        }
        return Promise.resolve(record);
    }

    function isCancelRequested(importId) {
        return Boolean(get(importId)?.cancelRequested);
    }

    async function complete(record, state, summary = null) {
        record.state = state;
        record.summary = summary;
        await removeFile(record);
        return record;
    }

    async function cleanupExpired() {
        const now = Date.now();
        for (const [importId, record] of records) {
            if (record.expiresAt > now || record.state === 'PROCESSING') continue;
            record.state = 'EXPIRED';
            await removeFile(record);
            records.delete(importId);
        }
        const activePaths = new Set(
            [...records.values()]
                .filter((record) => ['UPLOADED', 'PROCESSING'].includes(record.state))
                .map((record) => path.resolve(record.tempPath))
        );
        try {
            const entries = await fs.readdir(config.tempDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isFile() || !/\.xlsx$/i.test(entry.name)) continue;
                const candidate = path.resolve(config.tempDir, entry.name);
                if (activePaths.has(candidate)) continue;
                const stat = await fs.stat(candidate);
                if (stat.mtimeMs <= now - config.ttlMs) await fs.unlink(candidate);
            }
        } catch (error) {
            console.warn('[EXCEL_IMPORT] Không quét được file tạm hết hạn:', error.message);
        }
    }

    async function dispose() {
        for (const record of records.values()) await removeFile(record);
        records.clear();
    }

    return Object.freeze({
        create,
        get,
        getOwned,
        claim,
        requestCancel,
        isCancelRequested,
        complete,
        cleanupExpired,
        dispose
    });
}
