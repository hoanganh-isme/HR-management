/**
 * Input Component
 * Sinh ra các ô nhập liệu (Text, Number, Date...) kèm Label bằng DOM Node chuẩn.
 * An toàn XSS, tiện lợi khi build Form hoàn toàn bằng JavaScript.
 */
var UIInput = (function () {

  /**
   * Sinh cấu trúc Label + DOM Input
   */
  function _createBaseWrapper(config, inputType) {
    var wrapper = document.createElement('div');
    wrapper.className = 'form-group ' + (config.className || '');

    if (config.label) {
      var lbl = document.createElement('label');
      lbl.innerText = config.label;
      if (config.required) {
        var req = document.createElement('span');
        req.innerText = ' *';
        req.style.color = 'var(--color-danger)';
        lbl.appendChild(req);
      }
      wrapper.appendChild(lbl);
    }

    var input = document.createElement('input');
    input.type = inputType;
    input.className = 'ui-input';
    if (config.id) input.id = config.id;
    if (config.name) input.name = config.name;
    
    var finalPlaceholder = config.placeholder;
    // Removed auto-placeholder generation to clean up UI as requested by user
    if (finalPlaceholder) input.placeholder = finalPlaceholder;
    
    if (config.value !== undefined) input.value = config.value;
    if (config.disabled) input.disabled = true;
    if (config.readonly) input.readOnly = true;

    wrapper.appendChild(input);

    return { wrapper: wrapper, input: input };
  }

  /**
   * Ô nhập Text thông thường
   */
  function createText(config) {
    return _createBaseWrapper(config, 'text').wrapper;
  }

  /**
   * Ô nhập Số
   */
  function createNumber(config) {
    var obj = _createBaseWrapper(config, 'number');
    if (config.min !== undefined) obj.input.min = config.min;
    if (config.max !== undefined) obj.input.max = config.max;
    if (config.step !== undefined) obj.input.step = config.step;
    return obj.wrapper;
  }

  /**
   * Ô chọn Ngày
   */
  function createDate(config) {
    if (config.value) {
      var rawVal = String(config.value).trim();
      if (rawVal.indexOf('T') !== -1) {
        config.value = rawVal.split('T')[0];
      } else if (rawVal.indexOf('/') !== -1) {
        var parts = rawVal.split(' ')[0].split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) { // YYYY/MM/DD
            config.value = parts[0] + '-' + parts[1] + '-' + parts[2];
          } else { // DD/MM/YYYY
            config.value = parts[2] + '-' + parts[1] + '-' + parts[0];
          }
        }
      } else if (rawVal.indexOf(' ') !== -1) {
        config.value = rawVal.split(' ')[0];
      }
    }
    var obj = _createBaseWrapper(config, 'text');
    if (config.value) {
      obj.input.value = config.value;
    }

    // Thêm icon lịch (tùy chọn)
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.innerText = 'calendar_today';
    icon.style.position = 'absolute';
    icon.style.right = '10px';
    icon.style.top = '36px'; // canh giữa theo height của input
    icon.style.color = 'var(--color-text-secondary)';
    icon.style.pointerEvents = 'none';
    icon.style.fontSize = '18px';
    
    // Đảm bảo wrapper là relative để canh vị trí icon
    obj.wrapper.style.position = 'relative';
    
    // Ẩn icon nếu đang dùng label inline hoặc config khác
    if (!config.label) icon.style.top = '10px';
    obj.wrapper.appendChild(icon);

    if (typeof window.flatpickr !== 'undefined') {
      window.flatpickr(obj.input, {
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        defaultDate: config.value ? new Date(config.value) : null,
        locale: "vn",
        allowInput: true
      });
    } else {
      // Fallback nếu không có flatpickr
      obj.input.type = 'date';
      if (config.value) obj.input.value = config.value;
    }

    return obj.wrapper;
  }

  /**
   * Ô chọn Giờ
   */
  function createTime(config) {
    return _createBaseWrapper(config, 'time').wrapper;
  }

  /**
   * Ô Switch (Công tắc bật/tắt cho boolean)
   */
  function createSwitch(config) {
    var obj = _createBaseWrapper(config, 'checkbox');
    obj.wrapper.classList.remove('form-group');
    obj.wrapper.classList.add('modern-checkbox-wrapper');
    obj.input.className = 'modern-checkbox';
    obj.input.style.cursor = 'pointer';
    
    // Checkbox uses checked instead of value
    if (config.value === '1' || config.value === 1 || config.value === true || String(config.value).toLowerCase() === 'true') {
        obj.input.checked = true;
    }
    
    // Thêm giá trị thực vào dataset để tự động serialize thành 1/0
    obj.input.value = obj.input.checked ? 1 : 0;
    obj.input.onchange = function() {
        this.value = this.checked ? 1 : 0;
    };
    
    // Đảo ngược thứ tự input và label cho đẹp
    var label = obj.wrapper.querySelector('label');
    if (label) {
        // Xóa class cũ
        label.className = '';
        label.style.cursor = 'pointer';
        // Đảo ngược thứ tự: input trước, label sau
        obj.wrapper.insertBefore(obj.input, label);
    }
    
    return obj.wrapper;
  }

  /**
   * Ô nhập Mật Khẩu (có nút mắt ẩn/hiện)
   */
  function createPassword(config) {
    var obj = _createBaseWrapper(config, 'password');
    var input = obj.input;

    // Wrapper cho input + nút mắt
    var inputWrap = document.createElement('div');
    inputWrap.style.position = 'relative';
    inputWrap.style.display = 'flex';
    inputWrap.style.alignItems = 'center';

    // Thay thế input bằng inputWrap TRƯỚC (input vẫn còn là child của wrapper)
    obj.wrapper.replaceChild(inputWrap, input);

    // Rồi mới chuyển input vào inputWrap
    input.style.paddingRight = '40px';
    inputWrap.appendChild(input);

    // Nút mắt
    var eyeBtn = document.createElement('button');
    eyeBtn.type = 'button';
    eyeBtn.tabIndex = -1;
    eyeBtn.className = 'password-eye-btn';
    eyeBtn.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; justify-content:center; color:var(--color-text-secondary); border-radius:4px; transition: color 0.2s;';
    eyeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">visibility_off</span>';
    eyeBtn.title = 'Hiện mật khẩu';

    var isVisible = false;
    eyeBtn.addEventListener('click', function() {
      isVisible = !isVisible;
      input.type = isVisible ? 'text' : 'password';
      eyeBtn.querySelector('.material-symbols-outlined').textContent = isVisible ? 'visibility' : 'visibility_off';
      eyeBtn.title = isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
      input.focus();
    });

    // Hover effect
    eyeBtn.addEventListener('mouseenter', function() { this.style.color = 'var(--color-text)'; });
    eyeBtn.addEventListener('mouseleave', function() { this.style.color = 'var(--color-text-secondary)'; });

    inputWrap.appendChild(eyeBtn);

    return obj.wrapper;
  }

  /**
   * Ô Select (Combobox thả xuống)
   */
  function createSelect(config, options) {
    var wrapper = document.createElement('div');
    wrapper.className = 'form-group ' + (config.className || '');

    if (config.label) {
      var lbl = document.createElement('label');
      lbl.innerText = config.label;
      if (config.required) {
        var req = document.createElement('span');
        req.innerText = ' *';
        req.style.color = 'var(--color-danger)';
        lbl.appendChild(req);
      }
      wrapper.appendChild(lbl);
    }

    var select = document.createElement('select');
    select.className = 'ui-input'; // Xài chung style với thẻ input
    if (config.id) select.id = config.id;
    if (config.name) select.name = config.name;
    if (config.disabled) select.disabled = true;

    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.innerText = '';
    select.appendChild(defaultOpt);

    (options || []).forEach(function(opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.innerText = opt.label;
        if (config.value == opt.value) o.selected = true;
        select.appendChild(o);
    });

    wrapper.appendChild(select);
    return wrapper;
  }

  /**
   * Sinh HTML chuỗi cho Bộ chọn số lượng (Quantity Selector)
   * Dùng cho các Grid/Table sử dụng innerHTML thay vì DOM Nodes.
   */
  function createQuantityHTML(config) {
    var value = config.value || 1;
    var onDecrease = config.onDecrease || '';
    var onIncrease = config.onIncrease || '';
    var onChange = config.onChange || '';
    var stopPropagation = config.stopPropagation ? 'event.stopPropagation(); ' : '';
    
    var h = config.height || 32;
    var w = config.width || 96;
    var btnW = config.btnWidth || 30;
    var inpW = w - (btnW * 2);

    return `
      <div class="d-flex align-items-center justify-content-center mx-auto" style="width: ${w}px; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; background: var(--color-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <button class="btn btn-light d-flex align-items-center justify-content-center p-0" style="width: ${btnW}px; height: ${h}px; border: none; border-radius: 0; background: #f8f9fa; color: #475569;" onclick="${stopPropagation}${onDecrease}" title="Giảm">
          <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
        </button>
        <input type="text" class="form-control text-center p-0 border-0" style="width: ${inpW}px; height: ${h}px; font-weight: 600; font-size: 13px; background: transparent; box-shadow: none;" value="${value}" onchange="${stopPropagation}${onChange}" title="Nhập số lượng">
        <button class="btn btn-light d-flex align-items-center justify-content-center p-0" style="width: ${btnW}px; height: ${h}px; border: none; border-radius: 0; background: #f8f9fa; color: #475569;" onclick="${stopPropagation}${onIncrease}" title="Tăng">
          <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
        </button>
      </div>
    `;
  }

  /**
   * Hàm đọc số thành chữ tiếng Việt
   */
  function docSoTienVN(n) {
    if (!n || n === 0) return 'Không đồng';
    var dvDoc = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];
    var soDoc = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    function docNhom(so) {
      var tram = Math.floor(so / 100);
      var chuc = Math.floor((so % 100) / 10);
      var dv = so % 10;
      var kq = '';
      if (tram > 0) kq += soDoc[tram] + ' trăm ';
      if (chuc === 1) kq += 'mười ';
      else if (chuc > 1) kq += soDoc[chuc] + ' mươi ';
      if (dv === 1 && chuc > 1) kq += 'mốt ';
      else if (dv === 5 && chuc > 0) kq += 'lăm ';
      else if (dv > 0) kq += soDoc[dv] + ' ';
      return kq.trim();
    }
    var str = Math.round(n).toString();
    var groups = [];
    while (str.length > 0) {
      groups.unshift(str.slice(-3));
      str = str.slice(0, -3);
    }
    var result = '';
    groups.forEach(function (g, i) {
      var val = parseInt(g, 10);
      if (val > 0) {
        result += docNhom(val) + ' ' + dvDoc[groups.length - 1 - i] + ' ';
      }
    });
    return result.trim() + ' đồng';
  }

  /**
   * Cài đặt tự động format số tiền + hiển thị text cho một ô input có sẵn
   */
  function setupMoneyInput(inputEl, textEl) {
    if (!inputEl) return;
    
    function refresh() {
      var raw = parseInt(inputEl.value.replace(/\D/g, ''), 10) || 0;
      inputEl.value = raw === 0 ? '' : raw.toLocaleString('vi-VN');
      if (textEl) textEl.innerText = raw === 0 ? '' : docSoTienVN(raw);
    }

    inputEl.addEventListener('input', function () {
      var pos = this.selectionStart;
      var oldLen = this.value.length;
      var raw = parseInt(this.value.replace(/\D/g, ''), 10) || 0;
      
      this.value = raw === 0 ? '' : raw.toLocaleString('vi-VN');
      
      var diff = this.value.length - oldLen;
      if (pos !== null) {
        this.setSelectionRange(pos + diff, pos + diff);
      }
      
      if (textEl) textEl.innerText = raw === 0 ? '' : docSoTienVN(raw);
    });

    inputEl.addEventListener('blur', function () {
      refresh();
    });

    refresh();
  }

  return {
    createText: createText,
    createNumber: createNumber,
    createDate: createDate,
    createTime: createTime,
    createPassword: createPassword,
    createSwitch: createSwitch,
    createSelect: createSelect,
    createQuantityHTML: createQuantityHTML,
    docSoTienVN: docSoTienVN,
    setupMoneyInput: setupMoneyInput
  };
})();
