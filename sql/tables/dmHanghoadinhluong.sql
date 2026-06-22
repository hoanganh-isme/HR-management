CREATE TABLE [dbo].[dmHanghoadinhluong](
    [UserAutoID] [varchar](50) NOT NULL,
    [Mahang] [varchar](50) NULL,
    [Manvl] [varchar](50) NULL,
    [Dinhluong] [float] NULL,
    [Dongia] [float] NULL,
    [Sotien] [float] NULL,
    [UserCreate] [varchar](50) NULL,
    [UserUpdate] [varchar](50) NULL,
    [DateCreate] [datetime] NULL,
    [DateUpdate] [datetime] NULL,
    [Nhahangid] [varchar](50) NULL,
    [DVtQuyDoi] [nvarchar](50) NULL,
    [QuyDoi] [decimal](18, 2) NULL,
    [GhiChuQuyDoi] [nvarchar](255) NULL,
    [GhiChu] [nvarchar](500) NULL,
 CONSTRAINT [PK_dmHanghoadinhluong] PRIMARY KEY CLUSTERED ([UserAutoID] ASC)
)
