# Đối chiếu độ phủ tính năng HRM — Pha B

Ngày kiểm tra: 15-07-2026
Branch: `refactor/hr-cleanup`  
Merge-base với `main`: `0df51f4b288e34ee923f25df336e58a07b97eba1`  
So với `main`: ahead 2, behind 0.

## Nguồn và số liệu đã parse

- `C:\Users\Dell2026\Documents\scriptschema.sql`: UTF-16LE, 2.431.546 bytes, 31.177 dòng; 200 bảng duy nhất, 195 stored procedure, 139 view, 59 function và 1 trigger.
- `C:\Users\Dell2026\Documents\scriptdataa.sql`: UTF-16LE, 5.696.162 bytes, 22.824 dòng; 7.232 dòng `INSERT` tĩnh trước phần stored procedure.
- ERP `D:\chuyenfile\NhanSu2.zip`: chỉ đọc tên layout/report, không đọc cấu hình bí mật; 63 artifact HR duy nhất, gồm 42 form và 21 report.

| Bảng metadata | Số dòng INSERT snapshot | Khóa/kiểm tra |
|---|---:|---|
| `WA_Menu` | 58 | `MenuID` không trùng; 42 bật, 16 `isDisable=1` |
| `WA_API` | 290 | khóa nghiệp vụ `list+func`; 2 dòng trùng trong snapshot, phải báo conflict |
| `SY_FormatFields` | 909 | `FormName+FieldName` không trùng |
| `SY_FmtFldTbl` | 2.648 | dictionary legacy; migration không ghi |
| `SY_FrmLstTbl` | 0 dòng tĩnh | khóa `FormID`; form list lấy từ source registration/migration allow-list |
| `SY_FrmCfg` | 2.353 | không đưa user-specific config vào migration |
| `SY_FrmCtrTbl` | 172 | không đưa layout user-specific vào migration |
| `SY_FrmFltTbl` | 101 | chỉ dùng khi có contract form rõ ràng |
| `WA_UserGroupPermisstion` | 348 | chỉ đối chiếu; không seed quyền test |
| `SY_Menu` | 297 | hệ thống cũ; không trộn với `WA_Menu` |
| `SY_Period` | 24 | dữ liệu test; không seed release |
| `SY_User` | 13 | có mật khẩu/user; loại khỏi release |

Snapshot có 14 nhóm bảng metadata được yêu cầu đối chiếu. `SY_FrmLstTbl` không có INSERT tĩnh, vì vậy migration chỉ dùng các `TableName/PrimaryKey` đã có bằng chứng trong `sql/Insert`.

## Ma trận ERP → DB → web

`DISABLED_IN_DB` là menu có `isDisable=1`, không phải tính năng thiếu. `MISSING_FRONTEND` chỉ dùng khi DB/API đã có nhưng chưa có route/module chuyên biệt. `GENERIC_CRUD_ONLY` là route DynamicFormEngine dùng metadata chung.

