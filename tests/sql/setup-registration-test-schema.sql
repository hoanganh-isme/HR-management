SET NOCOUNT ON;

CREATE TABLE dbo.SY_FrmLstTbl (
    FormID VARCHAR(50) NOT NULL,
    FormType VARCHAR(20) NULL,
    CaptionVN NVARCHAR(255) NULL,
    CaptionEN NVARCHAR(255) NULL,
    TableName VARCHAR(128) NULL,
    PrimaryKey VARCHAR(50) NULL,
    CaptionCH NVARCHAR(255) NULL
);

CREATE TABLE dbo.WA_API (
    list VARCHAR(50) NOT NULL,
    func VARCHAR(50) NOT NULL,
    [SQL] VARCHAR(256) NULL,
    Para NVARCHAR(MAX) NULL
);

CREATE TABLE dbo.SY_FormatFields (
    AutoID INT IDENTITY(1, 1),
    FormName VARCHAR(50) NOT NULL,
    FieldName VARCHAR(128) NOT NULL,
    CaptionVN NVARCHAR(255) NULL,
    FormatID VARCHAR(10) NULL,
    CaptionEN NVARCHAR(255) NULL,
    DataSource NVARCHAR(500) NULL,
    IsRequired BIT NULL,
    FormPosition VARCHAR(50) NULL,
    ShowInAdd BIT NULL,
    ShowInEdit BIT NULL,
    IsReadOnlyEdit BIT NULL,
    IsReadOnlyAdd BIT NULL,
    ValidateRule NVARCHAR(500) NULL,
    DependsOn VARCHAR(100) NULL,
    VisibleRule NVARCHAR(500) NULL,
    OrderNo INT NULL,
    ShowInFilter BIT NULL
);

CREATE TABLE dbo.SY_FmtFldTbl (
    FormatID VARCHAR(10) NULL,
    FieldName VARCHAR(128) NOT NULL,
    FormName VARCHAR(50) NULL,
    CaptionVN NVARCHAR(255) NULL,
    CaptionEN NVARCHAR(255) NULL,
    AlignX VARCHAR(20) NULL
);

CREATE TABLE dbo.HR_KinhPhiCongDoanTbl (UserAutoID INT, PersonID VARCHAR(50), PersonName NVARCHAR(255), MucDong DECIMAL(18,2), BranchID VARCHAR(50), PeriodID VARCHAR(20), LoaiHD VARCHAR(50));
CREATE TABLE dbo.HR_BaoHiemTbl (DocumentID VARCHAR(50), PeriodID VARCHAR(20), BranchID VARCHAR(50), PeriodKeyID VARCHAR(50));
CREATE TABLE dbo.HR_BaoHiemChiTietTbl (UserAutoID INT, DocumentID VARCHAR(50), PersonID VARCHAR(50), MucDong DECIMAL(18,2));
CREATE TABLE dbo.HR_PayrollTbl (DocumentID VARCHAR(50), PeriodID VARCHAR(20), BranchID VARCHAR(50));
CREATE TABLE dbo.HR_PayrollDetailTbl (UserAutoID INT, DocumentID VARCHAR(50), Code VARCHAR(50), Mota NVARCHAR(255), SoTien DECIMAL(18,2), Notes NVARCHAR(255));
CREATE TABLE dbo.HR_SapCaTbl (SapCaID VARCHAR(50), BranchID VARCHAR(50), PeriodID VARCHAR(20));
CREATE TABLE dbo.HR_SapCaNhanVienTbl (UserAutoID INT, SapCaID VARCHAR(50), PersonID VARCHAR(50));
CREATE TABLE dbo.HR_HopDongTbl (MaHopDong VARCHAR(50), PersonID VARCHAR(50), BranchID VARCHAR(50), LoaiHopDong VARCHAR(50));
CREATE TABLE dbo.HR_HopDongDetailTbl (UserAutoID INT, MaHopDong VARCHAR(50), Code VARCHAR(50));
CREATE TABLE dbo.HR_HopDongAttachTbl (UserAutoID INT, MaHopDong VARCHAR(50), FileName NVARCHAR(255));
CREATE TABLE dbo.HR_PersonTbl (PersonID VARCHAR(50), PersonName NVARCHAR(255), PersonStatus VARCHAR(50), BranchID VARCHAR(50), LoaiHD VARCHAR(50), NamLap INT);
CREATE TABLE dbo.HR_PersonAttachTbl (UserAutoID INT, PersonID VARCHAR(50), FileName NVARCHAR(255));

