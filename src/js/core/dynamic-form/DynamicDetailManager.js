/** Detail tabs: loading, editable grid lifecycle and detail persistence. */
window.DynamicDetailManager = (function () {
  /**
   * _getFieldCaption – tra cứu nhãn tiếng Việt theo thứ tự ưu tiên:
   * 1. field.label từ join-schema / contract API (Caption / CaptionVN từ DB)
   * 2. tabDef.headers (nếu form cũ còn khai báo tường minh)
   * 3. dict() = globalDictionary từ DynamicFormEngine (đọc SY_FmtFldTbl qua API)
   * 4. window._globalFieldDictionary (global – DynamicFormEngine populate)
   * 5. Fallback tách CamelCase: "PersonName" → "Person Name"
   *
   * KHÔNG hard-code caption trong file JS.
   * Caption phải đến từ desktop dictionary qua Field Contract V2.
   */
  function _getFieldCaption(fieldName, fieldObj, tabHeaders, dict) {
    if (fieldObj && fieldObj.label) return fieldObj.label;
    if (!fieldName) return '';
    var raw = String(fieldName).trim();
    var lower = raw.toLowerCase();

    if (tabHeaders && tabHeaders[raw]) return tabHeaders[raw];
    if (tabHeaders && tabHeaders[lower]) return tabHeaders[lower];

    // 3. Từ điển form (DynamicFormEngine.globalDictionary – load từ SY_FmtFldTbl)
    var d = typeof dict === 'function' ? dict() : (dict || {});
    if (d[raw]) return d[raw];
    if (d[lower]) return d[lower];
    for (var k in d) {
      if (k.toLowerCase() === lower && d[k]) return d[k];
    }

    // 4. Dictionary toàn hệ thống (window._globalFieldDictionary – DynamicFormEngine)
    var gDict = (typeof window !== 'undefined' && window._globalFieldDictionary) || {};
    if (gDict[lower]) return gDict[lower];

    // 5. Fallback tách CamelCase ("PersonName" → "Person Name")
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function _isTechnicalKey(key) {
    if (!key) return true;
    var k = String(key).trim().toLowerCase();
    if (k.charAt(0) === '_') return true;
    if (k === 'userautoid' || k === 'autoid' || k === 'isdeleted' || k === 'bisdeleted' || k === 'stt_id') return true;
    if (k.endsWith('autoid')) return true;
    return false;
  }

  function recordsOf(response) {
    return response ? (response.list || response.records || response.data || (Array.isArray(response) ? response : [])) : [];
  }

  function codeOf(response) {
    return response && (response.code !== undefined ? response.code : response.Code);
  }

  function _isCheckedValue(value) {
    return value === true
      || value === 1
      || value === '1'
      || String(value || '').toLowerCase() === 'true';
  }

  function _detailFieldType(tabDef, fieldName, contractField) {
    var configured = tabDef
      && tabDef.fieldTypes
      && tabDef.fieldTypes[fieldName];
    var raw = configured
      || contractField && (
        contractField.renderRule
        || contractField.formatType
        || contractField.sqlType
      )
      || '';
    raw = String(raw).toLowerCase();
    if (
      raw === 'boolean'
      || raw === 'bool'
      || raw === 'bit'
      || raw === 'c'
      || raw === 'sw'
      || raw === 'checkbox'
    ) return 'boolean';
    return raw;
  }

  function _displayDateValue(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    raw = raw.split('T')[0].split(' ')[0];
    var iso = raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (iso) {
      return String(iso[3]).padStart(2, '0') + '/'
        + String(iso[2]).padStart(2, '0') + '/'
        + iso[1];
    }
    var vn = raw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (vn) {
      return String(vn[1]).padStart(2, '0') + '/'
        + String(vn[2]).padStart(2, '0') + '/'
        + vn[3];
    }
    return raw;
  }

  function _isDateLikeField(fieldName, field) {
    var name = String(fieldName || field && field.name || '').toLowerCase();
    var rule = String(field && field.renderRule || '').toLowerCase();
    return name.indexOf('ngay') >= 0
      || name.indexOf('date') >= 0
      || rule === 'd'
      || rule === 'dt'
      || rule === 'date';
  }

  function _branchPolicyOf(moduleConfig, tabDef) {
    return String(
      tabDef && (tabDef.BranchPolicy || tabDef.branchPolicy)
      || moduleConfig && (moduleConfig.BranchPolicy || moduleConfig.branchPolicy)
      || ''
    ).trim().toUpperCase();
  }

  function _isBranchPayloadField(fieldName) {
    var name = String(fieldName || '').trim().toLowerCase();
    return name === 'branchid' || name === 'tenantid' || name === 'companyid' || name === 'donviid';
  }

  function create(options) {
    var moduleConfig = options.moduleConfig || {};
    var api = options.apiClient || window.ApiClient;
    var gateway = moduleConfig.apiGateway || AppConfig.apiGateway;
    var currentUser = options.currentUser || function () {
      if (window.AppSession && typeof AppSession.getUserName === 'function') {
        var u = AppSession.getUserName();
        if (u && String(u).trim()) return u;
      }
      if (window.Auth && typeof window.Auth.getUser === 'function') {
        var uObj = window.Auth.getUser();
        if (uObj && uObj.username) return uObj.username;
      }
      var storageUser = localStorage.getItem('username') || sessionStorage.getItem('username') || localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storageUser && String(storageUser).trim()) return String(storageUser).trim();
      return 'admin';
    };
    var currentBranch =
      options.currentBranch
      || function () {
        return (
          window.AppSession
          && typeof AppSession.getBranchId
            === 'function'
        )
          ? AppSession.getBranchId()
          : '';
      };
    var getDictionary = options.getDictionary || function () { return {}; };

    function masterValue(panel, masterRow, fieldName) {
      var tabs = panel && panel.closest
        ? panel.closest('.detail-tabs-container')
        : null;
      var formBody = tabs && tabs.parentElement;
      var input = formBody && formBody.querySelector
        ? formBody.querySelector('[name="' + fieldName + '"]')
        : null;
      if (input && input.value !== undefined) return input.value;
      return masterRow && masterRow[fieldName] !== undefined
        ? masterRow[fieldName]
        : '';
    }

    function linkedValue(linkDef, detailRow, panel, masterRow, sourceField) {
      if (!sourceField) return '';
      var source = String(sourceField);
      if (source.indexOf('master.') === 0) {
        return masterValue(panel, masterRow, source.substring(7));
      }
      if (source.indexOf('row.') === 0) {
        source = source.substring(4);
      }
      if (detailRow && detailRow[source] !== undefined) return detailRow[source];
      return masterValue(panel, masterRow, source);
    }

    function mappedValues(map, linkDef, detailRow, panel, masterRow) {
      var result = {};
      Object.keys(map || {}).forEach(function (targetField) {
        result[targetField] = linkedValue(linkDef, detailRow, panel, masterRow, map[targetField]);
      });
      return result;
    }

    function editableModuleOf(linkDef) {
      var apiList = String(linkDef && linkDef.apiList || '');
      return String(
        linkDef && (
          linkDef.targetModule
          || linkDef.formName
          || linkDef.editModule
          || (!/^API_/i.test(apiList) ? apiList : '')
        )
        || ''
      ).trim();
    }

    function openLinkedRecords(linkDef, detailRow, panel, masterRow) {
      if (!linkDef || !linkDef.apiList) return Promise.resolve([]);

      var filters = mappedValues(linkDef.filterMap, linkDef, detailRow, panel, masterRow);
      Object.assign(filters, mappedValues(linkDef.masterFilterMap, linkDef, detailRow, panel, masterRow));
      var defaults = Object.assign(
        {},
        linkDef.defaultValues || {},
        mappedValues(linkDef.defaultMap, linkDef, detailRow, panel, masterRow),
        mappedValues(linkDef.masterDefaultMap, linkDef, detailRow, panel, masterRow)
      );
      var keyword = linkDef.keywordSource && detailRow
        ? detailRow[linkDef.keywordSource]
        : '';
      var payload = {
        List: linkDef.apiList,
        Func: linkDef.func || 'View',
        Keyword: keyword || '',
        Limit: linkDef.limit || 200,
        JsonData: JSON.stringify(filters),
        UserName: currentUser(),
        User: currentUser(),
        BranchID: currentBranch()
      };
      if (Object.keys(filters).length) Object.assign(payload, filters);

      return api.post(moduleConfig.ApiSearch || gateway, payload).then(function (response) {
        var rows = recordsOf(response);
        var content = document.createElement('div');
        content.className = 'linked-records-preview';
        content.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
        var targetModule = editableModuleOf(linkDef);
        var targetPrimaryKey = linkDef.primaryKey || 'DocumentID';
        var canEdit = Boolean(targetModule && linkDef.editable === true);
        var canAdd = Boolean(targetModule && (linkDef.allowAdd === true || linkDef.canAdd === true));
        var modalRef = null;

        function navigateToTarget(record, isAdd) {
          var seed = Object.assign({}, defaults, record || {});
          if (isAdd) {
            try {
              sessionStorage.setItem('HR_Detail_Defaults_' + targetModule, JSON.stringify(seed));
            } catch (e) { }
            if (modalRef && typeof modalRef.close === 'function') modalRef.close();
            window.location.hash = '#/detail?module=' + encodeURIComponent(targetModule) + '&action=add';
            return;
          }

          var id = record && record[targetPrimaryKey];
          if (!id) {
            if (window.Alert) Alert.warning('Thiếu khóa dữ liệu', 'Không tìm thấy mã chứng từ để mở form chỉnh sửa.');
            return;
          }
          try {
            sessionStorage.setItem('HR_Detail_Row_' + targetModule, JSON.stringify(seed));
          } catch (e) { }
          if (modalRef && typeof modalRef.close === 'function') modalRef.close();
          window.location.hash = '#/detail?module=' + encodeURIComponent(targetModule)
            + '&id=' + encodeURIComponent(id)
            + '&action=edit';
        }

        if (canAdd) {
          var toolbar = document.createElement('div');
          toolbar.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;align-items:center;';
          var addButton = document.createElement('button');
          addButton.type = 'button';
          addButton.className = 'btn btn-sm btn-primary';
          addButton.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">add</span> '
            + (linkDef.addButtonTitle || 'Tạo mới');
          addButton.onclick = function () { navigateToTarget(null, true); };
          toolbar.appendChild(addButton);
          content.appendChild(toolbar);
        }

        if (!rows.length) {
          var empty = document.createElement('div');
          empty.style.cssText = 'padding:24px;text-align:center;color:var(--color-text-secondary);border:1px dashed var(--color-border);border-radius:8px;';
          empty.textContent = linkDef.emptyText || 'Không có dữ liệu phù hợp.';
          content.appendChild(empty);
        } else {
          var columns = Array.isArray(linkDef.columns) && linkDef.columns.length
            ? linkDef.columns
            : Object.keys(rows[0]).slice(0, 8);
          var wrap = document.createElement('div');
          wrap.style.cssText = 'overflow:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--color-border);border-radius:8px;';
          var table = document.createElement('table');
          table.className = 'data-table no-mobile-stack';
          table.style.cssText = 'width:100%;min-width:680px;border-collapse:collapse;font-size:13px;';
          var thead = document.createElement('thead');
          var headRow = document.createElement('tr');
          columns.forEach(function (column) {
            var definition = typeof column === 'string' ? { name: column, label: column } : column;
            var th = document.createElement('th');
            th.textContent = definition.label || definition.name;
            th.style.cssText = 'padding:10px 12px;text-align:left;white-space:nowrap;';
            headRow.appendChild(th);
          });
          if (canEdit) {
            var actionTh = document.createElement('th');
            actionTh.textContent = 'Thao tác';
            actionTh.style.cssText = 'padding:10px 12px;text-align:right;white-space:nowrap;';
            headRow.appendChild(actionTh);
          }
          thead.appendChild(headRow);
          table.appendChild(thead);

          var tbody = document.createElement('tbody');
          rows.forEach(function (record) {
            var tr = document.createElement('tr');
            columns.forEach(function (column) {
              var definition = typeof column === 'string' ? { name: column } : column;
              var td = document.createElement('td');
              var value = record && record[definition.name];
              td.textContent = value === undefined || value === null ? '' : String(value);
              td.style.cssText = 'padding:10px 12px;border-top:1px solid var(--color-border);white-space:nowrap;';
              tr.appendChild(td);
            });
            if (canEdit) {
              var actionTd = document.createElement('td');
              actionTd.style.cssText = 'padding:10px 12px;border-top:1px solid var(--color-border);white-space:nowrap;text-align:right;';
              var editButton = document.createElement('button');
              editButton.type = 'button';
              editButton.className = 'btn btn-sm btn-outline-primary';
              editButton.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">edit</span> '
                + (linkDef.editButtonTitle || 'Sửa');
              editButton.onclick = function () { navigateToTarget(record, false); };
              actionTd.appendChild(editButton);
              tr.appendChild(actionTd);
            }
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);
          wrap.appendChild(table);
          content.appendChild(wrap);
        }

        var footer = document.createElement('div');
        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn btn-outline';
        closeButton.textContent = 'Đóng';
        footer.appendChild(closeButton);
        var modal = UIModal.show({
          title: linkDef.title || 'Dữ liệu liên quan',
          width: linkDef.width || '960px',
          content: content,
          footer: footer
        });
        modalRef = modal;
        closeButton.onclick = function () { modal.close(); };
        return rows;
      }).catch(function (error) {
        if (window.Alert) {
          Alert.error('Không tải được dữ liệu', error && error.message || 'Vui lòng thử lại.');
        }
        return [];
      });
    }

    function loadJoinSchema(tabDef) {
      if (
        !tabDef
        || (tabDef.metadataMode !== 'JOIN_RESULT_SET_READONLY' && tabDef.metadataMode !== 'JOIN_RESULT_SET_EDITABLE')
        || !tabDef.joinContractKey
      ) {
        return Promise.resolve(null);
      }

      if (
        !window.FieldSyncService
        || typeof FieldSyncService.getJoinSchema !== 'function'
      ) {
        return Promise.resolve(null);
      }

      if (tabDef._joinSchemaPromise) {
        return tabDef._joinSchemaPromise;
      }

      var pending = FieldSyncService.getJoinSchema(
        moduleConfig.FormName,
        tabDef.joinContractKey,
        false
      ).catch(function (error) {
        console.warn(
          '[DynamicDetailManager] Không đọc được JOIN schema:',
          error
        );

        // Cho phép lần mở sau thử lại.
        tabDef._joinSchemaPromise = null;

        return null;
      });

      tabDef._joinSchemaPromise = pending;

      return pending;
    }

    function joinFieldsOf(schema) {
      if (
        !schema
        || !Array.isArray(schema.fields)
      ) {
        return [];
      }

      return schema.fields.filter(function (field) {
        return field
          && field.showInGrid !== false
          && field.name;
      });
    }

    function joinFieldMap(fields) {
      var map = Object.create(null);

      (fields || []).forEach(function (field) {
        map[String(field.name).toLowerCase()] = field;
      });

      return map;
    }

    function displayJoinValue(value, field) {
      if (value === undefined || value === null) return '';

      var rule = String(
        field && field.renderRule || ''
      ).toLowerCase();

      if (rule === 'boolean' || rule === 'sw') {
        return (
          value === true
          || value === 1
          || String(value) === '1'
          || String(value).toLowerCase() === 'true'
        ) ? 'Có' : 'Không';
      }

      if (_isDateLikeField(field && field.name, field)) {
        return _displayDateValue(value);
      }

      return String(value);
    }
    function load(tabDef, row) {
      var masterKey = moduleConfig.PrimaryKey;
      var parentKey = tabDef.parentField || masterKey;
      var filterKey = tabDef.filterField || masterKey;
      var filterValue = row && row[parentKey] || '';
      var filter = {};
      filter[filterKey] = filterValue;
      if (filterValue === undefined || filterValue === null || String(filterValue).trim() === '') {
        return Promise.resolve({ code: 0, records: [] });
      }
      var request = {
        List: tabDef.api,
        Func: 'View',
        Limit: 500,
        JsonData: JSON.stringify(filter),
        UserName: currentUser(),
        User: currentUser(),
        BranchID: currentBranch()
      };

      /*
       * Giữ JsonData làm contract chính, đồng thời chuyển khóa nối ở top-level
       * để tương thích các WA_API route cũ đang map trực tiếp {SapCaID}.
       */
      request[filterKey] = filter[filterKey];
      return api.post(moduleConfig.ApiSearch || gateway, request);
    }

    function renderEditableGrid(tabDef, panel, row, isViewMode) {
      panel.innerHTML = '';
      var contractFields = joinFieldMap(joinFieldsOf(panel._joinSchema));
      var wrap = document.createElement('div');
      wrap.style.cssText = 'overflow-x:auto;border:1px solid var(--color-border);border-radius:8px;margin-bottom:12px;background:var(--color-surface);';
      var table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;table-layout:auto;';
      var head = document.createElement('thead');
      var headRow = document.createElement('tr');
      headRow.style.cssText = 'background:var(--color-background);border-bottom:2px solid var(--color-border);';
      var schemaFields = joinFieldsOf(panel._joinSchema);
      var keys = (tabDef.fields && tabDef.fields.length)
        ? tabDef.fields.filter(function (key) { return !_isTechnicalKey(key); })
        : (
          schemaFields.length
            ? schemaFields.map(function (field) { return field.name; }).filter(function (key) { return !_isTechnicalKey(key); })
            : (
              panel._currentRows.length
                ? Object.keys(panel._currentRows[0]).filter(function (key) { return !_isTechnicalKey(key); })
                : []
            )
        );
      keys.forEach(function (fieldName) {
        var th = document.createElement('th');
        th.textContent = _getFieldCaption(fieldName, contractFields[String(fieldName).toLowerCase()], tabDef.headers, getDictionary);
        th.style.cssText = 'padding:10px 12px;font-weight:700;color:var(--color-text);background:var(--color-surface-elevated);text-align:left;white-space:nowrap;';
        headRow.appendChild(th);
      });
      if (!isViewMode) headRow.appendChild(document.createElement('th'));
      head.appendChild(headRow);
      table.appendChild(head);
      var body = document.createElement('tbody');
      var readonly = tabDef.readOnlyFields || [];

      panel._currentRows.forEach(function (currentRow, rowIndex) {
        var tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--color-border)';
        var cells = {};
        keys.forEach(function (fieldName) {
          var td = document.createElement('td');
          td.style.cssText = 'padding:6px 12px;vertical-align:middle;position:relative;';
          cells[fieldName] = td;
          tr.appendChild(td);
        });

        keys.forEach(function (fieldName) {
          var td = cells[fieldName];
          var contractField = contractFields[String(fieldName).toLowerCase()] || null;
          var contractCombo = window.FieldControlResolver
            && contractField
            && FieldControlResolver.createCombo(contractField, {
              formName: moduleConfig.FormName,
              detailKey: tabDef.joinContractKey,
              getValues: function () { return currentRow; },
              value: currentRow[fieldName],
              disabled: isViewMode || readonly.indexOf(fieldName) >= 0,
              placeholder: 'Chọn...',
              onSelect: function (value) {
                currentRow[fieldName] = value;
              }
            });
          if (contractCombo) {
            contractCombo.style.width = '160px';
            td.appendChild(contractCombo);
            return;
          }

          if (_detailFieldType(tabDef, fieldName, contractField) === 'boolean') {
            var checkboxWrap = document.createElement('label');
            checkboxWrap.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:36px;cursor:pointer;';
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = _isCheckedValue(currentRow[fieldName]);
            checkbox.disabled = isViewMode || readonly.indexOf(fieldName) >= 0;
            checkbox.setAttribute('aria-label', _getFieldCaption(fieldName, contractField, tabDef.headers, getDictionary));
            checkbox.onchange = function () {
              currentRow[fieldName] = checkbox.checked ? 1 : 0;
            };
            checkboxWrap.appendChild(checkbox);
            td.style.textAlign = 'center';
            td.appendChild(checkboxWrap);
            return;
          }

          var lookup = tabDef.lookupConfig && tabDef.lookupConfig[fieldName];
          if (lookup && window.UIControls && typeof UIControls.createDataComboBox === 'function') {
            var combo = UIControls.createDataComboBox({
              placeholder: 'Chọn...',
              headers: lookup.headers || ['Mã', 'Tên'],
              readonlyInput: lookup.strictSelection === true,
              colFilterIndex: lookup.displayIndex !== undefined
                ? lookup.displayIndex
                : (lookup.colFilterIndex || 0),
              forceMultiColumn: lookup.forceMultiColumn !== false,
              onSearch: function (keyword) {
                var lookupFilters = {};
                Object.keys(lookup.masterFilters || {}).forEach(function (targetField) {
                  var sourceField = lookup.masterFilters[targetField];
                  var val = masterValue(panel, row, sourceField);
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    lookupFilters[targetField] = val;
                  }
                });
                var payload = {
                  List: lookup.apiList,
                  Func: lookup.func || 'View',
                  Keyword: keyword,
                  UserName: currentUser(),
                  User: currentUser(),
                  BranchID: currentBranch()
                };
                if (Object.keys(lookupFilters).length) {
                  payload.JsonData = JSON.stringify(lookupFilters);
                  Object.assign(payload, lookupFilters);
                }
                if (lookup.payload && typeof lookup.payload === 'object') {
                  Object.assign(payload, lookup.payload);
                }
                if (typeof lookup.getPayload === 'function') Object.assign(payload, lookup.getPayload());
                return api.post(moduleConfig.ApiSearch || gateway, payload).then(function (response) {
                  var rows = recordsOf(response);
                  return {
                    headers: lookup.headers || ['Mã', 'Tên'],
                    data: rows.map(function (item) {
                      if (typeof lookup.mapData === 'function') {
                        return lookup.mapData(item, {}, true);
                      }
                      if (Array.isArray(item)) return item.slice();
                      var sourceFields = Array.isArray(lookup.sourceFields) && lookup.sourceFields.length
                        ? lookup.sourceFields
                        : (Array.isArray(lookup.valueFields) ? lookup.valueFields : []);
                      if (!sourceFields.length) {
                        var fallId = item[fieldName] || item.PersonID || item.personid || item.personID || item.ID || '';
                        var fallName = item.Name || item.PersonName || item.personname || item.personName || item.ObjectName || '';
                        return [fallId, fallName];
                      }
                      return sourceFields.map(function (sourceField) {
                        if (Array.isArray(item)) return item[sourceField] !== undefined ? item[sourceField] : '';
                        var val = item[sourceField];
                        if (val === undefined || val === null) {
                          var lk = String(sourceField).toLowerCase();
                          for (var pKey in item) {
                            if (pKey.toLowerCase() === lk) {
                              val = item[pKey];
                              break;
                            }
                          }
                        }
                        return val === undefined || val === null ? '' : val;
                      });
                    }),
                    colFilterIndex: lookup.displayIndex !== undefined
                      ? lookup.displayIndex
                      : (lookup.colFilterIndex || 0)
                  };
                });
              },
              onSelect: function (selected) {
                var valueIndex = lookup.valueIndex !== undefined
                  ? lookup.valueIndex
                  : (lookup.colFilterIndex || 0);
                var value = selected[valueIndex];
                if (
                  tabDef.duplicateField === fieldName
                  && lookup.preventDuplicates !== false
                  && panel._currentRows.some(function (candidate) {
                    return candidate !== currentRow
                      && String(candidate[fieldName] || '') === String(value || '');
                  })
                ) {
                  if (window.Alert) {
                    Alert.warning('Nhân viên đã tồn tại', 'Vui lòng chọn nhân viên khác.');
                  }
                  return;
                }
                currentRow[fieldName] = value;

                /*
                 * Ánh xạ option dạng mảng về detail row bằng metadata của
                 * lookup. Các phần tử nằm ngoài số header vẫn được giữ để
                 * điền field ẩn/read-only nhưng không hiển thị trên dropdown.
                 */
                if (Array.isArray(lookup.valueFields)) {
                  lookup.valueFields.forEach(function (targetField, index) {
                    if (
                      targetField
                      && selected[index] !== undefined
                    ) {
                      currentRow[targetField] = selected[index];
                    }
                  });
                }

                if (typeof lookup.mapData === 'function') {
                  var mapped = { _tr: tr };
                  var mapResult =
                    lookup.mapData(selected, mapped, false);

                  if (
                    mapResult
                    && !Array.isArray(mapResult)
                    && typeof mapResult === 'object'
                  ) {
                    Object.keys(mapResult).forEach(function (key) {
                      mapped[key] = mapResult[key];
                    });
                  }

                  Object.keys(mapped).forEach(function (key) { if (key !== '_tr') currentRow[key] = mapped[key]; });
                }
                renderEditableGrid(tabDef, panel, row, isViewMode);
              }
            });
            var display = combo.querySelector && combo.querySelector('input.ui-input');
            if (display) {
              display.value = lookup.displayField
                ? (currentRow[lookup.displayField] || currentRow[fieldName] || '')
                : (currentRow[fieldName] || '');
            }
            combo.style.width = '160px';
            if (isViewMode) combo.style.pointerEvents = 'none';
            td.appendChild(combo);
            return;
          }

          if (isViewMode || readonly.indexOf(fieldName) >= 0) {
            var readonlyValue = currentRow[fieldName] == null ? '' : currentRow[fieldName];
            var fieldLink = tabDef.fieldLinks && tabDef.fieldLinks[fieldName];
            if (fieldLink && readonlyValue !== '') {
              var linkedWrap = document.createElement('div');
              linkedWrap.style.cssText = 'display:flex;align-items:center;gap:6px;';
              var linkedText = document.createElement('span');
              linkedText.textContent = readonlyValue;
              var linkedButton = document.createElement('button');
              linkedButton.type = 'button';
              linkedButton.className = 'btn btn-sm btn-tool';
              linkedButton.title = fieldLink.buttonTitle || fieldLink.title || 'Xem dữ liệu liên quan';
              linkedButton.setAttribute('aria-label', linkedButton.title);
              linkedButton.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">'
                + (fieldLink.icon || 'open_in_new') + '</span>';
              linkedButton.onclick = function () {
                openLinkedRecords(fieldLink, currentRow, panel, row);
              };
              linkedWrap.appendChild(linkedText);
              linkedWrap.appendChild(linkedButton);
              td.appendChild(linkedWrap);
            } else {
              td.textContent = readonlyValue;
            }
            td.style.color = 'var(--color-text-secondary)';
            return;
          }
          var input = document.createElement('input');
          input.type = 'text';
          input.value = currentRow[fieldName] == null ? '' : currentRow[fieldName];
          input.placeholder = 'Nhập...';
          input.style.cssText = 'border:1px solid var(--color-border);border-radius:4px;padding:6px 8px;width:100%;font-size:13px;outline:none;background:var(--color-surface);';
          input.oninput = function () { currentRow[fieldName] = input.value; };
          if (tabDef.fieldEvents && tabDef.fieldEvents[fieldName] && typeof tabDef.fieldEvents[fieldName].onChange === 'function') {
            input.onchange = function () { tabDef.fieldEvents[fieldName].onChange(input.value, currentRow, row, tr); };
          }
          td.appendChild(input);
        });

        if (!isViewMode) {
          var actionCell = document.createElement('td');
          var remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'btn btn-sm btn-tool text-danger';
          remove.textContent = 'Xóa';
          remove.onclick = function () {
            var removeRow = function () {
              var detailPrimaryKey = tabDef.primaryKey || 'UserAutoID';
              if (currentRow[detailPrimaryKey]) panel._deletedRows.push(currentRow);
              panel._currentRows.splice(rowIndex, 1);
              renderEditableGrid(tabDef, panel, row, isViewMode);
              if (window.UIToast && typeof UIToast.show === 'function') {
                UIToast.show('Đã xóa dòng chi tiết thành công!', 'success');
              }
            };
            if (window.ConfirmModal && typeof ConfirmModal.show === 'function') ConfirmModal.show({ title: 'Xác nhận xóa', message: 'Bạn có chắc muốn xóa dòng này không?', onConfirm: removeRow });
            else removeRow();
          };
          actionCell.appendChild(remove);
          tr.appendChild(actionCell);
        }
        body.appendChild(tr);
      });
      table.appendChild(body);
      wrap.appendChild(table);
      panel.appendChild(wrap);

      if (!isViewMode) {
        var add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn btn-sm btn-outline-primary';
        add.textContent = 'Thêm dòng mới';
        add.onclick = function () {
          var newRow = {};
          var parentKey = tabDef.parentField || moduleConfig.PrimaryKey;
          newRow[tabDef.filterField || moduleConfig.PrimaryKey] = row && row[parentKey] || '';
          Object.keys(tabDef.defaultsFromMaster || {}).forEach(function (targetField) {
            var sourceField = tabDef.defaultsFromMaster[targetField];
            newRow[targetField] = masterValue(panel, row, sourceField);
          });
          panel._currentRows.push(newRow);
          renderEditableGrid(tabDef, panel, row, isViewMode);
        };
        panel.appendChild(add);
        (tabDef.customButtons || []).forEach(function (buttonDef) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-sm ' + (buttonDef.className || 'btn-outline-secondary');
          button.textContent = buttonDef.label || '';
          button.style.marginLeft = '10px';
          button.onclick = function () {
            if (typeof buttonDef.onClick === 'function') {
              buttonDef.onClick({
                panel: panel,
                tabDef: tabDef,
                row: row,
                MODULE_CONFIG: moduleConfig,
                renderGrid: function (nextTab, nextPanel) { renderEditableGrid(nextTab || tabDef, nextPanel || panel, row, isViewMode); }
              });
            }
          };
          panel.appendChild(button);
        });
      }
    }

    function loadTab(tabDef, panel, row, isViewMode) {
      panel._tabDef = tabDef;
      panel._initialRows = [];
      panel._currentRows = [];
      panel._deletedRows = [];
      if (!tabDef.editable) {
        panel.innerHTML =
          '<div style="color:var(--color-text-secondary);'
          + 'padding:12px;text-align:center;">'
          + 'Đang tải chi tiết...</div>';

        return Promise.all([
          load(tabDef, row),
          loadJoinSchema(tabDef)
        ]).then(function (results) {
          var response = results[0];
          var joinSchema = results[1];

          var rows = recordsOf(response);
          var schemaFields = joinFieldsOf(joinSchema);
          var schemaByName = joinFieldMap(schemaFields);

          panel._joinSchema = joinSchema || null;
          panel.innerHTML = '';

          if (!rows.length) {
            panel.innerHTML =
              '<div style="color:var(--color-text-secondary);'
              + 'padding:12px;text-align:center;">'
              + 'Không có dữ liệu</div>';

            return rows;
          }

          /*
           * Ưu tiên result-set metadata.
           * tabDef.fields tiếp tục là fallback an toàn khi metadata lỗi.
           */
          var keys = schemaFields.length
            ? schemaFields.map(function (field) { return field.name; }).filter(function (key) { return !_isTechnicalKey(key); })
            : (
              (tabDef.fields && tabDef.fields.length)
                ? tabDef.fields.filter(function (key) { return !_isTechnicalKey(key); })
                : Object.keys(rows[0]).filter(function (key) { return !_isTechnicalKey(key); })
            );

          var wrap = document.createElement('div');

          wrap.style.cssText =
            'overflow-x:auto;'
            + '-webkit-overflow-scrolling:touch;'
            + 'border:1px solid var(--color-border);'
            + 'border-radius:6px;';

          var table = document.createElement('table');

          table.style.cssText =
            'width:100%;'
            + 'border-collapse:collapse;'
            + 'font-size:12px;';

          var header = document.createElement('tr');

          keys.forEach(function (key) {
            var field =
              schemaByName[String(key).toLowerCase()]
              || null;

            var th = document.createElement('th');

            th.textContent = _getFieldCaption(key, field, tabDef.headers, getDictionary);

            th.style.cssText =
              'padding:8px 10px;'
              + 'border-bottom:2px solid var(--color-border);'
              + 'background:var(--color-surface-elevated);'
              + 'text-align:left;'
              + 'white-space:nowrap;';

            header.appendChild(th);
          });

          var thead = document.createElement('thead');
          thead.appendChild(header);
          table.appendChild(thead);

          var tbody = document.createElement('tbody');

          rows.forEach(function (record) {
            var tr = document.createElement('tr');

            keys.forEach(function (key) {
              var field =
                schemaByName[String(key).toLowerCase()]
                || null;

              var label =
                field && field.label
                  ? field.label
                  : (
                    tabDef.headers
                    && tabDef.headers[key]
                  )
                  || getDictionary()[key]
                  || key;

              var td = document.createElement('td');

              td.textContent = displayJoinValue(
                record[key],
                field
              );

              td.setAttribute('data-label', label);
              td.setAttribute('title', td.textContent);

              td.style.cssText =
                'padding:7px 10px;'
                + 'border-bottom:1px solid var(--color-border);'
                + 'white-space:nowrap;';

              tr.appendChild(td);
            });

            tbody.appendChild(tr);
          });

          table.appendChild(tbody);
          wrap.appendChild(table);
          panel.appendChild(wrap);

          return rows;
        }).catch(function (error) {
          console.error(
            '[DynamicDetailManager] Lỗi tải detail JOIN:',
            error
          );

          panel.innerHTML =
            '<div style="color:var(--color-danger);'
            + 'padding:12px;">'
            + 'Lỗi tải dữ liệu chi tiết</div>';

          return [];
        });
      }
      return Promise.all([
        load(tabDef, row),
        loadJoinSchema(tabDef)
      ]).then(function (results) {
        var response = results[0];
        var joinSchema = results[1];
        panel._joinSchema = joinSchema || null;
        panel._initialRows = JSON.parse(JSON.stringify(recordsOf(response)));
        panel._currentRows = JSON.parse(JSON.stringify(recordsOf(response)));
        renderEditableGrid(tabDef, panel, row, isViewMode);
        return panel._currentRows;
      }).catch(function (error) {
        console.error('[DynamicDetailManager] Lỗi tải editable detail tab:', error);
        panel.innerHTML = '<div style="color:var(--color-danger);padding:12px;">Lỗi tải dữ liệu chi tiết</div>';
        return [];
      });
    }

    function createWritablePayload(
      panel,
      tabDef,
      currentRow,
      masterKeyValue
    ) {
      var detailPrimaryKey =
        tabDef.primaryKey || 'UserAutoID';

      var masterField =
        tabDef.filterField
        || moduleConfig.PrimaryKey;

      /*
       * Tab legacy chưa migrate giữ nguyên cơ chế cũ.
       */
      if (
        tabDef.metadataMode !==
          'JOIN_RESULT_SET_EDITABLE'
      ) {
        var legacyPayload =
          Object.assign({}, currentRow);

        legacyPayload[masterField] =
          masterKeyValue;

        return legacyPayload;
      }

      var schema =
        panel && panel._joinSchema;

      /*
       * Editable JOIN phải fail-closed.
       * Không fallback sang payload chứa field JOIN.
       */
      if (
        !schema
        || schema.readOnly === true
        || !Array.isArray(schema.fields)
      ) {
        throw new Error(
          'Metadata editable của detail tab '
          + 'chưa sẵn sàng.'
        );
      }

      var isEdit =
        Boolean(
          currentRow[detailPrimaryKey]
        );

      var payload = {};

      schema.fields.forEach(function (field) {
        if (
          !field
          || !field.name
          || field.isPhysicalColumn !== true
          || field.isReadOnly === true
          || field.isServerManaged === true
        ) {
          return;
        }

        /*
         * PK chỉ gửi khi update.
         * Insert để DB default tự sinh UserAutoID.
         */
        if (field.isPrimaryKey === true) {
          if (
            isEdit
            && currentRow[field.name]
          ) {
            payload[field.name] =
              currentRow[field.name];
          }

          return;
        }

        var allowed =
          isEdit
            ? field.supportsUpdate === true
            : field.supportsInsert === true;

        if (!allowed) return;

        if (
          _branchPolicyOf(moduleConfig, tabDef) === 'BRANCH_SCOPED'
          && _isBranchPayloadField(field.name)
        ) {
          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            currentRow,
            field.name
          )
        ) {
          payload[field.name] =
            currentRow[field.name];
        }
      });

      /*
       * FK master lấy từ master hiện tại,
       * không tin dữ liệu cũ từ browser.
       */
      payload[masterField] =
        masterKeyValue;

      payload.IsEdit =
        isEdit ? 1 : 0;

      return payload;
    }

    function savePanels(
      panels,
      masterKeyValue
    ) {
      if (
        masterKeyValue === undefined
        || masterKeyValue === null
        || String(masterKeyValue).trim() === ''
      ) {
        return Promise.reject(
          new Error('Không thể lưu detail khi SapCaID của master còn rỗng.')
        );
      }

      var calls = [];
      var buildError = null;

      function branchContext(panel, detailRow) {
        return (
          masterValue(panel, detailRow || {}, 'BranchID')
          || (detailRow && detailRow.BranchID)
          || currentBranch()
        );
      }

      (panels || []).forEach(
        function (panel) {
          if (
            !panel
            || !panel._tabDef
            || !panel._tabDef.editable
          ) {
            return;
          }

          var tabDef =
            panel._tabDef;

          var detailPrimaryKey =
            tabDef.primaryKey
            || 'UserAutoID';

          var apiEndpoint =
            moduleConfig.ApiSave
            || gateway;

          /*
           * API_XoaDong_V2 bắt buộc Ids là JSON array.
           */
          (panel._deletedRows || [])
            .forEach(function (deleted) {
              var id =
                deleted[detailPrimaryKey];

              if (!id) return;

              var ids =
                [String(id)];

              calls.push(function () {
                return api.post(
                  apiEndpoint,
                  {
                    List:
                      tabDef.api,

                    Func:
                      'Delete',

                    /*
                     * Wire parameter @Ids.
                     */
                    Ids:
                      JSON.stringify(ids),

                    /*
                     * V2 chỉ chấp nhận JSON object.
                     */
                    JsonData:
                      JSON.stringify({
                        Ids: ids
                      }),

                    UserName:
                      currentUser(),

                    BranchID:
                      branchContext(panel, deleted)
                  }
                );
              });
            });

          (panel._currentRows || [])
            .forEach(function (currentRow) {
              var writablePayload;
              try {
                writablePayload = createWritablePayload(
                  panel,
                  tabDef,
                  currentRow,
                  masterKeyValue
                );
              } catch (error) {
                buildError = buildError || error;
                return;
              }

              calls.push(function () {
                return api.post(
                  apiEndpoint,
                  {
                    List:
                      tabDef.api,

                    Func:
                      'Save',

                    /*
                     * Không gửi PersonName/PhongBan/BranchID.
                     * Không gửi UserCreate vì V2 tự quản lý audit.
                     */
                    JsonData:
                      JSON.stringify(
                        writablePayload
                      ),

                    UserName:
                      currentUser(),

                    BranchID:
                      branchContext(panel, currentRow)
                  }
                );
              });
            });
        }
      );

      if (buildError) return Promise.reject(buildError);

      return calls.reduce(
        function (promise, call) {
          return promise.then(
            function (results) {
              return call().then(
                function (result) {
                  results.push(result);
                  return results;
                }
              );
            }
          );
        },
        Promise.resolve([])
      );
    }

    function validatePanels(panels) {
      var valid = true;
      (panels || []).some(function (panel) {
        if (!panel || !panel._tabDef || !panel._tabDef.editable) return false;
        var tabDef = panel._tabDef;
        var requiredField = tabDef.requiredField || (tabDef.fields && tabDef.fields[0]);
        var duplicateField = tabDef.duplicateField;
        var seen = {};
        return (panel._currentRows || []).some(function (row) {
          if (requiredField && (row[requiredField] === undefined || row[requiredField] === null || String(row[requiredField]).trim() === '')) {
            var requiredLabel = tabDef.headers && tabDef.headers[requiredField] || requiredField;
            if (window.Alert) Alert.warning('Thiếu thông tin', 'Vui lòng chọn/nhập đầy đủ "' + requiredLabel + '" cho tất cả các dòng ở tab "' + (tabDef.label || 'Danh sách chi tiết') + '"!');
            valid = false;
            return true;
          }
          if (duplicateField && row[duplicateField] !== undefined && row[duplicateField] !== null && String(row[duplicateField]).trim() !== '') {
            var value = String(row[duplicateField]).trim();
            if (seen[value]) {
              if (window.Alert) Alert.warning('Trùng lặp dữ liệu', 'Có dữ liệu bị chọn trùng lặp trong tab "' + (tabDef.label || 'Danh sách chi tiết') + '"!');
              valid = false;
              return true;
            }
            seen[value] = true;
          }
          return false;
        });
      });
      return valid;
    }

    return { load: load, loadTab: loadTab, renderEditableGrid: renderEditableGrid, savePanels: savePanels, validatePanels: validatePanels };
  }

  return { create: create };
})();
