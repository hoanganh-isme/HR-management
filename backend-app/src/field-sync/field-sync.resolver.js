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
/**
 * UserAutoID là khóa kỹ thuật nội bộ.
 * Field vẫn nằm trong contract và dữ liệu để định danh bản ghi,
 * nhưng không hiển thị trong UI.
 */
function isHiddenTechnicalPrimaryKey(fieldName, isPrimaryKey) {
    return (
        isPrimaryKey === true
        && String(fieldName || '')
            .trim()
            .toLowerCase() === 'userautoid'
    );
}
function safeLookupColumn(value) {
    const column = cleanText(value, 128);
    return safeFieldName(column) && !SENSITIVE_LOOKUP_FIELD.test(column) ? column : '';
}

const MOBILE_CLASS_ORDER = Object.freeze({ CORE: 0, OPTIONAL: 1, ADVANCED: 2, HIDDEN: 3 });
const MOBILE_AUDIT_FIELD = /(?:created|createby|createuser|modified|updated|updateby|deleted|deleteby|audit|rowversion|timestamp|nguoi(?:tao|sua)|ngay(?:tao|sua))/i;
const MOBILE_BUSINESS_ID = /(?:^|_)(?:id|code|number|no|ma)$|(?:id|code|number|no)$/i;
const MOBILE_NAME_FIELD = /(?:name|title|caption|fullname|displayname|ten|hoten)/i;
const MOBILE_STATUS_FIELD = /(?:status|state|active|enabled|trangthai|tinhtrang)/i;
const MOBILE_EFFECTIVE_DATE = /(?:effective|validfrom|validto|startdate|enddate|fromdate|todate|ngayhieuluc|tungay|denngay)/i;
const MOBILE_BINARY_TYPE = /(?:^|\W)(?:binary|varbinary|image|rowversion|timestamp)(?:\W|$)/i;
const MOBILE_LONG_TEXT_TYPE = /(?:^|\W)(?:text|ntext|xml)(?:\W|$)|\(\s*max\s*\)/i;

