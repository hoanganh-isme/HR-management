-- 1. Đăng ký các Detail API làm danh sách (List) trong SY_FrmLstTbl
DELETE FROM dbo.SY_FrmLstTbl WHERE FormID IN (
    'API_PersonFull_T1_Salary',
    'API_PersonFull_T3_KTKL',
    'API_PersonFull_T4_NghiPhep',
    'API_PersonFull_T5_Relation',
    'API_PersonFull_T6_HopDong',
    'API_PersonFull_T7_CongTac',
    'API_PersonFull_T8_Log',
    'API_PersonFull_T9_GiayTo'
);

INSERT INTO dbo.SY_FrmLstTbl ([FormID], [FormType], [CaptionVN], [CaptionEN], [TableName], [PrimaryKey])
VALUES 
    ('API_PersonFull_T1_Salary', 'LIST', N'Quá trình làm việc, lương và phụ cấp', 'Salary', 'HR_PersonSalaryTbl', 'UserAutoID'),
    ('API_PersonFull_T3_KTKL', 'LIST', N'Khen thưởng kỷ luật', 'KTKL', 'HR_PersonKTKLTbl', 'UserAutoID'),
    ('API_PersonFull_T4_NghiPhep', 'LIST', N'Nghỉ phép', 'Leave', 'HR_PersonNghiPhepTbl', 'UserAutoID'),
    ('API_PersonFull_T5_Relation', 'LIST', N'Gia cảnh', 'Relation', 'HR_PersonRelationTbl', 'UserAutoID'),
    ('API_PersonFull_T6_HopDong', 'LIST', N'Hợp đồng', 'Contract', 'HR_HopDongTbl', 'MaHopDong'),
    ('API_PersonFull_T7_CongTac', 'LIST', N'Công tác', 'Work history', 'HR_LichSuCongTacTbl', 'UserAutoID'),
    ('API_PersonFull_T8_Log', 'LIST', N'Log', 'Log', 'HR_LichSuCongViecTbl', 'UserAutoID'),
    ('API_PersonFull_T9_GiayTo', 'LIST', N'Giấy tờ', 'Document', 'HR_GiayToTbl', 'UserAutoID');

-- 2. Đăng ký Save/Delete trong WA_API
DELETE FROM dbo.WA_API WHERE list LIKE 'API_PersonFull_T%' AND func IN ('Save', 'Delete');

INSERT INTO dbo.WA_API (list, func, [SQL], Para) 
VALUES 
    ('API_PersonFull_T1_Salary', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T1_Salary', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T3_KTKL', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T3_KTKL', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T4_NghiPhep', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T4_NghiPhep', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T5_Relation', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T5_Relation', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T6_HopDong', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T6_HopDong', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T7_CongTac', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T7_CongTac', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T8_Log', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T8_Log', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T9_GiayTo', 'Save', 'API_LuuDong', '@List=N''{List}'', @Data=N''{JsonData}'', @UserName=N''{User}''' ),
    ('API_PersonFull_T9_GiayTo', 'Delete', 'API_XoaDong', '@List=N''{List}'', @Ids=N''{Ids}'', @Data=N''{JsonData}'', @UserName=N''{User}''' );