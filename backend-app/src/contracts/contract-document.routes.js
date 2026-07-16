import express from 'express';

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function decodeUserName(authorization) {
    const token = String(authorization || '').replace(/^Bearer\s+/i, '');
    const parts = token.split('.');
    if (parts.length !== 3) return '';
    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        return String(payload.UserName || payload.username || payload.unique_name || payload.name || payload.sub || '').trim();
    } catch {
        return '';
    }
}

async function requestContext(req, service) {
    const authorization = String(req.headers.authorization || '');
    if (!authorization) throw createError('Cần đăng nhập để sử dụng chức năng tài liệu hợp đồng.', 401);
    const claimedUserName = String(req.headers.username || '').trim() || decodeUserName(authorization);
    return service.authenticateContext(authorization, claimedUserName);
}

function extractMultipartFile(buffer, contentType) {
    const boundaryMatch = String(contentType || '').match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) throw createError('Multipart upload thiếu boundary.');
    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd < 0) throw createError('Multipart upload không có phần nội dung file.');
    const dataStart = headerEnd + 4;
    const dataEnd = buffer.indexOf(Buffer.from(`\r\n--${boundary}`), dataStart);
    if (dataEnd < dataStart) throw createError('Multipart upload không kết thúc đúng định dạng.');
    return buffer.subarray(dataStart, dataEnd);
}

function uploadedBuffer(req) {
    if (!Buffer.isBuffer(req.body)) throw createError('Thiếu nội dung file DOCX.');
    if (String(req.headers['content-type'] || '').toLowerCase().startsWith('multipart/form-data')) {
        return extractMultipartFile(req.body, req.headers['content-type']);
    }
    return req.body;
}

function sendDocx(res, document, download) {
    const safeName = String(document.metadata.fileName || document.metadata.templateFile || 'document.docx').replace(/["\r\n]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Length', document.buffer.length);
    res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${safeName}"`);
    res.send(document.buffer);
}

export function createContractDocumentRouter(config, service) {
    const router = express.Router();
    const rawUpload = express.raw({
        type: [
            'application/octet-stream',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'multipart/form-data'
        ],
        limit: config.maxDocxSizeBytes + 1024 * 1024
    });

    router.get('/contract-templates', asyncRoute(async (req, res) => {
        res.json({ success: true, data: await service.getTemplates(await requestContext(req, service)) });
    }));

    router.post('/contract-drafts', asyncRoute(async (req, res) => {
        const draft = await service.createDraft(await requestContext(req, service), req.body);
        res.status(201).json({ success: true, data: draft });
    }));

    router.get('/contract-drafts/:draftId/editor', asyncRoute(async (req, res) => {
        const editor = await service.getDraftEditor(await requestContext(req, service), req.params.draftId);
        res.json({ success: true, data: editor });
    }));

    router.get('/contract-drafts/:draftId/file', asyncRoute(async (req, res) => {
        const document = await service.getDraftFile(req.params.draftId, req.query.token);
        sendDocx(res, document, req.query.download === '1');
    }));

    router.put('/contract-drafts/:draftId/file', rawUpload, asyncRoute(async (req, res) => {
        const metadata = await service.uploadDraft(await requestContext(req, service), req.params.draftId, uploadedBuffer(req));
        res.json({ success: true, data: metadata });
    }));

    router.post('/contract-drafts/:draftId/callback', asyncRoute(async (req, res) => {
        try {
            await service.handleDraftCallback(
                req.params.draftId,
                req.query.token,
                req.body,
                req.headers.authorization
            );
        } catch (error) {
            console.error('[CONTRACT DRAFT CALLBACK]', error.message);
        }
        res.json({ error: 0 });
    }));

    router.post('/contract-drafts/:draftId/finalize', asyncRoute(async (req, res) => {
        const result = await service.finalizeDraft(await requestContext(req, service), req.params.draftId);
        res.json({ success: true, data: result });
    }));

    router.post('/contract-template-workspaces', asyncRoute(async (req, res) => {
        const workspace = await service.createTemplateWorkspace(await requestContext(req, service), req.body);
        res.status(201).json({ success: true, data: workspace });
    }));

    router.get('/contract-template-workspaces/:workspaceId/editor', asyncRoute(async (req, res) => {
        const editor = await service.getTemplateWorkspaceEditor(await requestContext(req, service), req.params.workspaceId);
        res.json({ success: true, data: editor });
    }));

    router.get('/contract-template-workspaces/:workspaceId/file', asyncRoute(async (req, res) => {
        const document = await service.getTemplateWorkspaceFile(req.params.workspaceId, req.query.token);
        sendDocx(res, document, req.query.download === '1');
    }));

    router.put('/contract-template-workspaces/:workspaceId/file', rawUpload, asyncRoute(async (req, res) => {
        const metadata = await service.uploadTemplateWorkspace(await requestContext(req, service), req.params.workspaceId, uploadedBuffer(req));
        res.json({ success: true, data: metadata });
    }));

    router.post('/contract-template-workspaces/:workspaceId/callback', asyncRoute(async (req, res) => {
        try {
            await service.handleTemplateWorkspaceCallback(
                req.params.workspaceId,
                req.query.token,
                req.body,
                req.headers.authorization
            );
        } catch (error) {
            console.error('[CONTRACT TEMPLATE CALLBACK]', error.message);
        }
        res.json({ error: 0 });
    }));

    router.get('/contract-template-workspaces/:workspaceId/placeholders', asyncRoute(async (req, res) => {
        const result = await service.validateTemplateWorkspace(await requestContext(req, service), req.params.workspaceId);
        res.json({ success: true, data: result });
    }));

    router.post('/contract-template-workspaces/:workspaceId/apply', asyncRoute(async (req, res) => {
        const result = await service.applyTemplateWorkspace(await requestContext(req, service), req.params.workspaceId);
        res.json({ success: true, data: result });
    }));

    router.delete('/contract-template-workspaces/:workspaceId', asyncRoute(async (req, res) => {
        await service.closeTemplateWorkspace(await requestContext(req, service), req.params.workspaceId);
        res.json({ success: true });
    }));

    router.use((error, req, res, next) => {
        if (res.headersSent) return next(error);
        const status = Number(error.statusCode) || 500;
        if (status >= 500) console.error('[CONTRACT DOCUMENT API]', error.message);
        res.status(status).json({ success: false, message: error.message || 'Lỗi Document API.' });
    });

    return router;
}
