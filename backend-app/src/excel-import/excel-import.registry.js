const SAFE_FORM = /^[A-Za-z0-9_.-]{1,100}$/;
const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
const WRITABLE_CONTRACT_TYPES = new Set([
    'SIMPLE_TABLE',
    'JOIN_VIEW_SINGLE_TABLE',
    'MASTER_DETAIL_SIMPLE'
]);

/*
 * Import dùng DB Field Contract làm nguồn sự thật. Lookup execution allow-list
 * chỉ còn là fallback ở FieldContractRepository và không giới hạn danh sách
 * form được phép import.
 */
export function resolveExcelImportContract(fieldContract) {
    if (!fieldContract || typeof fieldContract !== 'object') {
        return null;
    }

    const webFormName = String(fieldContract.webFormName || '').trim();
    const erpFormId = String(fieldContract.erpFormId || '').trim();
    const permissionFormName = String(
        fieldContract.permissionFormName || webFormName
    ).trim();
    const expectedTableName = String(fieldContract.expectedTableName || '').trim();
    const expectedPrimaryKey = String(fieldContract.expectedPrimaryKey || '').trim();
    const expectedSaveProcedure = String(fieldContract.saveProcedure || '').trim();
    const contractType = String(fieldContract.contractType || '').trim().toUpperCase();
    const writePolicy = String(fieldContract.writePolicy || '').trim().toUpperCase();

    if (fieldContract.isEnabled !== true
        || Number(fieldContract.schemaVersion) < 2
        || !SAFE_FORM.test(webFormName)
        || !SAFE_FORM.test(erpFormId)
        || !SAFE_FORM.test(permissionFormName)
        || !SAFE_IDENTIFIER.test(expectedTableName)
        || !SAFE_IDENTIFIER.test(expectedPrimaryKey)
        || !SAFE_FORM.test(expectedSaveProcedure)
        || !WRITABLE_CONTRACT_TYPES.has(contractType)
        || writePolicy === 'READ_ONLY') {
        return null;
    }

    return Object.freeze({
        webFormName,
        erpFormId,
        permissionFormName,
        expectedTableName,
        expectedPrimaryKey,
        expectedSaveProcedure,
        expectedViewProcedure: String(fieldContract.viewProcedure || '').trim(),
        branchPolicy: fieldContract.branchPolicy || 'AUTO_SCHEMA',
        importMode: 'INSERT_ONLY',
        allowUpsert: false,
        maxRows: Number.isInteger(fieldContract.maxRows) && fieldContract.maxRows > 0
            ? fieldContract.maxRows
            : null
    });
}
