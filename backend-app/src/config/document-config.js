/**
 * Trách nhiệm: tập trung toàn bộ cấu hình Document API, OnlyOffice và SQL Gateway.
 * Đầu vào: biến môi trường và env.js cũ của frontend.
 * Đầu ra: documentConfig đã chuẩn hóa.
 * Nơi gọi: backend-app/server.js và các service tài liệu.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const thuMucHienTai = path.dirname(fileURLToPath(import.meta.url));
const thuMucBackend = path.resolve(thuMucHienTai, '..', '..');
const thuMucGoc = path.resolve(thuMucBackend, '..');

// CẤU HÌNH PRODUCTION — KHÔNG XÓA
const cauHinhProduction = Object.freeze({
  documentPublicBaseUrl: 'http://103.232.122.205:8083',
  documentInternalBaseUrl: 'http://103.232.122.205:8083',
  onlyOfficePublicUrl: 'http://103.232.122.205:8000'
});

function docApiBoolean(giaTri, macDinh) {
  if (giaTri === undefined || giaTri === null || giaTri === '') return macDinh;
  return ['1', 'true', 'yes', 'on'].includes(String(giaTri).trim().toLowerCase());
}

function boDauGachCheoCuoi(giaTri) {
  return String(giaTri || '').trim().replace(/\/+$/, '');
}

function danhSachPhanCachDauPhay(giaTri) {
  return String(giaTri || '').split(',').map(item => item.trim()).filter(Boolean);
}

function docSqlApiTuEnvJs() {
  const cacDuongDan = [
    path.join(thuMucGoc, 'env.js'),
    path.join(thuMucBackend, 'env.js'),
    '/env.js',
    '/app/env.js'
  ];

  const envJsPath = cacDuongDan.find((duongDan) => fs.existsSync(duongDan));
  if (!envJsPath) return '';

  const noiDung = fs.readFileSync(envJsPath, 'utf8');
  const ketQua = noiDung.match(/API_BASE\s*:\s*['"`](.*?)['"`]/);
  return ketQua && ketQua[1] ? ketQua[1].trim() : '';
}

const laProduction = String(process.env.NODE_ENV || 'development').toLowerCase() === 'production';
const port = Number(process.env.PORT || 8081);
const cauHinhMacDinh = laProduction
  ? cauHinhProduction
  : {
      documentPublicBaseUrl: `http://127.0.0.1:${port}`,
      documentInternalBaseUrl: `http://host.docker.internal:${port}`,
      onlyOfficePublicUrl: 'http://127.0.0.1:8000'
    };

const khoaKyPhien = process.env.DRAFT_SIGNING_SECRET
  || process.env.ONLYOFFICE_JWT_SECRET
  || crypto.randomBytes(32).toString('hex');

if (!process.env.DRAFT_SIGNING_SECRET && !process.env.ONLYOFFICE_JWT_SECRET) {
  console.warn('[CONFIG] Chưa cấu hình DRAFT_SIGNING_SECRET; token phiên sửa chỉ có hiệu lực trong lần chạy hiện tại.');
}

export const documentConfig = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  sqlApiBase: boDauGachCheoCuoi(process.env.SQL_API_BASE || docSqlApiTuEnvJs()),
  sqlApiUser: process.env.SQL_API_USER || 'admin',
  documentPublicBaseUrl: boDauGachCheoCuoi(process.env.DOCUMENT_PUBLIC_BASE_URL || cauHinhMacDinh.documentPublicBaseUrl),
  documentInternalBaseUrl: boDauGachCheoCuoi(process.env.DOCUMENT_INTERNAL_BASE_URL || cauHinhMacDinh.documentInternalBaseUrl),
  onlyOfficePublicUrl: boDauGachCheoCuoi(process.env.ONLYOFFICE_PUBLIC_URL || cauHinhMacDinh.onlyOfficePublicUrl),
  onlyOfficeJwtEnabled: docApiBoolean(process.env.ONLYOFFICE_JWT_ENABLED, false),
  onlyOfficeJwtSecret: process.env.ONLYOFFICE_JWT_SECRET || '',
  useLegacyHrDocuments: docApiBoolean(process.env.USE_LEGACY_HR_DOCUMENTS, false),
  corsAllowedOrigins: danhSachPhanCachDauPhay(process.env.CORS_ALLOWED_ORIGINS || [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:4173',
    'http://localhost:4173'
  ].join(',')),
  signingSecret: khoaKyPhien,
  samplesDir: path.join(thuMucBackend, 'samples'),
  uploadsDir: path.join(thuMucBackend, 'uploads'),
  draftsDir: path.join(thuMucBackend, 'storage', 'drafts'),
  templateWorkspacesDir: path.join(thuMucBackend, 'storage', 'template-workspaces')
});

