import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/pages/menus/menus.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update inline-new save
const oldInlineSave = `          var payload = {
            NhomNguoiDangThaoTac: MenusService.currentGroupId(),
            MenuID: id,
            OldMenuID: '',
            ParentID: parentItem.id,
            Label: label,
            EN: tr.querySelector('.inline-new-en').value.trim(),
            SubTitle: tr.querySelector('.inline-new-subtitle').value.trim(),
            FormName: tr.querySelector('.inline-new-formname').value.trim(),
            FormKey: tr.querySelector('.inline-new-formkey').value.trim(),
            URLPara: tr.querySelector('.inline-new-urlpara').value.trim(),
            Icon: tr.querySelector('.inline-new-icon').value.trim() || 'horizontal_rule',
            IsDisable: 0,
            IsEdit: 0
          };

          btnSave.disabled = true;
          btnSave.innerHTML = '...';

          MenusService.save(payload).then(function (res) {
            if (res && res.code === 0) {
              UIToast.show('Thêm mới thành công!', 'success');
              if (window.Navbar) Navbar.clearMenuCache();
              _loadMenus();
            } else {
              UIToast.show(res.msg || 'Lỗi', 'error');
              btnSave.disabled = false;
              btnSave.innerHTML = 'Lưu';
            }
          }).catch(function () {
            UIToast.show('Lỗi kết nối', 'error');
            btnSave.disabled = false;
            btnSave.innerHTML = 'Lưu';
          });`;

const newInlineSave = `          var newMenuData = {
            MenuID: id,
            OldMenuID: '',
            ParentID: parentItem.id,
            Label: label,
            EN: tr.querySelector('.inline-new-en').value.trim(),
            SubTitle: tr.querySelector('.inline-new-subtitle').value.trim(),
            FormName: formName,
            FormKey: tr.querySelector('.inline-new-formkey').value.trim(),
            URLPara: tr.querySelector('.inline-new-urlpara').value.trim(),
            Icon: tr.querySelector('.inline-new-icon').value.trim() || 'horizontal_rule',
            IsDisable: 0,
            IsEdit: 0
          };

          var definition = MenuDefinition.normalizeMenu(newMenuData);

          btnSave.disabled = true;
          btnSave.innerHTML = '...';

          MenusService.saveDefinition(definition).then(function (res) {
            if (res && res.metadataReady) {
              UIToast.show('Thêm mới thành công!', 'success');
            } else {
              UIToast.show('Thêm mới thành công! (Metadata chưa sẵn sàng)', 'warning');
            }
            if (window.Navbar && typeof Navbar.clearMenuCache === 'function') Navbar.clearMenuCache();
            _loadMenus();
          }).catch(function (err) {
            UIToast.show(err && err.message ? err.message : 'Lỗi khi lưu menu', 'error');
            btnSave.disabled = false;
            btnSave.innerHTML = 'Lưu';
          });`;

code = code.replace(oldInlineSave, newInlineSave);

// 2. Update table inline cell edit
const oldCellEdit = `          var payload = {
            NhomNguoiDangThaoTac: MenusService.currentGroupId(),
            MenuID: field === 'id' ? newVal : menu.id,
            OldMenuID: menu.id,
            ParentID: field === 'parent' ? newVal : (menu.parent || ''),
            Label: field === 'label' ? newVal : menu.label,
            EN: field === 'en' ? newVal : (menu.en || ''),
            SubTitle: field === 'subTitle' ? newVal : (menu.subTitle || ''),
            FormName: field === 'formName' ? newVal : menu.formName,
            FormKey: field === 'formKey' ? newVal : (menu.formKey || ''),
            URLPara: field === 'urlPara' ? newVal : (menu.urlPara || ''),
            Icon: field === 'icon' ? newVal : menu.icon,
            IsDisable: (menu.isDisable == 1 || menu.isDisable === '1' || menu.isDisable === true) ? 1 : 0,
            IsEdit: 1
          };

          MenusService.save(payload)
            .then(function (res) {
              if (res && res.code === 0) {
                UIToast.show('Lưu thành công', 'success');
                _loadMenus();
              } else {
                UIToast.show(res.msg || 'Lỗi lưu dữ liệu', 'error');
                td.innerHTML = originalHtml;
              }
            })
            .catch(function () {
              UIToast.show('Lỗi mạng', 'error');
              td.innerHTML = originalHtml;
            });`;

