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
    var rawUser = (typeof localStorage !== 'undefined') ? localStorage.getItem('pmql_user') : null;
    var u = {};
    try {
      u = JSON.parse(rawUser || '{}');
    } catch (e) {
      u = {};
    }
    var rawGroup = u.UserGroupID || u.userGroupID || u.GroupID || u.groupID || u.GroupUser || u.Group || u.NhomQuyen || 'admin';
    var grpStr = String(rawGroup).trim();
    if (grpStr.toLowerCase().indexOf('quản trị') !== -1 || grpStr.toLowerCase() === 'admin') {
      return 'admin';
    }
    return grpStr;
  }

  function isSuccessResponse(response) {
    return !!(response && Number(response.code) === 0);
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
          if (isSuccessResponse(res)) {
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
   * Lưu menu raw (thêm mới hoặc cập nhật)
   * @param {Object} payload
   * @returns {Promise}
   */
  function save(payload) {
    return new Promise(function (resolve, reject) {
      var endpoint = _ep('SAVE');
      ApiClient.post(endpoint, payload)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          console.error('[MenusService] Lỗi save:', err);
          reject(err);
        });
    });
  }

  /**
   * Lưu menu thông qua MenuDefinition domain model và tự động làm mới metadata nếu cần
   * @param {Object} definition
   * @returns {Promise<Object>}
   */
  function saveDefinition(definition) {
    var model = window.MenuDefinition || (typeof require !== 'undefined' ? require('../core/MenuDefinition') : null);
    if (!model) {
      return Promise.reject(new Error('MenuDefinition model không khả dụng.'));
    }

    var normalized = model.normalizeMenu(definition);
    var validation = model.validate(normalized);
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.errors.join('\n')));
    }

    var payload = model.toSavePayload(normalized, _currentGroupId());

    return save(payload).then(function (res) {
      if (!isSuccessResponse(res)) {
        var errText = (res && res.msg) ? res.msg : 'Lưu Menu thất bại';
        throw new Error(errText);
      }

      var formName = normalized.FormName;
      var isDynamic = model.isDynamicFormName(formName);

      if (isDynamic && window.FieldSyncService) {
        if (typeof FieldSyncService.clearCache === 'function') {
          FieldSyncService.clearCache(formName);
        }

        if (typeof FieldSyncService.refreshForm === 'function') {
          return FieldSyncService.refreshForm(formName, [])
            .then(function (state) {
              return {
                menuSaved: true,
                metadataReady: true,
                metadataState: state,
                response: res
              };
            })
            .catch(function (metaErr) {
              console.warn('[MenusService] Menu đã lưu nhưng làm mới Metadata V2 gặp cảnh báo:', metaErr);
              return {
                menuSaved: true,
                metadataReady: false,
                metadataError: metaErr,
                response: res
              };
            });
        }
      }

      return {
        menuSaved: true,
        metadataReady: true,
        response: res
      };
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
        .then(function (res) {
          resolve(res);
        })
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
    saveDefinition: saveDefinition,
    deleteMenu: deleteMenu,
    updateOrder: updateOrder,
    isSuccessResponse: isSuccessResponse,
    currentGroupId: _currentGroupId
  };
})();

if (typeof window !== 'undefined') {
  window.MenusService = MenusService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenusService;
}
