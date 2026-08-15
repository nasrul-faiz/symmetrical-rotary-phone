import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePdfStoragePayload } from './pdf-storage.js';

test('normalizes base64 payload and data URL payload', () => {
  const fromBase64 = normalizePdfStoragePayload({
    filename: 'laporan.pdf',
    mimeType: 'application/pdf',
    data: 'JVBERi0xLjQK',
  });

  assert.equal(fromBase64.filename, 'laporan.pdf');
  assert.equal(fromBase64.mimeType, 'application/pdf');
  assert.equal(fromBase64.data, 'JVBERi0xLjQK');
  assert.equal(fromBase64.size, 9);

  const fromDataUrl = normalizePdfStoragePayload({
    filename: 'laporan-2.pdf',
    mimeType: 'application/pdf',
    data: 'data:application/pdf;base64,JVBERi0xLjQK',
  });

  assert.equal(fromDataUrl.filename, 'laporan-2.pdf');
  assert.equal(fromDataUrl.data, 'JVBERi0xLjQK');
  assert.equal(fromDataUrl.size, 9);
});

test('rejects invalid payloads', () => {
  assert.throws(() => normalizePdfStoragePayload({ data: '' }), /data/i);
  assert.throws(() => normalizePdfStoragePayload({ data: 123 as unknown as string }), /data/i);
});
