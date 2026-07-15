/**
 * Trách nhiệm: điều phối tạo, chỉnh sửa, đồng bộ và finalize hợp đồng.
 * Đầu vào: hợp đồng, mẫu, user/chi nhánh và callback OnlyOffice.
 * Đầu ra: draft, editor config hoặc UserAutoID của file đã lưu chính thức.
 * Nơi gọi: ContractDocumentController.
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { HttpError } from '../shared/http-error.js';
import { kyJwtOnlyOffice, kyTokenPhienChinhSua, xacMinhTokenPhienChinhSua } from './edit-session-token.js';
import { taoTaiLieuTuMau } from './docx-template.service.js';

function chuyenJsonSau(giaTri) {
  if (typeof giaTri === 'string') {
    const chuoi = giaTri.trim();
    if ((chuoi.startsWith('{') && chuoi.endsWith('}')) || (chuoi.startsWith('[') && chuoi.endsWith(']'))) {
      try { return chuyenJsonSau(JSON.parse(chuoi)); } catch (error) { return giaTri; }
    }
    return giaTri;
  }
  if (Array.isArray(giaTri)) return giaTri.map(chuyenJsonSau);
  if (giaTri && typeof giaTri === 'object') {
    const ketQua = {};
    Object.keys(giaTri).forEach((tenTruong) => { ketQua[tenTruong] = chuyenJsonSau(giaTri[tenTruong]); });
    return ketQua;
  }
  return giaTri;
}

function lamSachTenFile(tenFile) {
  return String(tenFile || 'hop-dong.docx')
    .replace(/[\\/:*?"<>|()+]/g, '_')
    .replace(/\s+/g, '_');
}

function coQuyenChiNhanh(branchId, userBranches) {
  // null/undefined means the authenticated Gateway is the source of scope.
  if (userBranches == null) return true;
  const branchCanKiemTra = String(branchId || '').trim().toUpperCase();
  return branchCanKiemTra !== '' && userBranches.map((branch) => String(branch).toUpperCase()).includes(branchCanKiemTra);
}

function timFileMau(samplesDir, templateFile) {
  const tenFileCanTim = path.basename(String(templateFile || ''));
  if (!tenFileCanTim || tenFileCanTim !== String(templateFile || '')) {
    throw new HttpError(400, 'INVALID_TEMPLATE_PATH', 'Tên file mẫu không hợp lệ.');
  }

  const hangDoi = [samplesDir];
  while (hangDoi.length > 0) {
    const thuMuc = hangDoi.shift();
    const cacMuc = fs.readdirSync(thuMuc, { withFileTypes: true });
    for (const muc of cacMuc) {
      const duongDan = path.join(thuMuc, muc.name);
      if (muc.isDirectory()) hangDoi.push(duongDan);
      if (muc.isFile() && muc.name.localeCompare(tenFileCanTim, undefined, { sensitivity: 'accent' }) === 0) return duongDan;
    }
  }
  throw new HttpError(404, 'TEMPLATE_FILE_NOT_FOUND', `Không tìm thấy file mẫu ${tenFileCanTim} trong backend-app/samples.`);
}

export class ContractDocumentService {
  constructor({ config, contractRepository, draftRepository, layThongTinSetup }) {
    this.config = config;
    this.contractRepository = contractRepository;
    this.draftRepository = draftRepository;
    this.layThongTinSetup = layThongTinSetup;
  }

  async taoBanNhapHopDong({ maHopDong, templateFile, userName, userBranches, authorization }) {
    if (!maHopDong || !templateFile) throw new HttpError(400, 'MISSING_DRAFT_INPUT', 'Thiếu mã hợp đồng hoặc file mẫu.');

    const hopDong = await this.contractRepository.layHopDongMoiNhat(maHopDong, authorization);
    this.kiemTraQuyenHopDong(hopDong, userBranches);
    const mauHopDong = await this.contractRepository.layMauHopDong(templateFile, authorization);
    const duongDanMau = timFileMau(this.config.samplesDir, mauHopDong.TemplateFile);
    const thongTinSetup = await this.layThongTinSetup(authorization);
    const duLieuHopDong = chuyenJsonSau(Object.assign({}, thongTinSetup || {}, hopDong));
    const noiDungFile = taoTaiLieuTuMau(duongDanMau, duLieuHopDong);
    const tenFile = lamSachTenFile(`${maHopDong}_${path.basename(templateFile, path.extname(templateFile))}.docx`);

    const banNhap = await this.draftRepository.taoBanNhapHopDong(noiDungFile, {
      maHopDong,
      branchId: hopDong.BranchID || '',
      templateFile: mauHopDong.TemplateFile,
      fileName: tenFile,
      fileSize: noiDungFile.length,
      userName,
      attachmentUserAutoID: crypto.randomUUID()
    });

    return this.rutGonBanNhap(banNhap);
  }

  async layCauHinhTrinhSua(draftId, userName) {
    const banNhap = await this.draftRepository.layBanNhap(draftId);
    this.kiemTraChuSoHuuBanNhap(banNhap.metadata, userName);

    const token = kyTokenPhienChinhSua({
      draftId,
      editSessionId: banNhap.metadata.editSessionId,
      userName: banNhap.metadata.userName,
      actions: ['file', 'callback']
    }, this.config.signingSecret);

    const fileUrl = `${this.config.documentInternalBaseUrl}/api/contract-drafts/${draftId}/file?token=${encodeURIComponent(token)}`;
    const previewUrl = `${this.config.documentPublicBaseUrl}/api/contract-drafts/${draftId}/file?token=${encodeURIComponent(token)}`;
    const callbackUrl = `${this.config.documentInternalBaseUrl}/api/contract-drafts/${draftId}/callback?token=${encodeURIComponent(token)}`;
    const editorConfig = {
      document: {
        fileType: 'docx',
        key: banNhap.metadata.documentKey,
        title: banNhap.metadata.fileName,
        url: fileUrl,
        permissions: { download: true, edit: true, print: true }
      },
      documentType: 'word',
      editorConfig: {
        callbackUrl,
        mode: 'edit',
        lang: 'vi',
        user: {
          id: crypto.createHash('sha256').update(String(userName)).digest('hex').slice(0, 24),
          name: userName
        },
        customization: { forcesave: true, autosave: true, compactHeader: false }
      },
      height: '100%',
      width: '100%'
    };

    if (this.config.onlyOfficeJwtEnabled) {
      if (!this.config.onlyOfficeJwtSecret) throw new HttpError(500, 'ONLYOFFICE_SECRET_MISSING', 'ONLYOFFICE_JWT_ENABLED=true nhưng chưa có ONLYOFFICE_JWT_SECRET.');
      editorConfig.token = kyJwtOnlyOffice(editorConfig, this.config.onlyOfficeJwtSecret);
    }

    return {
      draft: this.rutGonBanNhap(banNhap.metadata),
      documentServerUrl: this.config.onlyOfficePublicUrl,
      previewUrl,
      editorConfig
    };
  }

  async layDanhSachMauHopDong(authorization) {
    const danhSachMau = await this.contractRepository.layDanhSachMauHopDong(authorization);
    return danhSachMau.map((mauHopDong) => ({
      formName: mauHopDong.FormName,
      loaiHD: mauHopDong.LoaiHD,
      templateFile: mauHopDong.TemplateFile,
      ghiChu: mauHopDong.GhiChu,
      available: fs.existsSync(path.join(this.config.samplesDir, path.basename(mauHopDong.TemplateFile || '')))
    }));
  }

  async luuThayDoiBanNhap(draftId, callbackBody, token) {
    const phien = xacMinhTokenPhienChinhSua(token, this.config.signingSecret);
    if (phien.draftId !== draftId || !phien.actions.includes('callback')) {
      throw new HttpError(401, 'INVALID_CALLBACK_TOKEN', 'Token không thuộc callback của bản nháp này.');
    }

    const banNhap = await this.draftRepository.layBanNhap(draftId);
    if (banNhap.metadata.editSessionId !== phien.editSessionId) {
      throw new HttpError(409, 'EDIT_SESSION_CHANGED', 'Phiên chỉnh sửa đã thay đổi.');
    }

    const status = Number(callbackBody.status);
    if (status === 3 || status === 7) {
      await this.draftRepository.capNhatMetadata(draftId, {
        lastOnlyOfficeStatus: status,
        lastCallbackError: callbackBody.error || 'OnlyOffice báo lỗi lưu tài liệu.'
      });
      return { error: 1 };
    }

    if (status !== 2 && status !== 6) {
      await this.draftRepository.capNhatMetadata(draftId, { lastOnlyOfficeStatus: status });
      return { error: 0 };
    }
    if (!callbackBody.url) throw new HttpError(400, 'CALLBACK_URL_MISSING', 'OnlyOffice không trả URL file đã sửa.');

    const phanHoiFile = await axios.get(callbackBody.url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: Infinity
    });
    const noiDungMoi = Buffer.from(phanHoiFile.data);
    if (noiDungMoi.length === 0) throw new HttpError(502, 'EMPTY_CALLBACK_FILE', 'OnlyOffice trả về file rỗng.');

    await this.draftRepository.luuThayDoiBanNhap(draftId, noiDungMoi, {
      fileSize: noiDungMoi.length,
      lastOnlyOfficeStatus: status,
      forceSaveCompleted: status === 6,
      finalCallbackCompleted: status === 2,
      lastCallbackAt: new Date().toISOString(),
      lastCallbackError: null
    });
    return { error: 0 };
  }

  async kiemTraBanNhapDaDongBo(draftId, userName) {
    const banNhap = await this.draftRepository.layBanNhap(draftId);
    this.kiemTraChuSoHuuBanNhap(banNhap.metadata, userName);
    return this.rutGonBanNhap(banNhap.metadata);
  }

  async luuHopDongVaoCSDL(draftId, { userName, userBranches, authorization }) {
    const banNhap = await this.draftRepository.layNoiDungBanNhap(draftId);
    this.kiemTraChuSoHuuBanNhap(banNhap.metadata, userName);
    const hopDong = await this.contractRepository.layHopDongMoiNhat(banNhap.metadata.maHopDong, authorization);
    this.kiemTraQuyenHopDong(hopDong, userBranches);

    if (!banNhap.metadata.finalCallbackCompleted) {
      throw new HttpError(409, 'DRAFT_NOT_SYNCED', 'Bản nháp chưa nhận callback cuối từ OnlyOffice; file được giữ lại.');
    }

    if (banNhap.metadata.finalized && banNhap.metadata.attachmentUserAutoID) {
      await this.draftRepository.huyBanNhapHopDong(draftId);
      return { UserAutoID: banNhap.metadata.attachmentUserAutoID, retried: true };
    }

    const thongTinFile = {
      IsEdit: 0,
      UserAutoID: banNhap.metadata.attachmentUserAutoID,
      MaHopDong: banNhap.metadata.maHopDong,
      FileName: banNhap.metadata.fileName,
      FileType: 0,
      FileSize: banNhap.buffer.length,
      Content: `0x${banNhap.buffer.toString('hex')}`,
      Base64Content: banNhap.buffer.toString('base64')
    };
    const ketQua = await this.contractRepository.luuHopDongVaoCSDL(thongTinFile, userName, authorization);

    await this.draftRepository.capNhatMetadata(draftId, {
      finalized: true,
      finalizedAt: new Date().toISOString(),
      attachmentUserAutoID: ketQua.UserAutoID
    });
    await this.draftRepository.huyBanNhapHopDong(draftId);
    return { UserAutoID: ketQua.UserAutoID, fileName: banNhap.metadata.fileName };
  }

  async huyBanNhapHopDong(draftId, userName) {
    const banNhap = await this.draftRepository.layBanNhap(draftId);
    this.kiemTraChuSoHuuBanNhap(banNhap.metadata, userName);
    await this.draftRepository.huyBanNhapHopDong(draftId);
  }

  async layDanhSachBanNhap(userName) {
    const danhSach = await this.draftRepository.layDanhSachBanNhap(userName);
    return danhSach.map((banNhap) => this.rutGonBanNhap(banNhap));
  }

  async layDanhSachFileHopDong(maHopDong, userBranches, authorization) {
    if (maHopDong) {
      const hopDong = await this.contractRepository.layHopDongMoiNhat(maHopDong, authorization);
      this.kiemTraQuyenHopDong(hopDong, userBranches);
    }
    const branchId = userBranches === null ? '' : userBranches.join(',');
    return this.contractRepository.layDanhSachFileHopDong(maHopDong || '', branchId, authorization);
  }

  async layMetadataFileHopDong(userAutoID, userBranches, authorization) {
    const metadata = await this.contractRepository.layMetadataFileHopDong(userAutoID, authorization);
    const hopDong = await this.contractRepository.layHopDongMoiNhat(metadata.MaHopDong, authorization);
    this.kiemTraQuyenHopDong(hopDong, userBranches);
    return metadata;
  }

  async layNoiDungFileHopDong(userAutoID, userBranches, authorization) {
    await this.layMetadataFileHopDong(userAutoID, userBranches, authorization);
    return this.contractRepository.layNoiDungFileHopDong(userAutoID, authorization);
  }

  async layFileBanNhapBangToken(draftId, token) {
    const phien = xacMinhTokenPhienChinhSua(token, this.config.signingSecret);
    if (phien.draftId !== draftId || !phien.actions.includes('file')) {
      throw new HttpError(401, 'INVALID_FILE_TOKEN', 'Token không có quyền đọc file bản nháp.');
    }
    const banNhap = await this.draftRepository.layNoiDungBanNhap(draftId);
    if (banNhap.metadata.editSessionId !== phien.editSessionId) throw new HttpError(409, 'EDIT_SESSION_CHANGED', 'Phiên chỉnh sửa đã thay đổi.');
    return banNhap;
  }

  kiemTraQuyenHopDong(hopDong, userBranches) {
    if (!coQuyenChiNhanh(hopDong.BranchID, userBranches)) {
      throw new HttpError(403, 'BRANCH_FORBIDDEN', 'Bạn không có quyền truy cập hợp đồng thuộc chi nhánh này.');
    }
  }

  kiemTraChuSoHuuBanNhap(metadata, userName) {
    if (String(metadata.userName || '').toLowerCase() !== String(userName || '').toLowerCase()) {
      throw new HttpError(403, 'DRAFT_OWNER_FORBIDDEN', 'Bản nháp không thuộc người dùng hiện tại.');
    }
  }

  rutGonBanNhap(metadata) {
    return {
      draftId: metadata.draftId,
      maHopDong: metadata.maHopDong,
      templateFile: metadata.templateFile,
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      finalCallbackCompleted: Boolean(metadata.finalCallbackCompleted),
      forceSaveCompleted: Boolean(metadata.forceSaveCompleted),
      lastOnlyOfficeStatus: metadata.lastOnlyOfficeStatus || null,
      lastCallbackError: metadata.lastCallbackError || null
    };
  }
}
