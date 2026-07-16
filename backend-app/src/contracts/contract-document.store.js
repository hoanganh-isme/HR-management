import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function assertUuid(value, label) {
    if (!UUID_PATTERN.test(String(value || ''))) throw createError(`${label} không phải UUID hợp lệ.`);
    return String(value).toLowerCase();
}

function assertTemplateBasename(value) {
    const fileName = String(value || '').trim();
    if (!fileName || path.basename(fileName) !== fileName || !fileName.toLowerCase().endsWith('.docx')) {
        throw createError('TemplateFile phải là basename của một file DOCX.');
    }
    return fileName;
}

async function writeAtomic(filePath, contents) {
    const temporaryFile = `${filePath}.new`;
    await fs.writeFile(temporaryFile, contents);
    try {
        await fs.rename(temporaryFile, filePath);
    } catch (error) {
        if (!['EEXIST', 'EPERM'].includes(error.code)) {
            await fs.rm(temporaryFile, { force: true });
            throw error;
        }
        const previousFile = `${filePath}.previous`;
        await fs.rm(previousFile, { force: true });
        try {
            await fs.rename(filePath, previousFile);
            await fs.rename(temporaryFile, filePath);
            await fs.rm(previousFile, { force: true });
        } catch (replaceError) {
            await fs.rm(temporaryFile, { force: true });
            try {
                await fs.rename(previousFile, filePath);
            } catch {
                // Preserve the original replace error; recovery is best effort.
            }
            throw replaceError;
        }
    }
}

async function readJson(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') throw createError('Workspace không tồn tại hoặc đã hết hạn.', 404);
        throw error;
    }
}

async function findTemplateFiles(root, fileName) {
    const matches = [];
    async function visit(current) {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'backups') continue;
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) await visit(fullPath);
            else if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) matches.push(fullPath);
        }
    }
    await visit(root);
    return matches;
}

