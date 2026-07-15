/**
 * Trách nhiệm: lưu bản sao mẫu đang chỉnh sửa tách biệt khỏi mẫu active.
 * Đầu vào: buffer mẫu, workspaceId và metadata phiên.
 * Đầu ra: workspace cùng đường dẫn file an toàn.
 * Nơi gọi: TemplateWorkspaceService.
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { HttpError } from '../shared/http-error.js';

const DINH_DANG_WORKSPACE_ID = /^[0-9a-f-]{36}$/i;

export class TemplateWorkspaceRepository {
  constructor(workspacesDir) {
    this.workspacesDir = path.resolve(workspacesDir);
    fs.mkdirSync(this.workspacesDir, { recursive: true });
  }

  layDuongDan(workspaceId) {
    if (!DINH_DANG_WORKSPACE_ID.test(String(workspaceId || ''))) throw new HttpError(400, 'INVALID_TEMPLATE_WORKSPACE_ID', 'Mã workspace mẫu không hợp lệ.');
    const thuMuc = path.resolve(this.workspacesDir, workspaceId);
    if (!thuMuc.startsWith(this.workspacesDir + path.sep)) throw new HttpError(400, 'INVALID_TEMPLATE_WORKSPACE_PATH', 'Đường dẫn workspace mẫu không hợp lệ.');
    return { thuMuc, file: path.join(thuMuc, 'template.docx'), metadata: path.join(thuMuc, 'metadata.json') };
  }

  async taoPhienChinhSuaMau(noiDungFile, metadata) {
    const workspaceId = crypto.randomUUID();
    const duongDan = this.layDuongDan(workspaceId);
    const metadataDayDu = Object.assign({}, metadata, {
      workspaceId,
      editSessionId: crypto.randomUUID(),
      documentKey: crypto.createHash('sha256').update(`template:${workspaceId}`).digest('hex').slice(0, 40),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalCallbackCompleted: false,
      applied: false
    });
    await fsp.mkdir(duongDan.thuMuc, { recursive: false });
    await fsp.writeFile(duongDan.file, noiDungFile, { flag: 'wx' });
    await this.ghiMetadata(duongDan.metadata, metadataDayDu);
    return metadataDayDu;
  }

  async layWorkspace(workspaceId) {
    const duongDan = this.layDuongDan(workspaceId);
    try {
      const metadata = JSON.parse(await fsp.readFile(duongDan.metadata, 'utf8'));
      return { metadata, duongDan };
    } catch (error) {
      if (error.code === 'ENOENT') throw new HttpError(404, 'TEMPLATE_WORKSPACE_NOT_FOUND', 'Không tìm thấy workspace chỉnh sửa mẫu.');
      throw error;
    }
  }

  async layNoiDungWorkspace(workspaceId) {
    const workspace = await this.layWorkspace(workspaceId);
    return { metadata: workspace.metadata, duongDan: workspace.duongDan, buffer: await fsp.readFile(workspace.duongDan.file) };
  }

  async luuThayDoi(workspaceId, noiDungFile, thayDoiMetadata) {
    const workspace = await this.layWorkspace(workspaceId);
    const fileMoi = `${workspace.duongDan.file}.new`;
    await fsp.writeFile(fileMoi, noiDungFile);
    await fsp.rename(fileMoi, workspace.duongDan.file);
    const metadataMoi = Object.assign({}, workspace.metadata, thayDoiMetadata, { updatedAt: new Date().toISOString() });
    await this.ghiMetadata(workspace.duongDan.metadata, metadataMoi);
    return metadataMoi;
  }

  async huyWorkspace(workspaceId) {
    const duongDan = this.layDuongDan(workspaceId);
    await fsp.rm(duongDan.thuMuc, { recursive: true, force: true });
  }

  async ghiMetadata(duongDanMetadata, metadata) {
    const fileMoi = `${duongDanMetadata}.new`;
    await fsp.writeFile(fileMoi, JSON.stringify(metadata, null, 2), 'utf8');
    await fsp.rename(fileMoi, duongDanMetadata);
  }
}

