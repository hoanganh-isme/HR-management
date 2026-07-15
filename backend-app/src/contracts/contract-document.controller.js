/**
 * Trách nhiệm: khai báo HTTP API cho draft và attachment hợp đồng.
 * Đầu vào: Express app, service và hàm xác thực hiện có của backend.
 * Đầu ra: JSON, editor config hoặc binary stream đúng quyền.
 * Nơi gọi: backend-app/server.js.
 */
import path from 'path';
import { HttpError } from '../shared/http-error.js';

function layMimeType(fileName) {
  const phanMoRong = path.extname(String(fileName || '')).toLowerCase();
  const bangMime = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  };
  return bangMime[phanMoRong] || 'application/octet-stream';
}

function chuyenNoiDungThanhBuffer(fileHopDong) {
  const content = fileHopDong.Content || fileHopDong.content;
  if (content) {
    if (Buffer.isBuffer(content)) return content;
    if (typeof content === 'object' && content.data) return Buffer.from(content.data);
    const chuoiContent = String(content).trim();
    if (/^0x/i.test(chuoiContent)) return Buffer.from(chuoiContent.slice(2), 'hex');
    return Buffer.from(chuoiContent.replace(/^data:[^;]+;base64,/, ''), 'base64');
  }
  const base64Content = fileHopDong.Base64Content || fileHopDong.base64Content;
  if (base64Content) return Buffer.from(String(base64Content).replace(/^data:[^;]+;base64,/, ''), 'base64');
  throw new HttpError(404, 'ATTACHMENT_CONTENT_EMPTY', 'File hợp đồng không có nội dung.');
}

function traLoiLoi(response, error) {
  const status = error instanceof HttpError ? error.status : 500;
  response.status(status).json({
    success: false,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Lỗi hệ thống.',
    details: error instanceof HttpError ? error.details : undefined
  });
}

export function dangKyContractDocumentRoutes(app, { service, extractUserName, getUserBranchesFromDB, getUserContractPermissionsFromDB }) {
  async function layNguoiDung(request, canEdit) {
    if (!request.headers.authorization) throw new HttpError(401, 'AUTH_REQUIRED', 'Yêu cầu đăng nhập để sử dụng chức năng hợp đồng.');
    const userName = extractUserName(request);
    if (!userName || userName === 'system') throw new HttpError(401, 'AUTH_INVALID', 'Không xác định được người dùng hiện tại.');
    const permission = await getUserContractPermissionsFromDB(request);
    if (!permission || !Number(permission.CanView)) throw new HttpError(403, 'CONTRACT_VIEW_FORBIDDEN', 'Bạn không có quyền xem chức năng hợp đồng.');
    if (canEdit && !Number(permission.CanAdd) && !Number(permission.CanEdit)) {
      throw new HttpError(403, 'CONTRACT_EDIT_FORBIDDEN', 'Bạn không có quyền tạo hoặc cập nhật tài liệu hợp đồng.');
    }
    // Branch scope is enforced by the authenticated SQL Gateway request. Do not
    // make document routes depend on a SY_User View API that may not exist.
    return { userName, userBranches: null, authorization: request.headers.authorization, permission };
  }

  app.post('/api/contract-drafts', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, true);
      const draft = await service.taoBanNhapHopDong(Object.assign({}, request.body, nguoiDung));
      response.status(201).json({ success: true, draft });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-drafts', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      response.json({ success: true, data: await service.layDanhSachBanNhap(nguoiDung.userName) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-templates', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      response.json({ success: true, data: await service.layDanhSachMauHopDong(nguoiDung.authorization) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-drafts/:draftId/status', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      response.json({ success: true, draft: await service.kiemTraBanNhapDaDongBo(request.params.draftId, nguoiDung.userName) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-drafts/:draftId/editor-config', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      response.json(await service.layCauHinhTrinhSua(request.params.draftId, nguoiDung.userName));
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-drafts/:draftId/file', async (request, response) => {
    try {
      const banNhap = await service.layFileBanNhapBangToken(request.params.draftId, request.query.token);
      response.setHeader('Content-Type', layMimeType(banNhap.metadata.fileName));
      response.setHeader('Content-Length', banNhap.buffer.length);
      response.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(banNhap.metadata.fileName)}`);
      response.end(banNhap.buffer);
    } catch (error) { traLoiLoi(response, error); }
  });

  app.post('/api/contract-drafts/:draftId/callback', async (request, response) => {
    try {
      const ketQua = await service.luuThayDoiBanNhap(request.params.draftId, request.body, request.query.token);
      response.json(ketQua);
    } catch (error) {
      console.error('[ONLYOFFICE DRAFT] Lỗi callback:', error.message);
      response.status(error.status || 500).json({ error: 1, message: error.message });
    }
  });

  app.post('/api/contract-drafts/:draftId/finalize', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, true);
      const attachment = await service.luuHopDongVaoCSDL(request.params.draftId, nguoiDung);
      response.json({ success: true, attachment });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.delete('/api/contract-drafts/:draftId', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, true);
      await service.huyBanNhapHopDong(request.params.draftId, nguoiDung.userName);
      response.json({ success: true });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-attachments', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      const danhSach = await service.layDanhSachFileHopDong(request.query.maHopDong || '', nguoiDung.userBranches, nguoiDung.authorization);
      response.json({ success: true, data: danhSach });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-attachments/:userAutoID', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      const metadata = await service.layMetadataFileHopDong(request.params.userAutoID, nguoiDung.userBranches, nguoiDung.authorization);
      response.json({ success: true, data: metadata });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-attachments/:userAutoID/file', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request, false);
      const fileHopDong = await service.layNoiDungFileHopDong(request.params.userAutoID, nguoiDung.userBranches, nguoiDung.authorization);
      const buffer = chuyenNoiDungThanhBuffer(fileHopDong);
      response.setHeader('Content-Type', layMimeType(fileHopDong.FileName));
      response.setHeader('Content-Length', buffer.length);
      response.setHeader('Content-Disposition', `${request.query.download === '1' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(fileHopDong.FileName || 'hop-dong')}`);
      response.end(buffer);
    } catch (error) { traLoiLoi(response, error); }
  });
}
