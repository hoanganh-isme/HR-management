USE [QLTiec]
GO

-- ==============================================================
-- BƯỚC 1: TEST TÌM KIẾM CƠ BẢN (KHÔNG FILTER)
-- ==============================================================
EXEC [dbo].[API_TruyVanDong] 
    @FormName = 'frmCustomer',
    @Keyword = '',
    @FilterJSON = NULL,
    @UserName = 'admin',
    @SortColumn = '',
    @SortDir = '',
    @Page = 1,
    @Limit = 15;
GO

-- ==============================================================
-- BƯỚC 2: TEST TÌM KIẾM NÂNG CAO (JSON FILTER)
-- Tính năng 100% No-Code mới nâng cấp
-- ==============================================================
EXEC [dbo].[API_TruyVanDong] 
    @FormName = 'frmCustomer',
    @Keyword = '',
    @UserName = 'admin',
    @SortColumn = '',
    @SortDir = '',
    @Page = 1,
    @Limit = 15,
    
    -- Biến lọc động truyền từ UI dưới dạng JSON:
    @FilterJSON = N'{"Tenkh": "Hoàng Dân", "DTcodau": "098"}';
GO
