window.EmploymentContractActions = (function () {
  function recordsOf(response) {
    if (Array.isArray(response)) return response;
    return response && (response.records || response.list || response.data) || [];
  }

  function mapRow(source, mapping, ownerField, ownerValue) {
    var row = {};
    row[ownerField] = ownerValue;
    Object.keys(mapping).forEach(function (target) {
      var sourceField = mapping[target];
      row[target] = source[sourceField] !== undefined ? source[sourceField] : '';
    });
    return row;
  }

  function selectAllowances(context) {
    var lookup = context.config.lookups.allowance;
    var detail = context.config.details.allowances;
    return GatewayClient.runModuleOperation(context.config, 'allowance', undefined, { keyword: '' })
      .then(function (response) {
        var dataList = recordsOf(response);
        UIControls.utils.showMultiSelectGridModal({
          title: 'Chon phu cap',
          dataList: dataList,
          ctx: context,
          keyField: lookup.keyField,
          headers: ['Ma phu cap', 'Ten phu cap', 'Tien PC', 'PC ngay', 'PC thang', 'Ghi chu'],
          fields: ['MaPhuCap', 'TenPhuCap', 'TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'GhiChu'],
          mapRow: function (source) {
            return mapRow(source, lookup.fieldMapping, detail.filterField, context.row[context.config.PrimaryKey]);
          }
        });
        return dataList;
      })
      .catch(function (error) {
        context.notify(error.message || 'Khong the tai danh sach phu cap', 'error');
        throw error;
      });
  }

  return { selectAllowances: selectAllowances };
})();
