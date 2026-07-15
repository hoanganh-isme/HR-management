/**
 * Trách nhiệm: lưu file DOCX và metadata bản nháp trên filesystem an toàn.
 * Đầu vào: draftId, buffer tài liệu và metadata.
 * Đầu ra: bản nháp đã đọc/cập nhật hoặc danh sách bản nháp.
 * Nơi gọi: ContractDocumentService.
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { HttpError } from '../shared/http-error.js';

const DINH_DANG_ID = /^[0-9a-f-]{36}$/i;

export class ContractDraftRepository {
  constructor(draftsDir) {
    this.draftsDir = path.resolve(draftsDir);
    this.writeLocks = new Map();
    fs.mkdirSync(this.draftsDir, { recursive: true });
  }

  async withWriteLock(draftId, operation) {
    const previous = this.writeLocks.get(draftId) || Promise.resolve();
    const current = previous.catch(() => {}).then(operation);
    this.writeLocks.set(draftId, current);
    try { return await current; }
    finally {
      if (this.writeLocks.get(draftId) === current) this.writeLocks.delete(draftId);
    }
  }

  layDuongDanBanNhap(draftId) {
    if (!DINH_DANG_ID.test(String(draftId || ''))) {
      throw new HttpError(400, 'INVALID_DRAFT_ID', 'Mã bản nháp không hợp lệ.');
    }
    const thuMuc = path.resolve(this.draftsDir, draftId);
    if (!thuMuc.startsWith(this.draftsDir + path.sep)) {
      throw new HttpError(400, 'INVALID_DRAFT_PATH', 'Đường dẫn bản nháp không hợp lệ.');
    }
    return {
      thuMuc,
      file: path.join(thuMuc, 'contract.docx'),
      metadata: path.join(thuMuc, 'metadata.json')
    };
  }

  async taoBanNhapHopDong(noiDungFile, metadata) {
    const draftId = crypto.randomUUID();
    const duongDan = this.layDuongDanBanNhap(draftId);
    await fsp.mkdir(duongDan.thuMuc, { recursive: false });

    const metadataDayDu = Object.assign({}, metadata, {
      draftId,
      editSessionId: crypto.randomUUID(),
      documentKey: crypto.createHash('sha256').update(`contract:${draftId}`).digest('hex').slice(0, 40),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalCallbackCompleted: false,
      forceSaveCompleted: false,
      finalized: false
    });

    await fsp.writeFile(duongDan.file, noiDungFile, { flag: 'wx' });
    await this.ghiMetadata(duongDan.metadata, metadataDayDu);
    return metadataDayDu;
  }

  async layBanNhap(draftId) {
    const duongDan = this.layDuongDanBanNhap(draftId);
    try {
      const noiDung = await fsp.readFile(duongDan.metadata, 'utf8');
      return { metadata: JSON.parse(noiDung), duongDan };
    } catch (error) {
      if (error.code === 'ENOENT') throw new HttpError(404, 'DRAFT_NOT_FOUND', 'Không tìm thấy bản nháp hợp đồng.');
      throw error;
    }
  }

  async layNoiDungBanNhap(draftId) {
    const banNhap = await this.layBanNhap(draftId);
    try {
      return { metadata: banNhap.metadata, buffer: await fsp.readFile(banNhap.duongDan.file) };
    } catch (error) {
      if (error.code === 'ENOENT') throw new HttpError(409, 'DRAFT_FILE_MISSING', 'File của bản nháp không còn tồn tại.');
      throw error;
    }
  }

  async luuThayDoiBanNhap(draftId, noiDungFile, thayDoiMetadata) {
    return this.withWriteLock(draftId, async () => {
      const banNhap = await this.layBanNhap(draftId);
      const fileMoi = `${banNhap.duongDan.file}.${process.pid}.${crypto.randomUUID()}.new`;
      await fsp.writeFile(fileMoi, noiDungFile, { flag: 'wx' });
      try { await fsp.rename(fileMoi, banNhap.duongDan.file); }
      finally { await fsp.rm(fileMoi, { force: true }).catch(() => {}); }
      return this.capNhatMetadataUnlocked(banNhap, thayDoiMetadata);
    });
  }

  async capNhatMetadata(draftId, thayDoi) {
    return this.withWriteLock(draftId, async () => this.capNhatMetadataUnlocked(await this.layBanNhap(draftId), thayDoi));
  }

  async capNhatMetadataUnlocked(banNhap, thayDoi) {
    const metadataMoi = Object.assign({}, banNhap.metadata, thayDoi, { updatedAt: new Date().toISOString() });
    if (banNhap.metadata.finalCallbackCompleted === true) metadataMoi.finalCallbackCompleted = true;
    if (banNhap.metadata.forceSaveCompleted === true) metadataMoi.forceSaveCompleted = true;
    await this.ghiMetadata(banNhap.duongDan.metadata, metadataMoi);
    return metadataMoi;
  }

  async layDanhSachBanNhap(userName) {
    const cacThuMuc = await fsp.readdir(this.draftsDir, { withFileTypes: true });
    const ketQua = [];
    for (const thuMuc of cacThuMuc) {
      if (!thuMuc.isDirectory() || !DINH_DANG_ID.test(thuMuc.name)) continue;
      try {
        const banNhap = await this.layBanNhap(thuMuc.name);
        if (!userName || String(banNhap.metadata.userName).toLowerCase() === String(userName).toLowerCase()) {
          ketQua.push(banNhap.metadata);
        }
      } catch (error) {
        console.warn(`[DRAFT] Bỏ qua bản nháp lỗi ${thuMuc.name}: ${error.message}`);
      }
    }
    return ketQua.sort((trai, phai) => String(phai.updatedAt).localeCompare(String(trai.updatedAt)));
  }

  async huyBanNhapHopDong(draftId) {
    const duongDan = this.layDuongDanBanNhap(draftId);
    await fsp.rm(duongDan.thuMuc, { recursive: true, force: true });
  }

  async ghiMetadata(duongDanMetadata, metadata) {
    const fileMoi = `${duongDanMetadata}.${process.pid}.${crypto.randomUUID()}.new`;
    await fsp.writeFile(fileMoi, JSON.stringify(metadata, null, 2), { encoding: 'utf8', flag: 'wx' });
    try { await fsp.rename(fileMoi, duongDanMetadata); }
    finally { await fsp.rm(fileMoi, { force: true }).catch(() => {}); }
  }
}

