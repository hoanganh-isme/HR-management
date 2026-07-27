import crypto from 'node:crypto';
import { ExcelImportError, validationError } from './excel-import.errors.js';

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const DENIED_TYPES = new Set([
    'binary', 'varbinary', 'image', 'timestamp', 'rowversion',
    'xml', 'text', 'ntext', 'sql_variant', 'geography', 'geometry', 'hierarchyid'
]);
const SERVER_MANAGED_NAMES = new Set([
    'usercreate', 'userdate', 'useredit', 'usereditdate', 'userupdate',
    'userdelete', 'userdeletedate', 'sysdate',
    'datecreate', 'dateupdate', 'datecreated', 'datemodified',
    'createdby', 'updatedby', 'createby', 'updateby',
    'createdat', 'updatedat', 'createddate', 'updateddate',
    'branchid', 'tenantid', 'companyid', 'donviid'
]);
const CREATION_ACTOR_NAMES = new Set(['usercreate', 'createdby', 'createby']);
const CREATION_DATE_NAMES = new Set(['userdate', 'datecreate', 'datecreated', 'createddate', 'createdat']);
const DENIED_NAMES = new Set([
    'password', 'passwordhash', 'pass', 'token', 'refreshtoken',
    'secret', 'hash', 'salt', 'rawsql', 'commandtext'
]);

function quoteIdentifier(value) {
    const identifier = String(value || '').trim();
    if (!SAFE_IDENTIFIER.test(identifier)) throw new ExcelImportError('Metadata cột không hợp lệ.', 'EXCEL_IMPORT_SCHEMA_INVALID', 409);
    return `[${identifier.replace(/]/g, ']]')}]`;
}

function normalized(value) {
    return String(value || '').trim().toLowerCase();
}

function toLength(column) {
    const type = normalized(column.sqlType);
    const rawLength = Number(column.maxLength);
    if (rawLength < 0) return -1;
    if (['nvarchar', 'nchar'].includes(type)) return Math.floor(rawLength / 2);
    return rawLength;
}

function sqlTypeDefinition(column) {
    const type = normalized(column.sqlType);
    if (['varchar', 'char', 'nvarchar', 'nchar'].includes(type)) {
        const length = toLength(column);
        return `${type}(${length < 0 ? 'max' : Math.max(1, length)})`;
    }
    if (['decimal', 'numeric'].includes(type)) {
        return `${type}(${Math.max(1, Number(column.precision) || 38)},${Math.max(0, Number(column.scale) || 0)})`;
    }
    if (['datetime2', 'datetimeoffset', 'time'].includes(type)) {
        return `${type}(${Math.min(7, Math.max(0, Number(column.scale) || 7))})`;
    }
    if ([
        'bigint', 'int', 'smallint', 'tinyint', 'bit',
        'date', 'datetime', 'smalldatetime', 'float', 'real',
        'money', 'smallmoney', 'uniqueidentifier'
    ].includes(type)) return type;
    throw new ExcelImportError(`Kiểu dữ liệu ${type || 'không xác định'} chưa được hỗ trợ.`, 'EXCEL_IMPORT_TYPE_NOT_SUPPORTED', 422);
}

function isDeniedColumn(column) {
    const name = normalized(column.name);
    return DENIED_NAMES.has(name)
        || SERVER_MANAGED_NAMES.has(name)
        || DENIED_TYPES.has(normalized(column.sqlType));
}

function requestInput(request, driver, name, type, value) {
    return request.input(name, type, value === undefined ? null : value);
}