const newCellEdit = `          var patch = {};
          if (field === 'id') patch.MenuID = newVal;
          if (field === 'parent') patch.ParentID = newVal;
          if (field === 'label') patch.Label = newVal;
          if (field === 'en') patch.EN = newVal;
          if (field === 'subTitle') patch.SubTitle = newVal;
          if (field === 'formName') patch.FormName = newVal;
          if (field === 'formKey') patch.FormKey = newVal;
          if (field === 'urlPara') patch.URLPara = newVal;
          if (field === 'icon') patch.Icon = newVal;

          var definition = MenuDefinition.mergeMenu(menu, patch);

          MenusService.saveDefinition(definition)
            .then(function (res) {
              if (res && res.metadataReady) {
                UIToast.show('Lưu thành công', 'success');
              } else {
                UIToast.show('Lưu thành công (Metadata chưa sẵn sàng)', 'warning');
              }
              _loadMenus();
            })
            .catch(function (err) {
              UIToast.show(err && err.message ? err.message : 'Lỗi lưu dữ liệu', 'error');
              td.innerHTML = originalHtml;
            });`;

code = code.replace(oldCellEdit, newCellEdit);

// 3. Update _saveMenuDirect
const oldSaveDirect = `  function _saveMenuDirect(data, btn) {
    var originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = UIIcon.renderHtml('sync', 'font-size:18px; animation: rotation 2s infinite linear;') + ' Đang lưu...';

    var payload = {
      NhomNguoiDangThaoTac: MenusService.currentGroupId(),
      MenuID: data.id,
      OldMenuID: data.oldId,
      Label: data.label,
      SubTitle: data.subTitle,
      FormName: data.formName,
      Icon: data.icon,
      IsDisable: data.isDisable ? 1 : 0,
      IsEdit: 1
    };

    MenusService.save(payload)
      .then(function (res) {
        if (res && res.code === 0) {
          UIToast.show('Đã cập nhật Menu thành công!', 'success');
          if (window.Navbar) Navbar.clearMenuCache();
          _loadMenus(); // Tải lại để cập nhật label trên cây menu bên trái
        } else {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
        }
      })
      .catch(function () {
        Alert.error('Lỗi', 'Không thể kết nối máy chủ');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      });
  }`;

const newSaveDirect = `  function _saveMenuDirect(data, btn) {
    var originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = UIIcon.renderHtml('sync', 'font-size:18px; animation: rotation 2s infinite linear;') + ' Đang lưu...';

    var currentMenu = allMenus.find(function (m) { return m.id === data.oldId || m.id === data.id; }) || {};
    var definition = MenuDefinition.mergeMenu(currentMenu, data);

    MenusService.saveDefinition(definition)
      .then(function (res) {
        if (res && res.metadataReady) {
          UIToast.show('Đã cập nhật Menu thành công!', 'success');
        } else {
          UIToast.show('Đã cập nhật Menu (Metadata chưa sẵn sàng)', 'warning');
        }
        if (window.Navbar && typeof Navbar.clearMenuCache === 'function') Navbar.clearMenuCache();
        _loadMenus();
      })
      .catch(function (err) {
        Alert.error('Lỗi lưu Menu', err && err.message ? err.message : 'Lưu thất bại');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      });
  }`;

code = code.replace(oldSaveDirect, newSaveDirect);

