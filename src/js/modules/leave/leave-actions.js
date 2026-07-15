(function () {
  'use strict';

  // Định nghĩa các actions cho module Nghỉ Phép
  window.LeaveActions = {
    approveLeave: function (formName, getSelectedData, config, reloadCallback) {
      var selected = getSelectedData();
      if (!selected || selected.length === 0) {
        if (typeof Notification !== 'undefined') {
          Notification.warning('Vui lòng chọn đơn xin nghỉ phép cần duyệt.');
        } else {
          alert('Vui lòng chọn đơn xin nghỉ phép cần duyệt.');
        }
        return;
      }
      var row = selected[0]; // Chỉ hỗ trợ duyệt 1 đơn mỗi lần (hoặc có thể viết lặp qua)
      var docId = row.DocumentID;
      var personId = row.PersonID;
      if (!docId) {
        alert('Đơn xin nghỉ phép không hợp lệ (thiếu DocumentID).');
        return;
      }

      var statuses = [
        { id: 8, label: 'Duyệt', color: '#10b981' }, // Green
        { id: 6, label: 'Không duyệt', color: '#ef4444' }, // Red
        { id: 0, label: 'Chờ duyệt', color: '#f59e0b' } // Orange
      ];

      var e = window.event;
      if (e && e.type === 'click' && typeof UIContextMenu !== 'undefined') {
        var menuItems = statuses.map(function(s) {
          return {
            label: '<div style="display:inline-block; width:14px; height:14px; background-color:' + s.color + '; margin-right:8px; vertical-align:middle; border-radius:2px;"></div>' + s.label,
            onClick: function() {
              _doApprove(docId, s.id, personId);
            }
          };
        });
        UIContextMenu.show(e, menuItems);
      } else {
        // Fallback
        var statusId = prompt('Nhập mã trạng thái cần chuyển (Ví dụ: 8 - Duyệt, 6 - Từ chối):', '8');
        if (statusId) _doApprove(docId, parseInt(statusId, 10), personId);
      }

      function _doApprove(doc, st, per) {
        var param = { DocumentID: doc, StatusID: st, PersonID: per };
        if (typeof GatewayClient !== 'undefined') {
          GatewayClient.run({ sp: 'HR_TuDongTruPhepStp', func: 'View' }, param).then(function (res) {
            if (res && res.code === 0) {
              if (typeof Notification !== 'undefined') Notification.success(res.msg || 'Chuyển trạng thái thành công.');
              if (typeof reloadCallback === 'function') reloadCallback();
            } else {
              var msg = res && res.msg ? res.msg : 'Có lỗi xảy ra khi duyệt đơn.';
              if (typeof Notification !== 'undefined') Notification.error(msg);
              else alert(msg);
            }
          }).catch(function (err) {
            var errorMsg = err.message || err.msg || 'Lỗi hệ thống khi gọi SP';
            if (typeof Notification !== 'undefined') Notification.error(errorMsg);
            else alert(errorMsg);
          });
        }
      }
    },
    approveLeaveFromEdit: function (ctx) {
      // ctx.row contains the master row from DynamicFormEngine
      var row = ctx.row || {};
      var docId = row.DocumentID;
      var personId = row.PersonID;
      if (!docId) {
        alert('Đơn xin nghỉ phép không hợp lệ (thiếu DocumentID). Vui lòng lưu Đơn trước khi duyệt.');
        return;
      }

      var statuses = [
        { id: 8, label: 'Duyệt', color: '#10b981' }, // Green
        { id: 6, label: 'Không duyệt', color: '#ef4444' }, // Red
        { id: 0, label: 'Chờ duyệt', color: '#f59e0b' } // Orange
      ];

      var btn = ctx.compatibility ? ctx.compatibility.button : null;
      var triggerEvent = window.event || { currentTarget: btn, preventDefault: function(){}, stopPropagation: function(){} };
      
      if (typeof UIContextMenu !== 'undefined') {
        var menuItems = statuses.map(function(s) {
          return {
            label: '<div style="display:inline-block; width:14px; height:14px; background-color:' + s.color + '; margin-right:8px; vertical-align:middle; border-radius:2px;"></div>' + s.label,
            onClick: function() {
              _doApprove(docId, s.id, personId);
            }
          };
        });
        UIContextMenu.show(triggerEvent, menuItems);
      } else {
        // Fallback for unexpected cases
        var statusId = prompt('Nhập mã trạng thái cần chuyển (Ví dụ: 8 - Duyệt, 6 - Từ chối):', '8');
        if (statusId) _doApprove(docId, parseInt(statusId, 10), personId);
      }

      function _doApprove(doc, st, per) {
        var param = { DocumentID: doc, StatusID: st, PersonID: per };
        if (typeof GatewayClient !== 'undefined') {
          GatewayClient.run({ sp: 'HR_TuDongTruPhepStp', func: 'View' }, param).then(function (res) {
            if (res && res.code === 0) {
              if (typeof Notification !== 'undefined') Notification.success(res.msg || 'Chuyển trạng thái thành công.');
            } else {
              var msg = res && res.msg ? res.msg : 'Có lỗi xảy ra khi duyệt đơn.';
              if (typeof Notification !== 'undefined') Notification.error(msg);
              else alert(msg);
            }
          }).catch(function (err) {
            var errorMsg = err.message || err.msg || 'Lỗi hệ thống khi gọi SP';
            if (typeof Notification !== 'undefined') Notification.error(errorMsg);
            else alert(errorMsg);
          });
        }
      }
    }
  };

  // Đăng ký Plugin cho Toolbar của Grid chính
  window.FormActionPlugins = window.FormActionPlugins || [];
  window.FormActionPlugins.push({
    getExtraButtons: function (formName, getSelectedData, config, reloadCallback) {
      if (formName === 'WA_DonXinNghiPhepFrm') {
        return [
          {
            id: 'btn-approve-leave',
            label: 'Chuyển trạng thái',
            icon: 'verified', // icon material-symbols
            className: 'btn-primary',
            onClick: function () {
              window.LeaveActions.approveLeave(formName, getSelectedData, config, reloadCallback);
            }
          }
        ];
      }
      return [];
    }
  });

})();
