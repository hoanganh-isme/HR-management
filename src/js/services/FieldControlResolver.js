/**
 * Resolver điều khiển field dùng chung cho form chính, wizard và detail.
 * Client chỉ dùng lookupKey từ Field Contract V2; nguồn dữ liệu thật được
 * backend giải quyết và kiểm tra quyền/chi nhánh.
 */
window.FieldControlResolver = (function () {
  var SAFE_LOOKUP_KEY = /^[A-Fa-f0-9]{64}$/;

  function lookupOf(field) {
    var nested = field && field.lookup && typeof field.lookup === 'object'
      ? field.lookup
      : {};
    return {
      key: String(field && field.lookupKey || nested.key || ''),
      dependsOn: field && field.dependsOn !== undefined
        ? field.dependsOn
        : (Array.isArray(nested.dependsOn) ? nested.dependsOn : [])
    };
  }

  function isContractLookup(field) {
    var lookup = lookupOf(field);
    return Boolean(
      field
      && SAFE_LOOKUP_KEY.test(lookup.key)
      && window.FieldSyncService
      && typeof FieldSyncService.createLookupDataSource === 'function'
    );
  }

  function createLookupSearch(field, options) {
    if (!isContractLookup(field)) return null;

    var settings = options || {};
    var lookup = lookupOf(field);
    return FieldSyncService.createLookupDataSource({
      formName: settings.formName,
      detailKey: settings.detailKey,
      lookupKey: lookup.key,
      dependsOn: lookup.dependsOn,
      getDependencyValues: settings.getValues,
      dependencyValues: settings.values,
      pageSize: settings.pageSize || 30,
      valueHeader: settings.valueHeader || 'Mã',
      displayHeader: settings.displayHeader || 'Tên',
      forceMultiColumn: settings.forceMultiColumn === true
    });
  }

  function createCombo(field, options) {
    var settings = options || {};
    var search = createLookupSearch(field, settings);
    if (!search || !window.UIControls || typeof UIControls.createDataComboBox !== 'function') {
      return null;
    }

    var hiddenInput = settings.hiddenInput;
    var currentValue = settings.value === undefined || settings.value === null
      ? ''
      : String(settings.value);
    var combo = UIControls.createDataComboBox({
      placeholder: settings.placeholder || '-- Vui lòng chọn --',
      headers: [settings.valueHeader || 'Mã', settings.displayHeader || 'Tên'],
      colFilterIndex: 1,
      forceMultiColumn: false,
      disabled: settings.disabled === true,
      showAddNew: false,
      onSearch: search,
      onSelect: function (row) {
        var value = Array.isArray(row) && row[0] !== undefined ? row[0] : '';
        if (hiddenInput) hiddenInput.value = value;
        if (typeof settings.onSelect === 'function') settings.onSelect(value, row);
        if (hiddenInput) hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    if (currentValue) {
      var displayInput = combo.querySelector && combo.querySelector('input.ui-input');
      if (displayInput) displayInput.value = currentValue;
      search(currentValue, 1).then(function (result) {
        var rows = result && Array.isArray(result.data) ? result.data : [];
        var matched = rows.find(function (row) {
          return String(row[0]) === currentValue;
        });
        if (matched && displayInput) displayInput.value = matched[1];
      }).catch(function (error) {
        console.warn('[FieldControlResolver] Không tải được nhãn lookup:', error);
      });
    }

    return combo;
  }

  return Object.freeze({
    isContractLookup: isContractLookup,
    createLookupSearch: createLookupSearch,
    createCombo: createCombo
  });
})();
