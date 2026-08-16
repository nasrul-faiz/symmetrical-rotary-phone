import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EventEmitter } from 'node:events';
import JSZip from 'jszip';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botRootDir = path.resolve(__dirname, '..');

import { unzipTextFromBase64 } from '../src/zip.js';
import {
  buildInteractiveButtonsFromCustom,
  buildTtsAudioMessage,
  captureMessageForAudit,
  clearDeletedMessageLogs,
  createAuthStatePersistenceController,
  executeCommand,
  extractDeletionCandidates,
  getBotMessageBehaviorSettings,
  getDeletedMessageLogs,
  isAllowedGroup,
  normalizeButtonPayload,
  normalizeGroupAllowlist,
  normalizePhoneNumber,
  normalizePairingSelection,
  recordDeletedMessage,
  removeDeletedMessageRecordsByChatId,
  saveBotContacts,
  setBotMessageBehaviorSettings,
} from '../src/index.js';

async function createSolidImage(color) {
  return sharp({
    create: {
      width: 120,
      height: 120,
      channels: 3,
      background: color,
    },
  }).jpeg().toBuffer();
}

test('accepts dot-prefixed numeric location commands when dot is the configured prefix', async () => {
  const reply = await executeCommand('.33', {
    commandPrefix: '.',
    http: {
      async get() {
        return {
          data: {
            success: true,
            data: [
              {
                code: 'R1',
                name: 'Route 1',
                shift: 'AM',
                deliveryPoints: [
                  {
                    code: '33',
                    name: 'Stop 33',
                  },
                ],
              },
            ],
          },
        };
      },
    },
  });

  assert.equal(reply.type, 'location');
  assert.equal(reply.point.code, '33');
});

test('strictly follows the configured command prefix for numeric location commands', async () => {
  const http = {
    async get() {
      return {
        data: {
          success: true,
          data: [
            {
              code: 'R1',
              name: 'Route 1',
              shift: 'AM',
              deliveryPoints: [
                {
                  code: '33',
                  name: 'Stop 33',
                },
              ],
            },
          ],
        },
      };
    },
  };

  const customReply = await executeCommand('/33', { commandPrefix: '/', http });
  const otherPrefixReply = await executeCommand('.33', { commandPrefix: '/', http });

  assert.equal(customReply.type, 'location');
  assert.equal(customReply.point.code, '33');
  assert.equal(otherPrefixReply, null);
});

test('accepts slash-prefixed numeric location commands when the configured prefix is dot', async () => {
  const reply = await executeCommand('/33', {
    commandPrefix: '.',
    http: {
      async get() {
        return {
          data: {
            success: true,
            data: [
              {
                code: 'R1',
                name: 'Route 1',
                shift: 'AM',
                deliveryPoints: [
                  {
                    code: '33',
                    name: 'Stop 33',
                  },
                ],
              },
            ],
          },
        };
      },
    },
  });

  assert.equal(reply.type, 'location');
  assert.equal(reply.point.code, '33');
});

test('does not treat arbitrary c-prefixed words as contact lookup commands', async () => {
  const reply = await executeCommand('.cari', {
    commandPrefix: '.',
    http: {
      async get() {
        return { data: { success: true, data: [] } };
      },
    },
  });

  assert.equal(reply.type, 'command-not-found');
  assert.equal(reply.commandPrefix, '.');
});

test('strictly follows the configured command prefix for regular commands', async () => {
  const reply = await executeCommand('/ping', {
    commandPrefix: '/',
  });

  assert.equal(reply, 'Bot aktif.');

  const otherPrefixReply = await executeCommand('.ping', {
    commandPrefix: '/',
  });

  assert.equal(otherPrefixReply, null);
});

test('builds tts audio payload', () => {
  const payload = buildTtsAudioMessage(Buffer.from('fake-mp3'));

  assert.equal(payload.mimetype, 'audio/mpeg');
  assert.equal(payload.ptt, false);
  assert.ok(Buffer.isBuffer(payload.audio));
});

