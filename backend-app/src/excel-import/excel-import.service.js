import path from 'node:path';
import { normalizeGridSchema } from '../field-sync/field-sync.resolver.js';
import { resolveExcelImportContract } from './excel-import.registry.js';
import { ExcelImportError } from './excel-import.errors.js';
import {
    readImportHeader,
    resolveImportSource,
    scanImportSource,
    streamImportRows,
    validateImportSource
} from './excel-import.source.js';
import {
    createErrorCollector,
    throwCollectedValidation,
    validateHeaderAndMapping,
    validateRow
} from './excel-import.validator.js';
import { bulkImportRows, queryTargetMetadata } from './excel-import.bulk.js';

const SAFE_SHEET_NAME_LENGTH = 255;

function sameValue(left, right) {
    return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function ensureEnabled(config) {
    if (!config.enabled) {
        throw new ExcelImportError('Chức năng import Excel đang tắt.', 'EXCEL_IMPORT_DISABLED', 503);
    }
}

function sqlErrorCode(error) {
    return String(error?.code || error?.originalError?.code || '').trim().toUpperCase();
}

function normalizeServiceError(error, fallback = {
    code: 'EXCEL_IMPORT_FAILED',
    message: 'Không thể hoàn tất import Excel.',
    status: 500
}) {
    if (error instanceof ExcelImportError) return error;
    if (error?.code === 'EXCEL_IMPORT_SQL_CONFIG_MISSING') {
        return new ExcelImportError(
            'Backend chưa được cấu hình kết nối SQL Server cho Bulk Import.',
            'EXCEL_IMPORT_SQL_CONFIG_MISSING',
            503
        );
    }
    const code = sqlErrorCode(error);
    if (['ETIMEOUT', 'ESOCKET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET'].includes(code)) {
        return new ExcelImportError(
            'Backend không truy cập được cổng SQL Server cho Bulk Import. SQL API HTTP không thay thế kết nối SQL trực tiếp.',
            'EXCEL_IMPORT_SQL_UNREACHABLE',
            503
        );
    }
    if (code === 'ELOGIN') {
        return new ExcelImportError(
            'SQL Server từ chối tài khoản Bulk Import. Vui lòng kiểm tra tài khoản và quyền truy cập database.',
            'EXCEL_IMPORT_SQL_LOGIN_FAILED',
            503
        );
    }
    if (error?.name === 'RequestError' || code === 'EREQUEST') {
        return new ExcelImportError(
            'Đã kết nối SQL Server nhưng không thể đọc metadata bảng đích. Vui lòng kiểm tra quyền của tài khoản Bulk Import.',
            'EXCEL_IMPORT_SQL_METADATA_DENIED',
            503
        );
    }
    if (error?.name === 'FieldSyncGatewayError' || error?.name === 'FieldSyncAuthError') return error;
    if (error?.name === 'ConnectionError') {
        return new ExcelImportError(
            'Không thể kết nối hoặc kiểm tra SQL Server cho Bulk Import.',
            'EXCEL_IMPORT_SQL_ERROR',
            503
        );
    }
    return new ExcelImportError(fallback.message, fallback.code, fallback.status);
}

function normalizeBulkWriteError(error) {
    if (error instanceof ExcelImportError) return error;
    const code = sqlErrorCode(error);
    if (error?.name === 'RequestError' || code === 'EREQUEST') {
        return new ExcelImportError(
            'SQL Server từ chối dữ liệu import. Toàn bộ transaction đã được hoàn tác; hãy kiểm tra kiểu dữ liệu, khóa và ràng buộc của bảng.',
            'EXCEL_IMPORT_DATABASE_REJECTED',
            409
        );
    }
    return error;
}

function assertCurrentSchema(schema, contract) {
    const errorDiagnostics = (schema.diagnostics || []).filter((item) => item.severity === 'error');
    const saveProcedure = schema.runtimeRoutes?.save?.registeredProcedure;
    if (schema.schemaVersion !== '2.0'
        || errorDiagnostics.length
        || !sameValue(schema.tableName, contract.expectedTableName)
        || !sameValue(schema.primaryKey, contract.expectedPrimaryKey)
        || !sameValue(saveProcedure, contract.expectedSaveProcedure)) {
        throw new ExcelImportError(
            'Unified Field Contract hiện tại chưa đủ điều kiện import.',
            'EXCEL_IMPORT_CONTRACT_NOT_READY',
            409
        );
    }
}

function publicField(field) {
    let sqlType = field.sqlType;
    if (['varchar', 'char', 'nvarchar', 'nchar'].includes(String(field.sqlType).toLowerCase())
        && Number.isFinite(field.maxLength)) {
        sqlType += `(${field.maxLength})`;
    }
    return {
        name: field.name,
        label: field.label || field.name,
        sqlType,
        required: field.required === true,
        importable: true,
        maxLength: Number.isFinite(field.maxLength) ? field.maxLength : null
    };
}

function isBlankRow(row) {
    let hasValue = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
        const value = cell.value;
        if (value !== undefined && value !== null && String(value).trim() !== '') hasValue = true;
    });
    return !hasValue;
}

