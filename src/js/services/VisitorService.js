/**
 * VisitorService
 * Quản lý toàn bộ API call liên quan đến Khách Tham Quan.
 */
var VisitorService = (function () {

  /**
   * Lấy danh sách khách tham quan
   * @param {Object} filterParams - { Keyword, TuNgay, DenNgay, ... }
   * @returns {Promise<Array>}
   */
  function getList(filterParams) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.VISITOR || !API_CONFIG.ENDPOINTS.VISITOR.LIST) {
        console.warn('[VisitorService] Thiếu cấu hình API VISITOR.LIST — trả về mảng rỗng');
        return resolve([]);
      }

      var payloadString = encodeURIComponent(JSON.stringify(filterParams || {}));
      var endpoint = API_CONFIG.ENDPOINTS.VISITOR.LIST + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records)      data = res.records;
          else if (res && res.data)    data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[VisitorService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  return {
    getList: getList
  };
})();