test('removes deleted message logs by chat id and clears all logs', () => {
  const logPath = path.join(botRootDir, '.bot-deleted-messages.json');
  const initialLogs = [
    { id: 'a1', chatJid: '1234567890@g.us', senderJid: '60123456789@s.whatsapp.net', deletedAt: '2024-01-01T00:00:00.000Z', text: 'first' },
    { id: 'b1', chatJid: '60123456789@s.whatsapp.net', senderJid: '60111111111@s.whatsapp.net', deletedAt: '2024-01-02T00:00:00.000Z', text: 'second' },
    { id: 'c1', chatJid: '1234567890@g.us', senderJid: '60123456789@s.whatsapp.net', deletedAt: '2024-01-03T00:00:00.000Z', text: 'third' },
  ];

  fs.writeFileSync(logPath, JSON.stringify(initialLogs, null, 2), 'utf8');

  const removed = removeDeletedMessageRecordsByChatId('1234567890@g.us');
  assert.equal(removed, 2);
  assert.deepEqual(getDeletedMessageLogs().map((item) => item.chatJid), ['60123456789@s.whatsapp.net']);

  clearDeletedMessageLogs();
  assert.deepEqual(getDeletedMessageLogs(), []);
});

test('records deleted messages even when the original record is not cached', () => {
  clearDeletedMessageLogs();

  const recorded = recordDeletedMessage({
    remoteJid: '60123456789@s.whatsapp.net',
    id: 'deleted-for-everyone-1',
  }, 'Mesej dipadam.');

  assert.equal(recorded, true);
  assert.equal(getDeletedMessageLogs().length, 1);
  assert.equal(getDeletedMessageLogs()[0].text, 'Mesej dipadam.');

  clearDeletedMessageLogs();
});

