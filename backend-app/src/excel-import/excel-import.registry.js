import { getFieldContractMigration } from '../field-sync/field-contract.registry.js';

const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;

export function resolveExcelImportContract(formName) {
    const requested = String(formName || '').trim();
    if (!SAFE_FORM.test(requested)) {
        throw new Error('FormName không hợp lệ.');
    }

    const contract = getFieldContractMigration(requested);
    if (!contract
        || contract.importEnabled !== true
        || contract.enableSave !== true
        || !contract.expectedTableName
        || !contract.expectedPrimaryKey
        || !contract.saveV2) {
        return null;
    }

    const importMode = String(contract.importMode || 'INSERT_ONLY').toUpperCase();
    if (importMode !== 'INSERT_ONLY' && !(importMode === 'UPSERT' && contract.allowUpsert === true)) {
        return null;
    }

    return Object.freeze({
        webFormName: contract.webFormName,
        erpFormId: contract.erpFormId,
        permissionFormName: contract.permissionFormName || contract.webFormName,
        expectedTableName: contract.expectedTableName,
        expectedPrimaryKey: contract.expectedPrimaryKey,
        expectedSaveProcedure: contract.saveV2,
        expectedViewProcedure: contract.viewV2,
        branchPolicy: contract.branchPolicy || 'AUTO_SCHEMA',
        importMode,
        allowUpsert: contract.allowUpsert === true,
        maxRows: Number.isInteger(contract.maxRows) && contract.maxRows > 0 ? contract.maxRows : null
    });
}
