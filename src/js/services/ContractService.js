/**
 * ContractService
 * Quản lý toàn bộ API call liên quan đến Hợp Đồng Tiệc.
 */
var ContractService = (function () {

  /**
   * Lấy danh sách hợp đồng
   * @param {Object} filterParams
   * @returns {Promise<Array>}
   */
  function getList(filterParams) {
    return new Promise(function (resolve, reject) {
      var base = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.CONTRACT && API_CONFIG.ENDPOINTS.CONTRACT.LIST)
        ? API_CONFIG.ENDPOINTS.CONTRACT.LIST
        : '/api/API_Contract_List';

      var payloadString = encodeURIComponent(JSON.stringify(filterParams || {}));
      var endpoint = base + '?q=' + payloadString;

      ApiClient.get(endpoint)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy thông tin booking để tự điền form Hợp Đồng
   * @param {string} bookingId
   * @returns {Promise<Object|null>}
   */
  function getBookingById(bookingId) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.BOOKING && API_CONFIG.ENDPOINTS.BOOKING.LIST)
        ? API_CONFIG.ENDPOINTS.BOOKING.LIST
        : '/api/API_Booking_List';
      var payloadString = encodeURIComponent(JSON.stringify({ Keyword: bookingId }));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var records = (res && res.records) ? res.records : (Array.isArray(res) ? res : []);
          var booking = records.find(function (b) { return (b.MaChungTu || b.id) == bookingId; });
          resolve(booking || null);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getBookingById:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy danh sách thực đơn
   * @param {Object} params - { Keyword, PhanLoai, IsChay }
   * @returns {Promise<Array>}
   */
  function getFoods(params) {
    return new Promise(function (resolve, reject) {
      var endpoint = API_CONFIG.ENDPOINTS.FOODS.LIST;

      var payloadString = encodeURIComponent(JSON.stringify(params || { Keyword: '', PhanLoai: '', IsChay: -1 }));
      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records) data = res.records;
          else if (res && res.data) data = res.data;
          else if (Array.isArray(res)) data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getFoods:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu hợp đồng
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.CONTRACT && API_CONFIG.ENDPOINTS.CONTRACT.SAVE)
        ? API_CONFIG.ENDPOINTS.CONTRACT.SAVE
        : '/api/API_LuuHopDong';

      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[ContractService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy lịch sử phụ lục hợp đồng
   * @param {string} sohopdong
   * @returns {Promise<Array>}
   */
  function getPhuLucHistory(sohopdong) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER)
        ? API_CONFIG.ENDPOINTS.ROUTER
        : '/api/API_Gateway_Router';
      
      var payload = {
        List: 'tbmk_Thaydoi',
        Func: 'View',
        Keyword: sohopdong || ''
      };

      ApiClient.post(endpoint, payload)
        .then(function (res) {
          var records = (res && res.records) ? res.records : ((res && res.data) ? res.data : (Array.isArray(res) ? res : []));
          resolve(records);
        })
        .catch(function (err) {
          console.error('[ContractService] Lỗi getPhuLucHistory:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu phụ lục thay đổi bổ sung
   * @param {Object} payload
   * @returns {Promise}
   */
  function savePhuLuc(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = (typeof API_CONFIG !== 'undefined' && API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.ROUTER)
        ? API_CONFIG.ENDPOINTS.ROUTER
        : '/api/API_Gateway_Router';

      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[ContractService] Lỗi savePhuLuc:', err);
          reject(err);
        });
    });
  }

  return {
    getList: getList,
    getBookingById: getBookingById,
    getFoods: getFoods,
    save: save,
    getPhuLucHistory: getPhuLucHistory,
    savePhuLuc: savePhuLuc
  };
})();
