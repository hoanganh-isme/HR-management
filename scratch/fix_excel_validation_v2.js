const fs = require('fs');

// 1. Update ExcelImportModal.js
const modalPath = 'd:/chuyenfile/clonecode/HR-Management/src/components/excel-import/ExcelImportModal.js';
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Replace _validateExcelData function in ExcelImportModal.js
const oldValidateFunc = `  function _validateExcelData(rawRows, webColumns, headerRowIdx, dataStartRowIdx) {
    var columnErrors = [];
    var rowErrors = [];
    var parsedRows = [];

    if (!rawRows || rawRows.length === 0) {
      return {
        isValid: false,
        columnErrors: ['File Excel hoàn toàn rỗng hoặc không chứa dữ liệu.'],
        rowErrors: [],
        parsedRows: []
      };
    }

    var headerRowZeroIdx = headerRowIdx - 1;
    if (headerRowZeroIdx < 0 || headerRowZeroIdx >= rawRows.length) {
      return {
        isValid: false,
        columnErrors: [\`Dòng tiêu đề (Dòng \${headerRowIdx}) nằm ngoài phạm vi số dòng của file Excel (Tổng \${rawRows.length} dòng).\`],
        rowErrors: [],
        parsedRows: []
      };
    }

    var rawHeader = rawRows[headerRowZeroIdx] || [];
    // Loại bỏ các ô rỗng ở cuối dòng tiêu đề
    var excelHeaders = [];
    for (var i = 0; i < rawHeader.length; i++) {
      excelHeaders.push(String(rawHeader[i] || '').trim());
    }
    while (excelHeaders.length > 0 && excelHeaders[excelHeaders.length - 1] === '') {
      excelHeaders.pop();
    }

    var webColsCount = webColumns.length;
    var excelColsCount = excelHeaders.length;

    // 1. Kiểm tra thừa / thiếu cột
    if (excelColsCount < webColsCount) {
      var missingCols = webColumns.slice(excelColsCount).map(function (c) { return \`"\${c.title}"\`; }).join(', ');
      columnErrors.push(\`Lỗi thiếu cột: File Excel chỉ có \${excelColsCount} cột, nhưng bảng Web yêu cầu \${webColsCount} cột. (Cột còn thiếu: \${missingCols})\`);
    } else if (excelColsCount > webColsCount) {
      var extraCols = excelHeaders.slice(webColsCount).map(function (h, idx) { return \`Cột \${webColsCount + idx + 1} ("\${h || 'Rỗng'}")\`; }).join(', ');
      columnErrors.push(\`Lỗi thừa cột: File Excel có \${excelColsCount} cột, nhiều hơn số cột hiển thị trên Web (\${webColsCount} cột). (Các cột bị thừa: \${extraCols})\`);
    }

    // 2. Kiểm tra thứ tự và tên các cột
    var checkCount = Math.min(webColsCount, excelColsCount);
    for (var colIdx = 0; colIdx < checkCount; colIdx++) {
      var webTitle = webColumns[colIdx].title || '';
      var excelTitle = excelHeaders[colIdx] || '';

      if (_normalizeText(webTitle) !== _normalizeText(excelTitle)) {
        columnErrors.push(\`Sai thứ tự/tên cột tại vị trí Cột số \${colIdx + 1}: Web yêu cầu tiêu đề "\${webTitle}" nhưng trong file Excel là "\${excelTitle || '(Để trống)'}".\`);
      }
    }

    // 3. Kiểm tra kiểu dữ liệu các dòng dữ liệu (Data Rows)
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
          var fieldTitle = colDef.title;
          var fieldType = String(colDef.type || colDef.fieldType || 'string').toLowerCase();
          var isRequired = colDef.isRequired === true || colDef.required === true;

          var cellRaw = rowData[c];
          var cellStr = (cellRaw !== undefined && cellRaw !== null) ? String(cellRaw).trim() : '';

          // A. Kiểm tra bắt buộc (Required)
          if (isRequired && cellStr === '') {
            rowErrors.push({
              row: excelRowNumber,
              colIdx: c + 1,
              colTitle: fieldTitle,
              value: '(Để trống)',
              error: 'Dữ liệu không được để trống'
            });
            continue;
          }

          if (cellStr === '') {
            rowObj[fieldName] = null;
            continue;
          }

          // B. Kiểm tra kiểu Số (Number, Decimal, Integer, Currency, Money)
          if (['number', 'numeric', 'integer', 'int', 'decimal', 'float', 'currency', 'money'].indexOf(fieldType) > -1) {
            // Xử lý dấu phân cách hàng ngàn (1.000.000 hoặc 1,000,000)
            var cleanNumStr = cellStr.replace(/\\,/g, '');
            if (cleanNumStr.match(/^\\d+\\.\\d{3}(\\.\\d{3})*$/)) {
              cleanNumStr = cleanNumStr.replace(/\\./g, '');
            }
            cleanNumStr = cleanNumStr.replace(/\\s+/g, '');

            var numVal = Number(cleanNumStr);
            if (isNaN(numVal) || !isFinite(numVal)) {
              rowErrors.push({
                row: excelRowNumber,
                colIdx: c + 1,
                colTitle: fieldTitle,
                value: cellStr,
                error: 'Giá trị không phải là số hợp lệ'
              });
            } else {
              rowObj[fieldName] = numVal;
            }
          }
          // C. Kiểm tra kiểu Ngày tháng (Date, Datetime)
          else if (['date', 'datetime'].indexOf(fieldType) > -1 || fieldName.toLowerCase().indexOf('ngay') >= 0) {
            var dateFormatted = _formatDateVal(cellRaw);
            if (!dateFormatted) {
              rowErrors.push({
                row: excelRowNumber,
                colIdx: c + 1,
                colTitle: fieldTitle,
                value: cellStr,
                error: 'Định dạng ngày tháng không hợp lệ (Cần dạng DD/MM/YYYY)'
              });
            } else {
              rowObj[fieldName] = dateFormatted;
            }
          }
          // D. Kiểm tra kiểu Boolean (Boolean, Bit, Checkbox)
          else if (['boolean', 'bit', 'checkbox'].indexOf(fieldType) > -1) {
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
                value: cellStr,
                error: 'Giá trị logic không hợp lệ (Cần Có/Không hoặc True/False)'
              });
            }
          }
          // E. Kiểu Chuỗi chuẩn
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
  }`;