// 4. Update modal dataset parsing & add button
const oldModalDs = `      var dsList = Array.isArray(menu.datasets) ? menu.datasets : [];
      if ((!dsList || !dsList.length) && menu.datasetsJson) {
        try {
          dsList = typeof menu.datasetsJson === 'string' ? JSON.parse(menu.datasetsJson) : menu.datasetsJson;
        } catch (e) { dsList = []; }
      }
      currentSubDatasets = Array.isArray(dsList)
        ? JSON.parse(JSON.stringify(dsList))
          .map(function (ds, index) {
            ds.label = (ds.label || '').trim();
            ds.sortOrder = parseInt(ds.sortOrder, 10) || (index + 1);
            ds._sourceIndex = index;
            return ds;
          })
          .sort(function (left, right) {
            return left.sortOrder - right.sortOrder || left._sourceIndex - right._sourceIndex;
          })
          .map(function (ds, index) {
            delete ds._sourceIndex;
            ds.sortOrder = index + 1;
            return ds;
          })
        : [];`;

const newModalDs = `      var dsList = Array.isArray(menu.datasets) ? menu.datasets : [];
      if ((!dsList || !dsList.length) && (menu.datasetsJson || menu.DatasetsJson)) {
        try {
          var rawJson = menu.datasetsJson || menu.DatasetsJson;
          dsList = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        } catch (e) { dsList = []; }
      }
      currentSubDatasets = MenuDefinition.normalizeDatasets(dsList, menu.primaryKey || menu.PrimaryKey || '').map(function (ds) {
        ds._isExisting = true;
        return ds;
      });`;

code = code.replace(oldModalDs, newModalDs);

const oldAddDs = `    var btnAddDs = $container.querySelector('#btn-add-subdataset');
    if (btnAddDs) {
      btnAddDs.onclick = function () {
        var masterPkEl = $container.querySelector('#menu-primarykey');
        var defaultMasterKey = masterPkEl ? masterPkEl.value.trim() : '';

        var num = 1;
        while (currentSubDatasets.some(function (ds) {
          return String(ds.datasetKey || '').toUpperCase() === 'DETAIL_TAB_' + num;
        })) {
          num += 1;
        }
        currentSubDatasets.push({
          datasetKey: 'DETAIL_TAB_' + num,
          label: '',
          sortOrder: currentSubDatasets.length + 1,
          tableName: '',
          primaryKey: 'UserAutoID',
          parentField: defaultMasterKey,
          childField: defaultMasterKey,
          viewProcedure: '',
          isReadOnly: false
        });
        _renderSubDatasetsUI();
      };
    }`;

const newAddDs = `    var btnAddDs = $container.querySelector('#btn-add-subdataset');
    if (btnAddDs) {
      btnAddDs.onclick = function () {
        var masterPkEl = $container.querySelector('#menu-primarykey');
        var defaultMasterKey = masterPkEl ? masterPkEl.value.trim() : '';

        var num = 1;
        while (currentSubDatasets.some(function (ds) {
          return String(ds.datasetKey || '').toUpperCase() === 'DETAIL_TAB_' + num;
        })) {
          num += 1;
        }
        currentSubDatasets.push(MenuDefinition.normalizeDataset({
          datasetKey: 'DETAIL_TAB_' + num,
          label: '',
          sortOrder: currentSubDatasets.length + 1,
          tableName: '',
          primaryKey: 'UserAutoID',
          parentField: defaultMasterKey,
          childField: defaultMasterKey,
          viewProcedure: '',
          isReadOnly: false,
          _isExisting: false
        }, currentSubDatasets.length, defaultMasterKey));
        _renderSubDatasetsUI();
      };
    }`;

code = code.replace(oldAddDs, newAddDs);

