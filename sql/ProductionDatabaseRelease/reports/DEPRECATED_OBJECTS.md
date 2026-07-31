# Deprecated objects

Không object nào bị DROP trong INSTALL_ALL. SafeToDrop mặc định false cho đến sau monitoring và phê duyệt thủ công.

| ObjectName | Decision | SafeToDrop | Reason |
| --- | --- | --- | --- |
| API_BangThueTNCN_V2 | DEPRECATE_NOT_DEPLOY | false | Prototype V2 đã được generic API_TruyVanDong_V2 thay thế; không deploy và chưa drop. |
