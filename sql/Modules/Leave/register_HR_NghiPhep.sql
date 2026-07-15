SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.API_DangKyFormWeb', 'P') IS NULL
        THROW 51700, 'Chua cai dat API_DangKyFormWeb.', 1;

    IF OBJECT_ID('dbo.API_HR_NghiPhep', 'P') IS NULL
        THROW 51701, 'Chua cai dat API_HR_NghiPhep.', 1;

    IF OBJECT_ID('dbo.API_HR_NghiPhep_ChiTiet', 'P') IS NULL
        THROW 51703, 'Chua cai dat API_HR_NghiPhep_ChiTiet.', 1;

    -- Xóa cấu hình cũ để tái tạo sạch sẽ, tránh dính rác
    DELETE FROM dbo.SY_FormatFields WHERE FormName IN ('WA_DonXinNghiPhepFrm', 'API_HR_NghiPhep_ChiTiet');
    DELETE FROM dbo.WA_API WHERE list IN ('WA_DonXinNghiPhepFrm', 'API_HR_NghiPhep_ChiTiet');

    EXEC dbo.API_DangKyFormWeb
        @FormName = 'WA_DonXinNghiPhepFrm',
        @TableName = 'HR_NghiPhepTbl',
        @PrimaryKey = 'DocumentID',
        @CaptionVN = N'Đăng ký nghỉ phép',
        @CaptionEN = N'Leave Application',
        @FormType = 'EDIT',
        @OperationProfile = 'CRUD',
        @ViewProcedure = 'API_HR_NghiPhep',
        @ViewParameters = N'@Keyword=N''{Keyword}'', @BranchID=N''{BranchID}''',
        @Overrides = N'[
          {"field":"DocumentID","captionVN":"Số chứng từ","showInAdd":false,"showInEdit":false,"readOnlyAdd":true,"readOnlyEdit":true},
          {"field":"PersonID","captionVN":"Mã nhân viên","formatId":"sl","dataSource":"WA_PersonFullFrm|4","position":"grid","orderNo":1,"required":true,"readOnlyEdit":true,"showInFilter":true},
          {"field":"StatusID","captionVN":"Trạng thái","formatId":"sl","dataSource":"SELECT StatusID as ID, StatusName as Name FROM HR_StatusTbl","readOnlyAdd":true,"readOnlyEdit":true,"orderNo":2},
          {"field":"LyDo","captionVN":"Lý do nghỉ","formatId":"t","required":true,"orderNo":3},
          {"field":"Notes","captionVN":"Ghi chú","formatId":"t","orderNo":4},
          {"field":"NgayXinPhep","captionVN":"Ngày xin phép","readOnlyAdd":true,"readOnlyEdit":true,"orderNo":5},
          {"field":"NguoiXinPhep","captionVN":"Người xin phép","readOnlyAdd":true,"readOnlyEdit":true,"orderNo":6},
          {"field":"IsAnCom","captionVN":"Có ăn cơm","formatId":"c","orderNo":7},
          {"field":"IsXinHuy","captionVN":"Xin hủy đơn","formatId":"c","orderNo":8},
          {"field":"ManagerID","showInAdd":false,"showInEdit":false},
          {"field":"CeoID","showInAdd":false,"showInEdit":false},
          {"field":"NghiTuNgay","showInAdd":false,"showInEdit":false},
          {"field":"DenNgay","showInAdd":false,"showInEdit":false},
          {"field":"SoNgayNghi","showInAdd":false,"showInEdit":false},
          {"field":"UserCreate","showInAdd":false,"showInEdit":false},
          {"field":"DateCreate","showInAdd":false,"showInEdit":false},
          {"field":"UserUpdate","showInAdd":false,"showInEdit":false},
          {"field":"DateUpdate","showInAdd":false,"showInEdit":false},
          {"field":"ManagerName","showInAdd":false,"showInEdit":false},
          {"field":"CeoName","showInAdd":false,"showInEdit":false},
          {"field":"NgayDuyet","showInAdd":false,"showInEdit":false},
          {"field":"HinhThucNghi","showInAdd":false,"showInEdit":false},
          {"field":"PersonName","showInAdd":false,"showInEdit":false},
          {"field":"PersonBranchID","showInAdd":false,"showInEdit":false},
          {"field":"DetailID","showInAdd":false,"showInEdit":false},
          {"field":"Expr2","showInAdd":false,"showInEdit":false},
          {"field":"BackColor","showInAdd":false,"showInEdit":false},
          {"field":"DocumentDate","showInAdd":false,"showInEdit":false}
        ]',
        @Operations = N'[]',
        @ReplaceOperations = 1,
        @IncludeSaveOperation = 1,
        @IncludeDeleteOperation = 1,
        @EmitResult = 0;

    -- Kiểm tra lại việc đăng ký
    IF (SELECT COUNT(*) FROM dbo.WA_API WHERE list = 'WA_DonXinNghiPhepFrm') <> 3
        THROW 51702, 'Đăng ký form nghỉ phép chưa thành công (thiếu View, Save hoặc Delete).', 1;

    -- Đăng ký Detail Grid
    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_HR_NghiPhep_ChiTiet',
        @TableName = 'HR_NghiPhepDetailTbl',
        @PrimaryKey = 'DetailID',
        @CaptionVN = N'Chi tiết Đơn xin nghỉ phép',
        @CaptionEN = N'Leave Request Details',
        @FormType = 'LIST',
        @OperationProfile = 'CRUD',
        @ViewProcedure = 'API_HR_NghiPhep_ChiTiet',
        @ViewParameters = N'@DocumentID=N''{DocumentID}''',
        @Overrides = N'[
          {"field":"DetailID","showInAdd":false,"showInEdit":false},
          {"field":"DocumentID","showInAdd":false,"showInEdit":false},
          {"field":"HinhThucNghi","captionVN":"Hình thức nghỉ","formatId":"sl","dataSource":"SELECT HinhThucNghi as ID, TenHinhThucNghi as Name FROM HR_HinhThucNghiListTbl","required":true},
          {"field":"NghiTuNgay","captionVN":"Từ ngày","required":true},
          {"field":"DenNgay","captionVN":"Đến ngày","required":true},
          {"field":"SoNgayNghi","captionVN":"Số ngày nghỉ","formatId":"n2","required":true},
          {"field":"Notes","captionVN":"Ghi chú","formatId":"t"}
        ]',
        @Operations = N'[]',
        @ReplaceOperations = 1,
        @IncludeSaveOperation = 1,
        @IncludeDeleteOperation = 1,
        @EmitResult = 0;
    -- Đăng ký Attach API
    EXEC dbo.API_DangKyFormWeb
        @FormName = 'API_HR_NghiPhep_Attach',
        @TableName = 'HR_NghiPhepAttachTbl',
        @PrimaryKey = 'UserAutoID',
        @CaptionVN = N'File đính kèm',
        @CaptionEN = N'Attachments',
        @FormType = 'LIST',
        @OperationProfile = 'CRUD',
        @ViewProcedure = 'API_HR_NghiPhep_Attach',
        @ViewParameters = N'@DocumentID=N''{DocumentID}''',
        @Overrides = N'[]',
        @Operations = N'[]',
        @ReplaceOperations = 1,
        @IncludeSaveOperation = 0,
        @IncludeDeleteOperation = 1,
        @EmitResult = 0;


    COMMIT TRANSACTION;

    SELECT 0 AS code, N'Đăng ký form WA_DonXinNghiPhepFrm thành công.' AS msg;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
