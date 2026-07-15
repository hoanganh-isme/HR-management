/** Shared HR system-data repository (shifts, setup values and menu version). */
var SystemDataService = (function () {
  var shiftsCache = null;
  var shiftsRequest = null;

  function records(response) {
    if (typeof ApiClient !== 'undefined' && ApiClient.normalizeResponse) {
      return ApiClient.normalizeResponse(response).records;
    }
    return response && response.records ? response.records : (Array.isArray(response) ? response : []);
  }

  function getShifts(forceRefresh) {
    if (!forceRefresh && shiftsCache) return Promise.resolve(shiftsCache);
    if (shiftsRequest) return shiftsRequest;
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS) {
      return Promise.reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS');
    }
    shiftsRequest = ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SHIFTS)
      .then(function (response) {
        shiftsCache = records(response);
        return shiftsCache;
      })
      .finally(function () { shiftsRequest = null; });
    return shiftsRequest;
  }

  function getSetupValue(codeId) {
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.SYSTEM || !API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE) {
      return Promise.reject('Missing API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE');
    }
    return ApiClient.get(API_CONFIG.ENDPOINTS.SYSTEM.SETUP_VALUE).then(function (response) {
      var found = records(response).find(function (row) { return row.CodeID === codeId; });
      return found ? found.CodeValue : null;
    });
  }

  function getMenuSyncVersion() { return getSetupValue('menu_sync_ver'); }

  function invalidateCache() {
    shiftsCache = null;
    shiftsRequest = null;
  }

  return {
    getShifts: getShifts,
    getSetupValue: getSetupValue,
    getMenuSyncVersion: getMenuSyncVersion,
    invalidateCache: invalidateCache
  };
})();
