/**
 * WizardForm — Multi-Step Add Form
 * ─────────────────────────────────────────────────────────
 * Kích hoạt bằng cách thêm WizardSteps vào MODULE_CONFIG
 * khi khai báo module trong APP_MODULES hoặc qua API:
 *
 *   WizardSteps: [
 *     { label: 'Cơ bản',    icon: 'person',   description: 'Thông tin chính', fields: ['HoTen','BoPhan','ChucVu','NgayVaoLam'] },
 *     { label: 'Cá nhân',   icon: 'badge',    description: 'Thông tin cá nhân', fields: ['NgaySinh','CCCD','DienThoai','DiaChi'] },
 *     { label: 'Hợp đồng', icon: 'description', description: 'Thông tin hợp đồng', fields: ['LoaiHD','LuongCoBan','NganHang'] },
 *     { label: 'Xem lại',   icon: 'fact_check', description: 'Kiểm tra & xác nhận', fields: [] }
 *   ]
 *
 * File này export hàm WizardForm.open(config) để DynamicFormEngine gọi.
 */
var WizardForm = (function () {

  // ── CSS Inject (chỉ inject 1 lần) ──────────────────────────────────────
  var _cssInjected = false;
  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    var style = document.createElement('style');
    style.id = 'wizard-form-css';
    style.textContent = [
      '@keyframes wz-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes wz-slidein { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }',
      '.wz-overlay { position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.52); display:flex; align-items:center; justify-content:center; padding:16px; animation:wz-fadein 0.2s ease; }',
      '.wz-dialog { background:var(--color-surface); border-radius:var(--radius-lg,16px); box-shadow:0 32px 80px rgba(0,0,0,0.22); width:min(680px,95vw); max-height:90vh; display:flex; flex-direction:column; overflow:hidden; animation:wz-fadein 0.25s cubic-bezier(0.16,1,0.3,1); }',
      '.wz-header { padding:20px 24px 16px; border-bottom:1px solid var(--color-border); flex-shrink:0; }',
      '.wz-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }',
      '.wz-title { margin:0; font-size:16px; font-weight:700; color:var(--color-text); }',
      '.wz-close { background:none; border:none; cursor:pointer; color:var(--color-text-secondary); display:flex; align-items:center; padding:4px; border-radius:6px; transition:color 0.15s,background 0.15s; }',
      '.wz-close:hover { background:var(--color-background); color:var(--color-text); }',
      /* Stepper */
      '.wz-stepper { display:flex; align-items:flex-start; gap:0; }',
      '.wz-step-item { display:flex; align-items:flex-start; flex:1; min-width:0; }',
      '.wz-step-node { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }',
      '.wz-step-circle { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; border:2px solid var(--color-border-strong); background:var(--color-surface); color:var(--color-text-secondary); transition:all 0.25s ease; }',
      '.wz-step-circle.active { background:var(--color-primary); border-color:var(--color-primary); color:#fff; box-shadow:0 4px 12px rgba(79,70,229,0.3); }',
      '.wz-step-circle.done { background:var(--color-success); border-color:var(--color-success); color:#fff; }',
      '.wz-step-label { font-size:11px; font-weight:500; color:var(--color-text-secondary); white-space:nowrap; transition:color 0.25s; }',
      '.wz-step-label.active { color:var(--color-primary); font-weight:600; }',
      '.wz-step-label.done { color:var(--color-success); }',
      '.wz-step-line { flex:1; height:2px; margin:17px 6px 0; background:var(--color-border-strong); transition:background 0.3s; min-width:12px; }',
      '.wz-step-line.done { background:var(--color-success); }',
      /* Body */
      '.wz-body { flex:1; overflow-y:auto; padding:20px 24px; }',
      '.wz-step-header { margin-bottom:14px; }',
      '.wz-step-title { font-size:14px; font-weight:600; color:var(--color-text); margin-bottom:3px; }',
      '.wz-step-desc { font-size:12px; color:var(--color-text-secondary); }',
      '.wz-fields-grid { display:flex; flex-wrap:wrap; gap:14px 12px; }',
      '.wz-fields-grid .df-col-12 { width:100%; }',
      '.wz-fields-grid .df-col-6 { width:calc(50% - 6px); }',
      /* Review step */
      '.wz-review-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--color-border); border:1px solid var(--color-border); border-radius:8px; overflow:hidden; }',
      '.wz-review-cell { background:var(--color-surface); padding:8px 12px; display:flex; flex-direction:column; gap:2px; }',
      '.wz-review-label { font-size:11px; color:var(--color-text-secondary); font-weight:500; }',
      '.wz-review-value { font-size:13px; color:var(--color-text); font-weight:500; word-break:break-word; }',
      /* Footer */
      '.wz-footer { padding:14px 24px; border-top:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; background:var(--color-surface); flex-shrink:0; }',
      '.wz-step-info { font-size:12px; color:var(--color-text-secondary); }',
      '.wz-btn-group { display:flex; gap:10px; }',
      /* Progress bar */
      '.wz-progress { height:3px; background:var(--color-border); position:relative; flex-shrink:0; }',
      '.wz-progress-bar { height:100%; background:var(--color-primary); transition:width 0.35s ease; }',
      /* Slide animation */
      '.wz-body .wz-step-content { animation:wz-slidein 0.2s ease; }',
      /* Field animation */
      '.wz-fields-grid > div { animation:wz-fadein 0.18s ease; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Hàm mở wizard ─────────────────────────────────────────────────────
  function open(config) {
    _injectCSS();

    var steps = config.steps;             // WizardSteps array
    var formSchema = config.formSchema;   // globalFormSchema
    var saveData = config.saveData;       // _saveData(isEdit, row, modal, body, btn)
    var moduleConfig = config.moduleConfig; // MODULE_CONFIG
    var currentUser = config.currentUser; // _currentUser()

    var totalSteps = steps.length;
    var currentStep = 0;
    var formState = {};                   // Tích lũy data qua các bước

    // ── Build DOM ──────────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay';

    var dialog = document.createElement('div');
    dialog.className = 'wz-dialog';
    overlay.appendChild(dialog);

    // Header
    var header = document.createElement('div');
    header.className = 'wz-header';

    var titleRow = document.createElement('div');
    titleRow.className = 'wz-title-row';

    var titleEl = document.createElement('h3');
    titleEl.className = 'wz-title';
    titleEl.textContent = moduleConfig.TitleAdd || 'Thêm mới';

    var btnClose = document.createElement('button');
    btnClose.className = 'wz-close';
    btnClose.type = 'button';
    btnClose.innerHTML = '<span class="material-symbols-outlined" style="font-size:22px;">close</span>';
    btnClose.onclick = _close;
    titleRow.appendChild(titleEl);
    titleRow.appendChild(btnClose);
    header.appendChild(titleRow);

    // Stepper
    var stepperEl = document.createElement('div');
    stepperEl.className = 'wz-stepper';
    steps.forEach(function (step, idx) {
      var item = document.createElement('div');
      item.className = 'wz-step-item';

      var node = document.createElement('div');
      node.className = 'wz-step-node';

      var circle = document.createElement('div');
      circle.className = 'wz-step-circle';
      circle.dataset.stepCircle = idx;
      circle.innerHTML = step.icon
        ? '<span class="material-symbols-outlined" style="font-size:17px;">' + step.icon + '</span>'
        : (idx + 1);

      var label = document.createElement('div');
      label.className = 'wz-step-label';
      label.dataset.stepLabel = idx;
      label.textContent = step.label;

      node.appendChild(circle);
      node.appendChild(label);
      item.appendChild(node);

      if (idx < totalSteps - 1) {
        var line = document.createElement('div');
        line.className = 'wz-step-line';
        line.dataset.stepLine = idx;
        item.appendChild(line);
      }

      stepperEl.appendChild(item);
    });
    header.appendChild(stepperEl);
    dialog.appendChild(header);

    // Progress bar
    var progressWrap = document.createElement('div');
    progressWrap.className = 'wz-progress';
    var progressBar = document.createElement('div');
    progressBar.className = 'wz-progress-bar';
    progressBar.style.width = (100 / totalSteps) + '%';
    progressWrap.appendChild(progressBar);
    dialog.appendChild(progressWrap);

    // Body
    var body = document.createElement('div');
    body.className = 'wz-body';
    dialog.appendChild(body);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'wz-footer';

    var stepInfoEl = document.createElement('span');
    stepInfoEl.className = 'wz-step-info';

    var btnGroup = document.createElement('div');
    btnGroup.className = 'wz-btn-group';

    var btnBack = document.createElement('button');
    btnBack.className = 'btn btn-outline';
    btnBack.type = 'button';
    btnBack.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_back</span> Quay lại';
    btnBack.onclick = _goBack;

    var btnNext = document.createElement('button');
    btnNext.className = 'btn btn-primary';
    btnNext.type = 'button';
    btnNext.onclick = _goNext;

    btnGroup.appendChild(btnBack);
    btnGroup.appendChild(btnNext);
    footer.appendChild(stepInfoEl);
    footer.appendChild(btnGroup);
    dialog.appendChild(footer);

    // ── Helpers ────────────────────────────────────────────────────────
    function _close() {
      overlay.remove();
      if (history.state && history.state.wizardOpen) history.back();
    }

    function _collect() {
      body.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name && el.type !== 'button') formState[el.name] = el.value;
      });
    }

    function _validate() {
      var step = steps[currentStep];
      if (!step.fields || !step.fields.length) return [];
      var missing = [];
      step.fields.forEach(function (fn) {
        var schema = formSchema.find(function (f) { return f.name === fn; });
        if (!schema || !schema.required) return;
        var show = String(schema.showInAdd) === '1' || schema.showInAdd === true;
        if (!show) return;
        var val = (formState[fn] || '').trim();
        if (!val) missing.push(schema.label || fn);
      });
      return missing;
    }

    function _updateUI() {
      // Stepper circles
      steps.forEach(function (_, idx) {
        var circle = stepperEl.querySelector('[data-step-circle="' + idx + '"]');
        var lbl = stepperEl.querySelector('[data-step-label="' + idx + '"]');
        var line = stepperEl.querySelector('[data-step-line="' + idx + '"]');
        circle.className = 'wz-step-circle' + (idx < currentStep ? ' done' : idx === currentStep ? ' active' : '');
        if (idx < currentStep) {
          circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">check</span>';
        } else {
          circle.innerHTML = steps[idx].icon
            ? '<span class="material-symbols-outlined" style="font-size:17px;">' + steps[idx].icon + '</span>'
            : (idx + 1);
        }
        lbl.className = 'wz-step-label' + (idx < currentStep ? ' done' : idx === currentStep ? ' active' : '');
        if (line) line.className = 'wz-step-line' + (idx < currentStep ? ' done' : '');
      });

      // Progress bar
      progressBar.style.width = (((currentStep + 1) / totalSteps) * 100) + '%';

      // Step info
      stepInfoEl.textContent = 'Bước ' + (currentStep + 1) + ' / ' + totalSteps;

      // Buttons
      btnBack.style.display = currentStep === 0 ? 'none' : '';
      if (currentStep === totalSteps - 1) {
        btnNext.className = 'btn btn-success';
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">check_circle</span> Hoàn tất & Lưu';
      } else {
        btnNext.className = 'btn btn-primary';
        btnNext.innerHTML = 'Tiếp theo <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_forward</span>';
      }
    }

    function _renderStep(idx) {
      body.innerHTML = '';
      var step = steps[idx];
      var content = document.createElement('div');
      content.className = 'wz-step-content';

      // Step header
      var sh = document.createElement('div');
      sh.className = 'wz-step-header';
      var st = document.createElement('div');
      st.className = 'wz-step-title';
      st.textContent = step.label;
      sh.appendChild(st);
      if (step.description) {
        var sd = document.createElement('div');
        sd.className = 'wz-step-desc';
        sd.textContent = step.description;
        sh.appendChild(sd);
      }
      content.appendChild(sh);

      // Step cuối → Review
      var isLastStep = !step.fields || step.fields.length === 0;
      if (isLastStep) {
        _renderReview(content);
      } else {
        _renderFields(content, step.fields);
      }

      body.appendChild(content);
      if (!isLastStep) {
        setTimeout(function () {
          var first = body.querySelector('input:not([type="hidden"]):not([disabled])');
          if (first) first.focus();
        }, 80);
      }
    }

    function _renderFields(container, fieldNames) {
      var grid = document.createElement('div');
      grid.className = 'wz-fields-grid';

      fieldNames.forEach(function (fn) {
        var field = formSchema.find(function (f) { return f.name === fn; });
        if (!field) return;

        // Restore giá trị đã nhập ở bước trước
        field.value = formState[fn] || '';

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
          inputEl = _buildSelectField(field);
        } else {
          inputEl = UIInput.createText(field);
        }

        var span = String(field.position || 'body');
        var colClass = (span === 'grid' || span === '6') ? 'df-col-6' : 'df-col-12';
        var wrapper = document.createElement('div');
        wrapper.className = colClass;
        wrapper.appendChild(inputEl);
        grid.appendChild(wrapper);
      });
      container.appendChild(grid);
    }

    function _buildSelectField(field) {
      var fgw = document.createElement('div');
      fgw.className = 'form-group';
      if (field.label) {
        var lbl = document.createElement('label');
        lbl.innerText = field.label;
        if (field.required) {
          var req = document.createElement('span');
          req.innerText = ' *';
          req.style.color = 'var(--color-danger)';
          lbl.appendChild(req);
        }
        fgw.appendChild(lbl);
      }
      var hiddenIn = document.createElement('input');
      hiddenIn.type = 'hidden';
      hiddenIn.name = field.name;
      hiddenIn.value = field.value || '';
      fgw.appendChild(hiddenIn);

      var ds = field.dataSource || '';
      if (ds.toUpperCase().startsWith('STATIC:')) {
        var staticData = ds.substring(7).split(',').map(function (s) {
          var p = s.split('|');
          return [p[0], p[1] || p[0]];
        });
        var combo = UIControls.createDataComboBox({
          placeholder: '-- Vui lòng chọn --',
          headers: ['Mã', 'Tên'],
          onSearch: function (q) {
            return Promise.resolve({
              headers: ['Mã', 'Tên'],
              data: q ? staticData.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; }) : staticData,
              colFilterIndex: 1
            });
          },
          onSelect: function (row) { hiddenIn.value = row[0]; formState[field.name] = row[0]; }
        });
        var matched = staticData.find(function (r) { return r[0] == field.value; });
        var dIn = combo.querySelector('input.ui-input');
        if (matched && dIn) dIn.value = matched[1];
        fgw.appendChild(combo);
      } else if (ds) {
        var endpointRaw = ds.indexOf('|') > -1 ? ds.split('|')[0] : ds;
        var baseUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '');
        var finalUrl = baseUrl + '/api/API_Gateway_Router';
        var fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View', UserName: currentUser };
        var lazyCombo = UIControls.createDataComboBox({
          placeholder: '-- Vui lòng chọn --',
          headers: ['Mã', 'Tên'],
          onSearch: function (q) {
            var pl = Object.assign({}, fetchPayload);
            if (q) pl.Keyword = q;
            return ApiClient.post(finalUrl, pl).then(function (res) {
              var list = res.list || res.records || [];
              if (!list.length) return { headers: ['Mã', 'Tên'], data: [], colFilterIndex: 1 };
              var keys = Object.keys(list[0]);
              return { headers: keys, data: list.map(function (d) { return keys.map(function (k) { return d[k] != null ? d[k] : ''; }); }), colFilterIndex: 1 };
            });
          },
          onSelect: function (row) { hiddenIn.value = row[0]; formState[field.name] = row[0]; }
        });
        fgw.appendChild(lazyCombo);
      }
      return fgw;
    }

    function _renderReview(container) {
      var reviewGrid = document.createElement('div');
      reviewGrid.className = 'wz-review-grid';

      var allFields = [];
      steps.forEach(function (s) {
        if (s.fields) s.fields.forEach(function (fn) { allFields.push(fn); });
      });

      var hasAny = false;
      allFields.forEach(function (fn) {
        var schema = formSchema.find(function (f) { return f.name === fn; });
        if (!schema) return;
        var val = formState[fn] || '';
        if (!val) return;
        hasAny = true;
        var cell = document.createElement('div');
        cell.className = 'wz-review-cell';
        var lbl = document.createElement('div');
        lbl.className = 'wz-review-label';
        lbl.textContent = schema.label || fn;
        var valEl = document.createElement('div');
        valEl.className = 'wz-review-value';
        valEl.textContent = val;
        cell.appendChild(lbl);
        cell.appendChild(valEl);
        reviewGrid.appendChild(cell);
      });

      if (!hasAny) {
        reviewGrid.innerHTML = '<div class="wz-review-cell" style="grid-column:span 2; text-align:center; color:var(--color-text-secondary); padding:20px;">Chưa có dữ liệu</div>';
      }

      container.appendChild(reviewGrid);

      // Tip
      var tip = document.createElement('div');
      tip.style.cssText = 'margin-top:12px; font-size:12px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px;';
      tip.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:var(--color-info);">info</span> Kiểm tra thông tin trước khi lưu. Bấm "Quay lại" nếu cần chỉnh sửa.';
      container.appendChild(tip);
    }

    function _goBack() {
      _collect();
      currentStep--;
      _renderStep(currentStep);
      _updateUI();
    }

    function _goNext() {
      _collect();
      var missing = _validate();
      if (missing.length) {
        if (window.UIToast) UIToast.show('Vui lòng điền: ' + missing.join(', '), 'warning');
        else alert('Vui lòng điền: ' + missing.join(', '));
        return;
      }

      if (currentStep < totalSteps - 1) {
        currentStep++;
        _renderStep(currentStep);
        _updateUI();
      } else {
        // ── Lưu ──
        btnNext.disabled = true;
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;animation:wz-spin 0.8s linear infinite;">progress_activity</span> Đang lưu...';

        var fakeBody = document.createElement('div');
        Object.keys(formState).forEach(function (key) {
          var inp = document.createElement('input');
          inp.type = 'hidden'; inp.name = key; inp.value = formState[key] || '';
          fakeBody.appendChild(inp);
        });

        var fakeModal = { closeNow: function () { overlay.remove(); }, close: function () { overlay.remove(); } };
        saveData(false, {}, fakeModal, fakeBody, btnNext);
      }
    }

    // ── Click outside to close ──
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _close();
    });

    // ── Keyboard: Escape ──
    function _onKeydown(e) {
      if (e.key === 'Escape') { _close(); document.removeEventListener('keydown', _onKeydown); }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _goNext(); }
    }
    document.addEventListener('keydown', _onKeydown);

    // ── Khởi tạo ──
    document.getElementById('modal-container').appendChild(overlay);
    history.pushState({ wizardOpen: true }, null, window.location.href);
    _renderStep(0);
    _updateUI();

    return { close: _close };
  }

  return { open: open };
})();
