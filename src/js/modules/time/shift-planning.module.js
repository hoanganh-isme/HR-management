(function () {
  'use strict';

  ModuleRegistry.register(ModuleDefinition.create({
    id: 'WA_CaLamViecFrm',
    base: 'master-detail',
    config: {
      FormName: 'WA_CaLamViecFrm',
      PrimaryKey: 'SapCaID',
      operations: {
        list: { sp: 'WA_CaLamViecFrm', func: 'View' },
        save: { sp: 'WA_CaLamViecFrm', func: 'Save' },
        delete: { sp: 'WA_CaLamViecFrm', func: 'Delete' }
      },
      actions: {
        autoAssign: {
          sp: 'HR_CaLamViec_SapCaStp', func: 'View', endpoint: '/api/HR_CaLamViec_SapCaStp',
          transport: 'direct', requiredFields: ['SapCaID']
        }
      },
      lookups: {
        employee: { sp: 'HR_PersonTbl', func: 'View', keyField: 'PersonID' }
      },
      details: {
        employees: {
          sp: 'API_CaLamViec_NhanVien', func: 'View', filterField: 'SapCaID',
          rowIdField: 'UserAutoID', requiredFields: ['PersonID'], duplicateKeys: ['PersonID']
        },
        schedule: { sp: 'API_CaLamViec_ChiTiet', func: 'View', filterField: 'SapCaID', rowIdField: 'UserAutoID' }
      },
      ModalWidth: '860px',
      customFooterButtons: [{
        label: 'Sap ca tu dong', icon: 'auto_fix_high', className: 'btn-outline-primary', onClick: ShiftActions.autoAssign
      }],
      DetailTabs: [
        {
          code: 'employees', label: 'Nhan vien', api: 'API_CaLamViec_NhanVien', filterField: 'SapCaID',
          rowIdField: 'UserAutoID', requiredFields: ['PersonID'], duplicateKeys: ['PersonID'], editable: true,
          customButtons: [{
            id: 'btn-chon-nhanvien', label: 'Chon nhieu nhan vien', icon: 'group_add',
            className: 'btn-outline-success', onClick: ShiftActions.selectEmployees
          }],
          lookupConfig: {
            PersonID: {
              operation: 'employee', apiList: 'HR_PersonTbl', keyField: 'PersonID',
              columns: ['PersonID', 'PersonName', 'PhongBan', 'TitleName'],
              headers: ['Ma NV', 'Ho ten', 'Bo phan', 'Chuc vu'], colFilterIndex: 0,
              fieldMapping: { PersonName: 'PersonName', PhongBan: 'PhongBan', TitleName: 'TitleName' }
            }
          },
          fields: ['PersonID', 'PersonName', 'PhongBan', 'GhiChu'],
          headers: { PersonID: 'Ma nhan vien', PersonName: 'Ho ten', PhongBan: 'Bo phan', GhiChu: 'Ghi chu' }
        },
        {
          code: 'schedule', label: 'Bang ca chi tiet', api: 'API_CaLamViec_ChiTiet', filterField: 'SapCaID',
          fields: ['PersonID', 'PersonName', 'NgayLamViec', 'ShiftID', 'ShiftName', 'TrangThaiThucTe'],
          headers: { PersonID: 'Ma NV', PersonName: 'Ho ten', NgayLamViec: 'Ngay lam viec', ShiftID: 'Ca', ShiftName: 'Ten ca', TrangThaiThucTe: 'Trang thai' }
        }
      ],
      FormFields: [
        { name: 'TenBangCa', position: 'grid|4' }, { name: 'SapCaID', position: 'grid|4' },
        { name: 'TuNgay', position: 'grid|6' }, { name: 'DenNgay', position: 'grid|6' },
        { name: 'Thu2', position: 'grid|1-7' }, { name: 'Thu3', position: 'grid|1-7' },
        { name: 'Thu4', position: 'grid|1-7' }, { name: 'Thu5', position: 'grid|1-7' },
        { name: 'Thu6', position: 'grid|1-7' }, { name: 'Thu7', position: 'grid|1-7' },
        { name: 'ChuNhat', position: 'grid|1-7' }, { name: 'ShiftIDThu2', position: 'grid|1-7' },
        { name: 'ShiftIDThu3', position: 'grid|1-7' }, { name: 'ShiftIDThu4', position: 'grid|1-7' },
        { name: 'ShiftIDThu5', position: 'grid|1-7' }, { name: 'ShiftIDThu6', position: 'grid|1-7' },
        { name: 'ShiftIDThu7', position: 'grid|1-7' }, { name: 'ShiftIDChuNhat', position: 'grid|1-7' }
      ]
    }
  }));
})();
