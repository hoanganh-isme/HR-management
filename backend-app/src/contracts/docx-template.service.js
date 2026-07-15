/**
 * Trách nhiệm: render DOCX từ mẫu và kiểm tra placeholder trong mẫu Word.
 * Đầu vào: đường dẫn mẫu cùng dữ liệu hợp đồng.
 * Đầu ra: Buffer DOCX hoặc danh sách placeholder.
 * Nơi gọi: ContractDocumentService và service chỉnh sửa mẫu.
 */
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

function lamSachTheBiTachTrongWord(zip) {
  const documentXml = zip.file('word/document.xml');
  if (!documentXml) return;
  const noiDungDaLamSach = documentXml.asText().replace(/\{[^{}]*?\}/g, (the) => the.replace(/<[^>]+>/g, ''));
  zip.file('word/document.xml', noiDungDaLamSach);
}

function taoBoDocGiaTri() {
  return function parser(tag) {
    return {
      get(scope) {
        if (tag === '.') return scope;
        if (!scope || typeof scope !== 'object') return '';
        if (scope[tag] !== undefined && scope[tag] !== null) return scope[tag];
        const tenCanTim = tag.toLowerCase().replace(/_/g, '');
        const tenThucTe = Object.keys(scope).find((tenTruong) => tenTruong.toLowerCase().replace(/_/g, '') === tenCanTim);
        const giaTri = tenThucTe ? scope[tenThucTe] : '';
        return giaTri === null || giaTri === undefined ? '' : giaTri;
      }
    };
  };
}

export function taoTaiLieuTuMau(duongDanMau, duLieuHopDong) {
  const noiDungMau = fs.readFileSync(duongDanMau, 'binary');
  const zip = new PizZip(noiDungMau);
  lamSachTheBiTachTrongWord(zip);

  const taiLieu = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    parser: taoBoDocGiaTri(),
    nullGetter() { return ''; }
  });
  taiLieu.render(duLieuHopDong);
  return taiLieu.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

export function kiemTraBienTrongMau(duongDanMau) {
  const noiDungMau = fs.readFileSync(duongDanMau, 'binary');
  const zip = new PizZip(noiDungMau);
  const cacBien = new Set();
  Object.keys(zip.files)
    .filter((tenFile) => /^word\/(document|header\d+|footer\d+)\.xml$/i.test(tenFile))
    .forEach((tenFile) => {
      const xml = zip.file(tenFile).asText().replace(/<[^>]+>/g, '');
      const cacKetQua = xml.matchAll(/\{([^{}]+)\}/g);
      for (const ketQua of cacKetQua) cacBien.add(ketQua[1].trim());
    });
  return Array.from(cacBien).sort();
}

