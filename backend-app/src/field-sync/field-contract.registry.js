function freezeContract(contract) {
    return Object.freeze({ ...contract });
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
        deletePolicy: 'AUTO_SCHEMA'
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
        deletePolicy: 'AUTO_SCHEMA'
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
        deletePolicy: 'AUTO_SCHEMA'
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
        deletePolicy: 'AUTO_SCHEMA'
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
