import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { ExcelImportError } from './excel-import.errors.js';

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

function previewValue(value) {
    return String(value === undefined || value === null ? '' : value).slice(0, 500);
}

function createRow(number, values) {
    const cells = Array.isArray(values) ? values : [];
    return Object.freeze({
        number,
        cellCount: cells.length,
        values: Object.freeze([undefined, ...cells]),
        getCell(index) {
            return { value: cells[index - 1] ?? null };
        },
        eachCell(options, callback) {
            const includeEmpty = options?.includeEmpty === true;
            cells.forEach((value, index) => {
                if (includeEmpty || !isBlank(value)) callback({ value }, index + 1);
            });
        }
    });
}

function rowIsBlank(row) {
    return row.values.slice(1).every(isBlank);
}

/**
 * Streaming TSV parser for clipboard payloads. It understands the quoting
 * produced by Excel (quoted tabs/newlines and doubled quotes) without loading
 * the complete payload into a second in-memory array.
 */
export async function streamDelimitedRows(filePath, config, onRow) {
    const stream = fs.createReadStream(filePath, {
        encoding: 'utf8',
        highWaterMark: 64 * 1024
    });
    let field = '';
    let fields = [];
    let rowNumber = 0;
    let inQuotes = false;
    let quotePending = false;
    let skipNextLf = false;
    let firstCharacter = true;
    let sawContent = false;
    let stopped = false;

    function assertColumnLimit() {
        if (fields.length >= config.maxColumns) {
            throw new ExcelImportError(
                `Dữ liệu clipboard vượt giới hạn ${config.maxColumns} cột.`,
                'EXCEL_IMPORT_MAX_COLUMNS_EXCEEDED',
                413
            );
        }
    }

    function finishField() {
        assertColumnLimit();
        fields.push(field);
        field = '';
    }

    function finishRow() {
        finishField();
        rowNumber += 1;
        if (rowNumber > config.maxRows + config.maxHeaderRow) {
            throw new ExcelImportError(
                `Dữ liệu clipboard vượt giới hạn ${config.maxRows.toLocaleString('vi-VN')} dòng.`,
                'EXCEL_IMPORT_MAX_ROWS_EXCEEDED',
                413
            );
        }
        const row = createRow(rowNumber, fields);
        fields = [];
        const callbackResult = onRow(row);
        if (callbackResult === false) stopped = true;
        return callbackResult;
    }

    function processOutsideQuote(character) {
        if (character === '\t') {
            finishField();
            return '';
        }
        if (character === '\r') {
            return 'CR';
        }
        if (character === '\n') {
            return 'LF';
        }
        if (character === '"' && field.length === 0) {
            inQuotes = true;
            return '';
        }
        field += character;
        return '';
    }

    for await (const chunk of stream) {
        for (let index = 0; index < chunk.length; index += 1) {
            if (stopped) break;
            let character = chunk[index];
            if (firstCharacter) {
                firstCharacter = false;
                if (character === '\uFEFF') continue;
            }
            if (character === '\u0000') {
                throw new ExcelImportError(
                    'Clipboard chứa ký tự NUL không hợp lệ.',
                    'EXCEL_IMPORT_CLIPBOARD_INVALID',
                    422
                );
            }
            sawContent = true;
            if (skipNextLf) {
                skipNextLf = false;
                if (character === '\n') continue;
            }

            if (!inQuotes) {
                const rowBreak = processOutsideQuote(character);
                if (rowBreak) {
                    const callbackResult = finishRow();
                    if (callbackResult && typeof callbackResult.then === 'function') {
                        if (await callbackResult === false) stopped = true;
                    }
                    if (rowBreak === 'CR') skipNextLf = true;
                }
                continue;
            }

            if (character === '"') {
                if (quotePending) {
                    field += '"';
                    quotePending = false;
                } else {
                    quotePending = true;
                }
                continue;
            }

            if (quotePending) {
                inQuotes = false;
                quotePending = false;
                const rowBreak = processOutsideQuote(character);
                if (rowBreak) {
                    const callbackResult = finishRow();
                    if (callbackResult && typeof callbackResult.then === 'function') {
                        if (await callbackResult === false) stopped = true;
                    }
                    if (rowBreak === 'CR') skipNextLf = true;
                }
                continue;
            }

            field += character;
        }
        if (stopped) break;
    }

    if (stopped) return;
    if (inQuotes && !quotePending) {
        throw new ExcelImportError(
            'Clipboard có ô trích dẫn chưa đóng.',
            'EXCEL_IMPORT_CLIPBOARD_INVALID',
            422
        );
    }
    if (sawContent && (field.length > 0 || fields.length > 0)) {
        const callbackResult = finishRow();
        if (callbackResult && typeof callbackResult.then === 'function') await callbackResult;
    }
}

export async function validateDelimitedFile(filePath, config) {
    if (path.extname(filePath).toLowerCase() !== '.tsv') {
        throw new ExcelImportError(
            'Dữ liệu clipboard phải có định dạng TSV.',
            'EXCEL_IMPORT_CLIPBOARD_INVALID',
            415
        );
    }
    const stat = await fsp.stat(filePath);
    if (stat.size <= 0) {
        throw new ExcelImportError('Dữ liệu clipboard trống.', 'EXCEL_IMPORT_NO_DATA_ROWS', 422);
    }
    if (stat.size > config.maxFileBytes) {
        throw new ExcelImportError(
            `Clipboard vượt giới hạn ${Math.round(config.maxFileBytes / 1024 / 1024)} MB.`,
            'EXCEL_IMPORT_FILE_TOO_LARGE',
            413
        );
    }
}

export async function scanDelimited(filePath, config) {
    const preview = [];
    let estimatedRows = 0;
    await streamDelimitedRows(filePath, config, (row) => {
        if (preview.length < config.previewRows) {
            preview.push(row.values.slice(1).map(previewValue));
        }
        if (!rowIsBlank(row)) estimatedRows += 1;
    });
    if (estimatedRows === 0) {
        throw new ExcelImportError('Clipboard không có dòng dữ liệu.', 'EXCEL_IMPORT_NO_DATA_ROWS', 422);
    }
    return [{
        name: 'Clipboard',
        estimatedRows,
        preview
    }];
}

export async function readDelimitedHeader(filePath, headerRow, config) {
    let header = null;
    await streamDelimitedRows(filePath, config, (row) => {
        if (headerRow === 0 && !rowIsBlank(row)) {
            header = Array.from({ length: row.cellCount }, (_value, index) => `Cột ${index + 1}`);
            return false;
        }
        if (headerRow > 0 && row.number === headerRow) {
            header = row.values.slice(1).map(previewValue);
            return false;
        }
        return true;
    });
    if (!header) {
        throw new ExcelImportError(
            'Không tìm thấy dòng tiêu đề trong dữ liệu clipboard.',
            'EXCEL_IMPORT_HEADER_ROW_INVALID',
            422
        );
    }
    return header;
}