export function createContractDocumentStore(config) {
    const draftFileName = 'contract.docx';
    const workspaceFileName = 'template.docx';
    const metadataFileName = 'metadata.json';

    function draftPaths(draftId) {
        const id = assertUuid(draftId, 'draftId');
        const directory = path.join(config.paths.contractDraftsDir, id);
        return {
            id,
            directory,
            document: path.join(directory, draftFileName),
            metadata: path.join(directory, metadataFileName)
        };
    }

    function workspacePaths(workspaceId) {
        const id = assertUuid(workspaceId, 'workspaceId');
        const directory = path.join(config.paths.templateWorkspacesDir, id);
        return {
            id,
            directory,
            document: path.join(directory, workspaceFileName),
            metadata: path.join(directory, metadataFileName)
        };
    }

    async function resolveTemplate(templateFile) {
        const fileName = assertTemplateBasename(templateFile);
        const matches = await findTemplateFiles(config.paths.samplesDir, fileName);
        if (matches.length === 0) throw createError(`Không tìm thấy mẫu ${fileName} trong backend-app/samples.`, 404);
        if (matches.length > 1) throw createError(`Có nhiều file mẫu cùng tên ${fileName}; cần giữ tên duy nhất.`, 409);
        return { fileName, filePath: matches[0] };
    }

    async function createDraft(metadata, buffer) {
        const paths = draftPaths(metadata.draftId);
        await fs.mkdir(paths.directory, { recursive: false });
        try {
            await writeAtomic(paths.document, buffer);
            await writeAtomic(paths.metadata, JSON.stringify(metadata, null, 2));
        } catch (error) {
            await fs.rm(paths.directory, { recursive: true, force: true });
            throw error;
        }
        return metadata;
    }

    async function readDraft(draftId) {
        const paths = draftPaths(draftId);
        const metadata = await readJson(paths.metadata);
        return { paths, metadata };
    }

    async function readDraftFile(draftId) {
        const { paths } = await readDraft(draftId);
        return fs.readFile(paths.document);
    }

    async function updateDraftMetadata(draftId, patch) {
        const { paths, metadata } = await readDraft(draftId);
        const updated = { ...metadata, ...patch, updatedAt: new Date().toISOString() };
        await writeAtomic(paths.metadata, JSON.stringify(updated, null, 2));
        return updated;
    }

    async function updateDraftFile(draftId, buffer, patch = {}) {
        const { paths, metadata } = await readDraft(draftId);
        await writeAtomic(paths.document, buffer);
        const updated = {
            ...metadata,
            ...patch,
            fileSize: buffer.length,
            updatedAt: new Date().toISOString()
        };
        await writeAtomic(paths.metadata, JSON.stringify(updated, null, 2));
        return updated;
    }

    async function createTemplateWorkspace(metadata) {
        const template = await resolveTemplate(metadata.templateFile);
        const buffer = await fs.readFile(template.filePath);
        const paths = workspacePaths(metadata.workspaceId);
        await fs.mkdir(paths.directory, { recursive: false });
        try {
            await writeAtomic(paths.document, buffer);
            await writeAtomic(paths.metadata, JSON.stringify(metadata, null, 2));
        } catch (error) {
            await fs.rm(paths.directory, { recursive: true, force: true });
            throw error;
        }
        return metadata;
    }

    async function readTemplateWorkspace(workspaceId) {
        const paths = workspacePaths(workspaceId);
        const metadata = await readJson(paths.metadata);
        return { paths, metadata };
    }

    async function readTemplateWorkspaceFile(workspaceId) {
        const { paths } = await readTemplateWorkspace(workspaceId);
        return fs.readFile(paths.document);
    }

    async function updateTemplateWorkspaceMetadata(workspaceId, patch) {
        const { paths, metadata } = await readTemplateWorkspace(workspaceId);
        const updated = { ...metadata, ...patch, updatedAt: new Date().toISOString() };
        await writeAtomic(paths.metadata, JSON.stringify(updated, null, 2));
        return updated;
    }

    async function updateTemplateWorkspaceFile(workspaceId, buffer, patch = {}) {
        const { paths, metadata } = await readTemplateWorkspace(workspaceId);
        await writeAtomic(paths.document, buffer);
        const updated = {
            ...metadata,
            ...patch,
            fileSize: buffer.length,
            updatedAt: new Date().toISOString()
        };
        await writeAtomic(paths.metadata, JSON.stringify(updated, null, 2));
        return updated;
    }

    async function applyTemplateWorkspace(workspaceId) {
        const { paths, metadata } = await readTemplateWorkspace(workspaceId);
        const template = await resolveTemplate(metadata.templateFile);
        const editedBuffer = await fs.readFile(paths.document);
        const originalBuffer = await fs.readFile(template.filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseName = path.basename(template.fileName, '.docx');
        const backupName = `${baseName}_${timestamp}_${paths.id}.docx`;
        const backupPath = path.join(config.paths.templateBackupsDir, backupName);
        await writeAtomic(backupPath, originalBuffer);
        await writeAtomic(template.filePath, editedBuffer);
        await fs.rm(paths.directory, { recursive: true, force: true });
        return { templateFile: template.fileName, backupName };
    }

    async function deleteTemplateWorkspace(workspaceId) {
        const paths = workspacePaths(workspaceId);
        await fs.rm(paths.directory, { recursive: true, force: true });
    }

    async function cleanupExpired() {
        const cutoff = Date.now() - config.draftTtlHours * 60 * 60 * 1000;
        let removed = 0;
        for (const root of [config.paths.contractDraftsDir, config.paths.templateWorkspacesDir]) {
            const entries = await fs.readdir(root, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory() || !UUID_PATTERN.test(entry.name)) continue;
                const metadataPath = path.join(root, entry.name, metadataFileName);
                try {
                    const metadata = await readJson(metadataPath);
                    const timestamp = Date.parse(metadata.updatedAt || metadata.createdAt || '');
                    if (!Number.isFinite(timestamp) || timestamp < cutoff) {
                        await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
                        removed += 1;
                    }
                } catch {
                    await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
                    removed += 1;
                }
            }
        }
        return removed;
    }

    async function storageIsWritable() {
        const probe = path.join(config.paths.storageDir, `.health-${crypto.randomUUID()}.new`);
        try {
            await fs.writeFile(probe, 'ok');
            await fs.rm(probe, { force: true });
            return true;
        } catch {
            return false;
        }
    }

    return {
        resolveTemplate,
        createDraft,
        readDraft,
        readDraftFile,
        updateDraftMetadata,
        updateDraftFile,
        createTemplateWorkspace,
        readTemplateWorkspace,
        readTemplateWorkspaceFile,
        updateTemplateWorkspaceMetadata,
        updateTemplateWorkspaceFile,
        applyTemplateWorkspace,
        deleteTemplateWorkspace,
        cleanupExpired,
        storageIsWritable
    };
}
