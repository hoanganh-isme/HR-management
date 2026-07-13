window.InsuranceActions = (function () {
  function recordsOf(response) {
    if (Array.isArray(response)) return response;
    return response && (response.records || response.list || response.data) || [];
  }

  function applyOutput(row, responseRow, operation) {
    var mapping = operation.outputFieldMapping || {};
    Object.keys(mapping).forEach(function (targetField) {
      var sourceField = mapping[targetField];
      row[targetField] = responseRow[sourceField] !== undefined ? responseRow[sourceField] : 0;
    });
    return row;
  }

  function calculateRow(config, row, values) {
    var input = {
      PeriodID: values.PeriodID,
      LoaiBaoHiem: values.LoaiBaoHiem,
      MucDong: parseFloat(values.MucDong) || 0
    };
    return GatewayClient.runModuleOperation(config, 'calculateInsurance', input).then(function (response) {
      var result = recordsOf(response)[0] || {};
      return applyOutput(row, result, config.actions.calculateInsurance);
    });
  }

  function calculate(context) {
    var values = Object.assign({}, context.values, { MucDong: context.values.value });
    context.setValue('MucDong', parseFloat(values.MucDong) || 0);
    return calculateRow(context.config, context.row, values)
      .then(function () { return context.reloadDetails(); })
      .catch(function (error) {
        context.notify(error.message || 'Khong the tinh muc dong bao hiem', 'error');
        throw error;
      });
  }

  function selectEmployees(context) {
    var input = {
      BranchID: context.getValue('BranchID'),
      LoaiBaoHiem: context.getValue('LoaiBaoHiem'),
      DocumentID: context.getValue('DocumentID') || context.row[context.config.PrimaryKey]
    };
    if (!input.BranchID || !input.LoaiBaoHiem) {
      context.notify('Vui long chon chi nhanh va loai bao hiem truoc.', 'warning');
      return Promise.resolve([]);
    }

    return GatewayClient.runModuleOperation(context.config, 'employee', input, { keyword: '' })
      .then(function (response) {
        var dataList = recordsOf(response);
        UIControls.utils.showMultiSelectGridModal({
          title: 'Chon nhan vien tham gia bao hiem',
          dataList: dataList,
          ctx: context,
          keyField: context.config.lookups.employee.keyField,
          headers: ['Ma NV', 'Ho ten', 'Chuc danh', 'Bo phan', 'Muc dong', 'Canh bao'],
          fields: ['PersonID', 'PersonName', 'ChucDanhChuyenMon', 'PhongBan', 'MucDong', '_warning_'],
          onRowRender: function (rowData, isDuplicate) {
            var warning = rowData.CanhBao || (isDuplicate ? 'Da co tren form' : '');
            return { warningText: warning, warningStyle: warning ? 'color:red;' : '' };
          },
          onConfirm: function (selectedRows) {
            var detailRows = context.values.detailRows || [];
            var pending = selectedRows.map(function (source) {
              var row = {
                DocumentID: input.DocumentID,
                PersonID: source.PersonID,
                PersonName: source.PersonName,
                ChucDanhChuyenMon: source.ChucDanhChuyenMon,
                PhongBan: source.PhongBan,
                MucDong: parseFloat(source.MucDong) || 0,
                PeriodID: context.getValue('PeriodID'),
                LoaiBaoHiem: input.LoaiBaoHiem
              };
              if (!row.MucDong) return Promise.resolve(row);
              return calculateRow(context.config, row, row);
            });
            Promise.all(pending).then(function (rows) {
              Array.prototype.push.apply(detailRows, rows);
              context.reloadDetails();
              context.notify('Da them ' + rows.length + ' nhan vien', 'success');
            }).catch(function (error) {
              context.notify(error.message || 'Khong the tinh bao hiem', 'error');
            });
          }
        });
        return dataList;
      })
      .catch(function (error) {
        context.notify(error.message || 'Khong the tai danh sach nhan vien', 'error');
        throw error;
      });
  }

  return { calculate: calculate, selectEmployees: selectEmployees };
})();
