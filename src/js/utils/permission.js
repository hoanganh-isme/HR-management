/**
 * Permission Utility
 * Quản lý phân quyền hiển thị UI
 */
var Permission = (function () {
  function _get(module) {
    var legacyPerms = JSON.parse(localStorage.getItem('app_permissions') || '{}');
    var newPerms = JSON.parse(localStorage.getItem('pmql_permissions') || '{}');
    var perms = Object.keys(newPerms).length > 0 ? newPerms : legacyPerms;
    
    if (Object.keys(perms).length === 0) {
      return { xem: true, them: true, sua: true, xoa: true };
    }
    
    var p = perms[module];
    if (!p) {
      var target = (module || '').toLowerCase();
      for (var key in perms) {
        if (key.toLowerCase() === target) {
          p = perms[key];
          break;
        }
      }
    }
    p = p || {};
    
    return {
        xem: p.CanView == 1 || p.CanView === '1' || p.CanView === true || p.CanView === 'true' || p.xem == 1 || p.xem === '1' || p.xem === true || p.xem === 'true',
        them: p.CanAdd == 1 || p.CanAdd === '1' || p.CanAdd === true || p.CanAdd === 'true' || p.them == 1 || p.them === '1' || p.them === true || p.them === 'true',
        sua: p.CanEdit == 1 || p.CanEdit === '1' || p.CanEdit === true || p.CanEdit === 'true' || p.sua == 1 || p.sua === '1' || p.sua === true || p.sua === 'true',
        xoa: p.CanDelete == 1 || p.CanDelete === '1' || p.CanDelete === true || p.CanDelete === 'true' || p.xoa == 1 || p.xoa === '1' || p.xoa === true || p.xoa === 'true'
    };
  }

  return {
    canView:   function (module) { return _get(module).xem; },
    canAdd:    function (module) { return _get(module).them; },
    canEdit:   function (module) { return _get(module).sua; },
    canDelete: function (module) { return _get(module).xoa; }
  };
})();
