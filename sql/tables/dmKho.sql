CREATE TABLE [dbo].[dmKho](
    [Khoid] [varchar](50) NOT NULL,
    [Tenkho] [nvarchar](255) NULL,
    [Manv] [varchar](50) NULL,
    [Diachi] [nvarchar](500) NULL,
    [Dienthoai] [char](20) NULL,
    [Macdinh] [bit] NULL,
    [Ghichu] [nvarchar](500) NULL,
    [UserCreate] [varchar](50) NULL,
    [UserUpdate] [varchar](50) NULL,
    [DateCreate] [datetime] NULL,
    [DateUpdate] [datetime] NULL,
    [IsKhogui] [bit] NULL,
    [IsKhotrong] [bit] NULL,
    [Nhahangid] [varchar](50) NULL,
    [isDefault] [bit] NULL,
 CONSTRAINT [PK_dmKho] PRIMARY KEY CLUSTERED ([Khoid] ASC)
)
