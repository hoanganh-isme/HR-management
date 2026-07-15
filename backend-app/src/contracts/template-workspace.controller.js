/**
 * Trách nhiệm: khai báo API chỉnh sửa mẫu hợp đồng tách khỏi draft hợp đồng.
 * Đầu vào: Express app, TemplateWorkspaceService và thông tin user hiện tại.
 * Đầu ra: editor config, callback result và kết quả áp dụng mẫu.
 * Nơi gọi: backend-app/server.js.
 */
import { HttpError } from '../shared/http-error.js';

function traLoiLoi(response, error) {
  response.status(error instanceof HttpError ? error.status : 500).json({
    success: false,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Lỗi hệ thống.'
  });
}

export function dangKyTemplateWorkspaceRoutes(app, { service, extractUserName, getUserBranchesFromDB, getUserContractPermissionsFromDB }) {
  async function layNguoiDung(request) {
    if (!request.headers.authorization) throw new HttpError(401, 'AUTH_REQUIRED', 'Yêu cầu đăng nhập để chỉnh sửa mẫu.');
    const userName = extractUserName(request);
    if (!userName || userName === 'system') throw new HttpError(401, 'AUTH_INVALID', 'Không xác định được người dùng hiện tại.');
    await getUserBranchesFromDB(request, { failClosed: true });
    const permission = await getUserContractPermissionsFromDB(request);
    if (!permission || !Number(permission.CanView) || (!Number(permission.CanAdd) && !Number(permission.CanEdit))) {
      throw new HttpError(403, 'CONTRACT_TEMPLATE_EDIT_FORBIDDEN', 'Bạn không có quyền chỉnh sửa mẫu hợp đồng.');
    }
    return { userName, authorization: request.headers.authorization };
  }

  app.post('/api/contract-template-workspaces', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      const workspace = await service.taoPhienChinhSuaMau(request.body.templateFile, nguoiDung.userName, nguoiDung.authorization);
      response.status(201).json({ success: true, workspace });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-template-workspaces/:workspaceId/status', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      response.json({ success: true, workspace: await service.layTrangThai(request.params.workspaceId, nguoiDung.userName) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-template-workspaces/:workspaceId/editor-config', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      response.json(await service.layCauHinhTrinhSua(request.params.workspaceId, nguoiDung.userName));
    } catch (error) { traLoiLoi(response, error); }
  });

  app.get('/api/contract-template-workspaces/:workspaceId/file', async (request, response) => {
    try {
      const workspace = await service.layFileBangToken(request.params.workspaceId, request.query.token);
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      response.setHeader('Content-Length', workspace.buffer.length);
      response.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(workspace.metadata.templateFile)}`);
      response.end(workspace.buffer);
    } catch (error) { traLoiLoi(response, error); }
  });

  app.post('/api/contract-template-workspaces/:workspaceId/callback', async (request, response) => {
    try {
      response.json(await service.luuThayDoiWorkspace(request.params.workspaceId, request.body, request.query.token));
    } catch (error) {
      console.error('[ONLYOFFICE TEMPLATE] Lỗi callback:', error.message);
      response.status(error.status || 500).json({ error: 1, message: error.message });
    }
  });

  app.get('/api/contract-template-workspaces/:workspaceId/placeholders', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      response.json({ success: true, data: await service.kiemTraBienTrongMau(request.params.workspaceId, nguoiDung.userName) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.post('/api/contract-template-workspaces/:workspaceId/apply', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      response.json({ success: true, result: await service.apDungMauHopDong(request.params.workspaceId, nguoiDung.userName) });
    } catch (error) { traLoiLoi(response, error); }
  });

  app.delete('/api/contract-template-workspaces/:workspaceId', async (request, response) => {
    try {
      const nguoiDung = await layNguoiDung(request);
      await service.huyWorkspace(request.params.workspaceId, nguoiDung.userName);
      response.json({ success: true });
    } catch (error) { traLoiLoi(response, error); }
  });
}
