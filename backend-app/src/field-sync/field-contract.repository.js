import { FieldSyncCache } from './field-sync.cache.js';
import { getFieldContractMigration } from './field-contract.registry.js';
import { getPhase4JoinContract } from './phase4-join.registry.js';
import { FieldSyncGatewayError } from './field-sync.gateway.js';

const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_DETAIL_KEY = /^[A-Za-z][A-Za-z0-9_]{0,79}$/;
const CONTRACT_TYPES = new Set([
    'SIMPLE_TABLE',
    'JOIN_VIEW_SINGLE_TABLE',
    'MASTER_DETAIL_SIMPLE',
    'READ_ONLY',
    'COMPLEX_DEFERRED',
    'BLOCKED'
]);
const ROLLOUT_STATUSES = new Set(['ACTIVE', 'SHADOW', 'DEFERRED', 'DISABLED', 'BLOCKED']);

function text(row, ...keys) {
    for (const key of keys) {
        if (row && row[key] !== undefined && row[key] !== null) {
            return String(row[key]).trim();
        }
    }
    return '';
}

function bool(row, ...keys) {
    for (const key of keys) {
        if (row && row[key] !== undefined) {
            const value = row[key];
            return value === true || value === 1 || String(value || '').toLowerCase() === 'true'
                || String(value || '').trim() === '1';
        }
    }
    return false;
}

function integer(row, ...keys) {
    for (const key of keys) {
        if (row && row[key] !== undefined) {
            const value = Number(row[key]);
            return Number.isInteger(value) ? value : 0;
        }
    }
    return 0;
}

function contractError(message, code, statusCode = 409) {
    return new FieldSyncGatewayError(message, statusCode, code);
}

function validateFormName(value) {
    const formName = String(value || '').trim();
    if (!SAFE_FORM.test(formName)) {
        throw contractError('FormName không hợp lệ.', 'FIELD_CONTRACT_NOT_REGISTERED', 404);
    }
    return formName;
}

function validateDatasetKey(value) {
    const datasetKey = String(value || '').trim();
    if (!SAFE_DETAIL_KEY.test(datasetKey)) {
        throw contractError(
            'DatasetKey không hợp lệ.',
            'FIELD_CONTRACT_DATASET_NOT_REGISTERED',
            404
        );
    }
    return datasetKey;
}

function normalizeDataset(row) {
    const datasetKey = text(row, 'DatasetKey', 'datasetKey', 'DetailKey', 'detailKey');
    if (!datasetKey) return null;
    const rolloutStatus = text(
        row,
        'DatasetRolloutStatus',
        'datasetRolloutStatus',
        'RolloutStatus',
        'rolloutStatus'
    ).toUpperCase();
    if (!SAFE_DETAIL_KEY.test(datasetKey) || !ROLLOUT_STATUSES.has(rolloutStatus)) {
        throw contractError('Dataset contract từ DB không hợp lệ.', 'FIELD_CONTRACT_DATASET_NOT_REGISTERED');
    }
    return Object.freeze({
        datasetKey,
        apiList: text(row, 'ApiList', 'apiList'),
        viewProcedure: text(row, 'DatasetViewProcedure', 'datasetViewProcedure', 'ViewProcedure', 'viewProcedure'),
        expectedTableName: text(row, 'DatasetExpectedTableName', 'datasetExpectedTableName', 'ExpectedTableName', 'expectedTableName'),
        expectedPrimaryKey: text(row, 'DatasetExpectedPrimaryKey', 'datasetExpectedPrimaryKey', 'ExpectedPrimaryKey', 'expectedPrimaryKey'),
        parentField: text(row, 'ParentField', 'parentField'),
        childField: text(row, 'ChildField', 'childField'),
        readOnly: bool(row, 'IsReadOnly', 'isReadOnly'),
        saveProcedure: text(row, 'DatasetSaveProcedure', 'datasetSaveProcedure', 'SaveProcedure', 'saveProcedure'),
        deleteProcedure: text(row, 'DatasetDeleteProcedure', 'datasetDeleteProcedure', 'DeleteProcedure', 'deleteProcedure'),
        writePolicy: text(row, 'DatasetWritePolicy', 'datasetWritePolicy', 'WritePolicy', 'writePolicy'),
        branchPolicy: text(row, 'DatasetBranchPolicy', 'datasetBranchPolicy', 'BranchPolicy', 'branchPolicy'),
        rolloutStatus,
        rolloutReason: text(row, 'DatasetRolloutReason', 'datasetRolloutReason', 'RolloutReason', 'rolloutReason'),
        schemaVersion: integer(row, 'DatasetSchemaVersion', 'datasetSchemaVersion', 'SchemaVersion', 'schemaVersion')
    });
}

