/**
 * CheckoutService
 * Quản lý toàn bộ API call liên quan đến Quyết Toán Tiệc.
 * Join: tbmk_Phieuthu ← tbmk_Hopdong ← dmkhachhang
 */
var CheckoutService = (function () {

  /**
   * Lấy danh sách phiếu quyết toán (API_DanhSachQuyetToan)
   * @param {Object} params - { Keyword, DocumentID, Sohopdong }
   * @returns {Promise<Array>}
   */
  function getList(params) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.LIST;
      var payloadString = encodeURIComponent(JSON.stringify(params || {}));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records)       data = res.records;
          else if (res && res.data)     data = res.data;
          else if (Array.isArray(res))  data = res;
          resolve(data);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi getList:', err);
          reject(err);
        });
    });
  }

  /**
   * Tìm kiếm hợp đồng chưa quyết toán (API_DanhSachHopDong)
   * Lọc TrangThai = 'Đã Ký' để chỉ trả về HĐ chưa quyết toán
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  function searchContracts(keyword) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.CONTRACT_LIST;
      var payload = { Keyword: keyword || '' };
      var payloadString = encodeURIComponent(JSON.stringify(payload));

      ApiClient.get(endpoint + '?q=' + payloadString)
        .then(function (res) {
          var data = [];
          if (res && res.records)       data = res.records;
          else if (res && res.data)     data = res.data;
          else if (Array.isArray(res))  data = res;
          // Chỉ lấy hợp đồng chưa quyết toán (IsKetthuc = 0 / TrangThai = 'Đã Ký')
          var filtered = data.filter(function (item) {
            return item.TrangThai !== 'Đã Quyết Toán' && item.TrangThai !== 'Đã Hủy';
          });
          resolve(filtered);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi searchContracts:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu phiếu quyết toán (API_LuuQuyenToan)
   * @param {Object} payload - { DocumentID?, DocumentDate, Sohopdong, Nguoinop,
   *                             Tongtiencoc, TongtienHoaDon, Thanhtoan,
   *                             Conlai, IsKetthuc, Ghichu }
   * @returns {Promise<Object>} - Record vừa lưu
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      if (typeof API_CONFIG === 'undefined' || !API_CONFIG.ENDPOINTS.CHECKOUT) {
        return reject('Missing API_CONFIG.ENDPOINTS.CHECKOUT');
      }
      var endpoint = API_CONFIG.ENDPOINTS.CHECKOUT.SAVE;

      ApiClient.post(endpoint, payload)
        .then(function (res) {
          var record = null;
          if (res && res.records && res.records.length > 0)  record = res.records[0];
          else if (res && res.data && res.data.length > 0)   record = res.data[0];
          else if (Array.isArray(res) && res.length > 0)     record = res[0];
          else record = res;
          resolve(record);
        })
        .catch(function (err) {
          console.error('[CheckoutService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  return {
    getList:         getList,
    searchContracts: searchContracts,
    save:            save
  };
})();
