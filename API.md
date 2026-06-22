Tài liệu mô tả API – bản DEV
Lưu ý :
BaseURL  : là địa chỉ truy cập trang web , vd : http://demo.abc.com
API sẽ là : http://demo.abc.com/api

Các phương thức sử dụng
•	POST – Create: Tạo dữ liệu mới
•	GET – Read: Lấy dữ liệu về
•	PUT – Update: Cập nhật dữ liệu
•	DELETE – Delete: Xóa dữ liệu
Kết quả sau khi thực hiện gọi api thường trả về dạng
{
    	“code”: xxx,  // 0 = thành công, khác 0 là có lỗi
    	“msg”: “Mô tả thêm về lỗi hoặc các thông báo khác cần hiện ra cho user biết”,
	“Data1”:”Thông tin khác”,
	“Data2”:”Thông tin khác”…
}

Đối với api trả ra dữ liệu dạng danh sách thường có cấu trúc như sau.
( vd : dùng lấy danh sách đơn hàng, lấy danh sách khách hàng … )
{
    ”code”: xxx,  // 0 = thành công, khác 0 là có lỗi
    ”msg”: “Mô tả thêm về lỗi hoặc các thông báo khác cần hiện ra cho user biết”,
  “records”: [
    {
      “ItemID”: “HH001”,
      “ItemName”: “Tên hàng hóa 1”,
      “UnitPrice”: 55000
    },
    {
      “ItemID”: “HH002”,
      “ItemName”: “Tên hàng hóa 2”,
      “UnitPrice”: 12000
    }, ….

  ],
  “records2”: [{….}] ,
  “records3”: [{….}] ,

  “_recordtotal”: {số lượng record},
  “_pagetotal”: {tổng số trang},
  “_page”: {trang hiện tại},
  “_limit”: {số record trong 1 trang},
  “_timestamp”: {ngày giờ trả ra dữ liệu}

}

Đối với api trả ra dữ liệu thông tin theo ID truyền vào thường có cấu trúc như sau.
( vd : dùng lấy thông tin 1 đơn hàng )

{
    ”code”: xxx,  // 0 = thành công, khác 0 là có lỗi
    ”msg”: “Mô tả thêm về lỗi hoặc các thông báo khác cần hiện ra cho user biết”,

  “records”: [
    {
      “SoDonHang”: “PO001”,
      “NgayDonHang”: “05/02/2023”,
       “MaKhachHang”: “KH001”,
       “DienGiai”: “Test đơn hàng”,
  	“SoTien”: 55000
    }
  ],

  “detail”: [
    {
      “ItemID”: “HH001”,
      “ItemName”: “Tên hàng hóa 1”,
      “UnitPrice”: 55000,
      “Quantity”: 3,
      “Amount”: 165000
    },
    {
      “ItemID”: “HH002”,
      “ItemName”: “Tên hàng hóa 2”,
      “UnitPrice”: 12000,
      “Quantity”: 5,
      “Amount”: 60000
    }
  ],
  “detail2”: [ { ……} ] ,
  “detail3”: [ { ……} ]


}
1.	Chứng thực, Login, Logout 
Cách 1 : API lấy access token ( Login / Đăng nhập )
Hệ thống hỗ trợ các phương thức login sau để lấy Access Token
+ Dùng POST
POST Login : /api/login  ,  Logout :  /api/logout
Nội dung post :
{
    	”username”: ”admin”,
    	”password”: ”12345678”
}

Tên tham số	Kiểu dữ liệu	Bắt buộc	Mô tả
username	String	Có	Tên đăng nhập (được cấp)
password	String	Có	Mật khẩu (được cấp)
			
			

Cách 2 :  Dùng BASIC AUTH
Cách này không cần phải login, truyền vào header mỗi khi gọi API
encodedAuth = Convert.ToBase64String(ASCII.GetBytes(Username:Password))
Headers.Add(“Authorization”, “Basic “ + encodedAuth)
Cách 3 : Dùng API-Key :
Cách này không cần phải login, truyền vào header mỗi khi gọi API
Headers.Add(“Authorization”, “token “ + api_key_value)

