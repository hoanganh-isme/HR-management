/**
 * Trách nhiệm: truy cập dữ liệu hợp đồng, mẫu và file qua SQL API Gateway.
 * Đầu vào: mã hợp đồng, mã file, dữ liệu lưu và Authorization header.
 * Đầu ra: bản ghi nghiệp vụ đã chuẩn hóa.
 * Nơi gọi: ContractDocumentService và ContractDocumentController.
 */
import { HttpError } from '../shared/http-error.js';

function soSanhKhongPhanBietHoaThuong(giaTriTrai, giaTriPhai) {
  return String(giaTriTrai || '').localeCompare(String(giaTriPhai || ''), undefined, { sensitivity: 'accent' }) === 0;
}

export class ContractDocumentRepository {
  constructor(gatewayClient) {
    this.gatewayClient = gatewayClient;
  }

  async layHopDongMoiNhat(maHopDong, authorization) {
    const phanHoi = await this.gatewayClient.xem('WA_HopDongLaoDongFrm', {
      Keyword: maHopDong,
      Limit: 50,
      MaHopDong: maHopDong
    }, authorization);
    const hopDong = this.gatewayClient.layDanhSachBanGhi(phanHoi)
      .find((banGhi) => soSanhKhongPhanBietHoaThuong(banGhi.MaHopDong, maHopDong));
    if (!hopDong) throw new HttpError(404, 'CONTRACT_NOT_FOUND', 'Không tìm thấy hợp đồng đã chọn.');
    return hopDong;
  }

  async layDanhSachMauHopDong(authorization) {
    const phanHoi = await this.gatewayClient.xem('HR_HopDongAddfile', {
      Keyword: 'WA_HopDongLaoDongFrm',
      Limit: 100
    }, authorization);
    return this.gatewayClient.layDanhSachBanGhi(phanHoi);
  }

  async layMauHopDong(templateFile, authorization) {
    const danhSach = await this.layDanhSachMauHopDong(authorization);
    const mauHopDong = danhSach.find((mau) => soSanhKhongPhanBietHoaThuong(mau.TemplateFile, templateFile)
      && soSanhKhongPhanBietHoaThuong(mau.FormName, 'WA_HopDongLaoDongFrm'));
    if (!mauHopDong) throw new HttpError(400, 'TEMPLATE_NOT_REGISTERED', 'Mẫu hợp đồng chưa được khai báo trong HR_HopDongAddfile.');
    return mauHopDong;
  }

  async layDanhSachFileHopDong(maHopDong, branchId, authorization) {
    const phanHoi = await this.gatewayClient.xem('API_HopDongLaoDong_Attach_Metadata', {
      MaHopDong: maHopDong || '',
      BranchID: branchId || '',
      Limit: 1000
    }, authorization);
    return this.gatewayClient.layDanhSachBanGhi(phanHoi);
  }

  async layMetadataFileHopDong(userAutoID, authorization) {
    const phanHoi = await this.gatewayClient.xem('API_HopDongLaoDong_Attach_Metadata', {
      UserAutoID: userAutoID,
      Limit: 1
    }, authorization);
    const metadata = this.gatewayClient.layDanhSachBanGhi(phanHoi)[0];
    if (!metadata) throw new HttpError(404, 'ATTACHMENT_NOT_FOUND', 'Không tìm thấy file hợp đồng.');
    return metadata;
  }

  async layNoiDungFileHopDong(userAutoID, authorization) {
    const phanHoi = await this.gatewayClient.xem('API_HopDongLaoDong_Attach_File', {
      UserAutoID: userAutoID,
      Limit: 1
    }, authorization);
    const fileHopDong = this.gatewayClient.layDanhSachBanGhi(phanHoi)[0];
    if (!fileHopDong) throw new HttpError(404, 'ATTACHMENT_NOT_FOUND', 'Không tìm thấy nội dung file hợp đồng.');
    return fileHopDong;
  }

  async luuHopDongVaoCSDL(thongTinFile, userName, authorization) {
    const phanHoi = await this.gatewayClient.thaoTac(
      'API_HopDongLaoDong_Attach',
      'Save',
      thongTinFile,
      userName,
      authorization
    );
    const ketQua = this.gatewayClient.layKetQuaThaoTac(phanHoi);
    if (!ketQua || Number(ketQua.code) !== 0) {
      throw new HttpError(502, 'ATTACHMENT_SAVE_FAILED', ketQua && ketQua.msg ? ketQua.msg : 'SQL API không lưu được file hợp đồng.');
    }
    if (!ketQua.UserAutoID) {
      throw new HttpError(409, 'ATTACHMENT_ID_MISSING', 'API Save chưa trả UserAutoID; bản nháp được giữ lại để thử lại.');
    }
    return ketQua;
  }
}

