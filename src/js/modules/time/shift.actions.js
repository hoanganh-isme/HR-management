window.ShiftActions = (function () {
  function recordsOf(response) {
    if (Array.isArray(response)) return response;
    return response && (response.records || response.list || response.data) || [];
  }

  function normalizeEmployee(row) {
    if (!Array.isArray(row)) return row;
    return { PersonID: row[0] || '', PersonName: row[1] || '', PhongBan: row[2] || '', TitleName: row[3] || '' };
  }

  function runAutoAssign(context, sapCaID) {
    if (!sapCaID) {
      context.notify('Vui long luu thay doi truoc khi sap ca tu dong.', 'warning');
      return Promise.resolve(null);
    }
    return GatewayClient.runModuleOperation(context.config, 'autoAssign', { SapCaID: sapCaID })
      .then(function (response) {
        if (response && response.code !== undefined && Number(response.code) !== 0) {
          throw new Error(response.msg || 'Sap ca tu dong that bai');
        }
        context.notify('Da sap ca tu dong thanh cong', 'success');
        return context.reloadDetails().then(function () { return response; });
      })
      .catch(function (error) {
        context.notify(error.message || 'Khong the sap ca tu dong', 'error');
        throw error;
      });
  }

  function autoAssign(context) {
    var values = context.values || {};
    var message = 'Ban co chac muon chay sap ca tu dong?';
    if (values.TuNgay && values.DenNgay) message = 'Sap ca tu dong tu ' + values.TuNgay + ' den ' + values.DenNgay + '?';
    return context.confirm({ title: 'Xac nhan sap ca tu dong', message: message, confirmText: 'Xac nhan' })
      .then(function (confirmed) {
        if (!confirmed) return null;
        if (context.isEdit) {
          return context.save().then(function (savedRow) {
            return runAutoAssign(context, savedRow.SapCaID || context.getValue('SapCaID'));
          });
        }
        return runAutoAssign(context, context.getValue('SapCaID') || context.row.SapCaID);
      });
  }

  function selectEmployees(context) {
    return GatewayClient.runModuleOperation(context.config, 'employee', undefined, { keyword: '' })
      .then(function (response) {
        var rows = recordsOf(response).map(normalizeEmployee);
        UIControls.utils.showMultiSelectGridModal({
          title: 'Chon nhan vien', dataList: rows, ctx: context,
          keyField: context.config.lookups.employee.keyField,
          headers: ['Ma NV', 'Ho ten', 'Bo phan', 'Chuc vu', 'Canh bao'],
          fields: ['PersonID', 'PersonName', 'PhongBan', 'TitleName', '_warning_'],
          onRowRender: function (rowData, duplicate) {
            return { warningText: duplicate ? 'Da co tren form' : '', warningStyle: duplicate ? 'color:red;' : '' };
          },
          onConfirm: function (selectedRows) {
            var detailRows = context.values.detailRows || [];
            selectedRows.forEach(function (source) {
              detailRows.push({
                SapCaID: context.row[context.config.PrimaryKey], PersonID: source.PersonID,
                PersonName: source.PersonName, PhongBan: source.PhongBan, GhiChu: ''
              });
            });
            context.reloadDetails();
            context.notify('Da them ' + selectedRows.length + ' nhan vien', 'success');
          }
        });
        return rows;
      });
  }

  function legacyById(sapCaID) {
    var config = ModuleRegistry.getConfig('WA_CaLamViecFrm');
    var context = {
      row: { SapCaID: sapCaID }, values: { SapCaID: sapCaID }, config: config,
      getValue: function (field) { return this.values[field]; },
      reloadDetails: function () { return Promise.resolve(); },
      notify: function (message, type) {
        if (typeof UIToast !== 'undefined') UIToast.show(message, type || 'info');
      }
    };
    return runAutoAssign(context, sapCaID);
  }

  function legacyAutoAssign(contextOrId) {
    if (contextOrId && typeof contextOrId === 'object' && contextOrId.config) return autoAssign(contextOrId);
    return legacyById(contextOrId);
  }

  return { autoAssign: autoAssign, autoAssignById: legacyById, selectEmployees: selectEmployees };
})();

window.SapCaTuDong = function (contextOrId) {
  return contextOrId && typeof contextOrId === 'object'
    ? window.ShiftActions.autoAssign(contextOrId)
    : window.ShiftActions.autoAssignById(contextOrId);
};
window.SapCaTuDong_ByID = function (sapCaID) { return window.ShiftActions.autoAssignById(sapCaID); };
