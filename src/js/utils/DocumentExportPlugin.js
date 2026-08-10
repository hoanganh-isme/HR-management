/**
 * Nút tích hợp xuất hợp đồng cho DynamicFormEngine.
 * Toàn bộ HTTP, modal và nghiệp vụ draft nằm trong ContractDocumentActions.
 */
var DocumentExportPlugin = (function (global) {
  'use strict';

  function stopDefault(event) {
    if (!event) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function warning(message) {
    if (global.Alert && typeof global.Alert.warning === 'function') {
      global.Alert.warning('Chưa chọn dữ liệu', message);
    } else {
      global.alert(message);
    }
  }

  function getExtraButtons(formName, getSelectedRows, moduleConfig, onReload) {
    var documentOptions = moduleConfig && moduleConfig.documentExport;
    if (!documentOptions || documentOptions.enabled === false) return [];
    var labels = documentOptions.labels || {};
    var canManageTemplates = global.AppPermissions
      ? global.AppPermissions.hasPermission(formName, 'isAdmin')
      : Boolean(global.AppSession && global.AppSession.isAdmin());

    var buttons = [
      {
        id: 'btn-export-contract',
        text: documentOptions.label || 'Xuất Hợp Đồng',
        icon: 'description',
        type: 'tool',
        onClick: function (event) {
          stopDefault(event);
          var rows = getSelectedRows();
          if (!rows || rows.length !== 1) {
            warning('Vui lòng chọn đúng một hợp đồng để xuất.');
            return;
          }
          if (!global.ContractDocumentActions) {
            warning('Chức năng tài liệu hợp đồng chưa được tải. Hãy tải lại bundle frontend.');
            return;
          }
          global.ContractDocumentActions.exportContract(rows[0], documentOptions, onReload);
        }
      }
    ];

    if (canManageTemplates) buttons.push({
        id: 'btn-manage-contract-registry',
        text: labels.manage || 'Quản lý hợp đồng',
        icon: 'folder_managed',
        type: 'tool',
        onClick: function (event) {
          stopDefault(event);
          if (global.ContractDocumentActions) global.ContractDocumentActions.manageTemplateRegistry();
        }
      });

    return buttons;
  }

  global.FormActionPlugins = (global.FormActionPlugins || []).filter(function (plugin) {
    return plugin.id !== 'contract_document_plugin';
  });
  global.FormActionPlugins.push({ id: 'contract_document_plugin', getExtraButtons: getExtraButtons });

  return { getExtraButtons: getExtraButtons };
})(window);
