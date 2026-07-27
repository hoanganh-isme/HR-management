function freezeContract(contract) {
    return Object.freeze({ ...contract });
}

function freezeLookupContract(contract) {
    return Object.freeze({
        ...contract,
        fieldNames: Object.freeze(Array.isArray(contract.fieldNames) ? contract.fieldNames.slice() : [])
    });
}

export const FIELD_CONTRACT_MIGRATION_REGISTRY = Object.freeze([
    freezeContract({
        webFormName: 'WA_BangThueTNCNFrm',
        erpFormId: 'HR_BangThueTNCNFrm',
        expectedTableName: 'HR_BangThueTNCNTbl',
        expectedPrimaryKey: 'Bac',
        oldView: 'API_TruyVanDong',
        viewV2: 'API_TruyVanDong_V2',
        oldSave: 'API_LuuDong',
        saveV2: 'API_LuuDong_V2',
        oldDelete: 'API_XoaDong',
        deleteV2: 'API_XoaDong_V2',
        enableGrid: true,
        enableAdd: true,
        enableEdit: true,
        enableFilter: true,
        enableSave: true,
        enableDelete: true,
        deletePolicy: 'AUTO_SCHEMA',
        permissionFormName: 'WA_BangThueTNCNFrm',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        branchPolicy: 'LEGACY_GLOBAL_REFERENCE'
    }),
    freezeContract({
        webFormName: 'WA_ChucDanhFrm',
        erpFormId: 'WA_ChucDanhFrm',
        expectedTableName: 'HR_ChucDanhTbl',
        expectedPrimaryKey: 'ChucDanhChuyenMon',
        oldView: 'API_DanhSachChucDanh',
        viewV2: 'API_TruyVanDong_V2',
        oldSave: 'API_LuuDong',
        saveV2: 'API_LuuDong_V2',
        oldDelete: 'API_XoaDong',
        deleteV2: 'API_XoaDong_V2',
        enableGrid: true,
        enableAdd: true,
        enableEdit: true,
        enableFilter: true,
        enableSave: true,
        enableDelete: true,
        deletePolicy: 'AUTO_SCHEMA',
        permissionFormName: 'WA_ChucDanhFrm',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        branchPolicy: 'LEGACY_GLOBAL_REFERENCE'
    }),
    freezeContract({
        webFormName: 'WA_TitleListFrm',
        erpFormId: 'WA_TitleListFrm',
        expectedTableName: 'HR_TitleListTbl',
        expectedPrimaryKey: 'TitleName',
        oldView: 'API_TruyVanDong',
        viewV2: 'API_TruyVanDong_V2',
        oldSave: 'API_LuuDong',
        saveV2: 'API_LuuDong_V2',
        oldDelete: 'API_XoaDong',
        deleteV2: 'API_XoaDong_V2',
        enableGrid: true,
        enableAdd: true,
        enableEdit: true,
        enableFilter: true,
        enableSave: true,
        enableDelete: true,
        deletePolicy: 'AUTO_SCHEMA',
        permissionFormName: 'WA_TitleListFrm',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        branchPolicy: 'LEGACY_GLOBAL_REFERENCE'
    }),
    freezeContract({
        webFormName: 'WA_ShiftListFrm',
        erpFormId: 'WA_ShiftListFrm',
        expectedTableName: 'HR_ShiftListTbl',
        expectedPrimaryKey: 'ShiftID',
        oldView: 'API_TruyVanDong',
        viewV2: 'API_TruyVanDong_V2',
        oldSave: 'API_LuuDong',
        saveV2: 'API_LuuDong_V2',
        oldDelete: 'API_XoaDong',
        deleteV2: 'API_XoaDong_V2',
        enableGrid: true,
        enableAdd: true,
        enableEdit: true,
        enableFilter: true,
        enableSave: true,
        enableDelete: true,
        deletePolicy: 'AUTO_SCHEMA',
        permissionFormName: 'WA_ShiftListFrm',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        branchPolicy: 'LEGACY_GLOBAL_REFERENCE'
    }),
    freezeContract({
        webFormName: 'WA_CaLamViecFrm',
        erpFormId: 'WA_CaLamViecFrm',
        expectedTableName: 'HR_SapCaTbl',
        expectedPrimaryKey: 'SapCaID',
        oldView: 'API_CaLamViec',
        viewV2: 'API_TruyVanDong_V2',
        oldSave: 'API_LuuDong',
        saveV2: 'API_LuuDong_V2',
        oldDelete: 'API_XoaDong',
        deleteV2: 'API_XoaDong_V2',
        enableGrid: true,
        enableAdd: true,
        enableEdit: true,
        enableFilter: true,
        enableSave: true,
        enableDelete: true,
        deletePolicy: 'AUTO_SCHEMA',
        permissionFormName: 'WA_CaLamViecFrm',
        writePolicy: 'SAFE_TABLE_COLUMNS',
        // SQL resolves AUTO_SCHEMA to GLOBAL_REFERENCE/BRANCH_SCOPED.
        branchPolicy: 'AUTO_SCHEMA',
        /*
         * Compatibility allow-list while ERP environments roll out LookupSchema
         * V2 independently. Runtime code resolves this declarative contract by
         * form + field; it never guesses a source from a field-name pattern.
         */
        registeredLookups: Object.freeze([
            freezeLookupContract({
                fieldNames: [
                    'ShiftIDThu2',
                    'ShiftIDThu3',
                    'ShiftIDThu4',
                    'ShiftIDThu5',
                    'ShiftIDThu6',
                    'ShiftIDThu7',
                    'ShiftIDChuNhat'
                ],
                registeredList: 'API_HR_DropdownShifts',
                valueField: 'ShiftID',
                displayField: 'ShiftName'
            })
        ])
    })
]);

const CONTRACTS_BY_WEB_FORM = new Map(
    FIELD_CONTRACT_MIGRATION_REGISTRY.map((contract) => [contract.webFormName.toLowerCase(), contract])
);

export function getFieldContractMigration(webFormName) {
    return CONTRACTS_BY_WEB_FORM.get(String(webFormName || '').trim().toLowerCase());
}

export function listFieldContractMigrations() {
    return FIELD_CONTRACT_MIGRATION_REGISTRY.slice();
}

export function getRegisteredLookupContract(webFormName, fieldName) {
    const contract = getFieldContractMigration(webFormName);
    const normalizedField = String(fieldName || '').trim().toLowerCase();
    if (!contract || !normalizedField) return undefined;
    return (contract.registeredLookups || []).find((lookup) => (
        lookup.fieldNames.some((name) => String(name).toLowerCase() === normalizedField)
    ));
}
