/**
 * FormBuilderPlugin
 * Công cụ kiểm tra riêng cho trang Form Builder. Metadata của các form nghiệp vụ
 * luôn được đọc từ Field Contract V2; plugin không có đường lui sang schema web cũ.
 */
var FormBuilderPlugin = (function () {
  function _setBtnLoading(button, loading) {
    if (!button) return;
    if (loading) {
      if (!button.hasAttribute('data-original-html')) button.setAttribute('data-original-html', button.innerHTML);
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang tải...';
      button.disabled = true;
      return;
    }
    if (button.hasAttribute('data-original-html')) {
      button.innerHTML = button.getAttribute('data-original-html');
      button.removeAttribute('data-original-html');
    }
    button.disabled = false;
  }

  function _appendCell(row, value, className) {
    var cell = document.createElement('td');
    cell.className = className || '';
    cell.textContent = value === undefined || value === null || value === '' ? '—' : String(value);
    row.appendChild(cell);
  }

  function _showDiagnostics(formName, state) {
    if (!state || state.metadataActive !== true || !state.schema) {
      return Alert.error(
        'Không thể tải Metadata V2',
        state && state.error ? state.error : 'Không thể tải cấu hình màn hình.'
      );
    }

    var schema = state.schema;
    var diagnostics = Array.isArray(schema.diagnostics) ? schema.diagnostics : [];
    var diagnosticCodes = diagnostics.map(function (item) {
      return item && item.code ? String(item.code) : '';
    }).filter(Boolean);
    var body = document.createElement('div');
    body.className = 'p-2';

    var notice = document.createElement('div');
    notice.className = 'alert alert-info py-2';
    notice.textContent = 'Form Builder chỉ hiển thị Field Contract V2 của form nghiệp vụ. Thay đổi metadata phải đi qua registry và quy trình backend.';
    body.appendChild(notice);

    var routes = schema.runtimeRoutes || {};
    var summary = document.createElement('div');
    summary.className = 'mb-3 small';
    summary.textContent = 'Nguồn: ' + (schema.sourceKind || 'UNKNOWN')
      + ' | Bảng: ' + (schema.tableName || '—')
      + ' | PK: ' + (schema.primaryKey || '—')
      + ' | View: ' + ((routes.view && routes.view.registeredProcedure) || '—')
      + ' | Save: ' + ((routes.save && routes.save.registeredProcedure) || '—')
      + ' | Diagnostic: ' + (diagnosticCodes.length ? diagnosticCodes.join(', ') : 'OK');
    body.appendChild(summary);

    var wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    var table = document.createElement('table');
    table.className = 'table table-sm table-bordered align-middle';
    var head = document.createElement('thead');
    var headRow = document.createElement('tr');
    ['Field', 'Caption / format', 'Lookup', 'Grid', 'Add', 'Edit', 'Filter', 'Mobile', 'Reason codes'].forEach(function (title) {
      var th = document.createElement('th');
      th.textContent = title;
      headRow.appendChild(th);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    var tableBody = document.createElement('tbody');
    (schema.fields || []).forEach(function (field) {
      var row = document.createElement('tr');
      _appendCell(row, field.name);
      _appendCell(row, (field.label || field.name) + ' / ' + (field.formatId || field.renderRule || 'text'));
      _appendCell(row, field.lookup && field.lookup.disabled !== true ? 'Có' : 'Không');
      _appendCell(row, field.showInGrid === true ? 'Có' : 'Không');
      _appendCell(row, field.showInAdd === true ? (field.supportsInsert === true ? 'Ghi' : 'Chỉ đọc') : 'Không');
      _appendCell(row, field.showInEdit === true ? (field.supportsUpdate === true ? 'Ghi' : 'Chỉ đọc') : 'Không');
      _appendCell(row, field.showInFilter === true && field.supportsFilter === true ? 'Có' : 'Không');
      _appendCell(row, field.mobileClass || 'OPTIONAL');
      _appendCell(row, Array.isArray(field.reasonCodes) ? field.reasonCodes.join(', ') : '—');
      tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    wrapper.appendChild(table);
    body.appendChild(wrapper);

    UIModal.show({
      title: 'Metadata V2: ' + formName,
      width: '1000px',
      content: body,
      footer: UIButton.createHTML({ text: 'Đóng', className: 'btn-outline', onclick: 'this.closest(\'.modal-overlay\').remove()' })
    });
  }

  function _openMetadataModal(forceRefresh) {
    var body = document.createElement('div');
    body.className = 'p-3';
    body.innerHTML = '<div class="form-group mb-2">'
      + '<label class="form-label fw-bold">Tên Form (FormName):</label>'
      + '<input type="text" id="fieldContractFormName" class="ui-input" placeholder="Ví dụ: WA_PersonFullFrm">'
      + '</div>';

    var modal = UIModal.show({
      title: forceRefresh ? 'Làm mới Metadata V2' : 'Kiểm tra Metadata V2',
      width: '500px',
      content: body,
      footer: UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-outline', onclick: 'this.closest(\'.modal-overlay\').remove()' })
        + UIButton.createHTML({ text: 'Mở Metadata V2', type: 'primary', className: 'btn-open-field-contract', icon: 'schema' })
    });

    var button = modal.node.querySelector('.btn-open-field-contract');
    button.onclick = function () {
      var input = modal.node.querySelector('#fieldContractFormName');
      var formName = input ? input.value.trim() : '';
      if (!formName) return Alert.warning('Thiếu thông tin', 'Vui lòng nhập tên Form.');
      if (!window.FieldSyncService) return Alert.error('Chưa sẵn sàng', 'FieldSyncService chưa sẵn sàng.');

      var load = forceRefresh && typeof FieldSyncService.refreshForm === 'function'
        ? FieldSyncService.refreshForm(formName)
        : FieldSyncService.observeForm(formName);
      _setBtnLoading(button, true);
      Promise.resolve(load).then(function (state) {
        modal.closeNow();
        _showDiagnostics(formName, state);
      }).catch(function (error) {
        Alert.error('Không thể tải Metadata V2', error && error.message ? error.message : 'Không thể tải cấu hình màn hình.');
        _setBtnLoading(button, false);
      });
    };
  }

  function getExtraButtons() {
    if ((window.location.hash || '').indexOf('form-builder') === -1) return [];
    return [
      {
        id: 'btn-form-builder-metadata-v2',
        text: 'Kiểm tra Metadata V2',
        icon: 'schema',
        type: 'tool',
        onClick: function () { _openMetadataModal(false); }
      },
      {
        id: 'btn-form-builder-refresh-v2',
        text: 'Làm mới Metadata V2',
        icon: 'refresh',
        type: 'tool',
        onClick: function () { _openMetadataModal(true); }
      }
    ];
  }

  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({ getExtraButtons: getExtraButtons });

  return { getExtraButtons: getExtraButtons };
})();