// 5. Update _renderSubDatasetsUI
const oldRenderSubDs = `  function _renderSubDatasetsUI() {
    var container = $container.querySelector('#subdatasets-list');
    if (!container) return;
    container.innerHTML = '';

    if (!currentSubDatasets.length) {
      container.innerHTML = '<div style="font-size:12px; color:var(--color-text-secondary); text-align:center; padding:12px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:6px;">Chưa có Tab con nào. Nhấn "Thêm Tab Con" để bắt đầu cấu hình.</div>';
      return;
    }

    currentSubDatasets.forEach(function (ds, idx) {
      var displayLabel = (ds.label || '').trim() || _fallbackDatasetLabel(ds.datasetKey, idx);
      var card = document.createElement('div');
      card.className = 'subdataset-card';
      card.style.cssText = 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; position:relative; box-shadow:0 1px 2px rgba(0,0,0,0.03);';
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;">
          <span style="font-weight:700; font-size:12px; color:var(--color-primary); display:flex; align-items:center; gap:6px;">
            <span class="material-symbols-outlined" style="font-size:16px;">tab</span> Tab #\${idx + 1}: <span class="subds-card-label" style="color:#2d3748;">\${displayLabel}</span>
          </span>
          <button type="button" class="btn-remove-subds" data-idx="\${idx}" title="Xóa Tab con này" style="border:none; background:transparent; color:#e53e3e; cursor:pointer; padding:2px; display:flex; align-items:center; border-radius:4px;">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-4">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Tên Tab hiển thị</label>
            <input type="text" class="ui-input subds-label" data-idx="\${idx}" value="\${ds.label || ''}" placeholder="VD: Nhân viên" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-5">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Bảng Vật Lý (TableName)</label>
            <input type="text" class="ui-input subds-table" data-idx="\${idx}" value="\${ds.tableName || ''}" placeholder="VD: HR_SapCaNhanVienTbl" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-3">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Chính</label>
            <input type="text" class="ui-input subds-pk" data-idx="\${idx}" value="\${ds.primaryKey || ''}" placeholder="VD: UserAutoID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Nối Bên Cha (ParentField)</label>
            <input type="text" class="ui-input subds-parentfield" data-idx="\${idx}" value="\${ds.parentField || ''}" placeholder="VD: MasterID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Nối Bên Con (ChildField)</label>
            <input type="text" class="ui-input subds-childfield" data-idx="\${idx}" value="\${ds.childField || ''}" placeholder="VD: MasterID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
        <div class="row g-2 align-items-center">
          <div class="col-8">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Proc / View Đọc Tab Con (ViewProcedure)</label>
            <input type="text" class="ui-input subds-viewproc" data-idx="\${idx}" value="\${ds.viewProcedure || ''}" placeholder="VD: API_CaLamViecBranch_NhanVien" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-4" style="padding-top:16px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#2d3748; cursor:pointer; margin:0; user-select:none;">
              <input type="checkbox" class="subds-readonly" data-idx="\${idx}" \${ds.isReadOnly ? 'checked' : ''} style="width:14px; height:14px; accent-color:var(--color-primary);">
              <span>Chỉ Xem (ReadOnly)</span>
            </label>
          </div>
        </div>
      \`;
      container.appendChild(card);
    });

    container.querySelectorAll('input').forEach(function (input) {
      input.oninput = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        if (!currentSubDatasets[idx]) return;
        if (this.classList.contains('subds-label')) {
          currentSubDatasets[idx].label = this.value;
          var cardTitle = this.closest('.subdataset-card').querySelector('.subds-card-label');
          if (cardTitle) {
            cardTitle.textContent = this.value.trim() || _fallbackDatasetLabel(currentSubDatasets[idx].datasetKey, idx);
          }
        }
        if (this.classList.contains('subds-table')) currentSubDatasets[idx].tableName = this.value.trim();
        if (this.classList.contains('subds-pk')) currentSubDatasets[idx].primaryKey = this.value.trim();
        if (this.classList.contains('subds-parentfield')) currentSubDatasets[idx].parentField = this.value.trim();
        if (this.classList.contains('subds-childfield')) currentSubDatasets[idx].childField = this.value.trim();
        if (this.classList.contains('subds-viewproc')) currentSubDatasets[idx].viewProcedure = this.value.trim();
      };
      input.onchange = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        if (!currentSubDatasets[idx]) return;
        if (this.classList.contains('subds-readonly')) currentSubDatasets[idx].isReadOnly = this.checked;
      };
    });

    container.querySelectorAll('.btn-remove-subds').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        currentSubDatasets.splice(idx, 1);
        _normalizeSubDatasetOrder();
        _renderSubDatasetsUI();
      };
    });
  }`;

