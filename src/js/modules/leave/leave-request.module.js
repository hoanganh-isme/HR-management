(function () {
  ModuleRegistry.register({
    id: 'WA_DonXinNghiPhepFrm',
    base: 'master-detail',
    config: {
      FormName: 'WA_DonXinNghiPhepFrm',
      details: {
        leaveDays: {
          sp: 'API_HR_NghiPhep_ChiTiet',
          func: 'View',
          filterField: 'DocumentID',
          rowIdField: 'DetailID'
        }
      },
      attachments: {
        leave: {
          sp: 'API_HR_NghiPhep_Attach',
          metadataApi: 'API_HR_NghiPhep_Attach_Metadata',
          fileApi: 'API_HR_NghiPhep_Attach_File',
          ownerField: 'DocumentID', rowIdField: 'UserAutoID'
        }
      },
      DetailTabs: [
        {
          code: 'leaveDays',
          label: 'Chi tiết ngày nghỉ',
          api: 'API_HR_NghiPhep_ChiTiet',
          filterField: 'DocumentID',
          rowIdField: 'DetailID',
          editable: true,
          customButtons: [{
            id: 'btn-approve-leave-tab', label: 'Chuyển trạng thái (Duyệt)', icon: 'verified',
            className: 'btn-primary', onClick: function(ctx) {
              if (window.LeaveActions && window.LeaveActions.approveLeaveFromEdit) {
                window.LeaveActions.approveLeaveFromEdit(ctx);
              } else {
                alert('Chưa tải xong LeaveActions!');
              }
            }
          }],
          fields: ['HinhThucNghi', 'NghiTuNgay', 'DenNgay', 'SoNgayNghi', 'Notes'],
          lookupConfig: {
            HinhThucNghi: {
              operation: 'hinhThucNghi', apiList: 'WA_HinhThucNghiListFrm', keyField: 'HinhThucNghi',
              columns: ['HinhThucNghi', 'TenHinhThucNghi'],
              headers: ['Mã loại', 'Tên hình thức nghỉ'], colFilterIndex: 0,
              fieldMapping: { HinhThucNghi: 'HinhThucNghi' }
            }
          }
        },
        {
          code: 'attachments', label: 'Tài liệu đính kèm', type: 'attachments', api: 'API_HR_NghiPhep_Attach',
          filterField: 'DocumentID', ownerField: 'DocumentID', rowIdField: 'UserAutoID',
          metadataApi: 'API_HR_NghiPhep_Attach_Metadata',
          fileApi: 'API_HR_NghiPhep_Attach_File',
          saveApi: 'API_HR_NghiPhep_Attach_Save',
          editable: true,
          fields: ['FileName', 'FileType', 'STT', 'FileSize'],
          headers: { FileName: 'Tên tệp', FileType: 'Loại tệp', STT: 'Số thứ tự', FileSize: 'Kích thước' }
        }
      ]
    }
  });
})();
