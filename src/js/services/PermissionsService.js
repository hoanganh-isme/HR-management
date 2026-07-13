/**
 * PermissionsService
 * Quản lý toàn bộ API call liên quan đến Phân Quyền Người Dùng.
 */
var PermissionsService = (function () {

  function _ep(key) {
    return (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.PERMISSIONS)
      ? window.API_CONFIG.ENDPOINTS.PERMISSIONS[key]
      : null;
  }

  function _currentGroupId() {
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    return MetadataModuleConfig.getUserGroupId(u);
  }

  /**
   * Lấy danh sách nhóm quyền
   * @returns {Promise<Array>}
   */
  function getGroups() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_GROUP_LIST');
      ApiClient.get(endpoint)
        .then(function (res) {
          if (res && res.code === 0 && res.records) {
            resolve(res.records);
          } else {
            resolve([]);
          }
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getGroups:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy danh sách menu theo nhóm quyền
   * @param {string} groupId - ID nhóm cần lấy quyền
   * @returns {Promise<Array>}
   */
  function getMenusByGroup(groupId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_MENU_BY_GROUP');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        UserGroupID: groupId
      })
        .then(function (res) {
          var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
          resolve(records);
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getMenusByGroup:', err);
          reject(err);
        });
    });
  }

  /**
   * Lấy TẤT CẢ menu + quyền của nhóm (kể cả menu đang bị IsRun=0)
   * Dùng cho trang Phân Quyền để admin có thể bật/tắt bất kỳ menu nào
   * @param {string} groupId
   * @returns {Promise<Array>}
   */
  function getFullMenusByGroup(groupId) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('GET_ALL_MENUS_FOR_GROUP');
      ApiClient.post(endpoint, {
        NhomNguoiDangThaoTac: _currentGroupId(),
        UserGroupID: groupId
      })
        .then(function (res) {
          var records = (res && res.records) ? res.records : (res && res.data ? res.data : []);
          resolve(records);
        })
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi getFullMenusByGroup:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu quyền cho một menu thuộc nhóm
   * @param {Object} payload
   * @returns {Promise}
   */
  function savePermission(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SAVE_GROUP_PERMISSIONS');
      ApiClient.post(endpoint, payload)
        .then(resolve)
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi savePermission:', err);
          reject(err);
        });
    });
  }

  /**
   * Đồng bộ quyền truy cập toàn hệ thống
   * @returns {Promise}
   */
  function sync() {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SYNC');
      ApiClient.post(endpoint, { NhomNguoiDangThaoTac: _currentGroupId() })
        .then(resolve)
        .catch(function (err) {
          console.error('[PermissionsService] Lỗi sync:', err);
          reject(err);
        });
    });
  }

  return {
    getGroups: getGroups,
    getMenusByGroup: getMenusByGroup,
    getFullMenusByGroup: getFullMenusByGroup,
    savePermission: savePermission,
    sync: sync
  };
})();
