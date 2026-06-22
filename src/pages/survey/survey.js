/**
 * Module Khảo Sát Thông Tin Khách Hàng Sau Tiệc (Survey Page)
 * Route: #/survey | Module: HopDong
 * HTML Template: src/pages/survey/survey.html
 */
var SurveyPage = (function () {

  function render($container) {
    fetch('./src/pages/survey/survey.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        $container.innerHTML = html;
        _injectHeaderActions();
        _bindEvents();
        _initStarRating();
      });
  }

  function _injectHeaderActions() {
    var globalActions = document.getElementById('global-page-actions');
    if (!globalActions) return;

    globalActions.innerHTML = '';
    if (typeof UIActionToolbar !== 'undefined') {
      globalActions.appendChild(UIActionToolbar.create({
        onAdd: _openPanel,
        onEdit: false, onDelete: false, onFilter: false, onPrint: false, onClose: false
      }));
    }
  }

  // ── Mở / Đóng Panel ──────────────────────────────────────────────────
  function _openPanel() {
    var overlay = document.getElementById('survey-form-overlay');
    var panel   = document.getElementById('survey-form-panel');
    if (overlay) overlay.classList.add('active');
    if (panel)   panel.style.right = '0';
  }

  function _closePanel() {
    var overlay = document.getElementById('survey-form-overlay');
    var panel   = document.getElementById('survey-form-panel');
    if (overlay) overlay.classList.remove('active');
    if (panel)   panel.style.right = '-840px';
  }

  // ── Star Rating Logic ─────────────────────────────────────────────────
  function _initStarRating() {
    var allStarGroups = document.querySelectorAll('[id^="rating-"]');

    allStarGroups.forEach(function (group) {
      var btns = group.querySelectorAll('.survey-star-btn');

      btns.forEach(function (btn) {
        btn.addEventListener('mouseenter', function () {
          var val = parseInt(btn.getAttribute('data-val'));
          btns.forEach(function (b, i) {
            b.textContent = (i < val) ? '★' : '☆';
            b.style.color = (i < val) ? '#f59e0b' : 'var(--color-border-strong)';
          });
        });

        btn.addEventListener('mouseleave', function () {
          _refreshStars(group, btns);
        });

        btn.addEventListener('click', function () {
          var val = parseInt(btn.getAttribute('data-val'));
          btns.forEach(function (b) { b.classList.remove('active'); });
          for (var i = 0; i < val; i++) { btns[i].classList.add('active'); }
          btns.forEach(function (b) { b.setAttribute('data-selected', ''); });
          group.setAttribute('data-rating', val);
          _refreshStars(group, btns);
        });
      });
    });
  }

  function _refreshStars(group, btns) {
    var selected = parseInt(group.getAttribute('data-rating')) || 0;
    btns.forEach(function (b, i) {
      if (i < selected) {
        b.textContent = '★';
        b.style.color = '#f59e0b';
      } else {
        b.textContent = '☆';
        b.style.color = 'var(--color-border-strong)';
      }
    });
  }

  // ── Bind Events ───────────────────────────────────────────────────────
  function _bindEvents() {
    var overlay      = document.getElementById('survey-form-overlay');
    // Truy xuất nút thêm từ Global Header
    var btnAdd       = document.getElementById('btn-add-survey');
    var btnClose     = document.getElementById('btn-close-survey-form');
    var btnCancel    = document.getElementById('btn-cancel-survey-form');
    var btnSave      = document.getElementById('btn-save-survey');
    var btnsEdit     = document.querySelectorAll('.btn-edit-survey');
    var searchInp    = document.getElementById('survey-search');
    var filterRating = document.getElementById('survey-filter-rating');

    if (btnAdd)    btnAdd.addEventListener('click', _openPanel);
    if (btnClose)  btnClose.addEventListener('click', _closePanel);
    if (btnCancel) btnCancel.addEventListener('click', _closePanel);
    if (overlay)   overlay.addEventListener('click', _closePanel);

    btnsEdit.forEach(function (btn) {
      btn.addEventListener('click', _openPanel);
    });

    // Save handler (stub — kết nối API sau)
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        var overall = document.getElementById('survey-inp-overall');
        if (!overall || !overall.value) {
          UIToast.show('Vui lòng chọn mức độ hài lòng chung!', 'warning');
          return;
        }
        // Chờ kết nối API_WA_LuuKhaoSat
        _closePanel();
      });
    }

    // Search filter (client-side)
    if (searchInp) {
      searchInp.addEventListener('input', function () {
        _filterTable(searchInp.value, filterRating ? filterRating.value : '');
      });
    }
    if (filterRating) {
      filterRating.addEventListener('change', function () {
        _filterTable(searchInp ? searchInp.value : '', filterRating.value);
      });
    }
  }

  function _filterTable(keyword, rating) {
    var rows = document.querySelectorAll('#survey-table-body tr');
    rows.forEach(function (row) {
      var text = row.textContent.toLowerCase();
      var matchKw = !keyword || text.indexOf(keyword.toLowerCase()) > -1;
      var matchRt = !rating; // Rating filter cần logic so sánh nâng cao — để stub
      row.style.display = (matchKw && matchRt) ? '' : 'none';
    });
  }

  return { render: render };
})();
