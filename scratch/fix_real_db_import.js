const fs = require('fs');

// 1. Update ExcelImportModal.js: Remove virtual "Grid Only" mode option
const modalPath = 'd:/chuyenfile/clonecode/HR-Management/src/components/excel-import/ExcelImportModal.js';
let modalContent = fs.readFileSync(modalPath, 'utf8');

const oldConfigGrid = `<div class="excel-import-config-grid">
          <div class="excel-import-field">
            <label>Chọn Sheet dữ liệu:</label>
            <select id="excel-import-sheet-select" disabled>
              <option value="">-- Chưa nạp file --</option>
            </select>
          </div>
          <div class="excel-import-field">
            <label>Dòng Tiêu đề / Bắt đầu đọc:</label>
            <div style="display:flex; gap:8px;">
              <input type="number" id="excel-import-header-row" value="1" min="1" max="100" title="Dòng tiêu đề" style="flex:1;">
              <input type="number" id="excel-import-data-row" value="2" min="1" max="100" title="Dòng bắt đầu dữ liệu" style="flex:1;">
            </div>
          </div>
          <div class="excel-import-field">
            <label>Phương thức Nạp Dữ Liệu:</label>
            <select id="excel-import-mode-select">
              <option value="db_batch">🚀 Ghi Lô Siêu Tốc CSDL (Batch 500 dòng/lô ~ 3-5s)</option>
              <option value="grid_only">⚡ Nạp trực tiếp Bảng Web (~0.3s - Xem/sửa trước khi lưu)</option>
            </select>
          </div>
        </div>`;

const newConfigGrid = `<div class="excel-import-config-grid">
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
        </div>`;

const oldOnConfirmCall = `      var selectedMode = card.querySelector('#excel-import-mode-select') ? card.querySelector('#excel-import-mode-select').value : 'db_batch';
      if (typeof onConfirmCallback === 'function') {
        onConfirmCallback(validationResult.parsedRows, modalApi, selectedMode);
      }`;

const newOnConfirmCall = `      if (typeof onConfirmCallback === 'function') {
        onConfirmCallback(validationResult.parsedRows, modalApi);
      }`;

let normModal = modalContent.replace(/\r\n/g, '\n');
let normOldGrid = oldConfigGrid.replace(/\r\n/g, '\n');
let normNewGrid = newConfigGrid.replace(/\r\n/g, '\n');

if (normModal.includes(normOldGrid)) {
  normModal = normModal.replace(normOldGrid, normNewGrid);
  console.log('MODAL_RESTORE_GRID_SUCCESS');
}

let normOldCall = oldOnConfirmCall.replace(/\r\n/g, '\n');
let normNewCall = newOnConfirmCall.replace(/\r\n/g, '\n');

if (normModal.includes(normOldCall)) {
  normModal = normModal.replace(normOldCall, normNewCall);
  console.log('MODAL_RESTORE_CALL_SUCCESS');
}

fs.writeFileSync(modalPath, normModal, 'utf8');

// 2. Update DynamicFormEngine.js: High-Speed Max Parallel Real DB Import Engine
const dfePath = 'd:/chuyenfile/clonecode/HR-Management/src/js/core/DynamicFormEngine.js';
let dfeContent = fs.readFileSync(dfePath, 'utf8');