async function queryTargetMetadata(sqlServer, contract, schema, context, allowedGroupId = 'Admin') {
    const pool = await sqlServer.getPool();
    const driver = sqlServer.driver;
    const request = pool.request();
    requestInput(request, driver, 'FormName', driver.NVarChar(100), contract.webFormName);
    requestInput(request, driver, 'TableName', driver.NVarChar(128), contract.expectedTableName);
    requestInput(request, driver, 'PrimaryKey', driver.NVarChar(128), contract.expectedPrimaryKey);
    requestInput(request, driver, 'AllowedUserGroup', driver.NVarChar(50), allowedGroupId);
    requestInput(request, driver, 'UserName', driver.NVarChar(100), context.userName);
    requestInput(request, driver, 'BranchID', driver.NVarChar(4000), context.branchId);

    const result = await request.query(`
        SET NOCOUNT ON;
        DECLARE @ObjectID int = OBJECT_ID(N'dbo.' + @TableName, N'U');

        SELECT
            @ObjectID AS ObjectID,
            (SELECT COUNT(*) FROM dbo.SY_FrmLstTbl WHERE LOWER(LTRIM(RTRIM(FormID))) = LOWER(@FormName)) AS FormRegistrationCount,
            (SELECT COUNT(*) FROM dbo.SY_FrmLstTbl WHERE LOWER(LTRIM(RTRIM(FormID))) = LOWER(@FormName)
                AND LOWER(LTRIM(RTRIM(TableName))) = LOWER(@TableName)
                AND LOWER(LTRIM(RTRIM(PrimaryKey))) = LOWER(@PrimaryKey)) AS ExactFormRegistrationCount,
            (SELECT COUNT(*) FROM dbo.WA_API WHERE LOWER(LTRIM(RTRIM([list]))) = LOWER(@FormName)
                AND LOWER(LTRIM(RTRIM([func]))) = 'save') AS SaveRouteCount,
            (SELECT MIN(LTRIM(RTRIM(CONVERT(nvarchar(128), [SQL]))))
                FROM dbo.WA_API WHERE LOWER(LTRIM(RTRIM([list]))) = LOWER(@FormName)
                AND LOWER(LTRIM(RTRIM([func]))) = 'save') AS RegisteredSave,
            (SELECT COUNT(*) FROM dbo.sysobjects WHERE 1 = 0) AS ReservedCheck;

        SELECT TOP (1)
            U.UserGroupID,
            U.BranchID AS UserBranches,
            CASE
                WHEN LOWER(LTRIM(RTRIM(ISNULL(U.UserGroupID, ''))))
                   = LOWER(LTRIM(RTRIM(@AllowedUserGroup))) THEN 1
                ELSE 0
            END AS CanImport
        FROM dbo.SY_User AS U
        WHERE LOWER(LTRIM(RTRIM(U.UserName))) = LOWER(@UserName)
          AND ISNULL(U.Disable, 0) = 0
        ORDER BY U.UserName;

        SELECT
            C.name AS ColumnName,
            TYPE_NAME(C.system_type_id) AS SqlType,
            C.max_length AS MaxLength,
            C.precision AS PrecisionValue,
            C.scale AS ScaleValue,
            C.is_nullable AS IsNullable,
            C.is_identity AS IsIdentity,
            C.is_computed AS IsComputed,
            CASE WHEN DC.object_id IS NULL THEN 0 ELSE 1 END AS HasDefault,
            CASE WHEN PK.column_id IS NULL THEN 0 ELSE 1 END AS IsPrimaryKey
        FROM sys.columns AS C
        LEFT JOIN sys.default_constraints AS DC
          ON DC.parent_object_id = C.object_id AND DC.parent_column_id = C.column_id
        OUTER APPLY (
            SELECT TOP (1) IC.column_id
            FROM sys.indexes AS I
            INNER JOIN sys.index_columns AS IC
              ON IC.object_id = I.object_id AND IC.index_id = I.index_id
            WHERE I.object_id = C.object_id
              AND I.is_primary_key = 1
              AND IC.column_id = C.column_id
        ) AS PK
        WHERE C.object_id = @ObjectID
        ORDER BY C.column_id;

        SELECT TOP (1)
            C.name AS BranchColumn
        FROM sys.columns AS C
        WHERE C.object_id = @ObjectID
          AND LOWER(C.name) IN ('branchid', 'tenantid', 'companyid', 'donviid')
        ORDER BY CASE LOWER(C.name)
            WHEN 'branchid' THEN 1 WHEN 'tenantid' THEN 2
            WHEN 'companyid' THEN 3 ELSE 4 END, C.column_id;

        SELECT
            CASE WHEN EXISTS (
                SELECT 1
                FROM sys.indexes AS I
                INNER JOIN sys.index_columns AS IC
                  ON IC.object_id = I.object_id AND IC.index_id = I.index_id
                WHERE I.object_id = @ObjectID
                  AND I.is_primary_key = 1
                  AND I.is_unique = 1
                  AND I.is_disabled = 0
                  AND IC.key_ordinal = 1
                  AND IC.column_id = COLUMNPROPERTY(@ObjectID, @PrimaryKey, 'ColumnId')
                GROUP BY I.index_id
                HAVING COUNT(*) = 1
            ) THEN 1 ELSE 0 END AS PrimaryKeyUnique;
    `);

    const contractRow = result.recordsets?.[0]?.[0] || {};
    const permissionRow = result.recordsets?.[1]?.[0] || {};
    const columns = result.recordsets?.[2] || [];
    const branchRow = result.recordsets?.[3]?.[0] || {};
    const uniqueRow = result.recordsets?.[4]?.[0] || {};

    if (Number(contractRow.ObjectID) <= 0
        || Number(contractRow.ExactFormRegistrationCount) !== 1
        || Number(contractRow.SaveRouteCount) !== 1
        || normalized(contractRow.RegisteredSave) !== normalized(contract.expectedSaveProcedure)
        || Number(uniqueRow.PrimaryKeyUnique) !== 1) {
        throw new ExcelImportError(
            'Form chưa có Unified Contract ghi an toàn hợp lệ.',
            'EXCEL_IMPORT_CONTRACT_NOT_READY',
            409
        );
    }
    if (Number(permissionRow.CanImport) !== 1) {
        throw new ExcelImportError(
            `Chức năng import hiện chỉ dành cho tài khoản thuộc nhóm ${allowedGroupId}.`,
            'EXCEL_IMPORT_ADMIN_REQUIRED',
            403
        );
    }
    if (!columns.length) {
        throw new ExcelImportError('Không đọc được schema bảng đích.', 'EXCEL_IMPORT_SCHEMA_NOT_FOUND', 409);
    }

    const schemaByName = new Map((schema.fields || []).map((field) => [normalized(field.name), field]));
    const physicalColumns = columns.map((column) => {
        const schemaField = schemaByName.get(normalized(column.ColumnName)) || {};
        const sqlType = normalized(column.SqlType);
        const isIdentity = Boolean(column.IsIdentity);
        const isComputed = Boolean(column.IsComputed);
        const hasDefault = Boolean(column.HasDefault);
        const isPrimaryKey = Boolean(column.IsPrimaryKey);
        const serverManaged = SERVER_MANAGED_NAMES.has(normalized(column.ColumnName));
        const denied = isDeniedColumn({ name: column.ColumnName, sqlType });
        const supportsInsert = schemaField.supportsInsert === true;
        const importable = supportsInsert
            && !isIdentity
            && !isComputed
            && !serverManaged
            && !denied
            && !(isPrimaryKey && hasDefault);
        const maxLength = ['nvarchar', 'nchar'].includes(sqlType) && Number(column.MaxLength) >= 0
            ? Math.floor(Number(column.MaxLength) / 2)
            : Number(column.MaxLength);
        return {
            name: column.ColumnName,
            label: schemaField.label || schemaField.caption || column.ColumnName,
            sqlType,
            maxLength: maxLength < 0 ? null : maxLength,
            precision: Number(column.PrecisionValue) || null,
            scale: Number(column.ScaleValue) || null,
            nullable: Boolean(column.IsNullable),
            hasDefault,
            isIdentity,
            isComputed,
            isPrimaryKey,
            importable,
            required: importable && !Boolean(column.IsNullable) && !hasDefault
                && !isIdentity && !isComputed && !serverManaged
        };
    });

    const branchColumn = String(branchRow.BranchColumn || '').trim();
    const branchPolicy = normalized(contract.branchPolicy) === 'auto_schema'
        ? (branchColumn ? 'BRANCH_SCOPED' : 'GLOBAL_REFERENCE')
        : String(contract.branchPolicy || 'AUTO_SCHEMA').toUpperCase();
    const contextBranches = String(context.branchId || '').split(',').map((value) => value.trim()).filter(Boolean);
    const userBranches = String(permissionRow.UserBranches || '').split(',').map((value) => value.trim()).filter(Boolean);
    const isAdmin = normalized(permissionRow.UserGroupID) === 'admin';
    if (!isAdmin && ['BRANCH_SCOPED', 'LEGACY_GLOBAL_REFERENCE'].includes(branchPolicy)) {
        if (!contextBranches.length || !userBranches.length
            || contextBranches.some((branch) => !userBranches.some((allowed) => normalized(allowed) === normalized(branch)))) {
            throw new ExcelImportError('Ngữ cảnh chi nhánh không hợp lệ hoặc vượt quyền.', 'EXCEL_IMPORT_BRANCH_DENIED', 403);
        }
    }
    if (branchPolicy === 'BRANCH_SCOPED' && contextBranches.length !== 1) {
        throw new ExcelImportError('Import bảng theo chi nhánh cần chọn đúng một BranchID.', 'EXCEL_IMPORT_BRANCH_CONTEXT_REQUIRED', 400);
    }

    const fields = physicalColumns.filter((field) => field.importable);
    if (!fields.length) {
        throw new ExcelImportError('Form không có cột vật lý được phép import.', 'EXCEL_IMPORT_NO_IMPORTABLE_FIELDS', 409);
    }

    return Object.freeze({
        ...contract,
        branchPolicy,
        branchColumn,
        branchValue: contextBranches.length === 1 ? contextBranches[0] : '',
        userName: context.userName,
        userGroupId: String(permissionRow.UserGroupID || ''),
        fields: Object.freeze(fields),
        allColumns: Object.freeze(physicalColumns),
        auditColumns: Object.freeze(physicalColumns.filter((field) => (
            (CREATION_ACTOR_NAMES.has(normalized(field.name)) || CREATION_DATE_NAMES.has(normalized(field.name)))
                && !field.isIdentity && !field.isComputed && !field.hasDefault
        ))),
        primaryKey: physicalColumns.find((field) => field.isPrimaryKey) || null
    });
}

