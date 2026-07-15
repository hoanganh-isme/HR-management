/**
 * Trách nhiệm: đăng ký nút xuất hợp đồng trên form hợp đồng lao động.
 * Đầu vào: formName và dòng được chọn.
 * Đầu ra: gọi ContractDocumentActions để tạo draft và mở trình sửa.
 * Nơi gọi: FormActionRegistry/DynamicFormEngine.
 */
var DocumentExportPlugin = (function () {
  var FORM_CONFIG = {
    WA_HopDongLaoDongFrm: {
      label: 'Xuất hợp đồng',
      icon: 'description'
    }
  };

  function getExtraButtons(formName, getSelectedRows) {
    var config = FORM_CONFIG[formName];
    if (!config) return [];

    return [{
      id: 'btn-export-contract-document',
      text: config.label,
      icon: config.icon,
      type: 'tool',
      onClick: function () {
        var selectedRows = getSelectedRows();
        if (!selectedRows || selectedRows.length !== 1) {
          if (typeof Alert !== 'undefined') Alert.warning('Chưa chọn dữ liệu', 'Vui lòng chọn đúng một hợp đồng để xuất.');
          return;
        }
        ContractDocumentActions.xuatHopDong(selectedRows[0]).catch(function (error) {
          if (error && error.message !== 'CANCELLED') console.error('[DocumentExportPlugin]', error);
        });
      }
    }, {
      id: 'btn-view-contract-workspace',
      text: 'Tài liệu hợp đồng',
      icon: 'folder_open',
      type: 'tool',
       onClick: function () { window.location.hash = '#/document-manager?tab=saved'; }
    }];
  }

  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });
  return { getExtraButtons: getExtraButtons };
})();
