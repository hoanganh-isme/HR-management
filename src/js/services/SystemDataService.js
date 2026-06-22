/**
 * Lớp Dịch vụ lấy dữ liệu Danh mục dùng chung (Sảnh, Ca Tiệc...)
 * Đảm nhiệm việc fetch dữ liệu API, quản lý In-memory Cache để tái sử dụng
 */
var SystemDataService = (function() {
  var _hallsCache = null;
  var _shiftsCache = null;
  var _isFetchingHalls = false;
  var _isFetchingShifts = false;

  function getHalls(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (!forceRefresh && _hallsCache) {
        return resolve(_hallsCache);
      }
      if (_isFetchingHalls) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.HALLS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.HALLS');
      }

      _isFetchingHalls = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.HALLS)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _hallsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function() {
          _isFetchingHalls = false;
        });
    });
  }

  function getShifts(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (!forceRefresh && _shiftsCache) {
        return resolve(_shiftsCache);
      }
      if (_isFetchingShifts) return;

      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS');
      }

      _isFetchingShifts = true;
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          _shiftsCache = records;
          resolve(records);
        })
        .catch(reject)
        .finally(function() {
          _isFetchingShifts = false;
        });
    });
  }

  function getBanquetTypes(forceRefresh) {
    forceRefresh = forceRefresh || false;
    return new Promise(function(resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES');
      }

      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.BANQUET_TYPES)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          resolve(records);
        })
        .catch(reject);
    });
  }

  function getSetupValue(codeId) {
    return new Promise(function(resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE) {
        return reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE');
      }
      ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE)
        .then(function(res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          // Tìm đúng CodeID được yêu cầu
          var found = records.find(function(r) { return r.CodeID === codeId; });
          resolve(found ? found.CodeValue : null);
        })
        .catch(reject);
    });
  }

  /**
   * Lấy version đồng bộ menu từ SY_Setup (key: menu_sync_ver)
   * Dùng cho Navbar để detect cache cũ trên các máy khác
   */
  function getMenuSyncVersion() {
    return getSetupValue('menu_sync_ver');
  }

  function invalidateCache() {
    _hallsCache = null;
    _shiftsCache = null;
  }

  return {
    getHalls: getHalls,
    getShifts: getShifts,
    getBanquetTypes: getBanquetTypes,
    getSetupValue: getSetupValue,
    getMenuSyncVersion: getMenuSyncVersion,
    invalidateCache: invalidateCache
  };
})();