const newValidateFunc = `  function _validateExcelData(rawRows, webColumns, headerRowIdx, dataStartRowIdx) {
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
        columnErrors: [\`Dòng tiêu đề (Dòng \${headerRowIdx}) nằm ngoài phạm vi số dòng file Excel (Tổng \${rawRows.length} dòng).\`],
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
      var missingCols = webColumns.slice(excelColsCount).map(function (c) { return \`Cột \${c.colIdx || ''} ("\${c.title}")\`; }).join(', ');
      columnErrors.push(\`Lỗi thiếu cột: File Excel chỉ có \${excelColsCount} cột, nhưng bảng Web cần \${webColsCount} cột dữ liệu theo thứ tự. (Thiếu từ: \${missingCols})\`);
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
            var cleanNumStr = cellStr.replace(/\\,/g, '');
            if (cleanNumStr.match(/^\\d+\\.\\d{3}(\\.\\d{3})*$/)) {
              cleanNumStr = cleanNumStr.replace(/\\./g, '');
            }
            cleanNumStr = cleanNumStr.replace(/\\s+/g, '');

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
  }`;

// Update error table rendering in ExcelImportModal.js
const oldTableHtml = `          var tableHtml = \`
            <table class="excel-import-table">
              <thead>
                <tr>
                  <th style="width:70px;">Dòng</th>
                  <th style="width:180px;">Cột (Tiêu đề)</th>
                  <th style="width:150px;">Giá trị trong Excel</th>
                  <th>Mô tả chi tiết Lỗi</th>
                </tr>
              </thead>
              <tbody>
          \`;

          res.rowErrors.forEach(function (item) {
            tableHtml += \`
              <tr>
                <td style="font-weight:600; text-align:center;">\${item.row}</td>
                <td><strong style="color:#1e293b;">\${item.colTitle}</strong> <span style="font-size:11px; color:#64748b;">(Cột \${item.colIdx})</span></td>
                <td class="badge-err-cell">\${item.value}</td>
                <td style="color:#b91c1c;">\${item.error}</td>
              </tr>
            \`;
          });`;

const newTableHtml = `          var tableHtml = \`
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
          \`;

          res.rowErrors.forEach(function (item) {
            tableHtml += \`
              <tr>
                <td style="font-weight:700; text-align:center; color:#b91c1c;">\${item.row}</td>
                <td><strong style="color:#1e293b;">Cột \${item.colIdx}</strong> <span style="font-size:11px; color:#64748b;">(\${item.colTitle})</span></td>
                <td><span style="font-size:12px; font-weight:600; color:#475569; background:#f1f5f9; padding:2px 6px; border-radius:4px;">\${item.expectedType || 'Số/Chuỗi'}</span></td>
                <td class="badge-err-cell" style="font-weight:600; color:#dc2626;">"\${item.value}"</td>
                <td style="color:#b91c1c; font-weight:500;">\${item.error}</td>
              </tr>
            \`;
          });`;

let normModal = modalContent.replace(/\r\n/g, '\n');
let normOldVal = oldValidateFunc.replace(/\r\n/g, '\n');
let normNewVal = newValidateFunc.replace(/\r\n/g, '\n');

if (normModal.includes(normOldVal)) {
  normModal = normModal.replace(normOldVal, normNewVal);
  console.log('MODAL_VALIDATE_SUCCESS');
} else {
  console.log('MODAL_VALIDATE_NOT_FOUND');
}