const oldDfeHandler = `      onConfirm: function (parsedRows, modalApi, importMode) {
        if (!parsedRows || parsedRows.length === 0) {
          if (typeof Alert !== 'undefined') Alert.warning('Thông báo', 'Không có dữ liệu hợp lệ để import.');
          return;
        }

        // LỰA CHỌN 1: Nạp trực tiếp lên Bảng Web (Grid Only - Siêu tốc 0.3s cho 100,000 dòng)
        if (importMode === 'grid_only') {
          if (window.tabulatorInstance) {
            window.tabulatorInstance.setData(parsedRows);
            modalApi.close();
            if (typeof Alert !== 'undefined') {
              Alert.success('Thành công', 'Đã nạp siêu tốc ' + parsedRows.length.toLocaleString('vi-VN') + ' dòng lên Bảng Web (0.3s). Bạn có thể xem và chỉnh sửa trên giao diện.');
            }
          } else {
            if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Bảng dữ liệu Web chưa sẵn sàng.');
          }
          return;
        }

        // LỰA CHỌN 2: Chunked Batch API Save (Ghi Lô lớn 500-1000 dòng / HTTP Request ~ 3-5s cho 100,000 dòng)
        var endpoint = _usesUnifiedFieldContract() ? _gateway() : (MODULE_CONFIG.ApiSave || _gateway());
        if (!endpoint) {
          if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không xác định được API lưu dữ liệu.');
          return;
        }

        // Gom nhóm thành các Batch 500 bản ghi
        var BATCH_SIZE = 500;
        var batches = [];
        for (var b = 0; b < parsedRows.length; b += BATCH_SIZE) {
          batches.push(parsedRows.slice(b, b + BATCH_SIZE));
        }

        var totalRows = parsedRows.length;
        var totalBatches = batches.length;
        var successRows = 0;
        var processedBatches = 0;
        var processedRows = 0;
        var errorLogs = [];
        var isAborted = false;
        var startTime = Date.now();
        var CONCURRENCY = 5; // 5 Batch song song

        modalApi.onCancel(function () {
          isAborted = true;
        });

        var queueIndex = 0;

        function runBatchWorker() {
          if (queueIndex >= totalBatches || isAborted) return Promise.resolve();

          var batchIdx = queueIndex++;
          var currentBatchRows = batches[batchIdx];

          // Đóng gói mảng bản ghi của Batch
          var batchPayloadObj = currentBatchRows.map(function (r) {
            return _usesUnifiedFieldContract() ? _buildContractWritePayload(r, false) : _buildPayload(r, false);
          });

          var finalPayload = endpoint === _gateway() ? {
            List: MODULE_CONFIG.FormName,
            Func: 'Save',
            JsonData: JSON.stringify(batchPayloadObj),
            UserName: _currentUser(),
            BranchID: _currentBranchId()
          } : batchPayloadObj;

          return ApiClient.post(endpoint, finalPayload)
            .then(function (res) {
              var code = res ? res.code : null;
              var msg = String((res && res.msg) || '');
              var msgUpper = msg.toUpperCase();

              if (res && (code === 0 || code === '0' || code === 1 || code === '1' || res.status === 200 || res.success === true || msgUpper.indexOf('THÀNH CÔNG') > -1 || msgUpper.indexOf('SUCCESS') > -1)) {
                successRows += currentBatchRows.length;
              } else {
                // Nếu Batch lớn bị từ chối do CSDL yêu cầu single row, tự động fallback từng dòng cho Lô đó
                return processSingleBatchFallback(currentBatchRows, endpoint);
              }
            })
            .catch(function () {
              return processSingleBatchFallback(currentBatchRows, endpoint);
            })
            .finally(function () {
              processedBatches++;
              processedRows = Math.min(totalRows, processedBatches * BATCH_SIZE);
              var elapsed = Math.max(0.1, (Date.now() - startTime) / 1000);
              var speed = Math.round(processedRows / elapsed);
              var etaSec = speed > 0 ? Math.ceil((totalRows - processedRows) / speed) : 0;

              modalApi.updateProgress(processedRows, totalRows, speed, etaSec);

              if (processedBatches < totalBatches && !isAborted) {
                return runBatchWorker();
              }
            });
        }

        // Fallback xử lý từng dòng cho 1 Lô nếu Server từ chối Batch Array
        function processSingleBatchFallback(rowsInBatch, ep) {
          var singlePromises = rowsInBatch.map(function (row) {
            var rowPayload = _usesUnifiedFieldContract() ? _buildContractWritePayload(row, false) : _buildPayload(row, false);
            var pl = ep === _gateway() ? {
              List: MODULE_CONFIG.FormName,
              Func: 'Save',
              JsonData: JSON.stringify(rowPayload),
              UserName: _currentUser(),
              BranchID: _currentBranchId()
            } : rowPayload;

            return ApiClient.post(ep, pl).then(function (res) {
              var c = res ? res.code : null;
              if (res && (c === 0 || c === '0' || c === 1 || c === '1' || res.status === 200 || res.success === true)) {
                successRows++;
              } else {
                errorLogs.push({ msg: res && res.msg ? res.msg : 'Lỗi CSDL' });
              }
            }).catch(function (err) {
              errorLogs.push({ msg: (err && err.message) || String(err) });
            });
          });
          return Promise.all(singlePromises);
        }

        var workers = [];
        var activeWorkers = Math.min(CONCURRENCY, totalBatches);
        for (var w = 0; w < activeWorkers; w++) {
          workers.push(runBatchWorker());
        }

        Promise.all(workers).then(function () {
          modalApi.close();
          var totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
          if (typeof Alert !== 'undefined') {
            if (isAborted) {
              Alert.warning('Tạm dừng Import', 'Đã dừng tiến trình. Đã nạp thành công ' + successRows.toLocaleString('vi-VN') + ' / ' + processedRows.toLocaleString('vi-VN') + ' bản ghi.');
            } else if (successRows > 0) {
              Alert.success('Thành công Siêu Tốc', 'Đã import thành công ' + successRows.toLocaleString('vi-VN') + ' / ' + totalRows.toLocaleString('vi-VN') + ' bản ghi vào CSDL (Thời gian: ' + totalTimeSec + 's).');
            } else {
              var firstErr = errorLogs.length > 0 ? errorLogs[0].msg : 'Lỗi kết nối';
              Alert.error('Lưu thất bại', 'Không thể lưu bản ghi vào CSDL. Lỗi: ' + firstErr);
            }
          }
          _loadData();
        });
      }`;