const newRenderSubDs = `  function _renderSubDatasetsUI() {
    var container = $container.querySelector('#subdatasets-list');
    if (!container) return;
    container.innerHTML = '';

    if (!currentSubDatasets.length) {
      container.innerHTML = '<div style="font-size:12px; color:var(--color-text-secondary); text-align:center; padding:12px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:6px;">Chưa có Tab con nào. Nhấn "Thêm Tab Con" để bắt đầu cấu hình.</div>';
      return;
    }

    currentSubDatasets.forEach(function (ds, idx) {
      var displayLabel = (ds.label || '').trim() || _fallbackDatasetLabel(ds.datasetKey, idx);
      var card = document.createElement('div');
      card.className = 'subdataset-card';
      card.style.cssText = 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; position:relative; box-shadow:0 1px 2px rgba(0,0,0,0.03);';
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;">
          <span style="font-weight:700; font-size:12px; color:var(--color-primary); display:flex; align-items:center; gap:6px;">
            <span class="material-symbols-outlined" style="font-size:16px;">tab</span> Tab #\${idx + 1}: <span class="subds-card-label" style="color:#2d3748;">\${displayLabel}</span>
          </span>
          <button type="button" class="btn-remove-subds" data-idx="\${idx}" title="Xóa Tab con này" style="border:none; background:transparent; color:#e53e3e; cursor:pointer; padding:2px; display:flex; align-items:center; border-radius:4px;">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-4">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Mã DatasetKey <span style="color:var(--color-danger)">*</span></label>
            <input type="text" class="ui-input subds-key" data-idx="\${idx}" value="\${ds.datasetKey || ''}" placeholder="VD: DETAIL_TAB_1" \${ds._isExisting ? 'readonly disabled style="font-size:11px; padding:5px 8px; background:#f1f5f9; cursor:not-allowed; border-radius:4px;"' : 'style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;"'}>
          </div>
          <div class="col-4">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Tên Tab hiển thị <span style="color:var(--color-danger)">*</span></label>
            <input type="text" class="ui-input subds-label" data-idx="\${idx}" value="\${ds.label || ''}" placeholder="VD: Chi tiết" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-4">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">API List / Route <span style="color:var(--color-danger)">*</span></label>
            <input type="text" class="ui-input subds-apilist" data-idx="\${idx}" value="\${ds.apiList || ''}" placeholder="VD: WA_BaoHiemFrm_Detail" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Bảng Vật Lý (TableName)</label>
            <input type="text" class="ui-input subds-table" data-idx="\${idx}" value="\${ds.tableName || ''}" placeholder="VD: HR_SapCaNhanVienTbl" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Chính (PrimaryKey)</label>
            <input type="text" class="ui-input subds-pk" data-idx="\${idx}" value="\${ds.primaryKey || ''}" placeholder="VD: UserAutoID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Nối Bên Cha (ParentField)</label>
            <input type="text" class="ui-input subds-parentfield" data-idx="\${idx}" value="\${ds.parentField || ''}" placeholder="VD: MasterID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Khóa Nối Bên Con (ChildField)</label>
            <input type="text" class="ui-input subds-childfield" data-idx="\${idx}" value="\${ds.childField || ''}" placeholder="VD: MasterID" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
        <div class="row g-2 mb-2 align-items-center">
          <div class="col-8">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Proc / View Đọc Tab Con (ViewProcedure)</label>
            <input type="text" class="ui-input subds-viewproc" data-idx="\${idx}" value="\${ds.viewProcedure || ''}" placeholder="VD: API_CaLamViecBranch_NhanVien" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-4" style="padding-top:16px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#2d3748; cursor:pointer; margin:0; user-select:none;">
              <input type="checkbox" class="subds-readonly" data-idx="\${idx}" \${ds.isReadOnly ? 'checked' : ''} style="width:14px; height:14px; accent-color:var(--color-primary);">
              <span>Chỉ Xem (ReadOnly)</span>
            </label>
          </div>
        </div>
        <div class="row g-2 subds-mutation-procs" data-idx="\${idx}" style="\${ds.isReadOnly ? 'display:none;' : 'display:flex;'}">
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Procedure Lưu (SaveProcedure)</label>
            <input type="text" class="ui-input subds-saveproc" data-idx="\${idx}" value="\${ds.saveProcedure || ''}" placeholder="VD: API_LuuDong_V2" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
          <div class="col-6">
            <label style="font-size:11px; font-weight:600; color:#4a5568; margin-bottom:2px; display:block;">Procedure Xóa (DeleteProcedure)</label>
            <input type="text" class="ui-input subds-deleteproc" data-idx="\${idx}" value="\${ds.deleteProcedure || ''}" placeholder="VD: API_XoaDong_V2" style="font-size:11px; padding:5px 8px; background:#fff; border-radius:4px;">
          </div>
        </div>
      \`;
      container.appendChild(card);
    });

    container.querySelectorAll('input').forEach(function (input) {
      input.oninput = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        if (!currentSubDatasets[idx]) return;
        if (this.classList.contains('subds-key')) currentSubDatasets[idx].datasetKey = this.value.trim();
        if (this.classList.contains('subds-label')) {
          currentSubDatasets[idx].label = this.value;
          var cardTitle = this.closest('.subdataset-card').querySelector('.subds-card-label');
          if (cardTitle) {
            cardTitle.textContent = this.value.trim() || _fallbackDatasetLabel(currentSubDatasets[idx].datasetKey, idx);
          }
        }
        if (this.classList.contains('subds-apilist')) currentSubDatasets[idx].apiList = this.value.trim();
        if (this.classList.contains('subds-table')) currentSubDatasets[idx].tableName = this.value.trim();
        if (this.classList.contains('subds-pk')) currentSubDatasets[idx].primaryKey = this.value.trim();
        if (this.classList.contains('subds-parentfield')) currentSubDatasets[idx].parentField = this.value.trim();
        if (this.classList.contains('subds-childfield')) currentSubDatasets[idx].childField = this.value.trim();
        if (this.classList.contains('subds-viewproc')) currentSubDatasets[idx].viewProcedure = this.value.trim();
        if (this.classList.contains('subds-saveproc')) currentSubDatasets[idx].saveProcedure = this.value.trim();
        if (this.classList.contains('subds-deleteproc')) currentSubDatasets[idx].deleteProcedure = this.value.trim();
      };
      input.onchange = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        if (!currentSubDatasets[idx]) return;
        if (this.classList.contains('subds-readonly')) {
          currentSubDatasets[idx].isReadOnly = this.checked;
          var card = this.closest('.subdataset-card');
          var mutProcs = card ? card.querySelector('.subds-mutation-procs') : null;
          if (mutProcs) {
            mutProcs.style.display = this.checked ? 'none' : 'flex';
          }
        }
      };
    });

    container.querySelectorAll('.btn-remove-subds').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        currentSubDatasets.splice(idx, 1);
        _normalizeSubDatasetOrder();
        _renderSubDatasetsUI();
      };
    });
  }`;