function searchableMobileText(field) {
    return `${field.name || ''} ${field.label || ''}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9_]+/g, '')
        .toLowerCase();
}

function classifyMobileField(field, lookupDependencyParents) {
    const reasons = [];
    const sqlType = String(field.sqlType || '').toLowerCase();
    const fieldName = String(field.name || '').toLowerCase();
    const searchable = searchableMobileText(field);

    if (field.isSensitiveOrDenied) reasons.push('SECURITY_DENIED');
    if (MOBILE_BINARY_TYPE.test(sqlType)) reasons.push('BINARY_TYPE');
    if (field.isComputed) reasons.push('COMPUTED_COLUMN');
    if (field.isServerManaged && !field.isPrimaryKey) reasons.push('SERVER_MANAGED');
    if (field.isIdentity && !field.isPrimaryKey) reasons.push('IDENTITY_NON_KEY');
    if (reasons.length) {
        return { mobileClass: 'HIDDEN', reasonCodes: reasons };
    }

    if (field.requiredOnInsert) reasons.push('REQUIRED_ON_INSERT');
    if (field.isPrimaryKey) reasons.push('PRIMARY_KEY');
    if (lookupDependencyParents.has(fieldName)) reasons.push('LOOKUP_DEPENDENCY_PARENT');
    if (MOBILE_BUSINESS_ID.test(field.name || '')) reasons.push('BUSINESS_IDENTIFIER');
    if (MOBILE_NAME_FIELD.test(searchable)) reasons.push('NAME_OR_CAPTION');
    if (MOBILE_STATUS_FIELD.test(searchable)) reasons.push('STATUS_FIELD');
    if (MOBILE_EFFECTIVE_DATE.test(searchable)) reasons.push('EFFECTIVE_DATE');
    if (reasons.length) {
        return { mobileClass: 'CORE', reasonCodes: reasons };
    }

    if (MOBILE_AUDIT_FIELD.test(searchable)) reasons.push('AUDIT_OR_SYSTEM');
    if (MOBILE_LONG_TEXT_TYPE.test(sqlType) || field.dbMaxLength === -1 || Number(field.dbMaxLength) > 2000) {
        reasons.push('LONG_TEXT');
    }
    if (reasons.length) {
        return { mobileClass: 'ADVANCED', reasonCodes: reasons };
    }

    return { mobileClass: 'OPTIONAL', reasonCodes: ['DEFAULT_OPTIONAL'] };
}

export function classifyMobileFields(fields) {
    const source = Array.isArray(fields) ? fields : [];
    const lookupDependencyParents = new Set();
    for (const field of source) {
        for (const parent of field?.lookup?.dependsOn || []) {
            lookupDependencyParents.add(String(parent).toLowerCase());
        }
    }
    return source.map((field) => {
        const classification = classifyMobileField(field, lookupDependencyParents);
        return {
            ...field,
            mobileClass: classification.mobileClass,
            mobileOrder: (MOBILE_CLASS_ORDER[classification.mobileClass] * 10_000) + (Number(field.orderNo) || 0),
            reasonCodes: classification.reasonCodes
        };
    });
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
        const fieldName = cleanText(
            first(row, 'FieldName', 'fieldName'),
            128
        );

        if (!fieldName) continue;

        if (!safeFieldName(fieldName)) {
            diagnostics.push({
                severity: 'error',
                code: 'INVALID_FIELD_NAME',
                fieldName
            });
            continue;
        }

        const key = fieldName.toLowerCase();

        if (seen.has(key)) {
            diagnostics.push({
                severity: 'error',
                code: 'DUPLICATE_FIELD',
                fieldName
            });
            continue;
        }

        seen.add(key);

        const lookup = normalizeLookup(row);

        const showInGridValue = first(
            row,
            'ShowInGrid',
            'showInGrid'
        );

        const showInGrid =
            showInGridValue === undefined
                ? true
                : bool(showInGridValue);

        const showInAdd = bool(
            first(row, 'ShowInAdd', 'showInAdd')
        );

        const showInEdit = bool(
            first(row, 'ShowInEdit', 'showInEdit')
        );

        const showInFilter = bool(
            first(row, 'ShowInFilter', 'showInFilter')
        );

        const supportsInsert = bool(
            first(row, 'SupportsInsert', 'supportsInsert')
        );

        const supportsUpdate = bool(
            first(row, 'SupportsUpdate', 'supportsUpdate')
        );

        const supportsFilter = bool(
            first(row, 'SupportsFilter', 'supportsFilter')
        );

        const supportsSort = bool(
            first(row, 'SupportsSort', 'supportsSort')
        );

        const supportsKeyword = bool(
            first(row, 'SupportsKeyword', 'supportsKeyword')
        );

        const isPrimaryKey = bool(
            first(row, 'IsPrimaryKey', 'isPrimaryKey')
        );

        const hideTechnicalPrimaryKey =
            isHiddenTechnicalPrimaryKey(
                fieldName,
                isPrimaryKey
            );

        const requiredOnInsert = bool(
            first(
                row,
                'IsRequiredOnInsert',
                'isRequiredOnInsert'
            )
        );

        /*
         * Metadata riêng cho popup Lọc.
         * Chỉ tạo khi field vừa được cấu hình hiển thị,
         * vừa được backend cho phép lọc.
         */
        const filterMetadata =
            showInFilter && supportsFilter
                ? {
                    sourceFormId: cleanText(
                        first(
                            row,
                            'FilterSourceFormID',
                            'filterSourceFormId'
                        ),
                        250
                    ),

                    keyId: cleanText(
                        first(
                            row,
                            'FilterKeyID',
                            'filterKeyId'
                        ),
                        50
                    ),

                    label:
                        cleanDisplayText(
                            first(
                                row,
                                'FilterCaption',
                                'filterCaption'
                            ),
                            200
                        ) ||
                        cleanDisplayText(
                            first(row, 'Caption', 'caption'),
                            200
                        ) ||
                        fieldName,

                    controlType: numberOrNull(
                        first(
                            row,
                            'FilterControlType',
                            'filterControlType'
                        )
                    ),

                    operator: numberOrNull(
                        first(
                            row,
                            'FilterOperator',
                            'filterOperator'
                        )
                    ),

                    useLikeOperator: bool(
                        first(
                            row,
                            'FilterUseLikeOperator',
                            'filterUseLikeOperator'
                        )
                    ),

                    controlWidth: numberOrNull(
                        first(
                            row,
                            'FilterControlWidth',
                            'filterControlWidth'
                        )
                    ),

                    valueField: safeLookupColumn(
                        first(
                            row,
                            'FilterValueColumn',
                            'filterValueColumn'
                        )
                    ),

                    displayField: safeLookupColumn(
                        first(
                            row,
                            'FilterDisplayColumn',
                            'filterDisplayColumn'
                        )
                    ),

                    displayColumns: safeIdentifierList(
                        first(
                            row,
                            'FilterColumns',
                            'filterColumns'
                        )
                    ).slice(0, 12),

                    rememberLastValue: bool(
                        first(
                            row,
                            'FilterRememberLastValue',
                            'filterRememberLastValue'
                        )
                    ),

                    defaultValue: cleanText(
                        first(
                            row,
                            'FilterDefaultValue',
                            'filterDefaultValue'
                        ),
                        100
                    ),

                    reload: bool(
                        first(
                            row,
                            'FilterReload',
                            'filterReload'
                        )
                    )
                }
                : null;

        fields.push({
            name: fieldName,

            label:
                cleanDisplayText(
                    first(row, 'Caption', 'caption'),
                    200
                ) || fieldName,

            orderNo:
                numberOrNull(
                    first(
                        row,
                        'FieldOrdinal',
                        'fieldOrdinal'
                    )
                ) ?? fields.length + 1,

            sqlType: cleanText(
                first(row, 'SqlType', 'sqlType'),
                100
            ),

            nullable: bool(
                first(row, 'IsNullable', 'isNullable')
            ),

            formatId: cleanText(
                first(row, 'FormatID', 'formatId'),
                20
            ),

            formatType: cleanText(
                first(row, 'FormatType', 'formatType'),
                5
            ),

            renderRule: resolveRenderType(
                first(row, 'FormatID', 'formatId'),
                first(row, 'SqlType', 'sqlType'),
                Boolean(lookup && !lookup.disabled),
                first(row, 'FormatType', 'formatType')
            ),

            align: cleanText(
                first(row, 'Align', 'align'),
                10
            ),

            minWidth: numberOrNull(
                first(row, 'MinWidth', 'minWidth')
            ),

            maxWidth: numberOrNull(
                first(row, 'MaxWidth', 'maxWidth')
            ),

            maxLength: numberOrNull(
                first(row, 'MaxLength', 'maxLength')
            ),

            minValue: numberOrNull(
                first(row, 'MinValue', 'minValue')
            ),

            maxValue: numberOrNull(
                first(row, 'MaxValue', 'maxValue')
            ),

            numberDecimal: numberOrNull(
                first(
                    row,
                    'NumberDecimal',
                    'numberDecimal'
                )
            ),

            formatString: cleanText(
                first(
                    row,
                    'FormatString',
                    'formatString'
                ),
                100
            ),

            maskString: cleanText(
                first(
                    row,
                    'MaskString',
                    'maskString'
                ),
                50
            ),

            position: 'grid',
            lookup,

            isPhysicalColumn: bool(
                first(
                    row,
                    'IsPhysicalColumn',
                    'isPhysicalColumn'
                )
            ),

            isPrimaryKey,

            isIdentity: bool(
                first(row, 'IsIdentity', 'isIdentity')
            ),

            isComputed: bool(
                first(row, 'IsComputed', 'isComputed')
            ),

            hasDefault: bool(
                first(row, 'HasDefault', 'hasDefault')
            ),

            dbMaxLength: numberOrNull(
                first(
                    row,
                    'DbMaxLength',
                    'dbMaxLength'
                )
            ),

            dbPrecision: numberOrNull(
                first(
                    row,
                    'DbPrecision',
                    'dbPrecision'
                )
            ),

            dbScale: numberOrNull(
                first(row, 'DbScale', 'dbScale')
            ),

            dbNullable: bool(
                first(
                    row,
                    'DbIsNullable',
                    'dbIsNullable'
                )
            ),

            isServerManaged: bool(
                first(
                    row,
                    'IsServerManaged',
                    'isServerManaged'
                )
            ),

            isSensitiveOrDenied: bool(
                first(
                    row,
                    'IsSensitiveOrDenied',
                    'isSensitiveOrDenied'
                )
            ),

            requiredOnInsert,

            showInGrid:
                showInGrid && !hideTechnicalPrimaryKey,

            showInAdd:
                showInAdd && !hideTechnicalPrimaryKey,

            showInEdit:
                showInEdit && !hideTechnicalPrimaryKey,

            showInFilter:
                showInFilter && !hideTechnicalPrimaryKey,

            supportsInsert,
            supportsUpdate,
            supportsFilter,
            supportsSort,
            supportsKeyword,

            filter: filterMetadata,

            contexts: {
                grid: {
                    visible:
                        showInGrid
                        && !hideTechnicalPrimaryKey,

                    sortable:
                        supportsSort
                        && !hideTechnicalPrimaryKey,

                    keyword:
                        supportsKeyword
                        && !hideTechnicalPrimaryKey
                },

                filter: {
                    visible:
                        showInFilter
                        && !hideTechnicalPrimaryKey,

                    supported:
                        supportsFilter
                        && !hideTechnicalPrimaryKey
                },

                add: {
                    visible:
                        showInAdd
                        && !hideTechnicalPrimaryKey,

                    writable:
                        supportsInsert
                        && !hideTechnicalPrimaryKey,

                    required:
                        requiredOnInsert
                        && !hideTechnicalPrimaryKey
                },

                edit: {
                    visible:
                        showInEdit
                        && !hideTechnicalPrimaryKey,

                    /*
                     * PK vẫn được DynamicFormEngine tự chèn vào payload edit.
                     * Không cần tạo input UserAutoID cho người dùng.
                     */
                    writable:
                        supportsUpdate
                        && !hideTechnicalPrimaryKey,

                    required:
                        isPrimaryKey
                        && !hideTechnicalPrimaryKey
                }
            }
        });
    }

    /*
     * Chuẩn hóa field phụ thuộc của lookup sau khi đã có
     * danh sách field đầy đủ.
     */
    const canonicalFieldNames = new Map(
        fields.map((field) => [
            field.name.toLowerCase(),
            field.name
        ])
    );

    for (const field of fields) {
        if (
            !field.lookup ||
            field.lookup.disabled === true ||
            !field.lookup.dependsOn.length
        ) {
            continue;
        }

        const canonicalParents = [];
        const unresolvedParents = [];

        for (const parent of field.lookup.dependsOn) {
            const canonical = canonicalFieldNames.get(
                String(parent).toLowerCase()
            );

            if (
                !canonical ||
                canonical.toLowerCase() ===
                field.name.toLowerCase()
            ) {
                unresolvedParents.push(parent);
                continue;
            }

            if (
                !canonicalParents.some(
                    (name) =>
                        name.toLowerCase() ===
                        canonical.toLowerCase()
                )
            ) {
                canonicalParents.push(canonical);
            }
        }

        if (unresolvedParents.length) {
            field.lookup = {
                ...field.lookup,
                dependsOn: [],
                disabled: true
            };

            field.renderRule = resolveRenderType(
                field.formatId,
                field.sqlType,
                false,
                field.formatType
            );

            diagnostics.push({
                severity: 'error',
                code: 'LOOKUP_DEPENDENCY_FIELD_NOT_FOUND',
                fieldName: field.name,
                dependencies: unresolvedParents.slice(0, 20)
            });

            continue;
        }

        field.lookup = {
            ...field.lookup,
            dependsOn: canonicalParents
        };
    }

    const classifiedFields = classifyMobileFields(fields);
    const firstRow = rows && rows[0] ? rows[0] : {};

    const sourceKind = cleanText(
        first(firstRow, 'SourceKind', 'sourceKind'),
        40
    );

    const primaryKey = cleanText(
        first(firstRow, 'PrimaryKey', 'primaryKey'),
        128
    );

    const capabilityVersion = cleanText(
        first(
            firstRow,
            'CapabilityVersion',
            'capabilityVersion'
        ),
        20
    );

    const deleteModeRaw = cleanText(
        first(firstRow, 'DeleteMode', 'deleteMode'),
        40
    ).toUpperCase();

    const deleteMode = [
        'SOFT',
        'HARD',
        'HARD_APPROVED',
        'BLOCKED_NO_SOFT_DELETE',
        'INVALID_ISDELETED_TYPE',
        'NONE'
    ].includes(deleteModeRaw)
        ? deleteModeRaw
        : 'NONE';

    const sourceDiagnostic = cleanText(
        first(
            firstRow,
            'DiagnosticCode',
            'diagnosticCode'
        ),
        80
    ).toUpperCase();

    const hasConfiguredFilters = bool(
        first(
            firstRow,
            'HasConfiguredFilters',
            'hasConfiguredFilters'
        )
    );

    const filterSourceFormId = cleanText(
        first(
            firstRow,
            'FilterSourceFormID',
            'filterSourceFormId'
        ),
        250
    );

    if (!fields.length) {
        diagnostics.push({
            severity: 'error',
            code: 'NO_GRID_FIELDS'
        });
    }

    if (!primaryKey) {
        diagnostics.push({
            severity: 'error',
            code: 'NO_PRIMARY_KEY'
        });
    }

    if (
        ![
            'RESULT_SET',
            'MAIN_TABLE',
            'TABLE_FALLBACK'
        ].includes(sourceKind)
    ) {
        diagnostics.push({
            severity: 'error',
            code: 'INVALID_SOURCE_KIND'
        });
    }

    if (sourceKind === 'TABLE_FALLBACK') {
        diagnostics.push({
            severity: 'warning',
            code: 'RESULTSET_FALLBACK_TO_TABLE'
        });
    }

    if (sourceDiagnostic === 'SHADOW_VIEW_NOT_REGISTERED') {
        diagnostics.push({
            severity: 'warning',
            code: 'SHADOW_VIEW_NOT_REGISTERED'
        });
    }

    if (
        sourceDiagnostic === 'RESULTSET_METADATA_ERROR' ||
        sourceDiagnostic === 'RESULTSET_UNSAFE_FIELD'
    ) {
        diagnostics.push({
            severity: 'error',
            code: sourceDiagnostic
        });
    }

    return {
        schemaVersion: '2.0',
        capabilityVersion,

        formName: requestedFormName,
        erpFormId: erpFormName,

        tableName: cleanText(
            first(firstRow, 'TableName', 'tableName'),
            128
        ),

        primaryKey,
        sourceKind,

        fields: classifiedFields,

        gridFields: classifiedFields.filter(
            (field) => field.showInGrid
        ),

        addFields: classifiedFields.filter(
            (field) => field.showInAdd
        ),

        editFields: classifiedFields.filter(
            (field) => field.showInEdit
        ),

        filterFields: classifiedFields.filter(
            (field) =>
                field.showInFilter &&
                field.supportsFilter
        ),

        filterPolicy: {
            configured: hasConfiguredFilters,
            sourceFormId: filterSourceFormId,

            mode: hasConfiguredFilters
                ? 'ERP_CONFIGURED'
                : 'SEARCH_ONLY'
        },

        runtimeRoutes: {
            view: {
                registeredProcedure: cleanText(
                    first(
                        firstRow,
                        'RegisteredViewProcedure',
                        'registeredViewProcedure'
                    ),
                    128
                )
            },

            save: {
                registeredProcedure: cleanText(
                    first(
                        firstRow,
                        'RegisteredSaveProcedure',
                        'registeredSaveProcedure'
                    ),
                    128
                )
            },

            delete: {
                registeredProcedure: cleanText(
                    first(
                        firstRow,
                        'RegisteredDeleteProcedure',
                        'registeredDeleteProcedure'
                    ),
                    128
                ),

                mode: deleteMode
            }
        },

        lookups: classifiedFields
            .filter((field) => field.lookup)
            .map((field) => ({
                fieldName: field.name,
                ...field.lookup
            })),

        mobile: {
            policyVersion: '1.0',

            coreFields: classifiedFields
                .filter(
                    (field) =>
                        field.mobileClass === 'CORE'
                )
                .map((field) => field.name),

            optionalFields: classifiedFields
                .filter(
                    (field) =>
                        field.mobileClass === 'OPTIONAL'
                )
                .map((field) => field.name),

            advancedFields: classifiedFields
                .filter(
                    (field) =>
                        field.mobileClass === 'ADVANCED'
                )
                .map((field) => field.name),

            hiddenFields: classifiedFields
                .filter(
                    (field) =>
                        field.mobileClass === 'HIDDEN'
                )
                .map((field) => field.name)
        },

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

export function normalizeJoinSchema(
    rows,
    requestedFormName,
    requestedDetailKey
) {
    const safeRows = Array.isArray(rows)
        ? rows
        : [];

    const diagnostics = [];
    const diagnosticCodes = new Set();
    const fields = [];
    const seenNames = new Set();

    const firstRow = safeRows[0] || {};

    const apiList = cleanText(
        first(firstRow, 'ApiList', 'apiList'),
        100
    );

    const tableName = cleanText(
        first(firstRow, 'TableName', 'tableName'),
        128
    );

    const primaryKey = cleanText(
        first(firstRow, 'PrimaryKey', 'primaryKey'),
        128
    );

    const registeredViewProcedure = cleanText(
        first(
            firstRow,
            'RegisteredViewProcedure',
            'registeredViewProcedure'
        ),
        128
    );

    const sourceKind = cleanText(
        first(firstRow, 'SourceKind', 'sourceKind'),
        50
    ).toUpperCase();

    const readOnlyValue = first(
        firstRow,
        'ReadOnly',
        'readOnly'
    );

    const readOnly =
        readOnlyValue === undefined
            ? true
            : bool(readOnlyValue);

    if (!safeRows.length) {
        diagnostics.push({
            severity: 'ERROR',
            code: 'JOIN_NO_FIELDS',
            message: 'Không tìm thấy metadata result-set.'
        });
    }

    if (sourceKind !== 'JOIN_RESULT_SET') {
        diagnostics.push({
            severity: 'ERROR',
            code: 'JOIN_SOURCE_KIND_INVALID',
            message: 'Nguồn metadata không phải JOIN_RESULT_SET.'
        });
    }

    if (!primaryKey) {
        diagnostics.push({
            severity: 'ERROR',
            code: 'JOIN_PRIMARY_KEY_MISSING',
            message: 'Thiếu khóa chính của JOIN contract.'
        });
    }

    safeRows.forEach(function (row, index) {
        const diagnosticCode = cleanText(
            first(
                row,
                'DiagnosticCode',
                'diagnosticCode'
            ),
            80
        ).toUpperCase();

        if (
            diagnosticCode &&
            diagnosticCode !== 'OK' &&
            !diagnosticCodes.has(diagnosticCode)
        ) {
            diagnosticCodes.add(diagnosticCode);

            diagnostics.push({
                severity: 'ERROR',
                code: diagnosticCode,
                message:
                    cleanDisplayText(
                        first(row, 'Message', 'message'),
                        250
                    ) ||
                    'Metadata SQL trả về lỗi.'
            });

            return;
        }

        const fieldName = cleanText(
            first(
                row,
                'FieldName',
                'fieldName',
                'Name',
                'name'
            ),
            128
        );

        if (!fieldName || !safeFieldName(fieldName)) {
            diagnostics.push({
                severity: 'ERROR',
                code: 'JOIN_INVALID_FIELD_NAME',
                fieldName,
                message: 'Tên field JOIN không hợp lệ.'
            });

            return;
        }

        const normalizedName =
            fieldName.toLowerCase();

        if (seenNames.has(normalizedName)) {
            diagnostics.push({
                severity: 'ERROR',
                code: 'JOIN_DUPLICATE_FIELD',
                fieldName,
                message: 'Field JOIN bị trùng tên.'
            });

            return;
        }

        seenNames.add(normalizedName);

        const lookup = normalizeLookup(row);

        const formatId = cleanText(
            first(
                row,
                'FormatID',
                'formatID',
                'FormatId',
                'formatId'
            ),
            50
        );

        const formatType = cleanText(
            first(
                row,
                'FormatType',
                'formatType'
            ),
            50
        );

        const sqlType = cleanText(
            first(
                row,
                'SqlType',
                'sqlType'
            ),
            100
        );

        const isPrimaryKey =
            bool(
                first(
                    row,
                    'IsPrimaryKey',
                    'isPrimaryKey'
                )
            )
            ||
            (
                primaryKey &&
                normalizedName ===
                primaryKey.toLowerCase()
            );
        const hideTechnicalPrimaryKey =
            isHiddenTechnicalPrimaryKey(
                fieldName,
                isPrimaryKey
            );
        const isPhysicalColumn = bool(
            first(
                row,
                'IsPhysicalColumn',
                'isPhysicalColumn'
            )
        );

        const isReadOnlyValue = first(
            row,
            'IsReadOnly',
            'isReadOnly'
        );

        const isReadOnly =
            isReadOnlyValue === undefined
                ? true
                : bool(isReadOnlyValue);

        const isNullable = bool(
            first(
                row,
                'IsNullable',
                'isNullable',
                'Nullable',
                'nullable'
            )
        );

        fields.push({
            name: fieldName,

            label:
                cleanDisplayText(
                    first(
                        row,
                        'Caption',
                        'caption',
                        'Label',
                        'label'
                    ),
                    200
                ) || fieldName,

            orderNo:
                numberOrNull(
                    first(
                        row,
                        'FieldOrdinal',
                        'fieldOrdinal',
                        'OrderNo',
                        'orderNo'
                    )
                ) ?? index + 1,

            sqlType,

            nullable: isNullable,

            formatId,
            formatType,

            renderRule: resolveRenderType(
                formatId,
                sqlType,
                Boolean(
                    lookup &&
                    lookup.disabled !== true
                ),
                formatType
            ),

            align: cleanText(
                first(row, 'Align', 'align'),
                10
            ),

            minWidth: numberOrNull(
                first(
                    row,
                    'MinWidth',
                    'minWidth'
                )
            ),

            maxWidth: numberOrNull(
                first(
                    row,
                    'MaxWidth',
                    'maxWidth'
                )
            ),

            maxLength: numberOrNull(
                first(
                    row,
                    'MaxLength',
                    'maxLength'
                )
            ),

            numberDecimal: numberOrNull(
                first(
                    row,
                    'NumberDecimal',
                    'numberDecimal'
                )
            ),

            formatString: cleanText(
                first(
                    row,
                    'FormatString',
                    'formatString'
                ),
                100
            ),

            maskString: cleanText(
                first(
                    row,
                    'MaskString',
                    'maskString'
                ),
                100
            ),

            lookup,

            isPhysicalColumn,
            isPrimaryKey,
            isReadOnly,
            isPhysicalColumn,
            isPrimaryKey,
            isReadOnly,

            source: {
                schema: cleanText(
                    first(
                        row,
                        'SourceSchema',
                        'sourceSchema'
                    ),
                    128
                ),

                table: cleanText(
                    first(
                        row,
                        'SourceTable',
                        'sourceTable'
                    ),
                    128
                ),

                column: cleanText(
                    first(
                        row,
                        'SourceColumn',
                        'sourceColumn'
                    ),
                    128
                )
            },
            showInGrid:
                !hideTechnicalPrimaryKey,

            showInAdd: false,
            showInEdit: false,
            showInFilter: false,

            supportsInsert:
                !isReadOnly && isPhysicalColumn,

            supportsUpdate:
                !isReadOnly && isPhysicalColumn && !isPrimaryKey,

            supportsFilter: false,
            supportsSort: false,
            supportsKeyword: false,

            metadataSource:
                'PHASE4_JOIN_RESULT_SET',

            contexts: {
                grid: {
                    visible:
                        !hideTechnicalPrimaryKey,
                    sortable: false,
                    keyword: false
                },

                filter: {
                    visible: false,
                    supported: false
                },

                add: {
                    visible: !isReadOnly && isPhysicalColumn,
                    writable: !isReadOnly && isPhysicalColumn,
                    required: isPhysicalColumn && !isNullable
                },

                edit: {
                    visible: !isReadOnly && isPhysicalColumn && !isPrimaryKey,
                    writable: !isReadOnly && isPhysicalColumn && !isPrimaryKey,
                    required: isPhysicalColumn && !isPrimaryKey && !isNullable
                }
            }
        });
    });

    if (
        primaryKey &&
        fields.length &&
        !fields.some(function (field) {
            return (
                field.name.toLowerCase() ===
                primaryKey.toLowerCase()
            );
        })
    ) {
        diagnostics.push({
            severity: 'ERROR',
            code: 'JOIN_PRIMARY_KEY_NOT_IN_RESULT',
            message:
                'Khóa chính không nằm trong result-set.'
        });
    }

    return {
        schemaVersion: cleanText(
            first(
                firstRow,
                'SchemaVersion',
                'schemaVersion'
            ),
            20
        ) || '2.0',

        contractVersion: cleanText(
            first(
                firstRow,
                'ContractVersion',
                'contractVersion'
            ),
            20
        ) || '1.0',

        formName: requestedFormName,
        detailKey: requestedDetailKey,

        apiList,
        tableName,
        primaryKey,
        registeredViewProcedure,
        readOnly,
        sourceKind,

        fields,

        gridFields: fields.slice(),

        lookups: fields
            .filter(function (field) {
                return Boolean(field.lookup);
            })
            .map(function (field) {
                return {
                    fieldName: field.name,
                    ...field.lookup
                };
            }),

        diagnostics,

        generatedAt:
            new Date().toISOString()
    };
}