function stagingName() {
    return `#ExcelImport_${cryptoRandomId()}`;
}

function cryptoRandomId() {
    return crypto.randomUUID().replace(/-/g, '');
}

function stageColumnDefinition(field) {
    return `${quoteIdentifier(field.name)} nvarchar(max) NULL`;
}

function conversionExpression(field, alias = 'S') {
    const source = `${alias}.${quoteIdentifier(field.name)}`;
    const typeDefinition = sqlTypeDefinition(field);
    if (['varchar', 'char', 'nvarchar', 'nchar'].includes(normalized(field.sqlType))) {
        return source;
    }
    return `TRY_CONVERT(${typeDefinition}, ${source})`;
}

function valueExpression(field) {
    return `S.${quoteIdentifier(field.name)}`;
}

async function createStaging(transaction, driver, fields, name) {
    const columns = ['[__RowNo] int NOT NULL', ...fields.map(stageColumnDefinition)];
    await transaction.request().query(`CREATE TABLE ${name} (${columns.join(', ')});`);
    return name;
}

async function insertBatch(transaction, driver, name, fields, batch) {
    if (!batch.length) return;
    const table = new driver.Table(name);
    table.create = false;
    table.columns.add('__RowNo', driver.Int, { nullable: false });
    fields.forEach((field) => table.columns.add(field.name, driver.NVarChar(driver.MAX), { nullable: true }));
    batch.forEach((row) => {
        table.rows.add(row.rowNumber, ...fields.map((field) => (
            row.values[field.name] === undefined ? null : String(row.values[field.name])
        )));
    });
    await transaction.request().bulk(table);
}

