import express from 'express';
import { FIELD_CONTRACT_MIGRATION_REGISTRY } from './field-contract.registry.js';
import { getPhase4JoinContract } from './phase4-join.registry.js';
import { resolveFieldSyncContext } from './field-sync.auth.js';
import { FieldSyncCache } from './field-sync.cache.js';
import { FieldSyncGatewayError } from './field-sync.gateway.js';
import { normalizeGridCompare, normalizeGridSchema, normalizeJoinSchema, normalizeLookupSchema, normalizeRegisteredLookup } from './field-sync.resolver.js';

const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_DETAIL_KEY = /^[A-Za-z][A-Za-z0-9_]{0,79}$/;
const SAFE_LOOKUP_KEY = /^[A-Fa-f0-9]{64}$/;
const SAFE_DEPENDENCY = /^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/;
const BLOCKED_DEPENDENCY_NAMES = new Set(['__proto__', 'prototype', 'constructor']);
const RESERVED_LOOKUP_DEPENDENCY_NAMES = new Set([
    'formname', 'erpformid', 'lookupkey', 'keyword', 'page', 'pagesize',
    'list', 'func', 'limit', 'jsondata', 'username', 'user', 'branchid'
]);

function badRequest(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function contractError(message, code, statusCode = 409) {
    return new FieldSyncGatewayError(message, statusCode, code);
}

function validateFormName(value) {
    const formName = String(value || '').trim();
    if (!SAFE_FORM.test(formName)) throw badRequest('FormName không hợp lệ.');
    return formName;
}

function configuredContract(config, formName) {
    const registry = Array.isArray(config.migrationRegistry)
        ? config.migrationRegistry
        : FIELD_CONTRACT_MIGRATION_REGISTRY;
    return registry.find((item) => (
        String(item?.webFormName || '').toLowerCase() === formName.toLowerCase()
    ));
}

function resolveFormNames(config, formName, requestedValue) {
    const contract = configuredContract(config, formName);
    if (!contract) {
        throw contractError(
            'Form chưa nằm trong allow-list Unified Field Contract.',
            'FIELD_CONTRACT_FORM_NOT_ALLOWLISTED',
            404
        );
    }
    const webFormName = contract.webFormName;
    const erpFormName = contract.erpFormId;
    if (requestedValue !== undefined && requestedValue !== null && requestedValue !== '') {
        const requested = validateFormName(requestedValue);
        if (requested.toLowerCase() !== erpFormName.toLowerCase()) {
            throw contractError(
                'ERPFormID không khớp migration registry.',
                'FIELD_CONTRACT_ERP_FORM_MISMATCH'
            );
        }
    }
    return { webFormName, erpFormName, contract };
}

function sameIdentifier(left, right) {
    return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function assertSchemaMatchesContract(schema, contract) {
    if (!schema.tableName) {
        throw contractError('Metadata không trả TableName.', 'FIELD_CONTRACT_TABLE_MISSING');
    }
    if (!sameIdentifier(schema.tableName, contract.expectedTableName)) {
        throw contractError('TableName không khớp migration registry.', 'FIELD_CONTRACT_TABLE_MISMATCH');
    }
    if (!schema.primaryKey) {
        throw contractError('Metadata không trả PrimaryKey.', 'FIELD_CONTRACT_PRIMARY_KEY_MISSING');
    }
    if (!sameIdentifier(schema.primaryKey, contract.expectedPrimaryKey)) {
        throw contractError('PrimaryKey không khớp migration registry.', 'FIELD_CONTRACT_PRIMARY_KEY_MISMATCH');
    }
}

function assertComparisonMatchesContract(comparison, contract) {
    const v2PrimaryKey = comparison?.primaryKey?.v2;
    if (!v2PrimaryKey) {
        throw contractError('Compare metadata không trả V2 PrimaryKey.', 'FIELD_CONTRACT_PRIMARY_KEY_MISSING');
    }
    if (!sameIdentifier(v2PrimaryKey, contract.expectedPrimaryKey)) {
        throw contractError('Compare V2 PrimaryKey không khớp migration registry.', 'FIELD_CONTRACT_PRIMARY_KEY_MISMATCH');
    }
}

function resolveJoinContract(formName, detailKey) {
    const contract = getPhase4JoinContract(formName, detailKey);
    if (!contract) {
        throw contractError(
            'JOIN detail key chưa được đăng ký trong Phase 4 allow-list.',
            'PHASE4_JOIN_CONTRACT_NOT_ALLOWLISTED',
            404
        );
    }
    return contract;
}

function assertJoinSchemaMatchesContract(schema, contract) {
    if (!schema || typeof schema !== 'object') {
        throw contractError('Metadata JOIN không hợp lệ.', 'PHASE4_JOIN_SCHEMA_INVALID');
    }
    if (!sameIdentifier(schema.formName, contract.webFormName)) {
        throw contractError('FormName không khớp Phase 4 registry.', 'PHASE4_JOIN_FORM_MISMATCH');
    }
    if (!sameIdentifier(schema.detailKey, contract.detailKey)) {
        throw contractError('DetailKey không khớp Phase 4 registry.', 'PHASE4_JOIN_DETAIL_KEY_MISMATCH');
    }
    if (!sameIdentifier(schema.apiList, contract.apiList)) {
        throw contractError('ApiList không khớp Phase 4 registry.', 'PHASE4_JOIN_API_LIST_MISMATCH');
    }
    if (!sameIdentifier(schema.tableName, contract.expectedTableName)) {
        throw contractError('Main TableName không khớp Phase 4 registry.', 'PHASE4_JOIN_TABLE_MISMATCH');
    }
    if (!sameIdentifier(schema.primaryKey, contract.expectedPrimaryKey)) {
        throw contractError('PrimaryKey không khớp Phase 4 registry.', 'PHASE4_JOIN_PRIMARY_KEY_MISMATCH');
    }
    if (!sameIdentifier(schema.registeredViewProcedure, contract.expectedProcedure)) {
        throw contractError('View Procedure không khớp Phase 4 registry.', 'PHASE4_JOIN_PROCEDURE_MISMATCH');
    }
    if (schema.sourceKind !== 'JOIN_RESULT_SET') {
        throw contractError('Nguồn metadata không phải JOIN_RESULT_SET.', 'PHASE4_JOIN_SOURCE_INVALID');
    }
    if (schema.readOnly !== contract.readOnly) {
        throw contractError('Chính sách ReadOnly không khớp Phase 4 registry.', 'PHASE4_JOIN_READONLY_MISMATCH');
    }
    const hasErrorDiagnostic = Array.isArray(schema.diagnostics) && schema.diagnostics.some((d) => d.severity === 'ERROR');
    if (hasErrorDiagnostic) {
        const errDiag = schema.diagnostics.find((d) => d.severity === 'ERROR');
        throw contractError(errDiag?.message || 'Lỗi metadata JOIN.', errDiag?.code || 'PHASE4_JOIN_SCHEMA_INVALID');
    }
}

function cacheKey(kind, context, formName, extra = '') {
    return [kind, context.userName, context.branchId, formName, extra].join('|');
}

function bypassMetadataCache(req) {
    return String(req.query?.refresh || '').trim() === '1';
}

function normalizeLookupDependencies(rawValues, declaredNames) {
    const declared = new Map();
    for (const value of Array.isArray(declaredNames) ? declaredNames.slice(0, 20) : []) {
        const name = String(value || '').trim();
        const normalized = name.toLowerCase();
        if (!SAFE_DEPENDENCY.test(name) || BLOCKED_DEPENDENCY_NAMES.has(normalized)
            || RESERVED_LOOKUP_DEPENDENCY_NAMES.has(normalized)) {
            throw contractError(
                'Tên trường phụ thuộc lookup xung đột với wire contract.',
                'LOOKUP_DEPENDENCY_CONFLICT'
            );
        }
        declared.set(normalized, name);
    }

    const raw = rawValues && typeof rawValues === 'object' && !Array.isArray(rawValues)
        ? rawValues
        : {};
    const suppliedKeys = Object.keys(raw);
    if (suppliedKeys.length > 20) throw badRequest('Lookup có quá nhiều giá trị phụ thuộc.');

    const result = {};
    for (const suppliedKey of suppliedKeys) {
        const normalized = String(suppliedKey || '').trim().toLowerCase();
        if (!SAFE_DEPENDENCY.test(suppliedKey)
            || BLOCKED_DEPENDENCY_NAMES.has(normalized)
            || !declared.has(normalized)) {
            throw badRequest('Trường phụ thuộc lookup không thuộc Unified Field Contract.');
        }
        const value = raw[suppliedKey];
        if (value !== null && value !== undefined && typeof value === 'object') {
            throw badRequest('Giá trị phụ thuộc lookup không hợp lệ.');
        }
        result[declared.get(normalized)] = value === null || value === undefined
            ? ''
            : String(value).slice(0, 500);
    }

    for (const name of declared.values()) {
        if (!Object.prototype.hasOwnProperty.call(result, name) || result[name] === '') {
            throw contractError(
                `Lookup yêu cầu giá trị trường cha ${name}.`,
                'LOOKUP_DEPENDENCY_REQUIRED'
            );
        }
    }
    return result;
}

export function createFieldSyncRouter({ gateway, config, cache = new FieldSyncCache(config.cacheTtlMs, undefined, config.cacheMaxEntries) }) {
    const router = express.Router();

    router.use((req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });

    router.get('/grid-schema/:formName', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const names = resolveFormNames(config, validateFormName(req.params.formName), req.query.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('schema', context, formName, erpFormName);
            let schema = bypassMetadataCache(req) ? undefined : cache.get(key);
            if (!schema) {
                const rows = await gateway.gridSchema({ FormName: formName, ERPFormID: erpFormName }, context);
                schema = normalizeGridSchema(rows, formName, erpFormName);
                assertSchemaMatchesContract(schema, names.contract);
                schema = cache.set(key, schema);
            }
            return res.json({ success: true, schema });
        } catch (error) {
            return next(error);
        }
    });

    router.get('/grid-schema/:formName/compare', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const names = resolveFormNames(config, validateFormName(req.params.formName), req.query.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('compare', context, formName, erpFormName);
            let comparison = bypassMetadataCache(req) ? undefined : cache.get(key);
            if (!comparison) {
                const rows = await gateway.gridCompare({ FormName: formName, ERPFormID: erpFormName }, context);
                comparison = normalizeGridCompare(rows, formName, erpFormName);
                assertComparisonMatchesContract(comparison, names.contract);
                comparison = cache.set(key, comparison);
            }
            return res.json({ success: true, comparison });
        } catch (error) {
            return next(error);
        }
    });

    router.post('/lookups/:lookupKey/search', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const lookupKey = String(req.params.lookupKey || '').trim();
            if (!SAFE_LOOKUP_KEY.test(lookupKey)) throw badRequest('LookupKey không hợp lệ.');
            const names = resolveFormNames(config, validateFormName(req.body?.formName), req.body?.erpFormId);
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const keyword = String(req.body?.keyword || '').trim().slice(0, 200);
            const page = Math.max(1, Math.trunc(Number(req.body?.page) || 1));
            const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(req.body?.pageSize) || 30)));
            const schemaKey = cacheKey('schema', context, formName, erpFormName);
            let schema = cache.get(schemaKey);
            if (!schema) {
                const schemaRows = await gateway.gridSchema({ FormName: formName, ERPFormID: erpFormName }, context);
                schema = normalizeGridSchema(schemaRows, formName, erpFormName);
                assertSchemaMatchesContract(schema, names.contract);
                schema = cache.set(schemaKey, schema);
            }
            const lookupFields = (schema.fields || []).filter((field) => (
                field?.lookup
                && field.lookup.disabled !== true
                && String(field.lookup.key || '').toLowerCase() === lookupKey.toLowerCase()
            ));
            if (lookupFields.length !== 1) {
                throw contractError(
                    'LookupKey không ánh xạ duy nhất tới Unified Field Contract.',
                    'LOOKUP_CONTRACT_NOT_UNIQUE'
                );
            }
            const dependencyValues = normalizeLookupDependencies(
                req.body?.dependencies,
                lookupFields[0].lookup.dependsOn
            );
            const params = Object.assign(
                {},
                dependencyValues,
                { FormName: formName, ERPFormID: erpFormName, LookupKey: lookupKey, Keyword: keyword, Page: page, PageSize: pageSize }
            );
            const rows = await gateway.lookupSchema(params, context);
            const descriptor = normalizeLookupSchema(rows);
            if (descriptor.mode === 'BLOCKED') {
                return res.status(409).json({ success: false, code: descriptor.diagnosticCode, message: 'Lookup này chưa có nguồn đọc an toàn được đăng ký.' });
            }
            let options = descriptor.options || [];
            if (descriptor.mode === 'REGISTERED_API') {
                const lookupRows = await gateway.registeredLookup(descriptor.registeredList, params, context);
                options = normalizeRegisteredLookup(lookupRows, descriptor);
                if (!options) {
                    return res.status(409).json({ success: false, code: 'LOOKUP_COLUMNS_MISMATCH', message: 'Lookup không trả đúng cột đã đăng ký.' });
                }
                options = options.slice(0, pageSize);
            }
            return res.json({ success: true, options, page, pageSize });
        } catch (error) {
            return next(error);
        }
    });

    router.get(
        '/join-schema/:formName/:detailKey',
        async (req, res, next) => {
            try {
                const context = resolveFieldSyncContext(req);

                await gateway.verifySession(context);

                const formName = validateFormName(
                    req.params.formName
                );

                const contract = resolveJoinContract(
                    formName,
                    req.params.detailKey
                );

                const detailKey = contract.detailKey;

                const key = cacheKey(
                    'join-schema',
                    context,
                    formName,
                    detailKey + '|' + contract.apiList
                );

                let schema = bypassMetadataCache(req)
                    ? undefined
                    : cache.get(key);

                if (!schema) {
                    const rows = await gateway.joinSchema(
                        {
                            FormName: formName,
                            DetailKey: detailKey
                        },
                        context
                    );

                    schema = normalizeJoinSchema(
                        rows,
                        formName,
                        detailKey
                    );

                    assertJoinSchemaMatchesContract(
                        schema,
                        contract
                    );

                    schema = cache.set(key, schema);
                }

                return res.json({
                    success: true,
                    schema
                });
            } catch (error) {
                return next(error);
            }
        }
    );

    router.get('/formats', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            let formats = [];
            try {
                const rows = await gateway.formatList(context);
                formats = (Array.isArray(rows) ? rows : []).map((row) => ({
                    formatId: String(row.FormatID || row.formatId || '').trim(),
                    type: String(row.Type || row.type || '').trim(),
                    description: String(row.Description || row.FormatString || row.formatId || '').trim(),
                    align: String(row.Align || row.align || '').trim(),
                    numberDecimal: row.NumberDecimal !== undefined ? row.NumberDecimal : null
                })).filter((item) => item.formatId);
            } catch (err) {
                // Fallback nếu chưa tạo SY_FmatTbl trên DB
            }

            if (!formats.length) {
                formats = [
                    { formatId: '', type: 'Text', description: 'Văn bản mặc định (Text)' },
                    { formatId: 'D', type: 'Date', description: 'Ngày (dd/MM/yyyy)' },
                    { formatId: 'DT', type: 'DateTime', description: 'Ngày giờ (dd/MM/yyyy HH:mm)' },
                    { formatId: 'H', type: 'Time', description: 'Giờ (HH:mm)' },
                    { formatId: 'B', type: 'Money', description: 'Tiền tệ (Money)' },
                    { formatId: 'N', type: 'Number', description: 'Số nguyên (Number)' },
                    { formatId: 'Q', type: 'Decimal', description: 'Số thập phân (Decimal)' },
                    { formatId: 'C', type: 'Checkbox', description: 'Hộp chọn (Checkbox)' }
                ];
            }

            return res.json({ success: true, formats });
        } catch (error) {
            return next(error);
        }
    });

    router.post('/field-config', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);

            const fieldName = String(req.body?.fieldName || '').trim();
            if (!fieldName) throw badRequest('FieldName không được để trống.');

            const formName = req.body?.formName ? validateFormName(req.body.formName) : '';
            const captionVN = String(req.body?.captionVN || '').trim().slice(0, 250);
            const captionEN = String(req.body?.captionEN || '').trim().slice(0, 250);
            const captionCH = String(req.body?.captionCH || '').trim().slice(0, 250);
            const formatId = String(req.body?.formatId || '').trim().slice(0, 50);
            const alignX = String(req.body?.alignX || '').trim().slice(0, 10);
            const minWidth = Math.max(0, Math.trunc(Number(req.body?.minWidth) || 0));
            const maxWidth = Math.max(0, Math.trunc(Number(req.body?.maxWidth) || 0));

            const params = {
                WebFormName: formName,
                FieldName: fieldName,
                CaptionVN: captionVN,
                CaptionEN: captionEN,
                CaptionCH: captionCH,
                FormatID: formatId,
                AlignX: alignX,
                MinWidth: minWidth,
                MaxWidth: maxWidth
            };

            const result = await gateway.updateFieldFormat(params, context);
            cache.clear();

            const firstRecord = Array.isArray(result) && result.length ? result[0] : (result || params);
            if (firstRecord && (firstRecord.Success === false || firstRecord.Success === 0 || String(firstRecord.Success) === '0')) {
                throw contractError(firstRecord.Message || 'Lỗi cập nhật tiêu đề cột.', 'FIELD_CONFIG_UPDATE_FAILED', 400);
            }

            return res.json({
                success: true,
                message: 'Cập nhật tiêu đề & định dạng cột thành công.',
                result: firstRecord
            });
        } catch (error) {
            return next(error);
        }
    });

    return router;
}