function normalizeContractRows(rows, requestedFormName) {
    const source = Array.isArray(rows) ? rows : [];
    if (!source.length) {
        throw contractError(
            'Form chưa được đăng ký Unified Field Contract.',
            'FIELD_CONTRACT_NOT_REGISTERED',
            404
        );
    }
    const row = source[0];
    const webFormName = text(row, 'WebFormName', 'webFormName');
    const contractType = text(row, 'ContractType', 'contractType').toUpperCase();
    const rolloutStatus = text(row, 'RolloutStatus', 'rolloutStatus').toUpperCase();
    if (!SAFE_FORM.test(webFormName)
        || webFormName.toLowerCase() !== requestedFormName.toLowerCase()
        || !CONTRACT_TYPES.has(contractType)
        || !ROLLOUT_STATUSES.has(rolloutStatus)) {
        throw contractError('Contract từ DB không hợp lệ.', 'FIELD_CONTRACT_NOT_REGISTERED', 404);
    }
    const datasets = source.map(normalizeDataset).filter(Boolean);
    const seenDatasets = new Set();
    for (const dataset of datasets) {
        const key = dataset.datasetKey.toLowerCase();
        if (seenDatasets.has(key)) {
            throw contractError(
                'Dataset contract bị trùng.',
                'FIELD_CONTRACT_DATASET_NOT_REGISTERED'
            );
        }
        seenDatasets.add(key);
    }
    return Object.freeze({
        webFormName,
        erpFormId: text(row, 'ERPFormID', 'erpFormId'),
        permissionFormName: text(row, 'PermissionFormName', 'permissionFormName'),
        contractType,
        expectedTableName: text(row, 'ExpectedTableName', 'expectedTableName'),
        expectedPrimaryKey: text(row, 'ExpectedPrimaryKey', 'expectedPrimaryKey'),
        viewList: text(row, 'ViewList', 'viewList') || webFormName,
        viewProcedure: text(row, 'ViewProcedure', 'viewProcedure'),
        saveProcedure: text(row, 'SaveProcedure', 'saveProcedure'),
        deleteProcedure: text(row, 'DeleteProcedure', 'deleteProcedure'),
        writePolicy: text(row, 'WritePolicy', 'writePolicy'),
        branchPolicy: text(row, 'BranchPolicy', 'branchPolicy'),
        deletePolicy: text(row, 'DeletePolicy', 'deletePolicy'),
        rolloutStatus,
        rolloutReason: text(row, 'RolloutReason', 'rolloutReason'),
        schemaVersion: integer(row, 'SchemaVersion', 'schemaVersion'),
        isEnabled: bool(row, 'IsEnabled', 'isEnabled'),
        source: 'DB',
        datasets: Object.freeze(datasets)
    });
}

/*
 * @deprecated
 * DB contract registry is the primary rollout source.
 * Fallback này chỉ giữ năm form đã audit trong lúc DB chưa cài installer mới.
 */
