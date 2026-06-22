/**
 * MenusService
 * Quản lý toàn bộ API call liên quan đến Quản lý Menu Hệ thống.
 */
var MenusService = (function () {

  function _ep(key) {
    return (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.MENUS)
      ? window.API_CONFIG.ENDPOINTS.MENUS[key]
      : null;
  }

  function _currentGroupId() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';
  }

  /**
   * Lấy toàn bộ danh sách menu
   * @returns {Promise<Array>}
   */
  function getAll() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_ALL');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId() })
        .then(function (res) {
          if (res && res.code === 0) {
            resolve(res.records || []);
          } else {
            console.warn('[MenusService] getAll — code != 0:', res && res.msg);
            resolve([]);
          }
        })
        .catch(function (err) {
          console.error('[MenusService] Lỗi getAll:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu menu (thêm mới hoặc cập nhật)
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SAVE');
      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Xóa menu
   * @param {string} menuId
   * @returns {Promise}
   */
  function deleteMenu(menuId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('DELETE');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId(), MenuID: menuId })
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi deleteMenu:', err);
          reject(err);
        });
    });
  }

  /**
   * Cập nhật thứ tự hiển thị các menu
   * @param {Object} params - { type, orderedIds, parentId }
   * @returns {Promise}
   */
  function updateOrder(params) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('UPDATE_ORDER');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        Type: params.type,
        OrderedIDs: params.orderedIds.join(','),
        ParentID: params.parentId
      })
        .then(resolve)
        .catch(function (err) {
          console.error('[MenusService] Lỗi updateOrder:', err);
          reject(err);
        });
    });
  }

  return {
    getAll: getAll,
    save: save,
    deleteMenu: deleteMenu,
    updateOrder: updateOrder,
    currentGroupId: _currentGroupId
  };
})();
