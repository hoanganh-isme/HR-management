export class ExcelImportError extends Error {
    constructor(message, code = 'EXCEL_IMPORT_FAILED', status = 400, diagnostic = {}) {
        super(message);
        this.name = 'ExcelImportError';
        this.code = code;
        this.statusCode = status;
        this.diagnostic = diagnostic && typeof diagnostic === 'object' ? diagnostic : {};
    }
}

export function validationError(summary, errors, errorsTruncated = false) {
    return new ExcelImportError(
        'Dữ liệu import không hợp lệ.',
        'EXCEL_IMPORT_VALIDATION_FAILED',
        422,
        { summary, errors: Array.isArray(errors) ? errors : [], errorsTruncated: Boolean(errorsTruncated) }
    );
}

export function isExcelImportError(error) {
    return error instanceof ExcelImportError;
}