async function stagedErrors(transaction, driver, name, target, fields, maxErrors) {
    const errors = [];
    let invalidRows = 0;
    const conversionFields = fields
        .filter((field) => !['varchar', 'char', 'nvarchar', 'nchar'].includes(normalized(field.sqlType)));
    const conversionConditions = conversionFields
        .map((field) => `(${quoteIdentifier(field.name)} IS NOT NULL AND ${conversionExpression(field)} IS NULL)`);
    if (conversionConditions.length) {
        const conversionResult = await transaction.request().query(`
            SELECT COUNT(*) AS ErrorCount
            FROM ${name} AS S
            WHERE ${conversionConditions.join(' OR ')};
        `);
        invalidRows += Number(conversionResult.recordset?.[0]?.ErrorCount || 0);
        if (invalidRows > 0) {
            const conversionSamples = await transaction.request()
                .input('MaxErrors', driver.Int, maxErrors)
                .query(`
                    SELECT TOP (@MaxErrors) S.__RowNo, COALESCE(${conversionFields
                        .map((field) => `CASE WHEN ${quoteIdentifier(field.name)} IS NOT NULL AND ${conversionExpression(field)} IS NULL THEN N'${field.name}' END`)
                        .join(', ')}) AS FieldName
                    FROM ${name} AS S
                    WHERE ${conversionConditions.join(' OR ')}
                    ORDER BY S.__RowNo;
                `);
            conversionSamples.recordset?.forEach((row) => {
                if (errors.length < maxErrors) errors.push({
                    row: Number(row.__RowNo),
                    field: String(row.FieldName || ''),
                    code: 'INVALID_SQL_CONVERSION',
                    message: 'Dữ liệu không chuyển được sang kiểu của SQL Server.'
                });
            });
        }
    }

    const primary = target.primaryKey;
    const mappedPrimary = primary && fields.some((field) => normalized(field.name) === normalized(primary.name));
    if (mappedPrimary) {
        const duplicateFile = await transaction.request().query(`
            SELECT COUNT(*) AS ErrorCount
            FROM ${name} AS S
            INNER JOIN (
                SELECT ${conversionExpression(primary)} AS PrimaryValue
                FROM ${name} AS S
                GROUP BY ${conversionExpression(primary)}
                HAVING COUNT(*) > 1
            ) AS D ON D.PrimaryValue = ${conversionExpression(primary)};
        `);
        const duplicateFileCount = Number(duplicateFile.recordset?.[0]?.ErrorCount || 0);
        invalidRows += duplicateFileCount;
        if (duplicateFileCount > 0) {
            const duplicateSamples = await transaction.request()
                .input('MaxErrors', driver.Int, maxErrors)
                .query(`
                    SELECT TOP (@MaxErrors) S.__RowNo AS RowNo, D.PrimaryValue
                    FROM ${name} AS S
                    INNER JOIN (
                        SELECT ${conversionExpression(primary)} AS PrimaryValue
                        FROM ${name} AS S
                        GROUP BY ${conversionExpression(primary)}
                        HAVING COUNT(*) > 1
                    ) AS D ON D.PrimaryValue = ${conversionExpression(primary)}
                    ORDER BY S.__RowNo;
                `);
            duplicateSamples.recordset?.forEach((row) => {
                if (errors.length < maxErrors) errors.push({
                    row: Number(row.RowNo),
                    field: primary.name,
                    code: 'DUPLICATE_PRIMARY_KEY_IN_FILE',
                    message: 'Khóa chính bị trùng trong file import.'
                });
            });
        }

        const targetDuplicate = await transaction.request().query(`
            SELECT COUNT(*) AS ErrorCount
            FROM ${name} AS S
            INNER JOIN dbo.${quoteIdentifier(target.expectedTableName)} AS T
                ON T.${quoteIdentifier(primary.name)} = ${conversionExpression(primary)}
        `);
        const targetDuplicateCount = Number(targetDuplicate.recordset?.[0]?.ErrorCount || 0);
        invalidRows += targetDuplicateCount;
        if (targetDuplicateCount > 0) {
            const targetSamples = await transaction.request()
                .input('MaxErrors', driver.Int, maxErrors)
                .query(`
                    SELECT TOP (@MaxErrors) S.__RowNo AS RowNo
                    FROM ${name} AS S
                    INNER JOIN dbo.${quoteIdentifier(target.expectedTableName)} AS T
                        ON T.${quoteIdentifier(primary.name)} = ${conversionExpression(primary)}
                    ORDER BY S.__RowNo;
                `);
            targetSamples.recordset?.forEach((row) => {
                if (errors.length < maxErrors) errors.push({
                    row: Number(row.RowNo),
                    field: primary.name,
                    code: 'DUPLICATE_PRIMARY_KEY_IN_DB',
                    message: 'Khóa chính đã tồn tại trong cơ sở dữ liệu.'
                });
            });
        }
    }
    return { invalidRows, errors };
}

