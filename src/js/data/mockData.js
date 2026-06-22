/**
 * Mock Data
 * Dữ liệu mẫu dùng chung cho toàn bộ hệ thống trong lúc chờ tích hợp API thật
 */
var MockData = {
  // Dữ liệu Nhóm Quyền & Người dùng 
  groups: [
    { id: 'G01', name: 'Admin', icon: 'shield_person', selected: true },
    { id: 'G02', name: 'Quản lý', icon: 'manage_accounts', selected: false },
    { id: 'G03', name: 'Nhân viên lễ tân', icon: 'support_agent', selected: false },
    { id: 'G04', name: 'Kế toán', icon: 'account_balance', selected: false },
    { id: 'G05', name: 'Bếp trưởng', icon: 'restaurant_menu', selected: false }
  ],
  groupDataSimple: [
    ['G01', 'Admin'],
    ['G02', 'Quản lý'],
    ['G03', 'Nhân viên lễ tân'],
    ['G04', 'Kế toán'],
    ['G05', 'Bếp trưởng']
  ],
  usersData: [
    { id: 'NV0000', name: 'Trương Nguyễn Administrator', username: 'admin', group: 'Admin', disabled: false },
    { id: 'NV0001', name: 'Trương Du Kỳ', username: 'duky123', group: 'Quản lý', disabled: false },
    { id: 'NV0002', name: 'Triệu Quách Minh', username: 'minh.trieu', group: 'Nhân viên lễ tân', disabled: true },
    { id: 'NV0003', name: 'Châu Chỉ Nhược', username: 'nhuoc.cc', group: 'Kế toán', disabled: false }
  ],

  // Dữ liệu Phân quyền
  permissionModules: [
    'Hệ thống (Tài khoản & Phân quyền)',
    'Danh mục Hàng hóa',
    'Danh mục Khách hàng',
    'Phiếu Khách Tham Quan',
    'Biên nhận Cọc chỗ',
    'Hợp đồng Tiệc',
    'Thông tin Bổ sung Tiệc',
    'Quyết toán Tiệc',
    'Báo cáo Doanh thu',
    'Báo cáo Kho'
  ],

  // Dữ liệu Demo (Hàng hóa, Nhân sự)
  demoEmployees: [
    ['NV0000', 'Administrator', '0909123456'],
    ['NV0001', 'Trương Du Kỳ', '123456789'],
    ['NV0002', 'Triệu Minh', '23654789']
  ],
  demoItems: [
    ['CO-FAN-CAM-1-300', 'Coca++Fanta-Cam-chai-300', 'K24', 24, 150, 0, '3,600'],
    ['PE-7UP-ZZZ-1-285', 'Pepsi++7up-chai-285', 'K24', 24, '1,000', 5, '24,005'],
    ['SG-BIA-EXP-1-355', 'Sài gòn++Export-chai-355', 'K20', 20, '2,935', 10, '58,710'],
    ['SG-BIA-LAG-1-450', 'Sài gòn++Lager beer-chai', 'K20', 20, 300, 0, '6,000'],
    ['A4', 'Giấy A4', 'KG', 1, '', '', ''],
    ['A55', 'Giấy A55', 'KG', 1, '', '', '']
  ],

  // Dữ liệu Demo Báo cáo Doanh thu (12 tháng)
  demoRevenue: [
    { month: 'Tháng 1', revenue: 125000000, count: 5 },
    { month: 'Tháng 2', revenue: 85000000, count: 3 },
    { month: 'Tháng 3', revenue: 210000000, count: 8 },
    { month: 'Tháng 4', revenue: 150000000, count: 6 },
    { month: 'Tháng 5', revenue: 320000000, count: 12 },
    { month: 'Tháng 6', revenue: 280000000, count: 10 },
    { month: 'Tháng 7', revenue: 190000000, count: 7 },
    { month: 'Tháng 8', revenue: 160000000, count: 5 },
    { month: 'Tháng 9', revenue: 410000000, count: 15 },
    { month: 'Tháng 10', revenue: 550000000, count: 20 },
    { month: 'Tháng 11', revenue: 620000000, count: 22 },
    { month: 'Tháng 12', revenue: 750000000, count: 28 }
  ],

  // Dữ liệu Demo Chi phí
  demoCost: [
    { id: 'HD001', customer: 'Nguyễn Văn A', date: '25/11/2026', foodCost: 50000000, serviceCost: 10000000, staffCost: 5000000, totalCost: 65000000 },
    { id: 'HD002', customer: 'Trần Thị B', date: '28/11/2026', foodCost: 30000000, serviceCost: 5000000, staffCost: 3000000, totalCost: 38000000 },
    { id: 'HD003', customer: 'Lê C', date: '02/12/2026', foodCost: 80000000, serviceCost: 15000000, staffCost: 8000000, totalCost: 103000000 }
  ],

  // Dữ liệu Demo Khảo sát - Yếu tố đặt tiệc
  demoSurveyFactors: [
    { label: 'Không gian sảnh', value: 35 },
    { label: 'Thực đơn ngon', value: 25 },
    { label: 'Giá cả hợp lý', value: 20 },
    { label: 'Khuyến mãi tốt', value: 15 },
    { label: 'Phục vụ', value: 5 }
  ],

  // Dữ liệu Demo Khảo sát - Kênh thông tin
  demoSurveyChannels: [
    { label: 'Facebook', value: 45 },
    { label: 'Người quen giới thiệu', value: 30 },
    { label: 'Tiktok', value: 15 },
    { label: 'Website', value: 10 }
  ],

  // Dữ liệu Demo Khách Hàng (Hồ sơ)
  khachHang: [
    { id: 1, MaKH: 'KH2026-001', TenKhach: 'Nguyễn Văn A - Lê Thị B', DienThoai: '0909123456', Email: 'a.b@gmail.com', DiaChi: 'Quận 1, TP.HCM', SoLanThamQuan: 2, SoHopDong: 1 },
    { id: 2, MaKH: 'KH2026-002', TenKhach: 'Trần Hữu C - Đinh Bích D', DienThoai: '0988765432', Email: 'c.d@gmail.com', DiaChi: 'Quận 3, TP.HCM', SoLanThamQuan: 1, SoHopDong: 1 },
    { id: 3, MaKH: 'KH2026-003', TenKhach: 'Hoàng Hữu E - Ngô F', DienThoai: '0912345678', Email: 'e.f@gmail.com', DiaChi: 'Quận 7, TP.HCM', SoLanThamQuan: 3, SoHopDong: 2 },
    { id: 4, MaKH: 'KH2026-004', TenKhach: 'Lý Mạc Sầu', DienThoai: '0944555666', Email: 'sau.lm@gmail.com', DiaChi: 'Bình Thạnh, TP.HCM', SoLanThamQuan: 1, SoHopDong: 1 },
    { id: 5, MaKH: 'KH2026-005', TenKhach: 'Lệnh Hồ Xung - Nhậm Doanh Doanh', DienThoai: '0933444555', Email: 'xung.doanh@gmail.com', DiaChi: 'Tân Bình, TP.HCM', SoLanThamQuan: 4, SoHopDong: 1 }
  ],

  // Dữ liệu Demo Sảnh Tiệc
  sanhTiec: [
    { id: 'S01', name: 'Diamond Hall', status: 'TRONG', capacity: 60 },
    { id: 'S02', name: 'Ruby Hall', status: 'DA_COC', capacity: 40, customer: 'Trần Hữu C', session: 'Trưa' },
    { id: 'S03', name: 'Sapphire Hall', status: 'DA_KY', capacity: 50, customer: 'Hoàng Hữu E', session: 'Tối' },
    { id: 'S04', name: 'Emerald Hall', status: 'TRONG', capacity: 35 },
    { id: 'S05', name: 'Gold Hall', status: 'BAO_TRI', capacity: 45 },
    { id: 'S06', name: 'Silver Hall', status: 'DA_KY', capacity: 30, customer: 'Lý Mạc Sầu', session: 'Trưa' }
  ],

  // Dữ liệu Demo Nhân sự phục vụ
  nhanVienPhucVu: [
    { id: 1, MaNV: 'PV001', HoTen: 'Nguyễn Văn Tèo', GioiTinh: 'Nam', DienThoai: '0901234567', LoaiHopDong: 'Thời vụ', MucLuong: 200000, DanhGia: '8.5' },
    { id: 2, MaNV: 'PV002', HoTen: 'Trần Thị Nở', GioiTinh: 'Nữ', DienThoai: '0912345678', LoaiHopDong: 'Bán thời gian', MucLuong: 4000000, DanhGia: '9.0' },
    { id: 3, MaNV: 'PV003', HoTen: 'Lê Chí Phèo', GioiTinh: 'Nam', DienThoai: '0923456789', LoaiHopDong: 'Fulltime', MucLuong: 6000000, DanhGia: '7.5' },
    { id: 4, MaNV: 'PV004', HoTen: 'Thị Kính', GioiTinh: 'Nữ', DienThoai: '0988888888', LoaiHopDong: 'Thời vụ', MucLuong: 250000, DanhGia: '9.5' },
    { id: 5, MaNV: 'PV005', HoTen: 'Lý Thông', GioiTinh: 'Nam', DienThoai: '0977665544', LoaiHopDong: 'Fulltime', MucLuong: 6500000, DanhGia: '6.0' }
  ]
};