Khi login thành công, hệ thống trả ra access_token như sau
Output: trường hợp thành công
{
“code”: 0,
“msg”: “Đăng nhập thành công”,
“access_token”: ”LDFGGU3Bs0XPmg44x3qvQAlUDyKAs”,
    	“refresh_token”: “esVgV3mvNw44x3qvQAlUDyK”,
    	“UserName”: “admin”, 
“DisplayName”: “Nguyen Văn A”,
    	“Group”: “Admin” // nhóm phân quyền , admin, quản lý, nhân viên ,sales….
    	“BranchID”: “HCM” // Mã chi nhánh trực thuộc nếu có….
    	“CeoID”: “CEO001” // Mã tổng quản lý, trường hợp user là tổng quản lý sẽ gán cố định mã này ….
    	“ManagerID”: “QL002” // Mã quản lý, trường hợp user là quản lý sẽ gán cố định mã này ….
    	“EmployeeID”: “NV003” // Mã nhân viên, trường hợp user là nhân viên sẽ gán cố định mã này 
    	“ObjectID”: “KH004” // Mã khách hàng, trường hợp user là khách hàng sẽ gán cố định mã này  ….
    	“StoreHouseID”: “KHO1” // Kho mặc định khi lên đơn hàng…. 
}

Login lỗi : Output: trường hợp lỗi
{
    	“code”: 1,
    	“msg”: “Mật khẩu hoặc tên người dùng không đúng / Invalid Username or Password “

}

Khi gọi API cần truyền token này vào header
Header: Authorization Bearer [Access token]
Vd : Headers.Add(“Authorization”, “ Bearer  “ + access_token)

2. API đổi mật khẩu ( change user password )
POST : /api/changePassword
Nội dung post :
{
    ”username”: ”admin”,
    ”password”: ”12345678”,
    ”newpassword”: ”abc123”,
    ”newpassword2”: ”abc123”
}

Output: trường hợp thành công
{
    	“code”: 0,
    	“msg”: “Đổi mật khẩu thành công”
}

Output: trường hợp lỗi
{
    	“code”: 1,
    	“msg”: “Mô tả lỗi…”

}

3. API lấy thông tin user hiện tại 
Thường sau khi login thành công API đã trả ra đầy đủ thông tin user
Ngoài ra nếu bạn muốn lấy thông tin user đang login bằng api sau:
GET / POST : /api/userinfo
 
