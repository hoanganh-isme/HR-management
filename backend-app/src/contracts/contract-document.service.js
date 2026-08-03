import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs/promises';
import { listDocxPlaceholders, renderDocxTemplate, validateDocx } from './docx-template.js';

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function safeFilePart(value) {
    return String(value || '')
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9_.-]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'hop-dong';
}

function sameUser(left, right) {
    return String(left || '').toLowerCase() === String(right || '').toLowerCase();
}

function base64UrlJson(value) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function createContractDocumentService(config, store, db) {
    function assertOwner(metadata, context) {
        if (!context?.userName || !sameUser(metadata.userName, context.userName)) {
            throw createError('Workspace không thuộc người dùng hiện tại.', 403);
        }
    }

    function createSignedToken(subject, purpose) {
        const expires = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
        const content = `${subject}|${purpose}|${expires}`;
        const signature = crypto.createHmac('sha256', config.draftSigningSecret).update(content).digest('base64url');
        return `${expires}.${signature}`;
    }

    function verifySignedToken(subject, purpose, token) {
        const [expiresText, signature] = String(token || '').split('.');
        const expires = Number(expiresText);
        if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000) || !signature) {
            throw createError('Liên kết tài liệu đã hết hạn hoặc không hợp lệ.', 403);
        }
        const content = `${subject}|${purpose}|${expires}`;
        const expected = crypto.createHmac('sha256', config.draftSigningSecret).update(content).digest('base64url');
        const actualBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expected);
        if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
            throw createError('Chữ ký liên kết tài liệu không hợp lệ.', 403);
        }
    }

    function signOnlyOfficeConfig(editorConfig) {
        if (!config.onlyOfficeJwtEnabled) return editorConfig;
        const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
        const payload = base64UrlJson(editorConfig);
        const signature = crypto
            .createHmac('sha256', config.onlyOfficeJwtSecret)
            .update(`${header}.${payload}`)
            .digest('base64url');
        return { ...editorConfig, token: `${header}.${payload}.${signature}` };
    }

    function verifyOnlyOfficeJwt(authorization, bodyToken) {
        if (!config.onlyOfficeJwtEnabled) return;
        const raw = bodyToken || String(authorization || '').replace(/^Bearer\s+/i, '');
        const parts = String(raw || '').split('.');
        if (parts.length !== 3) throw createError('OnlyOffice callback thiếu JWT hợp lệ.', 403);
        const expected = crypto
            .createHmac('sha256', config.onlyOfficeJwtSecret)
            .update(`${parts[0]}.${parts[1]}`)
            .digest('base64url');
        const actualBuffer = Buffer.from(parts[2]);
        const expectedBuffer = Buffer.from(expected);
        if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
            throw createError('OnlyOffice callback có JWT không hợp lệ.', 403);
        }
    }

    async function downloadOnlyOfficeFile(rawUrl) {
        if (!rawUrl) throw createError('OnlyOffice callback không có URL file.', 400);
        let downloadUrl = rawUrl;
        try {
            const parsed = new URL(rawUrl);
            const publicParsed = new URL(config.onlyOfficePublicUrl);
            parsed.protocol = publicParsed.protocol;
            parsed.hostname = publicParsed.hostname;
            parsed.port = publicParsed.port;
            downloadUrl = parsed.toString();
        } catch {
            downloadUrl = rawUrl;
        }
        console.log(`[OnlyOffice Download] Fetching file from: ${downloadUrl} (original: ${rawUrl})`);
        const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            maxContentLength: config.maxDocxSizeBytes,
            maxBodyLength: config.maxDocxSizeBytes
        });
        const buffer = Buffer.from(response.data);
        validateDocx(buffer, config.maxDocxSizeBytes);
        return buffer;
    }

    async function getTemplates(context) {
        let rows = [];
        try {
            rows = await db.listTemplates(context);
        } catch {
            rows = [];
        }
        const templates = [];
        const seenFiles = new Set();
        for (const row of rows) {
            const templateFile = row.TemplateFile || row.templateFile || row.templatefile;
            if (!templateFile) continue;
            seenFiles.add(String(templateFile).toLowerCase());
            let available = true;
            try {
                await store.resolveTemplate(templateFile);
            } catch {
                available = false;
            }
            templates.push({
                formName: row.FormName || row.formName || config.contractFormName,
                loaiHD: row.LoaiHD || row.loaiHD || '',
                templateFile,
                description: row.GhiChu || row.ghiChu || '',
                available
            });
        }

        try {
            const sampleFiles = await fs.readdir(config.samplesDir);
            for (const file of sampleFiles) {
                if (file.toLowerCase().endsWith('.docx') && !seenFiles.has(file.toLowerCase())) {
                    seenFiles.add(file.toLowerCase());
                    templates.push({
                        formName: config.contractFormName,
                        loaiHD: '',
                        templateFile: file,
                        description: file,
                        available: true
                    });
                }
            }
        } catch {
            /* ignore read dir error */
        }

        return templates;
    }

    function resolveTemplateFileName(input) {
        if (!input) return '';
        if (typeof input === 'string') return input.trim();
        if (typeof input === 'object') {
            return String(input.templateFile || input.templateFileName || input.template || input.fileName || '').trim();
        }
        return String(input).trim();
    }

    async function requireRegisteredTemplate(context, input) {
        const templateFile = resolveTemplateFileName(input);
        if (!templateFile) throw createError('Thiếu tên file mẫu hợp đồng (templateFile).', 400);
        const templates = await getTemplates(context);
        const registered = templates.find((item) =>
            String(item.templateFile).toLowerCase() === templateFile.toLowerCase()
        );
        if (registered) {
            if (!registered.available) throw createError('File mẫu ' + templateFile + ' không tồn tại trong backend-app/samples.', 404);
            return registered;
        }
        try {
            const resolved = await store.resolveTemplate(templateFile);
            return {
                formName: config.contractFormName,
                loaiHD: '',
                templateFile: resolved.fileName,
                description: resolved.fileName,
                available: true
            };
        } catch {
            throw createError('Mẫu hợp đồng "' + templateFile + '" chưa có file DOCX trong thư mục backend-app/samples.', 404);
        }
    }

    async function createDraft(context, input) {
        const maHopDong = String(input?.maHopDong || '').trim();
        if (!maHopDong) throw createError('Thiếu mã hợp đồng.');
        const template = await requireRegisteredTemplate(context, input?.templateFile);
        const { contract } = await db.assertContractAccess(context, maHopDong, true);
        const resolvedTemplate = await store.resolveTemplate(template.templateFile);
        const templateBuffer = await fs.readFile(resolvedTemplate.filePath);
        const rendered = renderDocxTemplate(templateBuffer, contract, config.maxDocxSizeBytes);
        const now = new Date().toISOString();
        const draftId = crypto.randomUUID();
        const metadata = {
            draftId,
            maHopDong,
            templateFile: resolvedTemplate.fileName,
            fileName: `${safeFilePart(maHopDong)}_${safeFilePart(resolvedTemplate.fileName)}`,
            fileSize: rendered.length,
            branchId: contract.BranchID || contract.branchID || contract.branchId || '',
            userName: context.userName,
            documentKey: crypto.randomUUID(),
            attachmentUserAutoID: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            finalCallbackCompleted: false,
            forceSaveCompleted: false,
            manualUploadCompleted: false,
            finalized: false,
            lastOnlyOfficeStatus: null,
            lastCallbackError: ''
        };
        await store.createDraft(metadata, rendered);
        return metadata;
    }

    function buildEditorConfig(metadata, subjectType) {
        const isDraft = subjectType === 'draft';
        const subjectId = isDraft ? metadata.draftId : metadata.workspaceId;
        const routeBase = isDraft ? 'contract-drafts' : 'contract-template-workspaces';
        const fileToken = createSignedToken(subjectId, `${subjectType}-file`);
        const callbackToken = createSignedToken(subjectId, `${subjectType}-callback`);
        const browserFileUrl = `${config.documentPublicBaseUrl}/api/${routeBase}/${subjectId}/file?token=${encodeURIComponent(fileToken)}`;
        const internalFileUrl = `${config.documentInternalBaseUrl}/api/${routeBase}/${subjectId}/file?token=${encodeURIComponent(fileToken)}`;
        const callbackUrl = `${config.documentInternalBaseUrl}/api/${routeBase}/${subjectId}/callback?token=${encodeURIComponent(callbackToken)}`;
        const title = isDraft ? metadata.fileName : metadata.templateFile;
        const canEdit = isDraft ? !metadata.finalized : true;
        const editor = {
            document: {
                fileType: 'docx',
                key: metadata.documentKey,
                title,
                url: internalFileUrl,
                permissions: { edit: canEdit, download: true, print: true, copy: true }
            },
            documentType: 'word',
            editorConfig: {
                mode: canEdit ? 'edit' : 'view',
                callbackUrl,
                lang: 'vi',
                user: {
                    id: crypto.createHash('sha256').update(metadata.userName).digest('hex').slice(0, 24),
                    name: metadata.userName
                },
                customization: { forcesave: true, compactHeader: true, compactToolbar: false, zoom: 100 }
            }
        };
        return {
            onlyOfficePublicUrl: config.onlyOfficePublicUrl,
            editorConfig: signOnlyOfficeConfig(editor),
            previewUrl: browserFileUrl,
            downloadUrl: `${browserFileUrl}&download=1`,
            metadata
        };
    }

    async function getDraftEditor(context, draftId) {
        const { metadata } = await store.readDraft(draftId);
        assertOwner(metadata, context);
        return buildEditorConfig(metadata, 'draft');
    }

    async function getDraftFile(draftId, token) {
        verifySignedToken(draftId, 'draft-file', token);
        const { metadata } = await store.readDraft(draftId);
        return { buffer: await store.readDraftFile(draftId), metadata };
    }

    async function uploadDraft(context, draftId, buffer) {
        const { metadata } = await store.readDraft(draftId);
        assertOwner(metadata, context);
        if (metadata.finalized) throw createError('Bản nháp đã finalize nên không thể ghi đè.', 409);
        validateDocx(buffer, config.maxDocxSizeBytes);
        return store.updateDraftFile(draftId, buffer, {
            documentKey: crypto.randomUUID(),
            manualUploadCompleted: true,
            lastCallbackError: ''
        });
    }

    async function handleDraftCallback(draftId, token, body, authorization) {
        verifySignedToken(draftId, 'draft-callback', token);
        verifyOnlyOfficeJwt(authorization, body?.token);
        const status = Number(body?.status);
        try {
            if (status === 2 || status === 6) {
                const buffer = await downloadOnlyOfficeFile(body.url);
                await store.updateDraftFile(draftId, buffer, {
                    documentKey: crypto.randomUUID(),
                    finalCallbackCompleted: status === 2,
                    forceSaveCompleted: status === 6,
                    lastOnlyOfficeStatus: status,
                    lastCallbackError: ''
                });
            } else if (status === 3 || status === 7) {
                await store.updateDraftMetadata(draftId, {
                    lastOnlyOfficeStatus: status,
                    lastCallbackError: `OnlyOffice trả trạng thái lỗi ${status}.`
                });
            } else {
                await store.updateDraftMetadata(draftId, { lastOnlyOfficeStatus: status || null });
            }
        } catch (error) {
            await store.updateDraftMetadata(draftId, {
                lastOnlyOfficeStatus: status || null,
                lastCallbackError: error.message
            }).catch(() => {});
            throw error;
        }
    }

    async function finalizeDraft(context, draftId) {
        const { metadata } = await store.readDraft(draftId);
        assertOwner(metadata, context);
        const { contract } = await db.assertContractAccess(context, metadata.maHopDong, true);
        const contractBranch = String(contract.BranchID || contract.branchID || contract.branchId || '').trim().toUpperCase();
        const originalBranch = String(metadata.branchId || '').trim().toUpperCase();
        if (contractBranch !== originalBranch) throw createError('Chi nhánh hợp đồng đã thay đổi; không thể finalize bản nháp cũ.', 409);

        const buffer = await store.readDraftFile(draftId);
        if (!buffer || buffer.length === 0) {
            throw createError('Không tìm thấy file DOCX của bản nháp.', 404);
        }
        validateDocx(buffer, config.maxDocxSizeBytes);
        const existing = await db.findAttachment(context, metadata.maHopDong, metadata.attachmentUserAutoID);
        if (existing) {
            if (!sameUser(existing.MaHopDong, metadata.maHopDong)) {
                throw createError('Attachment ID của draft đã tồn tại ở hợp đồng khác.', 409);
            }
            const finalized = await store.updateDraftMetadata(draftId, { finalized: true });
            return {
                attachment: existing,
                draft: finalized
            };
        }

        const attachment = await db.saveAttachment(context, {
            maHopDong: metadata.maHopDong,
            attachmentUserAutoID: metadata.attachmentUserAutoID,
            fileName: metadata.fileName,
            fileBuffer: buffer,
            userName: context.userName
        });
        const finalized = await store.updateDraftMetadata(draftId, { finalized: true });
        return {
            attachment,
            draft: finalized
        };
    }

    async function createTemplateWorkspace(context, input) {
        const templateFile = resolveTemplateFileName(input);
        const template = await requireRegisteredTemplate(context, templateFile);
        const targetFile = template.templateFile || template.fileName;
        const resolved = await store.resolveTemplate(targetFile);
        const buffer = await fs.readFile(resolved.filePath);
        const workspaceId = crypto.randomUUID();
        const now = new Date().toISOString();
        const metadata = {
            workspaceId,
            templateFile: resolved.fileName,
            userName: context.userName,
            documentKey: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            finalCallbackCompleted: false,
            forceSaveCompleted: false,
            manualUploadCompleted: false,
            lastOnlyOfficeStatus: null,
            lastCallbackError: ''
        };
        await store.createTemplateWorkspace(metadata, buffer);
        return metadata;
    }

    async function getTemplateWorkspaceEditor(context, workspaceId) {
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        assertOwner(metadata, context);
        return buildEditorConfig(metadata, 'template');
    }

    async function getTemplateWorkspaceFile(workspaceId, token) {
        verifySignedToken(workspaceId, 'template-file', token);
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        return { buffer: await store.readTemplateWorkspaceFile(workspaceId), metadata };
    }

    async function uploadTemplateWorkspace(context, workspaceId, buffer) {
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        assertOwner(metadata, context);
        validateDocx(buffer, config.maxDocxSizeBytes);
        return store.updateTemplateWorkspaceFile(workspaceId, buffer, {
            documentKey: crypto.randomUUID(),
            manualUploadCompleted: true,
            lastCallbackError: ''
        });
    }

    async function handleTemplateWorkspaceCallback(workspaceId, token, body, authorization) {
        verifySignedToken(workspaceId, 'template-callback', token);
        verifyOnlyOfficeJwt(authorization, body?.token);
        const status = Number(body?.status);
        console.log(`[OnlyOffice Callback] templateWorkspaceId: ${workspaceId}, status: ${status}, url: ${body?.url || 'none'}`);
        try {
            if (status === 2 || status === 6) {
                const buffer = await downloadOnlyOfficeFile(body.url);
                console.log(`[OnlyOffice Callback] Downloaded updated file size: ${buffer.length} bytes for workspace: ${workspaceId}`);
                const updatedMeta = await store.updateTemplateWorkspaceFile(workspaceId, buffer, {
                    documentKey: crypto.randomUUID(),
                    finalCallbackCompleted: status === 2,
                    forceSaveCompleted: status === 6,
                    lastOnlyOfficeStatus: status,
                    lastCallbackError: ''
                });
                if (updatedMeta.applied) {
                    await store.syncAppliedTemplateFile(workspaceId, buffer);
                }
            } else if (status === 3 || status === 7) {
                await store.updateTemplateWorkspaceMetadata(workspaceId, {
                    lastOnlyOfficeStatus: status,
                    lastCallbackError: `OnlyOffice trả trạng thái lỗi ${status}.`
                });
            } else {
                await store.updateTemplateWorkspaceMetadata(workspaceId, { lastOnlyOfficeStatus: status || null });
            }
        } catch (error) {
            console.error(`[OnlyOffice Callback Error] workspaceId: ${workspaceId}, error:`, error.message);
            await store.updateTemplateWorkspaceMetadata(workspaceId, {
                lastOnlyOfficeStatus: status || null,
                lastCallbackError: error.message
            }).catch(() => {});
            throw error;
        }
    }

    async function validateTemplateWorkspace(context, workspaceId) {
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        assertOwner(metadata, context);
        const buffer = await store.readTemplateWorkspaceFile(workspaceId);
        const placeholders = listDocxPlaceholders(buffer, config.maxDocxSizeBytes);
        const knownFields = await db.getKnownTemplateFields(context);
        const known = new Set(knownFields.map((field) => field.toLowerCase()));
        return {
            placeholders,
            valid: placeholders.filter((field) => known.has(field.toLowerCase())),
            unknown: placeholders.filter((field) => !known.has(field.toLowerCase()))
        };
    }

    async function applyTemplateWorkspace(context, workspaceId) {
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        assertOwner(metadata, context);
        await requireRegisteredTemplate(context, metadata.templateFile);
        const validation = await validateTemplateWorkspace(context, workspaceId);
        const result = await store.applyTemplateWorkspace(workspaceId);
        return { ...result, validation };
    }

    async function closeTemplateWorkspace(context, workspaceId) {
        const { metadata } = await store.readTemplateWorkspace(workspaceId);
        assertOwner(metadata, context);
        await store.deleteTemplateWorkspace(workspaceId);
    }

    async function authenticateContext(authorization, claimedUserName) {
        return db.authenticate(authorization, claimedUserName);
    }

    return {
        authenticateContext,
        getTemplates,
        createDraft,
        getDraftEditor,
        getDraftFile,
        uploadDraft,
        handleDraftCallback,
        finalizeDraft,
        createTemplateWorkspace,
        getTemplateWorkspaceEditor,
        getTemplateWorkspaceFile,
        uploadTemplateWorkspace,
        handleTemplateWorkspaceCallback,
        validateTemplateWorkspace,
        applyTemplateWorkspace,
        closeTemplateWorkspace,
        cleanupExpired: store.cleanupExpired,
        storageIsWritable: store.storageIsWritable
    };
}
