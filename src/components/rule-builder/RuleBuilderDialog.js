(function (global) {
  'use strict';

  var RuleBuilderDialog = {
    open: function (options) {
      // options = { currentRule, targetFormName, onSave }
      var currentRule = options.currentRule || '';
      var targetFormName = options.targetFormName || '';
      var onSave = options.onSave;

      // Body container
      var body = document.createElement('div');
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.gap = '15px';

      // Khung nhập FormName (Hiển thị nếu hệ thống không tự lấy được form đích)
      var formNameContainer = document.createElement('div');
      formNameContainer.style.display = 'flex';
      formNameContainer.style.gap = '10px';
      formNameContainer.style.alignItems = 'center';
      
      var lblForm = document.createElement('label');
      lblForm.innerText = 'Lấy danh sách cột từ Form:';
      lblForm.style.fontWeight = '500';
      lblForm.style.whiteSpace = 'nowrap';
      
      var txtFormName = document.createElement('input');
      txtFormName.className = 'ui-input';
      txtFormName.placeholder = 'Ví dụ: WA_PersonFullFrm';
      txtFormName.value = targetFormName;
      txtFormName.style.flex = '1';
      
      var btnLoadFieldsWrapper = document.createElement('div');
      btnLoadFieldsWrapper.innerHTML = UIButton.createHTML({ text: 'Tải Cột', type: 'secondary', icon: 'sync' });
      var btnLoadFields = btnLoadFieldsWrapper.firstElementChild;

      formNameContainer.appendChild(lblForm);
      formNameContainer.appendChild(txtFormName);
      formNameContainer.appendChild(btnLoadFields);
      body.appendChild(formNameContainer);

      var conditionsList = document.createElement('div');
      conditionsList.style.display = 'flex';
      conditionsList.style.flexDirection = 'column';
      conditionsList.style.gap = '10px';
      body.appendChild(conditionsList);

      var fields = []; // Tên các cột của form đích

      var fetchFields = function(formName) {
        if (!formName) return;
        if (typeof ApiClient !== 'undefined') {
          btnLoadFields.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang tải...';
          ApiClient.post('/api/API_DanhSachTruongGiaoDien', { FormName: formName, Username: 'admin', Limit: 1000 })
            .then(function(res) {
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              fields = res.list || res.records || res.data || res || [];
              if (Array.isArray(fields) && fields.length > 0) {
                var allSelects = conditionsList.querySelectorAll('select.field-select');
                allSelects.forEach(function(sel) { populateFieldSelect(sel, fields); });
                txtFormName.style.borderColor = 'var(--color-success)';
              } else {
                txtFormName.style.borderColor = 'var(--color-danger)';
                Alert.warning('Lỗi', 'Không tìm thấy cột nào cho form: ' + formName);
              }
            }).catch(function(e) { 
              btnLoadFields.innerHTML = '<span class="material-symbols-outlined">sync</span> Tải Cột';
              console.error('Lỗi load cột', e); 
            });
        }
      };

      btnLoadFields.onclick = function() { fetchFields(txtFormName.value.trim()); };

      // Phân tích cú pháp rule hiện tại
      var parseRule = function(ruleStr) {
        if (!ruleStr) return [];
        var isOr = ruleStr.includes('|');
        var parts = ruleStr.split(isOr ? '|' : '&');
        return parts.map(function(p) {
          var operator = p.includes('!=') ? '!=' : '=';
          var kv = p.split(operator);
          return { field: kv[0], operator: operator, value: kv[1] || '' };
        }).filter(function(r) { return r.field !== ''; });
      };

      var rules = parseRule(currentRule);
      if (rules.length === 0) rules.push({ field: '', operator: '=', value: '' });

      var renderRow = function(r) {
        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';
        row.style.background = 'var(--color-surface)';
        row.style.padding = '12px';
        row.style.borderRadius = '8px';
        row.style.border = '1px solid var(--color-border)';

        // Field Select
        var fieldSelect = document.createElement('select');
        fieldSelect.className = 'ui-input field-select';
        fieldSelect.style.flex = '5';
        fieldSelect.innerHTML = '<option value="' + r.field + '">' + (r.field || '-- Chọn cột --') + '</option>';
        fieldSelect.dataset.val = r.field;

        // Operator
        var opSelect = document.createElement('select');
        opSelect.className = 'ui-input';
        opSelect.style.flex = '3';
        opSelect.innerHTML = '<option value="=" ' + (r.operator === '=' ? 'selected' : '') + '>Bằng (=)</option>' +
                             '<option value="!=" ' + (r.operator === '!=' ? 'selected' : '') + '>Khác (!=)</option>';

        // Value
        var valInput = document.createElement('input');
        valInput.className = 'ui-input';
        valInput.style.flex = '4';
        valInput.type = 'text';
        valInput.value = r.value;
        valInput.placeholder = 'Giá trị...';

        // Delete Btn
        var delBtnWrapper = document.createElement('div');
        delBtnWrapper.innerHTML = UIButton.createHTML({ text: '', type: 'danger', icon: 'delete', className: 'btn-icon-only' });
        var delBtn = delBtnWrapper.firstElementChild;
        delBtn.onclick = function() { conditionsList.removeChild(row); };

        row.appendChild(fieldSelect);
        row.appendChild(opSelect);
        row.appendChild(valInput);
        row.appendChild(delBtn);

        conditionsList.appendChild(row);
        return fieldSelect;
      };

      rules.forEach(function(r) { renderRow(r); });

      var addBtnWrapper = document.createElement('div');
      addBtnWrapper.innerHTML = UIButton.createHTML({ text: 'Thêm điều kiện', type: 'secondary', icon: 'add' });
      var addBtn = addBtnWrapper.firstElementChild;
      addBtn.style.width = '100%';
      addBtn.onclick = function() {
        var fs = renderRow({ field: '', operator: '=', value: '' });
        populateFieldSelect(fs, fields);
      };
      body.appendChild(addBtn);

      var populateFieldSelect = function(selectEl, fieldData) {
        selectEl.innerHTML = '<option value="">-- Chọn cột --</option>';
        fieldData.forEach(function(f) {
          var selected = (selectEl.dataset.val === f.FieldName) ? 'selected' : '';
          selectEl.innerHTML += '<option value="' + f.FieldName + '" ' + selected + '>' + f.FieldName + ' (' + f.CaptionVN + ')</option>';
        });
      };

      // Tự động load nếu có sẵn tên form
      if (targetFormName) {
         fetchFields(targetFormName);
      }

      // Footer
      var footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.alignItems = 'center';
      footer.style.width = '100%';

      var logicSelectWrapper = document.createElement('div');
      logicSelectWrapper.style.display = 'flex';
      logicSelectWrapper.style.alignItems = 'center';
      logicSelectWrapper.style.gap = '10px';
      logicSelectWrapper.innerHTML = '<span style="font-weight: 500;">Nối bằng:</span>';
      
      var logicSelect = document.createElement('select');
      logicSelect.className = 'ui-input';
      logicSelect.style.width = '140px';
      logicSelect.innerHTML = '<option value="&">VÀ (AND)</option><option value="|">HOẶC (OR)</option>';
      if (currentRule.includes('|')) logicSelect.value = '|';
      logicSelectWrapper.appendChild(logicSelect);
      
      var actionGroup = document.createElement('div');
      actionGroup.style.display = 'flex';
      actionGroup.style.gap = '10px';
      actionGroup.innerHTML = 
        UIButton.createHTML({ text: 'Hủy', type: 'secondary', className: 'btn-cancel-rule' }) +
        UIButton.createHTML({ text: 'Lưu Quy Tắc', type: 'primary', icon: 'save', className: 'btn-save-rule' });

      footer.appendChild(logicSelectWrapper);
      footer.appendChild(actionGroup);

      // Mở Modal bằng UIModal
      var ruleModal = UIModal.show({
        title: '🛠 Thiết lập Quy tắc hiển thị',
        content: body,
        footer: footer,
        width: '700px'
      });

      // Gắn sự kiện cho các nút footer
      footer.querySelector('.btn-cancel-rule').onclick = function() {
        ruleModal.closeNow();
      };

      footer.querySelector('.btn-save-rule').onclick = function() {
        var finalRules = [];
        var rows = conditionsList.children;
        for(var i=0; i<rows.length; i++) {
          var fld = rows[i].children[0].value;
          var op = rows[i].children[1].value;
          var val = rows[i].children[2].value;
          if (fld) { // Bỏ qua nếu chưa chọn cột
            finalRules.push(fld + op + val);
          }
        }
        var joiner = logicSelect.value;
        var resultString = finalRules.join(joiner);
        
        if (onSave) onSave(resultString);
        ruleModal.closeNow();
      };
    }
  };

  global.RuleBuilderDialog = RuleBuilderDialog;
})(window);
