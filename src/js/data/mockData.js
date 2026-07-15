/**
 * Small, non-production fixtures used only by the component gallery.
 * Runtime HR pages always load records through ApiClient/metadata.
 */
var MockData = {
  groups: [
    { id: 'G01', name: 'Admin', icon: 'shield_person', selected: true },
    { id: 'G02', name: 'Quản lý nhân sự', icon: 'manage_accounts', selected: false },
    { id: 'G03', name: 'Quản lý', icon: 'supervisor_account', selected: false },
    { id: 'G04', name: 'Kế toán', icon: 'account_balance', selected: false }
  ],
  groupDataSimple: [['G01', 'Admin'], ['G02', 'Quản lý nhân sự'], ['G03', 'Quản lý'], ['G04', 'Kế toán']],
  usersData: [
    { id: 'NV0000', name: 'Quản trị hệ thống', username: 'admin', group: 'Admin', disabled: false },
    { id: 'NV0001', name: 'Nguyễn Minh Anh', username: 'minh.anh', group: 'Quản lý nhân sự', disabled: false },
    { id: 'NV0002', name: 'Trần Quốc Bảo', username: 'quoc.bao', group: 'Kế toán', disabled: false }
  ],
  permissionModules: [
    'Hệ thống & phân quyền', 'Hồ sơ nhân viên', 'Tuyển dụng', 'Hợp đồng lao động',
    'Chấm công & ca làm', 'Nghỉ phép', 'Payroll & phụ cấp', 'Bảo hiểm', 'Báo cáo HR'
  ],
  demoEmployees: [
    ['NV0001', 'Nguyễn Minh Anh', '0909000001'],
    ['NV0002', 'Trần Quốc Bảo', '0909000002'],
    ['NV0003', 'Lê Thu Hà', '0909000003']
  ],
  demoItems: [
    ['PB01', 'Phòng Nhân sự', 'Trụ sở chính', 'Đang hoạt động'],
    ['PB02', 'Phòng Kế toán', 'Trụ sở chính', 'Đang hoạt động'],
    ['PB03', 'Phòng Kinh doanh', 'Chi nhánh A', 'Đang hoạt động']
  ],
  demoRevenue: [
    { month: 'Tháng 1', revenue: 125000000, count: 42 },
    { month: 'Tháng 2', revenue: 135000000, count: 45 },
    { month: 'Tháng 3', revenue: 142000000, count: 47 },
    { month: 'Tháng 4', revenue: 151000000, count: 49 },
    { month: 'Tháng 5', revenue: 158000000, count: 50 },
    { month: 'Tháng 6', revenue: 165000000, count: 52 }
  ],
  demoCost: [
    { id: 'PL-001', employee: 'Nguyễn Minh Anh', period: '06/2026', baseSalary: 18000000, allowance: 2000000, total: 20000000 },
    { id: 'PL-002', employee: 'Trần Quốc Bảo', period: '06/2026', baseSalary: 15000000, allowance: 1500000, total: 16500000 },
    { id: 'PL-003', employee: 'Lê Thu Hà', period: '06/2026', baseSalary: 13000000, allowance: 1000000, total: 14000000 }
  ],
  demoSurveyFactors: [
    { label: 'Đúng giờ', value: 42 }, { label: 'Chất lượng tuyển dụng', value: 28 },
    { label: 'Đào tạo', value: 18 }, { label: 'Khác', value: 12 }
  ],
  demoSurveyChannels: [
    { label: 'Cổng tuyển dụng', value: 45 }, { label: 'Giới thiệu nội bộ', value: 30 },
    { label: 'Mạng xã hội', value: 15 }, { label: 'Khác', value: 10 }
  ],
  shifts: [
    { id: 'CA-SANG', name: 'Ca sáng', start: '08:00', end: '12:00' },
    { id: 'CA-CHIEU', name: 'Ca chiều', start: '13:00', end: '17:00' }
  ],
  leaveRequests: [
    { id: 'P-001', employee: 'Nguyễn Minh Anh', type: 'Phép năm', days: 1, status: 'Đã duyệt' },
    { id: 'P-002', employee: 'Lê Thu Hà', type: 'Nghỉ ốm', days: 2, status: 'Chờ duyệt' }
  ]
};
