/**
 * Phase 4 JOIN Contract Registry.
 *
 * View được giữ là API nghiệp vụ riêng.
 * Generic mutation dùng chung API_LuuDong_V2/API_XoaDong_V2.
 *
 * @deprecated
 * DB contract registry is the primary rollout source.
 */
function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function freezeContract(contract) {
  return Object.freeze({
    ...contract
  });
}

const RAW_CONTRACTS = [
  freezeContract({
    webFormName: 'WA_CaLamViecFrm',
    detailKey: 'SHIFT_DETAIL',

    apiList: 'API_CaLamViec_ChiTiet',

    expectedProcedure:
      'API_CaLamViec_ChiTiet',

    registeredViewProcedure:
      'API_CaLamViec_ChiTiet',

    expectedSaveProcedure: '',
    expectedDeleteProcedure: '',

    expectedTableName:
      'HR_SapCaChiTietTbl',

    expectedPrimaryKey:
      'UserAutoID',

    readOnly: true
  }),

  freezeContract({
    webFormName: 'WA_CaLamViecFrm',
    detailKey: 'SHIFT_EMPLOYEES',

    apiList:
      'API_CaLamViec_NhanVien',

    expectedProcedure:
      'API_CaLamViec_NhanVien',

    registeredViewProcedure:
      'API_CaLamViec_NhanVien',

    expectedSaveProcedure:
      'API_LuuDong_V2',

    expectedDeleteProcedure:
      'API_XoaDong_V2',

    expectedTableName:
      'HR_SapCaNhanVienTbl',

    expectedPrimaryKey:
      'UserAutoID',

    readOnly: false,

    // Editable JOIN mutation vẫn dùng chung allow-list V2 với master.
    registeredSaveProcedure:
      'API_LuuDong_V2',

    registeredDeleteProcedure:
      'API_XoaDong_V2'
  })
];

export const PHASE4_JOIN_CONTRACTS =
  Object.freeze(
    RAW_CONTRACTS.slice()
  );

export function getPhase4JoinContract(
  webFormName,
  detailKey
) {
  const normalizedForm =
    normalizeKey(webFormName);

  const normalizedDetail =
    normalizeKey(detailKey);

  if (!normalizedForm || !normalizedDetail) {
    return null;
  }

  return PHASE4_JOIN_CONTRACTS.find(
    function (contract) {
      return (
        normalizeKey(
          contract.webFormName
        ) === normalizedForm

        && normalizeKey(
          contract.detailKey
        ) === normalizedDetail
      );
    }
  ) || null;
}

export function listPhase4JoinContracts() {
  return PHASE4_JOIN_CONTRACTS.slice();
}
