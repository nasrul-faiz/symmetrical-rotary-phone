import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLocationLinks, chunkLinksForButtons, classifyLocationLinksForSending } from '../src/link-buttons.js';

test('keeps waze in the first button batch when there are four links', () => {
  const point = {
    code: '1234',
    latitude: 3.139,
    longitude: 101.686,
    qrCodeDestinationUrl: 'https://example.com/qr',
  };

  const links = buildLocationLinks(point);
  const chunks = chunkLinksForButtons(links);

  assert.deepEqual(
    links.map((link) => link.label),
    ['Familymart', 'Google Maps', 'waze', 'QR'],
  );
  assert.deepEqual(
    chunks[0].map((link) => link.label),
    ['Familymart', 'Google Maps', 'waze'],
  );
  assert.deepEqual(chunks[1].map((link) => link.label), ['QR']);
});

test('includes pdf documents stored as data urls as location links', () => {
  const point = {
    documents: [
      {
        name: 'report.pdf',
        mimeType: 'application/pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQK',
      },
    ],
  };

  const links = buildLocationLinks(point);

  assert.deepEqual(links.map((link) => link.label), ['PDF: report.pdf']);
  assert.equal(links[0].url, 'data:application/pdf;base64,JVBERi0xLjQK');
});

test('classifies data-url pdf links as document attachments rather than button links', () => {
  const links = [{ label: 'PDF: report.pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK' }];

  const { buttonLinks, documentLinks } = classifyLocationLinksForSending(links);

  assert.deepEqual(buttonLinks, []);
  assert.deepEqual(documentLinks.map((link) => link.label), ['PDF: report.pdf']);
});

test('renders one bot link per QR destination URL with custom button names', () => {
  const point = {
    latitude: 3.139,
    longitude: 101.686,
    qrCodes: [
      { destinationUrl: 'https://example.com/qr-1', buttonName: 'Scan Invoice' },
      { destinationUrl: 'https://example.com/qr-2', buttonName: 'Open Form' },
    ],
  };

  const links = buildLocationLinks(point);

  assert.deepEqual(
    links.map((link) => link.label),
    ['Google Maps', 'waze', 'Scan Invoice', 'Open Form'],
  );
  assert.deepEqual(
    links.slice(2).map((link) => link.url),
    ['https://example.com/qr-1', 'https://example.com/qr-2'],
  );
});

test('falls back to numbered QR labels when custom button names are empty', () => {
  const point = {
    qrCodes: [
      { destinationUrl: 'https://example.com/qr-1', buttonName: '   ' },
      { destinationUrl: 'https://example.com/qr-2' },
    ],
  };

  const links = buildLocationLinks(point);

  assert.deepEqual(
    links.map((link) => link.label),
    ['QR 1', 'QR 2'],
  );
});