function assertExecuteInput(body, config) {
    const formName = String(body?.formName || '').trim();
    const sheetName = String(body?.sheetName || '').trim();
    const headerRow = Number(body?.headerRow);
    const mode = String(body?.mode || 'INSERT_ONLY').trim().toUpperCase();
    if (!formName || !sheetName || sheetName.length > SAFE_SHEET_NAME_LENGTH) {
        throw new ExcelImportError('Thiếu form hoặc sheet cần import.', 'EXCEL_IMPORT_REQUEST_INVALID', 400);
    }
    if (!Number.isInteger(headerRow) || headerRow < 0 || headerRow > config.maxHeaderRow) {
        throw new ExcelImportError(
            `Dòng tiêu đề phải là 0 (không có tiêu đề) hoặc nằm trong khoảng 1-${config.maxHeaderRow}.`,
            'EXCEL_IMPORT_HEADER_ROW_INVALID',
            400
        );
    }
    if (!body?.mapping || typeof body.mapping !== 'object' || Array.isArray(body.mapping)) {
        throw new ExcelImportError('Mapping cột không hợp lệ.', 'EXCEL_IMPORT_MAPPING_INVALID', 400);
    }
    if (mode !== 'INSERT_ONLY') {
        throw new ExcelImportError('Phiên bản này chỉ hỗ trợ INSERT_ONLY.', 'EXCEL_IMPORT_MODE_NOT_SUPPORTED', 400);
    }
    return { formName, sheetName, headerRow, mapping: body.mapping, mode };
}