function compatibilityFallback(formName) {
    const entry = getFieldContractMigration(formName);
    if (!entry) return null;
    const datasets = ['SHIFT_DETAIL', 'SHIFT_EMPLOYEES'].map((key) => {
        const item = getPhase4JoinContract(formName, key);
        if (!item) return null;
        return Object.freeze({
            datasetKey: item.detailKey,
            apiList: item.apiList,
            viewProcedure: item.expectedProcedure,
            expectedTableName: item.expectedTableName,
            expectedPrimaryKey: item.expectedPrimaryKey,
            parentField: 'SapCaID',
            childField: 'SapCaID',
            readOnly: item.readOnly === true,
            saveProcedure: item.expectedSaveProcedure || '',
            deleteProcedure: item.expectedDeleteProcedure || '',
            writePolicy: item.readOnly ? 'READ_ONLY' : 'VIEW_PHYSICAL_COLUMNS',
            branchPolicy: 'AUTO_SCHEMA',
            rolloutStatus: 'ACTIVE',
            rolloutReason: 'COMPATIBILITY_FALLBACK',
            schemaVersion: 2
        });
    }).filter(Boolean);
    return Object.freeze({
        webFormName: entry.webFormName,
        erpFormId: entry.erpFormId,
        permissionFormName: entry.permissionFormName || entry.webFormName,
        contractType: datasets.length ? 'MASTER_DETAIL_SIMPLE' : (
            entry.oldView && entry.oldView !== 'API_TruyVanDong'
                ? 'JOIN_VIEW_SINGLE_TABLE'
                : 'SIMPLE_TABLE'
        ),
        expectedTableName: entry.expectedTableName,
        expectedPrimaryKey: entry.expectedPrimaryKey,
        viewList: entry.webFormName,
        viewProcedure: entry.viewV2,
        saveProcedure: entry.saveV2,
        deleteProcedure: entry.deleteV2,
        writePolicy: entry.writePolicy || 'SAFE_TABLE_COLUMNS',
        branchPolicy: entry.branchPolicy || 'AUTO_SCHEMA',
        deletePolicy: entry.deletePolicy || 'AUTO_SCHEMA',
        rolloutStatus: 'ACTIVE',
        rolloutReason: 'COMPATIBILITY_FALLBACK',
        schemaVersion: 2,
        isEnabled: true,
        source: 'STATIC_COMPATIBILITY_FALLBACK',
        datasets: Object.freeze(datasets)
    });
}

function shouldUseCompatibilityFallback(error) {
    const code = String(error?.diagnosticCode || error?.code || '').toUpperCase();
    return [
        'ERP_GATEWAY_HTTP_ERROR',
        'ERP_GATEWAY_NETWORK',
        'ERP_GATEWAY_TIMEOUT',
        'ERP_GATEWAY_UNKNOWN',
        'ERP_GATEWAY_ENVELOPE_REJECTED'
    ].includes(code);
}

export function createFieldContractRepository({
    gateway,
    config,
    cache = new FieldSyncCache(config.cacheTtlMs, undefined, config.cacheMaxEntries)
}) {
    const pending = new Map();

    function keyOf(formName, context) {
        return [
            formName.toLowerCase(),
            String(context?.userName || '').toLowerCase(),
            String(context?.branchId || '').toLowerCase()
        ].join('|');
    }

    async function resolveContract(formNameValue, context, options = {}) {
        const formName = validateFormName(formNameValue);
        const key = keyOf(formName, context);
        if (options.forceRefresh === true) cache.delete(key);
        const cached = options.forceRefresh === true ? undefined : cache.get(key);
        if (cached) return cached;
        if (pending.has(key)) return pending.get(key);

        const request = gateway.fieldContractResolve({ FormName: formName }, context)
            .then((rows) => cache.set(key, normalizeContractRows(rows, formName)))
            .catch((error) => {
                const fallback = shouldUseCompatibilityFallback(error)
                    ? compatibilityFallback(formName)
                    : null;
                if (fallback) return cache.set(key, fallback);
                throw error;
            })
            .finally(() => {
                if (pending.get(key) === request) pending.delete(key);
            });
        pending.set(key, request);
        return request;
    }

    async function resolveDataset(formName, datasetKeyValue, context, options = {}) {
        const datasetKey = validateDatasetKey(datasetKeyValue);
        const contract = await resolveContract(formName, context, options);
        const dataset = contract.datasets.find((item) => (
            item.datasetKey.toLowerCase() === datasetKey.toLowerCase()
        ));
        if (!dataset) {
            throw contractError(
                'Dataset chưa được đăng ký Unified Field Contract.',
                'FIELD_CONTRACT_DATASET_NOT_REGISTERED',
                404
            );
        }
        return { contract, dataset };
    }

    function invalidate(formName) {
        if (!formName) {
            cache.clear();
            pending.clear();
            return;
        }
        const prefix = String(formName).trim().toLowerCase() + '|';
        for (const key of cache.entries.keys()) {
            if (String(key).startsWith(prefix)) cache.delete(key);
        }
        for (const key of pending.keys()) {
            if (String(key).startsWith(prefix)) pending.delete(key);
        }
    }

    return Object.freeze({
        resolveContract,
        resolveDataset,
        invalidate
    });
}
