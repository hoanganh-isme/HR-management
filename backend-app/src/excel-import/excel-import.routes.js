import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import multer from 'multer';
import { resolveFieldSyncContext } from '../field-sync/field-sync.auth.js';
import { ExcelImportError } from './excel-import.errors.js';

function generatedFileName(file) {
    const extension = path.extname(String(file?.originalname || '')).toLowerCase();
    return `${crypto.randomUUID()}${extension}`;
}

async function removeRejectedFile(file, tempDir) {
    if (!file?.path) return;
    const root = path.resolve(tempDir);
    const target = path.resolve(file.path);
    if (!target.startsWith(`${root}${path.sep}`)) return;
    try {
        await fs.unlink(target);
    } catch (error) {
        if (error?.code !== 'ENOENT') console.warn('[EXCEL_IMPORT] Không xóa được upload bị từ chối.');
    }
}

function uploadError(error) {
    if (error instanceof ExcelImportError) return error;
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return new ExcelImportError('File Excel vượt giới hạn dung lượng.', 'EXCEL_IMPORT_FILE_TOO_LARGE', 413);
    }
    if (error instanceof multer.MulterError) {
        return new ExcelImportError('Upload Excel không hợp lệ.', 'EXCEL_IMPORT_UPLOAD_INVALID', 400);
    }
    return error;
}

export function createExcelImportRouter({ config, service }) {
    const router = express.Router();
    const upload = multer({
        storage: multer.diskStorage({
            destination: (_req, _file, callback) => callback(null, config.tempDir),
            filename: (_req, file, callback) => callback(null, generatedFileName(file))
        }),
        limits: {
            fileSize: config.maxFileBytes,
            files: 1,
            fields: 5,
            parts: 6
        },
        fileFilter: (_req, file, callback) => {
            const extension = path.extname(String(file.originalname || '')).toLowerCase();
            const mime = String(file.mimetype || '').toLowerCase();
            if (!config.allowedExtensions.includes(extension)) {
                const code = extension === '.xls'
                    ? 'EXCEL_IMPORT_XLS_LEGACY_NOT_SUPPORTED'
                    : 'EXCEL_IMPORT_FILE_TYPE_NOT_SUPPORTED';
                callback(new ExcelImportError(
                    'Chỉ hỗ trợ file .xlsx hoặc dữ liệu clipboard do màn hình import tạo.',
                    code,
                    415
                ));
                return;
            }
            const supportedMimeTypes = config.supportedMimeTypes[extension] || [];
            if (mime && !supportedMimeTypes.includes(mime)) {
                callback(new ExcelImportError('Định dạng upload không hợp lệ.', 'EXCEL_IMPORT_MIME_NOT_SUPPORTED', 415));
                return;
            }
            callback(null, true);
        }
    });

    router.use((_req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });

    router.get('/capabilities', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            const result = await service.capabilities({
                formName: req.query?.formName,
                context
            });
            return res.json(result);
        } catch (error) {
            return next(error);
        }
    });

    router.post('/prepare', (req, res, next) => {
        upload.single('file')(req, res, async (error) => {
            if (error) return next(uploadError(error));
            try {
                const context = resolveFieldSyncContext(req);
                const result = await service.prepare({
                    file: req.file,
                    formName: req.body?.formName,
                    sourceType: req.body?.sourceType,
                    context
                });
                return res.status(201).json(result);
            } catch (serviceError) {
                await removeRejectedFile(req.file, config.tempDir);
                return next(serviceError);
            }
        });
    });

    router.post('/:importId/execute', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            const result = await service.execute({
                importId: req.params.importId,
                body: req.body,
                context
            });
            return res.json(result);
        } catch (error) {
            return next(error);
        }
    });

    router.delete('/:importId', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            const result = await service.cancel({ importId: req.params.importId, context });
            return res.status(result.state === 'CANCEL_REQUESTED' ? 202 : 200).json(result);
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