4. API Đăng ký user mới.
Dùng để đăng ký user mới tại màn hình đăng nhập ( Sau khi đăng ký mới có thể login hay ko phụ thuộc vào backend xử lý trong store procedure :  API_UserRegister

POST  : /api/register
Các trường dữ liệu truyền vào dựa theo  store procedure :  API_UserRegister

5. API lấy menu và kiểm tra quyền.
Lấy danh sách menu của user đang login
GET : /api/sys/memu     hoặc theo module : /api/sys/memu?mod=HR

Lấy quyền của 1 menu ( quyền xem, thêm, sửa, xóa, manage, admin, export...)
GET  : /api/sys/Permiss?id={menuid truyền vào}
Hoặc theo module: /api/sys/Permiss?mod=HR&id={menuid truyền vào}
Chú ý : 
Mod là module cần tham chiếu nếu hệ thống dùng nhiều module riêng biệt, mặc định là WA
Thường có các module sau:
–	WA : web app
–	AC, SY : Kế toán
–	HR  : nhân sự
–	KD : kinh doanh
–	Hoặc theo Dev từ định nghĩa trong từng database

6. API lấy bản thể hiện report.
Dùng để lấy file pdf hoặc file hình ảnh của report đó hiện lên cho user xem và in phiếu
POST : /api/report
Nội dung truyền vào POST
{
"Name":"AR_BanHangReport" ,  — tên report, tên store proc  = Name + Stp
"Output":"jpg",  — loại trả ra : JPG ,PDF, FILE : mặc định là PDF
"DocumentID":"BH0001"  ,  — các para truyền vào theo store proc trong database
"ObjectID":"KH0001"       
}
Hệ thống sẽ gọi store proc AR_BanHangReportStp tương ứng với report này
Hệ thống sẽ trả ra base64 và đường dẫn file temp

7. API lấy column caption / language ( Tên tiếng việt của column ).
Dùng để lấy caption của column, ví dụ ; Quantity —> Số lượng.
POST : /api/sys/caption
Nội dung truyền vào POST : 1 hoặc nhiều column 
+ ColumnName
+ ColumnName1;ColumnName2;ColumnName3

 
Các API truy vấn dữ liệu dạng danh sách ( mảng dữ liệu ), phương thức GET
BaseURL/api/{tên hàm cần truy vấn dữ liệu}?{các tham số}
Áp dụng : lấy danh sách dữ liệu trong tháng, lấy danh mục hàng hóa…
Ví dụ lấy danh sách đơn hàng theo thời gian (trong tháng) : 
BaseURL/api/AR_OrderTbl?q={“DocumentDate$gte”:”2023-01-01”, “DocumentDate$lte”:”2023-01-31”}

Các API truy vấn dữ liệu trả về thông tin theo ID truyền vào,  phương thức GET
+ BaseURL/api/{tên hàm cần truy vấn dữ liệu}/{id}
Áp dụng : lấy thông tin chính (master) của 1 đơn hàng, phiếu xuất kho, thông tin hàng hóa….
+ BaseURL/api/{tên hàm cần truy vấn dữ liệu}/{id}?t={detail_name}&t2={detail2_name}
Áp dụng : lấy thông tin 1 đơn hàng + chi tiết các mặt hàng trong đơn hàng 
Các para dùng trong API lấy dữ liệu
Tên para	Mô tả	Ví dụ
Limit, top
	Giới hạn số dòng dữ liệu trả ra (mặc định là 500 dòng )	BaseURL/api/AR_OrderTbl?limit=50&page=2
BaseURL/api/AR_OrderTbl?top=50&page=2

page	Trang dữ liệu cần lấy, mặc định là 1	
q, q1, q2, q3	Điều kiện lọc dữ liệu khi lấy ra

Các điều kiện q, q1,q2.. sẽ kết hợp với nhau theo toán tử And 

q and q1 and q2 and q3	q={ “fieldname$op”:”value”, “fieldname2$op”:”value” }

fieldname : trường dữ liệu cần lọc.
Value : giá trị cần lọc hoặc mảng giá trị phân cách bằng dấu ;
$op : toán tử  ( xem bảng mộ tả bên dưới )

Toán tử	Tương đương	Ý nghĩa
$gt	 >	điều kiện lớn hơn
$gte	 >=	điều kiện lớn hơn hoặc bằng
$lt	 <	điều kiện nhỏ hơn
$lte	 <=	điều kiện nhỏ hơn hoặc bằng
$lk	like	Ví dụ :
q={“KhuVuc$lk”:”Q%” }
$bt	between	So sánh trong khoảng, Value chứa 2 giá trị cần so sánh 
Vd : q={“DocumentDate$bt”: “2023-1-1;2023-1-15”}
$ne	 <>	So sánh khác
$eq hoặc bỏ trống / mặc định	=	So sánh bằng
$or	Kết hợp Or thay vì AND với điều kiện phía trước	Khi dùng $or thì toán tử sẽ áp dụng so sánh bằng
Vd : muốn tìm mã nhân viên = NV001 hoặc Khu vực = Q1
q={“NhanVien”:”NV001”,
“KhuVuc$or”:”Q1” }
$in	so sánh nhiều giá trị , toán tử này thì giá trị so sánh là mảng dữ liệu phân cách bằng dấu ;	Ví dụ :
q={“KhuVuc$in”:”Q1;Q2;GoVap” }
$ud	User define,
Tự nhập điều kiện vào trong giá trị 	Ví dụ :
q={“KhuVuc$ud”:”is null” }
q={“SoLuong$ud”:”between 100 and 500” }


Ví dụ cần lấy đơn hàng từ ngày 01/01/2023 đến ngày 15/01/2023, DocumentDate là trường chứa ngày đơn hàng

q={ “DocumentDate$gte”:”2023-01-01”, 
“DocumentDate$lte “:”2023-01-15 23:59” }

Ví dụ cần lấy đơn hàng của nhân viên có mã là : NV001
q={ “EmplyeeID”:”NV001”}

Ví dụ cần lấy đơn hàng của khu vực : Q1, Q2, GoVap
q={“KhuVuc$in”:”Q1;Q2;GoVap” }

f	Mặc đinh api sẽ trả ra tất cả các trường dữ liệu đang có.
Khi chỉ định các trường cần lấy, api chỉ trả ra theo các trường này, danh sách các trường phân cách bằng dấu ;
Có thể dùng các toán tử SQL trong này đối với api truy vấn trực tiếp từ bảng
	Ví dụ 
f=Document;DocumentDate;NhanVien;KhuVuc

vd : sum trường số tiền
f=sum(amount) 
 
vd : lấy giá trị lớn nhất
f=max(amount) , min, count , distinct …
sort	Sắp xếp dữ liệu trước khi xuất ra	sort=DocumentDate,DocumentID
sort=DocumentDate desc
		
w	Điều kiện where trong câu truy vấn SQL, chỉ áp dụng cho 1 số  api truy vấn từ bảng dữ liệu trực tiếp.	w=DocumentDate between ‘2023-1-1’ and ‘2023-1-15’ and KhuVuc$eq$’Q1’


1.	API thêm mới dữ liệu, cập nhật dữ liệu.
Thêm mới dữ liệu
Phương thức : PUT 
+ BaseURL/api/{tên hàm cần truy vấn dữ liệu}
Cập nhật vào dữ liệu cũ 
Phương thức : POST
+ BaseURL/api/{tên hàm cần truy vấn dữ liệu}/{id}
{id} : là số phiếu , số đơn hàng , khóa chính của dữ liệu cũ


Dữ liệu truyền vào dạng json, vd :
    {
      “SoDonHang”: “PO001”,
      “NgayDonHang”: “05/02/2023”,
       “MaKhachHang”: “KH001”,
       “DienGiai”: “Test đơn hàng”,
  	“SoTien”: 55000,
    }

Cách 2 : Cả master và detail.
{
    "DocumentDate":"2023-07-16",
    "BranchID" :"MT",
    "ManagerID" :"QLBH014",
    "EmployeeID" :"NVBH001",
    "ObjectID" :"HNCG040",
    "Memo" :"test",
    "Notes" :"abc" ,
    "ChanhXe" :"" ,
    "DeliverDate" :"" ,
    "ItemList":[
            {
                "ItemID" :"M010",
                "Quantity" :10,
                "SoLuongTang" :2,
                "UnitPrice" :29000,
                "Amount" :290000,
                "DiscountPercent" :0,
                "DiscountAmount" : 0,
                "Notes" :"abc"
            },
            {
                "ItemID" :"S022",
                "Quantity" :5,
                "SoLuongTang" :0,
                "UnitPrice" :22000,
                "Amount" :110000,
                "DiscountPercent" :3,
                "DiscountAmount" : 3300,
                "Notes" :"abc"
            }

    ]
    
}



2.	API xóa dữ liệu
Phương thức : DELETE
+ BaseURL/api/{tên hàm cần truy vấn dữ liệu}/{id}
{id} : là số phiếu , số đơn hàng , khóa chính của dữ liệu cần xóa