const newDfeHandler = `      onConfirm: function (parsedRows, modalApi) {
        if (!parsedRows || parsedRows.length === 0) {
          if (typeof Alert !== 'undefined') Alert.warning('Thông báo', 'Không có dữ liệu hợp lệ để import.');
          return;
        }

        var endpoint = _usesUnifiedFieldContract() ? _gateway() : (MODULE_CONFIG.ApiSave || _gateway());
        if (!endpoint) {
          if (typeof Alert !== 'undefined') Alert.error('Lỗi', 'Không xác định được API lưu dữ liệu.');
          return;
        }

        // Đóng gói Payload lưu CSDL thực tế cho từng dòng
        var payloads = parsedRows.map(function (row) {
          var rowPayload = _usesUnifiedFieldContract()
            ? _buildContractWritePayload(row, false)
            : _buildPayload(row, false);

          if (endpoint === _gateway()) {
            return {
              List: MODULE_CONFIG.FormName,
              Func: 'Save',
              JsonData: JSON.stringify(rowPayload),
              UserName: _currentUser(),
              BranchID: _currentBranchId()
            };
          }
          return rowPayload;
        });

        // BÀN THUẬT LƯU THẬT VÀO CSDL VỚI LƯỢNG KẾT NỐI SONG SONG TỐI ĐA (MAX CONCURRENCY = 25 WORKERS)
        var totalCount = payloads.length;
        var successCount = 0;
        var processedCount = 0;
        var errorLogs = [];
        var CONCURRENCY = 25; // 25 luồng gửi song song tới API Gateway CSDL
        var isAborted = false;
        var startTime = Date.now();

        modalApi.onCancel(function () {
          isAborted = true;
        });

        var queueIndex = 0;

        function runWorker() {
          if (queueIndex >= totalCount || isAborted) return Promise.resolve();

          var idx = queueIndex++;
          return ApiClient.post(endpoint, payloads[idx])
            .then(function (res) {
              var code = res ? res.code : null;
              var msg = String((res && res.msg) || '');
              var msgUpper = msg.toUpperCase();

              if (res && (code === 0 || code === '0' || code === 1 || code === '1' || res.status === 200 || res.success === true || msgUpper.indexOf('THÀNH CÔNG') > -1 || msgUpper.indexOf('SUCCESS') > -1)) {
                successCount++;
              } else {
                var cleanMsg = msg || (res && res.records && res.records[0] ? res.records[0].msg : 'Lỗi CSDL');
                errorLogs.push({ row: idx + 1, msg: cleanMsg });
              }
            })
            .catch(function (err) {
              var errStr = (err && err.message) || String(err);
              errorLogs.push({ row: idx + 1, msg: errStr });
            })
            .finally(function () {
              processedCount++;
              var elapsed = Math.max(0.1, (Date.now() - startTime) / 1000);
              var speed = Math.round(processedCount / elapsed);
              var etaSec = speed > 0 ? Math.ceil((totalCount - processedCount) / speed) : 0;

              modalApi.updateProgress(processedCount, totalCount, speed, etaSec);

              if (processedCount < totalCount && !isAborted) {
                return runWorker();
              }
            });
        }

        var workers = [];
        var activeWorkersCount = Math.min(CONCURRENCY, totalCount);
        for (var w = 0; w < activeWorkersCount; w++) {
          workers.push(runWorker());
        }

        Promise.all(workers).then(function () {
          modalApi.close();
          var totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

          if (typeof Alert !== 'undefined') {
            if (isAborted) {
              Alert.warning('Tạm dừng Import', 'Đã dừng tiến trình. Đã lưu CSDL thành công ' + successCount.toLocaleString('vi-VN') + ' / ' + processedCount.toLocaleString('vi-VN') + ' bản ghi.');
            } else if (successCount > 0) {
              Alert.success('Lưu CSDL Thành Công', 'Đã lưu THẬT vào CSDL thành công ' + successCount.toLocaleString('vi-VN') + ' / ' + totalCount.toLocaleString('vi-VN') + ' bản ghi (Thời gian: ' + totalTimeSec + 's). Khi nhấn F5 dữ liệu vẫn giữ nguyên 100%.');
            } else {
              var firstErr = errorLogs.length > 0 ? errorLogs[0].msg : 'Lỗi kết nối CSDL';
              Alert.error('Lưu CSDL Thất bại', 'Không thể lưu bản ghi vào CSDL. Lỗi: ' + firstErr);
            }
          }
          // Nạp lại dữ liệu thực tế trực tiếp từ CSDL về Bảng Web
          _loadData();
        });
      }`;

let normDfe = dfeContent.replace(/\r\n/g, '\n');
let normOldDfe = oldDfeHandler.replace(/\r\n/g, '\n');
let normNewDfe = newDfeHandler.replace(/\r\n/g, '\n');

if (normDfe.includes(normOldDfe)) {
  normDfe = normDfe.replace(normOldDfe, normNewDfe);
  fs.writeFileSync(dfePath, normDfe, 'utf8');
  console.log('DFE_REAL_DB_IMPORT_SUCCESS');
} else {
  console.log('DFE_REAL_DB_IMPORT_NOT_FOUND');
}