export async function bulkImportRows({
    sqlServer,
    config,
    target,
    fields,
    context,
    consumeRows,
    shouldCancel = () => false
}) {
    const pool = await sqlServer.getPool();
    const driver = sqlServer.driver;
    const transaction = new driver.Transaction(pool);
    const name = stagingName();
    const startedAt = Date.now();
    let committed = false;
    function assertWithinTimeout() {
        if (Date.now() - startedAt > config.timeoutMs) {
            throw new ExcelImportError('Import vượt thời gian xử lý cho phép.', 'EXCEL_IMPORT_TIMEOUT', 408);
        }
        if (shouldCancel()) {
            throw new ExcelImportError('Import đã được hủy.', 'EXCEL_IMPORT_CANCELLED', 409);
        }
    }
    try {
        await transaction.begin(driver.ISOLATION_LEVEL.SERIALIZABLE);
        await createStaging(transaction, driver, fields, name);
        const consumeSummary = await consumeRows(async (batch) => {
            assertWithinTimeout();
            await insertBatch(transaction, driver, name, fields, batch);
        });

        assertWithinTimeout();
        const staged = await stagedErrors(transaction, driver, name, target, fields, config.maxErrors);
        if (staged.invalidRows > 0) {
            throw validationError(
                {
                    totalRows: Number(consumeSummary?.totalRows) || 0,
                    validRows: Number(consumeSummary?.validRows) || 0,
                    invalidRows: Math.min(
                        Number(consumeSummary?.totalRows) || staged.invalidRows,
                        staged.invalidRows
                    )
                },
                staged.errors,
                staged.invalidRows > staged.errors.length
            );
        }

        const insertColumns = fields.map((field) => quoteIdentifier(field.name));
        const selectExpressions = fields.map((field) => conversionExpression(field));
        target.auditColumns.forEach((field) => {
            insertColumns.push(quoteIdentifier(field.name));
            selectExpressions.push(CREATION_ACTOR_NAMES.has(normalized(field.name))
                ? '@UserName'
                : 'SYSUTCDATETIME()');
        });
        if (target.branchPolicy === 'BRANCH_SCOPED' && target.branchColumn) {
            insertColumns.push(quoteIdentifier(target.branchColumn));
            selectExpressions.push('@BranchID');
        }

        assertWithinTimeout();
        const request = transaction.request();
        requestInput(request, driver, 'UserName', driver.NVarChar(100), context.userName);
        requestInput(request, driver, 'BranchID', driver.NVarChar(4000), target.branchValue);
        const finalResult = await request.query(`
            INSERT INTO dbo.${quoteIdentifier(target.expectedTableName)} WITH (TABLOCK)
                (${insertColumns.join(', ')})
            SELECT ${selectExpressions.join(', ')}
            FROM ${name} AS S;
            SELECT @@ROWCOUNT AS InsertedRows;
        `);
        await transaction.commit();
        committed = true;
        return {
            insertedRows: Number(finalResult.recordset?.[0]?.InsertedRows || finalResult.rowsAffected?.[0] || 0),
            elapsedMs: Date.now() - startedAt
        };
    } catch (error) {
        if (!committed) {
            try { await transaction.rollback(); } catch { /* rollback best effort */ }
        }
        throw error;
    }
}

export { queryTargetMetadata };
