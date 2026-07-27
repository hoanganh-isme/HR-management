const fs = require('fs');
const path = 'd:/chuyenfile/clonecode/HR-Management/src/js/core/DynamicFormEngine.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        var payloads = parsedRows.map(function (row) {
          if (_usesUnifiedFieldContract()) {
            return _buildContractWritePayload(row, false);
          } else {
            var p = _buildPayload(row, false);
            p.List = MODULE_CONFIG.FormName;
            p.Func = 'Save';
            return p;
          }
        });

        var successCount = 0;
        var totalCount = payloads.length;

        function processNext(idx) {
          if (idx >= totalCount) {
            modalApi.close();
            if (typeof Alert !== 'undefined') {
              Alert.success('Thành công', 'Đã import thành công ' + successCount + ' / ' + totalCount + ' bản ghi vào hệ thống.');
            }
            _loadData();
            return;
          }

          modalApi.updateProgress(idx + 1, totalCount);

          ApiClient.post(endpoint, payloads[idx])
            .then(function (res) {
              if (res && (res.code === 0 || String(res.code) === '0' || res.status === 200)) {
                successCount++;
              }
              processNext(idx + 1);
            })
            .catch(function (err) {
              console.error('Lỗi khi lưu dòng ' + (idx + 1) + ' từ Excel:', err);
              processNext(idx + 1);
            });
        }`;

const replacementStr = `        var payloads = parsedRows.map(function (row) {
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

        var successCount = 0;
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

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetStr.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacementStr);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('REPLACE_IMPORT_PAYLOAD_SUCCESS');
} else {
  console.log('IMPORT_PAYLOAD_TARGET_NOT_FOUND');
}
