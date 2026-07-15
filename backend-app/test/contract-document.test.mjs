import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import PizZip from 'pizzip';
import { ContractDraftRepository } from '../src/contracts/contract-draft.repository.js';
import { ContractDocumentService } from '../src/contracts/contract-document.service.js';
import { TemplateWorkspaceRepository } from '../src/contracts/template-workspace.repository.js';
import { TemplateWorkspaceService } from '../src/contracts/template-workspace.service.js';
import { kyTokenPhienChinhSua, xacMinhTokenPhienChinhSua } from '../src/contracts/edit-session-token.js';

async function taoThuMucTest() {
  return fsp.mkdtemp(path.join(os.tmpdir(), 'hr-contract-document-'));
}

test('token phiên chỉnh sửa phát hiện nội dung bị sửa', () => {
  const token = kyTokenPhienChinhSua({ draftId: 'draft-1', actions: ['file'] }, 'secret', 60);
  const payload = xacMinhTokenPhienChinhSua(token, 'secret');
  assert.equal(payload.draftId, 'draft-1');
  assert.throws(() => xacMinhTokenPhienChinhSua(token.slice(0, -1) + 'x', 'secret'), /không hợp lệ/i);
});

test('draft repository ghi và cập nhật file bằng rename nguyên tử', async (t) => {
  const thuMucTest = await taoThuMucTest();
  t.after(() => fsp.rm(thuMucTest, { recursive: true, force: true }));
  const repository = new ContractDraftRepository(thuMucTest);
  const metadata = await repository.taoBanNhapHopDong(Buffer.from('draft-v1'), {
    maHopDong: 'HD001', userName: 'admin', fileName: 'HD001.docx'
  });
  const doc = await repository.layNoiDungBanNhap(metadata.draftId);
  assert.equal(doc.buffer.toString(), 'draft-v1');
  await repository.luuThayDoiBanNhap(metadata.draftId, Buffer.from('draft-v2'), { finalCallbackCompleted: true });
  const docMoi = await repository.layNoiDungBanNhap(metadata.draftId);
  assert.equal(docMoi.buffer.toString(), 'draft-v2');
});

test('finalize gửi đúng buffer draft và xóa draft sau khi DB trả UserAutoID', async (t) => {
  const thuMucTest = await taoThuMucTest();
  t.after(() => fsp.rm(thuMucTest, { recursive: true, force: true }));
  const draftRepository = new ContractDraftRepository(thuMucTest);
  const metadata = await draftRepository.taoBanNhapHopDong(Buffer.from('docx-content'), {
    maHopDong: 'HD001', branchId: 'CN01', userName: 'admin', fileName: 'HD001.docx'
  });
  await draftRepository.capNhatMetadata(metadata.draftId, { finalCallbackCompleted: true });

  let payloadDaLuu;
  const service = new ContractDocumentService({
    config: {
      signingSecret: 'secret', samplesDir: thuMucTest,
      documentInternalBaseUrl: 'http://localhost:8081', documentPublicBaseUrl: 'http://localhost:8081',
      onlyOfficePublicUrl: 'http://localhost:8000', onlyOfficeJwtEnabled: false
    },
    draftRepository,
    contractRepository: {
      async layHopDongMoiNhat() { return { MaHopDong: 'HD001', BranchID: 'CN01' }; },
      async luuHopDongVaoCSDL(payload) {
        payloadDaLuu = payload;
        return { UserAutoID: payload.UserAutoID };
      }
    },
    async layThongTinSetup() { return {}; }
  });

  const ketQua = await service.luuHopDongVaoCSDL(metadata.draftId, {
    userName: 'admin', userBranches: null, authorization: 'Bearer test'
  });
  assert.equal(ketQua.UserAutoID, metadata.attachmentUserAutoID);
  assert.equal(payloadDaLuu.Content, '0x646f63782d636f6e74656e74');
  assert.equal(Buffer.from(payloadDaLuu.Base64Content, 'base64').toString(), 'docx-content');
  assert.equal(fs.existsSync(path.join(thuMucTest, metadata.draftId)), false);
});

test('áp dụng mẫu chỉ sau callback cuối, tạo backup và giữ placeholder', async (t) => {
  const thuMucTest = await taoThuMucTest();
  t.after(() => fsp.rm(thuMucTest, { recursive: true, force: true }));
  const samplesDir = path.join(thuMucTest, 'samples');
  const workspacesDir = path.join(thuMucTest, 'template-workspaces');
  await fsp.mkdir(samplesDir, { recursive: true });
  const zip = new PizZip();
  zip.file('word/document.xml', '<w:document><w:body><w:t>{PersonName}</w:t></w:body></w:document>');
  const noiDungMau = zip.generate({ type: 'nodebuffer' });
  await fsp.writeFile(path.join(samplesDir, 'HopDong.docx'), noiDungMau);

  const workspaceRepository = new TemplateWorkspaceRepository(workspacesDir);
  const service = new TemplateWorkspaceService({
    config: {
      samplesDir, signingSecret: 'secret', onlyOfficeJwtEnabled: false,
      documentInternalBaseUrl: 'http://localhost:8081', documentPublicBaseUrl: 'http://localhost:8081',
      onlyOfficePublicUrl: 'http://localhost:8000'
    },
    workspaceRepository,
    contractRepository: {
      async layMauHopDong() { return { FormName: 'WA_HopDongLaoDongFrm', TemplateFile: 'HopDong.docx' }; }
    }
  });

  const workspace = await service.taoPhienChinhSuaMau('HopDong.docx', 'admin', 'Bearer test');
  await workspaceRepository.luuThayDoi(workspace.workspaceId, noiDungMau, { finalCallbackCompleted: true });
  const ketQua = await service.apDungMauHopDong(workspace.workspaceId, 'admin');
  assert.deepEqual(ketQua.placeholders, ['PersonName']);
  assert.equal(fs.existsSync(path.join(samplesDir, 'backups', ketQua.backupFile)), true);
  assert.equal(fs.existsSync(path.join(workspacesDir, workspace.workspaceId)), false);
});
