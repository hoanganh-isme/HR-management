(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_HopDongLaoDongFrm',
    base: 'approval-document',
    config: {
      FormName: 'WA_HopDongLaoDongFrm',
      PrimaryKey: 'MaHopDong',
      operations: {
        list: { sp: 'WA_HopDongLaoDongFrm', func: 'View' },
        save: { sp: 'WA_HopDongLaoDongFrm', func: 'Save' },
        delete: { sp: 'WA_HopDongLaoDongFrm', func: 'Delete' }
      },
      actions: {},
      lookups: {
        allowance: {
          sp: 'WA_BangPhuCapFrm',
          func: 'View',
          keyField: 'MaPhuCap',
          fieldMapping: {
            MaPhuCap: 'MaPhuCap', TenPhuCap: 'TenPhuCap', TienPhuCap: 'TienPhuCap',
            TienPhuCapNgay: 'TienPhuCapNgay', TienPhuCapThang: 'TienPhuCapThang', GhiChu: 'GhiChu'
          }
        }
      },
      details: {
        allowances: {
          sp: 'API_HopDongLaoDong_ChiTiet', func: 'View', filterField: 'MaHopDong',
          rowIdField: 'UserAutoID', requiredFields: ['MaPhuCap'], duplicateKeys: ['MaPhuCap']
        }
      },
      attachments: {
        contract: {
          sp: 'API_HopDongLaoDong_Attach',
          metadataApi: 'API_HopDongLaoDong_Attach_Metadata',
          fileApi: 'API_HopDongLaoDong_Attach_File',
          ownerField: 'MaHopDong', rowIdField: 'UserAutoID'
        }
      },
      UseSplitLayout: false,
      ModalWidth: '1020px',
      FilterKeywordLabel: 'Tim nhanh',
      SearchPlaceholder: 'Tìm nhanh...',
      AllowDblClickToView: true,
      HideDetailTabsInModal: false,
      HideBulkAddBtn: true,
      RowNameField: 'MaHopDong',
      Filters: [
        { id: 'NamLap', label: 'Nam lap', type: 'select', dataSource: 'API_HopDongLaoDong_NamLap' },
        { id: 'BranchID', label: 'Chi nhanh', type: 'select', dataSource: 'CF_BranchListFrm' },
        { id: 'LoaiHD', label: 'Loai HD', type: 'select', dataSource: 'API_HopDongLaoDong_LoaiHD' }
      ],
      fieldOverrides: { PersonStatus: { renderRule: 'sl', dataSource: 'API_ComboPersonStatus' } },
      DetailTabs: [
        {
          code: 'allowances', label: 'Phu cap trong hop dong', api: 'API_HopDongLaoDong_ChiTiet',
          filterField: 'MaHopDong', rowIdField: 'UserAutoID', requiredFields: ['MaPhuCap'],
          duplicateKeys: ['MaPhuCap'], editable: true,
          customButtons: [{
            id: 'btn-multi-select-phucap', label: 'Chon nhieu phu cap', icon: 'checklist',
            className: 'btn-outline-success', onClick: EmploymentContractActions.selectAllowances
          }],
          fields: ['MaPhuCap', 'TenPhuCap', 'TienPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang', 'GhiChu'],
          lookupConfig: {
            MaPhuCap: {
              operation: 'allowance', apiList: 'WA_BangPhuCapFrm', keyField: 'MaPhuCap',
              columns: ['MaPhuCap', 'TenPhuCap', 'TienPhuCapNgay', 'TienPhuCapThang'],
              headers: ['Ma PC', 'Ten phu cap', 'PC ngay', 'PC thang'], colFilterIndex: 0,
              fieldMapping: { TenPhuCap: 'TenPhuCap', TienPhuCapNgay: 'TienPhuCapNgay', TienPhuCapThang: 'TienPhuCapThang', TienPhuCap: 'TienPhuCap' }
            }
          },
          headers: {
            MaPhuCap: 'Ma phu cap', TenPhuCap: 'Ten phu cap', TienPhuCap: 'Tien phu cap',
            TienPhuCapNgay: 'PC theo ngay', TienPhuCapThang: 'PC theo thang', GhiChu: 'Ghi chu'
          }
        },
        {
          code: 'attachments', label: 'Tai lieu dinh kem', type: 'attachments', api: 'API_HopDongLaoDong_Attach',
          filterField: 'MaHopDong', ownerField: 'MaHopDong', rowIdField: 'UserAutoID',
          fields: ['FileName', 'FileType', 'STT', 'FileSize'],
          headers: { FileName: 'Ten tep', FileType: 'Loai tep', STT: 'So thu tu', FileSize: 'Kich thuoc' }
        }
      ]
    }
  }));
})();