CREATE TABLE dbo.CF_BranchTbl (BranchID VARCHAR(50));
CREATE TABLE dbo.HR_BangCapTbl (MaBangCap VARCHAR(50));
CREATE TABLE dbo.HR_BankListTbl (BankName NVARCHAR(255));
CREATE TABLE dbo.HR_CareerListTbl (CareerName NVARCHAR(255));
CREATE TABLE dbo.HR_DepartmentListTbl (PhongBan NVARCHAR(255));
CREATE TABLE dbo.HR_EducationListTbl (EducationName NVARCHAR(255));
CREATE TABLE dbo.HR_HinhThucNghiListTbl (HinhThucNghi NVARCHAR(255));
CREATE TABLE dbo.HR_HospitalListTbl (HospitalName NVARCHAR(255));
CREATE TABLE dbo.HR_JobListTbl (JobName NVARCHAR(255));
CREATE TABLE dbo.HR_NationListTbl (NationName NVARCHAR(255));
CREATE TABLE dbo.HR_PeoplesListTbl (PeoplesName NVARCHAR(255));
CREATE TABLE dbo.HR_PostionListTbl (PostionName NVARCHAR(255));
CREATE TABLE dbo.HR_ProvineListTbl (ProvineName NVARCHAR(255));
CREATE TABLE dbo.HR_ReligionListTbl (ReligionName NVARCHAR(255));
CREATE TABLE dbo.HR_ShiftListTbl (ShiftID VARCHAR(50));
CREATE TABLE dbo.HR_TitleListTbl (TitleName NVARCHAR(255));
CREATE TABLE dbo.HR_WorkingGroupListTbl (WorkingGroupName NVARCHAR(255));
GO

CREATE OR ALTER PROCEDURE dbo.API_KinhPhiCongDoan AS SELECT UserAutoID, PersonID, PersonName, MucDong, BranchID, PeriodID, LoaiHD FROM dbo.HR_KinhPhiCongDoanTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_Calculate_MucDong_CongDoan AS SELECT PersonID, PersonName, MucDong FROM dbo.HR_KinhPhiCongDoanTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_BaoHiem AS SELECT DocumentID, PeriodID, BranchID, PeriodKeyID FROM dbo.HR_BaoHiemTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_BaoHiem_Detail AS SELECT UserAutoID, DocumentID, PersonID, MucDong FROM dbo.HR_BaoHiemChiTietTbl;
GO
CREATE OR ALTER PROCEDURE dbo.WA_BaoHiemFrm_Save AS SELECT 0 AS code;
GO
CREATE OR ALTER PROCEDURE dbo.TinhBHStp AS SELECT CAST(0 AS DECIMAL(18,2)) AS MucDong;
GO
CREATE OR ALTER PROCEDURE dbo.API_HR_BangThamSo_Lookup AS SELECT CAST('' AS VARCHAR(50)) AS PeriodKeyID;
GO
CREATE OR ALTER PROCEDURE dbo.WA_BaoHiem_PersonLookup AS SELECT PersonID FROM dbo.HR_PersonTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_Payroll AS SELECT DocumentID, PeriodID, BranchID FROM dbo.HR_PayrollTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_Payroll_Detail AS SELECT UserAutoID, DocumentID, Code, Mota, SoTien, Notes FROM dbo.HR_PayrollDetailTbl;
GO
CREATE OR ALTER PROCEDURE dbo.WA_PayRoll_Process_Stp AS SELECT 0 AS code;
GO
CREATE OR ALTER PROCEDURE dbo.API_DanhSachBoPhan AS SELECT CAST('' AS VARCHAR(50)) AS PhongBan;
GO
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec AS SELECT SapCaID, BranchID, PeriodID FROM dbo.HR_SapCaTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_NhanVien AS SELECT UserAutoID, SapCaID, PersonID FROM dbo.HR_SapCaNhanVienTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_CaLamViec_ChiTiet AS SELECT UserAutoID, SapCaID, PersonID FROM dbo.HR_SapCaNhanVienTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_HR_DropdownShifts AS SELECT ShiftID FROM dbo.HR_ShiftListTbl;
GO
CREATE OR ALTER PROCEDURE dbo.HR_CaLamViec_SapCaStp AS SELECT 0 AS code;
GO
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong AS SELECT MaHopDong, PersonID, BranchID, LoaiHopDong FROM dbo.HR_HopDongTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_ChiTiet AS SELECT UserAutoID, MaHopDong, Code FROM dbo.HR_HopDongDetailTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_Attach AS SELECT UserAutoID, MaHopDong, FileName FROM dbo.HR_HopDongAttachTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_NamLap AS SELECT CAST(2026 AS INT) AS NamLap;
GO
CREATE OR ALTER PROCEDURE dbo.API_HopDongLaoDong_LoaiHD AS SELECT CAST('' AS VARCHAR(50)) AS LoaiHD;
GO
CREATE OR ALTER PROCEDURE dbo.API_HoSoNhanVien AS SELECT PersonID, PersonName, PersonStatus, BranchID, LoaiHD, NamLap FROM dbo.HR_PersonTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_PersonAttach AS SELECT UserAutoID, PersonID, FileName FROM dbo.HR_PersonAttachTbl;
GO
CREATE OR ALTER PROCEDURE dbo.API_PersonAttach_SaveAvatar AS SELECT 0 AS code;
GO
CREATE OR ALTER PROCEDURE dbo.API_TruyVanDong AS EXEC sys.sp_executesql N'SELECT 1 AS DynamicValue';
GO
CREATE OR ALTER PROCEDURE dbo.API_LuuDong AS SELECT 0 AS code;
GO
CREATE OR ALTER PROCEDURE dbo.API_XoaDong AS SELECT 0 AS code;
GO
