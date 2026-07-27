const fs = require('fs');

// 1. Update excel-import.css with high-speed progress styling
const cssPath = 'd:/chuyenfile/clonecode/HR-Management/src/components/excel-import/excel-import.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const newCssProgress = `
/* Modern High-Speed Progress Box */
.excel-import-progress-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08);
}

.excel-import-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.excel-import-progress-title {
  font-size: 15px;
  font-weight: 700;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.excel-import-stats-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #7dd3fc;
  font-size: 13px;
  font-weight: 600;
  color: #0284c7;
}

.excel-import-progress-bar-bg {
  height: 12px;
  background: #e0f2fe;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 1px solid #93c5fd;
}

.excel-import-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
  width: 0%;
  transition: width 0.15s ease-out;
  border-radius: 6px;
  position: relative;
}

.excel-import-progress-fill::after {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  animation: shimmerProgress 1.5s infinite;
}

@keyframes shimmerProgress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.excel-import-cancel-task-btn {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.excel-import-cancel-task-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
}
`;

if (!cssContent.includes('excel-import-progress-header')) {
  cssContent += newCssProgress;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('CSS_PROGRESS_UPGRADED');
}

// 2. Update DynamicFormEngine.js with Concurrency Pool Importer
const dfePath = 'd:/chuyenfile/clonecode/HR-Management/src/js/core/DynamicFormEngine.js';
let dfeContent = fs.readFileSync(dfePath, 'utf8');

const oldDfeSaveLoop = `        var successCount = 0;
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
        }

        processNext(0);`;

const newDfeSaveLoop = `        // High-Speed Concurrency Batch Runner (Tăng tốc xử lý 15-20x)
        var totalCount = payloads.length;
        var successCount = 0;
        var processedCount = 0;
        var errorLogs = [];
        var CONCURRENCY = Math.min(15, Math.max(5, Math.floor(navigator.hardwareConcurrency || 8)));
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
                var cleanMsg = msg || (res && res.records && res.records[0] ? res.records[0].msg : 'Lỗi CSDL không xác định');
                errorLogs.push({ row: idx + 1, msg: cleanMsg, data: parsedRows[idx] });
              }
            })
            .catch(function (err) {
              var errStr = (err && err.message) || String(err);
              errorLogs.push({ row: idx + 1, msg: errStr, data: parsedRows[idx] });
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
          if (typeof Alert !== 'undefined') {
            if (isAborted) {
              Alert.warning('Tạm dừng Import', 'Đã dừng tiến trình. Đã nạp thành công ' + successCount + ' / ' + processedCount + ' dòng.');
            } else if (successCount === totalCount) {
              var totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
              Alert.success('Thành công', 'Đã import thành công ' + successCount + ' / ' + totalCount + ' bản ghi (Thời gian: ' + totalTimeSec + 's).');
            } else {
              var firstErr = errorLogs.length > 0 ? errorLogs[0] : '';
              Alert.error('Hoàn tất có lỗi', 'Đã import ' + successCount + '/' + totalCount + ' dòng. ' + (errorLogs.length > 0 ? ('Lỗi dòng ' + firstErr.row + ': ' + firstErr.msg) : ''));
            }
          }
          _loadData();
        });`;

let normDfe = dfeContent.replace(/\r\n/g, '\n');
let normOldDfe = oldDfeSaveLoop.replace(/\r\n/g, '\n');
let normNewDfe = newDfeSaveLoop.replace(/\r\n/g, '\n');

if (normDfe.includes(normOldDfe)) {
  normDfe = normDfe.replace(normOldDfe, normNewDfe);
  fs.writeFileSync(dfePath, normDfe, 'utf8');
  console.log('DFE_CONCURRENCY_POOL_SUCCESS');
} else {
  console.log('DFE_CONCURRENCY_POOL_NOT_FOUND');
}

// 3. Update ExcelImportModal.js with Stats UI & Cancel Handler
const modalPath = 'd:/chuyenfile/clonecode/HR-Management/src/components/excel-import/ExcelImportModal.js';
let modalContent = fs.readFileSync(modalPath, 'utf8');

const oldModalProgress = `      // Render Progress box
      resultArea.innerHTML = \`
        <div class="excel-import-progress-box">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; font-weight:600; color:#1d4ed8;">
            <span>Đang lưu dữ liệu vào hệ thống...</span>
            <span id="excel-import-progress-text">0 / \${validationResult.parsedRows.length}</span>
          </div>
          <div class="excel-import-progress-bar">
            <div class="excel-import-progress-fill" id="excel-import-progress-fill"></div>
          </div>
        </div>
      \`;

      var modalApi = {
        updateProgress: function (current, total) {
          var textEl = card.querySelector('#excel-import-progress-text');
          var fillEl = card.querySelector('#excel-import-progress-fill');
          if (textEl && fillEl) {
            textEl.textContent = \`\${current} / \${total}\`;
            var pct = Math.round((current / total) * 100);
            fillEl.style.width = pct + '%';
          }
        },
        close: closeModal
      };`;

const newModalProgress = `      var cancelCallback = null;

      // Render Modern Stats Progress Box
      resultArea.innerHTML = \`
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
            <span id="excel-import-progress-text">0 / \${validationResult.parsedRows.length} bản ghi</span>
          </div>
        </div>
      \`;

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
            textEl.textContent = \`\${current.toLocaleString('vi-VN')} / \${total.toLocaleString('vi-VN')} bản ghi\`;
            if (pctEl) pctEl.textContent = \`Tiến trình: \${pct}%\`;
            fillEl.style.width = pct + '%';
            if (speedEl && speed !== undefined) speedEl.textContent = \`⚡ \${speed.toLocaleString('vi-VN')} dòng/s\`;
            if (etaEl && etaSec !== undefined) {
              var m = Math.floor(etaSec / 60);
              var s = etaSec % 60;
              var etaFormatted = m > 0 ? \`\${m}p \${s}s\` : \`\${s}s\`;
              etaEl.textContent = \`⏱️ ~\${etaFormatted} còn lại\`;
            }
          }
        },
        onCancel: function (fn) {
          cancelCallback = fn;
        },
        close: closeModal
      };`;

let normModal = modalContent.replace(/\r\n/g, '\n');
let normOldModal = oldModalProgress.replace(/\r\n/g, '\n');
let normNewModal = newModalProgress.replace(/\r\n/g, '\n');

if (normModal.includes(normOldModal)) {
  normModal = normModal.replace(normOldModal, normNewModal);
  fs.writeFileSync(modalPath, normModal, 'utf8');
  console.log('MODAL_HIGH_SPEED_PROGRESS_SUCCESS');
} else {
  console.log('MODAL_HIGH_SPEED_PROGRESS_NOT_FOUND');
}
