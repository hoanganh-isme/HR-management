/**
 * WizardForm — Multi-Step Add Form
 * ─────────────────────────────────────────────────────────
 * Kích hoạt bằng cách thêm WizardSteps vào MODULE_CONFIG
 * khi khai báo module trong APP_MODULES hoặc qua API:
 *
 *   WizardSteps: [
 *     { label: 'Cơ bản',    icon: 'person',      description: 'Thông tin cơ bản', fields: ['HoTen','BoPhan','ChucVu','ChucDanhChuyenMon','NgayNhanViec'] },
 *     { label: 'Cá nhân',   icon: 'badge',       description: 'Thông tin cá nhân', fields: ['NgaySinh','CCCD','DienThoai','DiaChi'] },
 *     { label: 'Hợp đồng',  icon: 'description', description: 'Thông tin hợp đồng', fields: ['LoaiHD','LuongCoBan','NganHang'] },
 *     { label: 'Xác nhận',  icon: 'fact_check',  description: 'Kiểm tra & xác nhận', fields: [] }
 *   ]
 *
 * Config mới:
 *   - config.userBranches  : Array chi nhánh user được gán  [{ id:'VP', name:'Văn Phòng' }, ...]
 *   - config.moduleConfig.BranchPrefixMap : object map  { 'VP':'VP', 'TDG':'TDG', ... }
 *   - config.moduleConfig.ApiSearch       : endpoint để query PersonID list
 *
 * File này export hàm WizardForm.open(config) để DynamicFormEngine gọi.
 */
