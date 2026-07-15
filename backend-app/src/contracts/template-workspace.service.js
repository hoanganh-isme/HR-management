/**
 * Trách nhiệm: chỉnh sửa mẫu trong workspace, kiểm tra placeholder và áp dụng có backup.
 * Đầu vào: templateFile, user và callback OnlyOffice.
 * Đầu ra: editor config, danh sách placeholder hoặc kết quả áp dụng mẫu.
 * Nơi gọi: TemplateWorkspaceController.
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { HttpError } from '../shared/http-error.js';
import { kiemTraBienTrongMau as docBienTrongMau } from './docx-template.service.js';
import { kyJwtOnlyOffice, kyTokenPhienChinhSua, xacMinhTokenPhienChinhSua } from './edit-session-token.js';

function signingKeyId(secret) {
  return crypto.createHash('sha256').update(String(secret || '')).digest('hex').slice(0, 16);
}

export class TemplateWorkspaceService {
  constructor({ config, contractRepository, workspaceRepository }) {
    this.config = config;
    this.contractRepository = contractRepository;
    this.workspaceRepository = workspaceRepository;
  }

  async taoPhienChinhSuaMau(templateFile, userName, authorization) {
    const mauHopDong = await this.contractRepository.layMauHopDong(templateFile, authorization);
    const tenFile = path.basename(mauHopDong.TemplateFile || '');
    if (tenFile !== mauHopDong.TemplateFile) throw new HttpError(400, 'INVALID_TEMPLATE_PATH', 'Tên file mẫu không hợp lệ.');
    const duongDanMau = path.join(this.config.samplesDir, tenFile);
    if (!fs.existsSync(duongDanMau)) throw new HttpError(404, 'TEMPLATE_FILE_NOT_FOUND', 'Không tìm thấy file mẫu active.');
    const workspace = await this.workspaceRepository.taoPhienChinhSuaMau(await fsp.readFile(duongDanMau), {
      templateFile: tenFile,
      userName
    });
    return this.rutGonWorkspace(workspace);
  }

  async layCauHinhTrinhSua(workspaceId, userName) {
    let workspace = await this.workspaceRepository.layWorkspace(workspaceId);
    this.kiemTraChuSoHuu(workspace.metadata, userName);
    const currentSigningKeyId = signingKeyId(this.config.signingSecret);
    if (workspace.metadata.signingKeyId !== currentSigningKeyId) {
      const editSessionId = crypto.randomUUID();
      const metadata = await this.workspaceRepository.capNhatMetadata(workspaceId, {
        editSessionId,
        documentKey: crypto.createHash('sha256').update(`template:${workspaceId}:${currentSigningKeyId}`).digest('hex').slice(0, 40),
        signingKeyId: currentSigningKeyId,
        finalCallbackCompleted: false,
        forceSaveCompleted: false,
        lastOnlyOfficeStatus: null
      });
      workspace = Object.assign({}, workspace, { metadata });
    }
    const token = kyTokenPhienChinhSua({
      workspaceId,
      editSessionId: workspace.metadata.editSessionId,
      userName,
      actions: ['template-file', 'template-callback']
    }, this.config.signingSecret);
    const fileUrl = `${this.config.documentInternalBaseUrl}/api/contract-template-workspaces/${workspaceId}/file?token=${encodeURIComponent(token)}`;
    const previewUrl = `${this.config.documentPublicBaseUrl}/api/contract-template-workspaces/${workspaceId}/file?token=${encodeURIComponent(token)}`;
    const callbackUrl = `${this.config.documentInternalBaseUrl}/api/contract-template-workspaces/${workspaceId}/callback?token=${encodeURIComponent(token)}`;
    const editorConfig = {
      document: {
        fileType: 'docx', key: workspace.metadata.documentKey, title: workspace.metadata.templateFile,
        url: fileUrl, permissions: { download: true, edit: true, print: true }
      },
      documentType: 'word',
      editorConfig: {
        callbackUrl, mode: 'edit', lang: 'vi',
        user: { id: crypto.createHash('sha256').update(String(userName)).digest('hex').slice(0, 24), name: userName },
        customization: { forcesave: true, autosave: true, compactHeader: false }
      },
      height: '100%', width: '100%'
    };
    if (this.config.onlyOfficeJwtEnabled) {
      if (!this.config.onlyOfficeJwtSecret) throw new HttpError(500, 'ONLYOFFICE_SECRET_MISSING', 'ONLYOFFICE_JWT_ENABLED=true nhưng chưa có ONLYOFFICE_JWT_SECRET.');
      editorConfig.token = kyJwtOnlyOffice(editorConfig, this.config.onlyOfficeJwtSecret);
    }
    return { workspace: this.rutGonWorkspace(workspace.metadata), documentServerUrl: this.config.onlyOfficePublicUrl, previewUrl, editorConfig };
  }

  async layTrangThai(workspaceId, userName) {
    const workspace = await this.workspaceRepository.layWorkspace(workspaceId);
    this.kiemTraChuSoHuu(workspace.metadata, userName);
    return this.rutGonWorkspace(workspace.metadata);
  }

  async luuThayDoiWorkspace(workspaceId, callbackBody, token) {
    const phien = xacMinhTokenPhienChinhSua(token, this.config.signingSecret);
    if (phien.workspaceId !== workspaceId || !phien.actions.includes('template-callback')) throw new HttpError(401, 'INVALID_TEMPLATE_CALLBACK_TOKEN', 'Token callback mẫu không hợp lệ.');
    const workspace = await this.workspaceRepository.layWorkspace(workspaceId);
    if (workspace.metadata.editSessionId !== phien.editSessionId) throw new HttpError(409, 'TEMPLATE_EDIT_SESSION_CHANGED', 'Phiên chỉnh sửa mẫu đã thay đổi.');
    const status = Number(callbackBody.status);
    if (status === 3 || status === 7) {
      await this.workspaceRepository.capNhatMetadata(workspaceId, {
        lastOnlyOfficeStatus: status,
        lastCallbackError: callbackBody.error || 'OnlyOffice báo lỗi lưu mẫu.'
      });
      return { error: 1 };
    }
    if (status !== 2 && status !== 6) return { error: 0 };
    if (!callbackBody.url) throw new HttpError(400, 'TEMPLATE_CALLBACK_URL_MISSING', 'OnlyOffice không trả URL mẫu đã sửa.');
    const phanHoi = await axios.get(callbackBody.url, { responseType: 'arraybuffer', timeout: 120000, maxContentLength: Infinity });
    const buffer = Buffer.from(phanHoi.data);
    if (!buffer.length) throw new HttpError(502, 'EMPTY_TEMPLATE_CALLBACK_FILE', 'OnlyOffice trả file mẫu rỗng.');
    await this.workspaceRepository.luuThayDoi(workspaceId, buffer, {
      finalCallbackCompleted: status === 2,
      forceSaveCompleted: status === 6,
      lastOnlyOfficeStatus: status,
      lastCallbackAt: new Date().toISOString()
    });
    return { error: 0 };
  }

  async kiemTraBienTrongMau(workspaceId, userName) {
    const workspace = await this.workspaceRepository.layWorkspace(workspaceId);
    this.kiemTraChuSoHuu(workspace.metadata, userName);
    return docBienTrongMau(workspace.duongDan.file);
  }

  async apDungMauHopDong(workspaceId, userName) {
    const workspace = await this.workspaceRepository.layNoiDungWorkspace(workspaceId);
    this.kiemTraChuSoHuu(workspace.metadata, userName);
    if (!workspace.metadata.finalCallbackCompleted && !workspace.metadata.forceSaveCompleted) throw new HttpError(409, 'TEMPLATE_NOT_SYNCED', 'Mẫu chưa nhận callback cuối từ OnlyOffice.');
    const placeholders = docBienTrongMau(workspace.duongDan.file);
    if (!placeholders.length) throw new HttpError(409, 'TEMPLATE_PLACEHOLDERS_MISSING', 'Mẫu không còn placeholder nào; chưa thể áp dụng.');

    const duongDanActive = path.join(this.config.samplesDir, workspace.metadata.templateFile);
    const thuMucBackup = path.join(this.config.samplesDir, 'backups');
    await fsp.mkdir(thuMucBackup, { recursive: true });
    const nhanThoiGian = new Date().toISOString().replace(/[:.]/g, '-');
    const duongDanBackup = path.join(thuMucBackup, `${workspace.metadata.templateFile}.${nhanThoiGian}.bak.docx`);
    await fsp.copyFile(duongDanActive, duongDanBackup);
    const fileMoi = `${duongDanActive}.${workspaceId}.${crypto.randomUUID()}.new`;
    try {
      await fsp.writeFile(fileMoi, workspace.buffer, { flag: 'wx' });
      await fsp.rename(fileMoi, duongDanActive);
    } finally {
      await fsp.rm(fileMoi, { force: true }).catch(() => {});
    }
    await this.workspaceRepository.huyWorkspace(workspaceId);
    return { templateFile: workspace.metadata.templateFile, backupFile: path.basename(duongDanBackup), placeholders };
  }

  async layFileBangToken(workspaceId, token) {
    const phien = xacMinhTokenPhienChinhSua(token, this.config.signingSecret);
    if (phien.workspaceId !== workspaceId || !phien.actions.includes('template-file')) throw new HttpError(401, 'INVALID_TEMPLATE_FILE_TOKEN', 'Token đọc mẫu không hợp lệ.');
    const workspace = await this.workspaceRepository.layNoiDungWorkspace(workspaceId);
    if (workspace.metadata.editSessionId !== phien.editSessionId) throw new HttpError(409, 'TEMPLATE_EDIT_SESSION_CHANGED', 'Phiên chỉnh sửa mẫu đã thay đổi.');
    return workspace;
  }

  async huyWorkspace(workspaceId, userName) {
    const workspace = await this.workspaceRepository.layWorkspace(workspaceId);
    this.kiemTraChuSoHuu(workspace.metadata, userName);
    await this.workspaceRepository.huyWorkspace(workspaceId);
  }

  kiemTraChuSoHuu(metadata, userName) {
    if (String(metadata.userName).toLowerCase() !== String(userName).toLowerCase()) throw new HttpError(403, 'TEMPLATE_WORKSPACE_OWNER_FORBIDDEN', 'Workspace mẫu không thuộc người dùng hiện tại.');
  }

  rutGonWorkspace(metadata) {
    return {
      workspaceId: metadata.workspaceId,
      templateFile: metadata.templateFile,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      finalCallbackCompleted: Boolean(metadata.finalCallbackCompleted),
      forceSaveCompleted: Boolean(metadata.forceSaveCompleted),
      lastOnlyOfficeStatus: metadata.lastOnlyOfficeStatus || null
    };
  }
}