code = code.replace(oldRenderSubDs, newRenderSubDs);

// 6. Update _saveMenu
const oldSaveMenu = `  function _saveMenu() {
    var id = $container.querySelector('#menu-id').value.trim();
    var label = $container.querySelector('#menu-label').value.trim();
    var en = $container.querySelector('#menu-en').value.trim();
    var subtitle = $container.querySelector('#menu-subtitle').value.trim();
    var parent = $container.querySelector('#menu-parent').value;
    var formName = $container.querySelector('#menu-formname').value.trim();
    var formKey = $container.querySelector('#menu-formkey').value.trim();
    var urlPara = $container.querySelector('#menu-urlpara').value.trim();
    var icon = $container.querySelector('#menu-icon').value.trim();
    var isDisable = $container.querySelector('#menu-is-disable').checked ? 1 : 0;
    var isEdit = $container.querySelector('#menu-is-edit').value === '1';
    var oldId = $container.querySelector('#menu-old-id').value;

    // V2 & V3 Config
    var tabEl = $container.querySelector('#menu-tablename');
    var pkEl = $container.querySelector('#menu-primarykey');
    var delEl = $container.querySelector('#menu-allow-hard-delete');
    var cTypeEl = $container.querySelector('#menu-contract-type');
    var cViewEl = $container.querySelector('#menu-custom-view-proc');
    var cSaveEl = $container.querySelector('#menu-custom-save-proc');
    var cDelEl = $container.querySelector('#menu-custom-delete-proc');

    var tableName = tabEl ? tabEl.value.trim() : '';
    var primaryKey = pkEl ? pkEl.value.trim() : '';
    var allowHardDelete = (delEl && delEl.checked) ? 1 : 0;
    var contractType = cTypeEl ? cTypeEl.value : 'SIMPLE_TABLE';
    var customViewProc = cViewEl ? cViewEl.value.trim() : '';
    var customSaveProc = cSaveEl ? cSaveEl.value.trim() : '';
    var customDeleteProc = cDelEl ? cDelEl.value.trim() : '';

    if (!id || !label || !formName) {
      Alert.error('Thiếu thông tin', 'Vui lòng nhập Menu ID, Tên Menu (VN) và Tên Form hệ thống');
      return;
    }

    var subDsPayload = (contractType === 'MASTER_DETAIL' && Array.isArray(currentSubDatasets) && currentSubDatasets.length)
      ? currentSubDatasets.map(function (ds, i) {
          var displayLabel = (ds.label || '').trim() || _fallbackDatasetLabel(ds.datasetKey, i);
          var rawKey = (ds.datasetKey || '').trim();
          var safeKey = rawKey && /^[A-Za-z0-9_]+$/.test(rawKey)
            ? rawKey.toUpperCase()
            : _latinize(displayLabel).toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
          if (!safeKey) safeKey = 'DETAIL_TAB_' + (i + 1);

          return {
            datasetKey: safeKey,
            label: displayLabel,
            sortOrder: i + 1,
            apiList: (ds.apiList || safeKey).trim(),
            tableName: (ds.tableName || '').trim(),
            primaryKey: (ds.primaryKey || 'UserAutoID').trim(),
            parentField: (ds.parentField || '').trim(),
            childField: (ds.childField || '').trim(),
            viewProcedure: (ds.viewProcedure || '').trim(),
            isReadOnly: !!ds.isReadOnly
          };
        })
      : [];

    var payload = {
      NhomNguoiDangThaoTac: MenusService.currentGroupId(),
      MenuID: id,
      OldMenuID: oldId,
      ParentID: parent,
      Label: label,
      EN: en,
      SubTitle: subtitle,
      FormName: formName,
      FormKey: formKey,
      URLPara: urlPara,
      Icon: icon,
      IsDisable: isDisable,
      IsEdit: isEdit ? 1 : 0,
      // Pass V2 & V3 parameters to Backend
      TableName: tableName,
      PrimaryKey: primaryKey,
      AllowHardDelete: allowHardDelete,
      ContractType: contractType,
      CustomViewProc: customViewProc,
      CustomSaveProc: customSaveProc,
      CustomDeleteProc: customDeleteProc,
      DatasetsJson: subDsPayload.length ? JSON.stringify(subDsPayload) : ''
    };

    var btn = $container.querySelector('#btn-save-menu');
    btn.disabled = true;
    btn.textContent = 'Đang lưu...';

    MenusService.save(payload)
      .then(function (res) {
        if (res && res.code === 0) {
          Alert.success('Thành công', 'Đã lưu Menu thành công!');
          try {
            if (window.FieldSyncService && formName) {
              FieldSyncService.clearCache(formName);
              FieldSyncService.fetchManagedState(formName, null, true).catch(function () {});
            }
          } catch (e) {}
          _closeModal();
          if (window.Navbar) Navbar.clearMenuCache();
          _loadMenus();
        } else {
          Alert.error('Lỗi', res && res.msg ? res.msg : 'Lưu thất bại');
        }
      })
      .catch(function () {
        Alert.error('Lỗi', 'Kết nối máy chủ bị gián đoạn');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = UIIcon.renderHtml('save', 'font-size:16px;vertical-align:middle;margin-right:4px;') + ' Lưu Thông Tin';
      });
  }`;

