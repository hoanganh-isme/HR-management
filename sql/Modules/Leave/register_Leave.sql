SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.API_DangKyFormWeb', 'P') IS NULL
        THROW 51700, 'Chua cai dat API_DangKyFormWeb.', 1;

    IF OBJECT_ID('dbo.API_QuanLyNghiPhepNam', 'P') IS NULL
        THROW 51701, 'Chua cai dat API_QuanLyNghiPhepNam.', 1;

    IF OBJECT_ID('dbo.API_QuanLyNghiPhepNam_ChiTiet', 'P') IS NULL
        THROW 51702, 'Chua cai dat API_QuanLyNghiPhepNam_ChiTiet.', 1;

    -- Form menu chinh: CRUD truc tiep bang khai bao phep nam.
    EXEC dbo.API_DangKyFormWeb
        @FormName = 'WA_QuanLyNghiPhepNamFrm',
        @TableName = 'HR_PersonNghiPhepTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Quản lý nghỉ phép năm',
        @CaptionEN = N'Annual Leave Management',
        @FormType = 'EDIT',
        @OperationProfile = 'CRUD',
        @ViewProcedure = 'API_QuanLyNghiPhepNam',
        @ViewParameters = N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}'', @PhongBan=N''{PhongBan}'', @PersonName=N''{PersonName}'', @Nam=N''{Nam}''',
        @Overrides = N'[
          {"field":"UserAutoID","captionVN":"Mã hệ thống","captionEN":"System ID","position":"grid","orderNo":99,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"PersonID","captionVN":"Mã nhân viên","captionEN":"Employee ID","formatId":"sl","dataSource":"WA_PersonFullFrm|4","position":"grid","orderNo":1,"required":true,"readOnlyAdd":false,"readOnlyEdit":true,"showInFilter":true},
          {"field":"PersonName","captionVN":"Họ tên","captionEN":"Full Name","position":"grid","orderNo":2,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true,"showInFilter":true},
          {"field":"PhongBan","captionVN":"Bộ phận","captionEN":"Department","position":"grid","orderNo":3,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true,"showInFilter":true},
          {"field":"BranchID","captionVN":"Chi nhánh","captionEN":"Branch","position":"grid","orderNo":4,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true,"showInFilter":true},
          {"field":"Nam","captionVN":"Năm","captionEN":"Year","formatId":"n","position":"grid","orderNo":5,"required":true,"readOnlyAdd":false,"readOnlyEdit":false,"showInFilter":true,"validateRule":"number|minval:2000|maxval:2100"},
          {"field":"SoNgay","captionVN":"Số ngày phép","captionEN":"Leave days","formatId":"n","position":"grid","orderNo":6,"readOnlyAdd":false,"readOnlyEdit":false,"validateRule":"minval:0"},
          {"field":"PhepThamNien","captionVN":"Phép thâm niên","captionEN":"Seniority leave","formatId":"n","position":"grid","orderNo":7,"readOnlyAdd":false,"readOnlyEdit":false,"validateRule":"minval:0"},
          {"field":"PhepTonNamTruoc","captionVN":"Phép tồn năm trước","captionEN":"Previous year balance","formatId":"n","position":"grid","orderNo":8,"readOnlyAdd":false,"readOnlyEdit":false},
          {"field":"SoNgayDaSuDung","captionVN":"Số ngày đã sử dụng","captionEN":"Used days","formatId":"n","position":"grid","orderNo":9,"showInAdd":false,"showInEdit":true,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayConLai","captionVN":"Số ngày còn lại","captionEN":"Remaining days","formatId":"n","position":"grid","orderNo":10,"showInAdd":false,"showInEdit":true,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayPhepTet","captionVN":"Số ngày phép Tết","captionEN":"Holiday leave days","formatId":"n","position":"grid","orderNo":11,"readOnlyAdd":false,"readOnlyEdit":false,"validateRule":"minval:0"},
          {"field":"SoNgayPhepOm","captionVN":"Số ngày phép ốm","captionEN":"Sick leave days","formatId":"n","position":"grid","orderNo":12,"readOnlyAdd":false,"readOnlyEdit":false,"validateRule":"minval:0"},
          {"field":"GhiChu","captionVN":"Ghi chú","captionEN":"Notes","position":"grid","orderNo":13,"readOnlyAdd":false,"readOnlyEdit":false},
          {"field":"NgayCapNhat","captionVN":"Ngày cập nhật","captionEN":"Updated date","formatId":"dt","position":"grid","orderNo":14,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"UserUpdate","captionVN":"Người cập nhật","captionEN":"Updated by","position":"grid","orderNo":15,"showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true}
        ]',
        @Operations = N'[]',
        @ReplaceOperations = 1,
        @IncludeSaveOperation = 1,
        @IncludeDeleteOperation = 1,
        @EmitResult = 0;

    -- Xoa metadata cu cua form nhan vien, chi trong pham vi form phep nam.
    DELETE FROM dbo.SY_FormatFields
    WHERE FormName = 'WA_QuanLyNghiPhepNamFrm'
      AND FieldName NOT IN (
          'UserAutoID', 'PersonID', 'PersonName', 'PhongBan', 'BranchID', 'Nam',
          'SoNgay', 'PhepThamNien', 'PhepTonNamTruoc', 'SoNgayDaSuDung',
          'SoNgayConLai', 'SoNgayPhepTet', 'SoNgayPhepOm', 'GhiChu',
          'NgayCapNhat', 'UserUpdate'
      );

    -- Tai nguyen chi tiet van giu View de cac man hinh ho so nhan vien co the tai lich su.
    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_QuanLyNghiPhepNam_ChiTiet',
        @TableName = 'HR_PersonNghiPhepTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'Chi tiết phép năm',
        @CaptionEN = N'Annual Leave Detail',
        @FormType = 'LIST',
        @OperationProfile = 'READONLY',
        @ViewProcedure = 'API_QuanLyNghiPhepNam_ChiTiet',
        @ViewParameters = N'@PersonID=N''{PersonID}''',
        @Overrides = N'[
          {"field":"UserAutoID","captionVN":"Mã hệ thống","captionEN":"System ID","position":"grid","orderNo":99,"showInAdd":false,"showInEdit":false},
          {"field":"PersonID","captionVN":"Mã nhân viên","captionEN":"Employee ID","position":"grid","orderNo":1,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"Nam","captionVN":"Năm","captionEN":"Year","formatId":"n","position":"grid","orderNo":2,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgay","captionVN":"Số ngày","captionEN":"Days","formatId":"n","position":"grid","orderNo":3,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"GhiChu","captionVN":"Ghi chú","captionEN":"Notes","position":"grid","orderNo":4,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"PhepThamNien","captionVN":"Phép thâm niên","captionEN":"Seniority leave","formatId":"n","position":"grid","orderNo":5,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayDaSuDung","captionVN":"Số ngày đã sử dụng","captionEN":"Used days","formatId":"n","position":"grid","orderNo":6,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayConLai","captionVN":"Số ngày còn lại","captionEN":"Remaining days","formatId":"n","position":"grid","orderNo":7,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"PhepTonNamTruoc","captionVN":"Phép tồn năm trước","captionEN":"Previous year balance","formatId":"n","position":"grid","orderNo":8,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayPhepTet","captionVN":"Số ngày phép Tết","captionEN":"Holiday leave days","formatId":"n","position":"grid","orderNo":9,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"SoNgayPhepOm","captionVN":"Số ngày phép ốm","captionEN":"Sick leave days","formatId":"n","position":"grid","orderNo":10,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"NgayCapNhat","captionVN":"Ngày cập nhật","captionEN":"Updated date","formatId":"dt","position":"grid","orderNo":11,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"UserUpdate","captionVN":"Người cập nhật","captionEN":"Updated by","position":"grid","orderNo":12,"readOnlyAdd":true,"readOnlyEdit":true}
        ]',
        @Operations = N'[]',
        @ReplaceOperations = 1,
        @IncludeSaveOperation = 0,
        @IncludeDeleteOperation = 0,
        @EmitResult = 0;

    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = 'WA_QuanLyNghiPhepNamFrm') <> 3
        THROW 51703, 'Form phep nam phai co View, Save va Delete.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.SY_FormatFields
        WHERE FormName = 'WA_QuanLyNghiPhepNamFrm'
          AND ShowInAdd = 1
          AND IsReadOnlyAdd = 0
    )
        THROW 51704, 'Form phep nam khong co truong nao cho phep them.', 1;

    COMMIT TRANSACTION;

    SELECT 0 AS code, N'Đăng ký form phép năm thành công.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