test('captures incoming message content before delete and preserves it in the deleted log', async () => {
  clearDeletedMessageLogs();

  await captureMessageForAudit({
    key: {
      id: 'incoming-delete-1',
      remoteJid: '60123456789@s.whatsapp.net',
      fromMe: false,
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
    message: {
      conversation: 'hello from captured message',
    },
  });

  const recorded = recordDeletedMessage({
    remoteJid: '60123456789@s.whatsapp.net',
    id: 'incoming-delete-1',
  }, 'Pesan dipadam untuk semua');

  assert.equal(recorded, true);
  assert.equal(getDeletedMessageLogs().length, 1);
  assert.equal(getDeletedMessageLogs()[0].text, 'hello from captured message');

  clearDeletedMessageLogs();
});

test('records deleted message content when the delete payload includes the original message object', () => {
  clearDeletedMessageLogs();

  const recorded = recordDeletedMessage({
    key: {
      id: 'delete-with-message-object-1',
      remoteJid: '60123456789@s.whatsapp.net',
      fromMe: false,
    },
    message: {
      conversation: 'this content must be preserved',
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  }, 'Mesej dipadam.');

  assert.equal(recorded, true);
  assert.equal(getDeletedMessageLogs().length, 1);
  assert.equal(getDeletedMessageLogs()[0].text, 'this content must be preserved');

  clearDeletedMessageLogs();
});

test('records delete-for-everyone payloads that arrive in nested Baileys protocolMessage format', () => {
  clearDeletedMessageLogs();

  const recorded = recordDeletedMessage({
    update: {
      message: {
        protocolMessage: {
          type: 'REVOKE',
          key: {
            id: 'revoked-message-1',
            remoteJid: '60123456789@s.whatsapp.net',
            fromMe: false,
          },
        },
      },
    },
  }, 'Mesej dipadam.');

  assert.equal(recorded, true);
  assert.equal(getDeletedMessageLogs().length, 1);
  assert.equal(getDeletedMessageLogs()[0].id, 'revoked-message-1');
  assert.equal(getDeletedMessageLogs()[0].chatJid, '60123456789@s.whatsapp.net');

  clearDeletedMessageLogs();
});

test('extracts nested revoke payloads when the message key sits inside update.message instead of the top-level update object', () => {
  const candidates = extractDeletionCandidates({
    update: {
      message: {
        messageStubType: 7,
        key: {
          id: 'revoked-message-nested-1',
          remoteJid: '60123456789@s.whatsapp.net',
          fromMe: false,
        },
      },
    },
  });

  assert.ok(candidates.some((candidate) => String(candidate?.key?.id || candidate?.id || '').includes('revoked-message-nested-1')));

  clearDeletedMessageLogs();
  const recorded = recordDeletedMessage({
    update: {
      message: {
        messageStubType: 7,
        key: {
          id: 'revoked-message-nested-1',
          remoteJid: '60123456789@s.whatsapp.net',
          fromMe: false,
        },
      },
    },
  }, 'Mesej dipadam.');

  assert.equal(recorded, true);
  assert.equal(getDeletedMessageLogs()[0].id, 'revoked-message-nested-1');
  clearDeletedMessageLogs();
});

test('normalizes phone numbers for pairing', () => {
  assert.equal(normalizePhoneNumber('+60 12-345 6789'), '60123456789');
});

test('normalizes configured pairing selection and phone number', () => {
  assert.deepEqual(normalizePairingSelection({ pairingMethod: 'PHONE', phoneNumber: '+60 12-345 6789' }), {
    pairingMethod: 'phone',
    phoneNumber: '60123456789',
  });

  assert.deepEqual(normalizePairingSelection({ pairingMethod: 'QR', phoneNumber: '   ' }), {
    pairingMethod: 'qr',
    phoneNumber: '',
  });
});

test('normalizes dashboard button payloads before WhatsApp send', () => {
  const normalized = normalizeButtonPayload([
    { label: 'Lihat Info', id: 'info', type: 'quick_reply' },
    { text: 'Call', value: '60123456789', type: 'button_call' },
    { label: 'Open Site', value: 'https://example.com', type: 'cta_url' },
    { label: 'Invalid', value: '' },
  ]);

  assert.deepEqual(normalized, [
    { type: 'quick_reply', label: 'Lihat Info', value: 'info' },
    { type: 'button_call', label: 'Call', value: '60123456789' },
    { type: 'cta_url', label: 'Open Site', value: 'https://example.com' },
  ]);
});

test('cta call buttons send the phone_number field WhatsApp expects', () => {
  const buttons = buildInteractiveButtonsFromCustom([
    { type: 'button_call', label: 'Call', value: '+60 12-345 6789' },
  ]);

  assert.equal(buttons.length, 1);
  assert.equal(buttons[0].name, 'cta_call');
  assert.match(buttons[0].buttonParamsJson, /"phone_number":"\+60123456789"/);
  assert.doesNotMatch(buttons[0].buttonParamsJson, /"id"/);
});

test('stops persisting creds after socket shutdown begins', async () => {
  const emitter = new EventEmitter();
  const updates = [];
  const controller = createAuthStatePersistenceController(async (payload) => {
    updates.push(payload);
  });

  emitter.on('creds.update', controller.persist);
  emitter.emit('creds.update', { step: 'before-shutdown' });
  await new Promise((resolve) => setImmediate(resolve));

  controller.disable(emitter);
  emitter.emit('creds.update', { step: 'after-shutdown' });
  await controller.persist({ step: 'manual-after-shutdown' });

  assert.deepEqual(updates, [{ step: 'before-shutdown' }]);
  assert.equal(emitter.listenerCount('creds.update'), 0);
  assert.equal(controller.isEnabled(), false);
});

test('custom command responds when trigger is prefixed', async () => {
  const reply = await executeCommand('.promo', {
    commandPrefix: '.',
    http: {
      async get(url) {
        if (url === '/api/custom-commands') {
          return {
            data: {
              success: true,
              data: [
                {
                  id: 'c1',
                  trigger: '.promo',
                  title: 'Promo',
                  contentType: 'text',
                  message: 'Promo hari ini',
                  mediaUrl: '',
                  fileName: '',
                  buttons: [],
                },
              ],
            },
          };
        }

        throw new Error(`unexpected url: ${url}`);
      },
    },
  });

  assert.equal(reply.type, 'custom-command');
  assert.equal(reply.message, 'Promo hari ini');
});

test('custom command responds when trigger is saved without prefix', async () => {
  const reply = await executeCommand('.promo', {
    commandPrefix: '.',
    http: {
      async get(url) {
        if (url === '/api/custom-commands') {
          return {
            data: {
              success: true,
              data: [
                {
                  id: 'c2',
                  trigger: 'promo',
                  title: 'Promo',
                  contentType: 'text',
                  message: 'Promo tanpa prefix',
                  mediaUrl: '',
                  fileName: '',
                  buttons: [],
                },
              ],
            },
          };
        }

        throw new Error(`unexpected url: ${url}`);
      },
    },
  });

  assert.equal(reply.type, 'custom-command');
  assert.equal(reply.message, 'Promo tanpa prefix');
});

test('contact command resolves matching people and returns contact selection buttons', async () => {
  const tempContactsPath = path.join(botRootDir, '.test-contacts.json');
  const contacts = [
    { id: 'c1', name: 'Aisyah Rahman', phone: '+60123456789', category: 'Customer', note: 'Sales' },
    { id: 'c2', name: 'Aisyah Mazlan', phone: '+60129876543', category: 'Supplier', note: 'Packaging' },
  ];
  fs.writeFileSync(tempContactsPath, JSON.stringify(contacts, null, 2), 'utf8');

  const previousContactsPath = process.env.BOT_CONTACTS_FILE;
  process.env.BOT_CONTACTS_FILE = tempContactsPath;

  try {
    const reply = await executeCommand('.caisyah', { commandPrefix: '.' });

    assert.equal(reply.type, 'contact-search');
    assert.equal(reply.matches.length, 2);
    assert.equal(reply.matches[0].name, 'Aisyah Rahman');
    assert.equal(reply.matches[1].name, 'Aisyah Mazlan');
    assert.equal(reply.matches[0].buttons[0].type, 'button_call');
  } finally {
    if (previousContactsPath === undefined) delete process.env.BOT_CONTACTS_FILE;
    else process.env.BOT_CONTACTS_FILE = previousContactsPath;
    fs.rmSync(tempContactsPath, { force: true });
  }
});

test('saved bot contacts can be synced to disk and found by name lookup', async () => {
  const tempContactsPath = path.join(botRootDir, '.test-contacts-acun.json');
  const previousContactsPath = process.env.BOT_CONTACTS_FILE;
  process.env.BOT_CONTACTS_FILE = tempContactsPath;

  try {
    saveBotContacts([
      { id: 'acun-1', name: 'Acun', phone: '+60123456789', category: 'Customer', note: 'Pelanggan utama' },
    ]);

    const reply = await executeCommand('.cacun', { commandPrefix: '.' });
    assert.equal(reply.type, 'contact-card');
    assert.match(reply.text, /Contact 🪪/i);
    assert.match(reply.text, /Name: Acun/i);
    assert.match(reply.text, /Category: Customer/i);
    assert.match(reply.text, /Note: Pelanggan utama/i);
    assert.doesNotMatch(reply.text, /Phone:/i);
  } finally {
    if (previousContactsPath === undefined) delete process.env.BOT_CONTACTS_FILE;
    else process.env.BOT_CONTACTS_FILE = previousContactsPath;
    fs.rmSync(tempContactsPath, { force: true });
  }
});

test('wlink command returns a WhatsApp link with copy payload', async () => {
  const reply = await executeCommand('.wlink 60177501997', {
    commandPrefix: '.',
  });

  assert.equal(reply.type, 'text-with-copy');
  assert.equal(reply.copyText, 'https://wa.me/60177501997');
  assert.match(reply.text, /https:\/\/wa\.me\/60177501997/i);
});

test('unknown command can be disabled separately for group and personal chat', async () => {
  const privateReply = await executeCommand('.unknowncmd', {
    commandPrefix: '.',
    chatJid: '60123456789@s.whatsapp.net',
    getMessageBehaviorSettings() {
      return {
        respondInGroup: true,
        respondInPrivate: true,
        respondForAnyone: true,
        autoRespondUnknownCommand: true,
        unknownCommandInPrivate: true,
        unknownCommandInGroup: false,
      };
    },
  });

  const groupReply = await executeCommand('.unknowncmd', {
    commandPrefix: '.',
    chatJid: '123456789-123456789@g.us',
    getMessageBehaviorSettings() {
      return {
        respondInGroup: true,
        respondInPrivate: true,
        respondForAnyone: true,
        autoRespondUnknownCommand: true,
        unknownCommandInPrivate: true,
        unknownCommandInGroup: false,
      };
    },
  });

  assert.ok(privateReply);
  assert.equal(groupReply, null);
});

test('restricted bot mode stores allowed numbers in the bot settings file', () => {
  const previous = getBotMessageBehaviorSettings();

  try {
    const updated = setBotMessageBehaviorSettings({
      ...previous,
      respondForAnyone: false,
      allowedNumbers: '60123456789, 60111222333',
    });

    assert.ok(updated);
    assert.equal(updated.respondForAnyone, false);
    assert.equal(updated.allowedNumbers, '60123456789, 60111222333');
    assert.equal(getBotMessageBehaviorSettings().allowedNumbers, '60123456789, 60111222333');
  } finally {
    setBotMessageBehaviorSettings({
      ...previous,
      respondForAnyone: previous.respondForAnyone !== false,
      allowedNumbers: previous.allowedNumbers || '',
    });
  }
});

test('group allowlist limits bot responses to selected groups only', () => {
  const allowedGroup = '123456789012345@g.us';
  const blockedGroup = '987654321098765@g.us';
  const allowedGroups = [allowedGroup];

  assert.equal(isAllowedGroup(allowedGroup, allowedGroups), true);
  assert.equal(isAllowedGroup(blockedGroup, allowedGroups), false);
  assert.deepEqual(normalizeGroupAllowlist(`${allowedGroup},\n${blockedGroup}`), [allowedGroup, blockedGroup]);
});

test('timezone command shows current timezone', async () => {
  const reply = await executeCommand('.timezone', {
    commandPrefix: '.',
    getTimeZone() {
      return 'Asia/Kuala_Lumpur';
    },
  });

  assert.match(String(reply), /Timezone semasa: Asia\/Kuala_Lumpur/i);
});

test('timezone command sets a valid timezone', async () => {
  let selectedTimeZone = 'Asia/Kuala_Lumpur';
  const reply = await executeCommand('.timezone Asia/Jakarta', {
    commandPrefix: '.',
    getTimeZone() {
      return selectedTimeZone;
    },
    setTimeZone(nextValue) {
      selectedTimeZone = nextValue;
      return true;
    },
  });

  assert.equal(selectedTimeZone, 'Asia/Jakarta');
  assert.match(String(reply), /Timezone berjaya ditetapkan ke: Asia\/Jakarta/i);
});

test('timezone command rejects invalid timezone values', async () => {
  let calls = 0;
  const reply = await executeCommand('.timezone Mars/Phobos', {
    commandPrefix: '.',
    setTimeZone() {
      calls += 1;
      return true;
    },
  });

  assert.equal(calls, 0);
  assert.match(String(reply), /Timezone tidak sah/i);
});

test('timesolat command enables reminder for current personal chat', async () => {
  const state = {
    enabledChats: {},
    lastSentByChat: {},
  };

  const reply = await executeCommand('.timesolat on', {
    commandPrefix: '.',
    chatJid: '60123456789@s.whatsapp.net',
    getPrayerReminderConfig() {
      return state;
    },
    setPrayerReminderConfig(nextValue) {
      state.enabledChats = { ...nextValue.enabledChats };
      state.lastSentByChat = { ...nextValue.lastSentByChat };
      return true;
    },
  });

  assert.equal(state.enabledChats['60123456789@s.whatsapp.net'], true);
  assert.match(String(reply), /Timesolat ON/i);
});

test('timesolat command enables reminder for current group only', async () => {
  const state = {
    enabledChats: {},
    lastSentByChat: {},
  };

  const groupReply = await executeCommand('.timesolat on', {
    commandPrefix: '.',
    chatJid: '120363111111111111@g.us',
    getPrayerReminderConfig() {
      return state;
    },
    setPrayerReminderConfig(nextValue) {
      state.enabledChats = { ...nextValue.enabledChats };
      state.lastSentByChat = { ...nextValue.lastSentByChat };
      return true;
    },
  });

  const personalStatus = await executeCommand('.timesolat status', {
    commandPrefix: '.',
    chatJid: '60198765432@s.whatsapp.net',
    getPrayerReminderConfig() {
      return state;
    },
  });

  assert.equal(state.enabledChats['120363111111111111@g.us'], true);
  assert.equal(state.enabledChats['60198765432@s.whatsapp.net'], undefined);
  assert.match(String(groupReply), /group ini/i);
  assert.match(String(personalStatus), /OFF/i);
});

test('timesolat command disables reminder for current chat', async () => {
  const state = {
    enabledChats: {
      '60123456789@s.whatsapp.net': true,
    },
    lastSentByChat: {
      '60123456789@s.whatsapp.net': {
        date: '2026-07-25',
        prayers: ['Fajr'],
      },
    },
  };

  const reply = await executeCommand('.timesolat off', {
    commandPrefix: '.',
    chatJid: '60123456789@s.whatsapp.net',
    getPrayerReminderConfig() {
      return state;
    },
    setPrayerReminderConfig(nextValue) {
      state.enabledChats = { ...nextValue.enabledChats };
      state.lastSentByChat = { ...nextValue.lastSentByChat };
      return true;
    },
  });

  assert.equal(state.enabledChats['60123456789@s.whatsapp.net'], undefined);
  assert.equal(state.lastSentByChat['60123456789@s.whatsapp.net'], undefined);
  assert.match(String(reply), /Timesolat OFF/i);
});

test('zip command can read quoted chat text', async () => {
  const reply = await executeCommand('.zip', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  }, {
    extendedTextMessage: {
      contextInfo: {
        quotedMessage: {
          conversation: 'Halo dunia dari reply',
        },
      },
    },
  });

  assert.equal(reply.type, 'zip-text');
  assert.equal(unzipTextFromBase64(reply.payload), 'Halo dunia dari reply');
});

test('zip command can read quoted media caption', async () => {
  const reply = await executeCommand('.zip', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  }, {
    imageMessage: {
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            caption: 'Teks dari media',
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'zip-text');
  assert.equal(unzipTextFromBase64(reply.payload), 'Teks dari media');
});

test('zip command can archive multiple media attachments', async () => {
  const currentImage = await createSolidImage({ r: 0, g: 0, b: 255 });
  const quotedImage = await createSolidImage({ r: 255, g: 0, b: 0 });

  const reply = await executeCommand('.zip', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      if (media?.url === 'current-image') return currentImage;
      if (media?.url === 'quoted-image') return quotedImage;
      return null;
    },
  }, {
    imageMessage: {
      url: 'current-image',
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'quoted-image',
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'zip-file');
  assert.ok(Buffer.isBuffer(reply.document));

  const zip = await JSZip.loadAsync(reply.document);
  assert.deepEqual(Object.keys(zip.files).sort(), ['quoted-image-2.jpg', 'quoted-image.jpg']);
});

test('pdf command includes current and quoted images on separate pages', async () => {
  const currentImage = await createSolidImage({ r: 0, g: 128, b: 255 });
  const quotedImage = await createSolidImage({ r: 255, g: 128, b: 0 });

  const reply = await executeCommand('.pdf', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      if (media?.url === 'current-image') return currentImage;
      if (media?.url === 'quoted-image') return quotedImage;
      return null;
    },
  }, {
    imageMessage: {
      url: 'current-image',
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'quoted-image',
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.equal(reply.mimetype, 'application/pdf');
  assert.ok(Buffer.isBuffer(reply.document));

  const pdfText = reply.document.toString('latin1');
  const pageMatches = pdfText.match(/\/Type \/Page\b/g) || [];
  assert.equal(pageMatches.length, 2);
});

test('grid command builds a single-tile image when one image is provided', async () => {
  const sourceImage = await sharp({
    create: {
      width: 120,
      height: 120,
      channels: 3,
      background: { r: 0, g: 0, b: 255 },
    },
  }).jpeg().toBuffer();

  const reply = await executeCommand('.grid', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      if (media?.url === 'current-image') return sourceImage;
      return null;
    },
  }, {
    imageMessage: {
      caption: '.grid',
      url: 'current-image',
    },
  });

  assert.equal(reply.type, 'image-grid');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));
  assert.equal(reply.mimetype, 'image/jpeg');
  assert.equal(reply.caption, undefined);

  const meta = await sharp(reply.imageBuffer).metadata();
  assert.equal(meta.width, 720);
  assert.equal(meta.height, 720);
});