export function createExcelImportService({ config, store, gateway, sqlServer }) {
    async function loadCurrentTarget(formName, context) {
        const contract = resolveExcelImportContract(formName);
        if (!contract) {
            throw new ExcelImportError(
                'Form chưa được đăng ký cho import an toàn.',
                'EXCEL_IMPORT_FORM_NOT_ENABLED',
                409
            );
        }
        await gateway.verifySession(context);
        const rows = await gateway.gridSchema({
            FormName: contract.webFormName,
            ERPFormID: contract.erpFormId
        }, context);
        const schema = normalizeGridSchema(rows, contract.webFormName, contract.erpFormId);
        assertCurrentSchema(schema, contract);
        return queryTargetMetadata(sqlServer, contract, schema, context, config.allowedGroupId);
    }

    function publicCapabilities(target) {
        return {
            success: true,
            formName: target.webFormName,
            mode: target.importMode,
            sourceTypes: ['FILE', 'CLIPBOARD'],
            fields: target.fields.map(publicField),
            limits: {
                maxFileBytes: config.maxFileBytes,
                maxRows: Math.min(config.maxRowsPerForm, target.maxRows || config.maxRowsPerForm),
                maxColumns: config.maxColumns,
                maxHeaderRow: config.maxHeaderRow,
                previewRows: config.previewRows,
                batchSize: config.batchSize
            }
        };
    }

    async function capabilities({ formName, context }) {
        ensureEnabled(config);
        try {
            const target = await loadCurrentTarget(String(formName || '').trim(), context);
            return publicCapabilities(target);
        } catch (error) {
            throw normalizeServiceError(error);
        }
    }

    async function prepare({ file, formName, sourceType, context }) {
        ensureEnabled(config);
        if (!file?.path) {
            throw new ExcelImportError('Chưa có dữ liệu để import.', 'EXCEL_IMPORT_FILE_REQUIRED', 400);
        }
        const requestedForm = String(formName || '').trim();
        const resolvedSourceType = resolveImportSource(file, sourceType);
        let record = null;
        const startedAt = Date.now();
        try {
            const target = await loadCurrentTarget(requestedForm, context);
            record = await store.create({
                file,
                userName: context.userName,
                branchId: context.branchId,
                formName: target.webFormName,
                sourceType: resolvedSourceType
            });
            await validateImportSource(record, config);
            const maxRows = Math.min(config.maxRowsPerForm, target.maxRows || config.maxRowsPerForm);
            const sheets = await scanImportSource(record, { ...config, maxRows });
            console.info('[EXCEL_IMPORT]', {
                importId: record.importId,
                formName: record.formName,
                userName: record.userName,
                status: 'UPLOADED',
                elapsedMs: Date.now() - startedAt
            });
            return {
                success: true,
                importId: record.importId,
                fileName: path.basename(record.fileName),
                sourceType: record.sourceType,
                expiresAt: new Date(record.expiresAt).toISOString(),
                sheets,
                ...publicCapabilities(target)
            };
        } catch (error) {
            if (record) await store.complete(record, 'FAILED');
            throw normalizeServiceError(error, {
                code: 'EXCEL_IMPORT_WORKBOOK_INVALID',
                message: 'Không thể đọc cấu trúc nguồn dữ liệu import.',
                status: 422
            });
        }
    }

    async function execute({ importId, body, context }) {
        ensureEnabled(config);
        const input = assertExecuteInput(body, config);
        const record = store.claim(importId, context, input.formName);
        const startedAt = Date.now();
        try {
            const target = await loadCurrentTarget(input.formName, context);
            if (!sameValue(record.formName, target.webFormName) || input.mode !== target.importMode) {
                throw new ExcelImportError(
                    'Contract import đã thay đổi. Vui lòng tải lại file.',
                    'EXCEL_IMPORT_CONTRACT_CHANGED',
                    409
                );
            }
            const sheet = await readImportHeader(record, input.sheetName, input.headerRow, config);
            const validated = validateHeaderAndMapping(sheet, input.mapping, target.fields);
            const fields = validated.mappings.map((item) => item.field);
            const maxRows = Math.min(config.maxRowsPerForm, target.maxRows || config.maxRowsPerForm);

            let bulkSummary;
            try {
                bulkSummary = await bulkImportRows({
                    sqlServer,
                    config,
                    target,
                    fields,
                    context,
                    shouldCancel: () => store.isCancelRequested(record.importId),
                    consumeRows: async (flushBatch) => {
                    const collector = createErrorCollector(config.maxErrors);
                    let totalRows = 0;
                    let validRows = 0;
                    let batch = [];
                    await streamImportRows(record, input.sheetName, config, (row) => {
                        if (row.number <= input.headerRow || isBlankRow(row)) return;
                        if (store.isCancelRequested(record.importId)) {
                            throw new ExcelImportError('Import đã được hủy.', 'EXCEL_IMPORT_CANCELLED', 409);
                        }
                        if (row.cellCount > config.maxColumns) {
                            throw new ExcelImportError(
                                `Dòng ${row.number} vượt giới hạn ${config.maxColumns} cột.`,
                                'EXCEL_IMPORT_MAX_COLUMNS_EXCEEDED',
                                413
                            );
                        }
                        totalRows += 1;
                        if (totalRows > maxRows) {
                            throw new ExcelImportError(
                                `Dữ liệu vượt giới hạn ${maxRows.toLocaleString('vi-VN')} dòng.`,
                                'EXCEL_IMPORT_MAX_ROWS_EXCEEDED',
                                413
                            );
                        }
                        const values = validateRow(row, validated.mappings, row.number, collector);
                        if (values) {
                            validRows += 1;
                            batch.push({ rowNumber: row.number, values });
                        }
                        if (batch.length >= config.batchSize) {
                            const readyBatch = batch;
                            batch = [];
                            return flushBatch(readyBatch);
                        }
                        return undefined;
                    });
                    if (batch.length) await flushBatch(batch);
                    if (store.isCancelRequested(record.importId)) {
                        throw new ExcelImportError('Import đã được hủy.', 'EXCEL_IMPORT_CANCELLED', 409);
                    }
                    if (totalRows === 0) {
                        throw new ExcelImportError(
                            'Sheet không có dòng dữ liệu sau tiêu đề.',
                            'EXCEL_IMPORT_NO_DATA_ROWS',
                            422
                        );
                    }
                    throwCollectedValidation(totalRows, validRows, collector);
                    return { totalRows, validRows };
                    }
                });
            } catch (error) {
                throw normalizeBulkWriteError(error);
            }

            const summary = {
                totalRows: bulkSummary.insertedRows,
                insertedRows: bulkSummary.insertedRows,
                updatedRows: 0,
                skippedRows: 0,
                elapsedMs: Date.now() - startedAt
            };
            await store.complete(record, 'SUCCEEDED', summary);
            console.info('[EXCEL_IMPORT]', {
                importId: record.importId,
                formName: record.formName,
                userName: record.userName,
                rowCount: summary.totalRows,
                elapsedMs: summary.elapsedMs,
                status: 'SUCCEEDED'
            });
            return { success: true, importId: record.importId, summary };
        } catch (error) {
            const normalizedError = normalizeServiceError(error);
            const state = normalizedError.code === 'EXCEL_IMPORT_CANCELLED' ? 'CANCELLED' : 'FAILED';
            await store.complete(record, state);
            console.warn('[EXCEL_IMPORT]', {
                importId: record.importId,
                formName: record.formName,
                userName: record.userName,
                elapsedMs: Date.now() - startedAt,
                status: state,
                errorCode: normalizedError.code || 'EXCEL_IMPORT_FAILED'
            });
            throw normalizedError;
        }
    }

    async function cancel({ importId, context }) {
        ensureEnabled(config);
        await gateway.verifySession(context);
        const record = await store.requestCancel(importId, context);
        return {
            success: true,
            importId: record.importId,
            state: record.state === 'PROCESSING' ? 'CANCEL_REQUESTED' : record.state
        };
    }

    return Object.freeze({
        capabilities,
        prepare,
        execute,
        cancel,
        cleanupExpired: store.cleanupExpired,
        dispose: store.dispose
    });
}