const newSaveMenu = `  function _saveMenu() {
    var id = $container.querySelector('#menu-id').value.trim();
    var label = $container.querySelector('#menu-label').value.trim();
    var en = $container.querySelector('#menu-en').value.trim();
    var subtitle = $container.querySelector('#menu-subtitle').value.trim();
    var parent = $container.querySelector('#menu-parent').value;
    var formName = $container.querySelector('#menu-formname').value.trim();
    var formKey = $container.querySelector('#menu-formkey').value.trim();
    var urlPara = $container.querySelector('#menu-urlpara').value.trim();
    var icon = $container.querySelector('#menu-icon').value.trim();
    var isDisable = $container.querySelector('#menu-is-disable').checked ? 1 : 0;
    var isEdit = $container.querySelector('#menu-is-edit').value === '1';
    var oldId = $container.querySelector('#menu-old-id').value.trim();

    // V2 & V3 Config
    var tabEl = $container.querySelector('#menu-tablename');
    var pkEl = $container.querySelector('#menu-primarykey');
    var delEl = $container.querySelector('#menu-allow-hard-delete');
    var cTypeEl = $container.querySelector('#menu-contract-type');
    var cViewEl = $container.querySelector('#menu-custom-view-proc');
    var cSaveEl = $container.querySelector('#menu-custom-save-proc');
    var cDelEl = $container.querySelector('#menu-custom-delete-proc');

    var tableName = tabEl ? tabEl.value.trim() : '';
    var primaryKey = pkEl ? pkEl.value.trim() : '';
    var allowHardDelete = (delEl && delEl.checked) ? 1 : 0;
    var contractType = cTypeEl ? cTypeEl.value : 'SIMPLE_TABLE';
    var customViewProc = cViewEl ? cViewEl.value.trim() : '';
    var customSaveProc = cSaveEl ? cSaveEl.value.trim() : '';
    var customDeleteProc = cDelEl ? cDelEl.value.trim() : '';

    if (!id || !label || !formName) {
      Alert.error('Thiếu thông tin', 'Vui lòng nhập Menu ID, Tên Menu (VN) và Tên Form hệ thống');
      return;
    }

    var currentMenu = isEdit ? (allMenus.find(function (m) { return m.id === oldId || m.id === id; }) || {}) : {};

    var patch = {
      MenuID: id,
      OldMenuID: oldId || id,
      ParentID: parent,
      Label: label,
      EN: en,
      SubTitle: subtitle,
      FormName: formName,
      FormKey: formKey,
      URLPara: urlPara,
      Icon: icon,
      IsDisable: isDisable,
      IsEdit: isEdit ? 1 : 0,
      TableName: tableName,
      PrimaryKey: primaryKey,
      AllowHardDelete: allowHardDelete,
      ContractType: contractType,
      CustomViewProc: customViewProc,
      CustomSaveProc: customSaveProc,
      CustomDeleteProc: customDeleteProc,
      datasets: currentSubDatasets
    };

    var definition = MenuDefinition.mergeMenu(currentMenu, patch);

    var valid = MenuDefinition.validate(definition);
    if (!valid.isValid) {
      Alert.error('Cấu hình không hợp lệ', valid.errors.join('<br>'));
      return;
    }

    var btn = $container.querySelector('#btn-save-menu');
    btn.disabled = true;
    btn.textContent = 'Đang lưu...';

    MenusService.saveDefinition(definition)
      .then(function (res) {
        if (res && res.metadataReady) {
          Alert.success('Thành công', 'Đã lưu Menu thành công!');
        } else {
          Alert.warning('Thành công', 'Đã lưu Menu thành công! (Lưu ý: Metadata V2 chưa sẵn sàng: ' + (res.metadataError && res.metadataError.message || '') + ')');
        }
        _closeModal();
        if (window.Navbar && typeof Navbar.clearMenuCache === 'function') Navbar.clearMenuCache();
        _loadMenus();
      })
      .catch(function (err) {
        Alert.error('Lỗi lưu Menu', err && err.message ? err.message : 'Lưu thất bại');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = UIIcon.renderHtml('save', 'font-size:16px;vertical-align:middle;margin-right:4px;') + ' Lưu Thông Tin';
      });
  }`;

code = code.replace(oldSaveMenu, newSaveMenu);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated src/pages/menus/menus.js');
