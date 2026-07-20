const SAFE_FIELD = /^[A-Za-z_][A-Za-z0-9_@$#]{0,127}$/;
const SAFE_LOOKUP_KEY = /^[A-Fa-f0-9]{64}$/;
const SENSITIVE_LOOKUP_FIELD = /(?:password|passwd|secret|token|hash|salt|credential)/i;
const RESERVED_FIELD_NAMES = new Set(['__proto__', 'prototype', 'constructor']);

function first(row, ...keys) {
    for (const key of keys) {
        if (row && row[key] !== undefined && row[key] !== null) return row[key];
    }
    return undefined;
}

function bool(value) {
    return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1';
}

function numberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function cleanText(value, maxLength = 250) {
    return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function cleanDisplayText(value, maxLength = 250) {
    return cleanText(value, maxLength).replace(/[<>]/g, '');
}

function safeFieldName(value) {
    return SAFE_FIELD.test(value) && !RESERVED_FIELD_NAMES.has(String(value).toLowerCase());
}

function safeLookupColumn(value) {
    const column = cleanText(value, 128);
    return safeFieldName(column) && !SENSITIVE_LOOKUP_FIELD.test(column) ? column : '';
}

export function resolveRenderType(formatId, sqlType, hasLookup = false, formatType = '') {
    if (hasLookup) return 'lookup';
    const formatIdCode = cleanText(formatId, 20).toUpperCase();
    const formatTypeCode = cleanText(formatType, 20).toUpperCase();
    const format = ['D', 'DT', 'H', 'B', 'Q', 'N', 'N0', 'N3'].includes(formatIdCode)
        ? formatIdCode
        : formatTypeCode;
    const type = cleanText(sqlType, 100).toLowerCase();
    if (/\bbit\b/.test(type)) return 'boolean';
    if (format === 'D') return 'date';
    if (format === 'DT') return 'datetime';
    if (format === 'H') return 'time';
    if (format === 'B') return 'money';
    if (format === 'Q') return 'decimal';
    if (['N', 'N0', 'N3'].includes(format)) return 'number';
    if (/date|time/.test(type)) return 'date';
    if (/int|decimal|numeric|money|float|real/.test(type)) return 'number';
    return 'text';
}

function safeIdentifierList(value) {
    return cleanText(value, 1000)
        .split(/[;,]/)
        .map((item) => item.trim().replace(/^@/, ''))
        .filter((item) => safeFieldName(item))
        .slice(0, 20);
}

function normalizeLookup(row) {
    const key = cleanText(first(row, 'LookupKey', 'lookupKey'), 64);
    if (!SAFE_LOOKUP_KEY.test(key)) return null;
    return {
        key,
        type: cleanText(first(row, 'LookupType', 'lookupType'), 30) || 'lookup',
        valueField: safeLookupColumn(first(row, 'LookupValueColumn', 'lookupValueColumn')),
        displayField: safeLookupColumn(first(row, 'LookupDisplayColumn', 'lookupDisplayColumn')),
        displayColumns: safeIdentifierList(first(row, 'LookupColumns', 'lookupColumns')).slice(0, 12),
        dependsOn: safeIdentifierList(first(row, 'LookupDependsOn', 'lookupDependsOn')),
        multiSelect: bool(first(row, 'LookupMultiSelect', 'lookupMultiSelect')),
        reloadMode: cleanText(first(row, 'LookupReloadMode', 'lookupReloadMode'), 30),
        disabled: bool(first(row, 'LookupDisabled', 'lookupDisabled'))
    };
}

export function normalizeGridSchema(rows, requestedFormName, erpFormName) {
    const fields = [];
    const seen = new Set();
    const diagnostics = [];

    for (const row of Array.isArray(rows) ? rows : []) {
        const fieldName = cleanText(first(row, 'FieldName', 'fieldName'), 128);
        if (!fieldName) continue;
        if (!safeFieldName(fieldName)) {
            diagnostics.push({ severity: 'error', code: 'INVALID_FIELD_NAME', fieldName });
            continue;
        }
        const key = fieldName.toLowerCase();
        if (seen.has(key)) {
            diagnostics.push({ severity: 'error', code: 'DUPLICATE_FIELD', fieldName });
            continue;
        }
        seen.add(key);

        const lookup = normalizeLookup(row);
        fields.push({
            name: fieldName,
            label: cleanDisplayText(first(row, 'Caption', 'caption'), 200) || fieldName,
            orderNo: numberOrNull(first(row, 'FieldOrdinal', 'fieldOrdinal')) ?? fields.length + 1,
            sqlType: cleanText(first(row, 'SqlType', 'sqlType'), 100),
            nullable: bool(first(row, 'IsNullable', 'isNullable')),
            formatId: cleanText(first(row, 'FormatID', 'formatId'), 20),
            formatType: cleanText(first(row, 'FormatType', 'formatType'), 5),
        renderRule: resolveRenderType(
            first(row, 'FormatID', 'formatId'),
            first(row, 'SqlType', 'sqlType'),
            Boolean(lookup && !lookup.disabled),
            first(row, 'FormatType', 'formatType')
        ),
            align: cleanText(first(row, 'Align', 'align'), 10),
            minWidth: numberOrNull(first(row, 'MinWidth', 'minWidth')),
            maxWidth: numberOrNull(first(row, 'MaxWidth', 'maxWidth')),
            maxLength: numberOrNull(first(row, 'MaxLength', 'maxLength')),
            minValue: numberOrNull(first(row, 'MinValue', 'minValue')),
            maxValue: numberOrNull(first(row, 'MaxValue', 'maxValue')),
            numberDecimal: numberOrNull(first(row, 'NumberDecimal', 'numberDecimal')),
            formatString: cleanText(first(row, 'FormatString', 'formatString'), 100),
            maskString: cleanText(first(row, 'MaskString', 'maskString'), 50),
            position: 'grid',
            lookup
        });
    }

    const firstRow = rows && rows[0] ? rows[0] : {};
    const sourceKind = cleanText(first(firstRow, 'SourceKind', 'sourceKind'), 40);
    const primaryKey = cleanText(first(firstRow, 'PrimaryKey', 'primaryKey'), 128);
    if (!fields.length) diagnostics.push({ severity: 'error', code: 'NO_GRID_FIELDS' });
    if (!primaryKey) diagnostics.push({ severity: 'error', code: 'NO_PRIMARY_KEY' });
    if (!['RESULT_SET', 'TABLE_FALLBACK'].includes(sourceKind)) diagnostics.push({ severity: 'error', code: 'INVALID_SOURCE_KIND' });
    if (sourceKind === 'TABLE_FALLBACK') diagnostics.push({ severity: 'warning', code: 'RESULTSET_FALLBACK_TO_TABLE' });

    return {
        schemaVersion: '2.0',
        formName: requestedFormName,
        erpFormId: erpFormName,
        primaryKey,
        sourceKind,
        gridFields: fields,
        lookups: fields.filter((field) => field.lookup).map((field) => ({ fieldName: field.name, ...field.lookup })),
        diagnostics,
        generatedAt: new Date().toISOString()
    };
}

export function normalizeGridCompare(rows, formName, erpFormName) {
    const items = (Array.isArray(rows) ? rows : []).map((row) => ({
        fieldName: cleanText(first(row, 'FieldName', 'fieldName'), 128),
        status: cleanText(first(row, 'ParityStatus', 'parityStatus', 'Status', 'status'), 40) || 'UNKNOWN',
        legacyCaption: cleanDisplayText(first(row, 'LegacyCaption', 'legacyCaption'), 200),
        v2Caption: cleanDisplayText(first(row, 'V2Caption', 'v2Caption'), 200),
        legacyFormatId: cleanText(first(row, 'LegacyFormatID', 'legacyFormatId'), 20),
        v2FormatId: cleanText(first(row, 'V2FormatID', 'v2FormatId'), 20),
        legacyRenderType: cleanText(first(row, 'LegacyRenderType', 'legacyRenderType'), 30),
        v2RenderType: cleanText(first(row, 'V2RenderType', 'v2RenderType'), 30),
        legacyHasLookup: bool(first(row, 'LegacyHasLookup', 'legacyHasLookup')),
        v2HasLookup: bool(first(row, 'V2HasLookup', 'v2HasLookup'))
    })).filter((item) => safeFieldName(item.fieldName));
    const matched = items.filter((item) => item.status === 'MATCH').length;
    const firstRow = rows && rows[0] ? rows[0] : {};
    return {
        schemaVersion: '2.0',
        formName,
        erpFormId: erpFormName,
        primaryKey: {
            legacy: cleanText(first(firstRow, 'LegacyPrimaryKey', 'legacyPrimaryKey'), 128),
            v2: cleanText(first(firstRow, 'V2PrimaryKey', 'v2PrimaryKey'), 128),
            status: cleanText(first(firstRow, 'PrimaryKeyStatus', 'primaryKeyStatus'), 20) || 'UNKNOWN'
        },
        summary: { total: items.length, matched, different: items.length - matched },
        items,
        comparedAt: new Date().toISOString()
    };
}

export function normalizeLookupSchema(rows) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const firstRow = safeRows[0] || {};
    const mode = cleanText(first(firstRow, 'LookupMode', 'lookupMode'), 30).toUpperCase();
    const registeredList = cleanText(first(firstRow, 'RegisteredList', 'registeredList'), 50);
    const valueField = safeLookupColumn(first(firstRow, 'ValueColumn', 'valueColumn'));
    const displayField = safeLookupColumn(first(firstRow, 'DisplayColumn', 'displayColumn'));
    if (mode === 'REGISTERED_API' && /^[A-Za-z0-9_]{1,50}$/.test(registeredList) && valueField && displayField) {
        return {
            mode,
            registeredList,
            valueField,
            displayField
        };
    }
    if (mode === 'REGISTERED_API') {
        return { mode: 'BLOCKED', diagnosticCode: 'LOOKUP_COLUMNS_NOT_CONFIGURED' };
    }
    if (mode === 'VALUE_LIST') {
        return {
            mode,
            options: safeRows.filter((row) => !bool(first(row, 'Blocked', 'blocked'))).map((row) => ({
                value: cleanText(first(row, 'Value', 'value'), 500),
                label: cleanDisplayText(first(row, 'Display', 'display'), 500)
            }))
        };
    }
    return { mode: 'BLOCKED', diagnosticCode: cleanText(first(firstRow, 'DiagnosticCode', 'diagnosticCode'), 80) || 'LOOKUP_NOT_AVAILABLE' };
}

export function normalizeRegisteredLookup(rows, descriptor) {
    if (!descriptor || !safeLookupColumn(descriptor.valueField) || !safeLookupColumn(descriptor.displayField)) return null;
    const options = [];
    for (const row of Array.isArray(rows) ? rows : []) {
        if (!row || typeof row !== 'object') continue;
        const keys = Object.keys(row);
        const valueKey = keys.find((key) => key.toLowerCase() === String(descriptor.valueField).toLowerCase());
        const displayKey = keys.find((key) => key.toLowerCase() === String(descriptor.displayField).toLowerCase());
        if (!valueKey || !displayKey) return null;
        options.push({ value: cleanText(row[valueKey], 500), label: cleanDisplayText(row[displayKey], 500) });
    }
    return options;
}
