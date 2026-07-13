(function () {
  'use strict';

  var outputFieldMapping = {
    MucDongBHXHNLD: 'MucDongBHXHNLD',
    MucDongBHXHNSDLD: 'MucDongBHXHNSDLD',
    MucDongBHYTNLD: 'MucDongBHYTNLD',
    MucDongBHYTNSDLD: 'MucDongBHYTNSDLD',
    MucDongBHTNNLD: 'MucDongBHTNNLD',
    MucDongBHTNNSDLD: 'MucDongBHTNNSDLD'
  };

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_BaoHiemFrm',
    base: 'master-detail',
    config: {
      FormName: 'WA_BaoHiemFrm',
      PrimaryKey: 'DocumentID',
      operations: {
        list: { sp: 'WA_BaoHiemFrm', func: 'View' },
        save: { sp: 'WA_BaoHiemFrm', func: 'Save' },
        delete: { sp: 'WA_BaoHiemFrm', func: 'Delete' }
      },
      actions: {
        calculateInsurance: {
          sp: 'WA_BaoHiemFrm_Calculate',
          func: 'View',
          requiredFields: ['PeriodID', 'LoaiBaoHiem', 'MucDong'],
          outputFieldMapping: outputFieldMapping
        }
      },
      lookups: {
        branch: { sp: 'CF_BranchListFrm', func: 'View', keyField: 'BranchID' },
        employee: {
          sp: 'WA_BaoHiemFrm_PersonID',
          func: 'View',
          keyField: 'PersonID',
          requiredFields: ['BranchID', 'LoaiBaoHiem']
        }
      },
      details: {
        contributions: {
          sp: 'API_BaoHiem_Detail',
          func: 'View',
          filterField: 'DocumentID',
          rowIdField: 'UserAutoID',
          requiredFields: ['PersonID'],
          duplicateKeys: ['PersonID']
        }
      },
      UseSplitLayout: false,
      SplitLayoutSelectText: 'Vui long chon chung tu dong bao hiem de xem chi tiet',
      SplitLayoutEmptyText: 'Khong co chi tiet bao hiem cho chung tu nay',
      SplitLayoutDetailWidth: '960px',
      ModalWidth: '1020px',
      FilterKeywordLabel: 'Tim nhanh',
      SearchPlaceholder: 'Nhap so chung tu hoac ghi chu...',
      RowNameField: 'DocumentID',
      Filters: [{ id: 'BranchID', label: 'Chi nhanh', type: 'select', dataSource: 'CF_BranchListFrm' }],
      DetailTabs: [{
        code: 'contributions',
        label: 'Chi tiet dong bao hiem',
        api: 'API_BaoHiem_Detail',
        filterField: 'DocumentID',
        rowIdField: 'UserAutoID',
        requiredFields: ['PersonID'],
        duplicateKeys: ['PersonID'],
        editable: true,
        customButtons: [{
          id: 'btn-multi-select',
          label: 'Chon nhieu nhan vien',
          icon: 'checklist',
          className: 'btn-outline-success',
          onClick: InsuranceActions.selectEmployees
        }],
        fields: ['PersonID', 'PersonName', 'ChucDanhChuyenMon', 'PhongBan', 'MucDong', 'MucDongBHXHNLD', 'MucDongBHXHNSDLD', 'MucDongBHYTNLD', 'MucDongBHYTNSDLD', 'MucDongBHTNNLD', 'MucDongBHTNNSDLD', 'GhiChu'],
        lookupConfig: {
          PersonID: {
            operation: 'employee',
            apiList: 'WA_BaoHiemFrm_PersonID',
            keyField: 'PersonID',
            columns: ['STT', 'PersonID', 'PersonName', 'PhongBan', 'MucDong', 'CanhBao'],
            fieldMapping: { PersonName: 'PersonName', PhongBan: 'PhongBan', MucDong: 'MucDong' },
            headers: ['STT', 'Ma NV', 'Ho ten', 'Bo phan', 'Muc dong', 'Canh bao'],
            colFilterIndex: 1,
            getPayload: function (context) {
              return {
                BranchID: context && context.getValue ? context.getValue('BranchID') : '',
                LoaiBaoHiem: context && context.getValue ? context.getValue('LoaiBaoHiem') : '',
                DocumentID: context && context.getValue ? context.getValue('DocumentID') : ''
              };
            },
            mapData: function (data) {
              return [String(data.STT || ''), data.PersonID || '', data.PersonName || '', data.PhongBan || '', String(data.MucDong || 0), data.CanhBao || ''];
            }
          }
        },
        fieldEvents: { MucDong: { onChange: InsuranceActions.calculate } },
        headers: {
          PersonID: 'Ma nhan vien', PersonName: 'Ho ten', ChucDanhChuyenMon: 'Chuyen mon',
          PhongBan: 'Bo phan', MucDong: 'Muc dong', MucDongBHXHNLD: 'BHXH nguoi LD',
          MucDongBHXHNSDLD: 'BHXH cong ty', MucDongBHYTNLD: 'BHYT nguoi LD',
          MucDongBHYTNSDLD: 'BHYT cong ty', MucDongBHTNNLD: 'BHTN nguoi LD',
          MucDongBHTNNSDLD: 'BHTN cong ty', GhiChu: 'Ghi chu'
        }
      }]
    }
  }));
})();