| ERP artifact / FormName | WA_Menu | SY_FrmLstTbl | WA_API | SY_FormatFields | Frontend | Trạng thái |
|---|---|---|---|---|---|---|
| `HR_PersonFullFrm.dat` / `WA_PersonFullFrm` | 2010, bật, key `WA_PERSONFULLFRM` | `HR_PersonTbl/PersonID` | View/Save/Delete + tab nhân sự | 71 field | `APP_MODULES`, route `/detail`, wizard/attachment | `IMPLEMENTED` |
| `HR_HopDongLaoDongFrm.dat` / `WA_HopDongLaoDongFrm` | 2021, bật | `HR_HopDongTbl/MaHopDong` và detail/attach | CRUD + attachment | 31 field | `APP_MODULES`, export/document action | `IMPLEMENTED` |
| `HR_BaoHiemFrm.dat` / `WA_BaoHiemFrm` | 2022, bật | `HR_BaoHiemTbl/DocumentID` | CRUD, lookup, calculate | 12 field | `APP_MODULES`, lookup/calculate | `IMPLEMENTED` |
| `HR_KinhPhiCongDoanFrm.dat` / `WA_KinhPhiCongDoanFrm` | 2028, bật | `HR_KinhPhiCongDoanTbl/UserAutoID` | CRUD | 11 field | `APP_MODULES` | `IMPLEMENTED` |
| `HR_TimeSheetFrm.dat` / `WA_TimeSheetFrm` | 2102, bật | `HR_TimeSheetTbl/UserAutoID` | View + payroll process | 15 field | DynamicFormEngine, chưa có module riêng | `GENERIC_CRUD_ONLY` |
| `HR_TimeSheetCTReport.dat` / `WA_TimeSheetCTReport` | 2103, bật | `HR_TimeSheetDayTbl/_UserAutoID` | báo cáo chi tiết | 91 field | DynamicFormEngine report | `GENERIC_CRUD_ONLY` |
| `HR_TimeSheetTH2Report.dat` / `WA_TimeSheetTH2Report` | 2104, bật | `HR_TimeSheetTbl/UserAutoID` | báo cáo tổng hợp | 52 field | DynamicFormEngine report | `GENERIC_CRUD_ONLY` |
| `HR_TimeSheetDayFrm.dat` / `WA_TimeSheetDayFrm` | 2106, bật | `HR_TimeSheetDayTbl/UserAutoID` | view/process ngày | 17 field | `APP_MODULES`, nút tạo bảng công | `IMPLEMENTED` |
| `HR_CaLamViecFrm.dat` / `WA_CaLamViecFrm` | 2144, bật | `HR_SapCaTbl/SapCaID` | CRUD + detail employee | 18 field | `APP_MODULES`, action sắp ca | `IMPLEMENTED` |
| `HR_QuanLyNghiPhepNamFrm.dat` | 3001, bật | `HR_PersonTbl/PersonID` | view/save/delete + detail | 16 field | `APP_MODULES` | `IMPLEMENTED` |
| `HR_QuanLyNghiLeFrm.dat` | 3010, bật; 2040 tắt | `HR_HolidayTbl/HolidayID` | `API_QuanLyNghiLe` | 4 field | DynamicFormEngine | `GENERIC_CRUD_ONLY` |
| `WA_DonXinNghiPhepFrm` và `API_HR_NghiPhep_*` | 3030, bật | Có FormatFields/API snapshot; FormList cần migration allow-list | View/Save/Delete + chi tiết/đính kèm | 29 + 7 + 7 field | chưa có module chuyên biệt | `MISSING_FRONTEND` |
| `HR_PayrollFrm.dat` / `WA_PayrollFrm` | 2405, bật | `HR_PayrollTbl/DocumentID` | payroll view/process | 14 field | `APP_MODULES` | `IMPLEMENTED` |
| `WA_BangPhuCapFrm`, `WA_LuongKhoanFrm` | 2402/240103, bật | đã có TableName/PrimaryKey trong source | view/CRUD | 11/7 field | `APP_MODULES` | `IMPLEMENTED` |
| Danh mục phòng ban/chức vụ/ca/hình thức nghỉ/chi nhánh | 2301/2302/2305/2316/2317, bật | registration source đã xác nhận khóa | API list/CRUD | 4/2/12/3/2 field | `/categories` hoặc DynamicFormEngine | `GENERIC_CRUD_ONLY` |
| Vị trí, tổ, việc, bệnh viện, ngân hàng, quốc gia, tỉnh, dân tộc, học vấn, bằng cấp, nghề nghiệp | các menu tương ứng `isDisable=1` | có registration source | có API snapshot | có FormatFields | không mở menu runtime | `DISABLED_IN_DB` |

## Kết luận

Các tên API nghỉ phép trước đây bị đánh dấu thiếu là có thật trong snapshot: `API_HR_NghiPhep`, `API_HR_NghiPhep_ChiTiet`, `API_HR_NghiPhep_Attach` và các API file/metadata/save. Chúng hiện thiếu module frontend chuyên biệt, không thiếu DB contract. Migration chỉ thêm các row còn thiếu và báo conflict, không bật menu đang tắt.
