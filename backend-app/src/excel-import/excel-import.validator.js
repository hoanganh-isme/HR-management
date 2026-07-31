import { validationError } from './excel-import.errors.js';
import { readCellValue } from './excel-import.workbook.js';

const SERVER_MANAGED_NAMES = new Set([
    'usercreate', 'userdate', 'useredit', 'usereditdate', 'userupdate',
    'userdelete', 'userdeletedate', 'sysdate',
    'datecreate', 'dateupdate', 'datecreated', 'datemodified',
    'createdby', 'updatedby', 'createby', 'updateby',
    'createdat', 'updatedat', 'createddate', 'updateddate',
    'branchid', 'tenantid', 'companyid', 'donviid'
]);

const DENIED_NAMES = new Set([
    'password', 'passwordhash', 'pass', 'token', 'refreshtoken',
    'secret', 'hash', 'salt', 'rawsql', 'commandtext'
]);

function removeDiacritics(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd');
}

export function normalizeHeader(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function looseHeader(value) {
    return removeDiacritics(normalizeHeader(value))
        .replace(/[*:]+$/g, '')
        .replace(/[^a-z0-9]+/g, '');
}

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function errorItem(row, field, code, message) {
    return { row, field, code, message };
}

export function createErrorCollector(maxErrors) {
    const errors = [];
    let total = 0;
    return {
        add(error) {
            total += 1;
            if (errors.length < maxErrors) errors.push(error);
        },
        get total() { return total; },
        get items() { return errors.slice(); },
        get truncated() { return total > errors.length; }
    };
}

export function validateHeaderAndMapping(headers, mapping, fields) {
    const safeHeaders = Array.isArray(headers) ? headers.map((header) => String(header || '').trim()) : [];
    const fieldList = Array.isArray(fields) ? fields : [];
    const fieldByName = new Map(fieldList.map((field) => [String(field.name).toLowerCase(), field]));
    const targetSeen = new Set();
    const headerIndexByNormalized = new Map();
    const errors = [];

    if (!safeHeaders.length || safeHeaders.every((header) => !header)) {
        errors.push({ field: '', code: 'HEADER_EMPTY', message: 'Dòng tiêu đề không có tên cột.' });
    }
    safeHeaders.forEach((header, index) => {
        const key = normalizeHeader(header);
        if (!key) return;
        if (headerIndexByNormalized.has(key)) {
            errors.push({ field: header, code: 'HEADER_DUPLICATE', message: `Tiêu đề "${header}" bị trùng.` });
            return;
        }
        headerIndexByNormalized.set(key, index + 1);
    });

    const mappings = [];
    const sourceMapping = mapping && typeof mapping === 'object' && !Array.isArray(mapping) ? mapping : {};
    for (const [sourceHeader, requestedField] of Object.entries(sourceMapping)) {
        const sourceKey = normalizeHeader(sourceHeader);
        const sourceIndex = headerIndexByNormalized.get(sourceKey);
        const targetName = String(requestedField || '').trim();
        const target = fieldByName.get(targetName.toLowerCase());
        if (!sourceIndex) {
            errors.push({ field: sourceHeader, code: 'HEADER_NOT_FOUND', message: `Không tìm thấy cột "${sourceHeader}" trong dòng tiêu đề.` });
            continue;
        }
        if (!target || target.importable !== true) {
            errors.push({ field: targetName, code: 'FIELD_NOT_IMPORTABLE', message: `Trường "${targetName}" không được phép import.` });
            continue;
        }
        const targetKey = target.name.toLowerCase();
        if (targetSeen.has(targetKey)) {
            errors.push({ field: target.name, code: 'MAPPING_TARGET_DUPLICATE', message: `Trường đích "${target.name}" bị map nhiều lần.` });
            continue;
        }
        targetSeen.add(targetKey);
        mappings.push({ sourceHeader, sourceIndex, field: target });
    }

    fieldList.filter((field) => field.required === true).forEach((field) => {
        if (!targetSeen.has(String(field.name).toLowerCase())) {
            errors.push({ field: field.name, code: 'REQUIRED_MAPPING_MISSING', message: `Thiếu mapping cho trường bắt buộc "${field.label || field.name}".` });
        }
    });
    if (!mappings.length) {
        errors.push({ field: '', code: 'MAPPING_EMPTY', message: 'Cần map ít nhất một cột Excel vào trường đích.' });
    }

    if (errors.length) {
        throw validationError(
            { totalRows: 0, validRows: 0, invalidRows: errors.length },
            errors,
            false
        );
    }

    return Object.freeze({
        headers: safeHeaders,
        mappings: Object.freeze(mappings),
        fields: fieldList
    });
}

function normalizeNumberText(value) {
    const raw = String(value || '').trim().replace(/\s+/g, '');
    if (!raw) return null;
    let normalized = raw;
    if (raw.includes('.') && raw.includes(',')) {
        normalized = raw.lastIndexOf(',') > raw.lastIndexOf('.')
            ? raw.replace(/\./g, '').replace(',', '.')
            : raw.replace(/,/g, '');
    } else if (raw.includes(',')) {
        normalized = /^[+-]?\d{1,3}(,\d{3})+$/.test(raw)
            ? raw.replace(/,/g, '')
            : raw.replace(',', '.');
    } else if (/^[+-]?\d{1,3}(\.\d{3}){2,}$/.test(raw)) {
        normalized = raw.replace(/\./g, '');
    }
    return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)
        ? normalized
        : null;
}

function parseNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const normalized = normalizeNumberText(value);
    if (normalized === null) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'number' && Number.isFinite(value) && value > 0 && value < 100000) {
        return new Date(Date.UTC(1899, 11, 30) + Math.round(value * 86400000));
    }
    const raw = String(value || '').trim();
    const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) {
        const date = new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
        return date.getUTCDate() === Number(dmy[1]) ? date : null;
    }
    const ymd = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (ymd) {
        const date = new Date(Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])));
        return date.getUTCDate() === Number(ymd[3]) ? date : null;
    }
    return null;
}

function formatDate(date) {
    return date.toISOString().slice(0, 23);
}

function parseBoolean(value) {
    if (value === true || value === 1 || String(value).trim().toLowerCase() === '1') return true;
    if (value === false || value === 0 || String(value).trim().toLowerCase() === '0') return false;
    const normalized = removeDiacritics(value).trim().toLowerCase();
    if (['true', 'yes', 'y', 'co', 'x'].includes(normalized)) return true;
    if (['false', 'no', 'n', 'khong'].includes(normalized)) return false;
    return null;
}

function sqlType(field) {
    return String(field.sqlType || field.type || 'nvarchar').toLowerCase();
}

export function convertCell(cell, field, rowNumber) {
    const raw = readCellValue(cell);
    if (raw.formula && !raw.hasCachedResult) {
        return { error: errorItem(rowNumber, field.name, 'FORMULA_UNSAFE', 'Ô công thức chưa có giá trị cache an toàn.') };
    }
    const value = raw.value;
    if (isBlank(value)) {
        if (field.required === true || field.nullable === false) {
            return { error: errorItem(rowNumber, field.name, 'REQUIRED', `${field.label || field.name} không được để trống.`) };
        }
        return { value: null };
    }

    const type = sqlType(field);
    let converted = value;
    if (['tinyint', 'smallint', 'int', 'bigint', 'decimal', 'numeric', 'money', 'smallmoney', 'float', 'real'].includes(type)) {
        converted = parseNumber(value);
        if (converted === null) {
            return { error: errorItem(rowNumber, field.name, 'INVALID_NUMBER', `${field.label || field.name} phải là số hợp lệ.`) };
        }
        if (['tinyint', 'smallint', 'int', 'bigint'].includes(type) && !Number.isInteger(converted)) {
            return { error: errorItem(rowNumber, field.name, 'INVALID_INTEGER', `${field.label || field.name} phải là số nguyên.`) };
        }
        if (['bigint', 'decimal', 'numeric', 'money', 'smallmoney'].includes(type)) {
            converted = typeof value === 'number' ? String(value) : normalizeNumberText(value);
        }
    } else if (['date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset'].includes(type)) {
        const date = parseDate(value);
        if (!date) return { error: errorItem(rowNumber, field.name, 'INVALID_DATE', `${field.label || field.name} phải là ngày hợp lệ.`) };
        converted = formatDate(date);
    } else if (type === 'bit') {
        converted = parseBoolean(value);
        if (converted === null) return { error: errorItem(rowNumber, field.name, 'INVALID_BOOLEAN', `${field.label || field.name} phải là Có/Không, True/False hoặc 1/0.`) };
    } else if (type === 'uniqueidentifier') {
        converted = String(value).trim();
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(converted)) {
            return { error: errorItem(rowNumber, field.name, 'INVALID_GUID', `${field.label || field.name} phải là mã GUID hợp lệ.`) };
        }
    } else if (['time'].includes(type)) {
        converted = String(value).trim();
        if (!/^\d{1,2}:\d{2}(:\d{2}(\.\d{1,7})?)?$/.test(converted)) {
            return { error: errorItem(rowNumber, field.name, 'INVALID_TIME', `${field.label || field.name} phải là giờ hợp lệ.`) };
        }
    } else {
        converted = String(value);
        if (field.maxLength !== null && field.maxLength !== undefined && Number(field.maxLength) >= 0
            && converted.length > Number(field.maxLength)) {
            return { error: errorItem(rowNumber, field.name, 'MAX_LENGTH', `${field.label || field.name} vượt quá độ dài cho phép.`) };
        }
    }
    return { value: converted };
}

export function validateRow(row, mappings, rowNumber, collector) {
    const values = {};
    let valid = true;
    for (const mapping of mappings) {
        const result = convertCell(row.getCell(mapping.sourceIndex), mapping.field, rowNumber);
        if (result.error) {
            collector.add(result.error);
            valid = false;
        } else {
            values[mapping.field.name] = result.value;
        }
    }
    return valid ? values : null;
}

export function throwCollectedValidation(totalRows, validRows, collector) {
    if (collector.total <= 0) return;
    throw validationError(
        { totalRows, validRows, invalidRows: Math.max(0, totalRows - validRows) },
        collector.items,
        collector.truncated
    );
}

export function isDeniedField(field) {
    const name = String(field?.name || '').toLowerCase();
    const type = String(field?.sqlType || '').toLowerCase();
    return DENIED_NAMES.has(name)
        || SERVER_MANAGED_NAMES.has(name)
        || ['binary', 'varbinary', 'image', 'timestamp', 'rowversion', 'xml', 'text', 'ntext', 'sql_variant', 'geography', 'geometry', 'hierarchyid'].includes(type);
}
