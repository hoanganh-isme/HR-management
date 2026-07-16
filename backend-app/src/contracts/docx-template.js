import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function cleanSplitPlaceholders(xml) {
    return xml.replace(/\{[^{}]*?\}/g, (placeholder) => placeholder.replace(/<[^>]+>/g, ''));
}

function openAndValidate(buffer, maxBytes) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw createError('File DOCX trống hoặc không hợp lệ.');
    }
    if (buffer.length > maxBytes) {
        throw createError(`File DOCX vượt quá giới hạn ${Math.round(maxBytes / 1024 / 1024)}MB.`, 413);
    }
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
        throw createError('File tải lên không có chữ ký ZIP của DOCX.');
    }

    let zip;
    try {
        zip = new PizZip(buffer);
    } catch {
        throw createError('Không thể đọc cấu trúc ZIP của file DOCX.');
    }
    if (!zip.file('[Content_Types].xml') || !zip.file('word/document.xml')) {
        throw createError('File không phải DOCX hợp lệ: thiếu [Content_Types].xml hoặc word/document.xml.');
    }
    return zip;
}

function caseInsensitiveParser(tag) {
    return {
        get(scope) {
            if (tag === '.') return scope;
            if (!scope || typeof scope !== 'object') return '';
            if (scope[tag] !== undefined && scope[tag] !== null) return scope[tag];
            const normalized = tag.toLowerCase().replace(/_/g, '');
            const key = Object.keys(scope).find((candidate) => candidate.toLowerCase().replace(/_/g, '') === normalized);
            const value = key ? scope[key] : '';
            return value === undefined || value === null ? '' : value;
        }
    };
}

export function validateDocx(buffer, maxBytes) {
    openAndValidate(buffer, maxBytes);
    return true;
}

export function renderDocxTemplate(buffer, data, maxBytes) {
    const zip = openAndValidate(buffer, maxBytes);
    const documentXml = zip.file('word/document.xml').asText();
    zip.file('word/document.xml', cleanSplitPlaceholders(documentXml));

    const document = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: caseInsensitiveParser,
        nullGetter: () => ''
    });
    try {
        document.render(data || {});
    } catch (error) {
        const details = error?.properties?.errors
            ?.map((item) => item?.properties?.explanation || item.message)
            .filter(Boolean)
            .join('; ');
        throw createError(`Không thể render mẫu DOCX${details ? `: ${details}` : ''}.`);
    }
    const output = document.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    openAndValidate(output, maxBytes);
    return output;
}

export function listDocxPlaceholders(buffer, maxBytes) {
    const zip = openAndValidate(buffer, maxBytes);
    const xml = cleanSplitPlaceholders(zip.file('word/document.xml').asText());
    const text = xml.replace(/<[^>]+>/g, '');
    const placeholders = [];
    const seen = new Set();
    const matcher = /\{\s*([^{}]+?)\s*\}/g;
    let match;
    while ((match = matcher.exec(text)) !== null) {
        const name = match[1].trim();
        if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            placeholders.push(name);
        }
    }
    return placeholders;
}
