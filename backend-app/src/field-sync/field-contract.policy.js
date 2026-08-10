import { FieldSyncGatewayError } from './field-sync.gateway.js';

const RUNTIME_V2_STATUSES = new Set(['ACTIVE', 'SHADOW']);
const INVALID_ERP_FORM_IDS = new Set(['', 'ERP_FORM_ALIAS_REQUIRES_REVIEW']);

function normalizedStatus(contract) {
    return String(contract?.rolloutStatus || '').trim().toUpperCase();
}

function normalizedText(value) {
    return String(value || '').trim();
}

function resolveMetadataReason(contract) {
    if (!contract?.isEnabled) {
        return {
            code: 'FIELD_CONTRACT_DISABLED',
            message: 'Unified Field Contract đang bị tắt.'
        };
    }
    if (INVALID_ERP_FORM_IDS.has(normalizedText(contract?.erpFormId).toUpperCase())) {
        return {
            code: 'FIELD_CONTRACT_ERP_FORM_MISMATCH',
            message: 'ERPFormID chưa được xác minh cho metadata V2.'
        };
    }
    if (!normalizedText(contract?.expectedTableName)) {
        return {
            code: 'FIELD_CONTRACT_TABLE_MISSING',
            message: 'Contract chưa có TableName cho metadata V2.'
        };
    }
    if (!normalizedText(contract?.expectedPrimaryKey)) {
        return {
            code: 'FIELD_CONTRACT_PRIMARY_KEY_MISSING',
            message: 'Contract chưa có PrimaryKey cho metadata V2.'
        };
    }
    return null;
}

function resolveRuntimeReason(contract, rolloutStatus) {
    const contractType = normalizedText(contract?.contractType).toUpperCase();
    if (rolloutStatus === 'DEFERRED' || contractType === 'COMPLEX_DEFERRED') {
        return {
            code: 'FIELD_CONTRACT_DEFERRED',
            message: 'Form giữ API nghiệp vụ hiện tại và sử dụng metadata V2.'
        };
    }
    if (rolloutStatus === 'BLOCKED' || contractType === 'BLOCKED') {
        return {
            code: 'FIELD_CONTRACT_BLOCKED',
            message: 'API nghiệp vụ V2 chưa được kích hoạt; metadata V2 vẫn được kiểm tra độc lập.'
        };
    }
    if (!RUNTIME_V2_STATUSES.has(rolloutStatus)) {
        return {
            code: 'FIELD_CONTRACT_DISABLED',
            message: 'Trạng thái Unified Field Contract không hợp lệ.'
        };
    }
    return null;
}

export function resolveContractRuntimePolicy(contract) {
    const rolloutStatus = normalizedStatus(contract);
    const metadataReason = resolveMetadataReason(contract);
    const runtimeReason = resolveRuntimeReason(contract, rolloutStatus);
    const metadataEnabled = metadataReason === null;
    const active = metadataEnabled && rolloutStatus === 'ACTIVE';
    const shadow = metadataEnabled && rolloutStatus === 'SHADOW';
    return Object.freeze({
        rolloutStatus,
        metadataEnabled,
        runtimeMode: active ? 'V2_FULL' : (
            metadataEnabled ? 'V2_METADATA_CURRENT_BUSINESS' : 'METADATA_BLOCKED'
        ),
        active,
        shadow,
        reasonCode: runtimeReason?.code || null,
        reasonMessage: runtimeReason?.message || null,
        metadataReasonCode: metadataReason?.code || null,
        metadataReasonMessage: metadataReason?.message || null
    });
}

export function assertContractMetadataReadable(contract) {
    const policy = resolveContractRuntimePolicy(contract);
    if (!policy.metadataEnabled) {
        throw new FieldSyncGatewayError(
            policy.metadataReasonMessage,
            409,
            policy.metadataReasonCode
        );
    }
    return policy;
}

export function toPublicContract(contract) {
    const policy = resolveContractRuntimePolicy(contract);
    return {
        webFormName: contract.webFormName,
        erpFormId: contract.erpFormId,
        permissionFormName: contract.permissionFormName,
        contractType: contract.contractType,
        expectedTableName: contract.expectedTableName,
        expectedPrimaryKey: contract.expectedPrimaryKey,
        rolloutStatus: policy.rolloutStatus,
        rolloutReason: contract.rolloutReason,
        schemaVersion: contract.schemaVersion,
        metadataEnabled: policy.metadataEnabled,
        runtimeMode: policy.runtimeMode,
        active: policy.active,
        shadow: policy.shadow,
        reasonCode: policy.reasonCode,
        metadataReasonCode: policy.metadataReasonCode,
        source: contract.source
    };
}
