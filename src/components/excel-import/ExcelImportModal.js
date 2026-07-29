/**
 * Import Excel/clipboard qua cùng pipeline backend:
 * prepare nguồn -> preview/mapping -> validate -> BulkCopy trong một transaction.
 */
window.ExcelImportModal = (function () {
  'use strict';

  var SOURCE_FILE = 'FILE';
  var SOURCE_CLIPBOARD = 'CLIPBOARD';
  var PREVIEW_COLUMN_LIMIT = 12;
  var USER_TEXT = Object.freeze({
    preparing: 'Đang chuẩn bị...',
    sending: 'Đang gửi dữ liệu...',
    reading: 'Đang đọc dữ liệu...',
    readingHelp: 'Hệ thống đang đọc dữ liệu. Vui lòng chờ.',
    saving: 'Đang lưu dữ liệu...',
    savingHelp: 'Hệ thống đang kiểm tra và lưu dữ liệu. Vui lòng chờ.',
    saveAction: 'Lưu',
    ready: 'Dữ liệu đã sẵn sàng để lưu.'
  });

  function text(value) {
    return String(value === undefined || value === null ? '' : value);
  }

  function normalize(value) {
    return text(value).trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function normalizeLoose(value) {
    return normalize(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '');
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('vi-VN');
  }

  function formatBytes(value) {
    var bytes = Number(value || 0);
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function errorPayload(error) {
    return error && error.data && typeof error.data === 'object'
      ? error.data
      : { message: error && error.message ? error.message : 'Không thể xử lý dữ liệu. Vui lòng thử lại.' };
  }

  function autoMatch(header, fields) {
    var exactName = fields.filter(function (field) { return text(field.name) === text(header).trim(); });
    if (exactName.length === 1) return exactName[0].name;
    var exactLabel = fields.filter(function (field) {
      return text(field.label) === text(header).trim()
        || text(field.uiLabel) === text(header).trim();
    });
    if (exactLabel.length === 1) return exactLabel[0].name;
    var normalized = fields.filter(function (field) {
      return normalize(field.name) === normalize(header)
        || normalize(field.label) === normalize(header)
        || normalize(field.uiLabel) === normalize(header);
    });
    if (normalized.length === 1) return normalized[0].name;
    var loose = fields.filter(function (field) {
      return normalizeLoose(field.name) === normalizeLoose(header)
        || normalizeLoose(field.label) === normalizeLoose(header)
        || normalizeLoose(field.uiLabel) === normalizeLoose(header);
    });
    return loose.length === 1 ? loose[0].name : '';
  }

  function show(options) {
    var config = options || {};
    var formName = text(config.formName).trim();
    var apiBase = text(config.apiBase).replace(/\/+$/, '');
    var requestHeaders = config.requestHeaders || {};
    var state = {
      sourceType: SOURCE_FILE,
      importId: '',
      prepared: null,
      capabilities: null,
      busy: false,
      executed: false,
      successNotified: false,
      controller: null,
      orderedFields: [],
      positionalFields: [],
      hasColumnLayout: false
    };

    var backdrop = document.createElement('div');
    backdrop.className = 'excel-import-backdrop';
    backdrop.innerHTML = [
      '<section class="excel-import-card" role="dialog" aria-modal="true" aria-labelledby="excel-import-title" tabindex="-1">',
      '  <header class="excel-import-header">',
      '    <div class="excel-import-title-group">',
      '      <span class="material-symbols-outlined excel-import-title-icon" aria-hidden="true">upload_file</span>',
      '      <div class="excel-import-title-copy">',
      '        <h3 id="excel-import-title">Lấy dữ liệu Excel</h3>',
      '        <p id="excel-import-subtitle"></p>',
      '      </div>',
      '    </div>',
      '    <button type="button" class="excel-import-close-btn" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button>',
      '  </header>',
      '  <div class="excel-import-body">',
      '    <div class="excel-import-source-box" role="radiogroup" aria-label="Nguồn dữ liệu">',
      '      <label class="excel-import-source-option"><input type="radio" name="import_source" value="FILE" checked><span><span class="material-symbols-outlined" aria-hidden="true">table_view</span>Từ file Excel</span></label>',
      '      <label class="excel-import-source-option"><input type="radio" name="import_source" value="CLIPBOARD"><span><span class="material-symbols-outlined" aria-hidden="true">content_paste</span>Từ clipboard</span></label>',
      '    </div>',
      '    <div class="excel-import-source-panel excel-import-file-panel">',
      '      <label class="excel-import-dropzone" tabindex="0">',
      '        <span class="material-symbols-outlined excel-import-dropzone-icon">cloud_upload</span>',
      '        <span class="excel-import-dropzone-text">Chọn file Excel</span>',
      '        <span class="excel-import-dropzone-subtext">hoặc kéo thả vào đây · định dạng .xlsx</span>',
      '        <input class="excel-import-file-input" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>',
      '      </label>',
      '    </div>',
      '    <div class="excel-import-source-panel excel-import-clipboard-panel" hidden>',
      '      <div class="excel-import-paste-help"><span class="material-symbols-outlined">content_paste</span><span>Mở Excel, copy vùng dữ liệu rồi dán vào vùng bên dưới.</span></div>',
      '      <button type="button" class="excel-import-paste-zone">',
      '        <span class="material-symbols-outlined">content_paste_go</span>',
      '        <strong>Nhấn Ctrl + V để dán dữ liệu</strong>',
      '        <small>Hỗ trợ dán vùng dữ liệu lớn từ Excel.</small>',
      '      </button>',
      '    </div>',
      '    <div class="excel-import-file-badge" hidden>',
      '      <span class="material-symbols-outlined excel-import-file-icon" aria-hidden="true">description</span>',
      '      <div class="excel-import-file-details">',
      '        <span class="excel-import-file-name"></span>',
      '        <small><span class="excel-import-file-size"></span><span class="excel-import-file-type" hidden>Tệp Excel</span></small>',
      '      </div>',
      '      <button type="button" class="excel-import-replace-file" hidden><span class="material-symbols-outlined" aria-hidden="true">sync</span>Chọn file khác</button>',
      '    </div>',
      '    <div class="excel-import-upload-progress" hidden>',
      '      <div><span class="excel-import-progress-label">' + USER_TEXT.sending + '</span><span class="excel-import-progress-percent">0%</span></div>',
      '      <div class="excel-import-progress-track"><span></span></div>',
      '    </div>',
      '    <div class="excel-import-banner excel-import-banner-info" role="status" aria-live="polite">',
      '      <span class="material-symbols-outlined">info</span><div class="excel-import-status">' + USER_TEXT.preparing + '</div>',
      '    </div>',
      '    <div class="excel-import-config" hidden>',
      '      <div class="excel-import-config-grid">',
      '        <div class="excel-import-field"><label for="excel-import-sheet">Nguồn dữ liệu</label><select id="excel-import-sheet" class="excel-import-sheet"></select></div>',
      '        <div class="excel-import-field"><label for="excel-import-header-row">Tiêu đề các cột</label><select id="excel-import-header-row" class="excel-import-header-row"></select></div>',
      '        <div class="excel-import-field"><label for="excel-import-mapping-mode">Cách ghép cột</label><select id="excel-import-mapping-mode" class="excel-import-mapping-mode"><option value="HEADER">Tự nhận diện theo tiêu đề</option><option value="TABLE_ORDER">Theo thứ tự trên bảng</option></select></div>',
      '      </div>',
      '      <div class="excel-import-mapping-toolbar">',
      '        <label class="excel-import-checkbox-label"><input type="checkbox" class="excel-import-toggle-mapping"><span>Điều chỉnh cột</span></label>',
      '        <span class="excel-import-row-count"></span>',
      '      </div>',
      '      <div class="excel-import-mapping-summary"></div>',
      '      <div class="excel-import-mapping-list" hidden></div>',
      '      <section class="excel-import-preview-section">',
      '        <div class="excel-import-preview-heading">',
      '          <div>',
      '            <h4 class="excel-import-section-title">Xem trước dữ liệu</h4>',
      '            <p>Kiểm tra nội dung trước khi lưu</p>',
      '          </div>',
      '          <span class="excel-import-preview-count"></span>',
      '        </div>',
      '        <div class="excel-import-table-wrapper"><table class="excel-import-table excel-import-preview" aria-label="Bản xem trước dữ liệu"></table></div>',
      '      </section>',
      '    </div>',
      '    <div class="excel-import-result" hidden></div>',
      '  </div>',
      '  <footer class="excel-import-footer">',
      '    <button type="button" class="excel-import-btn excel-import-btn-cancel">Hủy</button>',
      '    <button type="button" class="excel-import-btn excel-import-btn-submit" disabled><span class="material-symbols-outlined">upload_file</span> Lấy dữ liệu</button>',
      '  </footer>',
      '</section>'
    ].join('');

    var card = backdrop.querySelector('.excel-import-card');
    var subtitle = backdrop.querySelector('#excel-import-subtitle');
    var closeButton = backdrop.querySelector('.excel-import-close-btn');
    var cancelButton = backdrop.querySelector('.excel-import-btn-cancel');
    var submitButton = backdrop.querySelector('.excel-import-btn-submit');
    var sourceBox = backdrop.querySelector('.excel-import-source-box');
    var sourceRadios = backdrop.querySelectorAll('input[name="import_source"]');
    var filePanel = backdrop.querySelector('.excel-import-file-panel');
    var clipboardPanel = backdrop.querySelector('.excel-import-clipboard-panel');
    var fileInput = backdrop.querySelector('.excel-import-file-input');
    var dropzone = backdrop.querySelector('.excel-import-dropzone');
    var pasteZone = backdrop.querySelector('.excel-import-paste-zone');
    var fileBadge = backdrop.querySelector('.excel-import-file-badge');
    var fileName = backdrop.querySelector('.excel-import-file-name');
    var fileSize = backdrop.querySelector('.excel-import-file-size');
    var fileType = backdrop.querySelector('.excel-import-file-type');
    var replaceFileButton = backdrop.querySelector('.excel-import-replace-file');
    var uploadProgress = backdrop.querySelector('.excel-import-upload-progress');
    var progressLabel = backdrop.querySelector('.excel-import-progress-label');
    var progressPercent = backdrop.querySelector('.excel-import-progress-percent');
    var progressFill = backdrop.querySelector('.excel-import-progress-track span');
    var banner = backdrop.querySelector('.excel-import-banner');
    var status = backdrop.querySelector('.excel-import-status');
    var configSection = backdrop.querySelector('.excel-import-config');
    var resultSection = backdrop.querySelector('.excel-import-result');
    var sheetSelect = backdrop.querySelector('.excel-import-sheet');
    var headerRowSelect = backdrop.querySelector('.excel-import-header-row');
    var mappingModeSelect = backdrop.querySelector('.excel-import-mapping-mode');
    var toggleMapping = backdrop.querySelector('.excel-import-toggle-mapping');
    var mappingSummary = backdrop.querySelector('.excel-import-mapping-summary');
    var mappingList = backdrop.querySelector('.excel-import-mapping-list');
    var rowCount = backdrop.querySelector('.excel-import-row-count');
    var previewTable = backdrop.querySelector('.excel-import-preview');
    var previewCount = backdrop.querySelector('.excel-import-preview-count');

    subtitle.textContent = text(config.formTitle || formName);

    function endpoint(pathName) {
      return apiBase + '/api/excel-import' + pathName;
    }

    function selectedSource() {
      var selected = backdrop.querySelector('input[name="import_source"]:checked');
      return selected ? selected.value : SOURCE_FILE;
    }

    function showSelectedSourcePanel() {
      var sourceType = selectedSource();
      filePanel.hidden = sourceType !== SOURCE_FILE;
      clipboardPanel.hidden = sourceType !== SOURCE_CLIPBOARD;
    }

    function setSourceInputsDisabled(disabled) {
      fileInput.disabled = disabled;
      pasteZone.disabled = disabled;
      replaceFileButton.disabled = disabled;
      sourceRadios.forEach(function (radio) { radio.disabled = disabled; });
    }

    function setBusy(busy, label) {
      state.busy = busy;
      if (busy) {
        cancelButton.textContent = 'Hủy xử lý';
      } else {
        cancelButton.textContent = state.executed ? 'Đóng' : 'Hủy';
      }
      setSourceInputsDisabled(busy || !state.capabilities);
      sheetSelect.disabled = busy;
      headerRowSelect.disabled = busy;
      mappingModeSelect.disabled = busy || !state.hasColumnLayout;
      closeButton.disabled = busy;
      mappingList.querySelectorAll('select').forEach(function (select) { select.disabled = busy; });
      submitButton.disabled = busy || !canSubmit();
      submitButton.innerHTML = busy
        ? '<span class="material-symbols-outlined excel-import-spin">progress_activity</span>' + text(label || 'Đang xử lý...')
        : '<span class="material-symbols-outlined">save</span> ' + USER_TEXT.saveAction + ' ' + formatNumber(selectedDataRows()) + ' dòng';
    }

    function setStatus(kind, message) {
      banner.hidden = false;
      banner.className = 'excel-import-banner excel-import-banner-' + kind;
      banner.querySelector('.material-symbols-outlined').textContent = kind === 'error'
        ? 'error'
        : kind === 'success' ? 'check_circle' : 'info';
      status.textContent = message;
    }

    function hideStatus() {
      banner.hidden = true;
      status.textContent = '';
    }

    function selectedSheet() {
      if (!state.prepared) return null;
      return state.prepared.sheets.find(function (sheet) {
        return sheet.name === sheetSelect.value;
      }) || state.prepared.sheets[0] || null;
    }

    function selectedDataRows() {
      var sheet = selectedSheet();
      if (!sheet) return 0;
      var headerRows = Math.max(0, Number(headerRowSelect.value || 0));
      return Math.max(0, Number(sheet.estimatedRows || 0) - headerRows);
    }

    function headers() {
      var sheet = selectedSheet();
      if (!sheet) return [];
      var headerRow = Number(headerRowSelect.value || 0);
      if (headerRow === 0) {
        var firstRow = (sheet.preview || []).find(function (row) {
          return Array.isArray(row) && row.some(function (value) { return text(value).trim(); });
        }) || [];
        return firstRow.map(function (_value, index) { return 'Cột ' + (index + 1); });
      }
      return Array.isArray(sheet.preview[headerRow - 1]) ? sheet.preview[headerRow - 1] : [];
    }

    function usesTableOrderMapping() {
      return Number(headerRowSelect.value || 0) === 0
        || mappingModeSelect.value === 'TABLE_ORDER';
    }

    function currentMapping() {
      var output = {};
      mappingList.querySelectorAll('.excel-import-mapping-row').forEach(function (row) {
        var source = row.getAttribute('data-source') || '';
        var target = row.querySelector('select').value;
        if (source && target) output[source] = target;
      });
      return output;
    }

    function mappingState() {
      var current = currentMapping();
      var targetNames = Object.keys(current).map(function (source) { return current[source]; });
      var duplicates = targetNames.filter(function (name, index) {
        return targetNames.indexOf(name) !== index;
      });
      var requiredMissing = (state.prepared ? state.prepared.fields : []).filter(function (field) {
        return field.required === true && targetNames.indexOf(field.name) === -1;
      });
      return {
        count: targetNames.length,
        duplicates: duplicates,
        requiredMissing: requiredMissing
      };
    }

    function initialMapping(sourceHeaders, byTableOrder) {
      var output = {};
      sourceHeaders.forEach(function (source, index) {
        source = text(source).trim();
        if (!source) return;
        var targetName = byTableOrder
          ? (state.positionalFields[index] ? state.positionalFields[index].name : '')
          : autoMatch(source, state.orderedFields);
        if (targetName) output[source] = targetName;
      });
      return output;
    }

    function orderedSourceColumns(sourceHeaders, mapping, preserveSourceOrder) {
      if (!preserveSourceOrder
        && state.hasColumnLayout
        && window.TableColumnLayout
        && typeof TableColumnLayout.orderMappedSources === 'function') {
        return TableColumnLayout.orderMappedSources(
          sourceHeaders,
          mapping,
          state.orderedFields
        );
      }
      return sourceHeaders.map(function (header, sourceIndex) {
        return {
          header: text(header).trim(),
          sourceIndex: sourceIndex,
          targetName: mapping[text(header).trim()] || ''
        };
      });
    }

    function canSubmit() {
      if (!state.importId || !state.prepared || state.executed) return false;
      var check = mappingState();
      return check.count > 0 && check.duplicates.length === 0 && check.requiredMissing.length === 0;
    }

    function renderPreview() {
      previewTable.innerHTML = '';
      previewCount.textContent = '';
      var sheet = selectedSheet();
      if (!sheet) return;
      var allHeaders = headers();
      var previewColumns = orderedSourceColumns(
        allHeaders,
        currentMapping(),
        usesTableOrderMapping()
      ).filter(function (column) {
        return column.header;
      }).slice(0, PREVIEW_COLUMN_LIMIT);
      if (!previewColumns.length) {
        var emptyRow = document.createElement('tr');
        var emptyCell = document.createElement('td');
        emptyCell.textContent = 'Dòng tiêu đề đang chọn không có dữ liệu.';
        emptyRow.appendChild(emptyCell);
        previewTable.appendChild(emptyRow);
        return;
      }

      var thead = document.createElement('thead');
      var headingRow = document.createElement('tr');
      var headerIndex = Number(headerRowSelect.value || 0) - 1;
      var previewRows = (sheet.preview || []).slice(Math.max(0, headerIndex + 1));
      var numericColumns = {};
      previewColumns.forEach(function (column) {
        var index = column.sourceIndex;
        var populatedValues = previewRows.map(function (row) { return row[index]; }).filter(function (value) {
          return text(value).trim() !== '';
        });
        numericColumns[index] = populatedValues.length > 0 && populatedValues.every(function (value) {
          if (typeof value === 'number') return Number.isFinite(value);
          return /^[-+]?(?:\d{1,3}(?:[.,\s]\d{3})+|\d+)(?:[.,]\d+)?$/.test(text(value).trim());
        });
        var th = document.createElement('th');
        th.textContent = column.header || ('Cột ' + (index + 1));
        th.scope = 'col';
        th.title = th.textContent;
        if (numericColumns[index]) th.classList.add('is-numeric');
        headingRow.appendChild(th);
      });
      thead.appendChild(headingRow);
      previewTable.appendChild(thead);

      var tbody = document.createElement('tbody');
      previewRows.forEach(function (row) {
        var tr = document.createElement('tr');
        previewColumns.forEach(function (column) {
          var index = column.sourceIndex;
          var td = document.createElement('td');
          td.textContent = text(row[index]);
          td.title = td.textContent;
          if (numericColumns[index]) td.classList.add('is-numeric');
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      previewTable.appendChild(tbody);
      previewCount.textContent = formatNumber(previewRows.length) + ' dòng mẫu';

      if (allHeaders.filter(function (item) { return text(item).trim(); }).length > PREVIEW_COLUMN_LIMIT) {
        var caption = document.createElement('caption');
        caption.textContent = 'Đang hiển thị ' + PREVIEW_COLUMN_LIMIT + ' cột đầu. Các cột còn lại vẫn được lưu.';
        previewTable.appendChild(caption);
      }
    }

    function renderMapping() {
      mappingList.innerHTML = '';
      var sourceHeaders = headers();
      var fields = state.orderedFields;
      var byTableOrder = usesTableOrderMapping();
      var mapping = initialMapping(sourceHeaders, byTableOrder);
      var sourceColumns = orderedSourceColumns(sourceHeaders, mapping, byTableOrder);

      sourceColumns.forEach(function (sourceColumn) {
        var source = sourceColumn.header;
        var index = sourceColumn.sourceIndex;
        if (!source) return;
        var row = document.createElement('div');
        row.className = 'excel-import-mapping-row';
        row.setAttribute('data-source', source);
        row.setAttribute('data-source-index', String(index));

        var sourceBox = document.createElement('div');
        sourceBox.innerHTML = '<small>Cột nguồn ' + (index + 1) + '</small>';
        var sourceName = document.createElement('strong');
        sourceName.textContent = source;
        sourceBox.appendChild(sourceName);

        var arrow = document.createElement('span');
        arrow.className = 'material-symbols-outlined';
        arrow.textContent = 'arrow_forward';

        var select = document.createElement('select');
        select.setAttribute('aria-label', 'Trường đích cho ' + source);
        var skipOption = document.createElement('option');
        skipOption.value = '';
        skipOption.textContent = 'Bỏ qua cột này';
        select.appendChild(skipOption);
        fields.forEach(function (field) {
          var option = document.createElement('option');
          option.value = field.name;
          option.textContent = (field.uiLabel || field.label || field.name)
            + ' (' + field.name + ')' + (field.required ? ' *' : '');
          select.appendChild(option);
        });
        select.value = mapping[source] || '';
        select.addEventListener('change', updateMappingSummary);

        row.appendChild(sourceBox);
        row.appendChild(arrow);
        row.appendChild(select);
        mappingList.appendChild(row);
      });
      updateMappingSummary();
      renderPreview();
    }

    function updateMappingSummary() {
      var check = mappingState();
      mappingSummary.className = 'excel-import-mapping-summary';
      if (check.duplicates.length) {
        mappingSummary.classList.add('is-error');
        mappingSummary.textContent = 'Có cột đang được chọn lặp lại. Vui lòng kiểm tra.';
      } else if (check.requiredMissing.length) {
        mappingSummary.classList.add('is-warning');
        mappingSummary.textContent = 'Vui lòng chọn dữ liệu cho: ' + check.requiredMissing.map(function (field) {
          return field.label || field.name;
        }).join(', ');
      } else if (check.count === 0) {
        mappingSummary.classList.add('is-error');
        mappingSummary.textContent = 'Chưa xác định được cột dữ liệu. Vui lòng mở “Điều chỉnh cột”.';
      } else {
        mappingSummary.classList.add('is-ready');
        mappingSummary.textContent = 'Đã nhận diện ' + check.count + ' cột. ' + USER_TEXT.ready;
        if (!usesTableOrderMapping() && state.hasColumnLayout) {
          mappingSummary.textContent += ' Bản xem trước được sắp xếp giống bảng hiện tại.';
        } else if (usesTableOrderMapping() && state.hasColumnLayout) {
          mappingSummary.textContent += ' Dữ liệu được ghép theo thứ tự trên bảng.';
        }
      }

      var needsAttention = check.count === 0 || check.duplicates.length > 0 || check.requiredMissing.length > 0;
      if (needsAttention) toggleMapping.checked = true;
      mappingList.hidden = !toggleMapping.checked;
      rowCount.textContent = formatNumber(selectedDataRows()) + ' dòng dữ liệu';
      submitButton.disabled = state.busy || !canSubmit();
      if (!state.busy) {
        submitButton.innerHTML = '<span class="material-symbols-outlined">save</span> ' + USER_TEXT.saveAction + ' '
          + formatNumber(selectedDataRows()) + ' dòng';
      }
    }

    function buildHeaderOptions(response) {
      headerRowSelect.innerHTML = '';
      var noHeader = document.createElement('option');
      noHeader.value = '0';
      noHeader.textContent = 'Không có tiêu đề';
      headerRowSelect.appendChild(noHeader);

      var maxHeaderRow = Number(response.limits && response.limits.maxHeaderRow) || 1;
      for (var row = 1; row <= maxHeaderRow; row += 1) {
        var option = document.createElement('option');
        option.value = String(row);
        option.textContent = 'Dòng ' + row;
        headerRowSelect.appendChild(option);
      }
      headerRowSelect.value = '1';
    }

    function renderPrepared(response) {
      var arranged = window.TableColumnLayout
        && typeof TableColumnLayout.arrangeFields === 'function'
        ? TableColumnLayout.arrangeFields(response.fields, config.columnLayout)
        : {
          all: Array.isArray(response.fields) ? response.fields : [],
          positional: Array.isArray(response.fields) ? response.fields : [],
          hasLayout: false
        };
      state.orderedFields = arranged.all;
      state.positionalFields = arranged.positional;
      state.hasColumnLayout = arranged.hasLayout === true;
      state.prepared = Object.assign({}, response, { fields: state.orderedFields });
      state.importId = response.importId;
      state.executed = false;
      state.sourceType = response.sourceType;
      card.classList.add('is-prepared');
      resultSection.hidden = true;
      resultSection.innerHTML = '';
      configSection.hidden = false;
      filePanel.hidden = true;
      clipboardPanel.hidden = true;
      uploadProgress.hidden = true;
      sheetSelect.innerHTML = '';
      mappingModeSelect.value = 'HEADER';
      mappingModeSelect.disabled = !state.hasColumnLayout;
      response.sheets.forEach(function (sheet) {
        var option = document.createElement('option');
        option.value = sheet.name;
        option.textContent = sheet.name + ' — khoảng ' + formatNumber(sheet.estimatedRows) + ' dòng';
        sheetSelect.appendChild(option);
      });
      buildHeaderOptions(response);
      renderMapping();
      hideStatus();
      setBusy(false);
    }

    function renderErrors(payload) {
      resultSection.classList.remove('is-success');
      resultSection.innerHTML = '';
      resultSection.hidden = false;
      var heading = document.createElement('h4');
      heading.textContent = payload.message || 'Dữ liệu chưa thể lưu. Vui lòng kiểm tra lại.';
      resultSection.appendChild(heading);

      if (payload.summary) {
        var summary = document.createElement('p');
        summary.textContent = 'Tổng dòng: ' + formatNumber(payload.summary.totalRows)
          + ' · Hợp lệ: ' + formatNumber(payload.summary.validRows)
          + ' · Không hợp lệ: ' + formatNumber(payload.summary.invalidRows);
        resultSection.appendChild(summary);
      }
      if (Array.isArray(payload.errors) && payload.errors.length) {
        var list = document.createElement('div');
        list.className = 'excel-import-error-list';
        payload.errors.forEach(function (item) {
          var row = document.createElement('div');
          row.innerHTML = '<strong></strong><span></span>';
          row.querySelector('strong').textContent = item.row ? ('Dòng ' + item.row) : 'Cột dữ liệu';
          row.querySelector('span').textContent = (item.field ? item.field + ': ' : '') + text(item.message);
          list.appendChild(row);
        });
        resultSection.appendChild(list);
      }
      if (payload.errorsTruncated) {
        var note = document.createElement('small');
        note.textContent = 'Danh sách lỗi đã được rút gọn. Sửa các lỗi mẫu rồi thử lại.';
        resultSection.appendChild(note);
      }
    }

    function renderSuccess(response) {
      var summary = response.summary || {};
      var savedRows = Number(summary.insertedRows);
      if (!Number.isFinite(savedRows)) savedRows = Number(summary.totalRows);
      var message = Number.isFinite(savedRows) && savedRows > 0
        ? 'Đã lưu thành công ' + formatNumber(savedRows) + ' dòng dữ liệu.'
        : 'Dữ liệu đã được lưu thành công.';

      backdrop.remove();
      if (typeof Alert !== 'undefined' && typeof Alert.success === 'function') {
        Alert.success('Thành công', message);
      } else if (typeof UIToast !== 'undefined' && typeof UIToast.show === 'function') {
        UIToast.show(message, 'success');
      }
    }

    async function discardImport() {
      if (!state.importId || state.executed) return;
      var importId = state.importId;
      state.importId = '';
      try {
        await ApiClient.delete(endpoint('/' + encodeURIComponent(importId)), {
          headers: requestHeaders,
          logoutOnUnauthorized: false
        });
      } catch (error) {
        console.warn('[ExcelImport] Không thể dọn phiên import:', error && error.message);
      }
    }

    function clearPrepared() {
      state.prepared = null;
      state.orderedFields = [];
      state.positionalFields = [];
      state.hasColumnLayout = false;
      mappingModeSelect.value = 'HEADER';
      mappingModeSelect.disabled = true;
      state.importId = '';
      state.executed = false;
      card.classList.remove('is-prepared');
      configSection.hidden = true;
      resultSection.hidden = true;
      resultSection.innerHTML = '';
      resultSection.classList.remove('is-success');
      sourceBox.hidden = false;
      fileBadge.hidden = true;
      fileInput.value = '';
      uploadProgress.hidden = true;
      showSelectedSourcePanel();
      submitButton.hidden = false;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="material-symbols-outlined">upload_file</span> Lấy dữ liệu';
    }

    async function closeModal() {
      if (state.controller) state.controller.abort();
      await discardImport();
      backdrop.remove();
    }

    async function switchSource() {
      if (state.busy) return;
      var nextSource = selectedSource();
      if (state.prepared && state.sourceType !== nextSource) {
        await discardImport();
        clearPrepared();
      }
      state.sourceType = nextSource;
      showSelectedSourcePanel();
      if (!state.prepared) {
        hideStatus();
      }
      if (nextSource === SOURCE_CLIPBOARD) pasteZone.focus();
      else dropzone.focus();
    }

    async function prepareSource(file, sourceType, displayName) {
      if (!file || state.busy || !state.capabilities) return;
      var limits = state.capabilities.limits || {};
      if (limits.maxFileBytes && file.size > limits.maxFileBytes) {
        setStatus('error', 'Dữ liệu vượt giới hạn ' + formatBytes(limits.maxFileBytes) + '.');
        return;
      }
      if (sourceType === SOURCE_FILE && !/\.xlsx$/i.test(displayName || file.name || '')) {
        setStatus('error', 'Chỉ hỗ trợ .xlsx không có macro. Hãy lưu lại file rồi thử lại.');
        return;
      }

      await discardImport();
      clearPrepared();
      state.sourceType = sourceType;
      state.controller = new AbortController();
      fileBadge.hidden = false;
      fileName.textContent = displayName || file.name || 'Clipboard';
      fileName.title = fileName.textContent;
      fileSize.textContent = formatBytes(file.size);
      fileType.hidden = sourceType !== SOURCE_FILE;
      replaceFileButton.hidden = sourceType !== SOURCE_FILE;
      uploadProgress.hidden = false;
      progressFill.style.width = '0%';
      progressPercent.textContent = '0%';
      setBusy(true, sourceType === SOURCE_CLIPBOARD ? 'Đang nhận dữ liệu đã dán...' : USER_TEXT.sending);
      setStatus('info', USER_TEXT.readingHelp);

      var formData = new FormData();
      formData.append('formName', formName);
      formData.append('sourceType', sourceType);
      formData.append('file', file, sourceType === SOURCE_CLIPBOARD ? 'clipboard.tsv' : (displayName || file.name));
      try {
        var response = await ApiClient.upload(endpoint('/prepare'), formData, {
          headers: requestHeaders,
          signal: state.controller.signal,
          onProgress: function (loaded, total) {
            var percent = total > 0 ? Math.min(100, Math.round(loaded * 100 / total)) : 0;
            progressFill.style.width = percent + '%';
            progressPercent.textContent = percent + '%';
            progressLabel.textContent = percent >= 100 ? USER_TEXT.reading : USER_TEXT.sending;
          }
        });
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        renderPrepared(response);
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        var payload = errorPayload(error);
        setStatus('error', payload.message);
        clearPrepared();
        resultSection.hidden = false;
        renderErrors(payload);
      } finally {
        state.controller = null;
        setBusy(false);
      }
    }

    async function handlePaste(event) {
      if (selectedSource() !== SOURCE_CLIPBOARD || state.busy) return;
      var clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData) return;
      var pastedText = clipboardData.getData('text/plain') || clipboardData.getData('text');
      if (!pastedText || !pastedText.trim()) return;
      event.preventDefault();
      var blob = new Blob([pastedText], { type: 'text/tab-separated-values' });
      await prepareSource(blob, SOURCE_CLIPBOARD, 'Dữ liệu từ clipboard');
    }

    async function executeImport() {
      if (!canSubmit() || state.busy) return;
      state.controller = new AbortController();
      setBusy(true, USER_TEXT.saving);
      setStatus(
        'info',
        USER_TEXT.savingHelp
      );
      resultSection.hidden = true;
      try {
        var response = await ApiClient.post(
          endpoint('/' + encodeURIComponent(state.importId) + '/execute'),
          {
            formName: formName,
            sheetName: sheetSelect.value,
            headerRow: Number(headerRowSelect.value),
            mapping: currentMapping(),
            mode: state.prepared.mode || 'INSERT_ONLY'
          },
          { headers: requestHeaders, signal: state.controller.signal }
        );
        state.executed = true;
        renderSuccess(response);
        if (!state.successNotified && typeof config.onSuccess === 'function') {
          state.successNotified = true;
          config.onSuccess(response.summary || {});
        }
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        var payload = errorPayload(error);
        setStatus('error', payload.message);
        renderErrors(payload);
        if (payload.code !== 'EXCEL_IMPORT_BUSY') {
          state.importId = '';
          configSection.hidden = true;
        }
      } finally {
        state.controller = null;
        setBusy(false);
      }
    }

    async function cancelOrClose() {
      if (!state.busy) {
        await closeModal();
        return;
      }
      if (state.controller) state.controller.abort();
      await discardImport();
      state.controller = null;
      setBusy(false);
      clearPrepared();
      setStatus('info', 'Đã dừng thao tác. Bạn có thể chọn lại nguồn dữ liệu.');
    }

    async function loadCapabilities() {
      setSourceInputsDisabled(true);
      try {
        var response = await ApiClient.get(
          endpoint('/capabilities?formName=' + encodeURIComponent(formName)),
          { headers: requestHeaders, logoutOnUnauthorized: false }
        );
        state.capabilities = response;
        setSourceInputsDisabled(false);
        hideStatus();
      } catch (error) {
        var payload = errorPayload(error);
        state.capabilities = null;
        setStatus('error', payload.message);
        resultSection.hidden = true;
        submitButton.disabled = true;
      }
    }

    sourceRadios.forEach(function (radio) { radio.addEventListener('change', switchSource); });
    toggleMapping.addEventListener('change', function () {
      mappingList.hidden = !toggleMapping.checked;
    });
      sheetSelect.addEventListener('change', renderMapping);
      headerRowSelect.addEventListener('change', renderMapping);
      mappingModeSelect.addEventListener('change', renderMapping);
    submitButton.addEventListener('click', executeImport);
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', cancelOrClose);

    function openFilePicker() {
      if (state.busy || !state.capabilities) return;
      fileInput.value = '';
      fileInput.click();
    }

    fileInput.addEventListener('change', function () {
      var selectedFile = fileInput.files[0];
      prepareSource(selectedFile, SOURCE_FILE, selectedFile && selectedFile.name);
    });
    replaceFileButton.addEventListener('click', openFilePicker);
    dropzone.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFilePicker();
      }
    });
    dropzone.addEventListener('dragover', function (event) {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', function (event) {
      event.preventDefault();
      dropzone.classList.remove('dragover');
      var file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
      prepareSource(file, SOURCE_FILE, file && file.name);
    });
    pasteZone.addEventListener('click', function () { pasteZone.focus(); });
    backdrop.addEventListener('paste', handlePaste);
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop && !state.busy) closeModal();
    });
    backdrop.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !state.busy) closeModal();
    });

    document.body.appendChild(backdrop);
    card.focus();
    loadCapabilities();
  }

  return Object.freeze({ show: show });
})();