test('grid command combines current and quoted image side by side', async () => {
  const imageA = await sharp({
    create: {
      width: 120,
      height: 120,
      channels: 3,
      background: { r: 0, g: 255, b: 0 },
    },
  }).jpeg().toBuffer();

  const imageB = await sharp({
    create: {
      width: 120,
      height: 120,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  }).jpeg().toBuffer();

  const reply = await executeCommand('.grid', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      if (media?.url === 'image-a') return imageA;
      if (media?.url === 'image-b') return imageB;
      return null;
    },
  }, {
    imageMessage: {
      caption: '.grid',
      url: 'image-a',
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'image-b',
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'image-grid');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));

  const meta = await sharp(reply.imageBuffer).metadata();
  assert.equal(meta.width, 1440);
  assert.equal(meta.height, 720);
});

test('grid command combines 3 images with two on top and one at bottom', async () => {
  const imageA = await createSolidImage({ r: 0, g: 255, b: 255 });
  const imageB = await createSolidImage({ r: 255, g: 255, b: 0 });
  const imageC = await createSolidImage({ r: 255, g: 0, b: 255 });

  const reply = await executeCommand('.grid', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      if (media?.url === 'image-a') return imageA;
      if (media?.url === 'image-b') return imageB;
      if (media?.url === 'image-c') return imageC;
      return null;
    },
  }, {
    imageMessage: {
      caption: '.grid',
      url: 'image-a',
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'image-b',
            contextInfo: {
              quotedMessage: {
                imageMessage: {
                  url: 'image-c',
                },
              },
            },
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'image-grid');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));

  const meta = await sharp(reply.imageBuffer).metadata();
  assert.equal(meta.width, 1440);
  assert.equal(meta.height, 1440);
});

