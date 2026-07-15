/**
 * Trách nhiệm: gọi SQL API Gateway theo đúng contract List/Func/JsonData hiện tại.
 * Đầu vào: tên List, Func, payload nghiệp vụ và Authorization header.
 * Đầu ra: response đã chuẩn hóa hoặc lỗi Gateway có ngữ cảnh.
 * Nơi gọi: ContractDocumentRepository và các service backend.
 */
import axios from 'axios';
import { HttpError } from '../shared/http-error.js';

function taoHeaders(authorization) {
  return authorization ? { Authorization: authorization } : {};
}

function layDanhSachBanGhi(phanHoi) {
  if (Array.isArray(phanHoi)) return phanHoi;
  if (!phanHoi) return [];
  if (Array.isArray(phanHoi.records)) return phanHoi.records;
  if (Array.isArray(phanHoi.list)) return phanHoi.list;
  if (Array.isArray(phanHoi.data)) return phanHoi.data;
  return [];
}

function layKetQuaThaoTac(phanHoi) {
  if (!phanHoi) return null;
  if (phanHoi.code !== undefined) return phanHoi;
  const banGhiDau = layDanhSachBanGhi(phanHoi)[0];
  return banGhiDau || null;
}

export class SqlGatewayClient {
  constructor({ baseUrl, defaultUser }) {
    if (!baseUrl) throw new Error('SQL_API_BASE chưa được cấu hình.');
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultUser = defaultUser || 'admin';
  }

  async xem(listName, thamSo = {}, authorization) {
    const payload = {
      List: listName,
      Func: 'View',
      UserName: thamSo.UserName || this.defaultUser,
      Keyword: thamSo.Keyword || '',
      Page: thamSo.Page || 1,
      Limit: thamSo.Limit || 1000,
      JsonData: JSON.stringify(thamSo.JsonData || thamSo)
    };

    Object.keys(thamSo).forEach((tenTruong) => {
      if (payload[tenTruong] === undefined) payload[tenTruong] = thamSo[tenTruong];
    });

    try {
      const q = encodeURIComponent(JSON.stringify(payload));
      const phanHoi = await axios.get(`${this.baseUrl}/api/API_Gateway_Router?q=${q}`, {
        headers: taoHeaders(authorization),
        timeout: 30000,
        maxContentLength: Infinity
      });
      return phanHoi.data;
    } catch (error) {
      throw new HttpError(502, 'SQL_GATEWAY_VIEW_FAILED', `Không thể đọc ${listName} từ SQL Gateway.`, error.message);
    }
  }

  async thaoTac(listName, func, duLieu, userName, authorization) {
    const payload = {
      List: listName,
      Func: func,
      UserName: userName || this.defaultUser,
      JsonData: JSON.stringify(duLieu || {})
    };

    try {
      const phanHoi = await axios.post(`${this.baseUrl}/api/API_Gateway_Router`, payload, {
        headers: taoHeaders(authorization),
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      return phanHoi.data;
    } catch (error) {
      throw new HttpError(502, 'SQL_GATEWAY_ACTION_FAILED', `Không thể thực hiện ${func} trên ${listName}.`, error.message);
    }
  }

  layDanhSachBanGhi(phanHoi) {
    return layDanhSachBanGhi(phanHoi);
  }

  layKetQuaThaoTac(phanHoi) {
    return layKetQuaThaoTac(phanHoi);
  }
}

