import express from 'express';
import { resolveFieldSyncContext } from './field-sync.auth.js';
import { FieldSyncCache } from './field-sync.cache.js';
import { FieldSyncGatewayError } from './field-sync.gateway.js';
import {
    assertContractMetadataReadable,
    resolveContractRuntimePolicy,
    toPublicContract
} from './field-contract.policy.js';
import { normalizeGridCompare, normalizeGridSchema, normalizeJoinSchema, normalizeLookupSchema, normalizeRegisteredLookup } from './field-sync.resolver.js';
import { createFieldContractRepository } from './field-contract.repository.js';
import { getRegisteredLookupContract } from './field-contract.registry.js';

const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_DETAIL_KEY = /^[A-Za-z][A-Za-z0-9_]{0,79}$/;
const METADATA_FORM = /(?:Frm|Report)$/i;
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

function contractError(message, code, statusCode = 409, details = {}) {
    return new FieldSyncGatewayError(message, statusCode, code, details);
}

function validateFormName(value) {
    const formName = String(value || '').trim();
    if (!SAFE_FORM.test(formName)) throw badRequest('FormName không hợp lệ.');
    return formName;
}

async function resolveDbFormNames(repository, context, formName, requestedValue, forceRefresh = false) {
    const contract = await repository.resolveContract(formName, context, { forceRefresh });
    if (!METADATA_FORM.test(contract.webFormName)) {
        throw contractError(
            'Trang không thuộc Unified Field Metadata contract.',
            'FIELD_CONTRACT_NOT_REGISTERED',
            404
        );
    }
    assertContractMetadataReadable(contract);
    const webFormName = contract.webFormName;
    const erpFormName = contract.erpFormId;
    if (requestedValue !== undefined && requestedValue !== null && requestedValue !== '') {
        const requested = validateFormName(requestedValue);
        if (requested.toLowerCase() !== erpFormName.toLowerCase()) {
            throw contractError(
                'ERPFormID không khớp DB contract registry.',
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
        throw contractError('TableName không khớp DB contract registry.', 'FIELD_CONTRACT_TABLE_MISMATCH');
    }
    if (!schema.primaryKey) {
        throw contractError('Metadata không trả PrimaryKey.', 'FIELD_CONTRACT_PRIMARY_KEY_MISSING');
    }
    if (!sameIdentifier(schema.primaryKey, contract.expectedPrimaryKey)) {
        throw contractError('PrimaryKey không khớp DB contract registry.', 'FIELD_CONTRACT_PRIMARY_KEY_MISMATCH');
    }
    if (contract.rolloutStatus === 'ACTIVE') {
        const registeredView = schema?.runtimeRoutes?.view?.registeredProcedure;
        const registeredSave = schema?.runtimeRoutes?.save?.registeredProcedure;
        const registeredDelete = schema?.runtimeRoutes?.delete?.registeredProcedure;
        if (!sameIdentifier(registeredView, contract.viewProcedure)
            || (contract.saveProcedure && !sameIdentifier(registeredSave, contract.saveProcedure))
            || (contract.deleteProcedure && !sameIdentifier(registeredDelete, contract.deleteProcedure))) {
            throw contractError(
                'WA_API route không khớp DB contract registry.',
                'FIELD_CONTRACT_ROUTE_MISMATCH'
            );
        }
    }
}

function assertComparisonMatchesContract(comparison, contract) {
    const v2PrimaryKey = comparison?.primaryKey?.v2;
    if (!v2PrimaryKey) {
        throw contractError('Compare metadata không trả V2 PrimaryKey.', 'FIELD_CONTRACT_PRIMARY_KEY_MISSING');
    }
    if (!sameIdentifier(v2PrimaryKey, contract.expectedPrimaryKey)) {
        throw contractError('Compare V2 PrimaryKey không khớp DB contract registry.', 'FIELD_CONTRACT_PRIMARY_KEY_MISMATCH');
    }
}

async function resolveDbJoinContract(repository, context, formName, detailKeyValue, forceRefresh = false) {
    const detailKey = String(detailKeyValue || '').trim();
    if (!SAFE_DETAIL_KEY.test(detailKey)) throw badRequest('DetailKey không hợp lệ.');
    const resolved = await repository.resolveDataset(
        formName,
        detailKey,
        context,
        { forceRefresh }
    );
    assertContractMetadataReadable(resolved.contract);
    const datasetStatus = String(resolved.dataset.rolloutStatus || '').toUpperCase();
    if (datasetStatus !== 'ACTIVE' && datasetStatus !== 'SHADOW') {
        throw contractError(
            'Dataset chưa được bật cho Unified Field Contract.',
            'FIELD_CONTRACT_DATASET_NOT_REGISTERED',
            404
        );
    }
    return {
        ...resolved.dataset,
        webFormName: resolved.contract.webFormName,
        detailKey: resolved.dataset.datasetKey,
        expectedProcedure: resolved.dataset.viewProcedure,
        expectedSaveProcedure: resolved.dataset.saveProcedure,
        expectedDeleteProcedure: resolved.dataset.deleteProcedure,
        expectedTableName: resolved.dataset.expectedTableName,
        expectedPrimaryKey: resolved.dataset.expectedPrimaryKey
    };
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
    if (contract.readOnly === true) {
        if (schema.registeredSaveProcedure || schema.registeredDeleteProcedure) {
            throw contractError('JOIN read-only không được có route mutation.', 'PHASE4_JOIN_READONLY_MUTATION_ROUTE');
        }
    } else {
        if (!sameIdentifier(schema.registeredSaveProcedure, contract.expectedSaveProcedure)) {
            throw contractError('Save Procedure không khớp Phase 4 registry.', 'PHASE4_JOIN_SAVE_PROCEDURE_MISMATCH');
        }
        if (!sameIdentifier(schema.registeredDeleteProcedure, contract.expectedDeleteProcedure)) {
            throw contractError('Delete Procedure không khớp Phase 4 registry.', 'PHASE4_JOIN_DELETE_PROCEDURE_MISMATCH');
        }
    }
    if (schema.sourceKind !== 'JOIN_RESULT_SET') {
        throw contractError('Nguồn metadata không phải JOIN_RESULT_SET.', 'PHASE4_JOIN_SOURCE_INVALID');
    }
    if (schema.readOnly !== contract.readOnly) {
        throw contractError('Chính sách ReadOnly không khớp Phase 4 registry.', 'PHASE4_JOIN_READONLY_MISMATCH');
    }
    const hasErrorDiagnostic = Array.isArray(schema.diagnostics) &&
        schema.diagnostics.some(function (item) {
            return (
                String(
                    item && item.severity || ''
                ).toUpperCase() === 'ERROR'
            );
        });
    const errDiag =
        schema.diagnostics.find(function (item) {
            return (
                String(
                    item && item.severity || ''
                ).toUpperCase() === 'ERROR'
            );
        });
    if (hasErrorDiagnostic && errDiag) {
        throw contractError(
            errDiag.message || 'Lỗi metadata JOIN.',
            errDiag.code || 'PHASE4_JOIN_SCHEMA_INVALID'
        );
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

function errorCode(error) {
    return String(error?.diagnosticCode || error?.code || '').trim().toUpperCase();
}

export function createFieldSyncRouter({
    gateway,
    config,
    repository: _repository,
    cache = new FieldSyncCache(config.cacheTtlMs, undefined, config.cacheMaxEntries)
}) {
    const repository = _repository || createFieldContractRepository({ gateway, config, cache });
    const router = express.Router();

    router.use((req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });

    router.get('/contract-state/:formName', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const formName = validateFormName(req.params.formName);
            const refresh = bypassMetadataCache(req);
            const contract = await repository.resolveContract(formName, context, { forceRefresh: refresh });
            const policy = resolveContractRuntimePolicy(contract);

            return res.json({
                success: true,
                registered: true,
                metadataEnabled: policy.metadataEnabled,
                active: policy.active,
                shadow: policy.shadow,
                runtimeMode: policy.runtimeMode,
                reasonCode: policy.reasonCode,
                metadataReasonCode: policy.metadataReasonCode,
                contract: toPublicContract(contract)
            });
        } catch (error) {
            if (errorCode(error) === 'FIELD_CONTRACT_NOT_REGISTERED') {
                return res.json({
                    success: true,
                    registered: false,
                    metadataEnabled: false,
                    active: false,
                    shadow: false,
                    runtimeMode: 'METADATA_BLOCKED',
                    reasonCode: 'FIELD_CONTRACT_NOT_REGISTERED',
                    metadataReasonCode: 'FIELD_CONTRACT_NOT_REGISTERED',
                    contract: null
                });
            }
            return next(error);
        }
    });

    router.get('/grid-schema/:formName', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const refresh = bypassMetadataCache(req);
            const names = await resolveDbFormNames(
                repository,
                context,
                validateFormName(req.params.formName),
                req.query.erpFormId,
                refresh
            );
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('schema', context, formName, erpFormName);
            let schema = refresh ? undefined : cache.get(key);
            if (!schema) {
                let rows;
                try {
                    rows = await gateway.gridSchema({ FormName: formName, ERPFormID: erpFormName }, context);
                } catch (error) {
                    if (names.contract.rolloutStatus === 'ACTIVE') {
                        if (error?.statusCode === 401 || error?.statusCode === 403) {
                            throw error;
                        }
                        // 502/network errors - pass through the original status so frontend can distinguish
                        if (error?.statusCode === 502 || (error?.diagnosticCode || '').startsWith('ERP_GATEWAY_NETWORK')) {
                            throw error;
                        }
                        throw contractError(
                            'Metadata của form ACTIVE không sẵn sàng.',
                            'FIELD_CONTRACT_ACTIVE_METADATA_UNAVAILABLE',
                            503,
                            error?.details
                        );
                    }
                    throw error;
                }
                schema = normalizeGridSchema(rows, formName, erpFormName);
                assertSchemaMatchesContract(schema, names.contract);
                schema = cache.set(key, schema);
            }
            return res.json({
                success: true,
                active: names.contract.rolloutStatus === 'ACTIVE',
                contract: toPublicContract(names.contract),
                schema
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get('/grid-schema/:formName/compare', async (req, res, next) => {
        try {
            const context = resolveFieldSyncContext(req);
            await gateway.verifySession(context);
            const refresh = bypassMetadataCache(req);
            const names = await resolveDbFormNames(
                repository,
                context,
                validateFormName(req.params.formName),
                req.query.erpFormId,
                refresh
            );
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const key = cacheKey('compare', context, formName, erpFormName);
            let comparison = refresh ? undefined : cache.get(key);
            if (!comparison) {
                let rows;
                try {
                    rows = await gateway.gridCompare({ FormName: formName, ERPFormID: erpFormName }, context);
                } catch (error) {
                    if (names.contract.rolloutStatus === 'ACTIVE') {
                        if (error?.statusCode === 401 || error?.statusCode === 403) {
                            throw error;
                        }
                        throw contractError(
                            'Metadata compare của form ACTIVE không sẵn sàng.',
                            'FIELD_CONTRACT_ACTIVE_METADATA_UNAVAILABLE',
                            503,
                            error?.details
                        );
                    }
                    throw error;
                }
                comparison = normalizeGridCompare(rows, formName, erpFormName);
                assertComparisonMatchesContract(comparison, names.contract);
                comparison = cache.set(key, comparison);
            }
            return res.json({
                success: true,
                active: names.contract.rolloutStatus === 'ACTIVE',
                contract: toPublicContract(names.contract),
                comparison
            });
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
            const names = await resolveDbFormNames(
                repository,
                context,
                validateFormName(req.body?.formName),
                req.body?.erpFormId
            );
            const formName = names.webFormName;
            const erpFormName = names.erpFormName;
            const keyword = String(req.body?.keyword || '').trim().slice(0, 200);
            const page = Math.max(1, Math.trunc(Number(req.body?.page) || 1));
            const pageSize = Math.min(100, Math.max(1, Math.trunc(Number(req.body?.pageSize) || 30)));
            const requestedDetailKey = String(req.body?.detailKey || '').trim();
            const detailContract = requestedDetailKey
                ? await resolveDbJoinContract(
                    repository,
                    context,
                    formName,
                    requestedDetailKey
                )
                : null;
            const schemaKey = detailContract
                ? cacheKey(
                    'join-schema',
                    context,
                    formName,
                    detailContract.detailKey + '|' + detailContract.apiList
                )
                : cacheKey('schema', context, formName, erpFormName);
            let schema = cache.get(schemaKey);
            if (!schema) {
                if (detailContract) {
                    const schemaRows = await gateway.joinSchema(
                        {
                            FormName: formName,
                            DetailKey: detailContract.detailKey
                        },
                        context
                    );
                    schema = normalizeJoinSchema(
                        schemaRows,
                        formName,
                        detailContract.detailKey
                    );
                    assertJoinSchemaMatchesContract(schema, detailContract);
                } else {
                    const schemaRows = await gateway.gridSchema(
                        { FormName: formName, ERPFormID: erpFormName },
                        context
                    );
                    schema = normalizeGridSchema(schemaRows, formName, erpFormName);
                    assertSchemaMatchesContract(schema, names.contract);
                }
                schema = cache.set(schemaKey, schema);
            }
            const lookupFields = (schema.fields || []).filter((field) => (
                field?.lookup
                && field.lookup.disabled !== true
                && String(field.lookup.key || '').toLowerCase() === lookupKey.toLowerCase()
            ));
            if (lookupFields.length === 0) {
                throw contractError(
                    'LookupKey không thuộc Unified Field Contract của form.',
                    'LOOKUP_CONTRACT_NOT_FOUND'
                );
            }
            const dependencySignatures = new Set(
                lookupFields.map((field) => (
                    Array.isArray(field.lookup.dependsOn)
                        ? field.lookup.dependsOn
                            .map((name) => String(name || '').trim().toLowerCase())
                            .filter(Boolean)
                            .sort()
                            .join('|')
                        : ''
                ))
            );
            if (dependencySignatures.size !== 1) {
                throw contractError(
                    'Các field dùng chung LookupKey có dependency không đồng nhất.',
                    'LOOKUP_DEPENDENCY_CONFLICT'
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
            let lookupAliases = {};
            let rows = await gateway.lookupSchema(params, context);
            let descriptor = normalizeLookupSchema(rows);
            /*
             * Khi quản trị viên đổi LookupCode, client có thể còn giữ schema cũ
             * trong cache. Làm mới schema đúng một lần và ánh xạ theo field đã
             * được contract xác nhận; không suy đoán source hay tên API.
             */
            if (descriptor.mode === 'BLOCKED' && descriptor.diagnosticCode === 'LOOKUP_KEY_NOT_FOUND') {
                const refreshedRows = detailContract
                    ? await gateway.joinSchema(
                        {
                            FormName: formName,
                            DetailKey: detailContract.detailKey
                        },
                        context
                    )
                    : await gateway.gridSchema(
                        { FormName: formName, ERPFormID: erpFormName },
                        context
                    );
                const refreshedSchema = detailContract
                    ? normalizeJoinSchema(
                        refreshedRows,
                        formName,
                        detailContract.detailKey
                    )
                    : normalizeGridSchema(refreshedRows, formName, erpFormName);
                if (detailContract) {
                    assertJoinSchemaMatchesContract(refreshedSchema, detailContract);
                } else {
                    assertSchemaMatchesContract(refreshedSchema, names.contract);
                }
                cache.set(schemaKey, refreshedSchema);

                const refreshedByField = new Map(
                    (refreshedSchema.fields || [])
                        .filter((field) => field?.lookup && SAFE_LOOKUP_KEY.test(String(field.lookup.key || '')))
                        .map((field) => [String(field.name || '').toLowerCase(), String(field.lookup.key)])
                );
                for (const staleField of schema.fields || []) {
                    const staleLookupKey = String(staleField?.lookup?.key || '');
                    const currentLookupKey = refreshedByField.get(String(staleField?.name || '').toLowerCase()) || '';
                    if (SAFE_LOOKUP_KEY.test(staleLookupKey) && SAFE_LOOKUP_KEY.test(currentLookupKey)
                        && staleLookupKey.toLowerCase() !== currentLookupKey.toLowerCase()) {
                        lookupAliases[staleLookupKey] = currentLookupKey;
                    }
                }

                const fieldName = String(lookupFields[0]?.name || '').toLowerCase();
                const refreshedFields = (refreshedSchema.fields || []).filter((field) => (
                    String(field?.name || '').toLowerCase() === fieldName
                    && field?.lookup
                    && field.lookup.disabled !== true
                    && SAFE_LOOKUP_KEY.test(String(field.lookup.key || ''))
                ));
                const refreshedLookupKey = refreshedFields.length === 1
                    ? String(refreshedFields[0].lookup.key)
                    : '';
                if (refreshedLookupKey && refreshedLookupKey.toLowerCase() !== lookupKey.toLowerCase()) {
                    params.LookupKey = refreshedLookupKey;
                    rows = await gateway.lookupSchema(params, context);
                    descriptor = normalizeLookupSchema(rows);
                }

            }
            if (descriptor.mode === 'BLOCKED') {
                // Thử compatibility allow-list (khi LookupKey V2 chưa đồng bộ nhưng có registered API)
                const fieldName = String(lookupFields[0]?.name || '');
                const registeredCompat = getRegisteredLookupContract(formName, fieldName);
                if (registeredCompat && registeredCompat.registeredList) {
                    const compatRows = await gateway.registeredLookup(
                        registeredCompat.registeredList,
                        params,
                        context
                    );
                    const compatDescriptor = {
                        mode: 'REGISTERED_API',
                        registeredList: registeredCompat.registeredList,
                        valueField: registeredCompat.valueField,
                        displayField: registeredCompat.displayField
                    };
                    const compatOptions = normalizeRegisteredLookup(compatRows, compatDescriptor);
                    if (compatOptions) {
                        return res.json({
                            success: true,
                            options: compatOptions.slice(0, pageSize),
                            page,
                            pageSize,
                            lookupKey: params.LookupKey,
                            lookupAliases
                        });
                    }
                }
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
            return res.json({
                success: true,
                options,
                page,
                pageSize,
                lookupKey: params.LookupKey,
                lookupAliases
            });
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
                if (!METADATA_FORM.test(formName)) {
                    throw contractError(
                        'Report không thuộc Unified CRUD contract.',
                        'FIELD_CONTRACT_NOT_REGISTERED',
                        404
                    );
                }

                const refresh = bypassMetadataCache(req);
                const contract = await resolveDbJoinContract(
                    repository,
                    context,
                    formName,
                    req.params.detailKey,
                    refresh
                );

                const detailKey = contract.detailKey;

                const key = cacheKey(
                    'join-schema',
                    context,
                    formName,
                    detailKey + '|' + contract.apiList
                );

                let schema = refresh
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
                    active: contract.rolloutStatus === 'ACTIVE',
                    contract: {
                        webFormName: contract.webFormName,
                        datasetKey: contract.detailKey,
                        rolloutStatus: contract.rolloutStatus,
                        active: contract.rolloutStatus === 'ACTIVE'
                    },
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
            repository.invalidate(formName || undefined);

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
