/** Detail tabs: loading, editable grid lifecycle and detail persistence. */
window.DynamicDetailManager = (function () {
  function recordsOf(response) {
    return response ? (response.list || response.records || response.data || (Array.isArray(response) ? response : [])) : [];
  }

  function codeOf(response) {
    return response && (response.code !== undefined ? response.code : response.Code);
  }

  function create(options) {
    var moduleConfig = options.moduleConfig || {};
    var api = options.apiClient || window.ApiClient;
    var gateway = moduleConfig.apiGateway || AppConfig.apiGateway;
    var currentUser = options.currentUser || function () { return window.AppSession ? AppSession.getUserName() : ''; };
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

      return String(value);
    }
    function load(tabDef, row) {
      var masterKey = moduleConfig.PrimaryKey;
      var filterKey = tabDef.filterField || masterKey;
      var filter = {};
      filter[filterKey] = row && row[masterKey] || '';
      return api.post(moduleConfig.ApiSearch || gateway, { List: tabDef.api, Func: 'View', Limit: 500, JsonData: JSON.stringify(filter) });
    }

    function renderEditableGrid(tabDef, panel, row, isViewMode) {
      panel.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.style.cssText = 'overflow-x:auto;border:1px solid var(--color-border);border-radius:8px;margin-bottom:12px;background:var(--color-surface);';
      var table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;table-layout:auto;';
      var head = document.createElement('thead');
      var headRow = document.createElement('tr');
      headRow.style.cssText = 'background:var(--color-background);border-bottom:2px solid var(--color-border);';
      var keys = tabDef.fields || [];
      keys.forEach(function (fieldName) {
        var th = document.createElement('th');
        th.textContent = (tabDef.headers && tabDef.headers[fieldName]) || getDictionary()[fieldName] || fieldName;
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
          var lookup = tabDef.lookupConfig && tabDef.lookupConfig[fieldName];
          if (lookup && window.UIControls && typeof UIControls.createDataComboBox === 'function') {
            var combo = UIControls.createDataComboBox({
              placeholder: 'Chọn...',
              headers: lookup.headers || ['Mã', 'Tên'],
              colFilterIndex: lookup.colFilterIndex || 0,
              forceMultiColumn: lookup.forceMultiColumn !== false,
              onSearch: function (keyword) {
                var payload = { List: lookup.apiList, Func: 'View', Keyword: keyword };
                if (typeof lookup.getPayload === 'function') Object.assign(payload, lookup.getPayload());
                return api.post(moduleConfig.ApiSearch || gateway, payload).then(function (response) {
                  var rows = recordsOf(response);
                  return {
                    headers: lookup.headers || ['Mã', 'Tên'],
                    data: rows.map(function (item) {
                      return typeof lookup.mapData === 'function' ? lookup.mapData(item, {}, true) : [item[fieldName] || '', item.Name || item.PersonName || ''];
                    }),
                    colFilterIndex: lookup.colFilterIndex || 0
                  };
                });
              },
              onSelect: function (selected) {
                var value = selected[lookup.colFilterIndex || 0];
                currentRow[fieldName] = value;
                if (typeof lookup.mapData === 'function') {
                  var mapped = { _tr: tr };
                  lookup.mapData(selected, mapped, false);
                  Object.keys(mapped).forEach(function (key) { if (key !== '_tr') currentRow[key] = mapped[key]; });
                }
                renderEditableGrid(tabDef, panel, row, isViewMode);
              }
            });
            var display = combo.querySelector && combo.querySelector('input.ui-input');
            if (display) display.value = currentRow[fieldName] || '';
            combo.style.width = '160px';
            if (isViewMode) combo.style.pointerEvents = 'none';
            td.appendChild(combo);
            return;
          }

          if (isViewMode || readonly.indexOf(fieldName) >= 0) {
            td.textContent = currentRow[fieldName] == null ? '' : currentRow[fieldName];
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
          newRow[tabDef.filterField || moduleConfig.PrimaryKey] = row && row[moduleConfig.PrimaryKey] || '';
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
            ? schemaFields.map(function (field) {
              return field.name;
            })
            : (
              tabDef.fields
              || Object.keys(rows[0]).filter(
                function (key) {
                  return key.charAt(0) !== '_';
                }
              )
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

            th.textContent =
              field && field.label
                ? field.label
                : (
                  tabDef.headers
                  && tabDef.headers[key]
                )
                || getDictionary()[key]
                || key;

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
      var calls = [];

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
                      currentBranch()
                  }
                );
              });
            });

          (panel._currentRows || [])
            .forEach(function (currentRow) {
              var writablePayload =
                createWritablePayload(
                  panel,
                  tabDef,
                  currentRow,
                  masterKeyValue
                );

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
                      currentBranch()
                  }
                );
              });
            });
        }
      );

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
