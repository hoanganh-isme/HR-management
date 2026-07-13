/**
 * ReportFilterDialog Component
 * ─────────────────────────────────────────────
 * Dialog "Chọn báo cáo / Lọc" — các field được fetch động từ API
 * theo cùng pattern với DynamicFormEngine (API_LayCacTruongGiaoDien)
 *
 * Usage:
 *   ReportFilterDialog.open({
 *     formName: 'frmReportFilter',       // Tên form trong SY_FormatFields
 *     title: 'Chọn báo cáo',             // optional
 *     onConfirm: function(values) {      // values = { fieldName: value, ... }
 *       console.log(values);
 *     }
 *   });
 *
 * Schema field (từ API_LayCacTruongGiaoDien):
 *   renderRule = ''   → text input
 *   renderRule = 'dt' → date input
 *   renderRule = 'nm' → number input
 *   renderRule = 'sl' → select (dataSource = API path hoặc STATIC:v1=Nhãn 1,v2=Nhãn 2)
 *   renderRule = 'sr' → select + search (SearchDropdown)
 *   renderRule = 'dr' → date range (Từ ngày + Đến ngày trên cùng dòng)
 */
var ReportFilterDialog = (function () {

  var _apiDictionary = '/api/API_LayCacTruongGiaoDien';
  var _activeModal = null;

  // ── Helpers ──────────────────────────────────────────────────

  function _currentUser() {
    var u = JSON.parse((window.APP_SETTINGS ? APP_SETTINGS.getStored('user', '{}') : localStorage.getItem('pmql_user')) || '{}');
    return u.Username || u.UserName || u.username || 'Admin';
  }

  /**
   * Fetch field schema từ API (có cache RAM giống DynamicFormEngine)
   */
  function _fetchSchema(formName) {
    var cacheKey = 'ReportFilterSchema_' + formName;
    var cached = window._reportFilterSchemaCache && window._reportFilterSchemaCache[cacheKey];
    if (cached) return Promise.resolve(JSON.parse(cached));

    return ApiClient.post(_apiDictionary, {
      FormName: formName,
      UserName: _currentUser()
    }).then(function (res) {
      if (res && res.code === 0 && (res.list || res.records)) {
        window._reportFilterSchemaCache = window._reportFilterSchemaCache || {};
        window._reportFilterSchemaCache[cacheKey] = JSON.stringify(res);
      }
      return res;
    });
  }

  /**
   * Fetch datasource cho select field
   * dataSource format:
   *   '/api/API_DanhSachKhuVuc'       → gọi API, lấy [{ value, label }]
   *   'STATIC:--Tất cả--=,value1=Nhãn 1,value2=Nhãn 2'
   */
  function _fetchOptions(dataSource, valueField, labelField) {
    if (!dataSource) return Promise.resolve([]);

    // STATIC: prefix
    if (dataSource.indexOf('STATIC:') === 0) {
      var raw = dataSource.substring(7);
      var opts = raw.split(',').map(function (item) {
        var parts = item.split('=');
        return { value: parts[1] !== undefined ? parts[1] : parts[0], label: parts[0] };
      });
      return Promise.resolve(opts);
    }

    // API call
    return ApiClient.post(dataSource, { UserName: _currentUser() })
      .then(function (res) {
        var list = (res && (res.list || res.records)) || [];
        return list.map(function (item) {
          return {
            value: item[valueField || 'Value'] || item.value || item.ID || item.id || '',
            label: item[labelField || 'Label'] || item.label || item.Name || item.Ten || ''
          };
        });
      })
      .catch(function () { return []; });
  }

  // ── Field Builders ────────────────────────────────────────────

  /**
   * Tạo 1 row wrapper label + input
   * @param {string} label
   * @param {boolean} required
   * @param {HTMLElement} inputEl
   * @param {string} [visibleRule] - lưu vào data-attribute để _applyVisibleRules đọc
   */
  function _buildRow(label, required, inputEl, visibleRule) {
    var row = document.createElement('div');
    row.className = 'rfd-row';
    if (visibleRule) row.dataset.visibleRule = visibleRule;

    var lbl = document.createElement('label');
    lbl.className = 'rfd-label';
    lbl.textContent = label + (required ? ' (*)' : '');

    row.appendChild(lbl);
    row.appendChild(inputEl);
    return row;
  }

  /**
   * Render field theo renderRule
   * Trả về { row: HTMLElement, getValue: fn, setValue: fn }
   */
  function _buildField(field) {
    var rule = (field.renderRule || '').toLowerCase().trim();
    var name = field.name;
    var label = field.label;
    var required = field.required;
    var defaultVal = field.defaultValue || '';
    var visibleRule = field.visibleRule || '';

    // ── Date range (dr): Từ ngày + Đến ngày trên cùng hàng ──
    if (rule === 'dr') {
      var row = document.createElement('div');
      row.className = 'rfd-row';

      var lbl = document.createElement('label');
      lbl.className = 'rfd-label';
      lbl.textContent = label;
      row.appendChild(lbl);

      var rangeWrap = document.createElement('div');
      rangeWrap.className = 'rfd-date-range';

      var fromInput = document.createElement('input');
      fromInput.type = 'date';
      fromInput.className = 'ui-input rfd-input';
      fromInput.dataset.fieldName = name + '_From';
      if (defaultVal) fromInput.value = defaultVal;

      var sep = document.createElement('span');
      sep.className = 'rfd-date-sep';
      sep.textContent = 'Đến';

      var toInput = document.createElement('input');
      toInput.type = 'date';
      toInput.className = 'ui-input rfd-input';
      toInput.dataset.fieldName = name + '_To';

      rangeWrap.appendChild(fromInput);
      rangeWrap.appendChild(sep);
      rangeWrap.appendChild(toInput);
      row.appendChild(rangeWrap);
      if (visibleRule) row.dataset.visibleRule = visibleRule;

      return {
        row: row,
        getValue: function () {
          var obj = {};
          obj[name + '_From'] = fromInput.value;
          obj[name + '_To'] = toInput.value;
          return obj;
        },
        setValue: function (v) {
          if (v && v[name + '_From']) fromInput.value = v[name + '_From'];
          if (v && v[name + '_To']) toInput.value = v[name + '_To'];
        }
      };
    }

    // ── Date (dt) ──
    if (rule === 'dt') {
      var input = document.createElement('input');
      input.type = 'date';
      input.className = 'ui-input rfd-input';
      input.dataset.fieldName = name;
      input.required = required;
      if (defaultVal) input.value = defaultVal;

      return {
        row: _buildRow(label, required, input, visibleRule),
        getValue: function () { var o = {}; o[name] = input.value; return o; },
        setValue: function (v) { input.value = v || ''; }
      };
    }

    // ── Number (nm) ──
    if (rule === 'nm') {
      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'ui-input rfd-input';
      input.dataset.fieldName = name;
      input.required = required;
      if (defaultVal) input.value = defaultVal;

      return {
        row: _buildRow(label, required, input, visibleRule),
        getValue: function () { var o = {}; o[name] = input.value; return o; },
        setValue: function (v) { input.value = v || ''; }
      };
    }

    // ── Select (sl hoặc sr) ──
    if (rule === 'sl' || rule === 'sr') {
      var sel = document.createElement('select');
      sel.className = 'ui-input rfd-input rfd-select';
      sel.dataset.fieldName = name;
      sel.required = required;

      // Placeholder option
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '--Tất cả--';
      sel.appendChild(placeholder);

      // Load options async
      _fetchOptions(field.dataSource, field.valueField, field.labelField)
        .then(function (opts) {
          opts.forEach(function (opt) {
            var o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === defaultVal) o.selected = true;
            sel.appendChild(o);
          });
          if (defaultVal) sel.value = defaultVal;
        });

      // sr = select + search icon (dùng SearchDropdown nếu có)
      var wrap = sel;
      if (rule === 'sr' && typeof SearchDropdown !== 'undefined') {
        // SearchDropdown sẽ wrap select thành combobox có tìm kiếm
        // (SearchDropdown.attachTo pattern)
        // Giữ nguyên select để đơn giản, tích hợp sau
      }

      return {
        row: _buildRow(label, required, wrap, visibleRule),
        getValue: function () { var o = {}; o[name] = sel.value; return o; },
        setValue: function (v) { sel.value = v || ''; }
      };
    }

    // ── Default: text input ──
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'ui-input rfd-input';
    input.dataset.fieldName = name;
    input.required = required;
    input.placeholder = field.placeholder || '';
    if (defaultVal) input.value = defaultVal;

    return {
      row: _buildRow(label, required, input, visibleRule),
      getValue: function () { var o = {}; o[name] = input.value; return o; },
      setValue: function (v) { input.value = v || ''; }
    };
  }

  // ── VisibleRule Engine ────────────────────────────────────────

  /**
   * Parse và áp VisibleRule cho toàn bộ fields trong body
   *
   * VisibleRule syntax (lưu trong SY_FormatFields.VisibleRule):
   *   "KyBaoCao=custom"         → hiện khi KyBaoCao = 'custom'
   *   "KyBaoCao=custom|today"   → hiện khi KyBaoCao = 'custom' HOẶC 'today'
   *   "HinhThucPV!=online"      → hiện khi HinhThucPV KHÁC 'online'
   *   "field1=v1&field2=v2"     → hiện khi CẢ HAI điều kiện đúng (AND)
   *
   * @param {HTMLElement} body - container chứa các .rfd-row
   */
  function _applyVisibleRules(body) {
    var rows = Array.from(body.querySelectorAll('.rfd-row[data-visible-rule]'));
    if (!rows.length) return;

    /**
     * Parse 1 rule string thành mảng điều kiện AND
     * Mỗi điều kiện: { field, op: '='|'!=', values: [] }
     */
    function _parseRule(ruleStr) {
      return ruleStr.split('&').map(function (part) {
        part = part.trim();
        var op = part.indexOf('!=') !== -1 ? '!=' : '=';
        var sides = part.split(op === '!=' ? '!=' : '=');
        return {
          field: sides[0].trim(),
          op: op,
          values: (sides[1] || '').split('|').map(function (v) { return v.trim().toLowerCase(); })
        };
      });
    }

    /**
     * Lấy giá trị hiện tại của 1 input trong body theo fieldName
     */
    function _getFieldValue(fieldName) {
      var el = body.querySelector('[data-field-name="' + fieldName + '"]');
      return el ? (el.value || '').toLowerCase() : '';
    }

    /**
     * Đánh giá 1 rule string → true/false
     */
    function _evaluate(ruleStr) {
      var conditions = _parseRule(ruleStr);
      return conditions.every(function (cond) {
        var current = _getFieldValue(cond.field);
        var match = cond.values.indexOf(current) !== -1;
        return cond.op === '=' ? match : !match;
      });
    }

    /**
     * Áp visibility cho 1 row
     */
    function _applyRow(row) {
      var rule = row.dataset.visibleRule;
      if (!rule) return;
      var visible = _evaluate(rule);
      row.style.display = visible ? '' : 'none';
      // Disable required validation cho field ẩn
      var inputs = row.querySelectorAll('input, select');
      inputs.forEach(function (inp) {
        inp.disabled = !visible;
      });
    }

    // Áp trạng thái ban đầu
    rows.forEach(function (row) { _applyRow(row); });

    // Tìm tất cả trigger fields (fields được tham chiếu trong VisibleRule)
    var triggerFields = {};
    rows.forEach(function (row) {
      var rule = row.dataset.visibleRule || '';
      _parseRule(rule).forEach(function (cond) {
        if (!triggerFields[cond.field]) triggerFields[cond.field] = [];
        triggerFields[cond.field].push(row);
      });
    });

    // Đăng ký change listener trên trigger inputs
    Object.keys(triggerFields).forEach(function (fieldName) {
      var triggerEl = body.querySelector('[data-field-name="' + fieldName + '"]');
      if (!triggerEl) return;
      triggerEl.addEventListener('change', function () {
        triggerFields[fieldName].forEach(function (row) { _applyRow(row); });
      });
      // input event cho text fields
      triggerEl.addEventListener('input', function () {
        triggerFields[fieldName].forEach(function (row) { _applyRow(row); });
      });
    });
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Mở dialog filter
   * @param {Object} opts
   * @param {string} opts.formName         - FormName trong SY_FormatFields
   * @param {string} [opts.title]          - Tiêu đề dialog, mặc định 'Chọn báo cáo'
   * @param {string} [opts.apiDictionary]  - Override API endpoint
   * @param {Object} [opts.defaultValues]  - Giá trị mặc định { fieldName: value }
   * @param {Function} opts.onConfirm      - Callback khi bấm Đồng ý, nhận (values)
   * @param {Function} [opts.onCancel]     - Callback khi bấm Hủy
   */
  function open(opts) {
    opts = opts || {};
    if (!opts.formName) { console.error('ReportFilterDialog: formName is required'); return; }
    if (opts.apiDictionary) _apiDictionary = opts.apiDictionary;

    var title = opts.title || 'Chọn báo cáo';

    // ── Build modal body ──
    var body = document.createElement('div');
    body.className = 'rfd-body';
    body.innerHTML = '<div class="rfd-loading"><span class="material-symbols-outlined rfd-spin">progress_activity</span> Đang tải...</div>';

    // Footer
    var footer = document.createElement('div');
    footer.className = 'rfd-footer';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-secondary';
    btnCancel.textContent = 'Hủy bỏ';

    var btnOk = document.createElement('button');
    btnOk.className = 'btn btn-primary';
    btnOk.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">check</span> Đồng ý';

    footer.appendChild(btnCancel);
    footer.appendChild(btnOk);

    // Show modal
    _activeModal = UIModal.show({
      title: title,
      content: body,
      footer: footer,
      width: opts.width || '480px'
    });

    btnCancel.onclick = function () {
      if (_activeModal) _activeModal.closeNow();
      if (typeof opts.onCancel === 'function') opts.onCancel();
    };

    // ── Fetch schema & render fields ──
    var _fields = []; // { getValue, setValue }

    _fetchSchema(opts.formName)
      .then(function (res) {
        body.innerHTML = '';
        var dataList = (res && (res.list || res.records)) || [];

        if (!dataList.length) {
          body.innerHTML = '<div style="color:var(--color-text-secondary);padding:16px;">Không tìm thấy cấu hình filter cho form: ' + opts.formName + '</div>';
          return;
        }

        // Sort theo OrderNo
        dataList.sort(function (a, b) { return (a.OrderNo || a.orderNo || 0) - (b.OrderNo || b.orderNo || 0); });

        dataList.forEach(function (item) {
          var fieldDef = {
            name: item.name || item.FieldName,
            label: item.label || item.CaptionVN,
            required: String(item.required || item.IsRequired) === '1',
            renderRule: (item.renderRule || item.FormatID || '').toLowerCase().trim(),
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            valueField: item.valueField || item.ValueField || 'Value',
            labelField: item.labelField || item.LabelField || 'Label',
            defaultValue: item.defaultValue || item.DefaultValue || '',
            placeholder: item.placeholder || '',
            visibleRule: (item.visibleRule || item.VisibleRule || '').trim()  // ← mới
          };

          var built = _buildField(fieldDef);
          _fields.push({ name: fieldDef.name, field: built });

          // Áp defaultValues nếu có
          if (opts.defaultValues && opts.defaultValues[fieldDef.name] !== undefined) {
            built.setValue(opts.defaultValues[fieldDef.name]);
          }

          body.appendChild(built.row);
        });

        // Áp VisibleRule sau khi tất cả fields đã vào DOM
        if (typeof UIControls !== 'undefined' && UIControls.utils) {
          UIControls.utils.applyVisibleRules(body);
        }
      })
      .catch(function (err) {
        body.innerHTML = '<div style="color:var(--color-danger);padding:16px;">Lỗi tải cấu hình: ' + (err.message || '') + '</div>';
      });

    // ── Confirm ──
    btnOk.onclick = function () {
      // Validate required
      var hasError = false;
      var values = {};

      _fields.forEach(function (f) {
        var v = f.field.getValue();
        Object.assign(values, v);
      });

      // Simple required check
      _fields.forEach(function (f) {
        var v = values[f.name];
        if (f.field.row && f.field.row.querySelector('[required]')) {
          var inp = f.field.row.querySelector('[required]');
          if (inp && !inp.value) {
            inp.style.borderColor = 'var(--color-danger)';
            hasError = true;
          } else if (inp) {
            inp.style.borderColor = '';
          }
        }
      });

      if (hasError) {
        if (typeof Toast !== 'undefined') Toast.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
        return;
      }

      if (_activeModal) _activeModal.closeNow();
      if (typeof opts.onConfirm === 'function') opts.onConfirm(values);
    };
  }

  /**
   * Xóa cache schema (dùng khi cấu hình thay đổi)
   * @param {string} [formName] - Nếu không truyền, xóa tất cả
   */
  function clearCache(formName) {
    if (!window._reportFilterSchemaCache) return;
    if (formName) {
      delete window._reportFilterSchemaCache['ReportFilterSchema_' + formName];
    } else {
      window._reportFilterSchemaCache = {};
    }
  }

  return {
    open: open,
    clearCache: clearCache
  };
})();
