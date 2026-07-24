/**
 * Registry quản lý Phase 4A - Unified Field Contract cho câu lệnh JOIN (Read-Only)
 * Đóng vai trò allow-list bảo mật và hợp đồng ánh xạ giữa WebForm, DetailKey và Procedure/Table trong DB.
 */
function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

const RAW_CONTRACTS = [
  Object.freeze({
    webFormName: 'WA_CaLamViecFrm',
    detailKey: 'SHIFT_DETAIL',
    apiList: 'API_CaLamViec_ChiTiet',
    expectedProcedure: 'API_CaLamViec_ChiTiet',
    expectedTableName: 'HR_SapCaChiTietTbl',
    expectedPrimaryKey: 'UserAutoID',
    readOnly: true
  })
];

export const PHASE4_JOIN_CONTRACTS = Object.freeze(RAW_CONTRACTS);

/**
 * Tra cứu Phase 4 JOIN Contract theo webFormName và detailKey
 */
export function getPhase4JoinContract(webFormName, detailKey) {
  const normForm = normalizeKey(webFormName);
  const normDetail = normalizeKey(detailKey);

  if (!normForm || !normDetail) {
    return null;
  }

  const found = PHASE4_JOIN_CONTRACTS.find(
    (item) => normalizeKey(item.webFormName) === normForm && normalizeKey(item.detailKey) === normDetail
  );

  return found || null;
}

/**
 * Danh sách toàn bộ Phase 4 JOIN contracts
 */
export function listPhase4JoinContracts() {
  return PHASE4_JOIN_CONTRACTS;
}
