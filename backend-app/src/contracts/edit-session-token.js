/**
 * Trách nhiệm: ký và xác minh token cho URL file/callback của OnlyOffice.
 * Đầu vào: payload phiên sửa và signing secret.
 * Đầu ra: token HMAC hoặc payload đã xác minh.
 * Nơi gọi: ContractDocumentService và ContractDocumentController.
 */
import crypto from 'crypto';
import { HttpError } from '../shared/http-error.js';

function maHoaBase64Url(giaTri) {
  return Buffer.from(giaTri).toString('base64url');
}

function taoChuKy(noiDung, khoaBiMat) {
  return crypto.createHmac('sha256', khoaBiMat).update(noiDung).digest('base64url');
}

export function kyTokenPhienChinhSua(payload, khoaBiMat, thoiHanGiay = 7200) {
  const noiDung = Object.assign({}, payload, {
    exp: Math.floor(Date.now() / 1000) + thoiHanGiay
  });
  const encoded = maHoaBase64Url(JSON.stringify(noiDung));
  return `${encoded}.${taoChuKy(encoded, khoaBiMat)}`;
}

export function xacMinhTokenPhienChinhSua(token, khoaBiMat) {
  const cacPhan = String(token || '').split('.');
  if (cacPhan.length !== 2) throw new HttpError(401, 'INVALID_EDIT_TOKEN', 'Token phiên chỉnh sửa không hợp lệ.');

  const chuKyMongDoi = taoChuKy(cacPhan[0], khoaBiMat);
  const chuKyNhanDuoc = Buffer.from(cacPhan[1]);
  const chuKyDung = Buffer.from(chuKyMongDoi);
  if (chuKyNhanDuoc.length !== chuKyDung.length || !crypto.timingSafeEqual(chuKyNhanDuoc, chuKyDung)) {
    throw new HttpError(401, 'INVALID_EDIT_TOKEN', 'Chữ ký phiên chỉnh sửa không hợp lệ.');
  }

  const payload = JSON.parse(Buffer.from(cacPhan[0], 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, 'EXPIRED_EDIT_TOKEN', 'Phiên chỉnh sửa đã hết hạn.');
  }
  return payload;
}

export function kyJwtOnlyOffice(payload, khoaBiMat) {
  const header = maHoaBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = maHoaBase64Url(JSON.stringify(payload));
  const noiDung = `${header}.${body}`;
  return `${noiDung}.${taoChuKy(noiDung, khoaBiMat)}`;
}