test('grid command keeps rendering when more than six images are supplied', async () => {
  const imageBuffers = await Promise.all([
    { r: 0, g: 0, b: 0 },
    { r: 32, g: 32, b: 32 },
    { r: 64, g: 64, b: 64 },
    { r: 96, g: 96, b: 96 },
    { r: 128, g: 128, b: 128 },
    { r: 160, g: 160, b: 160 },
    { r: 192, g: 192, b: 192 },
  ].map((color) => createSolidImage(color)));

  const [imageA, imageB, imageC, imageD, imageE, imageF, imageG] = imageBuffers;

  const reply = await executeCommand('.grid', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media) {
      const bufferMap = {
        'image-a': imageA,
        'image-b': imageB,
        'image-c': imageC,
        'image-d': imageD,
        'image-e': imageE,
        'image-f': imageF,
        'image-g': imageG,
      };
      return bufferMap[media?.url] || null;
    },
  }, {
    imageMessage: {
      caption: '.grid',
      url: 'image-a',
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'image-b',
            contextInfo: {
              quotedMessage: {
                imageMessage: {
                  url: 'image-c',
                  contextInfo: {
                    quotedMessage: {
                      imageMessage: {
                        url: 'image-d',
                        contextInfo: {
                          quotedMessage: {
                            imageMessage: {
                              url: 'image-e',
                              contextInfo: {
                                quotedMessage: {
                                  imageMessage: {
                                    url: 'image-f',
                                    contextInfo: {
                                      quotedMessage: {
                                        imageMessage: {
                                          url: 'image-g',
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'image-grid');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));

  const meta = await sharp(reply.imageBuffer).metadata();
  assert.equal(meta.width, 1440);
  assert.equal(meta.height, 2880);
});

test('grid command asks for image with caption when current image is missing', async () => {
  const reply = await executeCommand('.grid', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.match(String(reply), /hantar gambar/i);
});

test('sticker command asks to reply media when no quoted media', async () => {
  const reply = await executeCommand('.sticker', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async buildStickerCommandReply() {
      throw new Error('should not be called');
    },
  });

  assert.match(reply, /Reply gambar\/video/i);
});

test('sticker command passes nobg flag to sticker builder', async () => {
  const calls = [];
  const reply = await executeCommand('.sticker nobg', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async buildStickerCommandReply(mediaBuffer, options) {
      calls.push({ mediaBuffer, options });
      return {
        type: 'sticker',
        stickerBuffer: Buffer.from('fake-webp'),
      };
    },
    async downloadQuotedMediaBuffer() {
      return Buffer.from('fake-image');
    },
  }, {
    extendedTextMessage: {
      contextInfo: {
        quotedMessage: {
          imageMessage: {
            url: 'https://example.com/photo.jpg',
          },
        },
      },
    },
  });

  assert.equal(reply.type, 'sticker');
  assert.ok(Buffer.isBuffer(reply.stickerBuffer));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.mediaType, 'image');
  assert.equal(calls[0].options.removeBackground, true);
});

test('vv command returns a media payload from a view-once image message', async () => {
  const reply = await executeCommand('.vv', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer(media, mediaType) {
      assert.equal(mediaType, 'image');
      return Buffer.from('view-once-image');
    },
  }, {
    imageMessage: {
      viewOnce: true,
      url: 'https://example.com/photo.jpg',
    },
  });

  assert.equal(reply.type, 'view-once');
  assert.equal(reply.mediaType, 'image');
  assert.ok(Buffer.isBuffer(reply.mediaBuffer));
  assert.equal(reply.mediaBuffer.toString('utf8'), 'view-once-image');
});

test('vv command carries an optional caption text', async () => {
  const reply = await executeCommand('.vv caption contoh', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async downloadQuotedMediaBuffer() {
      return Buffer.from('view-once-image');
    },
  }, {
    imageMessage: {
      viewOnce: true,
      url: 'https://example.com/photo.jpg',
    },
  });

  assert.equal(reply.type, 'view-once');
  assert.equal(reply.caption, 'caption contoh');
});

test('qr command returns a high-quality qr image payload', async () => {
  const reply = await executeCommand('.qr hello world', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'qrcode');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));
  assert.equal(reply.mimetype, 'image/png');
  assert.equal(reply.caption, 'hello world');
});

test('ss command returns a screenshot image payload', async () => {
  const calls = [];
  const reply = await executeCommand('.ss example.com', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
    async fetchScreenshotBuffer(targetUrl, options) {
      calls.push({ targetUrl, options });
      return Buffer.from('fake-screenshot');
    },
  });

  assert.equal(reply.type, 'screenshot');
  assert.ok(Buffer.isBuffer(reply.imageBuffer));
  assert.equal(reply.imageBuffer.toString('utf8'), 'fake-screenshot');
  assert.equal(reply.caption, 'https://example.com/');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].targetUrl, 'https://example.com/');
});

test('ss command rejects missing link', async () => {
  const reply = await executeCommand('.ss', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'screenshot');
  assert.equal(reply.imageBuffer, null);
  assert.match(reply.caption, /Sila isi link/i);
});

test('txt command returns a text document payload', async () => {
  const reply = await executeCommand('.txt hello world', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.ok(Buffer.isBuffer(reply.document));
  assert.equal(reply.fileName, 'document.txt');
  assert.equal(reply.mimetype, 'text/plain');
  assert.equal(reply.document.toString('utf8'), 'hello world');
});

test('txt command preserves multiline content from current text', async () => {
  const source = '.txt Baris 1\nBaris 2\n\nBaris 4';
  const reply = await executeCommand(source, {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.equal(reply.fileName, 'document.txt');
  assert.equal(reply.document.toString('utf8'), 'Baris 1\nBaris 2\n\nBaris 4');
});

test('csv command returns a csv document payload', async () => {
  const reply = await executeCommand('.csv name,phone\\nAli,60123456789', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.ok(Buffer.isBuffer(reply.document));
  assert.equal(reply.fileName, 'document.csv');
  assert.equal(reply.mimetype, 'text/csv');
});

test('md command returns a markdown document payload', async () => {
  const reply = await executeCommand('.md # Laporan Hari Ini', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.ok(Buffer.isBuffer(reply.document));
  assert.equal(reply.fileName, 'document.md');
  assert.equal(reply.mimetype, 'text/markdown');
  assert.equal(reply.document.toString('utf8'), '# Laporan Hari Ini');
});

test('md command preserves multiline markdown from current text', async () => {
  const source = '.md # Tajuk\n\n- Item 1\n- Item 2';
  const reply = await executeCommand(source, {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.equal(reply.fileName, 'document.md');
  assert.equal(reply.document.toString('utf8'), '# Tajuk\n\n- Item 1\n- Item 2');
});

test('pdf command returns a pdf document payload with permit caption', async () => {
  const reply = await executeCommand('.pdf hello world', {
    commandPrefix: '.',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'document');
  assert.ok(Buffer.isBuffer(reply.document));
  assert.equal(reply.fileName, 'document.pdf');
  assert.equal(reply.mimetype, 'application/pdf');
  assert.equal(reply.caption, 'Permit for this site');
});

test('unknown command returns command-not-found payload with shared web link', async () => {
  const reply = await executeCommand('.doesnotexist test', {
    commandPrefix: '.',
    appBaseUrl: 'https://routebot.example.com',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'command-not-found');
  assert.equal(reply.commandPrefix, '.');
  assert.equal(reply.openInWebUrl, 'https://routebot.example.com/#page=bot-command&shared=bot-command');
  assert.match(reply.text, /Command not found\./i);
});

test('unknown command shared web link keeps subpath and opens hash page correctly', async () => {
  const reply = await executeCommand('.doesnotexist test', {
    commandPrefix: '.',
    appBaseUrl: 'https://routebot.example.com/app',
    http: {
      async get() {
        throw new Error('not used');
      },
    },
  });

  assert.equal(reply.type, 'command-not-found');
  assert.equal(reply.openInWebUrl, 'https://routebot.example.com/app/#page=bot-command&shared=bot-command');
  assert.equal(
    reply.text,
    ['Command not found.', '', 'Klik button di bawah untuk lihat semua command:'].join('\n'),
  );
});