var WizardForm = (function () {

  // ── Bảng tên hiển thị chi nhánh (BranchID → tên tiếng Việt)
  // Sync với bảng CASE/WHEN trong SP [HR_MaNVTuTangTheoBranch]
  var BRANCH_DISPLAY = {
    'COBI': 'COBI',
    'DONGDU': 'Đông Du',
    'ESTELLA': 'Estella',
    'HOANGHAI': 'Hoàng Hải',
    'HUNGVUONG': 'Hùng Vương',
    'NAMVINH': 'Nam Vinh',
    'SGCENTER': 'SG Center',
    'THANHDA': 'Thành Đa',
    'TRANHUNGDAO': 'Trần Hưng Đạo',
    'VANPHONG': 'Văn Phòng',
    // ── Thêm chi nhánh mới vào đây khi DB được cập nhật ──────────
  };

  // ── CSS Inject (chỉ inject 1 lần) ───────────────────────────────────────
  var _cssInjected = false;
  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    var style = document.createElement('style');
    style.id = 'wizard-form-css';
    style.textContent = [
      /* ── Animations ─────────────────────────────────────────────── */
      '@keyframes wz-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes wz-slidein { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }',
      '@keyframes wz-pop { 0%{transform:scale(0.85);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }',
      '@keyframes wz-spin { to { transform:rotate(360deg); } }',
      '@keyframes wz-badge-in { from{opacity:0;transform:scale(0.7) translateY(-4px)} to{opacity:1;transform:scale(1) translateY(0)} }',

      /* ── Overlay & Dialog ────────────────────────────────────────── */
      '.wz-overlay { position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px; animation:wz-fadein 0.2s ease; backdrop-filter:blur(2px); }',
      '.wz-dialog { background:var(--color-surface); border-radius:var(--radius-lg,16px); box-shadow:0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06); width:min(840px,95vw); max-height:90vh; display:flex; flex-direction:column; overflow:hidden; animation:wz-fadein 0.28s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Header ─────────────────────────────────────────────────── */
      '.wz-header { padding:20px 28px 16px; border-bottom:1px solid var(--color-border); flex-shrink:0; }',
      '.wz-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; gap:12px; }',
      '.wz-title { margin:0; font-size:16px; font-weight:700; color:var(--color-text); display:flex; align-items:center; gap:8px; }',
      '.wz-title-icon { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.wz-title-icon .material-symbols-outlined { font-size:18px; color:#fff; }',
      '.wz-close { background:none; border:none; cursor:pointer; color:var(--color-text-secondary); display:flex; align-items:center; padding:6px; border-radius:8px; transition:color 0.15s,background 0.15s; flex-shrink:0; }',
      '.wz-close:hover { background:var(--color-background); color:var(--color-text); }',

      /* ── Stepper ─────────────────────────────────────────────────── */
      '.wz-stepper { display:flex; align-items:flex-start; gap:0; }',
      '.wz-step-item { display:flex; align-items:flex-start; flex:1; min-width:0; }',
      '.wz-step-node { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }',
      '.wz-step-circle { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; border:2px solid var(--color-border-strong,#374151); background:var(--color-surface); color:var(--color-text-secondary); transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }',
      '.wz-step-circle.active { background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); border-color:var(--color-primary); color:#fff; box-shadow:0 4px 14px rgba(79,70,229,0.35); transform:scale(1.08); }',
      '.wz-step-circle.done { background:var(--color-success,#10b981); border-color:var(--color-success,#10b981); color:#fff; }',
      '.wz-step-label { font-size:11px; font-weight:500; color:var(--color-text-secondary); white-space:nowrap; transition:color 0.25s; }',
      '.wz-step-label.active { color:var(--color-primary); font-weight:700; }',
      '.wz-step-label.done { color:var(--color-success,#10b981); }',
      '.wz-step-line { flex:1; height:2px; margin:18px 6px 0; background:var(--color-border-strong,#374151); transition:background 0.35s; min-width:12px; }',
      '.wz-step-line.done { background:var(--color-success,#10b981); }',

      /* ── Body ────────────────────────────────────────────────────── */
      '.wz-body { flex:1; overflow-y:auto; padding:22px 28px; scrollbar-width:thin; }',
      '.wz-body::-webkit-scrollbar { width:5px; }',
      '.wz-body::-webkit-scrollbar-thumb { background:var(--color-border); border-radius:4px; }',

      /* ── Step header ─────────────────────────────────────────────── */
      '.wz-step-header { margin-bottom:18px; display:flex; align-items:center; gap:10px; }',
      '.wz-step-header-icon { width:36px; height:36px; border-radius:10px; background:rgba(79,70,229,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.wz-step-header-icon .material-symbols-outlined { font-size:20px; color:var(--color-primary); }',
      '.wz-step-title { font-size:15px; font-weight:700; color:var(--color-text); margin-bottom:2px; }',
      '.wz-step-desc { font-size:12px; color:var(--color-text-secondary); }',

      /* ── Section divider trong form ─────────────────────────────── */
      '.wz-section-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--color-text-secondary); padding:4px 0; margin-bottom:4px; border-bottom:1px solid var(--color-border); width:100%; }',

      /* ── Fields Grid 2 cột ───────────────────────────────────────── */
      '.wz-fields-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 16px; }',
      '.wz-fields-grid .df-col-12 { grid-column:1 / -1; }',
      '.wz-fields-grid .df-col-6 { grid-column:span 1; }',
      '.wz-fields-grid .df-section { grid-column:1 / -1; }',
      '@media (max-width:560px) { .wz-fields-grid { grid-template-columns:1fr; } .wz-fields-grid .df-col-6 { grid-column:1 / -1; } }',

      /* ── Branch picker ───────────────────────────────────────────── */
      '.wz-branch-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }',
      '.wz-branch-card { border:2px solid var(--color-border); border-radius:12px; padding:14px 12px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); background:var(--color-background); }',
      '.wz-branch-card:hover { border-color:var(--color-primary); background:rgba(79,70,229,0.05); transform:translateY(-2px); box-shadow:0 4px 12px rgba(79,70,229,0.15); }',
      '.wz-branch-card.selected { border-color:var(--color-primary); background:rgba(79,70,229,0.08); box-shadow:0 0 0 3px rgba(79,70,229,0.18), 0 4px 14px rgba(79,70,229,0.2); transform:translateY(-2px); }',
      '.wz-branch-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark,#4338ca)); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }',
      '.wz-branch-card.selected .wz-branch-icon { transform:scale(1.1); }',
      '.wz-branch-icon .material-symbols-outlined { font-size:22px; color:#fff; }',
      '.wz-branch-name { font-size:13px; font-weight:600; color:var(--color-text); text-align:center; }',
      '.wz-branch-code { font-size:11px; font-weight:500; color:var(--color-text-secondary); font-family:monospace; }',
      '.wz-branch-check { width:18px; height:18px; border-radius:50%; background:var(--color-primary); display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0); transition:all 0.2s; }',
      '.wz-branch-card.selected .wz-branch-check { opacity:1; transform:scale(1); }',
      '.wz-branch-check .material-symbols-outlined { font-size:12px; color:#fff; }',

      /* ── PersonID badge ─────────────────────────────────────────── */
      '.wz-id-box { background:var(--color-background); border:1px solid var(--color-border); border-radius:10px; padding:14px 18px; display:flex; align-items:center; gap:12px; margin-top:2px; }',
      '.wz-id-loading { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--color-text-secondary); }',
      '.wz-id-badge { animation:wz-badge-in 0.35s cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; gap:10px; }',
      '.wz-id-value { font-size:22px; font-weight:800; font-family:monospace; letter-spacing:0.04em; color:var(--color-primary); }',
      '.wz-id-tag { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:3px 8px; border-radius:20px; background:rgba(79,70,229,0.12); color:var(--color-primary); }',
      '.wz-id-hint { font-size:11px; color:var(--color-text-secondary); margin-top:4px; }',

      /* ── Review grid ─────────────────────────────────────────────── */
      '.wz-review-wrap { display:flex; flex-direction:column; gap:16px; }',
      '.wz-review-section { border:1px solid var(--color-border); border-radius:10px; overflow:hidden; }',
      '.wz-review-section-title { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:var(--color-text-secondary); padding:10px 14px; background:var(--color-background); border-bottom:1px solid var(--color-border); display:flex; align-items:center; gap:6px; }',
      '.wz-review-section-title .material-symbols-outlined { font-size:15px; color:var(--color-primary); }',
      '.wz-review-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--color-border); }',
      '.wz-review-cell { background:var(--color-surface); padding:10px 14px; display:flex; flex-direction:column; gap:3px; }',
      '.wz-review-cell.full { grid-column:1 / -1; }',
      '.wz-review-label { font-size:11px; color:var(--color-text-secondary); font-weight:500; }',
      '.wz-review-value { font-size:13px; color:var(--color-text); font-weight:600; word-break:break-word; }',
      '.wz-review-value.mono { font-family:monospace; color:var(--color-primary); font-size:14px; }',

      /* ── Footer ─────────────────────────────────────────────────── */
      '.wz-footer { padding:16px 28px; border-top:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; background:var(--color-surface); flex-shrink:0; }',
      '.wz-step-info { font-size:12px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px; }',
      '.wz-step-info-dots { display:flex; gap:5px; }',
      '.wz-step-dot { width:7px; height:7px; border-radius:50%; background:var(--color-border); transition:all 0.25s; }',
      '.wz-step-dot.active { background:var(--color-primary); width:20px; border-radius:4px; }',
      '.wz-step-dot.done { background:var(--color-success,#10b981); }',
      '.wz-btn-group { display:flex; gap:10px; }',

      /* ── Progress bar ────────────────────────────────────────────── */
      '.wz-progress { height:3px; background:var(--color-border); position:relative; flex-shrink:0; }',
      '.wz-progress-bar { height:100%; background:linear-gradient(90deg,var(--color-primary),var(--color-primary-dark,#4338ca)); transition:width 0.4s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Slide animation ─────────────────────────────────────────── */
      '.wz-body .wz-step-content { animation:wz-slidein 0.22s cubic-bezier(0.16,1,0.3,1); }',

      /* ── Empty state ────────────────────────────────────────────── */
      '.wz-no-branch { text-align:center; padding:32px 20px; color:var(--color-text-secondary); }',
      '.wz-no-branch .material-symbols-outlined { font-size:40px; display:block; margin-bottom:8px; opacity:0.4; }',

      /* ── Form group compact ─────────────────────────────────────── */
      '.wz-fields-grid .form-group { margin-bottom:0; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // Prefix map — đồng bộ với CASE/WHEN trong SP [HR_MaNVTuTangTheoBranch]
  var BRANCH_PREFIX_MAP = {
    'COBI': 'COBI',
    'DONGDU': 'DD',
    'ESTELLA': 'ETL',
    'HOANGHAI': 'HH',
    'HUNGVUONG': 'HV',
    'NAMVINH': 'NV',
    'SGCENTER': 'SGCT',
    'THANHDA': 'TD',
    'TRANHUNGDAO': 'THD',
    'VANPHONG': 'VP',
    // ── Thêm chi nhánh mới vào đây khi DB cập nhật ──────────────────
  };

  /**
   * Lấy PersonID tiếp theo theo logic gap-fill:
   * 1. SELECT tất cả PersonID có prefix của chi nhánh từ DB
   * 2. Tìm số thứ tự nhỏ nhất còn trống (VD: có 018,020,021 → cấp 019)
   * 3. Nếu không có gap → lấy MAX+1
   *
   * @param {string}   branchId    - BranchID trong DB: 'VANPHONG', 'THANHDA'...
   * @param {string}   apiUrl      - endpoint API_Gateway_Router
   * @param {string}   currentUser
   * @param {Function} cb          - callback(personID: string, maVietTat: string, error?)
   */
  function _resolveNextPersonID(branchId, apiUrl, currentUser, cb) {
    var prefix = BRANCH_PREFIX_MAP[branchId.toUpperCase()] || branchId;

    // Query danh sách nhân viên hiện có theo prefix
    ApiClient.post(apiUrl, {
      List: 'WA_PersonFullFrm',
      FormName: 'WA_PersonFullFrm',
      Func: 'View',
      Limit: 9999,
      UserName: currentUser,
      JsonData: JSON.stringify({ PersonIDPrefix: prefix })
    }).then(function (res) {
      var list = res.list || res.records || res.data || [];

      // Trích số thứ tự: "VP018" → 18, "TD003" → 3
      var nums = [];
      list.forEach(function (r) {
        var pid = (r.PersonID || r.personID || '').toUpperCase();
        if (!pid.startsWith(prefix.toUpperCase())) return;
        var numStr = pid.substring(prefix.length);
        var n = parseInt(numStr, 10);
        if (!isNaN(n) && n > 0) nums.push(n);
      });

      nums.sort(function (a, b) { return a - b; });

      // Tìm gap nhỏ nhất bắt đầu từ 1
      var next = 1;
      for (var i = 0; i < nums.length; i++) {
        if (nums[i] === next) { next++; }
        else if (nums[i] > next) { break; } // gap found
      }

      // Zero-pad 3 chữ số: VP001, TD019, SGCT075...
      var padded = String(next).padStart(3, '0');
      var personID = prefix + padded;
      cb(personID, prefix, null);

    }).catch(function (err) {
      cb('', '', err);
    });
  }


  // ── Hàm mở wizard ────────────────────────────────────────────────────
  function _openAddStepper(config) {
    _injectCSS();

    var steps = config.steps;
    var formSchema = config.formSchema;
    var saveData = config.saveData;
    var moduleConfig = config.moduleConfig;
    var currentUser = config.currentUser;
    var userBranches = config.userBranches || [];   // [{ id:'VP', name:'Văn Phòng' }, ...]

    // Nếu không có danh sách chi nhánh → fallback đọc từ localStorage
    if (!userBranches || userBranches.length === 0) {
      try {
        var u = JSON.parse(localStorage.getItem('pmql_user') || '{}');
        var raw = u.ChiNhanhList || u.Branches || u.BranchCodes || u.ChiNhanh || [];
        if (Array.isArray(raw)) {
          userBranches = raw.map(function (b) {
            if (typeof b === 'string') return { id: b, name: b };
            return { id: b.id || b.Code || b.BranchCode, name: b.name || b.Name || b.BranchName || b.id };
          });
        }
      } catch (e) { }
    }

    var apiUrl = moduleConfig.ApiSearch || (
      typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL + '/api/API_Gateway_Router' : '/api/API_Gateway_Router'
    );

    var totalSteps = steps.length;
    var currentStep = 0;
    var formState = {};   // tích lũy data qua các bước
    var selectedBranch = null;  // { id, name }
    var resolvedPersonID = '';

    // ── Build DOM ────────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay';

    var dialog = document.createElement('div');
    dialog.className = 'wz-dialog';
    overlay.appendChild(dialog);

    // ── Header ──────────────────────────────────────────────────────
    var header = document.createElement('div');
    header.className = 'wz-header';

    var titleRow = document.createElement('div');
    titleRow.className = 'wz-title-row';

    var titleLeft = document.createElement('div');
    titleLeft.style.cssText = 'display:flex;align-items:center;gap:10px;min-width:0;';

    var titleIconBox = document.createElement('div');
    titleIconBox.className = 'wz-title-icon';
    titleIconBox.innerHTML = '<span class="material-symbols-outlined">person_add</span>';

    var titleEl = document.createElement('h3');
    titleEl.className = 'wz-title';
    titleEl.textContent = moduleConfig.TitleAdd || 'Thêm mới';

    titleLeft.appendChild(titleIconBox);
    titleLeft.appendChild(titleEl);

    var btnClose = document.createElement('button');
    btnClose.className = 'wz-close';
    btnClose.type = 'button';
    btnClose.title = 'Đóng (Esc)';
    btnClose.innerHTML = '<span class="material-symbols-outlined" style="font-size:22px;">close</span>';
    btnClose.onclick = _close;

    titleRow.appendChild(titleLeft);
    titleRow.appendChild(btnClose);
    header.appendChild(titleRow);

    // Stepper
    var stepperEl = document.createElement('div');
    stepperEl.className = 'wz-stepper';

    // Thêm step "Chi Nhánh" ở đầu (step index -1 trong flow, index 0 trong UI)
    var allStepDefs = [
      { label: 'Chi Nhánh', icon: 'location_city', description: 'Chọn chi nhánh & mã nhân viên' }
    ].concat(steps);
    var totalUISteps = allStepDefs.length;

    allStepDefs.forEach(function (step, idx) {
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

      if (idx < totalUISteps - 1) {
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
    progressBar.style.width = (100 / totalUISteps) + '%';
    progressWrap.appendChild(progressBar);
    dialog.appendChild(progressWrap);

    // Body
    var body = document.createElement('div');
    body.className = 'wz-body';
    dialog.appendChild(body);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'wz-footer';

    // Dot indicators
    var stepInfoEl = document.createElement('div');
    stepInfoEl.className = 'wz-step-info';
    var dotsEl = document.createElement('div');
    dotsEl.className = 'wz-step-info-dots';
    allStepDefs.forEach(function (_, idx) {
      var dot = document.createElement('div');
      dot.className = 'wz-step-dot';
      dot.dataset.dot = idx;
      dotsEl.appendChild(dot);
    });
    stepInfoEl.appendChild(dotsEl);

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

    // ── Helpers ──────────────────────────────────────────────────────
    function _close() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.18s';
      setTimeout(function () {
        overlay.remove();
        if (history.state && history.state.wizardOpen) history.back();
      }, 180);
    }

    function _collect() {
      body.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name && el.type !== 'button') formState[el.name] = el.value;
      });
    }

    function _validate() {
      // Step 0 UI → chọn chi nhánh
      var uiStep = currentStep; // 0 = branch picker, 1..n = wizard steps
      if (uiStep === 0) {
        return selectedBranch ? [] : ['Chi nhánh'];
      }
      var step = steps[uiStep - 1]; // map về steps gốc
      if (!step || !step.fields || !step.fields.length) return [];
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
      // Map currentStep (0-based UI) to allStepDefs index
      allStepDefs.forEach(function (_, idx) {
        var circle = stepperEl.querySelector('[data-step-circle="' + idx + '"]');
        var lbl = stepperEl.querySelector('[data-step-label="' + idx + '"]');
        var line = stepperEl.querySelector('[data-step-line="' + idx + '"]');
        var done = idx < currentStep;
        var active = idx === currentStep;

        circle.className = 'wz-step-circle' + (done ? ' done' : active ? ' active' : '');
        if (done) {
          circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">check</span>';
        } else {
          circle.innerHTML = allStepDefs[idx].icon
            ? '<span class="material-symbols-outlined" style="font-size:17px;">' + allStepDefs[idx].icon + '</span>'
            : (idx + 1);
        }
        lbl.className = 'wz-step-label' + (done ? ' done' : active ? ' active' : '');
        if (line) line.className = 'wz-step-line' + (done ? ' done' : '');

        // Dots
        var dot = dotsEl.querySelector('[data-dot="' + idx + '"]');
        if (dot) dot.className = 'wz-step-dot' + (done ? ' done' : active ? ' active' : '');
      });

      // Progress
      progressBar.style.width = (((currentStep + 1) / totalUISteps) * 100) + '%';

      // Buttons
      btnBack.style.display = currentStep === 0 ? 'none' : '';
      var isLastUI = currentStep === totalUISteps - 1;
      if (isLastUI) {
        btnNext.className = 'btn btn-success';
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">check_circle</span> Hoàn tất & Lưu';
      } else if (currentStep === 0) {
        btnNext.className = 'btn btn-primary';
        btnNext.innerHTML = 'Tiếp theo <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_forward</span>';
        if (!selectedBranch) {
          btnNext.disabled = true;
          btnNext.title = 'Vui lòng chọn chi nhánh';
        } else {
          btnNext.disabled = false;
          btnNext.title = '';
        }
      } else {
        btnNext.className = 'btn btn-primary';
        btnNext.innerHTML = 'Tiếp theo <span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;">arrow_forward</span>';
        btnNext.disabled = false;
      }
    }

    // ── Render step 0: Branch picker ─────────────────────────────────
    function _renderBranchStep() {
      body.innerHTML = '';
      var content = document.createElement('div');
      content.className = 'wz-step-content';

      // Header
      var sh = document.createElement('div');
      sh.className = 'wz-step-header';
      var shIcon = document.createElement('div');
      shIcon.className = 'wz-step-header-icon';
      shIcon.innerHTML = '<span class="material-symbols-outlined">location_city</span>';
      var shText = document.createElement('div');
      var shTitle = document.createElement('div');
      shTitle.className = 'wz-step-title';
      shTitle.textContent = 'Chọn Chi Nhánh';
      var shDesc = document.createElement('div');
      shDesc.className = 'wz-step-desc';
      shDesc.textContent = 'Chọn chi nhánh để tạo mã nhân viên tự động';
      shText.appendChild(shTitle);
      shText.appendChild(shDesc);
      sh.appendChild(shIcon);
      sh.appendChild(shText);
      content.appendChild(sh);

      if (!userBranches || userBranches.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'wz-no-branch';
        empty.innerHTML = '<span class="material-symbols-outlined">store_mall_directory</span>Tài khoản của bạn chưa được gán chi nhánh.<br>Vui lòng liên hệ quản trị viên.';
        content.appendChild(empty);
        body.appendChild(content);
        return;
      }

      // Branch cards
      var grid = document.createElement('div');
      grid.className = 'wz-branch-grid';

      userBranches.forEach(function (branch) {
        var card = document.createElement('div');
        card.className = 'wz-branch-card' + (selectedBranch && selectedBranch.id === branch.id ? ' selected' : '');

        var iconEl = document.createElement('div');
        iconEl.className = 'wz-branch-icon';
        iconEl.innerHTML = '<span class="material-symbols-outlined">apartment</span>';

        var nameEl = document.createElement('div');
        nameEl.className = 'wz-branch-name';
        nameEl.textContent = branch.name || branch.id;

        var codeEl = document.createElement('div');
        codeEl.className = 'wz-branch-code';
        codeEl.textContent = branch.id;

        var checkEl = document.createElement('div');
        checkEl.className = 'wz-branch-check';
        checkEl.innerHTML = '<span class="material-symbols-outlined">check</span>';

        card.appendChild(iconEl);
        card.appendChild(nameEl);
        card.appendChild(codeEl);
        card.appendChild(checkEl);

        card.addEventListener('click', function () {
          // Bỏ chọn card cũ
          grid.querySelectorAll('.wz-branch-card').forEach(function (c) { c.classList.remove('selected'); });
          card.classList.add('selected');
          selectedBranch = branch;

          // Disable nút khi đang tính mã
          btnNext.disabled = true;
          _showIDLoading();

          // Gọi SP để lấy mã NV — BranchID truyền thẳng vào SP
          _resolveNextPersonID(
            branch.id,   // VD: 'VANPHONG', 'THANHDA', 'SGCENTER'...
            apiUrl,
            currentUser,
            function (nextCode, maVietTat, err) {
              if (err || !nextCode) {
                _showIDError(branch);
                if (window.UIToast) UIToast.show('Không thể sinh mã nhân viên: ' + (err ? err.message : 'Không xác định'), 'error');
                return;
              }
              resolvedPersonID = nextCode;
              formState['PersonID'] = nextCode;
              formState['BranchID'] = branch.id;
              formState['ChiNhanh'] = branch.name || branch.id;
              formState['MaVietTat'] = maVietTat;
              _showIDResult(nextCode, branch, maVietTat);
              btnNext.disabled = false;
              btnNext.title = '';
            }
          );
        });

        grid.appendChild(card);
      });
      content.appendChild(grid);

      // PersonID display box
      var idSection = document.createElement('div');
      idSection.style.cssText = 'margin-top:20px;';
      var idLabel = document.createElement('div');
      idLabel.style.cssText = 'font-size:12px;font-weight:600;color:var(--color-text-secondary);margin-bottom:8px;display:flex;align-items:center;gap:6px;';
      idLabel.innerHTML = '<span class="material-symbols-outlined" style="font-size:15px;">badge</span>Mã nhân viên được cấp tự động';
      var idBox = document.createElement('div');
      idBox.className = 'wz-id-box';
      idBox.id = 'wz-id-box';

      if (selectedBranch && resolvedPersonID) {
        _buildIDBadge(idBox, resolvedPersonID, selectedBranch);
      } else {
        idBox.innerHTML = '<span style="font-size:13px;color:var(--color-text-secondary);opacity:0.6;">← Chọn chi nhánh để xem mã được cấp</span>';
      }

      idSection.appendChild(idLabel);
      idSection.appendChild(idBox);
      content.appendChild(idSection);

      body.appendChild(content);
    }

    function _showIDLoading() {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      box.innerHTML = '<div class="wz-id-loading"><span class="material-symbols-outlined" style="font-size:18px;animation:wz-spin 0.8s linear infinite;">progress_activity</span>Đang tính mã...</div>';
    }

    function _showIDResult(code, branch, maVietTat) {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      _buildIDBadge(box, code, branch, maVietTat);
    }

    function _showIDError(branch) {
      var box = document.getElementById('wz-id-box');
      if (!box) return;
      box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--color-danger,#ef4444);font-size:13px;"><span class="material-symbols-outlined" style="font-size:18px;">error</span>Không thể sinh mã cho chi nhánh <strong>' + (branch ? branch.name || branch.id : '') + '</strong>. Vui lòng liên hệ quản trị.</div>';
    }

    function _buildIDBadge(box, code, branch, maVietTat) {
      box.innerHTML = '';
      var badge = document.createElement('div');
      badge.className = 'wz-id-badge';
      badge.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

      var row1 = document.createElement('div');
      row1.style.cssText = 'display:flex;align-items:center;gap:10px;';
      var codeEl = document.createElement('div');
      codeEl.className = 'wz-id-value';
      codeEl.textContent = code;
      var tagEl = document.createElement('div');
      tagEl.className = 'wz-id-tag';
      tagEl.textContent = (branch && branch.name) ? branch.name : (maVietTat || code);
      row1.appendChild(codeEl);
      row1.appendChild(tagEl);

      // Thêm badge prefix nếu có maVietTat khác tên chi nhánh
      if (maVietTat && maVietTat !== code) {
        var prefixTag = document.createElement('div');
        prefixTag.style.cssText = 'font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(16,185,129,0.12);color:var(--color-success,#10b981);font-weight:600;font-family:monospace;';
        prefixTag.textContent = 'prefix: ' + maVietTat;
        row1.appendChild(prefixTag);
      }

      var hint = document.createElement('div');
      hint.className = 'wz-id-hint';
      badge.appendChild(row1);
      badge.appendChild(hint);
      box.appendChild(badge);
    }

    // ── Render field steps ───────────────────────────────────────────
    function _renderStep(uiIdx) {
      body.innerHTML = '';
      if (uiIdx === 0) {
        _renderBranchStep();
        return;
      }

      var step = steps[uiIdx - 1];
      var content = document.createElement('div');
      content.className = 'wz-step-content';

      // Step header
      var sh = document.createElement('div');
      sh.className = 'wz-step-header';
      var shIcon = document.createElement('div');
      shIcon.className = 'wz-step-header-icon';
      shIcon.innerHTML = step.icon
        ? '<span class="material-symbols-outlined">' + step.icon + '</span>'
        : '<span class="material-symbols-outlined">edit_note</span>';
      var shText = document.createElement('div');
      var shTitle = document.createElement('div');
      shTitle.className = 'wz-step-title';
      shTitle.textContent = step.label;
      var shDesc = document.createElement('div');
      shDesc.className = 'wz-step-desc';
      shDesc.textContent = step.description || '';
      shText.appendChild(shTitle);
      shText.appendChild(shDesc);
      sh.appendChild(shIcon);
      sh.appendChild(shText);
      content.appendChild(sh);

      // Hiển thị mã NV đã chọn (gợi nhắc)
      if (resolvedPersonID) {
        var idBanner = document.createElement('div');
        idBanner.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(79,70,229,0.07);border:1px solid rgba(79,70,229,0.2);border-radius:8px;margin-bottom:14px;font-size:12px;color:var(--color-text-secondary);';
        idBanner.innerHTML = '<span class="material-symbols-outlined" style="font-size:15px;color:var(--color-primary);">badge</span>Mã nhân viên: <strong style="font-family:monospace;color:var(--color-primary);font-size:13px;">' + resolvedPersonID + '</strong>';
        content.appendChild(idBanner);
      }

      // Last step → Review
      var isLastWiz = !step.fields || step.fields.length === 0;
      if (isLastWiz) {
        _renderReview(content);
      } else {
        _renderFields(content, step.fields);
      }

      body.appendChild(content);
      if (!isLastWiz) {
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
        field.readOnly = field.isReadOnlyAdd;

        // --- Custom override cho Giới Tính và Trạng Thái ---
        if (fn === 'GioiTinh') {
          field.renderRule = 'sl';
          field.dataSource = 'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác';
        }
        if (fn === 'PersonStatus') {
          field.renderRule = 'sl';
          field.dataSource = 'API_ComboPersonStatus';
        }
        // ----------------------------------------------------

        var inputEl;
        if (field.renderRule === 'sw' || field.renderRule === 'boolean') {
          inputEl = UIInput.createSwitch(field);
        } else if (field.renderRule === 'dt' || field.renderRule === 'date' || field.renderRule === 'd') {
          inputEl = UIInput.createDate(field);
        } else if (field.renderRule === 'tm' || field.renderRule === 'time') {
          inputEl = UIInput.createTime(field);
        } else if (field.renderRule === 'sl' || field.renderRule === 'select') {
          inputEl = _buildSelectField(field);
        } else if (field.renderRule === 'ta' || field.renderRule === 'textarea') {
          inputEl = UIInput.createTextarea ? UIInput.createTextarea(field) : UIInput.createText(field);
        } else {
          inputEl = UIInput.createText(field);
        }

        // Quyết định span: textarea/địa chỉ/mô tả → full width
        var span = String(field.position || 'body');
        var isFullWidth = span === 'body' || span === '12' ||
          fn.toLowerCase().includes('diachi') ||
          fn.toLowerCase().includes('ghichu') ||
          fn.toLowerCase().includes('mota') ||
          field.renderRule === 'ta' ||
          field.renderRule === 'textarea';

        var colClass = isFullWidth ? 'df-col-12' : 'df-col-6';

        var wrapper = document.createElement('div');
        wrapper.className = colClass;
        wrapper.style.animation = 'wz-fadein 0.16s ease';
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

    // ── Review step ──────────────────────────────────────────────────
    function _renderReview(container) {
      var wrap = document.createElement('div');
      wrap.className = 'wz-review-wrap';

      // Section 1: Thông tin chi nhánh & mã NV (luôn hiển thị)
      var secBranch = document.createElement('div');
      secBranch.className = 'wz-review-section';
      var secBranchTitle = document.createElement('div');
      secBranchTitle.className = 'wz-review-section-title';
      secBranchTitle.innerHTML = '<span class="material-symbols-outlined">location_city</span>Chi Nhánh & Mã Nhân Viên';
      secBranch.appendChild(secBranchTitle);
      var branchGrid = document.createElement('div');
      branchGrid.className = 'wz-review-grid';

      var cellBranch = document.createElement('div');
      cellBranch.className = 'wz-review-cell';
      cellBranch.innerHTML = '<div class="wz-review-label">Chi nhánh</div><div class="wz-review-value">' + (selectedBranch ? (selectedBranch.name || selectedBranch.id) : '—') + '</div>';

      var cellID = document.createElement('div');
      cellID.className = 'wz-review-cell';
      cellID.innerHTML = '<div class="wz-review-label">Mã nhân viên</div><div class="wz-review-value mono">' + (resolvedPersonID || '—') + '</div>';

      branchGrid.appendChild(cellBranch);
      branchGrid.appendChild(cellID);
      secBranch.appendChild(branchGrid);
      wrap.appendChild(secBranch);

      // Section 2+: Dữ liệu từ các step
      steps.forEach(function (step) {
        if (!step.fields || !step.fields.length) return;
        var hasAny = false;
        var cells = [];

        step.fields.forEach(function (fn) {
          var schema = formSchema.find(function (f) { return f.name === fn; });
          if (!schema) return;
          var val = formState[fn] || '';
          if (!val) return;
          hasAny = true;
          var cell = document.createElement('div');
          cell.className = 'wz-review-cell';
          var isLong = val.length > 40;
          if (isLong) cell.classList.add('full');
          cell.innerHTML = '<div class="wz-review-label">' + (schema.label || fn) + '</div><div class="wz-review-value">' + val + '</div>';
          cells.push(cell);
        });

        if (!hasAny) return;

        var sec = document.createElement('div');
        sec.className = 'wz-review-section';
        var secTitle = document.createElement('div');
        secTitle.className = 'wz-review-section-title';
        secTitle.innerHTML = '<span class="material-symbols-outlined">' + (step.icon || 'info') + '</span>' + step.label;
        sec.appendChild(secTitle);
        var secGrid = document.createElement('div');
        secGrid.className = 'wz-review-grid';
        cells.forEach(function (c) { secGrid.appendChild(c); });
        sec.appendChild(secGrid);
        wrap.appendChild(sec);
      });

      if (wrap.children.length === 1) {
        // Chỉ có section chi nhánh, chưa có data field
        var emptyRow = document.createElement('div');
        emptyRow.style.cssText = 'text-align:center;padding:16px;color:var(--color-text-secondary);font-size:13px;';
        emptyRow.textContent = 'Chưa có dữ liệu field nào được nhập.';
        wrap.appendChild(emptyRow);
      }

      container.appendChild(wrap);

      // Tip
      var tip = document.createElement('div');
      tip.style.cssText = 'margin-top:14px; font-size:12px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px; padding:10px 12px; background:rgba(79,70,229,0.06); border-radius:8px;';
      tip.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:var(--color-info,var(--color-primary));">info</span> Kiểm tra kỹ trước khi lưu. Bấm <strong>"Quay lại"</strong> nếu cần chỉnh sửa.';
      container.appendChild(tip);
    }

    // ── Navigation ───────────────────────────────────────────────────
    function _goBack() {
      if (currentStep > 0) {
        _collect();
        currentStep--;
        _renderStep(currentStep);
        _updateUI();
      }
    }

    function _goNext() {
      _collect();
      var missing = _validate();
      if (missing.length) {
        if (window.UIToast) UIToast.show('Vui lòng điền: ' + missing.join(', '), 'warning');
        else alert('Vui lòng điền: ' + missing.join(', '));
        return;
      }

      if (currentStep < totalUISteps - 1) {
        currentStep++;
        _renderStep(currentStep);
        _updateUI();
        // Scroll body về đầu
        body.scrollTop = 0;
      } else {
        // ── Lưu ──
        btnNext.disabled = true;
        btnNext.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;animation:wz-spin 0.8s linear infinite;">progress_activity</span> Đang lưu...';

        // Build fakeBody với tất cả formState
        var fakeBody = document.createElement('div');
        Object.keys(formState).forEach(function (key) {
          var inp = document.createElement('input');
          inp.type = 'hidden';
          inp.name = key;
          inp.value = formState[key] || '';
          fakeBody.appendChild(inp);
        });

        var fakeModal = {
          closeNow: function () { _close(); },
          close: function () { _close(); }
        };
        saveData(false, {}, fakeModal, fakeBody, btnNext);
      }
    }

    // ── Click outside to close ────────────────────────────────────────
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _close();
    });

    // ── Keyboard shortcuts ────────────────────────────────────────────
    function _onKeydown(e) {
      if (e.key === 'Escape') {
        _close();
        document.removeEventListener('keydown', _onKeydown);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        var active = document.activeElement;
        var isTextArea = active && active.tagName === 'TEXTAREA';
        if (!isTextArea) { e.preventDefault(); _goNext(); }
      }
    }
    document.addEventListener('keydown', _onKeydown);

    // ── Khởi tạo ──────────────────────────────────────────────────────
    document.getElementById('modal-container').appendChild(overlay);
    history.pushState({ wizardOpen: true }, null, window.location.href);
    _renderStep(0);
    _updateUI();

    return { close: _close };
  }

  // --- HYBRID MODE LOGIC ---
  function open(config) {
    if (config.isEdit) {
      return _openEditLayout(config);
    }
    return _openAddStepper(config);
  }

  function _openEditLayout(config) {
    var _cssInjectedEdit = false;
    function _injectEditCSS() {
      if (_cssInjectedEdit) return;
      _cssInjectedEdit = true;
      var style = document.createElement('style');
      style.id = 'wizard-form-edit-css';
      style.textContent = [
        '@keyframes wz-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }',
        '.wz-overlay-edit { position:fixed; inset:0; z-index:10001; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px; animation:wz-fadein 0.2s ease; backdrop-filter:blur(2px); }',
        '.wz-dialog-edit { background:var(--color-surface); border-radius:var(--radius-lg,16px); box-shadow:0 32px 80px rgba(0,0,0,0.28); width:min(1200px,98vw); height:95vh; display:flex; flex-direction:column; overflow:hidden; animation:wz-fadein 0.28s cubic-bezier(0.16,1,0.3,1); }',
        '.wz-header-edit { padding:16px 24px; border-bottom:1px solid var(--color-border); flex-shrink:0; background:var(--color-surface); display:flex; align-items:center; justify-content:space-between; }',
        '.wz-title-edit { margin:0; font-size:18px; font-weight:700; color:var(--color-text); display:flex; align-items:center; gap:8px; }',
        '.wz-close-edit { background:none; border:none; cursor:pointer; color:var(--color-text-secondary); padding:6px; border-radius:8px; transition:0.15s; display:flex; }',
        '.wz-close-edit:hover { background:var(--color-background); color:var(--color-danger); }',
        '.wz-body-edit { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f1f5f9; }',
        '.wz-top-panel { padding:16px 24px; background:var(--color-surface); border-bottom:1px solid var(--color-border); flex-shrink:0; }',
        '.wz-fields-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px 16px; }',
        '.wz-fields-grid.two-cols { grid-template-columns:1fr 1fr; }',
        '.wz-fields-grid .df-col-12 { grid-column:1 / -1; }',
        '.wz-fields-grid .df-col-6 { grid-column:span 2; }',
        '.wz-fields-grid .form-group { margin-bottom: 0; }',
        '.wz-fields-grid label { font-size: 12px; margin-bottom: 4px; font-weight: 600; color: var(--color-text-secondary); }',
        '.wz-tabs-container { display:flex; flex-direction:column; flex:1; overflow:hidden; padding:16px 24px; }',
        '.wz-tab-bar { display:flex; gap:4px; border-bottom:2px solid var(--color-border); overflow-x:auto; flex-shrink:0; margin-bottom: 16px; scrollbar-width: none; }',
        '.wz-tab-btn { background:transparent; border:none; padding:10px 16px; font-size:14px; font-weight:600; color:var(--color-text-secondary); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:0.2s; white-space:nowrap; display:flex; align-items:center; gap:6px; }',
        '.wz-tab-btn:hover { color:var(--color-text); }',
        '.wz-tab-btn.active { color:var(--color-primary); border-bottom-color:var(--color-primary); background:rgba(67,56,202,0.04); border-radius:6px 6px 0 0; }',
        '.wz-tab-content { flex:1; overflow-y:auto; background:var(--color-surface); border:1px solid var(--color-border); border-radius:8px; padding:20px; }',
        '.wz-footer { padding:16px 24px; border-top:1px solid var(--color-border); background:var(--color-surface); display:flex; justify-content:flex-end; gap:12px; flex-shrink:0; }',
        '.photo-box { display:flex; flex-direction:column; align-items:center; gap:12px; padding:16px; border:1px solid var(--color-border); border-radius:8px; width:220px; flex-shrink:0; background:#fff; }',
        '.photo-frame { width:100%; height:240px; border:1px dashed var(--color-border-strong); border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f8fafc; }',
        '.photo-frame img { width:100%; height:100%; object-fit:cover; }',
        '.resume-layout { display:flex; gap:24px; align-items:flex-start; }',
        '.resume-fields { flex:1; }'
      ].join('\n');
      document.head.appendChild(style);
    }
    
    _injectEditCSS();
    
    var steps = config.steps || [];
    var formSchema = config.formSchema || [];
    var rowData = config.rowData || {};
    var saveData = config.saveData;
    var moduleConfig = config.moduleConfig || {};
    var currentUser = config.currentUser || '';
    var userBranches = config.userBranches || [];

    var formState = Object.assign({}, rowData);

    var uiTabs = [];
    steps.forEach(function(s, idx) {
        if (s.fields && s.fields.length > 0) {
            uiTabs.push({
                id: 'step_' + idx,
                label: s.label,
                icon: s.icon || 'folder',
                fields: s.fields
            });
        }
    });

    var overlay = document.createElement('div');
    overlay.className = 'wz-overlay-edit';

    var dialog = document.createElement('div');
    dialog.className = 'wz-dialog-edit';
    overlay.appendChild(dialog);

    // --- Header ---
    var header = document.createElement('div');
    header.className = 'wz-header-edit';
    var title = document.createElement('h3');
    title.className = 'wz-title-edit';
    title.innerHTML = '<span class="material-symbols-outlined" style="color:var(--color-primary)">manage_accounts</span> ' + 
                      'Sửa hồ sơ: ' + (formState.PersonName || formState.PersonID || '');
    
    var btnClose = document.createElement('button');
    btnClose.className = 'wz-close-edit';
    btnClose.innerHTML = '<span class="material-symbols-outlined">close</span>';
    btnClose.onclick = function() {
        overlay.style.opacity = '0';
        setTimeout(function(){ overlay.remove(); }, 200);
    };
    header.appendChild(title);
    header.appendChild(btnClose);
    dialog.appendChild(header);

    // --- Body ---
    var body = document.createElement('div');
    body.className = 'wz-body-edit';
    dialog.appendChild(body);

    // Tabs Container
    var tabsContainer = document.createElement('div');
    tabsContainer.className = 'wz-tabs-container';
    
    var tabBar = document.createElement('div');
    tabBar.className = 'wz-tab-bar';
    
    var tabContent = document.createElement('div');
    tabContent.className = 'wz-tab-content';
    
    tabsContainer.appendChild(tabBar);
    tabsContainer.appendChild(tabContent);
    body.appendChild(tabsContainer);

    var activeTab = uiTabs.length > 0 ? uiTabs[0].id : null;

    function _renderTabs() {
        tabBar.innerHTML = '';
        uiTabs.forEach(function(tab) {
            var btn = document.createElement('button');
            btn.className = 'wz-tab-btn' + (activeTab === tab.id ? ' active' : '');
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">' + tab.icon + '</span> ' + tab.label;
            btn.onclick = function() {
                _collectData();
                activeTab = tab.id;
                _renderTabs();
                _renderTabContent();
            };
            tabBar.appendChild(btn);
        });
    }

    function _renderTabContent() {
        tabContent.innerHTML = '';
        if (!activeTab) return;
        var tab = uiTabs.find(function(t) { return t.id === activeTab; });
        if (!tab) return;

        var wrapper = document.createElement('div');
        
        if (tab.label === 'Cá nhân') {
            wrapper.className = 'resume-layout';

            var fieldsArea = document.createElement('div');
            fieldsArea.className = 'resume-fields wz-fields-grid two-cols';
            _renderFields(tab.fields, fieldsArea, formSchema, formState);

            var photoArea = document.createElement('div');
            photoArea.className = 'photo-box';
            
            var frame = document.createElement('div');
            frame.className = 'photo-frame';
            var img = document.createElement('img');
            img.src = (formState.HinhAnh && formState.HinhAnh.trim() !== '') ? formState.HinhAnh : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            img.onerror = function() { this.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; };
            frame.appendChild(img);
            
            var photoInput = document.createElement('input');
            photoInput.type = 'hidden';
            photoInput.name = 'HinhAnh';
            photoInput.value = formState.HinhAnh || '';

            var btnUpload = document.createElement('button');
            btnUpload.className = 'btn btn-outline btn-sm w-100';
            btnUpload.innerHTML = '<span class="material-symbols-outlined">upload</span> Cập nhật ảnh';
            btnUpload.onclick = function() {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = function(e) {
                    var file = e.target.files[0];
                    if (file) {
                        var reader = new FileReader();
                        reader.onload = function(re) {
                            img.src = re.target.result;
                            photoInput.value = re.target.result; // Base64
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            };

            photoArea.appendChild(frame);
            photoArea.appendChild(btnUpload);
            photoArea.appendChild(photoInput);

            wrapper.appendChild(fieldsArea);
            wrapper.appendChild(photoArea);
        } else {
            wrapper.className = 'wz-fields-grid two-cols';
            _renderFields(tab.fields, wrapper, formSchema, formState);
        }
        
        tabContent.appendChild(wrapper);
    }

    _renderTabs();
    _renderTabContent();

    // Footer
    var footer = document.createElement('div');
    footer.className = 'wz-footer';
    
    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.innerText = 'Hủy bỏ';
    btnCancel.onclick = btnClose.onclick;

    var btnSave = document.createElement('button');
    btnSave.className = 'btn btn-primary';
    btnSave.innerHTML = '<span class="material-symbols-outlined">save</span> Lưu Thông Tin';
    btnSave.onclick = function() {
        _collectData();
        if (saveData) {
            // Build fakeBody with all formState data so _saveData can query it
            var fakeBody = document.createElement('div');
            Object.keys(formState).forEach(function (key) {
                var inp = document.createElement('input');
                inp.type = 'hidden';
                inp.name = key;
                inp.value = formState[key] !== null && formState[key] !== undefined ? formState[key] : '';
                fakeBody.appendChild(inp);
            });
            
            var fakeModal = {
                close: function () { btnClose.click(); }
            };
            
            // _saveData signature: isEdit, rowData, modal, body, btnSave
            saveData(true, rowData, fakeModal, fakeBody, btnSave);
        }
    };

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);
    dialog.appendChild(footer);
    document.body.appendChild(overlay);

    function _collectData() {
        dialog.querySelectorAll('input, select, textarea').forEach(function (el) {
            if (el.name && el.type !== 'button' && el.type !== 'file') {
                formState[el.name] = el.value;
            }
        });
    }

    function _renderFields(fieldNames, container, schema, state) {
        fieldNames.forEach(function (fn) {
            var field = schema.find(function (f) { return f.name === fn; });
            if (!field) return;

            var fCopy = Object.assign({}, field);
            fCopy.value = state[fn] || '';
            fCopy.readOnly = fCopy.isReadOnlyEdit;

            if (fn === 'GioiTinh') { fCopy.renderRule = 'sl'; fCopy.dataSource = 'STATIC:Nam|Nam,Nữ|Nữ,Khác|Khác'; }
            if (fn === 'PersonStatus') { fCopy.renderRule = 'sl'; fCopy.dataSource = 'API_ComboPersonStatus'; }

            var inputEl;
            if (fCopy.renderRule === 'sw' || fCopy.renderRule === 'boolean') {
                inputEl = UIInput.createSwitch(fCopy);
            } else if (fCopy.renderRule === 'dt' || fCopy.renderRule === 'date' || fCopy.renderRule === 'd') {
                inputEl = UIInput.createDate(fCopy);
            } else if (fCopy.renderRule === 'tm' || fCopy.renderRule === 'time') {
                inputEl = UIInput.createTime(fCopy);
            } else if (fCopy.renderRule === 'sl' || fCopy.renderRule === 'select') {
                inputEl = _buildSelectFieldEdit(fCopy);
            } else if (fCopy.renderRule === 'ta' || fCopy.renderRule === 'textarea') {
                inputEl = UIInput.createTextarea ? UIInput.createTextarea(fCopy) : UIInput.createText(fCopy);
            } else {
                inputEl = UIInput.createText(fCopy);
            }

            var isFullWidth = String(fCopy.position) === 'body' || String(fCopy.position) === '12' ||
                              fn.toLowerCase().includes('diachi') || fn.toLowerCase().includes('ghichu') ||
                              fn.toLowerCase().includes('mota') || fCopy.renderRule === 'ta' || fCopy.renderRule === 'textarea';

            var colClass = isFullWidth ? 'df-col-12' : 'df-col-6';
            if (container.classList.contains('two-cols') && !isFullWidth) {
                colClass = '';
            }

            var wrapper = document.createElement('div');
            if (colClass) wrapper.className = colClass;
            wrapper.appendChild(inputEl);
            container.appendChild(wrapper);
        });
    }

    function _buildSelectFieldEdit(field) {
        var fgw = document.createElement('div');
        fgw.className = 'form-group';
        if (field.label) {
            var lbl = document.createElement('label');
            lbl.innerText = field.label;
            if (field.required) lbl.innerHTML += ' <span style="color:var(--color-danger)">*</span>';
            fgw.appendChild(lbl);
        }
        var hiddenIn = document.createElement('input');
        hiddenIn.type = 'hidden';
        hiddenIn.name = field.name;
        hiddenIn.value = field.value || '';
        fgw.appendChild(hiddenIn);

        var ds = field.dataSource || '';
        if (field.name === 'BranchID' && userBranches && userBranches.length > 0) {
            ds = 'STATIC:' + userBranches.map(function (b) {
                return b.id + '|' + (b.name || b.id);
            }).join(',');
        }
        if (ds.toUpperCase().startsWith('STATIC:')) {
            var staticData = ds.substring(7).split(',').map(function (s) {
                var p = s.split('|'); return [p[0], p[1] || p[0]];
            });
            var opts = {
                placeholder: '-- Vui lòng chọn --',
                headers: ['Mã', 'Tên'],
                disabled: field.readOnly,
                onSearch: function (q) {
                    return Promise.resolve({
                        headers: ['Mã', 'Tên'],
                        data: q ? staticData.filter(function (r) { return r[1].toLowerCase().indexOf(q.toLowerCase()) > -1; }) : staticData,
                        colFilterIndex: 1
                    });
                },
                onSelect: function (row) {
                    hiddenIn.value = row[0];
                    formState[field.name] = row[0];
                    hiddenIn.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            var combo = UIControls.createDataComboBox(opts);
            var matched = staticData.find(function (r) { return r[0] == field.value; });
            var dIn = combo.querySelector('input.ui-input');
            if (matched && dIn) dIn.value = matched[1];
            fgw.appendChild(combo);
        } else if (ds) {
            var endpointRaw = ds.indexOf('|') > -1 ? ds.split('|')[0] : ds;
            var baseUrl = (typeof API_CONFIG !== 'undefined' ? API_CONFIG.BASE_URL : '');
            var finalUrl = baseUrl + '/api/API_Gateway_Router';
            var fetchPayload = { List: endpointRaw, FormName: endpointRaw, Func: 'View', UserName: currentUser };
            
            var searchApiCall = function (q) {
                var pl = Object.assign({}, fetchPayload);
                if (q) pl.Keyword = q;
                return ApiClient.post(finalUrl, pl).then(function (res) {
                    var list = res.list || res.records || [];
                    if (!list.length) return { headers: ['Mã', 'Tên'], data: [], colFilterIndex: 1 };
                    var keys = Object.keys(list[0]);
                    
                    var comboData = [];
                    list.forEach(function (d) {
                        var rowData = [];
                        keys.forEach(function (k) { rowData.push(d[k] !== null && d[k] !== undefined ? d[k] : ''); });
                        comboData.push(rowData);
                    });
                    
                    var labelRegex = /name|tên|ten|label|desc|title/i;
                    var displayKey = keys.find(function (k) { return labelRegex.test(k); });
                    var colFilterIndex = displayKey ? keys.indexOf(displayKey) : (keys.length > 1 ? 1 : 0);
                    
                    return {
                        headers: keys,
                        data: comboData,
                        colFilterIndex: colFilterIndex
                    };
                });
            };
            
            var lazyCombo = UIControls.createDataComboBox({
                placeholder: '-- Vui lòng chọn --',
                headers: ['Mã', 'Tên'],
                disabled: field.readOnly,
                onSearch: searchApiCall,
                onSelect: function (row) {
                    hiddenIn.value = row[0];
                    formState[field.name] = row[0];
                    hiddenIn.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            if (field.value) {
                searchApiCall('').then(function (res) {
                    var displayInput = lazyCombo.querySelector('input.ui-input');
                    var matched = res.data.find(function (r) { return String(r[0]) === String(field.value); });
                    if (matched && displayInput) {
                        displayInput.value = matched[res.colFilterIndex !== undefined ? res.colFilterIndex : 1];
                    }
                }).catch(function (err) {
                    console.error('[WizardForm] DataComboBox initial fetch error:', err);
                    var displayInput = lazyCombo.querySelector('input.ui-input');
                    if (displayInput) displayInput.placeholder = 'Lỗi tải dữ liệu';
                });
            }
            fgw.appendChild(lazyCombo);
        }
        return fgw;
    }
  }

  return { open: open };
})();
