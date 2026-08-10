/**
 * ReportFilterDialog Component
 * ─────────────────────────────────────────────
 * Dialog "Chọn báo cáo / Lọc" dùng filter schema của Field Contract V2.
 *
 * Usage:
 *   ReportFilterDialog.open({
 *     formName: 'frmReportFilter',       // Tên Field Contract V2
 *     title: 'Chọn báo cáo',             // optional
 *     onConfirm: function(values) {      // values = { fieldName: value, ... }
 *       console.log(values);
 *     }
 *   });
 *
 * Schema field (từ state.runtimeSchemas.filters):
 *   renderRule = ''   → text input
 *   renderRule = 'dt' → date input
 *   renderRule = 'nm' → number input
 *   renderRule = 'sl' → select (dataSource = API path hoặc STATIC:v1=Nhãn 1,v2=Nhãn 2)
 *   renderRule = 'sr' → select + search (SearchDropdown)
 *   renderRule = 'dr' → date range (Từ ngày + Đến ngày trên cùng dòng)
 */
var ReportFilterDialog = (function () {

  var _activeModal = null;

  // ── Helpers ──────────────────────────────────────────────────

  function _currentUser() {
    var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
    return u.Username || u.UserName || u.username || 'Admin';
  }

  /** Lấy filter schema từ service metadata duy nhất của runtime. */
  function _fetchSchema(formName) {
    if (!window.FieldSyncService || typeof FieldSyncService.getFilterSchema !== 'function') {
      return Promise.reject(new Error('FieldSyncService chưa sẵn sàng.'));
    }
    return FieldSyncService.getFilterSchema(formName);
  }

  /**
   * Fetch datasource cho select field
   * dataSource format:
   *   '/api/API_DanhSachKhuVuc'       → gọi API, lấy [{ value, label }]
   *   'STATIC:--Tất cả--=,value1=Nhãn 1,value2=Nhãn 2'
   */
  function _fetchOptions(dataSource, valueField, labelField, field) {
    if (field && Array.isArray(field.options) && field.options.length > 0) {
      return Promise.resolve(field.options.map(function (opt) {
        return {
          value: opt.value !== undefined ? opt.value : (opt.Value !== undefined ? opt.Value : ''),
          label: opt.label || opt.Label || opt.text || opt.value || ''
        };
      }));
    }

    if (field && field.lookupKey) {
      if (!window.FieldSyncService || typeof FieldSyncService.searchLookup !== 'function') {
        return Promise.reject(new Error('FieldSyncService chưa sẵn sàng.'));
      }
      return FieldSyncService.searchLookup(
        field.formName,
        field.lookupKey,
        '',
        1,
        100,
        {},
        ''
      );
    }

    if (!dataSource) return Promise.resolve([]);

    // STATIC: prefix
    if (dataSource.indexOf('STATIC:') === 0) {
      var raw = dataSource.substring(7);
      var opts = raw.split(',').map(function (item) {
        var parts = item.split('|');
        if (parts.length < 2) parts = item.split('=');
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
      var fromWrap = UIInput.createDate({ name: name + '_From', value: defaultVal, placeholder: 'Từ ngày' });
      var toWrap = UIInput.createDate({ name: name + '_To', placeholder: 'Đến ngày' });
      var fromInput = fromWrap.querySelector('input');
      var toInput = toWrap.querySelector('input');

      var row = document.createElement('div');
      row.className = 'rfd-row';
      var lbl = document.createElement('label');
      lbl.className = 'rfd-label';
      lbl.textContent = label;
      row.appendChild(lbl);

      var rangeWrap = document.createElement('div');
      rangeWrap.className = 'rfd-date-range';
      rangeWrap.appendChild(fromWrap);
      var sep = document.createElement('span');
      sep.className = 'rfd-date-sep';
      sep.textContent = 'Đến';
      rangeWrap.appendChild(sep);
      rangeWrap.appendChild(toWrap);
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
      var dateWrap = UIInput.createDate({ label: '', name: name, value: defaultVal, required: required });
      var input = dateWrap.querySelector('input');
      input.className = 'ui-input rfd-input';
      input.dataset.fieldName = name;

      return {
        row: _buildRow(label, required, dateWrap, visibleRule),
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
      var selectedVal = defaultVal || '';

      if (window.UIControls && typeof UIControls.createDataComboBox === 'function') {
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.dataset.fieldName = name;
        hiddenInput.value = selectedVal;

        var comboContainer = document.createElement('div');
        comboContainer.style.width = '100%';

        var comboLoading = UIControls.createDataComboBox({
          placeholder: label ? ('Chọn ' + label + '...') : '-- Tất cả --',
          disabled: false
        });
        comboContainer.appendChild(comboLoading);

        _fetchOptions(field.dataSource, field.valueField, field.labelField, field)
          .then(function (opts) {
            var comboData = [];
            opts.forEach(function (opt) {
              if (opt.value !== '') {
                comboData.push([opt.value, opt.label]);
              }
            });

            var newCombo = UIControls.createDataComboBox({
              placeholder: field.placeholder || label || '-- Tất cả --',
              headers: ['Mã / Giá trị', 'Tên / Nhãn'],
              data: comboData,
              colFilterIndex: 1,
              onSelect: function (r) {
                selectedVal = r ? r[0] : '';
                hiddenInput.value = selectedVal;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              },
              onChange: function (val) {
                selectedVal = val;
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            var displayInput = newCombo.querySelector('input.ui-input');
            if (selectedVal && displayInput) {
              var matched = comboData.find(function (r) { return String(r[0]) === String(selectedVal); });
              if (matched) {
                displayInput.value = matched[1];
              } else {
                displayInput.value = selectedVal;
              }
            }

            comboContainer.innerHTML = '';
            comboContainer.appendChild(newCombo);
          });

        var wrapper = document.createElement('div');
        wrapper.appendChild(hiddenInput);
        wrapper.appendChild(comboContainer);

        return {
          row: _buildRow(label, required, wrapper, visibleRule),
          getValue: function () {
            var o = {};
            o[name] = hiddenInput.value || selectedVal;
            return o;
          },
          setValue: function (v) {
            selectedVal = v || '';
            hiddenInput.value = selectedVal;
            var displayInput = wrapper.querySelector('input.ui-input');
            if (displayInput) displayInput.value = selectedVal;
          }
        };
      }

      var sel = document.createElement('select');
      sel.className = 'ui-input rfd-input rfd-select';
      sel.dataset.fieldName = name;
      sel.required = required;

      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '--Tất cả--';
      sel.appendChild(placeholder);

      _fetchOptions(field.dataSource, field.valueField, field.labelField, field)
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

      return {
        row: _buildRow(label, required, sel, visibleRule),
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
   * VisibleRule syntax từ Field Contract V2:
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
   * @param {string} opts.formName         - FormName trong Field Contract V2
   * @param {string} [opts.title]          - Tiêu đề dialog, mặc định 'Chọn báo cáo'
   * @param {Object} [opts.defaultValues]  - Giá trị mặc định { fieldName: value }
   * @param {Function} opts.onConfirm      - Callback khi bấm Đồng ý, nhận (values)
   * @param {Function} [opts.onCancel]     - Callback khi bấm Hủy
   */
  function open(opts) {
    opts = opts || {};
    if (!opts.formName) { console.error('ReportFilterDialog: formName is required'); return; }
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
        var dataList = Array.isArray(res) ? res : [];

        if (!dataList.length) {
          body.innerHTML = '<div style="color:var(--color-text-secondary);padding:16px;">Không tìm thấy cấu hình filter cho form: ' + opts.formName + '</div>';
          return;
        }

        // Sort theo OrderNo
        dataList.sort(function (a, b) { return (a.OrderNo || a.orderNo || 0) - (b.OrderNo || b.orderNo || 0); });

        dataList.forEach(function (item) {
          var hasLookup = !!item.lookupKey;
          var fieldDef = {
            formName: opts.formName,
            name: item.name || item.FieldName,
            label: item.label || item.CaptionVN,
            required: item.required === true || item.IsRequired === true || Number(item.IsRequired) === 1,
            renderRule: (hasLookup ? 'sr' : (item.renderRule || item.FormatID || '')).toLowerCase().trim(),
            dataSource: (item.dataSource || item.DataSource || '').trim(),
            lookupKey: item.lookupKey || '',
            valueField: item.filterValueField || item.valueField || item.ValueField || 'Value',
            labelField: item.filterDisplayField || item.labelField || item.LabelField || 'Label',
            defaultValue: item.filterDefaultValue || item.defaultValue || item.DefaultValue || '',
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

  /** Xóa cache metadata qua FieldSyncService. */
  function clearCache(formName) {
    if (window.FieldSyncService && typeof FieldSyncService.clearCache === 'function') {
      FieldSyncService.clearCache(formName);
    }
  }

  return {
    open: open,
    clearCache: clearCache
  };
})();
