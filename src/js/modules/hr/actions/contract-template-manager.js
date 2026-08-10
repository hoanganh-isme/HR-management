var ContractTemplateManager = (function (global) {
  'use strict';

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function iconButton(label, icon, className) {
    var button = createElement('button', 'contract-template-action ' + (className || ''));
    button.type = 'button';
    var symbol = createElement('span', 'material-symbols-outlined', icon);
    symbol.setAttribute('aria-hidden', 'true');
    button.appendChild(symbol);
    button.appendChild(createElement('span', '', label));
    return button;
  }

  function notify(type, title, message) {
    if (global.Alert && typeof global.Alert[type] === 'function') {
      global.Alert[type](title, message || '');
      return;
    }
    if (global.UIToast && typeof global.UIToast.show === 'function') {
      global.UIToast.show((title ? title + ': ' : '') + (message || ''), type);
      return;
    }
    global.alert((title ? title + ': ' : '') + (message || ''));
  }

  function normalize(value) {
    return String(value === undefined || value === null ? '' : value).trim().toLowerCase();
  }

  function open(options) {
    var settings = options || {};
    var api = settings.api || global.ContractDocumentApi;
    var state = {
      items: [],
      schema: [],
      selectedId: '',
      search: '',
      busy: false,
      canDelete: true,
      closed: false
    };

    var overlay = createElement('div', 'contract-template-manager-overlay');
    var page = createElement('section', 'contract-template-manager-page');
    page.setAttribute('role', 'dialog');
    page.setAttribute('aria-modal', 'true');
    page.setAttribute('aria-labelledby', 'contract-template-manager-title');
    page.tabIndex = -1;

    var header = createElement('header', 'contract-template-manager-header');
    var headingGroup = createElement('div', 'contract-template-manager-heading');
    var headingIcon = createElement('span', 'material-symbols-outlined', 'contract_edit');
    headingIcon.setAttribute('aria-hidden', 'true');
    var headingCopy = createElement('div');
    var title = createElement('h2', '', 'Quản lý hợp đồng');
    title.id = 'contract-template-manager-title';
    var description = createElement('p', '', 'Quản lý loại hợp đồng và tệp DOCX dùng để xuất tài liệu.');
    headingCopy.appendChild(title);
    headingCopy.appendChild(description);
    headingGroup.appendChild(headingIcon);
    headingGroup.appendChild(headingCopy);
    var closeButton = iconButton('Đóng', 'close', 'is-ghost contract-template-close');
    header.appendChild(headingGroup);
    header.appendChild(closeButton);

    var toolbar = createElement('div', 'contract-template-manager-toolbar');
    var primaryActions = createElement('div', 'contract-template-primary-actions');
    var addButton = iconButton('Thêm mẫu', 'add', 'is-primary');
    var editButton = iconButton('Sửa thông tin', 'edit', '');
    var editDocumentButton = iconButton('Sửa tài liệu hợp đồng', 'edit_document', '');
    var deleteButton = iconButton('Xóa', 'delete', 'is-danger');
    primaryActions.appendChild(addButton);
    primaryActions.appendChild(editButton);
    primaryActions.appendChild(editDocumentButton);
    primaryActions.appendChild(deleteButton);

    var utilityActions = createElement('div', 'contract-template-utility-actions');
    var searchBox = createElement('label', 'contract-template-search');
    searchBox.appendChild(createElement('span', 'material-symbols-outlined', 'search'));
    var searchInput = createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Tìm loại hợp đồng hoặc tên tệp...';
    searchInput.setAttribute('aria-label', 'Tìm mẫu hợp đồng');
    searchBox.appendChild(searchInput);
    var refreshButton = iconButton('Tải lại', 'refresh', 'is-icon');
    utilityActions.appendChild(searchBox);
    utilityActions.appendChild(refreshButton);
    toolbar.appendChild(primaryActions);
    toolbar.appendChild(utilityActions);

    var content = createElement('div', 'contract-template-manager-content');
    var status = createElement('div', 'contract-template-manager-status');
    status.setAttribute('role', 'status');
    var tableWrap = createElement('div', 'contract-template-table-wrap');
    var table = createElement('table', 'contract-template-table');
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    ['', 'Loại hợp đồng', 'Tệp mẫu DOCX', 'Ghi chú', 'Trạng thái'].forEach(function (label) {
      var th = createElement('th', '', label);
      if (!label) th.setAttribute('aria-label', 'Chọn');
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    var emptyState = createElement('div', 'contract-template-empty');
    emptyState.appendChild(createElement('span', 'material-symbols-outlined', 'folder_off'));
    emptyState.appendChild(createElement('strong', '', 'Chưa có mẫu hợp đồng'));
    emptyState.appendChild(createElement('p', '', 'Bấm “Thêm mẫu” để đăng ký loại hợp đồng và tải tệp DOCX lên.'));
    content.appendChild(status);
    content.appendChild(tableWrap);
    content.appendChild(emptyState);

    var footer = createElement('footer', 'contract-template-manager-footer');
    var totalText = createElement('span', '', '0 mẫu hợp đồng');
    var selectedText = createElement('span', 'contract-template-selected-text', 'Chưa chọn mẫu');
    footer.appendChild(totalText);
    footer.appendChild(selectedText);

    page.appendChild(header);
    page.appendChild(toolbar);
    page.appendChild(content);
    page.appendChild(footer);
    overlay.appendChild(page);
    document.body.appendChild(overlay);

    function selectedItem() {
      return state.items.find(function (item) { return item.id === state.selectedId; }) || null;
    }

    function setBusy(busy, message) {
      state.busy = Boolean(busy);
      status.textContent = message || '';
      status.classList.toggle('is-active', state.busy);
      updateActions();
    }

    function updateActions() {
      var hasSelection = Boolean(selectedItem());
      addButton.disabled = state.busy;
      refreshButton.disabled = state.busy;
      editButton.disabled = state.busy || !hasSelection;
      editDocumentButton.disabled = state.busy || !hasSelection;
      deleteButton.disabled = state.busy || !hasSelection || !state.canDelete;
      selectedText.textContent = hasSelection
        ? 'Đã chọn: ' + (selectedItem().loaiHD || selectedItem().templateFile)
        : 'Chưa chọn mẫu';
    }

    function searchableFields() {
      return state.schema.filter(function (field) { return field.searchable !== false; });
    }

    function visibleItems() {
      var keyword = normalize(state.search);
      if (!keyword) return state.items.slice();
      return state.items.filter(function (item) {
        return searchableFields().some(function (field) {
          return normalize(item[field.name]).indexOf(keyword) >= 0;
        });
      });
    }

    function selectRow(id) {
      state.selectedId = id || '';
      renderRows();
    }

    function cell(label, value, className) {
      var td = createElement('td', className || '', value);
      td.dataset.label = label;
      return td;
    }

    function renderRows() {
      var visible = visibleItems();
      tbody.innerHTML = '';
      visible.forEach(function (item) {
        var row = document.createElement('tr');
        row.classList.toggle('is-selected', item.id === state.selectedId);
        row.tabIndex = 0;
        row.dataset.recordId = item.id;

        var selectCell = document.createElement('td');
        selectCell.dataset.label = 'Chọn';
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'contract-template-selected';
        radio.checked = item.id === state.selectedId;
        radio.setAttribute('aria-label', 'Chọn ' + (item.loaiHD || item.templateFile));
        radio.addEventListener('change', function () { selectRow(item.id); });
        selectCell.appendChild(radio);

        var fileCell = cell('Tệp mẫu DOCX', item.templateFile, 'contract-template-file-name');
        fileCell.title = item.templateFile || '';
        var stateCell = document.createElement('td');
        stateCell.dataset.label = 'Trạng thái';
        var badge = createElement('span', 'contract-template-badge ' + (item.available ? 'is-ready' : 'is-missing'), item.available ? 'Sẵn sàng' : 'Thiếu tệp');
        stateCell.appendChild(badge);

        row.appendChild(selectCell);
        row.appendChild(cell('Loại hợp đồng', item.loaiHD, 'contract-template-type'));
        row.appendChild(fileCell);
        row.appendChild(cell('Ghi chú', item.description || '—', 'contract-template-description'));
        row.appendChild(stateCell);
        row.addEventListener('click', function (event) {
          if (event.target !== radio) selectRow(item.id);
        });
        row.addEventListener('dblclick', function () { openRecordForm(item); });
        row.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectRow(item.id);
          }
        });
        tbody.appendChild(row);
      });
      tableWrap.hidden = visible.length === 0;
      emptyState.hidden = visible.length !== 0;
      totalText.textContent = visible.length === state.items.length
        ? state.items.length + ' mẫu hợp đồng'
        : visible.length + '/' + state.items.length + ' mẫu phù hợp';
      updateActions();
    }

    function load(preferredId) {
      setBusy(true, 'Đang tải danh sách mẫu hợp đồng...');
      return api.templateRegistry().then(function (data) {
        state.items = Array.isArray(data.items) ? data.items : [];
        state.schema = Array.isArray(data.schema) ? data.schema : [];
        state.canDelete = !data.permissions || data.permissions.canDelete !== false;
        title.textContent = data.title || title.textContent;
        description.textContent = data.description || description.textContent;
        var nextId = preferredId || state.selectedId;
        state.selectedId = state.items.some(function (item) { return item.id === nextId; }) ? nextId : '';
        setBusy(false, '');
        renderRows();
      }).catch(function (error) {
        setBusy(false, '');
        notify('error', 'Không tải được danh sách mẫu', error.message);
        renderRows();
      });
    }

    function showConfirm(item) {
      return new Promise(function (resolve) {
        var confirmOverlay = createElement('div', 'contract-template-confirm-overlay');
        var dialog = createElement('div', 'contract-template-confirm');
        dialog.setAttribute('role', 'alertdialog');
        dialog.appendChild(createElement('span', 'material-symbols-outlined', 'warning'));
        dialog.appendChild(createElement('h3', '', 'Xóa mẫu hợp đồng?'));
        dialog.appendChild(createElement('p', '', 'Cấu hình “' + item.loaiHD + '” sẽ bị xóa. Tệp DOCX không bị mất mà được chuyển vào thư mục backups.'));
        var actions = createElement('div', 'contract-template-confirm-actions');
        var cancel = iconButton('Hủy', 'close', '');
        var confirm = iconButton('Xóa mẫu', 'delete', 'is-danger');
        actions.appendChild(cancel);
        actions.appendChild(confirm);
        dialog.appendChild(actions);
        confirmOverlay.appendChild(dialog);
        document.body.appendChild(confirmOverlay);
        function finish(value) { confirmOverlay.remove(); resolve(value); }
        cancel.onclick = function () { finish(false); };
        confirm.onclick = function () { finish(true); };
        cancel.focus();
      });
    }

    function openRecordForm(item) {
      var editing = Boolean(item);
      var formOverlay = createElement('div', 'contract-template-form-overlay');
      var dialog = createElement('form', 'contract-template-form');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      var formHeader = createElement('div', 'contract-template-form-header');
      var formTitle = createElement('h3', '', editing ? 'Sửa thông tin mẫu hợp đồng' : 'Thêm mẫu hợp đồng');
      var formClose = iconButton('Đóng', 'close', 'is-icon');
      formHeader.appendChild(formTitle);
      formHeader.appendChild(formClose);
      var formBody = createElement('div', 'contract-template-form-body');
      var controls = {};
      var fileInput = null;
      var fileHint = null;

      state.schema.forEach(function (field) {
        var group = createElement('div', 'contract-template-field');
        var label = createElement('label', '', field.label || field.name);
        if (field.required || (!editing && field.requiredOnCreate)) label.appendChild(createElement('span', 'is-required', ' *'));
        group.appendChild(label);
        if (field.type === 'file') {
          var dropzone = createElement('label', 'contract-template-file-dropzone');
          dropzone.appendChild(createElement('span', 'material-symbols-outlined', 'upload_file'));
          fileHint = createElement('strong', '', editing && item.templateFile ? item.templateFile : 'Chọn tệp DOCX');
          dropzone.appendChild(fileHint);
          dropzone.appendChild(createElement('small', '', editing ? 'Để trống nếu muốn giữ nguyên tệp hiện tại.' : 'Chỉ nhận tệp .docx hợp lệ.'));
          fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = field.accept || '.docx';
          fileInput.hidden = true;
          fileInput.addEventListener('change', function () {
            if (fileInput.files && fileInput.files[0]) fileHint.textContent = fileInput.files[0].name;
          });
          dropzone.appendChild(fileInput);
          group.appendChild(dropzone);
        } else {
          var control = field.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
          if (field.type !== 'textarea') control.type = field.type || 'text';
          if (field.maxLength) control.maxLength = Number(field.maxLength);
          control.required = Boolean(field.required);
          control.value = editing ? String(item[field.name] || '') : '';
          control.name = field.name;
          controls[field.name] = control;
          group.appendChild(control);
        }
        formBody.appendChild(group);
      });

      var formError = createElement('div', 'contract-template-form-error');
      formError.setAttribute('role', 'alert');
      var formActions = createElement('div', 'contract-template-form-actions');
      var cancelButton = iconButton('Hủy', 'close', '');
      var saveButton = iconButton(editing ? 'Lưu thay đổi' : 'Thêm mẫu', 'save', 'is-primary');
      formActions.appendChild(cancelButton);
      formActions.appendChild(saveButton);
      dialog.appendChild(formHeader);
      dialog.appendChild(formBody);
      dialog.appendChild(formError);
      dialog.appendChild(formActions);
      formOverlay.appendChild(dialog);
      document.body.appendChild(formOverlay);

      function closeForm() { formOverlay.remove(); }
      formClose.onclick = function (event) { event.preventDefault(); closeForm(); };
      cancelButton.onclick = function (event) { event.preventDefault(); closeForm(); };
      dialog.addEventListener('submit', function (event) {
        event.preventDefault();
        formError.textContent = '';
        var values = {};
        Object.keys(controls).forEach(function (name) { values[name] = controls[name].value.trim(); });
        var file = fileInput && fileInput.files ? fileInput.files[0] : null;
        if (!editing && !file) {
          formError.textContent = 'Vui lòng chọn tệp mẫu DOCX.';
          return;
        }
        if (file && !/\.docx$/i.test(file.name)) {
          formError.textContent = 'Tệp mẫu phải có định dạng .docx.';
          return;
        }
        saveButton.disabled = true;
        cancelButton.disabled = true;
        saveButton.lastChild.textContent = 'Đang lưu...';
        var operation = editing
          ? api.updateTemplateRecord(item.id, values, file)
          : api.createTemplateRecord(values, file);
        operation.then(function (saved) {
          closeForm();
          notify('success', editing ? 'Đã cập nhật mẫu' : 'Đã thêm mẫu', saved.loaiHD + ' — ' + saved.templateFile);
          return load(saved.id);
        }).catch(function (error) {
          formError.textContent = error.message || 'Không thể lưu mẫu hợp đồng.';
          saveButton.disabled = false;
          cancelButton.disabled = false;
          saveButton.lastChild.textContent = editing ? 'Lưu thay đổi' : 'Thêm mẫu';
        });
      });
      var firstControl = formBody.querySelector('input:not([type="file"]), textarea');
      if (firstControl) firstControl.focus();
    }

    function close() {
      if (state.closed) return;
      state.closed = true;
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
    }

    function onKeyDown(event) {
      if (event.key === 'Escape' && !document.querySelector('.contract-template-form-overlay, .contract-template-confirm-overlay')) close();
    }

    closeButton.onclick = close;
    addButton.onclick = function () { openRecordForm(null); };
    editButton.onclick = function () {
      var item = selectedItem();
      if (item) openRecordForm(item);
    };
    editDocumentButton.onclick = function () {
      var item = selectedItem();
      if (item && typeof settings.editDocument === 'function') settings.editDocument(item);
    };
    deleteButton.onclick = function () {
      var item = selectedItem();
      if (!item) return;
      showConfirm(item).then(function (confirmed) {
        if (!confirmed) return;
        setBusy(true, 'Đang xóa cấu hình và lưu bản sao an toàn...');
        return api.deleteTemplateRecord(item.id).then(function () {
          state.selectedId = '';
          notify('success', 'Đã xóa mẫu hợp đồng', item.loaiHD);
          return load();
        }).catch(function (error) {
          setBusy(false, '');
          notify('error', 'Không thể xóa mẫu', error.message);
        });
      });
    };
    refreshButton.onclick = function () { load(state.selectedId); };
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value;
      renderRows();
    });
    document.addEventListener('keydown', onKeyDown);
    page.focus();
    load();

    return { close: close, reload: load };
  }

  return { open: open };
})(window);
