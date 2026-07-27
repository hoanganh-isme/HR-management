/**
 * ExcelImportModal.js - Component Import Excel với Kiểm tra Cấu trúc Cột & Kiểu Dữ liệu
 */
window.ExcelImportModal = (function () {
  'use strict';

  var activeModalElement = null;
  var currentWorkbook = null;
  var currentFile = null;
  var validationResult = { isValid: false, columnErrors: [], rowErrors: [], parsedRows: [] };

  function _normalizeText(str) {
    if (str == null) return '';
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\*\:]+$/, ''); // Bỏ ký tự dấu sao bắt buộc hoặc hai chấm ở cuối tên cột
  }

  function _formatDateVal(rawVal) {
    if (rawVal == null || rawVal === '') return '';

    if (rawVal instanceof Date) {
      if (isNaN(rawVal.getTime())) return null;
      var y = rawVal.getFullYear();
      var m = String(rawVal.getMonth() + 1).padStart(2, '0');
      var d = String(rawVal.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    var str = String(rawVal).trim();
    // Dạng DD/MM/YYYY hoặc DD-MM-YYYY
    var matchDmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (matchDmy) {
      var day = parseInt(matchDmy[1], 10);
      var month = parseInt(matchDmy[2], 10);
      var year = parseInt(matchDmy[3], 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      return null;
    }

    // Dạng YYYY-MM-DD hoặc YYYY/MM/DD
    var matchYmd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (matchYmd) {
      var year = parseInt(matchYmd[1], 10);
      var month = parseInt(matchYmd[2], 10);
      var day = parseInt(matchYmd[3], 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      return null;
    }

    // Parse thử bằng Date constructor
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      var y = parsed.getFullYear();
      var m = String(parsed.getMonth() + 1).padStart(2, '0');
      var d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return null;
  }

  /**
   * Thực hiện kiểm tra toàn bộ file Excel so với cấu hình webColumns
   */
  function _validateExcelData(rawRows, webColumns, headerRowIdx, dataStartRowIdx) {
    var columnErrors = [];
    var rowErrors = [];
    var parsedRows = [];

    if (!rawRows || rawRows.length === 0) {
      return {
        isValid: false,
        columnErrors: ['File Excel rỗng hoặc không chứa dữ liệu.'],
        rowErrors: [],
        parsedRows: []
      };
    }

    var headerRowZeroIdx = headerRowIdx - 1;
    if (headerRowZeroIdx < 0 || headerRowZeroIdx >= rawRows.length) {
      return {
        isValid: false,
        columnErrors: [`Dòng tiêu đề (Dòng ${headerRowIdx}) nằm ngoài phạm vi số dòng file Excel (Tổng ${rawRows.length} dòng).`],
        rowErrors: [],
        parsedRows: []
      };
    }

    var rawHeader = rawRows[headerRowZeroIdx] || [];
    var excelHeaders = [];
    for (var i = 0; i < rawHeader.length; i++) {
      excelHeaders.push(String(rawHeader[i] || '').trim());
    }
    while (excelHeaders.length > 0 && excelHeaders[excelHeaders.length - 1] === '') {
      excelHeaders.pop();
    }

    var webColsCount = webColumns.length;
    var excelColsCount = excelHeaders.length;

    // Chỉ kiểm tra THIẾU CỘT (Nếu file Excel ít cột hơn số cột hiển thị trên Web)
    if (excelColsCount < webColsCount) {
      var missingCols = webColumns.slice(excelColsCount).map(function (c) { return `Cột ${c.colIdx || ''} ("${c.title}")`; }).join(', ');
      columnErrors.push(`Lỗi thiếu cột: File Excel chỉ có ${excelColsCount} cột, nhưng bảng Web cần ${webColsCount} cột dữ liệu theo thứ tự. (Thiếu từ: ${missingCols})`);
    }

    // ĐỌC DỮ LIỆU THEO VỊ TRÍ CỘT 1, 2, 3... TƯƠNG ỨNG VỚI CÁC CỘT WEB (BỎ QUA KIỂM TRA CHUỖI TIÊU ĐỀ)
    var dataStartZeroIdx = dataStartRowIdx - 1;
    if (dataStartZeroIdx < rawRows.length) {
      for (var r = dataStartZeroIdx; r < rawRows.length; r++) {
        var rowData = rawRows[r] || [];
        var excelRowNumber = r + 1;

        // Bỏ qua dòng rỗng hoàn toàn
        var isRowBlank = true;
        for (var k = 0; k < rowData.length; k++) {
          if (rowData[k] !== undefined && rowData[k] !== null && String(rowData[k]).trim() !== '') {
            isRowBlank = false;
            break;
          }
        }
        if (isRowBlank) continue;

        var rowObj = {};
        for (var c = 0; c < webColsCount; c++) {
          var colDef = webColumns[c];
          var fieldName = colDef.field;
          var fieldTitle = colDef.title || fieldName;
          var fieldType = String(colDef.type || colDef.fieldType || 'string').toLowerCase();
          var isRequired = colDef.isRequired === true || colDef.required === true;

          // Tự động nhận diện trường Kiểu Số nếu tên trường/tiêu đề chứa các từ khóa số
          var fLower = (fieldName + ' ' + fieldTitle).toLowerCase();
          var isNumericCol = ['number', 'numeric', 'integer', 'int', 'decimal', 'float', 'currency', 'money'].indexOf(fieldType) > -1
            || fLower.indexOf('bac') >= 0 || fLower.indexOf('tu') >= 0 || fLower.indexOf('den') >= 0
            || fLower.indexOf('thue') >= 0 || fLower.indexOf('suat') >= 0 || fLower.indexOf('gia') >= 0
            || fLower.indexOf('tien') >= 0 || fLower.indexOf('amount') >= 0 || fLower.indexOf('rate') >= 0
            || fLower.indexOf('soluong') >= 0 || fLower.indexOf('so') >= 0 || fLower.indexOf('phantram') >= 0;

          var isDateCol = ['date', 'datetime'].indexOf(fieldType) > -1 || fLower.indexOf('ngay') >= 0 || fLower.indexOf('date') >= 0;
          var isBoolCol = ['boolean', 'bit', 'checkbox'].indexOf(fieldType) > -1;

          var cellRaw = rowData[c];
          var cellStr = (cellRaw !== undefined && cellRaw !== null) ? String(cellRaw).trim() : '';

          // A. Bắt buộc
          if (isRequired && cellStr === '') {
            rowErrors.push({
              row: excelRowNumber,
              colIdx: c + 1,
              colTitle: fieldTitle,
              expectedType: 'Bắt buộc',
              value: '(Để trống)',
              error: 'Dữ liệu không được để trống'
            });
            continue;
          }

          if (cellStr === '') {
            rowObj[fieldName] = null;
            continue;
          }

          // B. Kiểm tra Kiểu Số
          if (isNumericCol) {
            var cleanNumStr = cellStr.replace(/\,/g, '');
            if (cleanNumStr.match(/^\d+\.\d{3}(\.\d{3})*$/)) {
              cleanNumStr = cleanNumStr.replace(/\./g, '');
            }
            cleanNumStr = cleanNumStr.replace(/\s+/g, '');

            var numVal = Number(cleanNumStr);
            if (isNaN(numVal) || !isFinite(numVal)) {
              rowErrors.push({
                row: excelRowNumber,
                colIdx: c + 1,
                colTitle: fieldTitle,
                expectedType: 'Kiểu Số (Numeric)',
                value: cellStr,
                error: 'Dữ liệu "' + cellStr + '" có chứa chữ, không phải là số hợp lệ'
              });
            } else {
              rowObj[fieldName] = numVal;
            }
          }
          // C. Kiểm tra Kiểu Ngày
          else if (isDateCol) {
            var dateFormatted = _formatDateVal(cellRaw);
            if (!dateFormatted) {
              rowErrors.push({
                row: excelRowNumber,
                colIdx: c + 1,
                colTitle: fieldTitle,
                expectedType: 'Kiểu Ngày (Date)',
                value: cellStr,
                error: 'Dữ liệu "' + cellStr + '" không đúng định dạng ngày tháng (Cần DD/MM/YYYY)'
              });
            } else {
              rowObj[fieldName] = dateFormatted;
            }
          }
          // D. Kiểm tra Kiểu Logic
          else if (isBoolCol) {
            var lowerBool = cellStr.toLowerCase();
            if (['1', 'true', 'có', 'co', 'x', 'yes'].indexOf(lowerBool) > -1) {
              rowObj[fieldName] = true;
            } else if (['0', 'false', 'không', 'khong', 'no', 'n'].indexOf(lowerBool) > -1) {
              rowObj[fieldName] = false;
            } else {
              rowErrors.push({
                row: excelRowNumber,
                colIdx: c + 1,
                colTitle: fieldTitle,
                expectedType: 'Kiểu Logic (Boolean)',
                value: cellStr,
                error: 'Dữ liệu "' + cellStr + '" phải là Có/Không hoặc True/False hoặc 1/0'
              });
            }
          }
          // E. Kiểu Chuỗi
          else {
            rowObj[fieldName] = cellStr;
          }
        }

        parsedRows.push(rowObj);
      }
    }

    var isValid = columnErrors.length === 0 && rowErrors.length === 0;

    return {
      isValid: isValid,
      columnErrors: columnErrors,
      rowErrors: rowErrors,
      parsedRows: parsedRows
    };
  }

  function show(options) {
    options = options || {};
    var webColumns = options.webColumns || [];
    var formName = options.formName || 'Form';
    var onConfirmCallback = options.onConfirm;

    if (activeModalElement) activeModalElement.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'excel-import-backdrop';

    var card = document.createElement('div');
    card.className = 'excel-import-card';

    // 1. Header
    card.innerHTML = `
      <div class="excel-import-header">
        <h3><span class="material-symbols-outlined">upload_file</span> Import dữ liệu Excel - ${formName}</h3>
        <button type="button" class="excel-import-close-btn" id="excel-import-close">&times;</button>
      </div>
      <div class="excel-import-body">
        <!-- Configuration Controls -->
        <div class="excel-import-config-grid">
          <div class="excel-import-field">
            <label>Chọn Sheet dữ liệu:</label>
            <select id="excel-import-sheet-select" disabled>
              <option value="">-- Chưa nạp file --</option>
            </select>
          </div>
          <div class="excel-import-field">
            <label>Dòng chứa Tiêu đề cột:</label>
            <input type="number" id="excel-import-header-row" value="1" min="1" max="100">
          </div>
          <div class="excel-import-field">
            <label>Dòng bắt đầu đọc dữ liệu:</label>
            <input type="number" id="excel-import-data-row" value="2" min="1" max="100">
          </div>
        </div>

        <!-- File Dropzone -->
        <div class="excel-import-dropzone" id="excel-import-dropzone">
          <span class="material-symbols-outlined excel-import-dropzone-icon">cloud_upload</span>
          <div class="excel-import-dropzone-text">Kéo thả file Excel (.xlsx, .xls, .csv) vào đây hoặc <span style="color:#4f46e5; text-decoration:underline;">chọn file từ máy tính</span></div>
          <div class="excel-import-dropzone-subtext">Hệ thống sẽ kiểm tra thứ tự cột trên Web (${webColumns.length} cột) và bắt chặn nếu có lỗi dữ liệu.</div>
          <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" style="display:none;">
        </div>

        <!-- Selected File Info -->
        <div class="excel-import-file-badge" id="excel-file-badge" style="display:none;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-outlined">description</span>
            <span id="excel-file-name" style="font-weight:600;">filename.xlsx</span>
            <span id="excel-file-size" style="opacity:0.8; font-size:12px;">(0 KB)</span>
          </div>
          <button type="button" id="excel-file-change-btn" style="background:none; border:none; color:#3730a3; cursor:pointer; font-size:13px; font-weight:600; text-decoration:underline;">Đổi file khác</button>
        </div>

        <!-- Status Banner -->
        <div id="excel-import-status-banner" class="excel-import-banner excel-import-banner-info">
          <span class="material-symbols-outlined">info</span>
          <div>Vui lòng chọn file Excel để bắt đầu kiểm tra tự động.</div>
        </div>

        <!-- Detailed Error / Result Area -->
        <div id="excel-import-result-area"></div>
      </div>

      <!-- Footer Actions -->
      <div class="excel-import-footer">
        <button type="button" class="excel-import-btn excel-import-btn-cancel" id="excel-import-btn-cancel">Hủy bỏ</button>
        <button type="button" class="excel-import-btn excel-import-btn-submit" id="excel-import-btn-submit" disabled>
          <span class="material-symbols-outlined">check_circle</span>
          Xác nhận Import
        </button>
      </div>
    `;

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
    activeModalElement = backdrop;

    // References
    var closeBtn = card.querySelector('#excel-import-close');
    var cancelBtn = card.querySelector('#excel-import-btn-cancel');
    var submitBtn = card.querySelector('#excel-import-btn-submit');
    var dropzone = card.querySelector('#excel-import-dropzone');
    var fileInput = card.querySelector('#excel-file-input');
    var fileBadge = card.querySelector('#excel-file-badge');
    var fileNameEl = card.querySelector('#excel-file-name');
    var fileSizeEl = card.querySelector('#excel-file-size');
    var changeFileBtn = card.querySelector('#excel-file-change-btn');
    var sheetSelect = card.querySelector('#excel-import-sheet-select');
    var headerRowInput = card.querySelector('#excel-import-header-row');
    var dataRowInput = card.querySelector('#excel-import-data-row');
    var statusBanner = card.querySelector('#excel-import-status-banner');
    var resultArea = card.querySelector('#excel-import-result-area');

    function closeModal() {
      if (activeModalElement) {
        activeModalElement.remove();
        activeModalElement = null;
      }
      currentWorkbook = null;
      currentFile = null;
    }

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // Dropzone Events
    dropzone.onclick = function () { fileInput.click(); };
    dropzone.ondragover = function (e) { e.preventDefault(); dropzone.classList.add('dragover'); };
    dropzone.ondragleave = function () { dropzone.classList.remove('dragover'); };
    dropzone.ondrop = function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    };
    fileInput.onchange = function () {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileSelect(fileInput.files[0]);
      }
    };
    changeFileBtn.onclick = function () {
      fileInput.click();
    };

    // Header & Data Row change listeners
    headerRowInput.onchange = function () {
      var hVal = parseInt(headerRowInput.value, 10) || 1;
      if (hVal < 1) hVal = 1;
      headerRowInput.value = hVal;

      var dVal = parseInt(dataRowInput.value, 10) || 2;
      if (dVal <= hVal) {
        dataRowInput.value = hVal + 1;
      }
      reprocessSheetData();
    };

    dataRowInput.onchange = function () {
      var hVal = parseInt(headerRowInput.value, 10) || 1;
      var dVal = parseInt(dataRowInput.value, 10) || 2;
      if (dVal <= hVal) dVal = hVal + 1;
      dataRowInput.value = dVal;
      reprocessSheetData();
    };

    sheetSelect.onchange = function () {
      reprocessSheetData();
    };

    function handleFileSelect(file) {
      if (typeof XLSX === 'undefined') {
        if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Thư viện đọc Excel (SheetJS XLSX) chưa sẵn sàng.');
        return;
      }

      currentFile = file;
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = `(${Math.round(file.size / 1024)} KB)`;
      dropzone.style.display = 'none';
      fileBadge.style.display = 'flex';

      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var data = new Uint8Array(e.target.result);
          currentWorkbook = XLSX.read(data, { type: 'array', cellDates: true });

          sheetSelect.innerHTML = '';
          currentWorkbook.SheetNames.forEach(function (sName) {
            var opt = document.createElement('option');
            opt.value = sName;
            opt.textContent = sName;
            sheetSelect.appendChild(opt);
          });
          sheetSelect.disabled = false;

          reprocessSheetData();
        } catch (err) {
          console.error('Lỗi đọc file Excel:', err);
          renderErrorState(['Không thể đọc nội dung file Excel. File bị hỏng hoặc mã hóa không tương thích.']);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function reprocessSheetData() {
      if (!currentWorkbook) return;

      var selectedSheetName = sheetSelect.value || currentWorkbook.SheetNames[0];
      var sheet = currentWorkbook.Sheets[selectedSheetName];
      if (!sheet) {
        renderErrorState(['Sheet đã chọn không hợp lệ.']);
        return;
      }

      var rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
      var headerRowIdx = parseInt(headerRowInput.value, 10) || 1;
      var dataStartRowIdx = parseInt(dataRowInput.value, 10) || 2;

      validationResult = _validateExcelData(rawRows, webColumns, headerRowIdx, dataStartRowIdx);
      renderValidationResult(validationResult);
    }

    function renderErrorState(columnErrs) {
      validationResult = { isValid: false, columnErrors: columnErrs, rowErrors: [], parsedRows: [] };
      renderValidationResult(validationResult);
    }

    function renderValidationResult(res) {
      resultArea.innerHTML = '';

      if (!res.isValid) {
        submitBtn.disabled = true;
        var totalErrs = res.columnErrors.length + res.rowErrors.length;

        statusBanner.className = 'excel-import-banner excel-import-banner-error';
        statusBanner.innerHTML = `
          <span class="material-symbols-outlined" style="font-size:24px;">error</span>
          <div>
            <strong style="font-size:15px;">❌ BẮT CHẠN IMPORT: Phát hiện ${totalErrs} lỗi trong file Excel!</strong>
            <div style="font-size:13px; margin-top:2px;">Vui lòng sửa các lỗi cấu trúc cột hoặc kiểu dữ liệu dưới đây trước khi thực hiện nạp dữ liệu.</div>
          </div>
        `;

        var errContainer = document.createElement('div');
        errContainer.className = 'excel-import-error-section';

        // A. Cấu trúc Cột
        if (res.columnErrors.length > 0) {
          var colErrBox = document.createElement('div');
          colErrBox.style.cssText = 'background:#fff1f2; border:1px solid #fecdd3; padding:12px 16px; border-radius:8px;';
          var colErrTitle = document.createElement('div');
          colErrTitle.className = 'excel-import-error-title';
          colErrTitle.innerHTML = '<span class="material-symbols-outlined">view_column</span> Lỗi Cấu Trúc Cột (' + res.columnErrors.length + ' lỗi)';
          colErrBox.appendChild(colErrTitle);

          var colUl = document.createElement('ul');
          colUl.style.cssText = 'margin:8px 0 0 20px; padding:0; font-size:13px; color:#9f1239; line-height:1.6;';
          res.columnErrors.forEach(function (errText) {
            var li = document.createElement('li');
            li.textContent = errText;
            colUl.appendChild(li);
          });
          colErrBox.appendChild(colUl);
          errContainer.appendChild(colErrBox);
        }

        // B. Kiểu dữ liệu theo dòng
        if (res.rowErrors.length > 0) {
          var rowErrTitle = document.createElement('div');
          rowErrTitle.className = 'excel-import-error-title';
          rowErrTitle.innerHTML = '<span class="material-symbols-outlined">rule</span> Danh Sách Chi Tiết Lỗi Kiểu Dữ Liệu Dòng (' + res.rowErrors.length + ' lỗi)';
          errContainer.appendChild(rowErrTitle);

          var tableWrapper = document.createElement('div');
          tableWrapper.className = 'excel-import-table-wrapper';

          var tableHtml = `
            <table class="excel-import-table">
              <thead>
                <tr>
                  <th style="width:65px; text-align:center;">Dòng</th>
                  <th style="width:140px;">Vị trí Cột</th>
                  <th style="width:140px;">Kiểu dữ liệu</th>
                  <th style="width:140px;">Dữ liệu nhập (Excel)</th>
                  <th>Mô tả chi tiết Lỗi</th>
                </tr>
              </thead>
              <tbody>
          `;

          res.rowErrors.forEach(function (item) {
            tableHtml += `
              <tr>
                <td style="font-weight:700; text-align:center; color:#b91c1c;">${item.row}</td>
                <td><strong style="color:#1e293b;">Cột ${item.colIdx}</strong> <span style="font-size:11px; color:#64748b;">(${item.colTitle})</span></td>
                <td><span style="font-size:12px; font-weight:600; color:#475569; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${item.expectedType || 'Số/Chuỗi'}</span></td>
                <td class="badge-err-cell" style="font-weight:600; color:#dc2626;">"${item.value}"</td>
                <td style="color:#b91c1c; font-weight:500;">${item.error}</td>
              </tr>
            `;
          });

          tableHtml += `</tbody></table>`;
          tableWrapper.innerHTML = tableHtml;
          errContainer.appendChild(tableWrapper);
        }

        resultArea.appendChild(errContainer);

      } else {
        // HỢP LỆ 100%
        submitBtn.disabled = false;
        var count = res.parsedRows.length;

        statusBanner.className = 'excel-import-banner excel-import-banner-success';
        statusBanner.innerHTML = `
          <span class="material-symbols-outlined" style="font-size:24px;">check_circle</span>
          <div>
            <strong style="font-size:15px;">✅ HỢP LỆ: File Excel hoàn toàn khớp với thứ tự cột & kiểu dữ liệu Web!</strong>
            <div style="font-size:13px; margin-top:2px;">Sẵn sàng import <strong>${count} bản ghi</strong> dữ liệu hợp lệ vào hệ thống.</div>
          </div>
        `;

        // Render Preview Table (Tối đa 10 dòng đầu)
        var previewBox = document.createElement('div');
        previewBox.style.cssText = 'display:flex; flex-direction:column; gap:8px;';
        previewBox.innerHTML = '<div style="font-size:13px; font-weight:600; color:#334155;">Xem trước dữ liệu chuẩn hóa (10 dòng đầu):</div>';

        var tableWrapper = document.createElement('div');
        tableWrapper.className = 'excel-import-table-wrapper';

        var pTable = `<table class="excel-import-table"><thead><tr><th style="width:50px;">STT</th>`;
        webColumns.forEach(function (col) {
          pTable += `<th>${col.title}</th>`;
        });
        pTable += `</tr></thead><tbody>`;

        var previewSlice = res.parsedRows.slice(0, 10);
        previewSlice.forEach(function (rowObj, idx) {
          pTable += `<tr><td style="text-align:center; color:#64748b;">${idx + 1}</td>`;
          webColumns.forEach(function (col) {
            var val = rowObj[col.field];
            pTable += `<td>${val != null ? val : ''}</td>`;
          });
          pTable += `</tr>`;
        });

        pTable += `</tbody></table>`;
        tableWrapper.innerHTML = pTable;
        previewBox.appendChild(tableWrapper);
        resultArea.appendChild(previewBox);
      }
    }

    // Submit handler
    submitBtn.onclick = function () {
      if (!validationResult.isValid || validationResult.parsedRows.length === 0) return;

      submitBtn.disabled = true;
      cancelBtn.disabled = true;

      var cancelCallback = null;

      // Render Modern Stats Progress Box
      resultArea.innerHTML = `
        <div class="excel-import-progress-box">
          <div class="excel-import-progress-header">
            <div class="excel-import-progress-title">
              <span class="material-symbols-outlined spinner-border-sm" style="font-size:20px; color:#0284c7;">sync</span>
              <span>Đang lưu dữ liệu siêu tốc vào hệ thống...</span>
            </div>
            <div class="excel-import-stats-badge">
              <span id="excel-import-speed-text">⚡ 0 dòng/s</span>
              <span style="color:#cbd5e1;">|</span>
              <span id="excel-import-eta-text">⏱️ --s còn lại</span>
              <button type="button" class="excel-import-cancel-task-btn" id="excel-import-cancel-task">Hủy Import</button>
            </div>
          </div>

          <div class="excel-import-progress-bar-bg">
            <div class="excel-import-progress-fill" id="excel-import-progress-fill"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:600; color:#0369a1;">
            <span id="excel-import-progress-percent">Tiến trình: 0%</span>
            <span id="excel-import-progress-text">0 / ${validationResult.parsedRows.length} bản ghi</span>
          </div>
        </div>
      `;

      var cancelTaskBtn = resultArea.querySelector('#excel-import-cancel-task');
      if (cancelTaskBtn) {
        cancelTaskBtn.onclick = function () {
          cancelTaskBtn.disabled = true;
          cancelTaskBtn.textContent = 'Đang hủy...';
          if (typeof cancelCallback === 'function') cancelCallback();
        };
      }

      var modalApi = {
        updateProgress: function (current, total, speed, etaSec) {
          var textEl = card.querySelector('#excel-import-progress-text');
          var pctEl = card.querySelector('#excel-import-progress-percent');
          var fillEl = card.querySelector('#excel-import-progress-fill');
          var speedEl = card.querySelector('#excel-import-speed-text');
          var etaEl = card.querySelector('#excel-import-eta-text');

          if (textEl && fillEl) {
            var pct = total > 0 ? Math.round((current / total) * 100) : 0;
            textEl.textContent = `${current.toLocaleString('vi-VN')} / ${total.toLocaleString('vi-VN')} bản ghi`;
            if (pctEl) pctEl.textContent = `Tiến trình: ${pct}%`;
            fillEl.style.width = pct + '%';
            if (speedEl && speed !== undefined) speedEl.textContent = `⚡ ${speed.toLocaleString('vi-VN')} dòng/s`;
            if (etaEl && etaSec !== undefined) {
              var m = Math.floor(etaSec / 60);
              var s = etaSec % 60;
              var etaFormatted = m > 0 ? `${m}p ${s}s` : `${s}s`;
              etaEl.textContent = `⏱️ ~${etaFormatted} còn lại`;
            }
          }
        },
        onCancel: function (fn) {
          cancelCallback = fn;
        },
        close: closeModal
      };

      if (typeof onConfirmCallback === 'function') {
        onConfirmCallback(validationResult.parsedRows, modalApi);
      }
    };
  }

  return {
    show: show
  };
})();
