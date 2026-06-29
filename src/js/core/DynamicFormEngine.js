/**
 * Dynamic Form Engine - Generic Metadata-Driven UI Engine
 */
window.DynamicFormEngine = (function () {

  var $container = null;
  var gridData = [];
  var selectedRows = [];
  var lastSelectedIdx = -1;
  var activeDetailTabIdx = 0;

  var currentKeyword = '';
  var currentSortCol = '';
  var currentSortDir = '';
  var currentPage = 1;
  var currentLimit = 15;
  var totalRecords = 0;
  var totalPagesFromApi = 0;
  var lastTimestamp = '';

  // Lưu trữ state (page, sort, filter) theo từng FormName để giữ vết khi chuyển lại
  var moduleStates = {};
  var currentFormName = '';

  // Dữ liệu Từ điển lấy từ API (Database)
  var globalDictionary = {};
  var globalFormSchema = [];
  var globalRenderers = {};

  var defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";

  // Khôi phục moduleStates từ sessionStorage nếu có (để giữ filter khi F5)
  try {
    var cachedStates = sessionStorage.getItem('DynamicFormEngine_States');
    if (cachedStates) moduleStates = JSON.parse(cachedStates);
  } catch (e) { }

  function _saveModuleStates() {
    try {
      sessionStorage.setItem('DynamicFormEngine_States', JSON.stringify(moduleStates));
    } catch (e) { }
  }

  var MODULE_CONFIG = {};

  // ── Helpers ──────────────────────────────────────────────
  function _currentGroup() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Group || u.GroupUser || u.GroupID || u.group || u.NhomQuyen || 'Admin';
  }

  function _currentUser() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Username || u.UserName || u.username || 'Admin';
  }

  /**
   * Lấy danh sách chi nhánh được gán cho user hiện tại.
   * Đọc từ pmql_user.BranchID (lưu trong bảng SY_User).
   * BranchID có thể là 1 giá trị hoặc comma-separated: "COBI, DONGDU, ESTELLA".
   * Nếu BranchID = NULL/rỗng và user là admin → trả về toàn bộ chi nhánh.
   * Trả về Array<{ id: string, name: string }>
   */
  function _getUserBranches() {
    // Bảng tên hiển thị — sync với SP [HR_MaNVTuTangTheoBranch]
    var BRANCH_DISPLAY = {
      'COBI':        'COBI',
      'DONGDU':      'Đông Du',
      'ESTELLA':     'Estella',
      'HOANGHAI':    'Hoàng Hải',
      'HUNGVUONG':   'Hùng Vương',
      'NAMVINH':     'Nam Vinh',
      'SGCENTER':    'SG Center',
      'THANHDA':     'Thành Đa',
      'TRANHUNGDAO': 'Trần Hưng Đạo',
      'VANPHONG':    'Văn Phòng',
      // ── Thêm chi nhánh mới vào đây khi DB được cập nhật ─────────
    };

    var ALL_BRANCHES = Object.keys(BRANCH_DISPLAY).map(function (k) {
      return { id: k, name: BRANCH_DISPLAY[k] };
    });

    try {
      var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
      // Xử lý các trường hợp key API trả về chữ hoa/chữ thường khác nhau
      var branchRaw = (u.BranchID || u.branchID || u.branchId || u.Branch || '').toString().trim();
      var userGrp = (u.UserGroupID || u.userGroupID || u.userGroupId || u.Group || u.NhomQuyen || _currentGroup() || '').toString().toLowerCase();

      var isAdmin = (userGrp === 'admin');

      // Nếu là Admin, trả về toàn bộ chi nhánh.
      if (isAdmin) return ALL_BRANCHES;

      // NẾU TÀI KHOẢN KHÔNG PHẢI ADMIN MÀ BRANCH BỊ RỖNG:
      // Tức là API chưa trả về hoặc DB chưa gán. Không được phép trả về ALL_BRANCHES!
      if (!branchRaw) return [];

      // Parse BranchID: "COBI, DONGDU, ESTELLA" → [{ id, name }, ...]
      return branchRaw
        .split(',')
        .map(function (s) { return s.trim().toUpperCase(); })
        .filter(function (s) { return !!s; })
        .map(function (id) {
          return { id: id, name: BRANCH_DISPLAY[id] || id };
        });
    } catch (e) {
      return [];
    }
  }


  /**
   * Đọc giá trị boolean từ API field có thể trả về camelCase hoặc PascalCase
   * và có thể là '1'/true/1 hoặc '0'/false/0
   * @param {*} camel  - item.showInAdd, item.required ...
   * @param {*} pascal - item.ShowInAdd, item.IsRequired ...
   */
  function _bool(camel, pascal) {
    return String(camel) === '1' || camel === true || String(pascal) === '1' || pascal === true;
  }

  /**
   * Gọi API tuần tự cho mảng payload (tránh sập API khi gửi đồng loạt)
   * @param {string}   endpoint  - API URL
   * @param {Array}    payloads  - Mảng payload cần gọi lần lượt
   * @param {Function} onDone    - Gọi khi tất cả xong, nhận (successCount)
   * @param {Function} [onError] - Gọi khi 1 payload lỗi, nhận (err, payload, index)
   *                               Nếu return false → dừng chuỗi. Mặc định tiếp tục.
   */
  function _sendSequential(endpoint, payloads, onDone, onError) {
    var successCount = 0;
    function _next(i) {
      if (i >= payloads.length) { onDone(successCount); return; }
      ApiClient.post(endpoint, payloads[i])
        .then(function (res) {
          if (res && res.code === 0) successCount++;
          _next(i + 1);
        })
        .catch(function (err) {
          var stop = typeof onError === 'function' && onError(err, payloads[i], i) === false;
          if (!stop) _next(i + 1);
        });
    }
    _next(0);
  }

  /** Kiểm tra form hiện tại có phải Form Builder không */
  function _isFormBuilder() {
    return String(MODULE_CONFIG.FormName).toLowerCase() === 'frmformbuilder';
  }

  /**
   * Bật/tắt trạng thái loading trên nút bấm
   * @param {HTMLElement} btn
   * @param {boolean}     loading
   * @param {string}      [originalHTML] - HTML gốc để restore khi loading=false
   */
  function _setBtnLoading(btn, loading, originalHTML) {
    if (loading) {
      btn._originalHTML = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';
      btn.disabled = true;
    } else {
      btn.innerHTML = originalHTML || btn._originalHTML || btn.innerHTML;
      btn.disabled = false;
    }
  }

  /**
   * Áp giá trị mặc định cho object — chỉ ghi nếu chưa có (giống pattern X = X || default)
   * @param {Object} obj      - Object cần áp mặc định (ví dụ: MODULE_CONFIG)
   * @param {Object} defaults - Các giá trị mặc định { key: value }
   */
  function _setDefaults(obj, defaults) {
    Object.keys(defaults).forEach(function (k) {
      if (!obj[k]) obj[k] = defaults[k];
    });
  }

  /** Lưu selectedRows vào sessionStorage (silent fail) */
  function _saveSelectedRows() {
    try {
      sessionStorage.setItem('selectedRows_' + MODULE_CONFIG.FormName, JSON.stringify(selectedRows));
    } catch (e) { }
  }

  /** Đọc selectedRows từ sessionStorage (silent fail, trả mảng rỗng nếu lỗi) */
  function _loadSelectedRows() {
    try {
      var cached = sessionStorage.getItem('selectedRows_' + MODULE_CONFIG.FormName);
      selectedRows = cached ? JSON.parse(cached) : [];
    } catch (e) {
      selectedRows = [];
    }
  }

  /**
   * Phóng to hình ảnh trong một lightbox overlay đẹp mắt
   * @param {string} imgSrc - URL hoặc Base64 của ảnh
   */
  function _showImageZoom(imgSrc) {
    if (!imgSrc || imgSrc.indexOf('data:image/svg+xml') === 0) return;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:zoom-out;opacity:0;transition:opacity 0.2s ease-out;';

    var zoomImg = document.createElement('img');
    zoomImg.src = imgSrc;
    zoomImg.style.cssText = 'max-width:88vw;max-height:88vh;object-fit:contain;border-radius:10px;box-shadow:0 16px 56px rgba(0,0,0,0.7);transform:scale(0.88);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);';

    overlay.appendChild(zoomImg);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      zoomImg.style.transform = 'scale(1)';
    });

    overlay.onclick = function () {
      overlay.style.opacity = '0';
      zoomImg.style.transform = 'scale(0.88)';
      setTimeout(function () { overlay.remove(); }, 220);
    };
  }

  function _renderAttachmentsTab(tabDef, container, isEditable, row) {
    container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải tệp đính kèm...</div>';
    var pkField = MODULE_CONFIG.PrimaryKey || 'PersonID';
    var pkVal = row[pkField] || '';
    var filterData = {};
    filterData[tabDef.filterField || pkField] = pkVal;

    function _getContentAsBlobUrl(fileItem) {
      var content = fileItem.Content || fileItem.content || fileItem.Base64Content || fileItem.base64Content || '';
      if (!content) return '';

      var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
      var mime = 'application/octet-stream';
      if (ext === 'pdf') mime = 'application/pdf';
      else if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'webp') mime = 'image/webp';

      try {
        if (/^0x/i.test(content)) {
          var hexStr = content.replace(/^0x/i, '').replace(/\s/g, '');
          var bytes = new Uint8Array(hexStr.length / 2);
          for (var bi = 0; bi < bytes.length; bi++) {
            bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        } else {
          var cleanBase64 = content.trim();
          if (cleanBase64.indexOf(';base64,') > -1) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
          }
          var binaryStr = window.atob(cleanBase64);
          var bytes = new Uint8Array(binaryStr.length);
          for (var i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          var blob = new Blob([bytes], { type: mime });
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.error('[ATTACHMENT ERROR] Failed to convert content to blob url:', e);
        return '';
      }
    }

    function _loadAttachments() {
      var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };
      ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
        var data = res.list || res.records || [];
        container.innerHTML = '';

        // 1. Container cho danh sách tệp đính kèm
        var listWrap = document.createElement('div');
        listWrap.className = 'attachments-list';
        listWrap.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; max-height: 300px; overflow-y: auto;';

        if (data.length === 0) {
          var empty = document.createElement('div');
          empty.style.cssText = 'color: var(--color-text-secondary); text-align: center; padding: 20px; font-size: 13px; border: 1px dashed var(--color-border); border-radius: 8px;';
          empty.textContent = 'Chưa có tệp hay ảnh đính kèm nào cho hợp đồng này.';
          listWrap.appendChild(empty);
        } else {
          data.forEach(function (fileItem) {
            var card = document.createElement('div');
            card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; background: var(--color-surface);';

            // Left: Icon/Thumbnail + Info
            var leftArea = document.createElement('div');
            leftArea.style.cssText = 'display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;';

            var iconWrap = document.createElement('div');
            iconWrap.style.cssText = 'width: 40px; height: 40px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--color-background, #f1f5f9); flex-shrink: 0;';

            var blobUrl = _getContentAsBlobUrl(fileItem);
            var isImage = parseInt(fileItem.FileType) === 1 || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileItem.FileName);
            if (isImage && blobUrl) {
              // Hiển thị ảnh thumbnail thực tế từ Blob URL
              var thumb = document.createElement('img');
              thumb.src = blobUrl;
              thumb.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: zoom-in;';
              thumb.addEventListener('click', function () { _showImageZoom(blobUrl); });
              iconWrap.appendChild(thumb);
            } else {
              var icon = document.createElement('span');
              icon.className = 'material-symbols-outlined';
              icon.style.fontSize = '24px';
              icon.style.color = isImage ? 'var(--color-success)' : 'var(--color-primary)';
              icon.innerText = isImage ? 'image' : (/\.(pdf)$/i.test(fileItem.FileName) ? 'picture_as_pdf' : 'description');
              iconWrap.appendChild(icon);
            }

            var infoArea = document.createElement('div');
            infoArea.style.cssText = 'display: flex; flex-direction: column; gap: 2px; min-width: 0;';

            var nameSpan = document.createElement('span');
            nameSpan.textContent = fileItem.FileName || 'Chưa đặt tên';
            nameSpan.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';

            var metaSpan = document.createElement('span');
            var kbSize = fileItem.FileSize ? (parseFloat(fileItem.FileSize) / 1024).toFixed(1) + ' KB' : '—';
            metaSpan.textContent = kbSize + ' | STT: ' + (fileItem.STT || '—');
            metaSpan.style.cssText = 'font-size: 11px; color: var(--color-text-secondary);';

            infoArea.appendChild(nameSpan);
            infoArea.appendChild(metaSpan);

            leftArea.appendChild(iconWrap);
            leftArea.appendChild(infoArea);

            // Right: Actions (Download & Preview & Delete)
            var actions = document.createElement('div');
            actions.style.cssText = 'display: flex; gap: 4px;';

            if (blobUrl) {
              // Icon mắt (Xem trước/Preview) cho Ảnh hoặc PDF
              var ext = (fileItem.FileName || '').split('.').pop().toLowerCase();
              var isPdf = ext === 'pdf';
              if (isImage || isPdf) {
                var btnPreview = document.createElement('button');
                btnPreview.type = 'button';
                btnPreview.className = 'btn btn-icon';
                btnPreview.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-success); display: flex; align-items: center;';
                btnPreview.title = 'Xem trực tiếp';
                btnPreview.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>';
                btnPreview.onclick = function () {
                  if (isImage) {
                    _showImageZoom(blobUrl);
                  } else if (isPdf) {
                    window.open(blobUrl, '_blank');
                  }
                };
                actions.appendChild(btnPreview);
              }

              var btnDownload = document.createElement('button');
              btnDownload.type = 'button';
              btnDownload.className = 'btn btn-icon';
              btnDownload.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-primary); display: flex; align-items: center;';
              btnDownload.title = 'Tải xuống';
              btnDownload.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">download</span>';
              btnDownload.onclick = function () {
                var a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileItem.FileName || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              };
              actions.appendChild(btnDownload);
            }

            // CHỈ HIỂN THỊ NÚT XÓA KHI ĐƯỢC PHÉP CHỈNH SỬA
            if (isEditable) {
              var btnDelete = document.createElement('button');
              btnDelete.type = 'button';
              btnDelete.className = 'btn btn-icon';
              btnDelete.style.cssText = 'padding: 4px; border: none; background: none; cursor: pointer; color: var(--color-danger); display: flex; align-items: center;';
              btnDelete.title = 'Xóa tệp';
              btnDelete.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">delete</span>';
              btnDelete.onclick = function () {
                if (typeof ConfirmModal !== 'undefined') {
                  ConfirmModal.show({
                    title: 'Xóa tệp đính kèm',
                    message: 'Bạn có chắc chắn muốn xóa tệp "' + fileItem.FileName + '" không?',
                    onConfirm: function () {
                      var delPayload = {
                        List: tabDef.api,
                        Func: 'Delete',
                        Ids: fileItem.UserAutoID,
                        JsonData: JSON.stringify({ UserAutoID: fileItem.UserAutoID })
                      };
                      ApiClient.post('/api/API_Gateway_Router', delPayload).then(function (delRes) {
                        if (delRes.code === 0 || delRes.code === '0') {
                          UIToast.show('Xóa tệp thành công!', 'success');
                          _loadAttachments();
                        } else {
                          Alert.error('Lỗi', delRes.msg || 'Không thể xóa tệp');
                        }
                      }).catch(function (err) {
                        Alert.error('Lỗi', 'Không thể kết nối máy chủ');
                      });
                    }
                  });
                }
              };
              actions.appendChild(btnDelete);
            }

            card.appendChild(leftArea);
            card.appendChild(actions);
            listWrap.appendChild(card);
          });
        }
        container.appendChild(listWrap);

        // CHỈ HIỂN THỊ VÙNG TẢI LÊN KHI ĐƯỢC PHÉP CHỈNH SỬA
        if (isEditable) {
          var uploadZoneWrap = document.createElement('div');
          uploadZoneWrap.style.cssText = 'border: 1px dashed var(--color-border-strong); border-radius: 8px; padding: 16px; background: var(--color-surface); display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;';

          if (typeof UIFileUpload !== 'undefined') {
            var fileUploadEl = UIFileUpload.create({
              id: 'attach-upload-input',
              text: 'Kéo thả tệp/ảnh hoặc click để tải lên',
              hint: 'Hỗ trợ: PDF, JPG, PNG... Tối đa 10MB',
              onChange: function (file) {
                _uploadFileToServer(file);
              }
            });
            uploadZoneWrap.appendChild(fileUploadEl);
          }
          container.appendChild(uploadZoneWrap);
        }
      }).catch(function (err) {
        container.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải danh sách tệp đính kèm</div>';
      });
    }

    function _uploadFileToServer(file) {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        Alert.error('Tệp quá lớn', 'Hệ thống chỉ hỗ trợ tệp tối đa 10MB.');
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var arrayBuffer = e.target.result;
        var bytes = new Uint8Array(arrayBuffer);
        var hexArray = [];
        for (var i = 0; i < bytes.length; i++) {
          var hexVal = bytes[i].toString(16);
          if (hexVal.length < 2) hexVal = '0' + hexVal;
          hexArray.push(hexVal);
        }
        var hexStr = '0x' + hexArray.join('');

        var base64Reader = new FileReader();
        base64Reader.onload = function (bEvent) {
          var dataUrl = bEvent.target.result;
          var base64Content = dataUrl.split(',')[1] || dataUrl;

          var ext = file.name.split('.').pop().toLowerCase();
          var isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) >= 0;
          var fileTypeNum = isImg ? 1 : 0;

          var previewHtml = '';
          if (isImg) {
            previewHtml = `
              <div style="margin: 12px 0; text-align: center;">
                <img src="${dataUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/>
              </div>
            `;
          } else {
            var iconName = ext === 'pdf' ? 'picture_as_pdf' : 'description';
            var iconColor = ext === 'pdf' ? 'var(--color-danger)' : 'var(--color-primary)';
            previewHtml = `
              <div style="margin: 12px 0; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: var(--color-background, #f8fafc); border-radius: 6px; border: 1px solid var(--color-border);">
                <span class="material-symbols-outlined" style="font-size: 32px; color: ${iconColor};">${iconName}</span>
                <span style="font-weight: 500; font-size: 13px; color: var(--color-text); word-break: break-all;"> Định dạng: ${ext.toUpperCase()} </span>
              </div>
            `;
          }

          var kbSize = (file.size / 1024).toFixed(1) + ' KB';
          var confirmMessage = `
            <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; text-align: left;">
              Bạn có chắc chắn muốn tải tệp này lên không?
              <div style="margin-top: 10px; padding: 10px; background: var(--color-background, #f1f5f9); border-radius: 6px; border: 1px solid var(--color-border); font-family: monospace; font-size: 12px; color: var(--color-text); word-break: break-all;">
                <strong>Tên file:</strong> ${file.name}<br/>
                <strong>Dung lượng:</strong> ${kbSize}
              </div>
              ${previewHtml}
            </div>
          `;

          ConfirmModal.show({
            title: 'Xác nhận tải tệp lên',
            message: confirmMessage,
            confirmText: 'Tải lên',
            confirmClass: 'btn-primary',
            onConfirm: function () {
              _executeUpload(file, hexStr, base64Content, fileTypeNum);
            }
          });
        };
        base64Reader.readAsDataURL(file);
      };
      reader.readAsArrayBuffer(file);
    }

    function _executeUpload(file, hexStr, base64Content, fileTypeNum) {
      var payloadCount = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };
      ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payloadCount).then(function (cntRes) {
        var currentItems = cntRes.list || cntRes.records || [];
        var nextSTT = currentItems.length + 1;

        var savePayload = {
          List: tabDef.api,
          Func: 'Save',
          JsonData: JSON.stringify({
            IsEdit: 0,
            MaHopDong: pkVal,
            FileName: file.name,
            FileType: fileTypeNum,
            STT: nextSTT,
            FileSize: file.size,
            Base64Content: base64Content,
            Content: hexStr
          })
        };

        container.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang lưu tài liệu lên máy chủ...</div>';
        ApiClient.post('/api/API_Gateway_Router', savePayload).then(function (saveRes) {
          if (saveRes.code === 0 || saveRes.code === '0') {
            UIToast.show('Tải tệp đính kèm lên thành công!', 'success');
            _loadAttachments();
          } else {
            Alert.error('Lỗi lưu tệp', saveRes.msg || 'Không thể lưu tệp lên CSDL.');
            _loadAttachments();
          }
        }).catch(function (err) {
          Alert.error('Lỗi', 'Không thể kết nối đến máy chủ.');
          _loadAttachments();
        });
      }).catch(function () {
        _loadAttachments();
      });
    }

    _loadAttachments();
  }

  /**
   * Khởi tạo payload chuẩn cho API: clone base, áp user + isEdit flag
   * @param {Object}  base   - Dữ liệu gốc (formInputData hoặc targetRow)
   * @param {boolean} isEdit - true = edit, false = add
   * @returns {Object} payload đã gắn UserName, UserCreate, IsEdit
   */
  function _buildPayload(base, isEdit) {
    var p = Object.assign({}, base);
    p.UserName = _currentUser();
    p.UserCreate = _currentUser();
    p.IsEdit = isEdit ? 1 : 0;
    return p;
  }

  function _hasPermission(action) {
    if (typeof Permission !== 'undefined') {
      var module = MODULE_CONFIG.FormName;
      if (action === 'ADD') return Permission.canAdd(module);
      if (action === 'EDIT') return Permission.canEdit(module);
      if (action === 'DELETE') return Permission.canDelete(module);
    }

    // Fallback logic
    var perms = JSON.parse(localStorage.getItem('pmql_permissions') || 'null');
    if (!perms) return true; // Chưa ráp hệ thống phân quyền thì thả cửa

    var targetKey = (MODULE_CONFIG.FormName || '').toLowerCase();
    var modulePerm = null;
    for (var key in perms) {
      if (key.toLowerCase() === targetKey) {
        modulePerm = perms[key];
        break;
      }
    }
    if (!modulePerm) return false; // Fail-closed

    if (action === 'ADD') return !!modulePerm.CanAdd;
    if (action === 'EDIT') return !!modulePerm.CanEdit;
    if (action === 'DELETE') return !!modulePerm.CanDelete;
    return true;
  }

  // ── Render ────────────────────────────────────────────────
  function render(container, config) {
    if (!container || !config) {
      console.error('DynamicFormEngine: Missing container or config');
      return;
    }

    // 1. Lưu lại state của module hiện tại trước khi chuyển sang module mới
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
    }

    $container = container;
    MODULE_CONFIG = config;
    currentFormName = config.FormName;

    // 2. Khôi phục state của module mới (nếu đã từng vào trước đó)
    var savedState = moduleStates[currentFormName];
    if (savedState) {
      currentKeyword = savedState.keyword;
      currentSortCol = savedState.sortCol;
      currentSortDir = savedState.sortDir;
      currentPage = savedState.page;
      window.currentFilters = savedState.filters;
    } else {
      // Nếu chưa từng vào thì reset về mặc định
      currentKeyword = '';
      currentSortCol = '';
      currentSortDir = '';
      currentPage = 1;
      window.currentFilters = null;
    }

    // Reset sạch sẽ Dictionary & Schema của Form cũ để tránh lây nhiễm (ví dụ API form mới bị lỗi thì không hiện rác của form cũ)
    globalDictionary = {};
    globalFormSchema = [];
    globalRenderers = {};

    // API defaults: FormBuilder dùng API chuyên biệt, các form khác dùng generic No-Code API
    _setDefaults(MODULE_CONFIG, {
      ApiSearch: '/api/API_Gateway_Router',
      ApiSave: '/api/API_Gateway_Router',
      ApiDelete: '/api/API_Gateway_Router'
    });
    _setDefaults(MODULE_CONFIG, { ApiDictionary: '/api/API_LayCacTruongGiaoDien' });

    _loadSelectedRows();


    // 1. Lấy Từ điển UI từ Database trước (Cơ chế Caching siêu tốc)
    var configEndpoint = MODULE_CONFIG.ApiDictionary;
    var cacheKey = 'FormConfigCache_' + MODULE_CONFIG.FormName;
    var cachedData = null;

    // RAM Cache cho giao diện
    if (!_isFormBuilder()) {
      try { cachedData = window._uiConfigCache ? window._uiConfigCache[cacheKey] : null; } catch (e) { }
    }

    var pConfig;
    if (cachedData) {
      pConfig = Promise.resolve(JSON.parse(cachedData));
    } else {
      pConfig = configEndpoint ? ApiClient.post(configEndpoint, { FormName: MODULE_CONFIG.FormName }).then(function (res) {
        if (res && res.code === 0 && !_isFormBuilder()) {
          window._uiConfigCache = window._uiConfigCache || {};
          window._uiConfigCache[cacheKey] = JSON.stringify(res);
        }
        return res;
      }) : Promise.resolve(null);
    }

    pConfig.then(function (resConfig) {

      // 2. Lưu Từ điển vào biến toàn cục
      var dataList = resConfig ? (resConfig.list || resConfig.records) : null;
      if (resConfig && resConfig.code === 0 && dataList) {

        // --- NO-CODE MAGIC: Đọc cấu hình cấp Form từ Record đầu tiên ---
        if (dataList.length > 0) {
          var firstRow = dataList[0];

          // Map API fields → MODULE_CONFIG (chỉ ghi nếu API trả về giá trị)
          var _rowMap = { primaryKey: 'PrimaryKey' }; // Ngừng lấy formTitle và formSubtitle để ưu tiên router
          Object.keys(_rowMap).forEach(function (src) {
            if (firstRow[src]) MODULE_CONFIG[_rowMap[src]] = firstRow[src];
          });

          // Sinh nhãn mặc định — caller có thể override từ config
          _setDefaults(MODULE_CONFIG, {
            TitleAdd: '➕ Thêm ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || 'Mới'),
            TitleEdit: '✏️ Sửa ' + (MODULE_CONFIG.PageTitle || firstRow.formTitle || ''),
            BtnSaveAdd: 'Thêm mới',
            BtnSaveEdit: 'Lưu thay đổi',
            BtnSaveAll: 'Lưu Tất Cả',
            BtnCancel: 'Hủy bỏ',
            BtnSaveSaving: 'Đang lưu...',
            ToastAdd: 'Đã thêm mới thành công!',
            ToastEdit: 'Đã cập nhật thành công!',
            ToastDelete: 'Xóa thành công!',
            WarnMissingInfo: 'Thiếu thông tin',
            WarnMissingInput: 'Vui lòng điền đầy đủ thông tin: {0}',
            WarnSelectEdit: 'Vui lòng chọn dữ liệu cần sửa',
            WarnSelectDelete: 'Vui lòng chọn dữ liệu cần xóa',
            ConfirmDelete: 'Bạn có chắc muốn xóa {0}?',
            TextDeleteFallback: 'dòng này',
            AlertTitleConfirm: 'Xác nhận xóa',
            AlertTitleWarning: 'Cảnh báo',
            AlertTitleError: 'Lỗi',
            AlertTitleInfo: 'Thông báo',
            AlertApiMissing: 'Chưa cấu hình API lưu',
            AlertSaveFailed: 'Lưu dữ liệu thất bại',
            AlertDeleteFailed: 'Xóa dữ liệu thất bại',
            AlertNetworkError: 'Lỗi kết nối mạng',
            ModalWidth: '600px'
          });
        }

        dataList.forEach(function (item) {
          // Xây Dictionary cho Table
          globalDictionary[item.name] = item.label;


          // Xây dựng Custom Renderers Động từ cấu hình DB (FormatID hoặc renderRule)
          var format = (item.formatId || item.FormatID || '').toLowerCase();
          if (format === 'n' || format === 'c' || item.renderRule) {
            globalRenderers[item.name] = function (v) {
              if (format === 'n') {
                var n = parseFloat(v);
                return isNaN(n) ? (v || '') : n.toLocaleString('vi-VN');
              }
              if (format === 'c') {
                var isChecked = (v === true || v === 1 || String(v) === '1' || String(v).toLowerCase() === 'true');
                return isChecked
                  ? '<span style="color:var(--color-success); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span></span>'
                  : '<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; justify-content:center;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span></span>';
              }
              if (item.renderRule) {
                var rule = item.renderRule.toLowerCase();
                if (rule === 'sw' || rule === 'boolean') {
                  var isChecked = (String(v) === '1' || String(v).toLowerCase() === 'true');
                  return isChecked
                    ? '<span style="color:var(--color-success);"><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">check_circle</span></span>'
                    : '<span style="color:var(--color-text-tertiary);">-</span>';
                }
                if (!v || v === '0' || v === 0) return (rule.indexOf('badge:') === 0 || rule === 'bg' || rule === 'br' || rule === 'bw') ? '-' : v;
                if (rule === 'bg') return '<span class="status-badge success">' + v + '</span>';
                if (rule === 'br') return '<span class="status-badge danger">' + v + '</span>';
                if (rule === 'bw') return '<span class="status-badge warning">' + v + '</span>';
                if (rule === 'cr') return '<span style="color:var(--color-danger);font-weight:600;">' + v + '</span>';
                if (rule === 'cg') return '<span style="color:var(--color-success);font-weight:600;">' + v + '</span>';
                if (rule === 'cb') return '<span style="color:var(--color-primary);font-weight:600;">' + v + '</span>';
                if (item.renderRule.indexOf('Badge:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  return '<span class="status-badge ' + color + '">' + v + '</span>';
                } else if (item.renderRule.indexOf('Color:') === 0) {
                  var color = item.renderRule.split(':')[1];
                  var safeVal = String(v).replace(/"/g, '&quot;');
                  return '<span title="' + safeVal + '" style="color:var(--color-' + color + ');font-weight:600;">' + safeVal + '</span>';
                }
              }
              return v;
            };
          }

          // Xây Schema cho Form (Lưu toàn bộ để lấy Khóa chính)
          var rawValidate = (item.validateRule || item.ValidateRule || '').trim();
          var rawVisible = (item.visibleRule || item.VisibleRule || '').trim();

          var formulaMatch = rawValidate.match(/formula:([^|]+)/i) || rawVisible.match(/formula:([^|]+)/i);
          var triggerMatch = rawValidate.match(/trigger:([^|]+)/i) || rawVisible.match(/trigger:([^|]+)/i);

          var fieldName = item.name || item.FieldName;
          var isReadOnlyEditVal = _bool(item.isReadOnlyEdit, item.IsReadOnlyEdit);
          var isReadOnlyAddVal = _bool(item.isReadOnlyAdd, item.IsReadOnlyAdd);
          if (MODULE_CONFIG.FormName === 'WA_KinhPhiCongDoanFrm' && ['PersonName', 'ChucDanhChuyenMon', 'BranchID'].includes(fieldName)) {
            isReadOnlyEditVal = true;
            isReadOnlyAddVal = true;
          }
          
          if (['WA_PersonFullFrm', 'WA_PersonInFrm'].includes(MODULE_CONFIG.FormName)) {
            if (['PersonID', 'NewPersonID'].includes(fieldName)) {
              isReadOnlyEditVal = true;
              isReadOnlyAddVal = true; // Không cho sửa mã vì đã gen
            }
            if (['PersonName', 'PersonStatus'].includes(fieldName)) {
              item.required = true;
              item.IsRequired = true;
            }
          }

          globalFormSchema.push({
            name: fieldName,
            label: item.label || item.CaptionVN,
            required: _bool(item.required, item.IsRequired),
            showInAdd: _bool(item.showInAdd, item.ShowInAdd),
            showInEdit: _bool(item.showInEdit, item.ShowInEdit),
            showInFilter: _bool(item.showInFilter, item.ShowInFilter),
            isReadOnlyEdit: isReadOnlyEditVal,
            isReadOnlyAdd: isReadOnlyAddVal,
            position: item.FormPosition || item.formPosition || item.position || 'grid',
            orderNo: item.OrderNo || item.orderNo || 0,
            renderRule: (item.renderRule || '').toLowerCase().trim(),
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            validateRule: rawValidate,
            dependsOn: (item.dependsOn || item.DependsOn || '').trim(),
            visibleRule: rawVisible,
            formulaRule: formulaMatch ? formulaMatch[1].trim() : '',
            triggerApi: triggerMatch ? triggerMatch[1].trim() : ''
          });
        });

        if (Object.keys(globalDictionary).length === 0) {
          console.warn('API returned no fields for FormName:', MODULE_CONFIG.FormName);
        }
      } else {
        console.warn('API Dictionary fetch failed or empty', resConfig);
      }
      // Tự động sinh mã HTML (Không cần file .html rời nữa)
      if ((MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' || MODULE_CONFIG.UseSplitLayout) && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
        var defaultDetailTitle = MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' ? 'Chi tiết phép năm' : (MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết');
        var defaultSelectText = MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' ? 'Vui lòng chọn nhân viên để xem chi tiết' : (MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết');
        var detailWidth = MODULE_CONFIG.SplitLayoutDetailWidth || '450px';
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div class="split-master-detail-container form-${MODULE_CONFIG.FormName}">
                <div id="dynamic-grid-container"></div>
                <div id="dynamic-detail-container" style="width: ${detailWidth}; flex-shrink: 0; border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; background: var(--color-surface);">
                  <button type="button" class="detail-back-btn" style="display: none; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-primary); font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 14px; align-self: flex-start; transition: all 0.2s ease;">
                    <span class="material-symbols-outlined" style="font-size: 18px; font-weight: 600;">arrow_back</span>
                    <span>Quay lại danh sách</span>
                  </button>
                  <div class="detail-header" style="margin-bottom: 12px; font-weight: 600; font-size: 15px; color: var(--color-primary); border-bottom: 2px solid var(--color-primary-light); padding-bottom: 8px;">
                    ${defaultDetailTitle}
                  </div>
                  <div id="dynamic-detail-content" style="flex: 1; overflow-y: auto;">
                    <div style="color:var(--color-text-secondary);padding:12px;text-align:center;">${defaultSelectText}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>
            /* Desktop / Tablet defaults */
            .split-master-detail-container {
              display: flex;
              gap: 16px;
              align-items: stretch;
            }
            #dynamic-grid-container {
              flex: 1;
              min-width: 0;
            }
            .detail-back-btn {
              display: none !important;
            }
            .detail-tabs-mobile-select-wrapper {
              display: none !important;
            }

            /* Responsive styles (Mobile < 768px) */
            @media (max-width: 768px) {
              .split-master-detail-container {
                flex-direction: column !important;
                gap: 0 !important;
              }
              
              /* Hide detail container by default on mobile */
              .split-master-detail-container #dynamic-detail-container {
                display: none !important;
              }
              .split-master-detail-container #dynamic-grid-container {
                display: block !important;
              }

              /* When a row is selected and we show detail */
              .split-master-detail-container.show-detail #dynamic-detail-container {
                display: flex !important;
                width: 100% !important;
                border: none !important;
                padding: 12px 16px !important;
                box-sizing: border-box !important;
              }
              .split-master-detail-container.show-detail #dynamic-grid-container {
                display: none !important;
              }

              /* Show back button when detail is shown on mobile */
              .split-master-detail-container.show-detail .detail-back-btn {
                display: inline-flex !important;
              }

              /* Hide desktop tabs and show mobile select menu */
              .split-master-detail-container .detail-tabs-bar {
                display: none !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select-wrapper {
                display: block !important;
              }
              .split-master-detail-container .detail-tabs-mobile-select {
                appearance: none !important;
                -webkit-appearance: none !important;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
                background-repeat: no-repeat !important;
                background-position: right 14px center !important;
                background-size: 16px !important;
                padding-right: 40px !important;
                border: 1px solid var(--color-border) !important;
                background-color: var(--color-surface) !important;
                color: var(--color-text) !important;
                font-family: inherit !important;
              }

              /* Single column layout for detail fields */
              .split-master-detail-container .detail-fields-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
                padding: 16px !important;
              }

              /* Put photo box on top of form columns */
              .split-master-detail-container .detail-form-wrap {
                flex-direction: column-reverse !important;
                align-items: center !important;
                gap: 20px !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper {
                width: auto !important;
                max-width: none !important;
                margin-bottom: 0 !important;
                align-self: center !important;
              }
              .split-master-detail-container .detail-form-wrap .photo-box-wrapper .detail-img-frame {
                width: 120px !important;
                height: 120px !important;
              }
            }
          </style>
        `;
      } else {
        $container.innerHTML = `
          <div id="dynamic-btn-container" style="display:none;"></div>
          <div class="card dynamic-grid-card" style="border: none; box-shadow: none; margin-bottom: 0; border-radius: var(--radius-sm); background: var(--color-surface); overflow: visible;">
            <div class="card-body" style="padding: 0;">
              <div id="dynamic-filter-container" style="margin-bottom:16px;"></div>
              <div id="dynamic-grid-container"></div>
            </div>
          </div>
        `;
      }

      // Action Toolbar (Gắn vào Global Header thay vì cục bộ)
      var globalActions = document.getElementById('global-page-actions');
      var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');

      // Xóa các nút cũ trong global header nếu có để tránh duplicate khi re-render
      if (globalActions) globalActions.innerHTML = '';

      if (btnContainer && typeof UIActionToolbar !== 'undefined') {
        var extraBtns = [];
        if (window.FormActionPlugins) {
          window.FormActionPlugins.forEach(function (plugin) {
            if (typeof plugin.getExtraButtons === 'function') {
              var getSelected = function () { return selectedRows; };
              var onReload = function () {
                _loadData();
              };
              var btns = plugin.getExtraButtons(MODULE_CONFIG.FormName, getSelected, MODULE_CONFIG, onReload);
              if (btns && btns.length > 0) extraBtns = extraBtns.concat(btns);
            }
          });
        }

        var formNameLower = (MODULE_CONFIG.FormName || '').toLowerCase();
        var isReport = formNameLower.endsWith('report');
        var isFrm = formNameLower.endsWith('frm') || formNameLower.startsWith('frm');

        var toolbar = UIActionToolbar.create({
          onAdd: (isFrm && !MODULE_CONFIG.HideAddBtn) ? (_hasPermission('ADD') ? _openAddForm : 'DISABLED') : false,
          onEdit: (isFrm && !MODULE_CONFIG.HideEditBtn) ? (_hasPermission('EDIT') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectEdit);

            // CHẶN CHỈNH SỬA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký');
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Không thể sửa hợp đồng/phiếu đã chốt (Đã ký). Vui lòng dùng chức năng Phụ lục nếu muốn thay đổi!');
            }

            if (selectedRows.length > 1) {
              _openBulkEditForm();
            } else {
              _openEditForm(selectedRows[0]);
            }
          } : 'DISABLED') : false,
          onDelete: (isFrm && !MODULE_CONFIG.HideDeleteBtn) ? (_hasPermission('DELETE') ? function () {
            if (!selectedRows || selectedRows.length === 0) return Alert.warning(MODULE_CONFIG.AlertTitleWarning, MODULE_CONFIG.WarnSelectDelete);

            // CHẶN XÓA NẾU HỢP ĐỒNG ĐÃ CHỐT
            var hasSigned = selectedRows.find(function (r) {
              var st = (r.TrangThai || '').toString().toLowerCase();
              return st.includes('đã ký') || st.includes('quyết toán') || st === 'signed' || st === 'completed';
            });
            if (hasSigned) {
              return Alert.warning('Bị khóa', 'Tuyệt đối không được xóa hợp đồng/phiếu đã chốt (Đã ký / Đã quyết toán). Hệ thống yêu cầu lưu trữ chứng từ pháp lý!');
            }

            // Hàm thực thi xóa gọi API
            var performDelete = function () {
              if (!MODULE_CONFIG.ApiDelete) {
                return Alert.info(MODULE_CONFIG.AlertTitleInfo, MODULE_CONFIG.InfoDeleteDev);
              }

              // Xử lý từng dòng một (Vì API Gateway C# map JSON sang Model, thiếu field sẽ bị NULL update)
              var deletePromises = selectedRows.map(function (row) {
                var payload = {
                  List: MODULE_CONFIG.FormName,
                  Func: 'Delete',
                  UserName: _currentUser()
                };

                // Bơm toàn bộ dữ liệu gốc của row vào để C# binding không bị mất các cột Not Null (như Ngaytochuc)
                var rowData = Object.assign({}, row);
                rowData.IsDeleted = 1; // Flag xóa mềm

                payload.JsonData = JSON.stringify(rowData);

                return ApiClient.post(MODULE_CONFIG.ApiDelete, payload);
              });

              Promise.all(deletePromises).then(function (results) {
                var allSuccess = results.every(function (res) { return res && res.code === 0; });
                if (allSuccess) {
                  if (typeof UIToast !== 'undefined') UIToast.show(MODULE_CONFIG.ToastDelete, 'success');
                  selectedRows = [];
                  if (_isFormBuilder()) window._uiConfigCache = {};
                  _updateSelectionCounter();
                  _loadData();
                } else {
                  Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertDeleteFailed);
                }
              }).catch(function (err) {
                Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
              });
            };

            // Xóa hàng loạt
            if (selectedRows.length > 1) {
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: `Bạn có chắc muốn xóa ${selectedRows.length} dòng đã chọn?`,
                  onConfirm: performDelete
                });
              }
            } else {
              var deleteName = selectedRows[0][MODULE_CONFIG.RowNameField] || MODULE_CONFIG.TextDeleteFallback;
              if (typeof ConfirmModal !== 'undefined') {
                ConfirmModal.show({
                  title: MODULE_CONFIG.AlertTitleConfirm,
                  message: MODULE_CONFIG.ConfirmDelete.replace('{0}', deleteName),
                  onConfirm: performDelete
                });
              }
            }
          } : false) : false,
          onFilter: MODULE_CONFIG.HideFilterBtn ? false : function () {
            var filterContainer = $container.querySelector('#dynamic-filter-container');
            if (filterContainer) {
              if (filterContainer.style.display === 'none') {
                filterContainer.style.display = 'flex';
                var inputKeyword = filterContainer.querySelector('#keyword');
                if (inputKeyword) inputKeyword.focus();
              } else {
                filterContainer.style.display = 'none';
              }
            }
          },
          onPrint: MODULE_CONFIG.HidePrintBtn ? false : function () {
            if (typeof Alert !== 'undefined') {
              Alert.info('In dữ liệu', 'Đang chuẩn bị kết xuất dữ liệu ' + (MODULE_CONFIG.PageTitle || '...') + '...');
            }
          },
          onClose: false,
          extras: extraBtns
        });
        toolbar.style.display = 'inline-flex';
        toolbar.style.width = 'auto';

        // Custom Buttons
        var hasAdd = _hasPermission('ADD');
        if (isFrm && !MODULE_CONFIG.HideAddBtn) {
          var bulkAddConfig = {
            text: 'Thêm nhiều',
            icon: 'post_add',
            type: 'tool',
            disabled: !hasAdd,
            onClick: function () {
              if (!hasAdd) return typeof Alert !== 'undefined' ? Alert.warning('Từ chối', 'Bạn không có quyền thao tác chức năng này!') : null;
              var emptyRows = [];
              for (var i = 0; i < 3; i++) emptyRows.push({});
              _openBulkGridEditForm(emptyRows, true);
            }
          };
          // Dùng API addToMobilePanel để thêm vào cả desktop bar lẫn mobile action sheet
          if (typeof toolbar.addToMobilePanel === 'function') {
            toolbar.addToMobilePanel(bulkAddConfig, true); // insertFirst = true
          } else {
            // Fallback: chèn trực tiếp vào bar (trường hợp không dùng mobile wrapper)
            var btnBulkAdd = UIButton.create(bulkAddConfig);
            toolbar.insertBefore(btnBulkAdd, toolbar.firstChild);
          }
        }


        btnContainer.appendChild(toolbar);
      }

      // Search bar (FilterComponent)
      var filterContainer = $container.querySelector('#dynamic-filter-container');
      if (filterContainer && typeof FilterComponent !== 'undefined') {
        filterContainer.innerHTML = ''; // Xóa placeholder nếu có

        // 1. Tự động lấy các trường cấu hình ShowInFilter từ Database
        var dynamicFilters = globalFormSchema
          .filter(function (f) { return f.showInFilter; })
          .map(function (f) {
            // Chuyển đổi định dạng từ FormEngine sang FilterComponent
            var filterType = 'text';
            if (f.renderRule === 'dt' || f.renderRule === 'd') filterType = 'date';
            if (f.renderRule === 'nm' || f.renderRule === 'n') filterType = 'number';

            var filterObj = {
              id: f.name,
              label: f.label,
              type: filterType,
              placeholder: f.label
            };

            // Parse DataSource cho trường Select/Dropdown
            if (f.renderRule === 'sl' || f.renderRule === 'sw') {
              filterObj.type = 'select';
              filterObj.options = [];
              if (f.renderRule === 'sw') {
                filterObj.options = [{ value: 1, label: 'Có' }, { value: 0, label: 'Không' }];
              } else if (f.dataSource && f.dataSource.indexOf('STATIC:') === 0) {
                var parts = f.dataSource.replace('STATIC:', '').split(',');
                parts.forEach(function (p) {
                  var kv = p.split('|');
                  filterObj.options.push({ value: kv[0], label: kv[1] || kv[0] });
                });
              } else if (f.dataSource) {
                filterObj.dataSource = f.dataSource;
                // Tải dữ liệu động từ API (ví dụ: 'CF_BranchListFrm' hoặc 'SY_Period')
                var apiSearchUrl = MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router';
                ApiClient.post(apiSearchUrl, { List: f.dataSource, FormName: f.dataSource, Func: 'View', Limit: 1000, UserName: _currentUser() }).then(function (res) {
                  var dataList = res.list || res.records || [];
                  var options = [];
                  if (dataList && dataList.length > 0) {
                    var keys = Object.keys(dataList[0]);
                    var valKey = keys[0];
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = keys.find(function (k) { return labelRegex.test(k); }) || keys[1] || keys[0];
                    dataList.forEach(function (row) {
                      options.push({ value: row[valKey], label: row[displayKey] });
                    });
                  }

                  // Tìm phần tử select tương ứng để cập nhật các option mới tải về
                  var selectEl = document.getElementById(f.name);
                  if (selectEl) {
                    var hasSavedValue = window.currentFilters && window.currentFilters[f.name] !== undefined;
                    var currentValue = hasSavedValue ? window.currentFilters[f.name] : '';

                    selectEl.innerHTML = '<option value="">-- Tất cả --</option>';
                    options.forEach(function (opt) {
                      var optionNode = document.createElement('option');
                      optionNode.value = opt.value;
                      optionNode.innerText = opt.label;
                      if (opt.value == currentValue) optionNode.selected = true;
                      selectEl.appendChild(optionNode);
                    });

                    // Tự động chọn kỳ gần nhất nếu chưa có filter được thiết lập
                    if (!hasSavedValue && options.length > 0 && (f.name.toLowerCase().indexOf('period') >= 0 || f.name.toLowerCase().indexOf('ky') >= 0)) {
                      var now = new Date();
                      var cy = now.getFullYear();
                      var cm = now.getMonth() + 1;
                      var bestOpt = null;
                      var minDiff = Infinity;

                      function parseYearMonth(str) {
                        var clean = String(str);
                        var m1 = clean.match(/(\d{4})[-_\/\s]?(\d{1,2})/);
                        if (m1) {
                          var y = parseInt(m1[1], 10);
                          var m = parseInt(m1[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        var m2 = clean.match(/(\d{1,2})[-_\/\s]?(\d{4})/);
                        if (m2) {
                          var m = parseInt(m2[1], 10);
                          var y = parseInt(m2[2], 10);
                          if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
                            return { year: y, month: m };
                          }
                        }
                        return null;
                      }

                      options.forEach(function (opt) {
                        var parsed = parseYearMonth(opt.value) || parseYearMonth(opt.label);
                        if (parsed) {
                          var diff = Math.abs((parsed.year - cy) * 12 + (parsed.month - cm));
                          if (diff < minDiff) {
                            minDiff = diff;
                            bestOpt = opt;
                          }
                        }
                      });

                      if (!bestOpt) {
                        bestOpt = options[0];
                      }

                      if (bestOpt) {
                        currentValue = bestOpt.value;
                        selectEl.value = currentValue;
                        if (!window.currentFilters) window.currentFilters = {};
                        window.currentFilters[f.name] = currentValue;
                        // Reload data với kỳ mặc định mới chọn
                        setTimeout(function () {
                          _loadData();
                        }, 50);
                      }
                    }
                  }
                  filterObj.options = options;
                }).catch(function (err) {
                  console.error('Lỗi tải dữ liệu lọc cho ' + f.name, err);
                });
              }
            }
            return filterObj;
          });

        // 2. Gom với cấu hình cứng trong AppModules.js (nếu có) hoặc xài Keyword mặc định
        var filters = [];
        filters.push({
          id: 'keyword',
          label: MODULE_CONFIG.FilterKeywordLabel || 'Từ khóa',
          placeholder: MODULE_CONFIG.SearchPlaceholder || 'Nhập mã, tên nhân viên hoặc số chứng từ...'
        });

        if (dynamicFilters.length > 0) {
          filters = filters.concat(dynamicFilters);
        } else if (MODULE_CONFIG.Filters && MODULE_CONFIG.Filters.length > 0) {
          filters = filters.concat(MODULE_CONFIG.Filters);
        }

        var filterNode = FilterComponent.create(filters, function (values) {
          console.log('[DynamicFormEngine] Filter values callback received:', values);
          // Lưu lại toàn bộ các giá trị filter thay vì chỉ keyword
          window.currentFilters = values;
          currentKeyword = values.keyword || '';
          currentPage = 1; // Reset về trang 1 khi lọc mới
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        });
        filterContainer.appendChild(filterNode);
        filterContainer.style.display = 'none'; // Ẩn mặc định, ấn Lọc mới hiện
      }

      if (!MODULE_CONFIG.NoAutoLoad) {
        _loadData();
      }
    })
      .catch(function (err) {
        $container.innerHTML = '<div class="p-4 text-danger">' + MODULE_CONFIG.TextLoadingError + err.message + '</div>';
      });
  }

  // ── Load Data ─────────────────────────────────────────────
  var savedScrollY = 0; // Lưu vị trí scroll

  function _loadData() {
    // Đồng bộ state hiện tại vào cache để tránh mất filter khi F5
    if (currentFormName) {
      moduleStates[currentFormName] = {
        keyword: currentKeyword,
        sortCol: currentSortCol,
        sortDir: currentSortDir,
        page: currentPage,
        filters: window.currentFilters
      };
      _saveModuleStates();
    }

    var gridContainer = $container ? $container.querySelector('#dynamic-grid-container') : null;
    var existingTable = gridContainer ? gridContainer.querySelector('.table-wrapper') : null;

    if (existingTable && typeof existingTable.showLoading === 'function') {
      savedScrollY = window.scrollY;
      existingTable.showLoading(MODULE_CONFIG.TextLoading);
    } else if (gridContainer) {
      gridContainer.innerHTML = '<div class="p-4 text-center" style="color:var(--color-text-secondary);">' + MODULE_CONFIG.TextLoading + '</div>';
    }

    if (MODULE_CONFIG.ApiSearch) {
      // Gom các bộ lọc đang active (bỏ các trường rỗng)
      var activeFilters = {};
      if (window.currentFilters) {
        for (var k in window.currentFilters) {
          if (window.currentFilters[k] !== '' && window.currentFilters[k] !== null) {
            activeFilters[k] = window.currentFilters[k];
          }
        }
      }
      // Thêm Keyword vào filter JSON
      if (currentKeyword) activeFilters['Keyword'] = currentKeyword;

      // Đổi màu nút Lọc nếu có dữ liệu lọc
      var actionsContainer = document.getElementById('global-page-actions') || $container;
      if (actionsContainer) {
        var btns = actionsContainer.querySelectorAll('button');
        var filterBtn = null;
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].innerHTML.indexOf('filter_alt') !== -1 || btns[i].innerText === 'Lọc' || btns[i].getAttribute('data-tooltip') === 'Lọc / Tìm kiếm dữ liệu') {
            filterBtn = btns[i];
            break;
          }
        }
        if (filterBtn) {
          var hasFilter = Object.keys(activeFilters).length > 0;
          if (hasFilter) {
            filterBtn.classList.remove('btn-outline-secondary');
            filterBtn.classList.remove('text-dark');
            filterBtn.classList.add('btn-primary');
            filterBtn.classList.add('text-white');

            filterBtn.style.setProperty('color', '#fff', 'important');
            filterBtn.style.setProperty('background-color', 'var(--color-primary, #3b82f6)', 'important');
            filterBtn.style.setProperty('border-color', 'var(--color-primary, #3b82f6)', 'important');
          } else {
            filterBtn.classList.remove('btn-primary');
            filterBtn.classList.remove('text-white');
            if (filterBtn.className.indexOf('btn-') === -1) {
              filterBtn.classList.add('btn-outline-secondary');
            }
            filterBtn.style.color = '';
            filterBtn.style.backgroundColor = '';
            filterBtn.style.borderColor = '';
            // Xóa dấu chấm đỏ nếu có
            var badge = filterBtn.querySelector('.filter-badge');
            if (badge) badge.remove();
          }
        }
      }

      // Đọc BranchID từ session user (backend dùng để lọc theo chi nhánh)
      var _sessionUser = {};
      try { _sessionUser = JSON.parse(localStorage.getItem('pmql_user') || '{}'); } catch(e) {}
      var _branchID = (_sessionUser.BranchID || '').toString().trim();

      var query = {
        List: MODULE_CONFIG.FormName,
        Func: 'View',
        UserName: _currentUser(),
        User: _currentUser(),
        Page: currentPage,
        Limit: currentLimit,
        SortColumn: currentSortCol || '',
        SortDir: currentSortDir || '',
        Keyword: currentKeyword || ''
      };

      // Gửi BranchID vào JsonData để backend API Gateway mapping thành tham số SP
      if (_branchID) {
        // Chỉ thêm nếu user chưa chủ động filter chi nhánh
        if (!activeFilters.BranchID && !activeFilters.ChiNhanhID) {
          activeFilters.BranchID = _branchID;
        }
      }

      if (Object.keys(activeFilters).length > 0) {
        query.JsonData = JSON.stringify(activeFilters);
      }

      console.log('[DynamicFormEngine] Sending query to ApiSearch:', query);
      ApiClient.post(MODULE_CONFIG.ApiSearch, query).then(function (result) {
        // Trả lại quyền sinh sát (tính phân trang) cho C# Backend
        totalRecords = result._recordtotal || 0;
        totalPagesFromApi = result._pagetotal || 0;

        lastTimestamp = result._timestamp || '';
        var dataList = result.list || result.records || [];
        gridData = dataList.map(function (item) {
          // Lấy khóa chính từ cấu hình, nếu không có thì tự động lấy cột đầu tiên của dữ liệu
          var firstKey = Object.keys(item).length > 0 ? Object.keys(item)[0] : null;
          item.id = item[MODULE_CONFIG.PrimaryKey] || (firstKey ? item[firstKey] : null) || Math.random();
          return item;
        });

        // Bỏ đồng bộ Kỳ (PeriodID) tự động để tránh tự động lọc ngoài ý muốn khi lưu/cập nhật dữ liệu

        _renderTable();
      }).catch(function (err) {
        console.error('Lỗi tải danh sách:', err);
        if (typeof Alert !== 'undefined') Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        gridData = [];
        totalRecords = 0;
        totalPagesFromApi = 0;
        lastTimestamp = '';
        selectedRows = [];
        _updateSelectionCounter();
        _renderTable();
      });
    }
  }

  // ── Render Table ──────────────────────────────────────────
  function _renderTable() {
    var gridContainer = $container.querySelector('#dynamic-grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    lastSelectedIdx = -1;

    if (typeof UITable !== 'undefined') {
      // Dùng bộ từ điển từ DB để dịch các cột sang Tiếng Việt
      var dictionary = globalDictionary;

      // Render các cột tùy chỉnh (Sinh ra tự động từ RenderRule trong DB)
      var customRenderers = globalRenderers;

      // Sắp xếp lại globalFormSchema theo OrderNo trước khi dựng cột grid
      globalFormSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

      // Gọi UITable.createDynamic siêu cấp
      var tableEl = UITable.createDynamic(gridData, dictionary, {
        currentSort: { field: currentSortCol, dir: currentSortDir },
        onSort: function (field, dir) {
          currentSortCol = field;
          currentSortDir = dir;
          currentPage = 1;
          selectedRows = [];
          _updateSelectionCounter();
          _loadData();
        },
        actionRenderers: customRenderers,
        orderedFields: globalFormSchema
          .filter(function (f) { return f.position === 'grid'; })
          .map(function (f) { return f.name; })
      });


      var actualTable = tableEl.querySelector('table');
      if (actualTable) actualTable.classList.add('no-mobile-stack');

      // Các tính năng nâng cao (Copy, Vuốt chọn) giờ đã được chuẩn hóa trong UITable
      // (Sẽ gọi sau khi gán gridData và selectedRows)

      gridContainer.appendChild(tableEl);

      // Thêm Pagination xuống dưới Table
      if (typeof Pagination !== 'undefined') {
        var paginationEl = Pagination.create({
          totalItems: totalRecords,
          totalPages: totalPagesFromApi,
          timestamp: lastTimestamp,
          itemsPerPage: currentLimit,
          currentPage: currentPage,
          onPageChange: function (page) {
            currentPage = page;
            _loadData();
          },
          onLimitChange: function (newLimit) {
            currentLimit = newLimit;
            currentPage = 1;
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          },
          onRefresh: function () {
            selectedRows = [];
            _updateSelectionCounter();
            _loadData();
          }
        });
        gridContainer.appendChild(paginationEl);
      }

      // Phục hồi vị trí cuộn trang
      if (savedScrollY > 0) {
        setTimeout(function () { window.scrollTo(0, savedScrollY); }, 10);
      }

      var tbody = tableEl.querySelector('tbody');
      if (tbody) {
        // Phục hồi trạng thái Active cho các dòng đã chọn trước đó (Cross-page Selection)
        var allTrs = Array.from(tbody.querySelectorAll('tr'));
        allTrs.forEach(function (tr, idx) {
          var rData = gridData[idx];
          if (rData && selectedRows.find(function (sr) { return sr.id === rData.id; })) {
            tr.classList.add('active');
          }
        });
        // Lắng nghe sự kiện từ Global Drag Select (Trạm gác UITable)
        tbody.addEventListener('rowSelectionToggled', function (e) {
          var rData = gridData[e.detail.rowIndex];
          if (!rData) return;
          if (e.detail.action === 'add') {
            if (!selectedRows.find(function (sr) { return sr.id === rData.id; })) selectedRows.push(rData);
          } else {
            selectedRows = selectedRows.filter(function (sr) { return sr.id !== rData.id; });
          }
          _updateSelectionCounter();
        });

        tbody.addEventListener('click', function (e) {
          if (typeof tbody.isDragSelecting === 'function' && tbody.isDragSelecting()) return;
          var tr = e.target.closest('tr');
          if (!tr || tr.children.length === 1) return;
          var idx = Array.from(tbody.children).indexOf(tr);
          var allTrsList = Array.from(tbody.querySelectorAll('tr'));
          var rData = gridData[idx];

          if (e.shiftKey && lastSelectedIdx !== -1) {
            // Shift + Click: Chọn một dải
            document.getSelection().removeAllRanges(); // Tránh bôi đen text
            var start = Math.min(idx, lastSelectedIdx);
            var end = Math.max(idx, lastSelectedIdx);
            for (var i = start; i <= end; i++) {
              allTrsList[i].classList.add('active');
              if (!selectedRows.find(function (sr) { return sr.id === gridData[i].id; })) {
                selectedRows.push(gridData[i]);
              }
            }
          } else if (e.ctrlKey || e.metaKey) {
            // Ctrl + Click: Chọn thêm hoặc Bỏ chọn
            tr.classList.toggle('active');
            if (tr.classList.contains('active')) {
              if (!selectedRows.find(function (sr) { return sr.id === rData.id; })) selectedRows.push(rData);
            } else {
              selectedRows = selectedRows.filter(function (sr) { return sr.id !== rData.id; });
            }
            lastSelectedIdx = idx;
          } else {
            // Click don: Chon 1 dong (clear dong cu), click lai de bo chon
            var wasActive = tr.classList.contains('active');
            allTrsList.forEach(function (r) { r.classList.remove('active'); });
            selectedRows = [];
            if (!wasActive) {
              tr.classList.add('active');
              selectedRows.push(rData);
            }
            lastSelectedIdx = wasActive ? -1 : idx;
          }
          _updateSelectionCounter();
        });
        tbody.addEventListener('dblclick', function (e) {
          var tr = e.target.closest('tr');
          if (!tr) return;

          var idx = Array.from(tbody.children).indexOf(tr);
          var rData = gridData[idx];
          if (!rData) return;

          if (typeof MODULE_CONFIG.onRowDblClick === 'function') {
            MODULE_CONFIG.onRowDblClick(rData);
            return;
          }

          if (MODULE_CONFIG.HideEditBtn && !MODULE_CONFIG.AllowDblClickToView) return;

          // Nếu đang chọn nhiều dòng (và dòng được double click nằm trong số đó) thì mở sửa hàng loạt
          if (selectedRows.length > 1 && selectedRows.find(function (sr) { return sr.id === rData.id; })) {
            _openBulkEditForm();
          } else {
            // Mở form sửa cho dòng vừa được double click (bất kể trước đó có được bôi đen hay chưa)
            _openEditForm(rData);
          }
        });
      }

      _updateSelectionCounter();
    }
  }

  function _clearSelection() {
    selectedRows = [];
    _updateSelectionCounter();
    var checkboxes = $container.querySelectorAll('tbody .form-check-input');
    if (checkboxes) checkboxes.forEach(function (cb) { cb.checked = false; });
    var checkAll = $container.querySelector('thead .form-check-input');
    if (checkAll) checkAll.checked = false;
    var allTrs = $container.querySelectorAll('tbody tr');
    if (allTrs) allTrs.forEach(function (tr) { tr.classList.remove('active', 'selected', 'table-active', 'table-primary'); });
    var splitContainer = $container.querySelector('.split-master-detail-container');
    if (splitContainer) {
      splitContainer.classList.remove('show-detail');
    }
  }

  function _updateSelectionCounter() {
    _saveSelectedRows();

    var globalActions = document.getElementById('global-page-actions');
    var btnContainer = globalActions || $container.querySelector('#dynamic-btn-container');
    if (!btnContainer) return;

    var actualToolbar = btnContainer.firstElementChild; // .button-bar
    if (!actualToolbar) return;

    var counter = actualToolbar.querySelector('#selection-counter');
    if (!counter) {
      // Bọc các nút bấm hiện tại vào một vùng cuộn riêng để bảo toàn background trắng của toolbar gốc
      if (!actualToolbar.querySelector('.btn-scroll-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'btn-scroll-wrapper';
        while (actualToolbar.firstChild) {
          wrapper.appendChild(actualToolbar.firstChild);
        }
        actualToolbar.appendChild(wrapper);
      }

      if (!document.getElementById('selection-counter-style')) {
        var style = document.createElement('style');
        style.id = 'selection-counter-style';
        style.innerHTML = `
          /* Toolbar gốc: Cho phép rớt dòng để chứa counter ở dưới trên mobile */
          #dynamic-btn-container .button-bar,
          .page-title-actions .button-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
          }
          /* Wrapper chứa nút bấm: Cuộn ngang, không rớt dòng */
          .btn-scroll-wrapper {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            flex: 1 1 auto;
            min-width: 0;
            gap: 8px;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding-bottom: 2px;
          }
          .btn-scroll-wrapper::-webkit-scrollbar {
            display: none;
          }
          /* Badge Đã chọn */
          #selection-counter {
            margin-left: auto;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-primary);
            background: var(--color-primary-light);
            padding: 4px 8px 4px 12px;
            border-radius: 20px;
            white-space: nowrap;
            flex-shrink: 0;
            display: none;
            align-items: center;
            gap: 4px;
          }
          @media (max-width: 768px) {
            .btn-scroll-wrapper {
              flex: 1 1 100%;
              width: 100%;
            }
            #selection-counter {
              margin-left: 0;
              margin-top: 4px;
              width: 100%;
              flex: 1 1 100%;
              justify-content: center;
            }
          }
        `;
        document.head.appendChild(style);
      }
      counter = document.createElement('div');
      counter.id = 'selection-counter';
      actualToolbar.appendChild(counter);
    }

    if (selectedRows.length > 0) {
      counter.style.display = 'inline-flex';
      counter.innerHTML = `
        <span>Đã chọn ${selectedRows.length} dòng</span>
        <span class="material-symbols-outlined btn-clear-selection" title="Bỏ chọn" style="font-size: 16px; cursor: pointer; border-radius: 50%; padding: 2px;">close</span>
      `;
      var btnClear = counter.querySelector('.btn-clear-selection');
      if (btnClear) {
        btnClear.onmouseover = function () { this.style.backgroundColor = 'rgba(0,0,0,0.05)'; };
        btnClear.onmouseout = function () { this.style.backgroundColor = 'transparent'; };
        btnClear.onclick = _clearSelection;
      }
    } else {
      counter.style.display = 'none';
      counter.innerHTML = '';
    }

    if (MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' || MODULE_CONFIG.UseSplitLayout) {
      _updateDetailView();
    }
  }

  function _updateDetailView() {
    var detailContent = $container.querySelector('#dynamic-detail-content');
    if (!detailContent) return;

    var splitContainer = $container.querySelector('.split-master-detail-container');

    if (!selectedRows || selectedRows.length === 0) {
      if (splitContainer) {
        splitContainer.classList.remove('show-detail');
      }
      var selectText = MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' ? 'Vui lòng chọn nhân viên để xem chi tiết' : (MODULE_CONFIG.SplitLayoutSelectText || 'Vui lòng chọn dòng để xem chi tiết');
      detailContent.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">' + selectText + '</div>';
      var detailHeader = $container.querySelector('.detail-header');
      if (detailHeader) {
        detailHeader.textContent = MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' ? 'Chi tiết phép năm' : (MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết');
      }
      return;
    }

    if (splitContainer) {
      splitContainer.classList.add('show-detail');
    }

    // Set up mobile back button click handler
    var backBtn = $container.querySelector('.detail-back-btn');
    if (backBtn) {
      backBtn.onclick = _clearSelection;
    }

    var row = selectedRows[0];
    detailContent.innerHTML = '';

    var detailHeader = $container.querySelector('.detail-header');
    if (detailHeader) {
      var defaultDetailTitle = MODULE_CONFIG.FormName === 'WA_QuanLyNghiPhepNamFrm' ? 'Chi tiết phép năm' : (MODULE_CONFIG.DetailTabs[0].label || 'Chi tiết');
      var nameVal = row.PersonName || row.TenPhuCap || row[MODULE_CONFIG.PrimaryKey] || '';
      detailHeader.textContent = defaultDetailTitle + ': ' + nameVal;
    }

    if (MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0) {
      // 1. Render master fields card if DetailFormFields is defined
      var masterGrid = null;
      if (MODULE_CONFIG.DetailFormFields && (!MODULE_CONFIG.DetailTabs || MODULE_CONFIG.DetailTabs.length === 0)) {
        masterGrid = document.createElement('div');
        masterGrid.className = 'detail-master-grid';
        masterGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; margin-bottom: 20px; padding: 14px; background: var(--color-background, #f8fafc); border-radius: 8px; border: 1px solid var(--color-border, #e2e8f0);';

        MODULE_CONFIG.DetailFormFields.forEach(function (f) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';
          if (f.format === 'boolean') {
            fldDiv.style.flexDirection = 'row';
            fldDiv.style.alignItems = 'center';
            fldDiv.style.gap = '8px';
            fldDiv.style.padding = '4px 0';
          }

          var label = document.createElement('span');
          label.textContent = f.label;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[f.name];
          var valFormatted = '';
          if (rawVal === null || rawVal === undefined) {
            valFormatted = '—';
          } else if (f.format === 'money') {
            var n = parseFloat(rawVal);
            valFormatted = isNaN(n) ? rawVal : n.toLocaleString('vi-VN');
            valSpan.style.fontFamily = 'monospace';
            valSpan.style.fontWeight = '600';
          } else if (f.format === 'boolean') {
            var isTrue = (rawVal === true || rawVal === 1 || String(rawVal) === '1' || String(rawVal).toLowerCase() === 'true');
            valFormatted = isTrue
              ? `<span style="color:var(--color-success); display:inline-flex; align-items:center; gap:4px; font-weight:600;"><span class="material-symbols-outlined" style="font-size:18px;">check_box</span>Có</span>`
              : `<span style="color:var(--color-text-secondary); display:inline-flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">check_box_outline_blank</span>Không</span>`;
          } else {
            valFormatted = rawVal;
          }

          if (f.format === 'boolean') {
            fldDiv.innerHTML = valFormatted + `<span style="font-size: 12px; font-weight: 500; color: var(--color-text);">${f.label}</span>`;
          } else {
            valSpan.innerHTML = valFormatted;
            valSpan.style.fontSize = '13px';
            valSpan.style.color = 'var(--color-text, #1e293b)';
            valSpan.style.fontWeight = '500';
            fldDiv.appendChild(label);
            fldDiv.appendChild(valSpan);
          }
          masterGrid.appendChild(fldDiv);
        });
        detailContent.appendChild(masterGrid);
      }

      // 2. Render Tabs Bar if there are multiple tabs
      if (MODULE_CONFIG.DetailTabs.length > 1) {
        var tabsBar = document.createElement('div');
        tabsBar.className = 'detail-tabs-bar';
        tabsBar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border);';

        if (typeof activeDetailTabIdx === 'undefined' || activeDetailTabIdx >= MODULE_CONFIG.DetailTabs.length) {
          activeDetailTabIdx = 0;
        }

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var tabBtn = document.createElement('button');
          tabBtn.type = 'button';
          tabBtn.textContent = tab.label;
          var isActive = (idx === activeDetailTabIdx);

          tabBtn.style.cssText = 'padding: 8px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; font-family: inherit;';

          if (isActive) {
            tabBtn.style.backgroundColor = 'var(--color-primary)';
            tabBtn.style.color = '#ffffff';
            tabBtn.style.fontWeight = '600';
            tabBtn.style.boxShadow = 'var(--shadow-sm)';
          } else {
            tabBtn.style.backgroundColor = 'transparent';
            tabBtn.style.color = 'var(--color-text-secondary)';

            tabBtn.onmouseover = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'var(--color-surface)';
                this.style.color = 'var(--color-text)';
              }
            };
            tabBtn.onmouseout = function () {
              if (idx !== activeDetailTabIdx) {
                this.style.backgroundColor = 'transparent';
                this.style.color = 'var(--color-text-secondary)';
              }
            };
          }

          tabBtn.onclick = function () {
            activeDetailTabIdx = idx;
            _updateDetailView();
          };
          tabsBar.appendChild(tabBtn);
        });
        detailContent.appendChild(tabsBar);

        // --- Mobile Dropdown Select ---
        var selectWrapper = document.createElement('div');
        selectWrapper.className = 'detail-tabs-mobile-select-wrapper';
        selectWrapper.style.cssText = 'margin-bottom: 16px; width: 100%; position: relative;';

        var selectEl = document.createElement('select');
        selectEl.className = 'detail-tabs-mobile-select ui-input';
        selectEl.style.cssText = 'width: 100%; padding: 10px 14px; font-size: 14px; font-weight: 600; border: 1px solid var(--color-border); border-radius: 8px; background-color: var(--color-surface); color: var(--color-text); cursor: pointer; height: 42px;';

        MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
          var opt = document.createElement('option');
          opt.value = idx;
          opt.textContent = tab.label;
          if (idx === activeDetailTabIdx) {
            opt.selected = true;
          }
          selectEl.appendChild(opt);
        });

        selectEl.onchange = function () {
          activeDetailTabIdx = parseInt(this.value);
          _updateDetailView();
        };

        selectWrapper.appendChild(selectEl);
        detailContent.appendChild(selectWrapper);
      }

      // 3. Render active tab content
      var currentTabIdx = (typeof activeDetailTabIdx !== 'undefined' && activeDetailTabIdx < MODULE_CONFIG.DetailTabs.length) ? activeDetailTabIdx : 0;
      var tabDef = MODULE_CONFIG.DetailTabs[currentTabIdx];

      var tabContentContainer = document.createElement('div');
      tabContentContainer.className = 'detail-tab-content';
      detailContent.appendChild(tabContentContainer);

      if (tabDef.type === 'form') {
        // Form-type tab (personal details form next to employee photo box)
        var formWrap = document.createElement('div');
        formWrap.className = 'detail-form-wrap';
        formWrap.style.cssText = 'display: flex; gap: 16px; align-items: flex-start;';

        var fieldsGrid = document.createElement('div');
        fieldsGrid.className = 'detail-fields-grid';
        fieldsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px 24px; flex: 1; background: var(--color-surface, #fff); padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid var(--color-border, #e2e8f0);';

        var fieldsToRender = tabDef.fields || [];
        fieldsToRender.forEach(function (fName) {
          var fldDiv = document.createElement('div');
          fldDiv.style.cssText = 'display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px dashed var(--color-border-subtle, #f1f5f9);';

          var labelText = (tabDef.headers && tabDef.headers[fName]) ? tabDef.headers[fName] : (globalDictionary[fName] || fName);
          if (typeof labelText === 'string') {
            labelText = labelText.replace(/\s*:\s*$/, '');
          }

          var label = document.createElement('span');
          label.textContent = labelText;
          label.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--color-text-tertiary, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px;';

          var valSpan = document.createElement('span');
          var rawVal = row[fName];
          var valFormatted = '';
          if (rawVal === null || rawVal === undefined) {
            valFormatted = '—';
          } else {
            if (fName.toLowerCase().indexOf('ngay') >= 0 && rawVal) {
              try {
                var d = new Date(rawVal);
                if (!isNaN(d.getTime())) {
                  valFormatted = d.toLocaleDateString('vi-VN');
                } else {
                  valFormatted = rawVal;
                }
              } catch (e) {
                valFormatted = rawVal;
              }
            } else if (fName === 'PersonStatus') {
              var statusMap = {
                '1': 'Thử việc',
                '4': 'Chính thức',
                '8': 'Nghỉ việc'
              };
              valFormatted = statusMap[String(rawVal)] || rawVal;
            } else {
              valFormatted = rawVal;
            }
          }

          valSpan.innerHTML = valFormatted;
          valSpan.style.fontSize = '14px';
          valSpan.style.color = 'var(--color-text, #0f172a)';
          valSpan.style.fontWeight = '600';

          fldDiv.appendChild(label);
          fldDiv.appendChild(valSpan);
          fieldsGrid.appendChild(fldDiv);
        });

        formWrap.appendChild(fieldsGrid);

        var isPersonForm = String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personfullfrm' || String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personinfrm' || String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personquitfrm';
        var isCandidateForm = String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_danhsachungvienfrm';
        if (isPersonForm || isCandidateForm) {
          console.log('[PHOTO DEBUG] Detail View - row:', row);
          var photoBox = document.createElement('div');
          photoBox.className = 'photo-box-wrapper';
          photoBox.style.cssText = 'width: 180px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; border: none; padding: 0; background: transparent;';

          var imgFrame = document.createElement('div');
          imgFrame.className = 'detail-img-frame';
          imgFrame.style.cssText = 'width: 160px; height: 160px; border: 4px solid var(--color-surface, #fff); border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.08);';

          var img = document.createElement('img');
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

          var defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='175' viewBox='0 0 140 175' fill='%23f1f5f9'><rect width='100%25' height='100%25'/><circle cx='70' cy='70' r='30' fill='%23cbd5e1'/><path d='M30 140 C30 110, 110 110, 110 140 Z' fill='%23cbd5e1'/><text x='70' y='160' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'>Kh%C3%B4ng%20c%C3%B3%20%E1%BA%A3nh</text></svg>";
          var rawContent = '';
          var fileNameVal = '';
          if (row) {
            for (var key in row) {
              var keyLower = key.toLowerCase();
              if (keyLower === 'content') {
                rawContent = row[key];
              } else if (keyLower === 'filename') {
                fileNameVal = row[key];
              }
            }
          }

          var imgIdVal = row ? (isPersonForm ? (row.PersonID || '') : (row.CandidateID || '')) : '';
          var isLoadingHex = false;

          if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
            var mimeType = 'image/jpeg';
            if (fileNameVal) {
              var ext = fileNameVal.split('.').pop().toLowerCase();
              if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';
            }
            try {
              if (/^0x/i.test(rawContent)) {
                // Chuỗi hex dạng 0xFFD8FF...
                var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
                var bytes = new Uint8Array(hexStr.length / 2);
                for (var bi = 0; bi < bytes.length; bi++) {
                  bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
                }
                var blob = new Blob([bytes], { type: mimeType });
                img.src = URL.createObjectURL(blob);
              } else {
                // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
                img.src = 'data:' + mimeType + ';base64,' + rawContent;
              }
              isLoadingHex = true;
            } catch (err) {
              console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
            }
          }

          var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

          if (!isLoadingHex) {
            if (imgIdVal) {
              var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
              img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
            } else {
              img.src = defaultPhoto;
            }
          }

          img.onerror = function () {
            if (isLoadingBase64) {
              isLoadingBase64 = false;
              if (imgIdVal) {
                var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
                img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
                return;
              }
            }
            if (img.src !== defaultPhoto) {
              img.src = defaultPhoto;
            }
          };

          imgFrame.appendChild(img);
          photoBox.appendChild(imgFrame);
          formWrap.appendChild(photoBox);
        }

        tabContentContainer.appendChild(formWrap);
      } else if (tabDef.type === 'kv-form') {
        // KV-Form tab: gọi API riêng và hiển thị từng record dướng form nhãn-giá trị
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải dữ liệu...</div>';
        var pkFieldKV = MODULE_CONFIG.PrimaryKey || 'PersonID';
        var pkValKV = row[pkFieldKV] || '';
        var filterKV = {};
        filterKV[tabDef.filterField || pkFieldKV] = pkValKV;
        var payloadKV = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterKV) };
        var MONEY_KV = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
        var DATE_KV = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payloadKV).then(function (resKV) {
          var dataKV = resKV.list || resKV.records || [];
          tabContentContainer.innerHTML = '';
          if (dataKV.length === 0) {
            var emptyKV = document.createElement('div');
            emptyKV.style.cssText = 'color:var(--color-text-secondary);padding:24px;text-align:center;font-size:13px;';
            emptyKV.textContent = tabDef.emptyText || 'Chưa có dữ liệu';
            tabContentContainer.appendChild(emptyKV);
            return;
          }
          var fieldsKV = tabDef.fields || Object.keys(dataKV[0]).filter(function (k) { return !k.startsWith('_') && k !== 'UserAutoID' && k !== 'PersonID'; });
          dataKV.forEach(function (rec, idx) {
            var card = document.createElement('div');
            card.style.cssText = 'background:var(--color-background,#f8fafc);border:1px solid var(--color-border);border-radius:8px;padding:14px 16px;margin-bottom:12px;';
            if (dataKV.length > 1) {
              var cardHdr = document.createElement('div');
              cardHdr.style.cssText = 'font-size:11px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--color-border);';
              cardHdr.textContent = (tabDef.cardTitle || 'Bản ghi') + ' ' + (idx + 1);
              card.appendChild(cardHdr);
            }
            var grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 20px;';
            fieldsKV.forEach(function (fk) {
              var fldDiv = document.createElement('div');
              fldDiv.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
              var lbl = document.createElement('span');
              var lblTxt = (tabDef.headers && tabDef.headers[fk]) ? tabDef.headers[fk] : (globalDictionary[fk] || fk);
              if (typeof lblTxt === 'string') { lblTxt = lblTxt.replace(/\s*:\s*$/, ''); }
              lbl.textContent = lblTxt;
              lbl.style.cssText = 'font-size:11px;font-weight:600;color:var(--color-text-secondary,#64748b);text-transform:uppercase;letter-spacing:0.5px;';
              var val = document.createElement('span');
              var rawV = rec[fk];
              var displayV = '';
              if (rawV === null || rawV === undefined || rawV === '') {
                displayV = '—';
                val.style.color = 'var(--color-text-secondary)';
              } else if (DATE_KV.indexOf(fk) >= 0) {
                try { var dkv = new Date(rawV); displayV = !isNaN(dkv.getTime()) ? dkv.toLocaleDateString('vi-VN') : rawV; } catch (e) { displayV = rawV; }
                val.style.color = 'var(--color-text)';
              } else if (MONEY_KV.indexOf(fk) >= 0) {
                var nkv = parseFloat(rawV);
                displayV = (!isNaN(nkv) ? nkv.toLocaleString('vi-VN') : rawV) + ' đ';
                val.style.cssText = 'font-family:monospace;font-weight:600;font-size:14px;color:var(--color-primary);';
              } else {
                displayV = rawV;
                val.style.color = 'var(--color-text)';
              }
              val.textContent = displayV;
              val.style.fontSize = '13px';
              val.style.fontWeight = val.style.fontWeight || '500';
              fldDiv.appendChild(lbl);
              fldDiv.appendChild(val);
              grid.appendChild(fldDiv);
            });
            card.appendChild(grid);
            tabContentContainer.appendChild(card);
          });
        }).catch(function () {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu</div>';
        });
      } else if (tabDef.type === 'attachments') {
        _renderAttachmentsTab(tabDef, tabContentContainer, false, row);
      } else {
        // Table tab
        tabContentContainer.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải chi tiết...</div>';
        var pkField = MODULE_CONFIG.PrimaryKey || 'PersonID';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
          var data = res.list || res.records || [];
          // Lọc bỏ hàng trống: nếu tất cả field hiển thị đều là null/''/'0'/0 thì bỏ qua
          if (tabDef.fields && tabDef.fields.length > 0) {
            var SKIP_KEYS = ['UserAutoID', 'PersonID', 'SapCaID', 'MaHopDong', 'RelationID', 'MaPhuCap'];
            var displayKeys = tabDef.fields.filter(function (k) { return SKIP_KEYS.indexOf(k) < 0; });
            data = data.filter(function (r) {
              return displayKeys.some(function (k) {
                var v = r[k];
                if (v === null || v === undefined || v === '') return false;
                if (String(v).trim() === '0' || String(v).trim() === '0.00') return false;
                return true;
              });
            });
          }
          tabContentContainer.innerHTML = '';

          if (data.length === 0) {
            var emptyText = tabDef.emptyText || MODULE_CONFIG.SplitLayoutEmptyText || 'Không có dữ liệu chi tiết';
            var emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'color:var(--color-text-secondary);padding:12px;text-align:center;';
            emptyDiv.textContent = emptyText;
            tabContentContainer.appendChild(emptyDiv);
            return;
          }

          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });

          // Xác định kiểu cột 1 lần duy nhất để căn chỉnh đồng nhất header & cell
          var MONEY_FIELDS = ['MucLuong', 'LuongBaoHiem', 'PCCongTac', 'PCTrachNhiem', 'PCKhac', 'LuongCoBan', 'MucDong'];
          var DATE_FIELDS = ['NgaySinh', 'NgayVaoLam', 'NgayHopDong', 'NgayHetHopDong', 'NgayThuViec', 'SocialDate', 'NgayKetThucBH', 'ThoiGianHuongBHYT', 'NgayKyHopDong', 'NgayCoHieuLuc', 'NgayHetHieuLuc', 'NgayThayDoi', 'NgayCapNhat', 'FromDate', 'ToDate', 'TuNgay', 'DenNgay', 'LogDate', 'GiamTruTuThang', 'GiamTruDenThang'];
          var NUMBER_FIELDS = ['SoNgay', 'SoNgayDaSuDung', 'SoNgayConLai', 'PhepThamNien', 'PhepTonNamTruoc', 'SoNgayPhepTet', 'SoNgayPhepOm', 'Nam', 'SoLuong', 'SoNgayNghi'];
          var TEXT_WRAP_FIELDS = ['NoiDung', 'GhiChu', 'NoiDungKTKL', 'NoiDungPhuCap', 'Notes'];
          var colType = {};
          keys.forEach(function (k) {
            if (NUMBER_FIELDS.indexOf(k) >= 0) { colType[k] = 'number'; }
            else if (DATE_FIELDS.indexOf(k) >= 0) { colType[k] = 'date'; }
            else if (MONEY_FIELDS.indexOf(k) >= 0) { colType[k] = 'money'; }
            else if (TEXT_WRAP_FIELDS.indexOf(k) >= 0) { colType[k] = 'textwrap'; }
            else {
              var kl = k.toLowerCase();
              // Tránh match SoNgay* (số ngày) thành kiểu date
              if ((kl.indexOf('ngay') >= 0 && !kl.startsWith('so')) || kl.indexOf('date') >= 0) { colType[k] = 'date'; }
              else if (kl.indexOf('tien') >= 0 || kl.indexOf('luong') >= 0 || kl === 'mucdong' || kl === 'mucluong') { colType[k] = 'money'; }
              else if (kl.indexOf('noidung') >= 0 || kl.indexOf('ghichu') >= 0 || kl === 'notes') { colType[k] = 'textwrap'; }
              else { colType[k] = 'text'; }
            }
          });

          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;table-layout:auto;';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            if (typeof label === 'string') { label = label.replace(/\s*:\s*$/, ''); }
            th.textContent = label;
            var thAlign = (colType[k] === 'money') ? 'right' : 'left';
            th.style.cssText = 'padding:8px 10px;border-bottom:2px solid var(--color-border);background:var(--color-surface);position:sticky;top:0;text-align:' + thAlign + ';white-space:nowrap;color:var(--color-text-secondary);font-weight:600;';
            if (colType[k] === 'textwrap') { th.style.minWidth = '140px'; }
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r, rIdx) {
            var tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom:1px solid var(--color-border);' + (rIdx % 2 === 1 ? 'background:var(--color-background,#f8fafc);' : '');
            keys.forEach(function (k) {
              var td = document.createElement('td');
              var val = r[k];
              var ct = colType[k];
              if (ct === 'date' && val) {
                try { var dv = new Date(val); if (!isNaN(dv.getTime())) { val = dv.toLocaleDateString('vi-VN'); } } catch (e) { }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              } else if (ct === 'money') {
                var n = parseFloat(val);
                if (!isNaN(n) && val !== '' && val != null) { val = n.toLocaleString('vi-VN'); }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;font-weight:500;color:var(--color-text);';
              } else if (ct === 'number') {
                var nv = parseFloat(val);
                if (!isNaN(nv) && val !== '' && val != null) {
                  // Hiển thị số nguyên gọn (12.00 → 12), thập phân giữ max 2 chữ số
                  val = Number.isInteger(nv) ? nv.toLocaleString('vi-VN') : nv.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
                }
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:right;font-family:monospace;color:var(--color-text);';
              } else if (ct === 'textwrap') {
                td.style.cssText = 'padding:8px 10px;white-space:normal;word-break:break-word;min-width:140px;max-width:240px;color:var(--color-text);';
              } else {
                td.style.cssText = 'padding:8px 10px;white-space:nowrap;text-align:left;color:var(--color-text);';
              }
              td.textContent = val != null ? val : '';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          tabContentContainer.appendChild(wrap);
        }).catch(function (err) {
          tabContentContainer.innerHTML = '<div style="color:var(--color-danger);padding:12px;text-align:center;">Lỗi tải dữ liệu chi tiết</div>';
        });
      }
    }
  }

  // ── Modal Form ────────────────────────────────────────────
  function _openBulkAddForm() {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    // Form đích
    var targetFormInput = UIInput.createText({
      label: 'Nhập cho Tên Form nào? (*)',
      required: true,
      placeholder: 'Ví dụ: frmCustomer'
    });
    body.appendChild(targetFormInput);

    // Vùng cuộn chứa Table
    var tableWrap = document.createElement('div');
    tableWrap.style.overflowX = 'auto';
    tableWrap.style.border = '1px solid var(--color-border)';
    tableWrap.style.borderRadius = '8px';

    var table = document.createElement('table');
    table.className = 'table table-hover mb-0';
    table.style.minWidth = '800px';

    var thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:140px;">Tên Cột (Database) *</th>
        <th style="width:160px;">Tiêu đề (Tiếng Việt)</th>
        <th style="width:120px;">Loại Input</th>
        <th style="width:70px; text-align:center;">Bắt buộc</th>
        <th style="width:160px;">Nguồn dữ liệu (API/STATIC)</th>
        <th style="width:80px;">Vị trí</th>
        <th style="width:150px;" title="Ví dụ: TrangThai=huy|doi">VisibleRule</th>
        <th style="width:60px; text-align:center;">Thêm</th>
        <th style="width:60px; text-align:center;">Sửa</th>
        <th style="width:60px; text-align:center;">Lọc</th>
        <th style="width:40px;"></th>
      </tr>
    `;
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    body.appendChild(tableWrap);

    // Nút thêm dòng
    var btnAddRow = document.createElement('button');
    btnAddRow.className = 'btn btn-outline-primary d-flex align-items-center mt-2';
    btnAddRow.style.width = 'fit-content';
    btnAddRow.innerHTML = '<span class="material-symbols-outlined me-1" style="font-size:18px;">add</span> Thêm dòng mới';

    // Logic đẻ ra dòng mới
    function addRow() {
      var tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-1"><input type="text" class="ui-input" name="FieldName" placeholder="Ví dụ: CustomerID"></td>
        <td class="p-1"><input type="text" class="ui-input" name="CaptionVN" placeholder="Tiêu đề hiển thị"></td>
        <td class="p-1">
          <select class="ui-input" name="FormatID">
            <option value="">Chữ (Text)</option>
            <option value="nm">Số (Number)</option>
            <option value="dt">Ngày tháng (Date)</option>
            <option value="sw">Công tắc (Switch)</option>
            <option value="sl">Dropdown (Select)</option>
          </select>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="IsRequired" value="1" style="cursor: pointer; margin-top: 0;">
          </div>
        </td>
        <td class="p-1"><input type="text" class="ui-input" name="DataSource" placeholder="/api/... hoặc STATIC:..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="FormPosition" placeholder="grid/6/4/12..."></td>
        <td class="p-1"><input type="text" class="ui-input" name="VisibleRule" placeholder="VD: TrangThai=huy|doi"></td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInAdd" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Thêm Mới">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInEdit" value="1" checked style="cursor: pointer; margin-top: 0;" title="Hiển thị khi Chỉnh Sửa">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <div class="d-flex justify-content-center h-100 align-items-center">
            <input type="checkbox" class="modern-checkbox" name="ShowInFilter" value="1" style="cursor: pointer; margin-top: 0;" title="Hiển thị bộ lọc">
          </div>
        </td>
        <td class="p-1 text-center align-middle">
          <button class="btn btn-sm btn-tool text-danger p-1 mt-1" onclick="this.closest('tr').remove()" title="Xóa dòng">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Mặc định tạo sẵn 3 dòng
    addRow(); addRow(); addRow();

    btnAddRow.onclick = addRow;
    body.appendChild(btnAddRow);

    var footerNode = document.createElement('div');
    footerNode.style.cssText = 'display: flex; gap: 12px;';
    footerNode.innerHTML =
      UIButton.createHTML({ text: 'Hủy bỏ', className: 'btn-close-bulk', type: 'secondary' }) +
      UIButton.createHTML({ text: 'Lưu toàn bộ', className: 'btn-submit-bulk', type: 'primary', icon: 'save' });

    var modalBulk = UIModal.show({
      title: 'Thêm Nhiều Trường (Lưới nhập liệu động)',
      content: body,
      width: '1200px', // Cho modal rộng ra để chứa bảng nhiều cột hơn
      footer: footerNode
    });

    footerNode.querySelector('.btn-close-bulk').onclick = function () {
      modalBulk.closeNow();
    };

    footerNode.querySelector('.btn-submit-bulk').onclick = function () {
      var targetForm = targetFormInput.querySelector('input').value.trim();
      if (!targetForm) return Alert.warning('Cảnh báo', 'Vui lòng nhập Tên Form đích!');

      var rows = tbody.querySelectorAll('tr');
      var payloads = [];

      rows.forEach(function (tr) {
        var fieldName = tr.querySelector('[name="FieldName"]').value.trim();
        var captionVN = tr.querySelector('[name="CaptionVN"]').value.trim() || fieldName;
        var formatID = tr.querySelector('[name="FormatID"]').value;
        var isRequired = tr.querySelector('[name="IsRequired"]').checked ? 1 : 0;
        var dataSource = tr.querySelector('[name="DataSource"]').value.trim();
        var formPosition = tr.querySelector('[name="FormPosition"]').value.trim();
        var visibleRule = tr.querySelector('[name="VisibleRule"]').value.trim();
        var showInAdd = tr.querySelector('[name="ShowInAdd"]').checked ? 1 : 0;
        var showInEdit = tr.querySelector('[name="ShowInEdit"]').checked ? 1 : 0;

        if (fieldName) {
          payloads.push({
            AutoID: '',
            FormName: targetForm,
            FieldName: fieldName,
            CaptionVN: captionVN,
            FormatID: formatID,
            IsRequired: isRequired,
            DataSource: dataSource,
            ShowInAdd: showInAdd,
            ShowInEdit: showInEdit,
            FormPosition: formPosition,
            VisibleRule: visibleRule,
            OrderNo: 0
          });
        }
      });

      if (payloads.length === 0) return Alert.warning('Lỗi', 'Chưa có dòng dữ liệu nào hợp lệ!');

      _setBtnLoading(btn, true);

      // Gọi API tuần tự
      _sendSequential(
        MODULE_CONFIG.ApiSave,
        payloads,
        function () {                // onDone
          modalBulk.closeNow();
          Alert.success('Thành công', 'Đã lưu thành công ' + payloads.length + ' trường!');
          if (_isFormBuilder()) window._uiConfigCache = {};
          _loadData();
        },
        function (err, payload) {   // onError → return false để dừng chuỗi
          Alert.error('Lỗi ở dòng: ' + payload.FieldName, err.message);
          _setBtnLoading(btn, false);
          return false;
        }
      );
    };
  }

  function _openAddForm() {
    // Neu co WizardSteps -> dung Wizard multi-step, nguoc lai dung modal thuong
    if (MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0 && typeof WizardForm !== 'undefined') {
      WizardForm.open({
        steps:        MODULE_CONFIG.WizardSteps,
        formSchema:   globalFormSchema,
        moduleConfig: MODULE_CONFIG,
        currentUser:  _currentUser(),
        userBranches: _getUserBranches(),   // Danh sách chi nhánh của user
        saveData:     _saveData
      });
    } else {
      _openModal(false, null);
    }
  }



  function _openEditForm(row) {
    if (MODULE_CONFIG.WizardSteps && MODULE_CONFIG.WizardSteps.length > 0 && typeof WizardForm !== 'undefined') {
      WizardForm.open({
        isEdit:       true,
        rowData:      row,
        steps:        MODULE_CONFIG.WizardSteps,
        formSchema:   globalFormSchema,
        moduleConfig: MODULE_CONFIG,
        currentUser:  _currentUser(),
        userBranches: _getUserBranches(),
        saveData:     _saveData
      });
    } else {
      _openModal(true, row);
    }
  }

  function _openBulkEditForm() {
    _openBulkGridEditForm(selectedRows, false);
  }

  function _openBulkGridEditForm(rows, isAdd) {
    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var alertBox = document.createElement('div');
    alertBox.className = 'alert alert-info py-2 mb-0 d-flex align-items-center gap-2';
    alertBox.style.fontSize = '13px';
    var isEdit = !isAdd;

    if (isAdd) {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">playlist_add</span>' +
        '<strong>Chế độ Thêm Hàng Loạt:</strong> Nhập dữ liệu để tạo mới nhiều dòng cùng lúc. Để trống dòng nếu không muốn thêm.';
    } else {
      alertBox.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">grid_on</span>' +
        '<strong>Chế độ Sửa Từng Dòng:</strong> Chỉnh sửa dữ liệu trực tiếp trên bảng.';
    }
    body.appendChild(alertBox);

    var tableContainer = document.createElement('div');
    tableContainer.style.overflowX = 'auto';
    tableContainer.style.maxHeight = '65vh';

    var styleNode = document.createElement('style');
    styleNode.innerHTML = `
        .table-bulk-edit { margin-bottom: 0; border-collapse: separate; border-spacing: 0; }
        .table-bulk-edit thead th { position: sticky; top: 0; z-index: 2; background: var(--color-surface); border-bottom: 2px solid var(--color-border); }
        .table-bulk-edit tbody td { padding: 0 !important; vertical-align: middle; border-bottom: 1px solid var(--color-border); border-right: 1px solid var(--color-border); position: relative; }
        .table-bulk-edit tbody td:first-child { padding: 0 8px !important; }
        .table-bulk-edit tbody tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .table-bulk-edit .form-group { margin-bottom: 0 !important; height: 100%; display: flex; align-items: center; width: 100%; }
        .table-bulk-edit input.ui-input, .table-bulk-edit .dropdown-wrapper, .table-bulk-edit .dropdown-wrapper input {
            border: none !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;
            width: 100%; height: 100%; min-height: 40px; padding: 0 12px !important; outline: none !important;
        }
        .table-bulk-edit input.ui-input:focus { background: rgba(255,255,255,0.05) !important; }
        .table-bulk-edit .switch { justify-content: center; padding: 0; margin: 0; width: 100%; height: 100%; display: flex; align-items: center; min-height: 40px; }
        .table-bulk-edit .dropdown-wrapper .material-symbols-outlined { right: 8px; }
        
        /* Custom Scrollbar cho bảng */
        .table-bulk-edit-container::-webkit-scrollbar { width: 8px; height: 8px; }
        .table-bulk-edit-container::-webkit-scrollbar-track { background: transparent; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
        body.dark-theme .table-bulk-edit-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .table-bulk-edit-container::-webkit-scrollbar-corner { background: transparent; }
    `;
    tableContainer.appendChild(styleNode);
    tableContainer.classList.add('table-bulk-edit-container');

    var table = document.createElement('table');
    table.className = 'table table-bordered table-hover table-bulk-edit';
    table.style.width = 'max-content';
    table.style.minWidth = '100%';

    var formSchema = globalFormSchema;
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    var editableFields = [];
    var thead = document.createElement('thead');
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '1';
    thead.style.background = 'var(--color-surface)';
    var trHead = document.createElement('tr');

    var thStt = document.createElement('th');
    thStt.innerText = '#';
    thStt.style.width = '50px';
    thStt.style.textAlign = 'center';
    trHead.appendChild(thStt);

    formSchema.forEach(function (field) {
      if (String(field.showInEdit) === '1' || field.showInEdit === true) {
        editableFields.push(field);
        var th = document.createElement('th');
        th.innerText = field.label || field.name;
        if (field.required) {
          var req = document.createElement('span');
          req.innerText = ' *';
          req.style.color = 'var(--color-danger)';
          th.appendChild(req);
        }
        th.style.whiteSpace = 'nowrap';
        th.style.padding = '10px';
        trHead.appendChild(th);
      }
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var currentRowCount = rows.length;

    function appendRow(row, rowIdx) {
      var tr = document.createElement('tr');

      var tdStt = document.createElement('td');
      tdStt.innerText = rowIdx + 1;
      tdStt.style.textAlign = 'center';
      tdStt.style.verticalAlign = 'middle';
      tr.appendChild(tdStt);

      // Hidden PK
      var hiddenPK = document.createElement('input');
      hiddenPK.type = 'hidden';
      hiddenPK.name = MODULE_CONFIG.PrimaryKey + '_' + rowIdx;
      hiddenPK.value = row[MODULE_CONFIG.PrimaryKey] || '';
      hiddenPK.setAttribute('data-row-index', rowIdx);
      hiddenPK.setAttribute('data-field-name', MODULE_CONFIG.PrimaryKey);
      tr.appendChild(hiddenPK);

      // Hidden OrderNo
      var hiddenOrder = document.createElement('input');
      hiddenOrder.type = 'hidden';
      hiddenOrder.name = 'OrderNo_' + rowIdx;
      hiddenOrder.value = row.OrderNo || 0;
      hiddenOrder.setAttribute('data-row-index', rowIdx);
      hiddenOrder.setAttribute('data-field-name', 'OrderNo');
      tr.appendChild(hiddenOrder);

      editableFields.forEach(function (fieldTemplate) {
        var td = document.createElement('td');
        td.style.verticalAlign = 'middle';
        td.style.minWidth = '200px';
        td.style.padding = '0'; // Đã CSS trong class

        var field = Object.assign({}, fieldTemplate);
        field.value = row[field.name] !== undefined && row[field.name] !== null ? row[field.name] : '';
        var originalName = field.name;
        field.name = originalName + '_' + rowIdx;

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
          inputEl = document.createElement('div');
          inputEl.className = 'form-group';
          inputEl.style.marginBottom = '0';

          var hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.value || '';
          hiddenInput.setAttribute('data-row-index', rowIdx);
          hiddenInput.setAttribute('data-field-name', originalName);
          inputEl.appendChild(hiddenInput);

          var comboLoading = UIControls.createDataComboBox({ placeholder: 'Đang tải...', disabled: ((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)) });
          inputEl.appendChild(comboLoading);

          if (field.dataSource) {
            if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
              var staticStr = field.dataSource.substring(7);
              var staticData = staticStr.split(',').map(function (s) {
                var parts = s.split('|');
                return [parts[0], parts[1] || parts[0]];
              });
              var newCombo = UIControls.createDataComboBox({
                placeholder: '-- Chọn --',
                headers: ['ID', 'Tên'],
                data: staticData,
                colFilterIndex: 1,
                onSelect: function (r) { hiddenInput.value = r[0]; }
              });
              var newDisplayInput = newCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return r[0] == field.value; });
              if (matched && newDisplayInput) newDisplayInput.value = matched[1];
              inputEl.replaceChild(newCombo, comboLoading);
            } else {
              ApiClient.post(MODULE_CONFIG.ApiSearch, { FormName: field.dataSource, Limit: 1000 }).then(function (res) {
                var comboData = [];
                var headers = ['Mã', 'Tên'];
                var colFilterIndex = 1;
                var dataList = res.list || res.records || [];
                if (dataList && dataList.length > 0) {
                  var keys = Object.keys(dataList[0]);
                  if (keys.length > 0) {
                    headers = keys;
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = keys.find(function (k) { return labelRegex.test(k); });
                    colFilterIndex = displayKey ? keys.indexOf(displayKey) : (keys.length > 1 ? 1 : 0);
                    if (field.name === 'PersonID') colFilterIndex = 0;
                    dataList.forEach(function (d) {
                      var rd = [];
                      keys.forEach(function (k) { rd.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
                      comboData.push(rd);
                    });
                  }
                }
                var newCombo = UIControls.createDataComboBox({
                  placeholder: '-- Chọn --', headers: headers, data: comboData, colFilterIndex: colFilterIndex,
                  showAddNew: true, // Bật nút Thêm mới
                  onF2: function () {
                    newCombo.querySelector('.ui-input').focus();
                  },
                  onSelect: function (r) { hiddenInput.value = r[0]; },
                  onChange: function (val) { hiddenInput.value = val; } // Hỗ trợ gõ tay khách mới
                });
                var newDisplayInput = newCombo.querySelector('input.ui-input');
                var matched = comboData.find(function (r) { return r[0] == field.value; });
                if (matched && newDisplayInput) newDisplayInput.value = matched[colFilterIndex];
                inputEl.replaceChild(newCombo, comboLoading);
              }).catch(function (err) {
                var displayInput = comboLoading.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }
          } else {
            var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
            inputEl.replaceChild(comboEmpty, comboLoading);
          }
        } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
          inputEl = UIInput.createNumber(field);
        } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
          var wrapper = document.createElement('div');
          wrapper.className = 'form-group';
          var flexDiv = document.createElement('div');
          flexDiv.style.display = 'flex';
          flexDiv.style.gap = '8px';

          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'ui-input';
          input.name = field.name;
          input.value = field.value || '';
          input.placeholder = 'Click nút Thiết lập...';
          input.readOnly = true;
          input.style.flex = '1';

          var btnWrapper = document.createElement('div');
          btnWrapper.innerHTML = UIButton.createHTML({ text: '', type: 'secondary', icon: 'settings', className: 'btn-icon-only' });
          var btn = btnWrapper.firstElementChild;
          btn.style.height = '100%';
          btn.onclick = function (e) {
            e.preventDefault();
            if (typeof RuleBuilderDialog !== 'undefined') {
              var formNameVal = row.FormName || row.formName || row.FORMNAME || '';
              RuleBuilderDialog.open({
                currentRule: input.value,
                targetFormName: formNameVal,
                onSave: function (newRule) {
                  input.value = newRule;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            } else {
              Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
            }
          };
          flexDiv.appendChild(input);
          flexDiv.appendChild(btn);
          wrapper.appendChild(flexDiv);
          inputEl = wrapper;
        } else {
          inputEl = UIInput.createText(field);
        }

        if (inputEl) {
          var lbl = inputEl.querySelector('label');
          if (lbl && !inputEl.classList.contains('switch')) {
            lbl.style.display = 'none';
          }
          if (inputEl.classList && inputEl.classList.contains('form-group')) {
            inputEl.style.marginBottom = '0';
          }
          var allInputs = inputEl.querySelectorAll('input, select, textarea');
          allInputs.forEach(function (i) {
            i.setAttribute('data-row-index', rowIdx);
            i.setAttribute('data-field-name', originalName);
            if (((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd))) i.disabled = true;
          });
          if (((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd))) inputEl.classList.add('ui-input-disabled');
          td.appendChild(inputEl);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    rows.forEach(function (row, rowIdx) {
      appendRow(row, rowIdx);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    body.appendChild(tableContainer);

    if (isAdd) {
      var btnAddMore = document.createElement('button');
      btnAddMore.className = 'btn btn-outline-primary btn-sm';
      btnAddMore.style.alignSelf = 'flex-start';
      btnAddMore.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; vertical-align:bottom;">add</span> Thêm 1 dòng nữa';
      btnAddMore.onclick = function () {
        appendRow({}, currentRowCount);
        currentRowCount++;
        // scroll to bottom
        setTimeout(function () { tableContainer.scrollTop = tableContainer.scrollHeight; }, 50);
      };
      body.appendChild(btnAddMore);
    }

    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = MODULE_CONFIG.BtnSaveAll;

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);

    var modal = UIModal.show({
      title: isAdd ? 'Thêm hàng loạt (' + rows.length + ' dòng)' : 'Sửa hàng loạt (' + rows.length + ' dòng)',
      width: '90%',
      content: body,
      footer: footer
    });

    btnCancel.onclick = function () { modal.close(); };
    btnSave.onclick = function () { _saveGridData(rows, modal, body, btnSave, isAdd); };
  }

  function _openModal(isEdit, row) {
    if (isEdit && !row) return;
    if (!row) row = {};

    var body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '14px';

    var currentModalFormState = {}; // Trạng thái form để truyền cho các Combobox gọi API

    var masterWrapper = document.createElement('div');
    masterWrapper.className = 'df-master-wrapper';
    masterWrapper.style.display = 'flex';
    masterWrapper.style.gap = '16px';
    masterWrapper.style.alignItems = 'flex-start';
    body.appendChild(masterWrapper);

    var grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.flexWrap = 'wrap';
    grid.style.gap = '12px 10px'; // Dòng cách dòng 12px, ô cách ô 10px
    grid.style.flex = '1';
    masterWrapper.appendChild(grid);

    var isPersonForm = String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personfullfrm' || String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personinfrm' || String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_personquitfrm';
    var isCandidateForm = String(MODULE_CONFIG.FormName).toLowerCase() === 'wa_danhsachungvienfrm';
    if (isPersonForm || isCandidateForm) {
      console.log('[PHOTO DEBUG] Edit Modal - row:', row);
      var photoBox = document.createElement('div');
      photoBox.className = 'photo-box-wrapper';
      photoBox.style.width = '200px';
      photoBox.style.flexShrink = '0';
      photoBox.style.display = 'flex';
      photoBox.style.flexDirection = 'column';
      photoBox.style.alignItems = 'center';
      photoBox.style.gap = '8px';
      photoBox.style.border = '1px solid var(--color-border)';
      photoBox.style.borderRadius = '8px';
      photoBox.style.padding = '12px';
      photoBox.style.background = 'var(--color-surface)';

      var imgFrame = document.createElement('div');
      imgFrame.style.width = '176px';
      imgFrame.style.height = '220px';
      imgFrame.style.border = '1px solid var(--color-border-strong)';
      imgFrame.style.borderRadius = '4px';
      imgFrame.style.overflow = 'hidden';
      imgFrame.style.display = 'flex';
      imgFrame.style.alignItems = 'center';
      imgFrame.style.justifyContent = 'center';
      imgFrame.style.background = '#f1f5f9';

      var img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';

      var rawContent = '';
      var fileNameVal = '';
      if (row) {
        for (var key in row) {
          var keyLower = key.toLowerCase();
          if (keyLower === 'content') {
            rawContent = row[key];
          } else if (keyLower === 'filename') {
            fileNameVal = row[key];
          }
        }
      }

      var imgIdVal = row ? (isPersonForm ? (row.PersonID || '') : (row.CandidateID || '')) : '';
      var isLoadingHex = false;

      if (rawContent && typeof rawContent === 'string' && rawContent.length > 2) {
        var mimeType = 'image/jpeg';
        if (fileNameVal) {
          var ext = fileNameVal.split('.').pop().toLowerCase();
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }
        try {
          if (/^0x/i.test(rawContent)) {
            // Chuỗi hex dạng 0xFFD8FF...
            var hexStr = rawContent.replace(/^0x/i, '').replace(/\s/g, '');
            var bytes = new Uint8Array(hexStr.length / 2);
            for (var bi = 0; bi < bytes.length; bi++) {
              bytes[bi] = parseInt(hexStr.substr(bi * 2, 2), 16);
            }
            var blob = new Blob([bytes], { type: mimeType });
            img.src = URL.createObjectURL(blob);
          } else {
            // API SQL Server serialize varbinary thành base64 — dùng trực tiếp
            img.src = 'data:' + mimeType + ';base64,' + rawContent;
          }
          isLoadingHex = true;
        } catch (err) {
          console.warn('[PHOTO] Lỗi xử lý ảnh:', err);
        }
      }

      var isLoadingBase64 = isLoadingHex; // alias cho onerror logic bên dưới

      if (!isLoadingHex) {
        if (imgIdVal) {
          var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
          img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
        } else {
          img.src = defaultPhoto;
        }
      }
      img.onerror = function () {
        if (isLoadingBase64) {
          isLoadingBase64 = false;
          if (imgIdVal) {
            var subFolder = isPersonForm ? 'NhanVien' : 'UngVien';
            img.src = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/Images/' + subFolder + '/' + imgIdVal + '.jpg';
            return;
          }
        }
        if (img.src !== defaultPhoto) {
          img.src = defaultPhoto;
        }
      };

      imgFrame.appendChild(img);
      photoBox.appendChild(imgFrame);

      // Buttons
      var btnGroup = document.createElement('div');
      btnGroup.style.display = 'grid';
      btnGroup.style.gridTemplateColumns = '1fr 1fr';
      btnGroup.style.gap = '6px';
      btnGroup.style.width = '100%';

      var createPhotoBtn = function (text, onClick) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ui-btn ui-btn-secondary';
        btn.style.padding = '6px';
        btn.style.fontSize = '12px';
        btn.style.textAlign = 'center';
        btn.innerText = text;
        btn.onclick = onClick;
        return btn;
      };

      var btnCapture = createPhotoBtn('Chụp ảnh', function () {
        if (window.UIToast) window.UIToast.show('Tính năng chụp ảnh qua webcam đang phát triển...', 'info');
      });
      var btnSelect = createPhotoBtn('Chọn ảnh', function () {
        var fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.accept = 'image/*';
        fileInp.onchange = function (e) {
          var file = e.target.files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = function (evt) {
              img.src = evt.target.result;
              if (row) {
                row.PhotoBase64 = evt.target.result;
              }
            };
            reader.readAsDataURL(file);
          }
        };
        fileInp.click();
      });
      var btnDelete = createPhotoBtn('Xóa ảnh', function () {
        img.src = 'https://via.placeholder.com/176x220?text=No+Photo';
        if (row) row.PhotoBase64 = '';
      });
      var btnView = createPhotoBtn('Xem ảnh', function () {
        if (img.src && !img.src.includes('placeholder')) {
          window.open(img.src, '_blank');
        } else {
          if (window.UIToast) window.UIToast.show('Chưa có ảnh để xem!', 'warning');
        }
      });

      btnGroup.appendChild(btnCapture);
      btnGroup.appendChild(btnSelect);
      btnGroup.appendChild(btnDelete);
      btnGroup.appendChild(btnView);
      photoBox.appendChild(btnGroup);

      masterWrapper.appendChild(photoBox);
    }

    // KHAI BÁO CẤU TRÚC FORM (SCHEMA-DRIVEN UI LẤY TỪ DB)
    var formSchema = globalFormSchema;

    // Sắp xếp lại theo OrderNo (Nếu có)
    formSchema.sort(function (a, b) { return (a.orderNo || 0) - (b.orderNo || 0); });

    // ENGINE VẼ FORM TỰ ĐỘNG
    formSchema.forEach(function (field) {
      var isVisible = isEdit ? field.showInEdit : field.showInAdd;
      if (!(String(isVisible) === '1' || isVisible === true)) {
        // Vẽ input ẩn cho các Khóa chính (Ví dụ Makh) để Auto-Serializer thu thập được
        var hiddenEl = document.createElement('input');
        hiddenEl.type = 'hidden';
        hiddenEl.name = field.name;
        hiddenEl.value = row ? (row[field.name] || '') : '';
        body.appendChild(hiddenEl);
        return;
      }

      // Tự động gán giá trị cũ (nếu đang Sửa 1 dòng).
      field.value = (isEdit && row) ? (row[field.name] || '') : '';

      // Khởi tạo Ô nhập liệu tuỳ thuộc vào quy tắc renderRule
      var inputEl;
      if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
        inputEl = UIInput.createSwitch(field);
      } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
        inputEl = UIInput.createDate(field);
      } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
        inputEl = UIInput.createTime(field);
      } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
        var formGroupWrapper = document.createElement('div');
        formGroupWrapper.className = 'form-group';

        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          if (field.required) {
            var req = document.createElement('span');
            req.innerText = ' *';
            req.style.color = 'var(--color-danger)';
            lbl.appendChild(req);
          }
          formGroupWrapper.appendChild(lbl);
        }

        // Hidden input lưu giá trị thực (ID) để hàm Auto Serialize nhặt được
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = field.name;
        hiddenInput.value = field.value || '';
        formGroupWrapper.appendChild(hiddenInput);

        if (field.dataSource) {
          if (field.name === 'BranchID') {
            var userBranches = _getUserBranches() || [];
            if (userBranches.length > 0) {
              field.dataSource = 'STATIC:' + userBranches.map(function (b) {
                return b.id + '|' + (b.name || b.id);
              }).join(',');
            }
          }
          if (String(field.dataSource).toUpperCase().startsWith('STATIC:')) {
            var staticStr = field.dataSource.substring(7);
            var staticData = staticStr.split(',').map(function (s) {
              var parts = s.split('|');
              return [parts[0], parts[1] || parts[0], parts[2] || ''];
            });

            var lazyStaticCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              disabled: ((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              onSearch: function (q, page) {
                return new Promise(function (resolve) {
                  var filtered = staticData;
                  if (field.dependsOn) {
                    var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                    filtered = staticData.filter(function (r) {
                      if (!r[2]) return true; // Ko cấu hình parent => luôn hiện
                      var parentValueNow = currentModalFormState[parents[0]] || '';
                      return String(r[2]) === String(parentValueNow);
                    });
                  }
                  if (q) {
                    filtered = filtered.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; });
                  }
                  resolve({ headers: ['Mã', 'Tên'], data: filtered, colFilterIndex: 1 });
                });
              },
              onSelect: function (row) {
                hiddenInput.value = row[0]; // Cập nhật ID
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            var displayInput = lazyStaticCombo.querySelector('input.ui-input');
            var matched = staticData.find(function (r) { return r[0] == field.value; });
            if (matched && displayInput) displayInput.value = matched[1];

            hiddenInput.fetchDataForValue = function () {
              var displayInp = lazyStaticCombo.querySelector('input.ui-input');
              var matched = staticData.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
              if (matched && displayInp) displayInp.value = matched[1];
              else if (displayInp) displayInp.value = hiddenInput.value || '';
            };

            formGroupWrapper.appendChild(lazyStaticCombo);
            inputEl = formGroupWrapper;
          } else {
            // Hiển thị tạm lúc đang tải
            var comboLoading = UIControls.createDataComboBox({
              placeholder: 'Đang tải...',
              headers: ['Mã', 'Tên'],
              data: [],
              colFilterIndex: 1
            });
            formGroupWrapper.appendChild(comboLoading);
            inputEl = formGroupWrapper;

            var endpointRaw = field.dataSource;
            var maxCols = 4; // Mặc định hiển thị 4 cột
            if (endpointRaw.indexOf('|') > -1) {
              var dsParts = endpointRaw.split('|');
              endpointRaw = dsParts[0];
              var parsedCols = parseInt(dsParts[1], 10);
              if (!isNaN(parsedCols) && parsedCols > 0) maxCols = parsedCols;
            }
            var finalUrl;
            var fetchPayload = {};
            if (endpointRaw.indexOf('/') === -1 && !endpointRaw.startsWith('http')) {
              // Nếu dataSource chỉ là tên danh mục (không chứa slash), tự động dùng Gateway Router
              finalUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + '/api/API_Gateway_Router';
              fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View' };
            } else {
              var endpoint = endpointRaw.startsWith('http') ? endpointRaw : ((typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '') + endpointRaw);
              finalUrl = endpoint;
              if (endpoint.indexOf('?') > -1) {
                var parts = endpoint.split('?');
                finalUrl = parts[0];
                var searchParams = new URLSearchParams(parts[1]);
                searchParams.forEach(function (value, key) { fetchPayload[key] = value; });
              }
            }
            if (!fetchPayload.UserName) fetchPayload.UserName = _currentUser();

            var searchApiCall = function (q, page) {
              var payload = Object.assign({}, fetchPayload);
              var isGateway = finalUrl.indexOf('API_Gateway_Router') > -1;
              var dynamicFilters = {};

              if (typeof currentModalFormState !== 'undefined') {
                var activeFilters = {};
                if (field.dependsOn) {
                  var parents = field.dependsOn.split(',').map(function (p) { return p.trim(); });
                  parents.forEach(function (p) {
                    if (currentModalFormState[p] !== undefined && currentModalFormState[p] !== null) {
                      activeFilters[p] = currentModalFormState[p];
                    }
                  });
                }
                if (isGateway) {
                  dynamicFilters = Object.assign({}, activeFilters);
                } else {
                  payload = Object.assign(payload, activeFilters);
                }
              }

              if (q) {
                payload.Keyword = q;
                if (isGateway) dynamicFilters.Keyword = q; // Nhét thêm Keyword vào JsonData dự phòng cho Gateway dễ truy vấn
              }

              if (isGateway && Object.keys(dynamicFilters).length > 0) {
                payload.JsonData = JSON.stringify(dynamicFilters);
              }

              return ApiClient.post(finalUrl, payload).then(function (res) {
                var comboData = [];
                var dataList = res.list || res.records;
                var headers = ['Mã', 'Tên'];
                var colFilterIndex = 1;
                if (dataList && dataList.length > 0) {
                  var keys = Object.keys(dataList[0]);
                  comboLoading.dataset.lastKeys = JSON.stringify(keys); // Lưu lại keys để dùng cho auto-fill
                  if (keys.length > 0) {
                    // Dùng từ điển hiện tại của form để dịch tiêu đề lưới (nếu có), CHỈ HIỆN MAX CỘT ĐƯỢC CHỈ ĐỊNH (mặc định 4)
                    var displayKeys = keys.slice(0, maxCols);
                    headers = displayKeys.map(function (k) {
                      return (typeof currentDictionary !== 'undefined' && currentDictionary[k]) ? currentDictionary[k].CaptionVN : k;
                    });
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = displayKeys.find(function (k) { return labelRegex.test(k); });
                    colFilterIndex = displayKey ? displayKeys.indexOf(displayKey) : (displayKeys.length > 1 ? 1 : 0);
                    if (field.name === 'PersonID') colFilterIndex = 0;
                    dataList.forEach(function (d) {
                      var rowData = [];
                      keys.forEach(function (k) { rowData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
                      comboData.push(rowData);
                    });
                  } else {
                    dataList.forEach(function (d) { comboData.push(['', '']); });
                  }
                }
                return { headers: headers, data: comboData, colFilterIndex: colFilterIndex };
              });
            };

            var lazyCombo = UIControls.createDataComboBox({
              placeholder: '-- Vui lòng chọn --',
              headers: ['Mã', 'Tên'],
              disabled: ((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd)),
              showAddNew: true, // Bật nút Thêm mới
              onF2: function () {
                lazyCombo.querySelector('.ui-input').focus();
              },
              onSearch: searchApiCall,
              onChange: function (val) { hiddenInput.value = val; }, // Hỗ trợ gõ tay
              onSelect: function (row) {
                hiddenInput.value = row[0];

                // === AUTO FILL LOGIC ===
                // Lấy lại danh sách keys đã lưu
                var savedKeysStr = comboLoading.dataset.lastKeys;
                if (savedKeysStr) {
                  var keys = JSON.parse(savedKeysStr);
                  // Duyệt qua các cột trả về từ API
                  keys.forEach(function (keyName, index) {
                    // Tìm xem trong Form hiện tại có Input nào tên trùng với tên Cột không (case-insensitive)
                    var form = hiddenInput.closest('.ui-modal') || hiddenInput.closest('body');
                    if (form) {
                      var targetInput = form.querySelector('[name="' + keyName + '" i]');
                      if (targetInput && targetInput !== hiddenInput) {
                        // Điền giá trị
                        targetInput.value = row[index] || '';
                        // Kích hoạt sự kiện để UI update (nếu là ô chọn ngày, số lượng...)
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                        // Nếu trường được Auto-Fill là một Combobox khác, ta cần gọi nó tải lại text hiển thị!
                        if (typeof targetInput.fetchDataForValue === 'function') {
                          targetInput.fetchDataForValue();
                        }
                      }
                    }
                  });
                }
                // =======================

                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            if (field.value) {
              searchApiCall('', 1).then(function (res) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
                if (matched && displayInput) displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
              }).catch(function (err) {
                console.error('[DynamicFormEngine] DataComboBox initial fetch error:', err);
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
              });
            }

            // Expose hàm để Auto-Fill gọi lại nhằm cập nhật Text
            hiddenInput.fetchDataForValue = function () {
              if (hiddenInput.value) {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = 'Đang tải...';
                searchApiCall('', 1).then(function (res) {
                  var displayInp = lazyCombo.querySelector('input.ui-input');
                  var matched = res.data.find(function (r) { return String(r[0]) === String(hiddenInput.value); });
                  if (matched && displayInp) displayInp.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                  else if (displayInp) displayInp.value = hiddenInput.value; // Fallback
                });
              } else {
                var displayInput = lazyCombo.querySelector('input.ui-input');
                if (displayInput) displayInput.value = '';
              }
            };

            formGroupWrapper.replaceChild(lazyCombo, comboLoading);
          }
        } else {
          var comboEmpty = UIControls.createDataComboBox({ placeholder: 'Chưa có dữ liệu' });
          formGroupWrapper.appendChild(comboEmpty);
          inputEl = formGroupWrapper;
        }
      } else if (field.renderRule === 'nm' || field.renderRule === 'number' || field.renderRule === 'n') {
        inputEl = UIInput.createNumber(field);
      } else if (field.renderRule === 'rb' || field.renderRule === 'rulebuilder') {
        var wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        if (field.label) {
          var lbl = document.createElement('label');
          lbl.innerText = field.label;
          wrapper.appendChild(lbl);
        }
        var flexDiv = document.createElement('div');
        flexDiv.style.display = 'flex';
        flexDiv.style.gap = '8px';

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ui-input';
        input.name = field.name;
        input.value = field.value || '';
        input.placeholder = 'Click [Thiết lập] để chọn điều kiện';
        input.readOnly = true;
        input.style.flex = '1';

        var btnWrapper = document.createElement('div');
        btnWrapper.innerHTML = UIButton.createHTML({ text: 'Thiết lập', type: 'secondary', icon: 'settings' });
        var btn = btnWrapper.firstElementChild;
        btn.onclick = function (e) {
          e.preventDefault();
          if (typeof RuleBuilderDialog !== 'undefined') {
            var formNameVal = row ? (row.FormName || row.formName || row.FORMNAME) : '';
            if (!formNameVal && typeof currentModalFormState !== 'undefined') formNameVal = currentModalFormState['FormName'] || '';
            if (!formNameVal) {
              var fnInput = document.querySelector('input[name="FormName"], select[name="FormName"]');
              if (fnInput) formNameVal = fnInput.value;
            }

            RuleBuilderDialog.open({
              currentRule: input.value,
              targetFormName: formNameVal,
              onSave: function (newRule) {
                input.value = newRule;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          } else {
            Alert.error('Lỗi', 'Chưa tải Component Rule Builder!');
          }
        };

        flexDiv.appendChild(input);
        flexDiv.appendChild(btn);
        wrapper.appendChild(flexDiv);
        inputEl = wrapper;
      } else {
        inputEl = UIInput.createText(field);
      }

      // Áp dụng kích thước FlexBox từ field.position
      if (((isEdit && field.isReadOnlyEdit) || (!isEdit && field.isReadOnlyAdd))) {
        var innerFields = inputEl.querySelectorAll('input, select, textarea, button');
        if (innerFields.length > 0) {
          innerFields.forEach(function (el) { el.disabled = true; });
        } else if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(inputEl.tagName)) {
          inputEl.disabled = true;
        }
        inputEl.classList.add('ui-input-disabled');
      }
      var span = String(field.position || 'body');
      if (span === 'grid') span = '6';
      if (span === 'body') span = '12';
      if (!['12', '8', '6', '4', '3'].includes(span)) span = '12';

      var wrapper = document.createElement('div');
      wrapper.className = 'df-col-' + span;
      // Gán VisibleRule lên wrapper để UIControls.utils.applyVisibleRules xử lý
      if (field.visibleRule) wrapper.dataset.visibleRule = field.visibleRule;

      wrapper.appendChild(inputEl);
      grid.appendChild(wrapper);

      // Gán giá trị mặc định vào currentModalFormState
      currentModalFormState[field.name] = field.value || '';
    });

    // Áp VisibleRule: show/hide fields theo cấu hình trong SY_FormatFields.VisibleRule
    if (typeof UIControls !== 'undefined' && UIControls.utils && UIControls.utils.applyVisibleRules) {
      UIControls.utils.applyVisibleRules(body);
    }

    // Xử lý Disable ban đầu cho các trường có DependsOn nếu BẤT KỲ trường cha nào đang trống
    globalFormSchema.forEach(function (f) {
      if (f.dependsOn) {
        var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
        var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
        if (hasEmptyParent) {
          var childInput = body.querySelector('input[name="' + f.name + '"]');
          if (childInput) {
            var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
            if (comboWrap) {
              var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
              allInps.forEach(function (el) { el.disabled = true; });
              comboWrap.classList.add('ui-input-disabled');
            }
          }
        }
      }
    });

    // Lắng nghe sự kiện thay đổi để xử lý Phụ thuộc (Dependencies)
    body.addEventListener('change', function (e) {
      var changedName = e.target.name;
      if (changedName) {
        currentModalFormState[changedName] = e.target.value;

        // 1. Tính toán giá trị tự động (FormulaRule)
        globalFormSchema.forEach(function (f) {
          if (f.formulaRule) {
            var formula = f.formulaRule;
            for (var key in currentModalFormState) {
              var v = parseFloat(currentModalFormState[key]) || 0;
              formula = formula.split('{' + key + '}').join(v);
            }
            try {
              var result = new Function('return ' + formula)();
              if (!isNaN(result) && isFinite(result)) {
                var targetInput = body.querySelector('input[name="' + f.name + '"]');
                if (targetInput && targetInput.value != result) {
                  targetInput.value = result;
                  currentModalFormState[f.name] = result;
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            } catch (e) { }
          }
        });

        // 2. Trigger API (Gọi API ngoài)
        var changedSchema = globalFormSchema.find(function (s) { return s.name === changedName; });
        if (changedSchema && changedSchema.triggerApi && e.target.value) {
          var apiEndpoint = changedSchema.triggerApi;
          var payload = Object.assign({}, currentModalFormState);
          ApiClient.post(apiEndpoint, payload).then(function (res) {
            var dataList = res.list || res.records || [];
            if (dataList && dataList.length > 0) {
              var row = dataList[0];
              Object.keys(row).forEach(function (keyName) {
                var targetInput = body.querySelector('[name="' + keyName + '" i]');
                if (targetInput && targetInput.name !== changedName) {
                  targetInput.value = row[keyName] || '';
                  targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          }).catch(function () { });
        }

        // 3. Tìm các trường phụ thuộc vào trường vừa đổi (DependsOn)
        globalFormSchema.forEach(function (f) {
          if (f.dependsOn) {
            var parents = f.dependsOn.split(',').map(function (p) { return p.trim(); });
            if (parents.includes(changedName)) {
              currentModalFormState[f.name] = ''; // Reset state
              var childInput = body.querySelector('input[name="' + f.name + '"]');
              if (childInput) {
                childInput.value = ''; // Xóa value ẩn
                // Xóa luôn giá trị hiển thị trên màn hình nếu là combobox
                var comboWrap = childInput.closest('.form-group') || childInput.closest('.df-col-12, .df-col-6, .df-col-4');
                if (comboWrap) {
                  var displayInp = comboWrap.querySelector('input.ui-input');
                  if (displayInp) displayInp.value = '';

                  // Khóa/Mở khóa ô con dựa trên việc CÓ BẤT KỲ ô cha nào đang trống hay không
                  var hasEmptyParent = parents.some(function (p) { return !currentModalFormState[p]; });
                  var allInps = comboWrap.querySelectorAll('input:not([type="hidden"]), select, textarea, button');
                  allInps.forEach(function (el) { el.disabled = hasEmptyParent; });

                  if (hasEmptyParent) comboWrap.classList.add('ui-input-disabled');
                  else comboWrap.classList.remove('ui-input-disabled');
                }
                // Kích hoạt tiếp sự kiện change của thằng con để trigger chuỗi phụ thuộc (nếu có thằng cháu)
                childInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
        });
      }
    });

    // ── DETAIL TABS (Master-Detail panel) ──────────────────────────────────
    // Khi MODULE_CONFIG.DetailTabs được cấu hình, tự động vẽ thêm tab chi tiết bên dưới form master
    var hasEditableTab = MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.some(function (t) { return t.editable; });
    if (row && MODULE_CONFIG.FormName !== 'WA_QuanLyNghiPhepNamFrm' && !MODULE_CONFIG.HideDetailTabsInModal && MODULE_CONFIG.DetailTabs && MODULE_CONFIG.DetailTabs.length > 0 && (isEdit || hasEditableTab)) {
      var tabsContainer = document.createElement('div');
      tabsContainer.className = 'detail-tabs-container';
      tabsContainer.style.marginTop = '16px';
      tabsContainer.style.borderTop = '1px solid var(--color-border)';
      tabsContainer.style.paddingTop = '12px';

      // Tab nav bar
      var tabNav = document.createElement('div');
      tabNav.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; padding: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-md, 12px); border: 1px solid var(--color-border);';

      // Tab content panels
      var tabPanels = [];
      body._detailPanels = [];

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        // Tab button
        var tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.textContent = tab.label;
        tabBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; font-family: inherit;';

        var isActive = (idx === 0);
        if (isActive) {
          tabBtn.style.backgroundColor = 'var(--color-primary)';
          tabBtn.style.color = '#ffffff';
          tabBtn.style.fontWeight = '600';
          tabBtn.style.boxShadow = 'var(--shadow-sm)';
        } else {
          tabBtn.style.backgroundColor = 'transparent';
          tabBtn.style.color = 'var(--color-text-secondary)';

          tabBtn.onmouseover = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'var(--color-surface)';
            this.style.color = 'var(--color-text)';
          };
          tabBtn.onmouseout = function () {
            if (panel.style.display !== 'none') return; // active
            this.style.backgroundColor = 'transparent';
            this.style.color = 'var(--color-text-secondary)';
          };
        }

        // Tab panel
        var panel = document.createElement('div');
        panel.style.display = idx === 0 ? 'block' : 'none';
        panel.style.minHeight = '120px';
        panel.style.overflowX = 'auto';
        panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';

        tabPanels.push({ btn: tabBtn, panel: panel });
        body._detailPanels.push(panel);

        tabBtn.onclick = function () {
          tabPanels.forEach(function (t, i) {
            var isNowActive = (i === idx);
            t.panel.style.display = isNowActive ? 'block' : 'none';
            if (isNowActive) {
              t.btn.style.backgroundColor = 'var(--color-primary)';
              t.btn.style.color = '#ffffff';
              t.btn.style.fontWeight = '600';
              t.btn.style.boxShadow = 'var(--shadow-sm)';
            } else {
              t.btn.style.backgroundColor = 'transparent';
              t.btn.style.color = 'var(--color-text-secondary)';
              t.btn.style.fontWeight = '500';
              t.btn.style.boxShadow = 'none';
            }
          });
        };

        tabNav.appendChild(tabBtn);
        tabPanels[tabPanels.length - 1]._loaded = false;
      });

      tabsContainer.appendChild(tabNav);

      // Render Editable Grid inside Tab Panel
      function _renderEditableGrid(tabDef, panel) {
        panel.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.style.cssText = 'overflow-x: auto; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; background: var(--color-surface);';

        var t = document.createElement('table');
        t.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto;';

        var thead = document.createElement('thead');
        var trH = document.createElement('tr');
        trH.style.cssText = 'background: var(--color-background); border-bottom: 2px solid var(--color-border);';

        var keys = tabDef.fields;

        // Headers
        keys.forEach(function (k) {
          var th = document.createElement('th');
          var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
          th.textContent = label;
          th.style.cssText = 'padding: 10px 12px; font-weight: 600; color: var(--color-text-secondary); text-align: left; white-space: nowrap;';
          trH.appendChild(th);
        });

        // Add action header (for Delete button)
        var thAction = document.createElement('th');
        thAction.style.cssText = 'padding: 10px 12px; width: 50px; text-align: center;';
        trH.appendChild(thAction);
        thead.appendChild(trH);
        t.appendChild(thead);

        var tbody = document.createElement('tbody');

        panel._currentRows.forEach(function (currRow, rIdx) {
          var tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid var(--color-border); transition: background-color 0.2s;';
          tr.onmouseover = function () { this.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'; };
          tr.onmouseout = function () { this.style.backgroundColor = ''; };

          // Pass 1: Tạo tất cả các td và lưu vào cellMap để closure onSelect có thể tham chiếu trực tiếp
          var cellMap = {};
          keys.forEach(function (k) {
            var td = document.createElement('td');
            td.style.cssText = 'padding: 6px 12px; vertical-align: middle; position: relative;';
            td.setAttribute('data-field', k);
            cellMap[k] = td;
            tr.appendChild(td);
          });

          // Pass 2: Điền nội dung vào từng td
          keys.forEach(function (fName) {
            var td = cellMap[fName];

            if (fName === 'PersonID') {
              // ComboBox chọn nhân viên
              var combo = UIControls.createDataComboBox({
                placeholder: 'Chọn nhân viên...',
                headers: MODULE_CONFIG.FormName === 'WA_BaoHiemFrm'
                  ? ['STT', 'Mã NV', 'Họ Tên', 'Bộ phận', 'Mức đóng', 'Cảnh báo']
                  : ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ'],
                colFilterIndex: MODULE_CONFIG.FormName === 'WA_BaoHiemFrm' ? 1 : 0,
                onSearch: function (q) {
                  var lookupPayload = {
                    List: MODULE_CONFIG.FormName === 'WA_BaoHiemFrm' ? 'WA_BaoHiemFrm_PersonID' : 'HR_PersonTbl',
                    Func: 'View',
                    Keyword: q
                  };
                  if (MODULE_CONFIG.FormName === 'WA_BaoHiemFrm') {
                    lookupPayload.BranchID = row.BranchID || '';
                    lookupPayload.LoaiBaoHiem = row.LoaiBaoHiem || '';
                  }
                  return ApiClient.post('/api/API_Gateway_Router', lookupPayload).then(function (res) {
                    var list = res.list || res.records || [];
                    var dataList = list.map(function (d) {
                      return MODULE_CONFIG.FormName === 'WA_BaoHiemFrm'
                        ? [String(d.STT || ''), d.PersonID || '', d.PersonName || '', d.PhongBan || '', String(d.MucDong || 0), d.CanhBao || '']
                        : [d.PersonID || '', d.PersonName || '', d.PhongBan || '', d.TitleName || ''];
                    });
                    return {
                      headers: MODULE_CONFIG.FormName === 'WA_BaoHiemFrm'
                        ? ['STT', 'Mã NV', 'Họ Tên', 'Bộ phận', 'Mức đóng', 'Cảnh báo']
                        : ['Mã NV', 'Họ Tên', 'Bộ phận', 'Chức vụ'],
                      data: dataList,
                      colFilterIndex: MODULE_CONFIG.FormName === 'WA_BaoHiemFrm' ? 1 : 0
                    };
                  });
                },
                onSelect: function (selectedData) {
                  var isBH = MODULE_CONFIG.FormName === 'WA_BaoHiemFrm';
                  var selectedPersonID = isBH ? selectedData[1] : selectedData[0];

                  // Kiểm tra trùng lặp trong panel._currentRows
                  var isDuplicate = panel._currentRows.some(function (row, index) {
                    return index !== rIdx && row['PersonID'] === selectedPersonID;
                  });

                  if (isDuplicate) {
                    if (typeof Alert !== 'undefined') {
                      Alert.warning('Trùng lặp', 'Nhân viên này đã được chọn trong danh sách!');
                    } else if (typeof UIToast !== 'undefined') {
                      UIToast.show('Nhân viên này đã được chọn!', 'warning');
                    } else {
                      alert('Nhân viên này đã được chọn!');
                    }
                    if (displayInp) displayInp.value = '';
                    currRow['PersonID'] = '';
                    currRow['PersonName'] = '';
                    currRow['PhongBan'] = '';
                    if (isBH) {
                      currRow['MucDong'] = '';
                      if (cellMap['MucDong']) {
                        var mInp = cellMap['MucDong'].querySelector('input');
                        if (mInp) mInp.value = '';
                      }
                    } else {
                      currRow['TitleName'] = '';
                    }
                    if (cellMap['PersonName']) cellMap['PersonName'].textContent = '';
                    if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = '';
                    if (cellMap['TitleName']) cellMap['TitleName'].textContent = '';
                    return;
                  }

                  // Cập nhật dữ liệu hàng
                  if (isBH) {
                    currRow['PersonID'] = selectedData[1];
                    currRow['PersonName'] = selectedData[2];
                    currRow['PhongBan'] = selectedData[3];
                    currRow['MucDong'] = parseFloat(selectedData[4]) || 0;

                    if (cellMap['PersonName']) cellMap['PersonName'].textContent = selectedData[2] || '';
                    if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = selectedData[3] || '';
                    if (cellMap['MucDong']) {
                      var mInp = cellMap['MucDong'].querySelector('input');
                      if (mInp) {
                        mInp.value = selectedData[4] || '0';
                        // Tự động kích hoạt tính toán bảo hiểm
                        mInp.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }
                  } else {
                    currRow['PersonID'] = selectedData[0];
                    currRow['PersonName'] = selectedData[1];
                    currRow['PhongBan'] = selectedData[2];
                    currRow['TitleName'] = selectedData[3];
                    if (cellMap['PersonName']) cellMap['PersonName'].textContent = selectedData[1] || '';
                    if (cellMap['PhongBan']) cellMap['PhongBan'].textContent = selectedData[2] || '';
                    if (cellMap['TitleName']) cellMap['TitleName'].textContent = selectedData[3] || '';
                  }
                }
              });

              var displayInp = combo.querySelector('input.ui-input');
              if (displayInp) {
                displayInp.value = currRow[fName] || '';
                displayInp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
              }
              combo.style.width = '160px';
              td.appendChild(combo);

            } else if (['PersonName', 'PhongBan', 'TitleName', 'ChucDanhChuyenMon'].includes(fName)) {
              // Chỉ đọc — không cho chỉnh sửa, tự động điền khi chọn nhân viên
              td.textContent = currRow[fName] != null ? currRow[fName] : '';
              td.style.cssText += 'color: var(--color-text-secondary); font-style: italic;';

            } else {
              // Input text cho các trường còn lại
              var inp = document.createElement('input');
              inp.type = 'text';
              inp.value = currRow[fName] != null ? currRow[fName] : '';
              inp.placeholder = 'Nhập...';
              inp.style.cssText = 'border: 1px solid var(--color-border); border-radius: 4px; padding: 6px 8px; width: 100%; font-size: 13px; outline: none; background: var(--color-surface);';
              inp.addEventListener('input', function () {
                currRow[fName] = this.value;
              });

              // Hỗ trợ tính toán bảo hiểm khi MucDong thay đổi
              if (MODULE_CONFIG.FormName === 'WA_BaoHiemFrm' && fName === 'MucDong') {
                inp.addEventListener('change', function () {
                  var val = parseFloat(this.value) || 0;
                  currRow['MucDong'] = val;
                  var payload = {
                    List: 'WA_BaoHiemFrm_Calculate',
                    Func: 'View',
                    JsonData: JSON.stringify({
                      PeriodID: row.PeriodID || '',
                      LoaiBaoHiem: row.LoaiBaoHiem || '',
                      MucDong: val
                    })
                  };
                  ApiClient.post('/api/API_Gateway_Router', payload).then(function (res) {
                    var data = res.list || res.records || [];
                    if (data && data.length > 0) {
                      var resRow = data[0];
                      var cols = ['MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD'];
                      cols.forEach(function (col) {
                        currRow[col] = resRow[col] !== undefined ? resRow[col] : 0;
                        var colTd = tr.querySelector('td[data-field="' + col + '"]');
                        if (colTd) {
                          var colInp = colTd.querySelector('input');
                          if (colInp) colInp.value = currRow[col];
                        }
                      });
                    }
                  }).catch(function (e) {
                    console.error('[BAOHIEM CALC ERROR]', e);
                  });
                });
              }

              td.appendChild(inp);
            }
          });

          // Cột hành động (Xóa dòng)
          var tdAction = document.createElement('td');
          tdAction.style.cssText = 'padding: 6px 12px; text-align: center; vertical-align: middle;';

          var btnDel = document.createElement('button');
          btnDel.type = 'button';
          btnDel.className = 'btn btn-sm btn-tool text-danger';
          btnDel.style.cssText = 'padding: 4px; border: none; background: transparent; cursor: pointer; border-radius: 4px;';
          btnDel.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">delete</span>';
          btnDel.onclick = function () {
            var detailPK = 'UserAutoID';
            if (currRow[detailPK]) {
              panel._deletedRows.push(currRow);
            }
            panel._currentRows.splice(rIdx, 1);
            _renderEditableGrid(tabDef, panel);
          };

          tdAction.appendChild(btnDel);
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });

        t.appendChild(tbody);
        wrap.appendChild(t);
        panel.appendChild(wrap);

        // Add Row Button below the grid
        var btnAddRow = document.createElement('button');
        btnAddRow.type = 'button';
        btnAddRow.className = 'btn btn-sm btn-outline-primary';
        btnAddRow.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; font-weight: 500; font-size: 13px; cursor: pointer;';
        btnAddRow.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">add</span> Thêm dòng mới';
        btnAddRow.onclick = function () {
          var newRow = {};
          newRow[tabDef.filterField] = row[MODULE_CONFIG.PrimaryKey] || '';
          panel._currentRows.push(newRow);
          _renderEditableGrid(tabDef, panel);
        };
        panel.appendChild(btnAddRow);
      }

      // Load data function for each tab
      function _loadTabData(tabDef, panel) {
        if (tabDef.type === 'attachments') {
          _renderAttachmentsTab(tabDef, panel, true, row);
          return;
        }
        if (tabDef.editable) {
          panel._tabDef = tabDef;
          panel._initialRows = [];
          panel._currentRows = [];
          panel._deletedRows = [];

          var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
          var pkVal = row[pkField] || '';

          if (pkVal) {
            var filterData = {};
            filterData[tabDef.filterField || pkField] = pkVal;
            var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Đang tải...</div>';
            ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
              var data = res.list || res.records || [];
              panel._initialRows = JSON.parse(JSON.stringify(data));
              panel._currentRows = JSON.parse(JSON.stringify(data));
              _renderEditableGrid(tabDef, panel);
            }).catch(function () {
              panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu chi tiết</div>';
            });
          } else {
            _renderEditableGrid(tabDef, panel);
          }
          return;
        }

        if (!tabDef.api) {
          panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;">(Chưa cấu hình API)</div>';
          return;
        }
        var pkField = MODULE_CONFIG.PrimaryKey || 'SapCaID';
        var pkVal = row[pkField] || '';
        var filterData = {};
        filterData[tabDef.filterField || pkField] = pkVal;
        var payload = { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filterData) };

        ApiClient.post(MODULE_CONFIG.ApiSearch || '/api/API_Gateway_Router', payload).then(function (res) {
          var data = res.list || res.records || [];
          if (data.length === 0) {
            panel.innerHTML = '<div style="color:var(--color-text-secondary);padding:12px;text-align:center;">Không có dữ liệu</div>';
            return;
          }
          // Build mini table
          var keys = tabDef.fields ? tabDef.fields : Object.keys(data[0]).filter(function (k) { return !k.startsWith('_'); });
          var wrap = document.createElement('div');
          wrap.style.overflowX = 'auto';
          wrap.style.maxHeight = '260px';
          wrap.style.border = '1px solid var(--color-border)';
          wrap.style.borderRadius = '6px';

          var t = document.createElement('table');
          t.style.width = '100%';
          t.style.borderCollapse = 'collapse';
          t.style.fontSize = '12px';

          var thead = document.createElement('thead');
          var trH = document.createElement('tr');
          keys.forEach(function (k) {
            var th = document.createElement('th');
            var label = (tabDef.headers && tabDef.headers[k]) ? tabDef.headers[k] : (globalDictionary[k] || k);
            th.textContent = label;
            th.style.cssText = 'padding:6px 8px;border-bottom:2px solid var(--color-border);background:var(--color-surface);position:sticky;top:0;text-align:left;white-space:nowrap;color:var(--color-text-secondary);font-weight:600;';
            trH.appendChild(th);
          });
          thead.appendChild(trH);
          t.appendChild(thead);

          var tbody = document.createElement('tbody');
          data.forEach(function (r) {
            var tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--color-border)';
            keys.forEach(function (k) {
              var td = document.createElement('td');
              td.textContent = r[k] != null ? r[k] : '';
              td.style.cssText = 'padding:5px 8px;white-space:nowrap;';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          t.appendChild(tbody);
          wrap.appendChild(t);
          panel.innerHTML = '';
          panel.appendChild(wrap);
        }).catch(function () {
          panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu</div>';
        });
      }

      MODULE_CONFIG.DetailTabs.forEach(function (tab, idx) {
        var panel = tabPanels[idx].panel;
        tabsContainer.appendChild(panel);
        // Load first tab immediately, rest lazy
        if (idx === 0) {
          _loadTabData(tab, panel);
        } else {
          // Lazy load when tab is clicked
          tabPanels[idx].btn.addEventListener('click', function () {
            if (!tabPanels[idx]._loaded) {
              tabPanels[idx]._loaded = true;
              _loadTabData(tab, panel);
            }
          }, { once: true });
        }
      });

      body.appendChild(tabsContainer);
    }
    // ── END DETAIL TABS ──────────────────────────────────────────────────────

    // Footer buttons
    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = '10px';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = MODULE_CONFIG.BtnCancel;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.textContent = isEdit ? MODULE_CONFIG.BtnSaveEdit : MODULE_CONFIG.BtnSaveAdd;

    var hasWritableFields = globalFormSchema.some(function (field) {
      var isVisible = isEdit ? (String(field.showInEdit) === '1' || field.showInEdit === true) : (String(field.showInAdd) === '1' || field.showInAdd === true);
      var isReadOnly = isEdit ? field.isReadOnlyEdit : field.isReadOnlyAdd;
      return isVisible && !isReadOnly;
    });

    if (!hasWritableFields) {
      btnSave.style.display = 'none';
      btnCancel.textContent = 'Đóng';
    }

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);

    var modal = UIModal.show({
      title: isEdit ? MODULE_CONFIG.TitleEdit : MODULE_CONFIG.TitleAdd,
      width: MODULE_CONFIG.ModalWidth,
      content: body,
      footer: footer
    });

    btnCancel.onclick = function () { modal.close(); };
    btnSave.onclick = function () {
      _saveData(isEdit, row, modal, body, btnSave);
    };

    // Focus ô nhập liệu đầu tiên (không bị ẩn)
    setTimeout(function () {
      var first = body.querySelector('input:not([type="hidden"])');
      if (first) first.focus();
    }, 100);
  }

  function _saveGridData(rows, modal, body, btnSave, isAdd) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    btnSave.disabled = true;
    btnSave.textContent = MODULE_CONFIG.BtnSaveSaving;

    var payloads = [];
    rows.forEach(function (targetRow, rowIdx) {
      var payload = _buildPayload(targetRow, !isAdd);

      var inputs = body.querySelectorAll('input[data-row-index="' + rowIdx + '"], select[data-row-index="' + rowIdx + '"], textarea[data-row-index="' + rowIdx + '"]');
      var hasData = false;
      inputs.forEach(function (el) {
        var fieldName = el.getAttribute('data-field-name');
        var val = el.value.trim();
        if (fieldName) {
          payload[fieldName] = val;
          if (val && fieldName !== MODULE_CONFIG.PrimaryKey && fieldName !== 'OrderNo') {
            hasData = true;
          }
        }
      });

      if (isAdd) {
        if (hasData) payloads.push(payload);
      } else {
        payloads.push(payload);
      }
    });

    if (payloads.length === 0) {
      Alert.warning(MODULE_CONFIG.AlertTitleInfo, 'Không có dữ liệu hợp lệ để lưu.');
      _setBtnLoading(btnSave, false);
      return;
    }

    // Gọi API tuần tự
    var finalPayloads = payloads;
    if (endpoint === '/api/API_Gateway_Router') {
      finalPayloads = payloads.map(function (p) {
        return {
          List: MODULE_CONFIG.FormName,
          Func: 'Save',
          JsonData: JSON.stringify(p)
        };
      });
    }

    _sendSequential(
      endpoint,
      finalPayloads,
      function (count) {             // onDone
        modal.closeNow();
        Alert.success('Thành công', 'Đã lưu xong ' + count + ' dòng!');
        if (!isAdd) selectedRows = [];
        if (_isFormBuilder()) {
          window._uiConfigCache = {};
          $container.innerHTML = '';
          render($container, MODULE_CONFIG);
        } else {
          _updateSelectionCounter();
          _loadData();
        }
      },
      function (err) {               // onError → tiếp tục
        console.error('Grid Edit Error', err);
      }
    );
  }

  // ── Save ──────────────────────────────────────────────────
  function _saveData(isEdit, rowData, modal, body, btnSave) {
    var endpoint = MODULE_CONFIG.ApiSave;
    if (!endpoint) {
      Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertApiMissing);
      return;
    }

    // 1.4 Kiểm tra các trường bắt buộc trong lưới chi tiết (Detail Tabs) trước khi lưu
    if (body._detailPanels) {
      var isDetailInvalid = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var tabDef = panel._tabDef;
          var keyField = tabDef.fields[0]; // Cột đầu tiên mặc định là cột định danh
          if (tabDef.fields.indexOf('PersonID') !== -1) {
            keyField = 'PersonID';
          }
          for (var r = 0; r < panel._currentRows.length; r++) {
            var val = panel._currentRows[r][keyField];
            if (val === undefined || val === null || String(val).trim() === '') {
              var label = tabDef.label || 'Danh sách chi tiết';
              var headerLabel = (tabDef.headers && tabDef.headers[keyField]) || keyField;
              if (typeof Alert !== 'undefined') {
                Alert.warning('Thiếu thông tin', 'Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              } else {
                alert('Vui lòng chọn/nhập đầy đủ "' + headerLabel + '" cho tất cả các dòng ở tab "' + label + '"!');
              }
              isDetailInvalid = true;
              break;
            }
          }
        }
        if (isDetailInvalid) break;
      }
      if (isDetailInvalid) return;
    }

    // 1.5 Kiểm tra trùng lặp trong lưới chi tiết trước khi tiến hành lưu
    if (body._detailPanels) {
      var hasDuplicate = false;
      for (var p = 0; p < body._detailPanels.length; p++) {
        var panel = body._detailPanels[p];
        if (panel._tabDef && panel._tabDef.editable && panel._currentRows) {
          var seen = {};
          for (var r = 0; r < panel._currentRows.length; r++) {
            var pid = panel._currentRows[r]['PersonID'];
            if (pid && pid.trim() !== '') {
              if (seen[pid]) {
                var label = panel._tabDef.label || 'Danh sách chi tiết';
                if (typeof Alert !== 'undefined') {
                  Alert.warning('Trùng lặp dữ liệu', 'Có nhân viên bị chọn trùng lặp trong tab "' + label + '"!');
                } else {
                  alert('Có nhân viên bị chọn trùng lặp trong tab "' + label + '"!');
                }
                hasDuplicate = true;
                break;
              }
              seen[pid] = true;
            }
          }
        }
        if (hasDuplicate) break;
      }
      if (hasDuplicate) return;
    }

    // 1. Quét Form: Thu thập các giá trị người dùng vừa gõ vào, loại bỏ các input thuộc lưới chi tiết
    var formInputData = {};
    var inputs = body.querySelectorAll('input, select, textarea');
    inputs.forEach(function (el) {
      if (el.name) {
        if (el.closest('.detail-tabs-container') || el.closest('.detail-tab-content') || el.closest('table')) {
          return;
        }
        formInputData[el.name] = el.value.trim();
      }
    });

    // 2. Validate Required và ValidateRule
    var isInvalid = false;
    for (var i = 0; i < globalFormSchema.length; i++) {
      var field = globalFormSchema[i];
      var val = formInputData[field.name];
      if (field.required && !val) {
        Alert.warning(MODULE_CONFIG.WarnMissingInfo, MODULE_CONFIG.WarnMissingInput.replace('{0}', field.label));
        isInvalid = true;
        break;
      }
      if (val && field.validateRule) {
        var rules = field.validateRule.split('|').map(function (r) { return r.trim(); });
        for (var j = 0; j < rules.length; j++) {
          var rawRule = rules[j];
          var rule = rawRule.toLowerCase();
          if (!rule || rule.startsWith('formula:') || rule.startsWith('trigger:')) continue;

          if (rule.startsWith('min:')) {
            var min = parseInt(rule.split(':')[1]);
            if (val.length < min) { Alert.warning('Lỗi nhập liệu', field.label + ' phải có ít nhất ' + min + ' ký tự'); isInvalid = true; break; }
          } else if (rule.startsWith('max:')) {
            var max = parseInt(rule.split(':')[1]);
            if (val.length > max) { Alert.warning('Lỗi nhập liệu', field.label + ' không được vượt quá ' + max + ' ký tự'); isInvalid = true; break; }
          } else if (rule === 'email') {
            var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng Email'); isInvalid = true; break; }
          } else if (rule === 'phone') {
            var phoneRe = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
            if (!phoneRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng số điện thoại'); isInvalid = true; break; }
          } else if (rule === 'number') {
            var numRe = /^\d+$/;
            if (!numRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' chỉ được phép nhập số'); isInvalid = true; break; }
          } else if (rule === 'cccd') {
            var cccdRe = /^\d{9}(\d{3})?$/;
            if (!cccdRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 9 hoặc 12 số (CMND/CCCD)'); isInvalid = true; break; }
          } else if (rule === 'url') {
            var urlRe = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng đường dẫn trang web'); isInvalid = true; break; }
          } else if (rule === 'taxcode') {
            var taxRe = /^\d{10}(-\d{3})?$/;
            if (!taxRe.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' phải là 10 hoặc 13 số (Mã số thuế)'); isInvalid = true; break; }
          } else if (rule.startsWith('minval:')) {
            var minVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) < minVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ' + minVal); isInvalid = true; break; }
          } else if (rule.startsWith('maxval:')) {
            var maxVal = parseFloat(rule.split(':')[1]);
            if (parseFloat(val) > maxVal) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ' + maxVal); isInvalid = true; break; }
          } else if (rule.startsWith('regex:')) {
            var reStr = rawRule.substring(6); // Dùng rawRule để không bị mất chữ Hoa/Thường của Regex
            try {
              var re = new RegExp(reStr);
              if (!re.test(val)) { Alert.warning('Lỗi nhập liệu', field.label + ' không đúng định dạng yêu cầu'); isInvalid = true; break; }
            } catch (e) { console.error('Lỗi Regex:', e); }
          } else if (rule.startsWith('gt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) <= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lt:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) >= parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('gte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) < parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải lớn hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          } else if (rule.startsWith('lte:')) {
            var tF = rule.split(':')[1];
            if (formInputData[tF] && parseFloat(val) > parseFloat(formInputData[tF])) { Alert.warning('Lỗi nhập liệu', field.label + ' phải nhỏ hơn hoặc bằng ô liên quan'); isInvalid = true; break; }
          }
        }
        if (isInvalid) break;
      }
    }
    if (isInvalid) return;

    // 3. Lưu — bật loading, tắt khi xong (dùng _setBtnLoading thóat khỏi duplicate)
    _setBtnLoading(btnSave, true);
    var _restoreSaveBtn = function () { _setBtnLoading(btnSave, false); };

    // 4. Xây dựng danh sách Payload
    var payloads = [];
    var singlePayload = _buildPayload(formInputData, isEdit);
    singlePayload.OrderNo = rowData && rowData.OrderNo ? rowData.OrderNo : 0;

    if (isEdit && rowData && MODULE_CONFIG.PrimaryKey && !singlePayload[MODULE_CONFIG.PrimaryKey]) {
      singlePayload[MODULE_CONFIG.PrimaryKey] = rowData[MODULE_CONFIG.PrimaryKey];
    }
    payloads.push(singlePayload);

    if (payloads.length === 0) { modal.closeNow(); return; }

    // Helper finalize save
    function _finalizeSave(isEdit, modal) {
      UIToast.show(isEdit ? MODULE_CONFIG.ToastEdit : MODULE_CONFIG.ToastAdd, 'success');
      modal.closeNow();
      if (_isFormBuilder()) {
        window._uiConfigCache = {}; // Cache Invalidate
        selectedRows = [];
        $container.innerHTML = '';
        render($container, MODULE_CONFIG);
      } else {
        selectedRows = [];
        _updateSelectionCounter();
        _loadData();
      }
    }

    // 5. Gọi API Lưu
    var finalPayload = payloads[0];
    if (endpoint === '/api/API_Gateway_Router') {
      finalPayload = {
        List: MODULE_CONFIG.FormName,
        Func: 'Save',
        JsonData: JSON.stringify(payloads[0])
      };
    }
    ApiClient.post(endpoint, finalPayload)
      .then(function (res) {
        if (res && res.code === 0) {
          // Master save succeeded! Now save/delete details.
          var detailPromises = [];

          if (body._detailPanels) {
            body._detailPanels.forEach(function (panel) {
              if (panel._tabDef && panel._tabDef.editable) {
                var tabDef = panel._tabDef;

                // Get the master key value to use as the foreign key
                var masterKeyVal = formInputData[MODULE_CONFIG.PrimaryKey] || (rowData && rowData[MODULE_CONFIG.PrimaryKey]);

                // 1. Process deleted rows
                if (panel._deletedRows && panel._deletedRows.length > 0) {
                  panel._deletedRows.forEach(function (delRow) {
                    var delPayload = {
                      List: tabDef.api,
                      Func: 'Delete',
                      Ids: delRow.UserAutoID,
                      UserName: _currentUser()
                    };
                    if (MODULE_CONFIG.ApiSave === '/api/API_Gateway_Router') {
                      delPayload = {
                        List: tabDef.api,
                        Func: 'Delete',
                        Ids: delRow.UserAutoID,
                        JsonData: JSON.stringify(delRow),
                        UserName: _currentUser()
                      };
                    }
                    detailPromises.push(ApiClient.post(MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router', delPayload));
                  });
                }

                // 2. Process current (added/modified) rows
                if (panel._currentRows && panel._currentRows.length > 0) {
                  panel._currentRows.forEach(function (currRow) {
                    // Sync foreign key
                    currRow[tabDef.filterField] = masterKeyVal;

                    var isRowEdit = !!currRow.UserAutoID;

                    var rowPayload = Object.assign({}, currRow);
                    rowPayload.UserName = _currentUser();
                    rowPayload.UserCreate = _currentUser();
                    rowPayload.IsEdit = isRowEdit ? 1 : 0;

                    var savePayload = {
                      List: tabDef.api,
                      Func: 'Save',
                      JsonData: JSON.stringify(rowPayload),
                      UserName: _currentUser()
                    };

                    detailPromises.push(ApiClient.post(MODULE_CONFIG.ApiSave || '/api/API_Gateway_Router', savePayload));
                  });
                }
              }
            });
          }

          if (detailPromises.length > 0) {
            Promise.all(detailPromises).then(function (detailResults) {
              var allOk = detailResults.every(function (dr) { return dr && dr.code === 0; });
              if (allOk) {
                _finalizeSave(isEdit, modal);
              } else {
                var firstErr = detailResults.find(function (dr) { return dr && dr.code !== 0; });
                Alert.error(MODULE_CONFIG.AlertTitleError, firstErr && firstErr.msg ? firstErr.msg : 'Lưu chi tiết thất bại');
                _restoreSaveBtn();
              }
            }).catch(function (err) {
              Alert.error(MODULE_CONFIG.AlertTitleError, 'Lỗi lưu thông tin chi tiết: ' + err.message);
              _restoreSaveBtn();
            });
          } else {
            _finalizeSave(isEdit, modal);
          }
        } else {
          Alert.error(MODULE_CONFIG.AlertTitleError, res && res.msg ? res.msg : MODULE_CONFIG.AlertSaveFailed);
          _restoreSaveBtn();
        }
      })
      .catch(function () {
        Alert.error(MODULE_CONFIG.AlertTitleError, MODULE_CONFIG.AlertNetworkError);
        _restoreSaveBtn();
      });
  }

  return { render: render };
})();
