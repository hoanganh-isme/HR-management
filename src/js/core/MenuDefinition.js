/**
 * MenuDefinition
 * Pure domain model và normalization layer cho Menu và Sub-Datasets hệ thống.
 * Không truy cập DOM, không gọi API, hoàn toàn deterministic và có thể chạy trên cả Browser lẫn Node.js.
 */
(function (global) {
  'use strict';

  var DATASET_KEY_REGEX = /^[A-Za-z][A-Za-z0-9_]{0,79}$/;

  function _prop(obj, names, fallback) {
    if (!obj || typeof obj !== 'object') return fallback;
    for (var i = 0; i < names.length; i++) {
      var val = obj[names[i]];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return val;
      }
    }
    return fallback;
  }

  function _bool(val) {
    return val === true || val === 1 || val === '1' || String(val || '').toLowerCase() === 'true';
  }

  function isDynamicFormName(formName) {
    if (!formName || typeof formName !== 'string') return false;
    var name = formName.trim();
    if (!name) return false;
    if (/^[A-Za-z0-9_]+(Frm|Report)$/i.test(name)) return true;
    if (name.toLowerCase() === 'sy_formatfldtbl') return true;
    return false;
  }

  function _fallbackDatasetLabel(datasetKey, index) {
    var key = String(datasetKey || '').trim();
    if (!key || /^DETAIL_TAB_\d+$/i.test(key)) return 'Chi tiết ' + ((index || 0) + 1);
    if (/\s|[^\x00-\x7F]/.test(key)) return key;
    return key.replace(/_/g, ' ').replace(/(^|\s)\S/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function normalizeDataset(raw, index, masterPrimaryKey) {
    raw = raw || {};
    var idx = typeof index === 'number' ? index : 0;
    var rawKey = _prop(raw, ['datasetKey', 'DatasetKey', 'key', 'Key'], '');
    var datasetKey = String(rawKey || '').trim().toUpperCase();
    if (!datasetKey) {
      datasetKey = 'DETAIL_TAB_' + (idx + 1);
    }

    var label = _prop(raw, ['label', 'Label', 'title', 'Title'], '');
    label = String(label || '').trim() || _fallbackDatasetLabel(datasetKey, idx);

    var sortOrder = parseInt(_prop(raw, ['sortOrder', 'SortOrder', 'order', 'Order'], idx + 1), 10);
    if (isNaN(sortOrder) || sortOrder <= 0) sortOrder = idx + 1;

    var isReadOnly = _bool(_prop(raw, ['isReadOnly', 'IsReadOnly', 'readOnly', 'ReadOnly'], false));
    var tableName = String(_prop(raw, ['tableName', 'TableName', 'table', 'Table'], '')).trim();
    var apiList = String(_prop(raw, ['apiList', 'ApiList', 'list', 'List'], datasetKey)).trim();
    var primaryKey = String(_prop(raw, ['primaryKey', 'PrimaryKey', 'expectedPrimaryKey', 'ExpectedPrimaryKey', 'pk', 'PK'], 'UserAutoID')).trim();
    var parentField = String(_prop(raw, ['parentField', 'ParentField', 'parentKey', 'ParentKey'], masterPrimaryKey || '')).trim();
    var childField = String(_prop(raw, ['childField', 'ChildField', 'filterField', 'FilterField', 'childKey', 'ChildKey'], parentField)).trim();
    var viewProcedure = String(_prop(raw, ['viewProcedure', 'ViewProcedure', 'viewProc', 'ViewProc', 'customViewProc', 'CustomViewProc'], '')).trim();

    var rawSaveProc = raw.saveProcedure !== undefined ? raw.saveProcedure : (raw.SaveProcedure !== undefined ? raw.SaveProcedure : (raw.saveProc !== undefined ? raw.saveProc : raw.SaveProc));
    var rawDeleteProc = raw.deleteProcedure !== undefined ? raw.deleteProcedure : (raw.DeleteProcedure !== undefined ? raw.DeleteProcedure : (raw.deleteProc !== undefined ? raw.deleteProc : raw.DeleteProc));

    var saveProcedure = isReadOnly ? '' : (rawSaveProc !== undefined ? String(rawSaveProc).trim() : (tableName ? 'API_LuuDong_V2' : ''));
    var deleteProcedure = isReadOnly ? '' : (rawDeleteProc !== undefined ? String(rawDeleteProc).trim() : (tableName ? 'API_XoaDong_V2' : ''));

    var writePolicy = String(_prop(raw, ['writePolicy', 'WritePolicy'], isReadOnly ? 'READ_ONLY' : 'VIEW_PHYSICAL_COLUMNS')).trim();
    var branchPolicy = String(_prop(raw, ['branchPolicy', 'BranchPolicy'], 'AUTO_SCHEMA')).trim();
    var rolloutStatus = String(_prop(raw, ['rolloutStatus', 'RolloutStatus'], 'SHADOW')).trim();

    return {
      datasetKey: datasetKey,
      label: label,
      sortOrder: sortOrder,
      apiList: apiList,
      tableName: tableName,
      primaryKey: primaryKey,
      parentField: parentField,
      childField: childField,
      viewProcedure: viewProcedure,
      isReadOnly: isReadOnly,
      saveProcedure: saveProcedure,
      deleteProcedure: deleteProcedure,
      writePolicy: writePolicy,
      branchPolicy: branchPolicy,
      rolloutStatus: rolloutStatus
    };
  }

  function normalizeDatasets(rawDatasets, masterPrimaryKey) {
    if (!rawDatasets) return [];
    var parsed = rawDatasets;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        parsed = [];
      }
    }
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(function (ds, idx) {
        return normalizeDataset(ds, idx, masterPrimaryKey);
      })
      .sort(function (a, b) {
        return a.sortOrder - b.sortOrder;
      })
      .map(function (ds, idx) {
        ds.sortOrder = idx + 1;
        return ds;
      });
  }

  function normalizeMenu(raw) {
    raw = raw || {};
    var id = String(_prop(raw, ['MenuID', 'menuId', 'id', 'ID'], '')).trim();
    var oldId = String(_prop(raw, ['OldMenuID', 'oldMenuId', 'oldId', 'OldID'], id)).trim();
    var parent = String(_prop(raw, ['ParentID', 'parentId', 'parent', 'Parent'], '')).trim();
    var label = String(_prop(raw, ['Label', 'label', 'VN', 'vn', 'title', 'Title'], '')).trim();
    var en = String(_prop(raw, ['EN', 'en', 'labelEN', 'LabelEN'], '')).trim();
    var subtitle = String(_prop(raw, ['SubTitle', 'subTitle', 'subtitle', 'Subtitle'], '')).trim();
    var formName = String(_prop(raw, ['FormName', 'formName'], '')).trim();
    var formKey = String(_prop(raw, ['FormKey', 'formKey'], '')).trim();
    var urlPara = String(_prop(raw, ['URLPara', 'urlPara', 'url', 'URL'], '')).trim();
    var icon = String(_prop(raw, ['Icon', 'icon'], 'horizontal_rule')).trim();
    var isDisable = _bool(_prop(raw, ['IsDisable', 'isDisable', 'disabled', 'Disabled'], false)) ? 1 : 0;
    var isEdit = _bool(_prop(raw, ['IsEdit', 'isEdit'], oldId && oldId === id)) ? 1 : 0;

    var tableName = String(_prop(raw, ['TableName', 'tableName', 'table', 'Table'], '')).trim();
    var primaryKey = String(_prop(raw, ['PrimaryKey', 'primaryKey', 'pk', 'PK'], '')).trim();
    var allowHardDelete = _bool(_prop(raw, ['AllowHardDelete', 'allowHardDelete'], false)) ? 1 : 0;

    var rawContract = String(_prop(raw, ['ContractType', 'contractType', 'contract', 'Contract'], 'SIMPLE_TABLE')).trim().toUpperCase();
    var contractType = 'SIMPLE_TABLE';
    if (rawContract.indexOf('MASTER_DETAIL') !== -1) {
      contractType = 'MASTER_DETAIL';
    } else if (rawContract.indexOf('JOIN_VIEW') !== -1) {
      contractType = 'JOIN_VIEW';
    } else if (rawContract.indexOf('CUSTOM_API') !== -1) {
      contractType = 'CUSTOM_API';
    }

    var customViewProc = String(_prop(raw, ['CustomViewProc', 'customViewProc', 'viewProcedure', 'ViewProcedure'], '')).trim();
    var customSaveProc = String(_prop(raw, ['CustomSaveProc', 'customSaveProc', 'saveProcedure', 'SaveProcedure'], '')).trim();
    var customDeleteProc = String(_prop(raw, ['CustomDeleteProc', 'customDeleteProc', 'deleteProcedure', 'DeleteProcedure'], '')).trim();

    var rawDatasets = _prop(raw, ['datasets', 'Datasets', 'datasetsJson', 'DatasetsJson'], null);
    var datasets = normalizeDatasets(rawDatasets, primaryKey);

    return {
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
      IsEdit: isEdit,
      TableName: tableName,
      PrimaryKey: primaryKey,
      AllowHardDelete: allowHardDelete,
      ContractType: contractType,
      CustomViewProc: customViewProc,
      CustomSaveProc: customSaveProc,
      CustomDeleteProc: customDeleteProc,
      datasets: datasets
    };
  }

  function mergeMenu(currentMenu, patch) {
    var base = normalizeMenu(currentMenu || {});
    patch = patch || {};

    var merged = Object.assign({}, base);

    if (patch.MenuID !== undefined || patch.menuId !== undefined || patch.id !== undefined) {
      merged.MenuID = String(_prop(patch, ['MenuID', 'menuId', 'id'], merged.MenuID)).trim();
    }
    if (patch.OldMenuID !== undefined || patch.oldMenuId !== undefined || patch.oldId !== undefined) {
      merged.OldMenuID = String(_prop(patch, ['OldMenuID', 'oldMenuId', 'oldId'], merged.OldMenuID)).trim();
    }
    if (patch.ParentID !== undefined || patch.parentId !== undefined || patch.parent !== undefined) {
      merged.ParentID = String(_prop(patch, ['ParentID', 'parentId', 'parent'], merged.ParentID)).trim();
    }
    if (patch.Label !== undefined || patch.label !== undefined || patch.VN !== undefined || patch.vn !== undefined) {
      merged.Label = String(_prop(patch, ['Label', 'label', 'VN', 'vn'], merged.Label)).trim();
    }
    if (patch.EN !== undefined || patch.en !== undefined) {
      merged.EN = String(_prop(patch, ['EN', 'en'], merged.EN)).trim();
    }
    if (patch.SubTitle !== undefined || patch.subTitle !== undefined || patch.subtitle !== undefined) {
      merged.SubTitle = String(_prop(patch, ['SubTitle', 'subTitle', 'subtitle'], merged.SubTitle)).trim();
    }
    if (patch.FormName !== undefined || patch.formName !== undefined) {
      merged.FormName = String(_prop(patch, ['FormName', 'formName'], merged.FormName)).trim();
    }
    if (patch.FormKey !== undefined || patch.formKey !== undefined) {
      merged.FormKey = String(_prop(patch, ['FormKey', 'formKey'], merged.FormKey)).trim();
    }
    if (patch.URLPara !== undefined || patch.urlPara !== undefined) {
      merged.URLPara = String(_prop(patch, ['URLPara', 'urlPara'], merged.URLPara)).trim();
    }
    if (patch.Icon !== undefined || patch.icon !== undefined) {
      merged.Icon = String(_prop(patch, ['Icon', 'icon'], merged.Icon)).trim();
    }
    if (patch.IsDisable !== undefined || patch.isDisable !== undefined) {
      merged.IsDisable = _bool(_prop(patch, ['IsDisable', 'isDisable'], merged.IsDisable)) ? 1 : 0;
    }
    if (patch.IsEdit !== undefined || patch.isEdit !== undefined) {
      merged.IsEdit = _bool(_prop(patch, ['IsEdit', 'isEdit'], merged.IsEdit)) ? 1 : 0;
    }
    if (patch.TableName !== undefined || patch.tableName !== undefined) {
      merged.TableName = String(_prop(patch, ['TableName', 'tableName'], merged.TableName)).trim();
    }
    if (patch.PrimaryKey !== undefined || patch.primaryKey !== undefined) {
      merged.PrimaryKey = String(_prop(patch, ['PrimaryKey', 'primaryKey'], merged.PrimaryKey)).trim();
    }
    if (patch.AllowHardDelete !== undefined || patch.allowHardDelete !== undefined) {
      merged.AllowHardDelete = _bool(_prop(patch, ['AllowHardDelete', 'allowHardDelete'], merged.AllowHardDelete)) ? 1 : 0;
    }
    if (patch.ContractType !== undefined || patch.contractType !== undefined) {
      merged.ContractType = String(_prop(patch, ['ContractType', 'contractType'], merged.ContractType)).trim().toUpperCase() || 'SIMPLE_TABLE';
    }
    if (patch.CustomViewProc !== undefined || patch.customViewProc !== undefined) {
      merged.CustomViewProc = String(_prop(patch, ['CustomViewProc', 'customViewProc'], merged.CustomViewProc)).trim();
    }
    if (patch.CustomSaveProc !== undefined || patch.customSaveProc !== undefined) {
      merged.CustomSaveProc = String(_prop(patch, ['CustomSaveProc', 'customSaveProc'], merged.CustomSaveProc)).trim();
    }
    if (patch.CustomDeleteProc !== undefined || patch.customDeleteProc !== undefined) {
      merged.CustomDeleteProc = String(_prop(patch, ['CustomDeleteProc', 'customDeleteProc'], merged.CustomDeleteProc)).trim();
    }

    var rawPatchDatasets = _prop(patch, ['datasets', 'Datasets', 'datasetsJson', 'DatasetsJson'], null);
    if (rawPatchDatasets !== null) {
      merged.datasets = normalizeDatasets(rawPatchDatasets, merged.PrimaryKey);
    }

    return merged;
  }

  function validate(definition) {
    var d = normalizeMenu(definition);
    var errors = [];

    if (!d.MenuID) errors.push('Thiếu MenuID.');
    if (!d.Label) errors.push('Thiếu Tên Menu (Label/VN).');
    if (!d.FormName) errors.push('Thiếu Tên Form hệ thống (FormName).');

    if (d.ContractType === 'MASTER_DETAIL') {
      if (!Array.isArray(d.datasets) || d.datasets.length === 0) {
        errors.push('Menu Master-Detail cần có ít nhất một Tab con (Dataset).');
      } else {
        var seenKeys = {};
        d.datasets.forEach(function (ds, idx) {
          var key = ds.datasetKey;
          if (!key) {
            errors.push('Tab con #' + (idx + 1) + ' thiếu DatasetKey.');
            return;
          }
          if (!DATASET_KEY_REGEX.test(key)) {
            errors.push('DatasetKey "' + key + '" không hợp lệ (phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số, gạch dưới).');
          }
          if (seenKeys[key.toUpperCase()]) {
            errors.push('Trùng lặp DatasetKey: "' + key + '".');
          }
          seenKeys[key.toUpperCase()] = true;

          if (!ds.apiList) {
            errors.push('Dataset ' + key + ' thiếu ApiList.');
          }

          if (!ds.isReadOnly) {
            if (!ds.tableName) errors.push('Dataset ' + key + ' thiếu TableName.');
            if (!ds.primaryKey) errors.push('Dataset ' + key + ' thiếu PrimaryKey.');
            if (!ds.parentField) errors.push('Dataset ' + key + ' thiếu ParentField.');
            if (!ds.childField) errors.push('Dataset ' + key + ' thiếu ChildField.');
            if (!ds.saveProcedure) errors.push('Dataset ' + key + ' thiếu SaveProcedure.');
            if (!ds.deleteProcedure) errors.push('Dataset ' + key + ' thiếu DeleteProcedure.');
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  function toSavePayload(definition, currentGroupId) {
    var d = normalizeMenu(definition);
    var datasetsPayload = [];

    if (d.ContractType === 'MASTER_DETAIL' && Array.isArray(d.datasets) && d.datasets.length > 0) {
      datasetsPayload = d.datasets.map(function (ds, i) {
        return {
          datasetKey: ds.datasetKey,
          label: ds.label,
          sortOrder: i + 1,
          apiList: ds.apiList,
          tableName: ds.tableName,
          primaryKey: ds.primaryKey,
          parentField: ds.parentField,
          childField: ds.childField,
          viewProcedure: ds.viewProcedure,
          isReadOnly: !!ds.isReadOnly,
          saveProcedure: ds.isReadOnly ? '' : ds.saveProcedure,
          deleteProcedure: ds.isReadOnly ? '' : ds.deleteProcedure,
          writePolicy: ds.writePolicy,
          branchPolicy: ds.branchPolicy,
          rolloutStatus: ds.rolloutStatus
        };
      });
    }

    return {
      NhomNguoiDangThaoTac: currentGroupId || 'admin',
      MenuID: d.MenuID,
      OldMenuID: d.OldMenuID || d.MenuID,
      ParentID: d.ParentID,
      Label: d.Label,
      EN: d.EN,
      SubTitle: d.SubTitle,
      FormName: d.FormName,
      FormKey: d.FormKey,
      URLPara: d.URLPara,
      Icon: d.Icon,
      IsDisable: d.IsDisable,
      IsEdit: d.IsEdit,
      TableName: d.TableName,
      PrimaryKey: d.PrimaryKey,
      AllowHardDelete: d.AllowHardDelete,
      ContractType: d.ContractType,
      CustomViewProc: d.CustomViewProc,
      CustomSaveProc: d.CustomSaveProc,
      CustomDeleteProc: d.CustomDeleteProc,
      DatasetsJson: datasetsPayload.length > 0 ? JSON.stringify(datasetsPayload) : ''
    };
  }

  var MenuDefinition = {
    normalizeDataset: normalizeDataset,
    normalizeDatasets: normalizeDatasets,
    normalizeMenu: normalizeMenu,
    mergeMenu: mergeMenu,
    validate: validate,
    toSavePayload: toSavePayload,
    isDynamicFormName: isDynamicFormName
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuDefinition;
  }
  if (global) {
    global.MenuDefinition = MenuDefinition;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