let normOldTable = oldTableHtml.replace(/\r\n/g, '\n');
let normNewTable = newTableHtml.replace(/\r\n/g, '\n');

if (normModal.includes(normOldTable)) {
  normModal = normModal.replace(normOldTable, normNewTable);
  console.log('MODAL_TABLE_SUCCESS');
} else {
  console.log('MODAL_TABLE_NOT_FOUND');
}

fs.writeFileSync(modalPath, normModal, 'utf8');

// 2. Update DynamicFormEngine.js error feedback handling when saving
const dfePath = 'd:/chuyenfile/clonecode/HR-Management/src/js/core/DynamicFormEngine.js';
let dfeContent = fs.readFileSync(dfePath, 'utf8');

const oldSaveLoop = `        var successCount = 0;
        var totalCount = payloads.length;

        function processNext(idx) {
          if (idx >= totalCount) {
            modalApi.close();
            if (typeof Alert !== 'undefined') {
              if (successCount > 0) {
                Alert.success('Thành công', 'Đã import thành công ' + successCount + ' / ' + totalCount + ' bản ghi vào hệ thống.');
              } else {
                Alert.error('Lưu thất bại', 'Không thể lưu bản ghi nào vào hệ thống. Xem Console để biết chi tiết.');
              }
            }
            _loadData();
            return;
          }

          modalApi.updateProgress(idx + 1, totalCount);

          ApiClient.post(endpoint, payloads[idx])
            .then(function (res) {
              console.log('[ExcelImport] Saved row ' + (idx + 1) + ' response:', res);
              var code = res ? res.code : null;
              var msg = String((res && res.msg) || '').toUpperCase();
              if (res && (code === 0 || code === '0' || code === 1 || code === '1' || res.status === 200 || res.success === true || msg.indexOf('THÀNH CÔNG') > -1 || msg.indexOf('SUCCESS') > -1)) {
                successCount++;
              } else {
                console.warn('[ExcelImport] Save failed row ' + (idx + 1) + ':', res);
              }
              processNext(idx + 1);
            })
            .catch(function (err) {
              console.error('Lỗi khi lưu dòng ' + (idx + 1) + ' từ Excel:', err);
              processNext(idx + 1);
            });
        }`;

const newSaveLoop = `        var successCount = 0;
        var totalCount = payloads.length;
        var errorLogs = [];

        function processNext(idx) {
          if (idx >= totalCount) {
            modalApi.close();
            if (typeof Alert !== 'undefined') {
              if (successCount === totalCount) {
                Alert.success('Thành công', 'Đã import thành công ' + successCount + ' / ' + totalCount + ' bản ghi vào hệ thống.');
              } else {
                var firstErr = errorLogs.length > 0 ? errorLogs[0] : '';
                Alert.error('Lỗi lưu CSDL', 'Đã import thành công ' + successCount + '/' + totalCount + ' dòng. ' + (errorLogs.length > 0 ? ('Lỗi ở dòng ' + firstErr.row + ': ' + firstErr.msg) : ''));
              }
            }
            _loadData();
            return;
          }

          modalApi.updateProgress(idx + 1, totalCount);

          ApiClient.post(endpoint, payloads[idx])
            .then(function (res) {
              console.log('[ExcelImport] Saved row ' + (idx + 1) + ' response:', res);
              var code = res ? res.code : null;
              var msg = String((res && res.msg) || '');
              var msgUpper = msg.toUpperCase();

              if (res && (code === 0 || code === '0' || code === 1 || code === '1' || res.status === 200 || res.success === true || msgUpper.indexOf('THÀNH CÔNG') > -1 || msgUpper.indexOf('SUCCESS') > -1)) {
                successCount++;
              } else {
                var cleanMsg = msg || (res && res.records && res.records[0] ? res.records[0].msg : 'Lỗi CSDL không xác định');
                errorLogs.push({ row: idx + 1, msg: cleanMsg, data: parsedRows[idx] });
                console.error('[ExcelImport] Lỗi khi lưu dòng ' + (idx + 1) + ':', cleanMsg);
              }
              processNext(idx + 1);
            })
            .catch(function (err) {
              var errStr = (err && err.message) || String(err);
              errorLogs.push({ row: idx + 1, msg: errStr, data: parsedRows[idx] });
              console.error('[ExcelImport] Lỗi kết nối khi lưu dòng ' + (idx + 1) + ':', errStr);
              processNext(idx + 1);
            });
        }`;

let normDfe = dfeContent.replace(/\r\n/g, '\n');
let normOldSave = oldSaveLoop.replace(/\r\n/g, '\n');
let normNewSave = newSaveLoop.replace(/\r\n/g, '\n');

if (normDfe.includes(normOldSave)) {
  normDfe = normDfe.replace(normOldSave, normNewSave);
  console.log('DFE_SAVE_LOOP_SUCCESS');
} else {
  console.log('DFE_SAVE_LOOP_NOT_FOUND');
}

fs.writeFileSync(dfePath, normDfe, 'utf8');
