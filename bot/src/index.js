import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { neon } from '@neondatabase/serverless';
import { createInterface } from 'node:readline/promises';
import { config as loadDotenv } from 'dotenv';
import axios from 'axios';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { buildLocationLinks as buildLocationLinksFromPoint, chunkLinksForButtons, classifyLocationLinksForSending } from './link-buttons.js';
import { buildScreenshotCommandReply } from './screenshot.js';
import { buildTtsCommandResult } from './tts.js';
import { buildUnzipCommandReply, buildZipMediaCommandReply, buildZipTextPayloadDetails } from './zip.js';
import { buildImageGridCommandReply } from './grid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(botDir, '..');

function loadEnvironment() {
  const rootEnvPath = path.join(rootDir, '.env');
  const botEnvPath = path.join(botDir, '.env');

  // Load shared root env first, then allow bot-specific overrides.
  if (fs.existsSync(rootEnvPath)) {
    loadDotenv({ path: rootEnvPath, override: false });
  }
  if (fs.existsSync(botEnvPath)) {
    loadDotenv({ path: botEnvPath, override: true });
  }
}

loadEnvironment();

let baileysModule;
let useInteractiveButtons = false;

try {
  baileysModule = await import('atexovi-baileys');
  useInteractiveButtons = true;
} catch (error) {
  console.warn('atexovi-baileys unavailable, using @whiskeysockets/baileys fallback:', error.message || error);
  baileysModule = await import('@whiskeysockets/baileys');
}

const makeWASocket =
  (typeof baileysModule.default === 'function' ? baileysModule.default : null)
  || baileysModule.makeWASocket
  || baileysModule.default?.makeWASocket;
const downloadContentFromMessage = baileysModule.downloadContentFromMessage ?? baileysModule.default?.downloadContentFromMessage;
const {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = {
  DisconnectReason: baileysModule.DisconnectReason ?? baileysModule.default?.DisconnectReason,
  fetchLatestBaileysVersion: baileysModule.fetchLatestBaileysVersion ?? baileysModule.default?.fetchLatestBaileysVersion,
  useMultiFileAuthState: baileysModule.useMultiFileAuthState ?? baileysModule.default?.useMultiFileAuthState,
};

function buildRuntimeConfig(overrides = {}) {
  const merged = {
    appBaseUrl: process.env.APP_BASE_URL || '',
    commandPrefix: process.env.COMMAND_PREFIX || '.',
    authDir: process.env.AUTH_DIR || path.join(rootDir, '.wa-auth'),
    allowedNumbers: process.env.ALLOWED_NUMBERS || '',
    ...overrides,
  };

  const appBaseUrl = String(merged.appBaseUrl || '').replace(/\/$/, '');
  const commandPrefix = String(merged.commandPrefix || '.');
  const authDir = String(merged.authDir || path.join(rootDir, '.wa-auth'));
  const allowedNumbers = new Set(
    String(merged.allowedNumbers || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replace(/\D/g, '')),
  );

  return { appBaseUrl, commandPrefix, authDir, allowedNumbers };
}

export function normalizePhoneNumber(value) {
  return String(value || '').trim().replace(/\D/g, '');
}

export function normalizePairingSelection(raw = {}) {
  const method = String(raw?.pairingMethod || '').trim().toLowerCase();
  const safeMethod = method === 'phone' ? 'phone' : 'qr';
  const phoneNumber = normalizePhoneNumber(raw?.phoneNumber ?? raw?.pairingPhoneNumber ?? '');

  return {
    pairingMethod: safeMethod,
    phoneNumber: safeMethod === 'phone' ? phoneNumber : '',
  };
}

export async function restartBotForPairingSelection(overrides = {}) {
  const normalized = normalizePairingSelection(overrides);
  const pairingMethod = normalized.pairingMethod;
  const pairingPhoneNumber = normalized.phoneNumber;
  const authDir = String(overrides.authDir || process.env.AUTH_DIR || path.join(rootDir, '.wa-auth'));

  process.env.BOT_PAIRING_METHOD = pairingMethod;
  if (pairingMethod === 'phone' && pairingPhoneNumber) {
    process.env.BOT_PAIRING_PHONE_NUMBER = pairingPhoneNumber;
  } else {
    delete process.env.BOT_PAIRING_PHONE_NUMBER;
  }

  if (activeBotSocket && typeof activeBotSocket.ws?.close === 'function') {
    try {
      activeBotSocket.ws.close();
    } catch (error) {
      console.warn('Failed to close active bot socket while switching pairing selection:', error?.message || error);
    }
  }

  resetAuthDirectory(authDir);
  activeBotSocket = null;
  activeBotStartPromise = null;

  return startBot({
    ...overrides,
    authDir,
    pairingMethod,
    pairingPhoneNumber: pairingMethod === 'phone' ? pairingPhoneNumber : undefined,
  });
}

async function choosePairingMethod(overrides = {}) {
  const configuredMethod = String(
    overrides.pairingMethod
    || process.env.BOT_PAIRING_METHOD
    || process.env.PAIRING_METHOD
    || '',
  ).trim().toLowerCase();

  if (configuredMethod === 'qr' || configuredMethod === 'phone') {
    return configuredMethod;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return 'qr';
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = String(
        await rl.question('Pilih pairing: [1] QR code / [2] number phone: '),
      ).trim().toLowerCase();

      if (answer === '1' || answer === 'qr' || answer === 'q') return 'qr';
      if (answer === '2' || answer === 'phone' || answer === 'p') return 'phone';
    }
  } finally {
    rl.close();
  }
}

async function choosePairingPhoneNumber(overrides = {}) {
  const configuredNumber = normalizePhoneNumber(
    overrides.pairingPhoneNumber
    || process.env.BOT_PAIRING_PHONE_NUMBER
    || process.env.PAIRING_PHONE_NUMBER
    || '',
  );

  if (configuredNumber) {
    return configuredNumber;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('PAIRING_PHONE_NUMBER is required for phone pairing when stdin is not interactive.');
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = normalizePhoneNumber(
        await rl.question('Masukkan nombor telefon untuk pairing (contoh 60123456789): '),
      );

      if (answer) return answer;
    }
  } finally {
    rl.close();
  }
}

function createHttpClient(baseUrl) {
  return axios.create({
    baseURL: baseUrl,
    timeout: 15000,
  });
}

function buildWhatsAppLink(phoneNumber) {
  const digits = normalizePhoneNumber(phoneNumber);
  return digits ? `https://wa.me/${digits}` : '';
}

function resetAuthDirectory(authDir) {
  const resolvedAuthDir = path.resolve(authDir);
  try {
    fs.rmSync(resolvedAuthDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('Failed to clear auth directory:', error?.message || error);
  }
}

function detachEventListener(emitter, eventName, listener) {
  if (!emitter || typeof listener !== 'function') return;

  if (typeof emitter.off === 'function') {
    emitter.off(eventName, listener);
    return;
  }

  if (typeof emitter.removeListener === 'function') {
    emitter.removeListener(eventName, listener);
  }
}

export function createAuthStatePersistenceController(saveCreds) {
  let enabled = true;

  const persist = async (...args) => {
    if (!enabled) return undefined;
    return saveCreds(...args);
  };

  return {
    persist,
    disable(emitter) {
      enabled = false;
      detachEventListener(emitter, 'creds.update', persist);
    },
    isEnabled() {
      return enabled;
    },
  };
}

const logger = pino({ level: 'info' });
const DEFAULT_TIMEZONE = String(process.env.BOT_TIMEZONE || 'Asia/Kuala_Lumpur').trim() || 'Asia/Kuala_Lumpur';
const BOT_SETTINGS_PATH = path.join(botDir, '.bot-settings.json');
const BOT_CONTACTS_FILE = path.resolve(process.env.BOT_CONTACTS_FILE || path.join(botDir, '.contacts.json'));
const DELETED_MESSAGE_LOG_PATH = path.join(botDir, '.bot-deleted-messages.json');
const BOT_CONTACTS_TABLE = 'bot_contacts';
const DELETED_MESSAGE_MEDIA_DIR = path.join(botDir, '.deleted-message-media');
const MAX_DELETED_MESSAGE_LOGS = 250;
const DEFAULT_PRAYER_CITY = String(process.env.BOT_PRAYER_CITY || 'Kuala Lumpur').trim() || 'Kuala Lumpur';
const DEFAULT_PRAYER_COUNTRY = String(process.env.BOT_PRAYER_COUNTRY || 'Malaysia').trim() || 'Malaysia';
const DEFAULT_PRAYER_METHOD = String(process.env.BOT_PRAYER_METHOD || '3').trim() || '3';
const PRAYER_REMINDER_INTERVAL_MS = 30 * 1000;
const WEEKDAY_INDEX_BY_LABEL = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_LABELS_MS = {
  Fajr: 'subuh',
  Dhuhr: 'zohor',
  Asr: 'asar',
  Maghrib: 'maghrib',
  Isha: 'isyak',
};
const MESSAGE_DEDUP_TTL_MS = 2 * 60 * 1000;
const MESSAGE_DEDUP_CLEANUP_INTERVAL_MS = 30 * 1000;
const CONTENT_DEDUP_WINDOW_MS = 8 * 1000;
const CONTENT_DEDUP_CLEANUP_INTERVAL_MS = 15 * 1000;
const CUSTOM_COMMANDS_WARNING_THROTTLE_MS = 60 * 1000;
const DEFAULT_MESSAGE_BEHAVIOR_SETTINGS = {
  respondInGroup: true,
  respondInPrivate: true,
  respondForAnyone: true,
  respondOnlySelectedGroups: false,
  allowedNumbers: '',
  allowedGroups: [],
  autoRespondUnknownCommand: true,
  unknownCommandInPrivate: true,
  unknownCommandInGroup: true,
};
const DEFAULT_REMINDER_EARLY_DAYS = [10];

const prayerTimesCache = new Map();
const processedMessageCache = new Map();
const processedContentCache = new Map();
let lastProcessedMessageCleanupAt = 0;
let lastProcessedContentCleanupAt = 0;
let activeBotSocket = null;
let activeBotStartPromise = null;
let botReconnectInProgress = false;
let lastCustomCommandsWarningAt = 0;
let botRuntimeLockHandle = null;
let botRuntimeLockPath = '';
const capturedMessages = new Map();
let deletedMessageLogs = null;

function loadDeletedMessageLogs() {
  if (deletedMessageLogs) return deletedMessageLogs;
  try {
    const stored = JSON.parse(fs.readFileSync(DELETED_MESSAGE_LOG_PATH, 'utf8'));
    deletedMessageLogs = Array.isArray(stored) ? stored : [];
  } catch {
    deletedMessageLogs = [];
  }
  return deletedMessageLogs;
}

function saveDeletedMessageLogs() {
  fs.writeFileSync(DELETED_MESSAGE_LOG_PATH, JSON.stringify(loadDeletedMessageLogs(), null, 2), 'utf8');
}

function getAuditMessageMedia(message = {}) {
  const mediaTypes = [
    ['imageMessage', 'image'],
    ['videoMessage', 'video'],
    ['audioMessage', 'audio'],
    ['documentMessage', 'document'],
    ['stickerMessage', 'sticker'],
  ];
  for (const [field, type] of mediaTypes) {
    if (message[field]) return { content: message[field], type, field };
  }
  return null;
}

function getMessageAuditText(message = {}) {
  const text = getTextMessageContent(message).trim();
  if (text) return text;
  const media = getAuditMessageMedia(message);
  return media?.content?.caption || '';
}

export async function captureMessageForAudit(msg) {
  const message = normalizeIncomingMessage(msg?.message);
  const messageId = String(msg?.key?.id || '').trim();
  const chatJid = String(msg?.key?.remoteJid || '').trim();
  if (!messageId || !chatJid || !message) return;

  const entry = {
    id: messageId,
    chatJid,
    senderJid: getCanonicalSenderJid(msg.key),
    fromMe: Boolean(msg.key?.fromMe),
    timestamp: new Date(Number(msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
    text: getMessageAuditText(message),
    mediaType: null,
    fileName: null,
    mimetype: null,
    mediaPath: null,
  };
  const media = getAuditMessageMedia(message);
  if (media) {
    entry.mediaType = media.type;
    entry.fileName = media.content.fileName || null;
    entry.mimetype = media.content.mimetype || null;
    if (downloadContentFromMessage) {
      try {
        fs.mkdirSync(DELETED_MESSAGE_MEDIA_DIR, { recursive: true });
        const stream = await downloadContentFromMessage(media.content, media.type);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const extension = entry.fileName ? path.extname(entry.fileName) : '';
        const mediaFileName = `${messageId}${extension}`;
        fs.writeFileSync(path.join(DELETED_MESSAGE_MEDIA_DIR, mediaFileName), Buffer.concat(chunks));
        entry.mediaPath = mediaFileName;
      } catch (error) {
        console.warn('Failed to archive message media:', error?.message || error);
      }
    }
  }
  capturedMessages.set(`${chatJid}|${messageId}`, entry);
  if (capturedMessages.size > 1000) {
    capturedMessages.delete(capturedMessages.keys().next().value);
  }
}

function buildDeletedMessageCapturePayload(rawPayload = {}) {
  const normalizedKey = rawPayload?.key || rawPayload || {};
  const message = rawPayload?.message || rawPayload?.update?.message || rawPayload?.data?.message || null;
  const key = {
    id: normalizedKey?.id || rawPayload?.id || '',
    remoteJid: normalizedKey?.remoteJid || rawPayload?.remoteJid || '',
    fromMe: Boolean(normalizedKey?.fromMe ?? rawPayload?.fromMe),
    participant: normalizedKey?.participant || rawPayload?.participant || '',
    participantPn: normalizedKey?.participantPn || rawPayload?.participantPn || '',
    remoteJidPn: normalizedKey?.remoteJidPn || rawPayload?.remoteJidPn || '',
  };

  if (!key.id || !key.remoteJid || !message) return null;

  return {
    key,
    message,
    messageTimestamp: Number(rawPayload?.messageTimestamp || rawPayload?.timestamp || Date.now() / 1000),
  };
}

function normalizeDeletedMessageKey(rawKey = {}) {
  const key = rawKey?.key || rawKey || {};
  const remoteJid = String(key.remoteJid || rawKey?.remoteJid || '').trim();
  const id = String(key.id || rawKey?.id || '').trim();
  if (!remoteJid || !id) return null;
  return { remoteJid, id };
}

export function recordDeletedMessage(key = {}, fallbackText = 'Pesan telah dipadamkan.') {
  const normalized = normalizeDeletedMessageKey(key);
  if (!normalized) return false;

  const { remoteJid: chatJid, id: messageId } = normalized;

  const directPayload = buildDeletedMessageCapturePayload(key);
  if (directPayload) {
    void captureMessageForAudit(directPayload);
  }

  const captured = capturedMessages.get(`${chatJid}|${messageId}`) || {
    id: messageId,
    chatJid,
    senderJid: null,
    fromMe: false,
    timestamp: new Date().toISOString(),
    text: fallbackText,
    mediaType: null,
    fileName: null,
    mimetype: null,
    mediaPath: null,
  };

  const logs = loadDeletedMessageLogs();
  if (logs.some((entry) => entry.id === messageId && entry.chatJid === chatJid)) return false;

  logs.unshift({ ...captured, deletedAt: new Date().toISOString() });
  deletedMessageLogs = logs.slice(0, MAX_DELETED_MESSAGE_LOGS);
  saveDeletedMessageLogs();
  return true;
}

export function getDeletedMessageLogs() {
  return loadDeletedMessageLogs();
}

export function removeDeletedMessageRecordsByChatId(chatJid = '') {
  const target = String(chatJid || '').trim();
  if (!target) return 0;

  const logs = loadDeletedMessageLogs();
  const nextLogs = logs.filter((entry) => String(entry?.chatJid || '').trim() !== target);
  const removed = logs.length - nextLogs.length;
  if (!removed) return 0;

  deletedMessageLogs = nextLogs.slice(0, MAX_DELETED_MESSAGE_LOGS);
  saveDeletedMessageLogs();
  return removed;
}

export function clearDeletedMessageLogs() {
  deletedMessageLogs = [];
  saveDeletedMessageLogs();
  return 0;
}

export function deleteDeletedMessageLogById(messageId = '') {
  const target = String(messageId || '').trim();
  if (!target) return false;

  const logs = loadDeletedMessageLogs();
  const nextLogs = logs.filter((entry) => String(entry?.id || '').trim() !== target);
  if (nextLogs.length === logs.length) return false;

  deletedMessageLogs = nextLogs.slice(0, MAX_DELETED_MESSAGE_LOGS);
  saveDeletedMessageLogs();
  return true;
}

export function getDeletedMessageMediaPath(fileName) {
  const safeName = path.basename(String(fileName || ''));
  return safeName ? path.join(DELETED_MESSAGE_MEDIA_DIR, safeName) : '';
}

function resolveDashboardRecipient(recipient, recipientType) {
  const value = String(recipient || '').trim();
  if (!value) throw new Error('Penerima diperlukan');
  if (recipientType === 'group') {
    if (!value.endsWith('@g.us')) throw new Error('Group ID mesti berakhir dengan @g.us');
    return value;
  }
  const number = normalizePhoneNumber(value);
  if (!number) throw new Error('Nombor telefon tidak sah');
  return `${number}@s.whatsapp.net`;
}

export function normalizeButtonPayload(buttons = []) {
  if (!Array.isArray(buttons)) return [];

  return buttons
    .map((button) => {
      const label = String(button?.label ?? button?.text ?? '').trim();
      const value = String(button?.value ?? button?.id ?? '').trim();
      const type = String(button?.type || 'quick_reply').trim() || 'quick_reply';

      if (!label || !value) return null;

      return { type, label, value };
    })
    .filter(Boolean)
    .slice(0, 3);
}

export async function sendBotDashboardMessage({ recipient, recipientType, text, media, buttons } = {}) {
  if (!activeBotSocket) throw new Error('Bot WhatsApp belum connected');
  const jid = resolveDashboardRecipient(recipient, recipientType);
  const messageText = String(text || '').trim();
  const validButtons = normalizeButtonPayload(buttons);

  if (media?.data) {
    const data = String(media.data);
    const base64 = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data;
    const content = Buffer.from(base64, 'base64');
    if (!content.length || content.length > 10 * 1024 * 1024) throw new Error('Fail mesti antara 1 byte dan 10MB');
    const type = String(media.type || '').trim();
    const payload = type === 'image' ? { image: content, caption: messageText, mimetype: media.mimetype }
      : type === 'video' ? { video: content, caption: messageText, mimetype: media.mimetype }
        : type === 'audio' ? { audio: content, ptt: Boolean(media.ptt), mimetype: media.mimetype }
          : { document: content, fileName: media.fileName || 'attachment', mimetype: media.mimetype || 'application/octet-stream', caption: messageText };
    const sent = await activeBotSocket.sendMessage(jid, payload);
    if (validButtons.length && useInteractiveButtons) {
      await sendCustomButtonsMessage(activeBotSocket, jid, messageText || 'Pilih tindakan:', validButtons);
    }
    return { messageId: sent?.key?.id || null, jid };
  }

  if (!messageText) throw new Error('Teks mesej atau fail diperlukan');
  if (validButtons.length && useInteractiveButtons) {
    await sendCustomButtonsMessage(activeBotSocket, jid, messageText, validButtons);
    return { messageId: null, jid };
  }
  const sent = await activeBotSocket.sendMessage(jid, { text: messageText });
  return { messageId: sent?.key?.id || null, jid };
}

function isPidRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function releaseBotRuntimeLock() {
  if (botRuntimeLockHandle) {
    try {
      fs.closeSync(botRuntimeLockHandle);
    } catch {
      // Ignore close errors while releasing lock.
    }
    botRuntimeLockHandle = null;
  }

  if (botRuntimeLockPath) {
    try {
      fs.rmSync(botRuntimeLockPath, { force: true });
    } catch {
      // Ignore lock cleanup errors.
    }
    botRuntimeLockPath = '';
  }
}

function acquireBotRuntimeLock(authDir) {
  const resolvedAuthDir = path.resolve(authDir);
  fs.mkdirSync(resolvedAuthDir, { recursive: true });
  const lockPath = path.join(resolvedAuthDir, '.routebot.lock');

  const tryAcquire = () => {
    const fd = fs.openSync(lockPath, 'wx');
    const payload = JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() });
    fs.writeFileSync(fd, payload, 'utf8');
    botRuntimeLockHandle = fd;
    botRuntimeLockPath = lockPath;
  };

  try {
    tryAcquire();
    return;
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
  }

  let shouldRetryAcquire = false;
  try {
    const raw = fs.readFileSync(lockPath, 'utf8');
    const parsed = JSON.parse(raw);
    const lockPid = Number(parsed?.pid || 0);
    if (!isPidRunning(lockPid)) {
      fs.rmSync(lockPath, { force: true });
      shouldRetryAcquire = true;
    }
  } catch {
    fs.rmSync(lockPath, { force: true });
    shouldRetryAcquire = true;
  }

  if (shouldRetryAcquire) {
    tryAcquire();
    return;
  }

  throw new Error(`Another bot process is already running (lock: ${lockPath}).`);
}

function buildMessageDedupKey(msg) {
  const messageId = String(msg?.key?.id || '').trim();
  if (!messageId) return '';

  const remoteJid = getCanonicalChatIdentity(msg?.key);
  const participantJid = getCanonicalSenderJid(msg?.key);
  return `${remoteJid}|${participantJid}|${messageId}`;
}

function getCanonicalSenderJid(key = {}) {
  const participantPhoneJid = String(key?.participantPn || '').trim();
  if (participantPhoneJid) return participantPhoneJid;

  const participantJid = String(key?.participant || '').trim();
  const participantIsLid = participantJid.endsWith('@lid');
  if (participantJid && !participantIsLid) return participantJid;

  const remoteJid = String(key?.remoteJid || '').trim();
  const remoteLooksLikeDirectUser = remoteJid.endsWith('@s.whatsapp.net');
  if (remoteLooksLikeDirectUser) return remoteJid;

  return participantJid || remoteJid;
}

function getCanonicalSenderIdentity(key = {}) {
  const canonicalJid = getCanonicalSenderJid(key);
  const senderNumber = normalizeSender(canonicalJid);
  return senderNumber || canonicalJid;
}

function getCanonicalChatIdentity(key = {}) {
  const remotePhoneJid = String(key?.remoteJidPn || '').trim();
  if (remotePhoneJid) return remotePhoneJid;

  const remoteJid = String(key?.remoteJid || '').trim();
  if (!remoteJid) return '';

  if (remoteJid.endsWith('@g.us') || remoteJid.endsWith('@broadcast')) {
    return remoteJid;
  }

  if (remoteJid.endsWith('@s.whatsapp.net')) {
    return remoteJid;
  }

  const senderJid = getCanonicalSenderJid(key);
  const senderNumber = normalizeSender(senderJid);
  if (senderNumber) return `${senderNumber}@s.whatsapp.net`;

  const remoteNumber = normalizeSender(remoteJid);
  if (remoteNumber) return `${remoteNumber}@s.whatsapp.net`;

  return remoteJid;
}

function cleanupProcessedMessageCache(now = Date.now()) {
  if (
    now - lastProcessedMessageCleanupAt < MESSAGE_DEDUP_CLEANUP_INTERVAL_MS
    && processedMessageCache.size < 500
  ) {
    return;
  }

  for (const [dedupKey, seenAt] of processedMessageCache.entries()) {
    if (now - seenAt > MESSAGE_DEDUP_TTL_MS) {
      processedMessageCache.delete(dedupKey);
    }
  }

  lastProcessedMessageCleanupAt = now;
}

function shouldProcessIncomingMessage(msg, now = Date.now()) {
  if (!msg?.message) return false;
  if (msg?.key?.fromMe) return false;

  const dedupKey = buildMessageDedupKey(msg);
  if (!dedupKey) return true;

  cleanupProcessedMessageCache(now);
  const previousSeenAt = processedMessageCache.get(dedupKey);
  if (typeof previousSeenAt === 'number' && now - previousSeenAt <= MESSAGE_DEDUP_TTL_MS) {
    return false;
  }

  processedMessageCache.set(dedupKey, now);
  return true;
}

function cleanupProcessedContentCache(now = Date.now()) {
  if (
    now - lastProcessedContentCleanupAt < CONTENT_DEDUP_CLEANUP_INTERVAL_MS
    && processedContentCache.size < 500
  ) {
    return;
  }

  for (const [dedupKey, seenAt] of processedContentCache.entries()) {
    if (now - seenAt > CONTENT_DEDUP_WINDOW_MS) {
      processedContentCache.delete(dedupKey);
    }
  }

  lastProcessedContentCleanupAt = now;
}

function buildContentDedupKey(chatIdentity, senderIdentity, text, message) {
  const normalizedChatIdentity = String(chatIdentity || '').trim();
  const normalizedSenderIdentity = String(senderIdentity || '').trim();
  const normalizedText = String(text || '').trim().toLowerCase();
  if (!normalizedChatIdentity || !normalizedSenderIdentity || !normalizedText) return '';

  const contextInfo = getMessageContextInfo(message);
  const quotedStanzaId = String(contextInfo?.stanzaId || '').trim();
  return `${normalizedChatIdentity}|${normalizedSenderIdentity}|${normalizedText}|${quotedStanzaId}`;
}

function shouldProcessIncomingContent(chatIdentity, senderIdentity, text, message, now = Date.now()) {
  const dedupKey = buildContentDedupKey(chatIdentity, senderIdentity, text, message);
  if (!dedupKey) return true;

  cleanupProcessedContentCache(now);
  const previousSeenAt = processedContentCache.get(dedupKey);
  if (typeof previousSeenAt === 'number' && now - previousSeenAt <= CONTENT_DEDUP_WINDOW_MS) {
    return false;
  }

  processedContentCache.set(dedupKey, now);
  return true;
}

function isValidTimeZone(timeZone) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function readBotSettings() {
  try {
    if (!fs.existsSync(BOT_SETTINGS_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(BOT_SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to read bot settings file:', error);
    return {};
  }
}

function writeBotSettings(nextSettings) {
  try {
    const existing = readBotSettings();
    const merged = {
      ...existing,
      ...(nextSettings && typeof nextSettings === 'object' ? nextSettings : {}),
    };

    fs.writeFileSync(BOT_SETTINGS_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    return true;
  } catch (error) {
    console.warn('Failed to write bot settings file:', error);
    return false;
  }
}

const persistedTimeZone = String(readBotSettings().timeZone || '').trim();
let botTimeZone = isValidTimeZone(persistedTimeZone) ? persistedTimeZone : DEFAULT_TIMEZONE;

export function normalizeGroupAllowlist(value) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value ?? '')
        .split(/[\n,]/)
        .map((item) => String(item || '').trim());

  const normalized = rawItems
    .flatMap((item) => String(item || '').split(/[\n,]/))
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, ''))
    .filter((item) => item.endsWith('@g.us'))
    .filter((item, index, array) => array.indexOf(item) === index);

  return normalized;
}

function normalizeMessageBehaviorSettings(rawSettings) {
  const source = rawSettings && typeof rawSettings === 'object' ? rawSettings : {};
  return {
    respondInGroup: source.respondInGroup !== false,
    respondInPrivate: source.respondInPrivate !== false,
    respondForAnyone: source.respondForAnyone !== false,
    respondOnlySelectedGroups: source.respondOnlySelectedGroups === true || source.groupAllowlistEnabled === true,
    allowedNumbers: String(source.allowedNumbers ?? '').trim(),
    allowedGroups: normalizeGroupAllowlist(source.allowedGroups ?? []),
    autoRespondUnknownCommand: source.autoRespondUnknownCommand !== false,
    unknownCommandInPrivate: source.unknownCommandInPrivate !== false,
    unknownCommandInGroup: source.unknownCommandInGroup !== false,
  };
}

let botMessageBehaviorSettings = normalizeMessageBehaviorSettings(
  readBotSettings().messageBehavior || DEFAULT_MESSAGE_BEHAVIOR_SETTINGS,
);

function getMessageBehaviorSettings(runtime = {}) {
  if (typeof runtime.getMessageBehaviorSettings === 'function') {
    return normalizeMessageBehaviorSettings(runtime.getMessageBehaviorSettings());
  }

  return normalizeMessageBehaviorSettings(botMessageBehaviorSettings);
}

function updateMessageBehaviorSettings(nextSettings, runtime = {}) {
  const normalized = normalizeMessageBehaviorSettings(nextSettings);

  if (typeof runtime.setMessageBehaviorSettings === 'function') {
    return runtime.setMessageBehaviorSettings(normalized);
  }

  const didPersist = writeBotSettings({ messageBehavior: normalized });
  if (!didPersist) {
    return false;
  }

  botMessageBehaviorSettings = normalized;
  return true;
}

export function getBotMessageBehaviorSettings() {
  return normalizeMessageBehaviorSettings(botMessageBehaviorSettings);
}

export function setBotMessageBehaviorSettings(nextSettings) {
  const didUpdate = updateMessageBehaviorSettings(nextSettings);
  return didUpdate ? getBotMessageBehaviorSettings() : null;
}

function normalizeReminderDate(value) {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
  const [yearStr, monthStr, dayStr] = raw.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return '';

  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) {
    return '';
  }

  return raw;
}

function normalizeReminderTime(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return '';
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function normalizeReminderEarlyDays(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || '').split(/[,\s]+/);

  const output = [];
  for (const item of source) {
    const num = Number(String(item || '').trim());
    if (!Number.isFinite(num)) continue;
    const normalized = Math.max(0, Math.floor(num));
    if (!output.includes(normalized)) output.push(normalized);
  }

  if (output.length === 0) return [...DEFAULT_REMINDER_EARLY_DAYS];
  return output.sort((a, b) => b - a);
}

function normalizeReminderTargetJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.endsWith('@g.us') || raw.endsWith('@s.whatsapp.net')) {
    return raw;
  }

  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return `${digits}@s.whatsapp.net`;
}

function normalizeReminderTargetChats(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || '').split(/[,\n]+/);

  const output = [];
  for (const item of source) {
    const jid = normalizeReminderTargetJid(item);
    if (!jid) continue;
    if (!output.includes(jid)) output.push(jid);
  }
  return output;
}

function normalizeReminderSentOffsets(value, validOffsets) {
  const validSet = new Set(Array.isArray(validOffsets) ? validOffsets : []);
  const source = Array.isArray(value) ? value : [];
  const output = [];

  for (const item of source) {
    const num = Number(item);
    if (!Number.isInteger(num)) continue;
    if (!validSet.has(num)) continue;
    if (!output.includes(num)) output.push(num);
  }

  return output.sort((a, b) => b - a);
}

function normalizeReminderItem(rawItem) {
  const source = rawItem && typeof rawItem === 'object' ? rawItem : {};
  const name = String(source.name || '').trim();
  const date = normalizeReminderDate(source.date);
  const time = normalizeReminderTime(source.time);
  if (!name || !date || !time) return null;

  const earlyDays = normalizeReminderEarlyDays(source.earlyDays);
  const sentOffsets = normalizeReminderSentOffsets(source.sentOffsets, earlyDays);
  const targetChats = normalizeReminderTargetChats(source.targetChats);
  const createdAt = String(source.createdAt || '').trim() || new Date().toISOString();
  const updatedAt = String(source.updatedAt || '').trim() || createdAt;

  return {
    id: String(source.id || randomUUID()),
    name,
    date,
    time,
    earlyDays,
    sentOffsets,
    targetChats,
    createdAt,
    updatedAt,
  };
}

function normalizeReminderConfig(rawConfig) {
  const source = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  const itemsRaw = Array.isArray(source.items) ? source.items : [];
  const items = itemsRaw
    .map((item) => normalizeReminderItem(item))
    .filter(Boolean)
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time}`;
      const bKey = `${b.date} ${b.time}`;
      return aKey.localeCompare(bKey);
    });

  return { items };
}

let botReminderConfig = normalizeReminderConfig(readBotSettings().reminders);

function getReminderConfig(runtime = {}) {
  if (typeof runtime.getReminderConfig === 'function') {
    return normalizeReminderConfig(runtime.getReminderConfig());
  }

  return normalizeReminderConfig(botReminderConfig);
}

function updateReminderConfig(nextConfig, runtime = {}) {
  const normalized = normalizeReminderConfig(nextConfig);

  if (typeof runtime.setReminderConfig === 'function') {
    return runtime.setReminderConfig(normalized);
  }

  const didPersist = writeBotSettings({ reminders: normalized });
  if (!didPersist) return false;

  botReminderConfig = normalized;
  return true;
}

function getReminderById(reminderId, runtime = {}) {
  const id = String(reminderId || '').trim();
  if (!id) return null;
  const config = getReminderConfig(runtime);
  return config.items.find((item) => item.id === id) || null;
}

export function getBotReminders() {
  return getReminderConfig().items;
}

export function createBotReminder(payload) {
  const normalized = normalizeReminderItem(payload);
  if (!normalized) return null;

  const current = getReminderConfig();
  const next = { items: [...current.items, normalized] };
  const didUpdate = updateReminderConfig(next);
  if (!didUpdate) return null;
  return normalized;
}

export function updateBotReminder(reminderId, payload) {
  const existing = getReminderById(reminderId);
  if (!existing) return null;

  const merged = {
    ...existing,
    ...(payload && typeof payload === 'object' ? payload : {}),
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };
  const normalized = normalizeReminderItem(merged);
  if (!normalized) return null;

  const current = getReminderConfig();
  const next = {
    items: current.items.map((item) => (item.id === existing.id ? normalized : item)),
  };

  const didUpdate = updateReminderConfig(next);
  if (!didUpdate) return null;
  return normalized;
}

export function deleteBotReminder(reminderId) {
  const id = String(reminderId || '').trim();
  if (!id) return false;

  const current = getReminderConfig();
  const before = current.items.length;
  const next = {
    items: current.items.filter((item) => item.id !== id),
  };
  if (next.items.length === before) return false;
  return updateReminderConfig(next);
}

function subtractDaysFromDateKey(dateKey, days) {
  const normalizedDate = normalizeReminderDate(dateKey);
  const offset = Number(days);
  if (!normalizedDate || !Number.isInteger(offset) || offset < 0) return '';

  const [yearStr, monthStr, dayStr] = normalizedDate.split('-');
  const probe = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)));
  probe.setUTCDate(probe.getUTCDate() - offset);
  const y = String(probe.getUTCFullYear());
  const m = String(probe.getUTCMonth() + 1).padStart(2, '0');
  const d = String(probe.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getReminderTargetChats(reminder, runtime = {}) {
  const reminderTargets = normalizeReminderTargetChats(reminder?.targetChats);
  if (reminderTargets.length > 0) {
    return reminderTargets;
  }

  const output = [];
  const pushUnique = (jid) => {
    const normalized = normalizeReminderTargetJid(jid);
    if (!normalized) return;
    if (!output.includes(normalized)) output.push(normalized);
  };

  const envTargets = String(process.env.BOT_REMINDER_TARGET_CHATS || '').split(/[\n,]+/);
  envTargets.forEach(pushUnique);

  const prayerConfig = getPrayerReminderConfig(runtime);
  Object.keys(prayerConfig.enabledChats || {}).forEach(pushUnique);

  if (runtime.allowedNumbers instanceof Set) {
    runtime.allowedNumbers.forEach((item) => pushUnique(item));
  }

  return output;
}

function formatReminderShortDate(dateKey) {
  const normalizedDate = normalizeReminderDate(dateKey);
  if (!normalizedDate) return dateKey;

  const [, monthStr, dayStr] = normalizedDate.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = Number(monthStr) - 1;
  const monthLabel = monthNames[monthIndex] || monthStr;
  const day = String(Number(dayStr));
  return `${day} ${monthLabel}`;
}

function buildReminderMessage(reminder, daysLeft) {
  const dateLabel = formatReminderShortDate(reminder.date);
  return `${reminder.name}, ${dateLabel} have ${daysLeft} left days.`;
}

async function checkAndSendDateReminders(sock, runtime = {}) {
  const reminderConfig = getReminderConfig(runtime);
  if (!Array.isArray(reminderConfig.items) || reminderConfig.items.length === 0) return;

  const timeZone = getCurrentTimeZone(runtime);
  const clockContext = getClockContextInTimeZone(timeZone);
  const nowKey = `${clockContext.dateKey} ${clockContext.timeKey}`;

  const nextItems = [];
  let hasChanges = false;

  for (const reminder of reminderConfig.items) {
    const normalizedItem = normalizeReminderItem(reminder);
    if (!normalizedItem) {
      hasChanges = true;
      continue;
    }

    const sentSet = new Set(normalizedItem.sentOffsets);
    let itemChanged = false;

    for (const daysLeft of normalizedItem.earlyDays) {
      if (sentSet.has(daysLeft)) continue;

      const triggerDate = subtractDaysFromDateKey(normalizedItem.date, daysLeft);
      if (!triggerDate) continue;

      const triggerKey = `${triggerDate} ${normalizedItem.time}`;
      if (nowKey < triggerKey) continue;

      const targets = getReminderTargetChats(normalizedItem, runtime);
      if (targets.length === 0) continue;

      let didSend = false;
      for (const targetJid of targets) {
        try {
          await sock.sendMessage(targetJid, {
            text: buildReminderMessage(normalizedItem, daysLeft),
          });
          didSend = true;
        } catch (error) {
          console.warn(`Failed to send reminder to ${targetJid}:`, error?.message || error);
        }
      }

      if (didSend) {
        sentSet.add(daysLeft);
        itemChanged = true;
      }
    }

    const isAllOffsetsSent = normalizedItem.earlyDays.every((offset) => sentSet.has(offset));
    const eventKey = `${normalizedItem.date} ${normalizedItem.time}`;
    const shouldDelete = isAllOffsetsSent && nowKey >= eventKey;

    if (shouldDelete) {
      hasChanges = true;
      continue;
    }

    if (itemChanged) {
      normalizedItem.sentOffsets = [...sentSet].sort((a, b) => b - a);
      normalizedItem.updatedAt = new Date().toISOString();
      hasChanges = true;
    }

    nextItems.push(normalizedItem);
  }

  if (hasChanges) {
    updateReminderConfig({ items: nextItems }, runtime);
  }
}

function normalizePrayerReminderConfig(rawConfig) {
  const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  const enabledChatsRaw = config.enabledChats && typeof config.enabledChats === 'object'
    ? config.enabledChats
    : {};
  const lastSentByChatRaw = config.lastSentByChat && typeof config.lastSentByChat === 'object'
    ? config.lastSentByChat
    : {};

  const enabledChats = {};
  for (const [jid, value] of Object.entries(enabledChatsRaw)) {
    if (String(jid || '').trim() && value === true) {
      enabledChats[jid] = true;
    }
  }

  const lastSentByChat = {};
  for (const [jid, value] of Object.entries(lastSentByChatRaw)) {
    if (!String(jid || '').trim() || !value || typeof value !== 'object') continue;

    const date = String(value.date || '').trim();
    const prayers = Array.isArray(value.prayers)
      ? value.prayers.filter((item) => PRAYER_NAMES.includes(String(item || '').trim()))
      : [];

    lastSentByChat[jid] = { date, prayers };
  }

  return { enabledChats, lastSentByChat };
}

let botPrayerReminderConfig = normalizePrayerReminderConfig(readBotSettings().prayerReminder);

function getCurrentTimeZone(runtime = {}) {
  if (typeof runtime.getTimeZone === 'function') {
    const runtimeTimeZone = String(runtime.getTimeZone() || '').trim();
    if (runtimeTimeZone) return runtimeTimeZone;
  }

  const runtimeTimeZone = String(runtime.timeZone || '').trim();
  if (runtimeTimeZone) return runtimeTimeZone;

  return botTimeZone;
}

function getPrayerReminderConfig(runtime = {}) {
  if (typeof runtime.getPrayerReminderConfig === 'function') {
    const result = runtime.getPrayerReminderConfig();
    return normalizePrayerReminderConfig(result);
  }

  return normalizePrayerReminderConfig(botPrayerReminderConfig);
}

function updatePrayerReminderConfig(nextConfig, runtime = {}) {
  const normalized = normalizePrayerReminderConfig(nextConfig);

  if (typeof runtime.setPrayerReminderConfig === 'function') {
    return runtime.setPrayerReminderConfig(normalized);
  }

  const didPersist = writeBotSettings({ prayerReminder: normalized });
  if (!didPersist) {
    return false;
  }

  botPrayerReminderConfig = normalized;
  return true;
}

function setPrayerReminderEnabledForChat(chatJid, enabled, runtime = {}) {
  const jid = String(chatJid || '').trim();
  if (!jid) return false;

  const current = getPrayerReminderConfig(runtime);
  const next = {
    enabledChats: { ...current.enabledChats },
    lastSentByChat: { ...current.lastSentByChat },
  };

  if (enabled) {
    next.enabledChats[jid] = true;
  } else {
    delete next.enabledChats[jid];
    delete next.lastSentByChat[jid];
  }

  return updatePrayerReminderConfig(next, runtime);
}

function updateTimeZone(nextTimeZone, runtime = {}) {
  const normalized = String(nextTimeZone || '').trim();
  if (!isValidTimeZone(normalized)) return false;

  if (typeof runtime.setTimeZone === 'function') {
    return runtime.setTimeZone(normalized);
  }

  const didPersist = writeBotSettings({ timeZone: normalized });
  if (!didPersist) {
    return false;
  }

  botTimeZone = normalized;
  return true;
}

function getDateContextInTimeZone(timeZone, now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(now);
  const weekdayLabel = String(parts.find((part) => part.type === 'weekday')?.value || '').slice(0, 3).toLowerCase();
  const dayOfWeek = WEEKDAY_INDEX_BY_LABEL[weekdayLabel];
  const dayOfMonth = Number(parts.find((part) => part.type === 'day')?.value || NaN);

  if (!Number.isInteger(dayOfWeek) || !Number.isFinite(dayOfMonth)) {
    return {
      dayOfWeek: now.getDay(),
      dayOfMonth: now.getDate(),
    };
  }

  return { dayOfWeek, dayOfMonth };
}

function getClockContextInTimeZone(timeZone, now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = String(parts.find((part) => part.type === 'year')?.value || '');
  const month = String(parts.find((part) => part.type === 'month')?.value || '').padStart(2, '0');
  const day = String(parts.find((part) => part.type === 'day')?.value || '').padStart(2, '0');
  const hour = String(parts.find((part) => part.type === 'hour')?.value || '').padStart(2, '0');
  const minute = String(parts.find((part) => part.type === 'minute')?.value || '').padStart(2, '0');

  if (!year || !month || !day || !hour || !minute) {
    return {
      dateKey: now.toISOString().slice(0, 10),
      timeKey: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
  }

  return {
    dateKey: `${year}-${month}-${day}`,
    timeKey: `${hour}:${minute}`,
  };
}

function normalizePrayerClockValue(value) {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`;
}

async function fetchPrayerTimesForDate(timeZone, dateContext) {
  const dateKey = dateContext?.dateKey || '';
  if (!timeZone || !dateKey) return null;

  const city = DEFAULT_PRAYER_CITY;
  const country = DEFAULT_PRAYER_COUNTRY;
  const method = DEFAULT_PRAYER_METHOD;
  const cacheKey = `${timeZone}|${dateKey}|${city}|${country}|${method}`;
  const cached = prayerTimesCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
    timeout: 15000,
    params: {
      city,
      country,
      method,
      date: dateKey,
    },
  });

  const timings = response?.data?.data?.timings;
  if (!timings || typeof timings !== 'object') {
    return null;
  }

  const result = {};
  for (const prayerName of PRAYER_NAMES) {
    result[prayerName] = normalizePrayerClockValue(timings[prayerName]);
  }

  prayerTimesCache.set(cacheKey, result);
  return result;
}

async function checkAndSendPrayerReminders(sock, runtime = {}) {
  const prayerConfig = getPrayerReminderConfig(runtime);
  const enabledChats = Object.keys(prayerConfig.enabledChats || {});
  if (enabledChats.length === 0) return;

  const timeZone = getCurrentTimeZone(runtime);
  const clockContext = getClockContextInTimeZone(timeZone);

  let prayerTimes;
  try {
    prayerTimes = await fetchPrayerTimesForDate(timeZone, clockContext);
  } catch (error) {
    console.warn('Failed to fetch prayer times:', error?.message || error);
    return;
  }

  if (!prayerTimes) return;

  const prayerName = PRAYER_NAMES.find((name) => prayerTimes[name] === clockContext.timeKey);
  if (!prayerName) return;

  const prayerLabel = PRAYER_LABELS_MS[prayerName] || prayerName.toLowerCase();
  const updatedConfig = {
    enabledChats: { ...prayerConfig.enabledChats },
    lastSentByChat: { ...prayerConfig.lastSentByChat },
  };
  let didChange = false;

  for (const chatJid of enabledChats) {
    const status = prayerConfig.lastSentByChat?.[chatJid];
    const prayersForDate = status?.date === clockContext.dateKey && Array.isArray(status?.prayers)
      ? status.prayers
      : [];
    if (prayersForDate.includes(prayerName)) {
      continue;
    }

    try {
      await sock.sendMessage(chatJid, {
        text: [
          `Sudah masuk waktu solat ${prayerLabel} .`,
          `Jam : ${prayerTimes[prayerName]}`,
          `Kawasan : (${timeZone})`,
        ].join('\n'),
      });

      const nextPrayers = [...prayersForDate, prayerName];
      updatedConfig.lastSentByChat[chatJid] = {
        date: clockContext.dateKey,
        prayers: nextPrayers,
      };
      didChange = true;
    } catch (error) {
      console.warn(`Failed to send prayer reminder to ${chatJid}:`, error?.message || error);
    }
  }

  if (didChange) {
    updatePrayerReminderConfig(updatedConfig, runtime);
  }
}

function getTextMessageContent(message) {
  const normalizedMessage = normalizeIncomingMessage(message);
  if (!normalizedMessage) return '';

  const interactiveResponse = normalizedMessage.interactiveResponseMessage;
  const nativeFlowResponseJson = interactiveResponse?.nativeFlowResponseMessage?.paramsJson;
  if (nativeFlowResponseJson) {
    try {
      const parsed = JSON.parse(nativeFlowResponseJson);
      const selectedId = String(parsed?.id || '').trim();
      if (selectedId) return selectedId;
    } catch {
      // Ignore invalid native flow payload and continue fallback parsing.
    }
  }

  return (
    normalizedMessage.conversation
    || normalizedMessage.extendedTextMessage?.text
    || normalizedMessage.buttonsResponseMessage?.selectedButtonId
    || normalizedMessage.templateButtonReplyMessage?.selectedId
    || interactiveResponse?.body?.text
    || normalizedMessage.imageMessage?.caption
    || normalizedMessage.videoMessage?.caption
    || normalizedMessage.documentMessage?.caption
    || ''
  );
}

function getMessageContextInfo(message) {
  const normalizedMessage = normalizeIncomingMessage(message);
  return (
    normalizedMessage?.extendedTextMessage?.contextInfo
    || normalizedMessage?.imageMessage?.contextInfo
    || normalizedMessage?.videoMessage?.contextInfo
    || normalizedMessage?.documentMessage?.contextInfo
    || normalizedMessage?.audioMessage?.contextInfo
    || null
  );
}

function getQuotedMessageContent(message) {
  const contextInfo = getMessageContextInfo(message);

  const quotedMessage = contextInfo?.quotedMessage;
  if (!quotedMessage) return '';

  return getTextMessageContent(quotedMessage);
}

function hasDownloadableMedia(media) {
  return Boolean(media && (media.url || media.thumbnailDirectPath));
}

function getMessageMedia(message) {
  const normalizedMessage = normalizeIncomingMessage(message);
  const mediaKeys = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'];

  for (const key of mediaKeys) {
    const media = normalizedMessage?.[key];
    if (media && typeof media === 'object' && hasDownloadableMedia(media)) {
      return {
        mediaType: key.replace('Message', ''),
        media,
      };
    }
  }

  const nestedMessage = message?.viewOnceMessage?.message || message?.viewOnceMessageV2?.message;
  if (nestedMessage && typeof nestedMessage === 'object') {
    return getMessageMedia(nestedMessage);
  }

  return null;
}

function getQuotedMediaMessage(message) {
  const contextInfo = getMessageContextInfo(message);

  const quotedMessage = normalizeIncomingMessage(contextInfo?.quotedMessage);
  if (!quotedMessage) return null;

  const mediaKeys = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'];
  for (const key of mediaKeys) {
    const media = quotedMessage[key];
    if (media && typeof media === 'object' && hasDownloadableMedia(media)) {
      return {
        quotedMessage,
        mediaType: key.replace('Message', ''),
        media,
      };
    }
  }

  const nestedQuotedMessage = quotedMessage?.viewOnceMessage?.message || quotedMessage?.viewOnceMessageV2?.message;
  if (nestedQuotedMessage && typeof nestedQuotedMessage === 'object') {
    return getMessageMedia(nestedQuotedMessage);
  }

  return null;
}

function getAllQuotedMediaMessages(message) {
  const results = [];
  const visited = new Set();
  let quotedMessage = normalizeIncomingMessage(getMessageContextInfo(message)?.quotedMessage);

  while (quotedMessage && typeof quotedMessage === 'object') {
    const mediaKeys = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'];
    let hasDirectMedia = false;

    for (const key of mediaKeys) {
      const media = quotedMessage[key];
      if (media && typeof media === 'object' && hasDownloadableMedia(media)) {
        hasDirectMedia = true;
        results.push({
          quotedMessage,
          mediaType: key.replace('Message', ''),
          media,
        });
      }
    }

    if (!hasDirectMedia) {
      const nestedQuotedMessage = quotedMessage?.viewOnceMessage?.message || quotedMessage?.viewOnceMessageV2?.message;
      if (nestedQuotedMessage && typeof nestedQuotedMessage === 'object') {
        const nestedMedia = getMessageMedia(nestedQuotedMessage);
        if (nestedMedia) {
          results.push(nestedMedia);
        }
      }
    }

    const nextQuotedMessage = normalizeIncomingMessage(getMessageContextInfo(quotedMessage)?.quotedMessage);
    if (!nextQuotedMessage || visited.has(nextQuotedMessage)) {
      break;
    }

    visited.add(nextQuotedMessage);
    quotedMessage = nextQuotedMessage;
  }

  return results;
}

function collectMediaMessages(message) {
  const results = [];
  const seenMediaRefs = new WeakSet();

  const pushMedia = (item) => {
    if (!item || !item.media || typeof item.media !== 'object') return;
    if (seenMediaRefs.has(item.media)) return;
    seenMediaRefs.add(item.media);
    results.push(item);
  };

  pushMedia(getMessageMedia(message));
  getAllQuotedMediaMessages(message).forEach(pushMedia);

  return results;
}

function isViewOnceMedia(media) {
  return Boolean(media?.viewOnce || media?.isViewOnce || media?.viewOnceMessage);
}

function getQuotedMediaFileName(mediaType, media) {
  const fallbackExtByType = {
    image: 'jpg',
    video: 'mp4',
    audio: 'mp3',
    sticker: 'webp',
    document: 'bin',
  };

  const fileName = String(media?.fileName || '').trim();
  if (mediaType === 'document' && fileName) return fileName;

  const extension = fileName.includes('.')
    ? fileName.split('.').pop()
    : fallbackExtByType[mediaType] || 'bin';

  return `quoted-${mediaType}.${extension}`;
}

async function downloadQuotedMediaBuffer(media, mediaType) {
  if (typeof downloadContentFromMessage !== 'function') {
    return null;
  }

  try {
    const stream = await downloadContentFromMessage(media, mediaType, {});
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.warn('Failed to download quoted media:', error);
    return null;
  }
}

function normalizeIncomingMessage(message) {
  const rawMessage = message && typeof message === 'object' ? message : null;
  const ephemeralMessage = rawMessage?.ephemeralMessage?.message;
  if (ephemeralMessage && typeof ephemeralMessage === 'object') {
    return ephemeralMessage;
  }

  return rawMessage;
}

function normalizeSender(jid) {
  if (!jid) return '';
  return jid.split('@')[0].replace(/\D/g, '');
}

function isAllowedSender(jid, allowedNumbers) {
  if (allowedNumbers.size === 0) return true;
  const sender = normalizeSender(jid);
  return allowedNumbers.has(sender);
}

export function isAllowedGroup(groupId, allowedGroups = []) {
  if (!Array.isArray(allowedGroups) || allowedGroups.length === 0) return false;
  const normalizedGroup = String(groupId || '').trim();
  return allowedGroups.some((item) => String(item || '').trim() === normalizedGroup);
}

function isDeliveryActiveToday(deliveryLabel, dateContext = { dayOfWeek: new Date().getDay(), dayOfMonth: new Date().getDate() }) {
  const label = String(deliveryLabel || '').trim().toLowerCase();
  if (!label) return true;

  if (label === 'daily') return true;
  if (label === 'weekday') return dateContext.dayOfWeek >= 1 && dateContext.dayOfWeek <= 5;
  if (label === 'alt 1') return dateContext.dayOfMonth % 2 === 1;
  if (label === 'alt 2') return dateContext.dayOfMonth % 2 === 0;

  return true;
}

const CUSTOM_COMMANDS_CACHE_TTL_MS = 0;
let customCommandsCacheExpiresAt = 0;
let customCommandsCacheItems = [];

function normalizeCustomCommand(rawCommand = '', commandPrefix = '.') {
  const normalized = String(rawCommand || '').trim().toLowerCase();
  if (!normalized) return '';

  if (normalized.startsWith(commandPrefix)) {
    return normalized;
  }

  return `${commandPrefix}${normalized}`;
}

function findMatchingCustomCommand(rawInput, customCommands, commandPrefix) {
  const normalizedInput = String(rawInput || '').trim().toLowerCase();
  if (!normalizedInput) return null;

  for (const item of customCommands) {
    const normalizedTrigger = String(item?.trigger || '').trim().toLowerCase();
    if (!normalizedTrigger) continue;

    const prefixedTrigger = normalizeCustomCommand(normalizedTrigger, commandPrefix);
    const triggerMatches = normalizedInput === normalizedTrigger || normalizedInput === prefixedTrigger;
    const withArgsMatches = normalizedInput.startsWith(`${normalizedTrigger} `)
      || normalizedInput.startsWith(`${prefixedTrigger} `);

    if (triggerMatches || withArgsMatches) {
      return item;
    }
  }

  return null;
}

function normalizeCustomButtons(buttons) {
  if (!Array.isArray(buttons)) return [];

  return buttons
    .map((button) => ({
      type: String(button?.type || '').trim(),
      label: String(button?.label || '').trim(),
      value: String(button?.value || '').trim(),
    }))
    .filter((button) => button.type && button.label && button.value);
}

function buildCustomCommandReply(customCommand) {
  if (!customCommand || typeof customCommand !== 'object') return null;

  return {
    type: 'custom-command',
    trigger: String(customCommand.trigger || '').trim(),
    title: String(customCommand.title || '').trim(),
    contentType: String(customCommand.contentType || 'text').trim().toLowerCase(),
    message: String(customCommand.message || '').trim(),
    mediaUrl: String(customCommand.mediaUrl || '').trim(),
    fileName: String(customCommand.fileName || '').trim(),
    buttons: normalizeCustomButtons(customCommand.buttons),
  };
}

function normalizeCustomDocumentFileName(fileName = '') {
  const normalized = String(fileName || '').trim();
  if (!normalized) return 'document.bin';
  return normalized;
}

function normalizeContactNumber(value = '') {
  return String(value || '').trim().replace(/\s+/g, '');
}

function getBotContactsFilePath() {
  return process.env.BOT_CONTACTS_FILE || BOT_CONTACTS_FILE;
}

function normalizeBotContact(contact) {
  if (!contact || typeof contact !== 'object') return null;

  const name = String(contact.name || 'Contact').trim();
  const phone = normalizeContactNumber(contact.phone || '');
  if (!name || !phone) return null;

  return {
    id: String(contact.id || contact.phone || randomUUID()).trim(),
    name,
    phone,
    category: String(contact.category || 'Other').trim() || 'Other',
    note: String(contact.note || '').trim(),
    avatar: typeof contact.avatar === 'string' ? contact.avatar.trim() : null,
  };
}

function getBotContactsDatabaseSql() {
  const databaseUrl = String(process.env.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
  if (!databaseUrl) return null;

  try {
    return neon(databaseUrl);
  } catch (error) {
    console.warn('Failed to initialize bot contacts database client:', error?.message || error);
    return null;
  }
}

async function syncBotContactsToDatabase(contacts = []) {
  const sql = getBotContactsDatabaseSql();
  if (!sql || !Array.isArray(contacts)) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bot_contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Other',
        note TEXT DEFAULT '',
        avatar TEXT DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    for (const contact of contacts) {
      const normalized = normalizeBotContact(contact);
      if (!normalized) continue;

      await sql`
        INSERT INTO bot_contacts (id, name, phone, category, note, avatar, updated_at)
        VALUES (${normalized.id}, ${normalized.name}, ${normalized.phone}, ${normalized.category}, ${normalized.note}, ${normalized.avatar}, NOW())
        ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              category = EXCLUDED.category,
              note = EXCLUDED.note,
              avatar = EXCLUDED.avatar,
              updated_at = NOW()
      `;
    }
  } catch (error) {
    console.warn('Failed to sync bot contacts to database:', error?.message || error);
  }
}

export function saveBotContacts(contacts = []) {
  const contactsFilePath = getBotContactsFilePath();
  const normalizedContacts = Array.isArray(contacts)
    ? contacts
        .map((contact) => normalizeBotContact(contact))
        .filter(Boolean)
    : [];

  try {
    const dir = path.dirname(contactsFilePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(contactsFilePath, `${JSON.stringify(normalizedContacts, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.warn('Failed to write bot contacts file:', error?.message || error);
    return [];
  }

  void syncBotContactsToDatabase(normalizedContacts);
  return normalizedContacts;
}

export function readBotContacts() {
  const contactsFilePath = getBotContactsFilePath();

  try {
    if (!fs.existsSync(contactsFilePath)) {
      return [];
    }

    const raw = fs.readFileSync(contactsFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((contact) => normalizeBotContact(contact))
      .filter(Boolean);
  } catch (error) {
    console.warn('Failed to read bot contacts file:', error?.message || error);
    return [];
  }
}

function findBotContactMatches(query = '') {
  const contacts = readBotContacts();
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return contacts;

  return contacts.filter((contact) => {
    const haystack = [contact.name, contact.phone, contact.category, contact.note || '']
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

function findBotContactById(id = '') {
  const target = String(id || '').trim();
  if (!target) return null;
  return readBotContacts().find((contact) => contact.id === target) || null;
}

function formatContactReplyText(contact) {
  const category = contact.category || 'Other';
  const note = contact.note ? contact.note : '-';

  return [
    'Contact 🪪',
    '',
    `Name: ${contact.name}`,
    `Category: ${category}`,
    '',
    `Note: ${note}`,
  ].join('\n');
}

function buildContactActionButtons(contact) {
  const phone = normalizeContactNumber(contact.phone || '');
  return [
    { type: 'button_call', label: 'Call', value: phone },
    { type: 'send_whatsapp', label: 'WhatsApp', value: phone },
    { type: 'cta_copy', label: 'Copy Number', value: phone },
  ].filter((button) => button.value);
}

function buildContactCardReply(contact) {
  return {
    type: 'contact-card',
    text: formatContactReplyText(contact),
    buttons: buildContactActionButtons(contact),
  };
}

function buildContactSearchReply(query = '', matches = []) {
  const trimmedQuery = String(query || '').trim();
  const normalizedMatches = Array.isArray(matches) ? matches : [];

  if (!normalizedMatches.length) {
    const fallbackQuery = trimmedQuery || 'contact';
    return {
      type: 'contact-search',
      text: `Tiada contact yang sepadan dengan “${fallbackQuery}”.`,
      matches: [],
    };
  }

  const enrichedMatches = normalizedMatches.map((contact) => ({
    ...contact,
    buttons: buildContactActionButtons(contact),
  }));

  if (enrichedMatches.length === 1) {
    return buildContactCardReply(enrichedMatches[0]);
  }

  return {
    type: 'contact-search',
    text: `Saya jumpa ${enrichedMatches.length} contact untuk “${trimmedQuery || 'contact'}”.`,
    matches: enrichedMatches,
  };
}

function normalizeButtonCallNumber(value = '') {
  return String(value || '').replace(/[^\d+]/g, '');
}

function normalizeSendWhatsAppLink(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  const digits = raw.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export function buildInteractiveButtonsFromCustom(buttons) {
  const output = [];

  for (const button of buttons) {
    const buttonType = String(button?.type || 'quick_reply').trim() || 'quick_reply';
    const label = String(button?.label ?? button?.text ?? '').trim();
    const value = String(button?.value ?? button?.id ?? '').trim();
    if (!label || !value) continue;

    if (buttonType === 'cta_url' || buttonType === 'pdf_url') {
      output.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: label,
          url: value,
          merchant_url: value,
        }),
      });
      continue;
    }

    if (buttonType === 'cta_copy') {
      output.push({
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: label,
          copy_code: value,
        }),
      });
      continue;
    }

    if (buttonType === 'quick_reply' || buttonType === 'single_select') {
      output.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: label,
          id: value,
        }),
      });
      continue;
    }

    if (buttonType === 'button_call') {
      const phoneNumber = normalizeButtonCallNumber(value);
      if (!phoneNumber) continue;
      output.push({
        name: 'cta_call',
        buttonParamsJson: JSON.stringify({
          display_text: label,
          phone_number: phoneNumber,
        }),
      });
      continue;
    }

    if (buttonType === 'send_whatsapp') {
      const waLink = normalizeSendWhatsAppLink(value);
      if (!waLink) continue;
      output.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: label,
          url: waLink,
          merchant_url: waLink,
        }),
      });
    }
  }

  return output;
}

function buildTemplateButtonsFromCustom(buttons) {
  const output = [];

  for (const button of buttons) {
    if (output.length >= 3) break;

    const buttonType = String(button?.type || 'quick_reply').trim() || 'quick_reply';
    const label = String(button?.label ?? button?.text ?? '').trim();
    const value = String(button?.value ?? button?.id ?? '').trim();
    if (!label || !value) continue;

    if (buttonType === 'quick_reply' || buttonType === 'single_select') {
      output.push({
        quickReplyButton: {
          displayText: label,
          id: value,
        },
      });
      continue;
    }

    if (buttonType === 'cta_url' || buttonType === 'pdf_url' || buttonType === 'send_whatsapp') {
      const resolvedUrl = buttonType === 'send_whatsapp'
        ? normalizeSendWhatsAppLink(value)
        : value;
      if (!resolvedUrl) continue;
      output.push({
        urlButton: {
          displayText: label,
          url: resolvedUrl,
        },
      });
    }
  }

  return output.map((button, index) => ({
    index: index + 1,
    ...button,
  }));
}

function buildButtonsFallbackText(buttons) {
  if (!Array.isArray(buttons) || buttons.length === 0) return '';

  const lines = buttons
    .map((button, index) => `${index + 1}. ${button.label}: ${button.value}`)
    .join('\n');

  return lines ? `\n\nPilihan:\n${lines}` : '';
}

async function sendCustomButtonsMessage(sock, jid, textBody, buttons = [], footer = 'Routebot') {
  const normalizedButtons = Array.isArray(buttons)
    ? buttons
        .map((button) => {
          const label = String(button?.label ?? button?.text ?? '').trim();
          const value = String(button?.value ?? button?.id ?? '').trim();
          const type = String(button?.type || 'quick_reply').trim() || 'quick_reply';
          if (!label || !value) return null;
          return { type, label, value };
        })
        .filter(Boolean)
    : [];

  if (normalizedButtons.length === 0) {
    if (textBody) {
      await sock.sendMessage(jid, { text: textBody });
    }
    return;
  }

  const intro = textBody || 'Pilih salah satu pilihan di bawah:';

  if (useInteractiveButtons) {
    const interactiveButtons = buildInteractiveButtonsFromCustom(normalizedButtons);
    if (interactiveButtons.length > 0) {
      try {
        await sock.sendMessage(jid, {
          text: intro,
          footer,
          interactiveButtons,
        });
        return;
      } catch (error) {
        console.warn('Failed to send custom interactive buttons, fallback to text:', error);
      }
    }
  } else {
    const templateButtons = buildTemplateButtonsFromCustom(normalizedButtons);
    if (templateButtons.length > 0) {
      try {
        await sock.sendMessage(jid, {
          text: intro,
          footer,
          templateButtons,
        });
        return;
      } catch (error) {
        console.warn('Failed to send custom template buttons, fallback to text:', error);
      }
    }
  }

  await sock.sendMessage(jid, {
    text: `${intro}${buildButtonsFallbackText(normalizedButtons)}`,
  });
}

async function sendCustomCommandResponse(sock, jid, reply) {
  const title = reply.title || 'Routebot';
  const textMessage = reply.message || '';
  const fallbackBody = textMessage || (reply.trigger ? `Command ${reply.trigger}` : 'Command response');

  if (reply.contentType === 'image' && reply.mediaUrl) {
    await sock.sendMessage(jid, {
      image: { url: reply.mediaUrl },
      caption: textMessage || undefined,
    });
    if (reply.buttons.length > 0) {
      await sendCustomButtonsMessage(sock, jid, 'Pilih tindakan:', reply.buttons, title);
    }
    return;
  }

  if (reply.contentType === 'video' && reply.mediaUrl) {
    await sock.sendMessage(jid, {
      video: { url: reply.mediaUrl },
      caption: textMessage || undefined,
    });
    if (reply.buttons.length > 0) {
      await sendCustomButtonsMessage(sock, jid, 'Pilih tindakan:', reply.buttons, title);
    }
    return;
  }

  if (reply.contentType === 'file' && reply.mediaUrl) {
    await sock.sendMessage(jid, {
      document: { url: reply.mediaUrl },
      fileName: normalizeCustomDocumentFileName(reply.fileName),
      caption: textMessage || undefined,
    });
    if (reply.buttons.length > 0) {
      await sendCustomButtonsMessage(sock, jid, 'Pilih tindakan:', reply.buttons, title);
    }
    return;
  }

  await sendCustomButtonsMessage(sock, jid, fallbackBody, reply.buttons, title);
}

async function fetchRoutes(http) {
  const response = await http.get('/api/routes');
  if (!response.data?.success || !Array.isArray(response.data?.data)) {
    throw new Error('Invalid response from /api/routes');
  }
  return response.data.data;
}

async function fetchCustomCommands(http) {
  if (!http || typeof http.get !== 'function') {
    return [];
  }

  const now = Date.now();
  if (now < customCommandsCacheExpiresAt && customCommandsCacheItems.length > 0) {
    return customCommandsCacheItems;
  }

  const response = await http.get('/api/custom-commands');
  if (!response.data?.success || !Array.isArray(response.data?.data)) {
    throw new Error('Invalid response from /api/custom-commands');
  }

  customCommandsCacheItems = response.data.data;
  customCommandsCacheExpiresAt = now + CUSTOM_COMMANDS_CACHE_TTL_MS;
  return customCommandsCacheItems;
}

function summarizeRoutes(routes) {
  if (routes.length === 0) {
    return 'Tiada route dalam sistem.';
  }

  const lines = routes.slice(0, 20).map((route, idx) => {
    const points = Array.isArray(route.deliveryPoints) ? route.deliveryPoints : [];
    return `${idx + 1}. ${route.name} (${route.code} - ${route.shift}) | Stops: ${points.length}`;
  });

  const extra = routes.length > 20 ? `\n... +${routes.length - 20} route lagi` : '';
  return `Route Summary\nTotal route: ${routes.length}\n\n${lines.join('\n')}${extra}`;
}

function summarizeRouteDetail(route, dateContext) {
  const points = Array.isArray(route.deliveryPoints) ? route.deliveryPoints : [];
  const activePoints = points.filter((point) => isDeliveryActiveToday(point.delivery, dateContext));
  const lines = points.slice(0, 30).map((point, idx) => {
    const delivery = point.delivery || 'Daily';
    return `${idx + 1}. [${point.code}] ${point.name} (${delivery})`;
  });
  const extra = points.length > 30 ? `\n... +${points.length - 30} lokasi lagi` : '';

  return [
    `Route: ${route.name}`,
    `Code: ${route.code}`,
    `Shift: ${route.shift}`,
    `Total stops: ${points.length}`,
    `Active today: ${activePoints.length}`,
    '',
    'Lokasi:',
    lines.join('\n') + extra,
  ].join('\n');
}

function findRoute(routes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const byCodeExact = routes.find((route) => String(route.code || '').trim().toLowerCase() === q);
  if (byCodeExact) return byCodeExact;

  const byNameExact = routes.find((route) => String(route.name || '').trim().toLowerCase() === q);
  if (byNameExact) return byNameExact;

  const byCodeContains = routes.find((route) => String(route.code || '').toLowerCase().includes(q));
  if (byCodeContains) return byCodeContains;

  return routes.find((route) => String(route.name || '').toLowerCase().includes(q)) || null;
}

function flattenLocations(routes) {
  const locations = [];
  for (const route of routes) {
    const points = Array.isArray(route.deliveryPoints) ? route.deliveryPoints : [];
    for (const point of points) {
      if (!point || typeof point !== 'object') continue;
      locations.push({ route, point });
    }
  }
  return locations;
}

function findLocationByCode(routes, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;

  const locations = flattenLocations(routes);
  const exact = locations.find(({ point }) => String(point.code || '').trim().toLowerCase() === q);
  if (exact) return exact;

  return locations.find(({ point }) => String(point.code || '').toLowerCase().includes(q)) || null;
}

function isLikelyImageUrl(url) {
  if (!url) return false;
  const cleaned = String(url).trim();
  if (!cleaned) return false;
  if (cleaned.startsWith('data:image/')) return true;
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return !/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(cleaned);
  }
  return false;
}

function getLocationPrimaryImage(point) {
  const avatarImages = Array.isArray(point.avatarImages) ? point.avatarImages : [];
  const qrCodeImageUrl = String(point.qrCodeImageUrl || '').trim();
  const candidates = [
    ...avatarImages,
    point.avatarImageUrl,
  ];
  return candidates.find((url) => {
    if (!isLikelyImageUrl(url)) return false;
    if (!qrCodeImageUrl) return true;
    return String(url || '').trim() !== qrCodeImageUrl;
  }) || null;
}

function buildLocationLinks(point) {
  return buildLocationLinksFromPoint(point);
}

function isPdfLocationLink(link) {
  const label = String(link?.label || '').trim().toLowerCase();
  const url = String(link?.url || '').trim().toLowerCase();
  if (!url) return false;

  if (label === 'pdf' || label.startsWith('pdf:')) return true;
  if (/\.pdf(\?|$)/i.test(url)) return true;
  if (url.startsWith('data:application/pdf')) return true;
  return false;
}

function splitLocationLinksByPdf(links) {
  const pdfLinks = [];
  const otherLinks = [];

  for (const link of Array.isArray(links) ? links : []) {
    if (isPdfLocationLink(link)) {
      pdfLinks.push(link);
    } else {
      otherLinks.push(link);
    }
  }

  return { pdfLinks, otherLinks };
}

function formatPointDescriptions(point) {
  const descriptions = Array.isArray(point.descriptions) ? point.descriptions : [];
  const lines = descriptions
    .map((item) => {
      const key = String(item?.key || '').trim();
      const value = String(item?.value || '').trim();
      if (!key || !value) return null;
      return `- ${key}: ${value}`;
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join('\n') : '';
}

function buildLocationSummary(route, point) {
  const delivery = String(point.delivery || 'Daily').trim() || 'Daily';
  const shift = String(route.shift || '-').trim() || '-';
  const routeCode = String(route.code || '-').trim() || '-';
  const routeName = String(route.name || '-').trim() || '-';
  const pointCode = String(point.code || '-').trim() || '-';
  const pointName = String(point.name || '-').trim() || '-';

  return [
    `[ ${pointCode} ] ${pointName} - ${delivery}`,
    '',
    `[ ${shift} ] ${routeCode} - ${routeName}`,
  ].join('\n');
}

async function resolveStickerHelpers(runtime = {}) {
  const runtimeBuilder = typeof runtime.buildStickerCommandReply === 'function'
    ? runtime.buildStickerCommandReply
    : null;
  const runtimeFlagParser = typeof runtime.parseStickerCommandFlags === 'function'
    ? runtime.parseStickerCommandFlags
    : null;

  if (runtimeBuilder && runtimeFlagParser) {
    return {
      buildStickerCommandReply: runtimeBuilder,
      parseStickerCommandFlags: runtimeFlagParser,
    };
  }

  try {
    const module = await import('./sticker.js');
    return {
      buildStickerCommandReply: runtimeBuilder || module.buildStickerCommandReply,
      parseStickerCommandFlags: runtimeFlagParser || module.parseStickerCommandFlags,
    };
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

function buildLocationMessage(summary, descriptions) {
  if (!descriptions) return summary;

  return [
    summary,
    '',
    'Description:',
    descriptions,
  ].join('\n');
}

function buildSharedCommandListUrl(appBaseUrl) {
  const fallback = '/#page=bot-command&shared=bot-command';
  if (!appBaseUrl) return fallback;

  try {
    const url = new URL(appBaseUrl);
    if (!url.pathname.endsWith('/')) {
      url.pathname = `${url.pathname}/`;
    }
    url.hash = 'page=bot-command&shared=bot-command';
    return url.toString();
  } catch {
    return `${String(appBaseUrl).replace(/\/$/, '')}${fallback}`;
  }
}

function buildCommandNotFoundReply(commandPrefix, appBaseUrl) {
  const openInWebUrl = buildSharedCommandListUrl(appBaseUrl);
  return {
    type: 'command-not-found',
    commandPrefix,
    openInWebUrl,
    text: [
      'Command not found.',
      '',
      'Klik button di bawah untuk lihat semua command:',
    ].join('\n'),
  };
}

export function buildTtsAudioMessage(audioBuffer) {
  return {
    audio: audioBuffer,
    mimetype: 'audio/mpeg',
    ptt: false,
  };
}

function decodeDataUrlDocument(url) {
  const raw = String(url || '').trim();
  const match = raw.match(/^data:([^;,]+)(;charset=[^;,]+)?;base64,(.+)$/i);
  if (!match) return null;

  try {
    return {
      buffer: Buffer.from(match[3], 'base64'),
      mimetype: match[1].toLowerCase(),
    };
  } catch {
    return null;
  }
}

async function sendPdfLinksAsDocuments(sock, jid, links, textBody = '') {
  if (!Array.isArray(links) || links.length === 0) return;

  for (const link of links) {
    const resolved = decodeDataUrlDocument(link?.url);
    if (!resolved) continue;

    const label = String(link?.label || 'PDF').trim() || 'PDF';
    const fileName = /\.pdf$/i.test(label)
      ? label
      : `${label}.pdf`;

    await sock.sendMessage(jid, {
      document: resolved.buffer,
      fileName,
      mimetype: resolved.mimetype || 'application/pdf',
      caption: textBody || 'Permit for this site',
    });
  }
}

async function sendLocationLinksWithFallback(sock, jid, links, textBody = '') {
  if (links.length === 0) return true;

  const messageChunks = useInteractiveButtons
    ? [links]
    : chunkLinksForButtons(links, 3);

  let sentButtons = false;

  for (let i = 0; i < messageChunks.length; i += 1) {
    const chunk = messageChunks[i];
    const intro = i === 0
      ? (textBody || 'Pilih link di bawah:')
      : 'Scan QR untuk daftar masuk , tekan button di bawah';
    try {
      const messagePayload = useInteractiveButtons
        ? {
            text: intro,
            footer: 'Routebot',
            interactiveButtons: chunk.map((link) => ({
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: link.label,
                url: link.url,
                merchant_url: link.url,
              }),
            })),
          }
        : {
            text: intro,
            footer: 'Routebot',
            templateButtons: chunk.map((link, index) => ({
              index: index + 1,
              urlButton: {
                displayText: link.label,
                url: link.url,
              },
            })),
          };

      await sock.sendMessage(jid, messagePayload);
      sentButtons = true;
    } catch (error) {
      console.warn('Failed to send interactive buttons, fallback to text links:', error);
      sentButtons = false;
      break;
    }
  }

  if (!sentButtons) {
    const linkText = links
      .map((link, idx) => `${idx + 1}. ${link.label}: ${link.url}`)
      .join('\n');
    await sock.sendMessage(jid, { text: `Link lokasi:\n${linkText}` });
  }

  return sentButtons;
}

async function sendLocationResponse(sock, jid, route, point) {
  const summary = buildLocationSummary(route, point);
  const imageUrl = getLocationPrimaryImage(point);
  const links = buildLocationLinks(point);
  const { pdfLinks, otherLinks } = splitLocationLinksByPdf(links);
  const descriptions = formatPointDescriptions(point);
  const locationMessage = buildLocationMessage(summary, descriptions);

  if (imageUrl) {
    try {
      await sock.sendMessage(jid, {
        image: { url: imageUrl },
      });
    } catch (error) {
      console.warn('Failed to send location image, fallback to text summary:', error);
      await sock.sendMessage(jid, { text: locationMessage });
    }
  }

  // No links at all — just send info text
  if (links.length === 0) {
    await sock.sendMessage(jid, { text: locationMessage });
    return;
  }

  // Step 2: send info + interactive buttons (non-PDF links)
  if (otherLinks.length > 0) {
    const sentButtons = await sendLocationLinksWithFallback(
      sock,
      jid,
      otherLinks,
      locationMessage,
    );

    if (!sentButtons) {
      await sock.sendMessage(jid, { text: locationMessage });
      const allLinksText = otherLinks
        .map((link, idx) => `${idx + 1}. ${link.label}: ${link.url}`)
        .join('\n');
      await sock.sendMessage(jid, { text: `Semua link:\n${allLinksText}` });
    }
  } else if (pdfLinks.length === 0) {
    // only non-classified links (no split happened), send all
    const sentButtons = await sendLocationLinksWithFallback(
      sock,
      jid,
      links,
      locationMessage,
    );
    if (!sentButtons) {
      await sock.sendMessage(jid, { text: locationMessage });
      const allLinksText = links
        .map((link, idx) => `${idx + 1}. ${link.label}: ${link.url}`)
        .join('\n');
      await sock.sendMessage(jid, { text: `Semua link:\n${allLinksText}` });
    }
    return;
  } else {
    // no otherLinks but has pdfLinks — still send locationMessage as text
    await sock.sendMessage(jid, { text: locationMessage });
  }

  // Step 3: send PDF attachment last
  if (pdfLinks.length > 0) {
    const { documentLinks } = classifyLocationLinksForSending(pdfLinks);
    if (documentLinks.length > 0) {
      await sendPdfLinksAsDocuments(sock, jid, documentLinks, 'Permit for this site');
    }
  }
}

async function sendCommandNotFoundWithButtons(sock, jid, reply) {
  const helpCommand = `${reply.commandPrefix}help`;

  try {
    const payload = useInteractiveButtons
      ? {
          text: reply.text,
          footer: 'Routebot',
          interactiveButtons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: 'Help',
                id: helpCommand,
              }),
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Open in web',
                url: reply.openInWebUrl,
                merchant_url: reply.openInWebUrl,
              }),
            },
          ],
        }
      : {
          text: reply.text,
          footer: 'Routebot',
          templateButtons: [
            {
              index: 1,
              quickReplyButton: {
                displayText: 'Help',
                id: helpCommand,
              },
            },
            {
              index: 2,
              urlButton: {
                displayText: 'Open in web',
                url: reply.openInWebUrl,
              },
            },
          ],
        };

    await sock.sendMessage(jid, payload);
    return;
  } catch (error) {
    console.warn('Failed to send command-not-found buttons, fallback to text:', error);
  }

  const fallbackText = [
    'Command not found.',
    '',
    `Help: ${helpCommand}`,
    `Open in web: ${reply.openInWebUrl}`,
  ].join('\n');

  await sock.sendMessage(jid, { text: fallbackText });
}

async function sendZipTextWithCopyButton(sock, jid, payload, stats = {}) {
  const encoded = String(payload || '').trim();
  const originalBytes = Number(stats.originalBytes) || 0;
  const gzipBytes = Number(stats.gzipBytes) || 0;
  const zipText = [
    'ZIP Result (gzip+base64)',
    `Original bytes: ${originalBytes}`,
    `Gzip bytes: ${gzipBytes}`,
    '',
    encoded,
  ].join('\n');

  if (!encoded) {
    await sock.sendMessage(jid, { text: 'Sila isi teks untuk di-zip.\nContoh: .zip Halo dunia' });
    return;
  }

  if (!useInteractiveButtons) {
    await sock.sendMessage(jid, { text: zipText });
    return;
  }

  try {
    await sock.sendMessage(jid, {
      text: zipText,
      footer: 'Routebot',
      interactiveButtons: [
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: 'Copy payload',
            copy_code: encoded,
          }),
        },
      ],
    });
    return;
  } catch (error) {
    console.warn('Failed to send zip cta_copy button, fallback to text:', error);
  }

  await sock.sendMessage(jid, { text: zipText });
}

function normalizeCommandText(rawText, commandPrefix = '.') {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) return trimmed;

  const normalizedPrefix = String(commandPrefix || '.').trim() || '.';
  if (trimmed.startsWith(normalizedPrefix)) return trimmed;

  return trimmed;
}

export async function executeCommand(text, runtime, message = null) {
  const {
    commandPrefix,
    http,
    appBaseUrl = process.env.APP_BASE_URL || '',
  } = runtime;
  const messageBehavior = getMessageBehaviorSettings(runtime);
  const raw = text.trim();
  const normalizedRaw = normalizeCommandText(raw, commandPrefix);
  const quotedText = getQuotedMessageContent(message);
  const quotedMedia = getQuotedMediaMessage(message);
  const quotedMediaDownloader = typeof runtime.downloadQuotedMediaBuffer === 'function'
    ? runtime.downloadQuotedMediaBuffer
    : downloadQuotedMediaBuffer;

  const locationCodeFromPrefix = normalizedRaw.startsWith(commandPrefix)
    ? normalizedRaw.slice(commandPrefix.length).trim()
    : '';
  const locationCodeFromSlashAlias = commandPrefix === '.' && normalizedRaw.startsWith('/')
    ? normalizedRaw.slice(1).trim()
    : '';
  const locationCode = locationCodeFromPrefix || locationCodeFromSlashAlias;

  if (locationCode && /^\d+$/.test(locationCode)) {
    try {
      const routes = await fetchRoutes(http);
      const foundLocation = findLocationByCode(routes, locationCode);
      if (foundLocation) {
        return {
          type: 'location',
          route: foundLocation.route,
          point: foundLocation.point,
        };
      }

      return `Lokasi tidak dijumpai untuk: ${locationCode}`;
    } catch (error) {
      console.warn('Failed to resolve numeric location command:', error);
    }
  }

  try {
    const customCommands = await fetchCustomCommands(http);
    const matchedCustomCommand = findMatchingCustomCommand(normalizedRaw, customCommands, commandPrefix);
    if (matchedCustomCommand) {
      return buildCustomCommandReply(matchedCustomCommand);
    }
  } catch (error) {
    const now = Date.now();
    if (now - lastCustomCommandsWarningAt > CUSTOM_COMMANDS_WARNING_THROTTLE_MS) {
      console.warn('Failed to fetch custom commands:', error?.message || error);
      lastCustomCommandsWarningAt = now;
    }
  }

  const contactIdMatch = typeof text === 'string' && text.trim().startsWith('contact:')
    ? text.trim().slice('contact:'.length).trim()
    : null;
  if (contactIdMatch) {
    const selectedContact = findBotContactById(contactIdMatch);
    if (selectedContact) return buildContactCardReply(selectedContact);
  }

  if (!normalizedRaw.startsWith(commandPrefix)) return null;

  const withoutPrefix = normalizedRaw.slice(commandPrefix.length).trim();
  if (!withoutPrefix) return null;

  const [name, ...rest] = withoutPrefix.split(/\s+/);
  const command = name.toLowerCase();
  const arg = rest.join(' ').trim();
  const argRaw = withoutPrefix.slice(name.length).replace(/^\s+/, '');

  if (command === 'help') {
    return [
      `Command list (${commandPrefix})`,
      `${commandPrefix}help - Tunjuk bantuan`,
      `${commandPrefix}ping - Cek bot aktif`,
      `${commandPrefix}routes - Senarai semua route`,
      `${commandPrefix}route <code|name> - Detail route`,
      `${commandPrefix}today - Ringkasan stop aktif hari ini`,
      `${commandPrefix}timezone [Region/City] - Semak atau tetapkan timezone bot`,
      `${commandPrefix}timesolat <on|off|status> - Auto notifikasi masuk waktu solat untuk chat semasa`,
      `${commandPrefix}tts <text> - Hantar teks + audio TTS`,
      `${commandPrefix}ss <link> - Hantar screenshot halaman web sebagai gambar`,
      `${commandPrefix}vv - Hantar semula media view-once (gambar/video)`,
      `${commandPrefix}qr <text> - Hasilkan QR code PNG berkualiti tinggi`,
      `${commandPrefix}txt <text> - Hasilkan fail .txt daripada teks`,
      `${commandPrefix}csv <text> - Hasilkan fail .csv daripada teks`,
      `${commandPrefix}md <text> - Hasilkan fail .md daripada teks`,
      `${commandPrefix}pdf <text> - Generate PDF: reply/hantar banyak gambar (satu per page)`,
      `${commandPrefix}sticker - Reply gambar/video jadi sticker`,
      `${commandPrefix}sticker nobg - Reply gambar jadi sticker tanpa background`,
      `${commandPrefix}grid - Kolaj gambar: reply/hantar banyak gambar untuk digabung (tiada had bilangan)`,
      `${commandPrefix}wlink <phone> - Hantar link WhatsApp dan tombol copy`,
      `${commandPrefix}zip <text> - Compress teks (gzip+base64) atau reply/hantar banyak media jadi zip file`,
      `${commandPrefix}unzip <payload> - Nyahmampat payload zip text atau reply chat/media ke teks`,
      `${commandPrefix}<location_code> - Detail lokasi + gambar + link`,
      `.<location_code> - Alias lokasi guna dot (contoh: .33)`,
    ].join('\n');
  }

  if (command === 'ping') {
    return 'Bot aktif.';
  }

  if (command === 'wlink' || command === 'wslink') {
    const phoneNumber = arg || quotedText || '';
    const link = buildWhatsAppLink(phoneNumber);

    if (!link) {
      return `Sila masukkan nombor telefon.
Contoh: ${commandPrefix}wlink 60177501997`;
    }

    return {
      type: 'text-with-copy',
      text: `Link WhatsApp:\n${link}`,
      copyText: link,
    };
  }

  const isExplicitContactCommand = command === 'contact' || command === 'c';
  const isShortContactLookup = command.length > 1 && command.startsWith('c') && command !== 'csv';

  if (isExplicitContactCommand || isShortContactLookup) {
    const baseQuery = command === 'contact' ? (arg || '') : command.slice(1) || arg || '';
    const lookupQuery = (baseQuery || arg || command).trim();
    const matches = findBotContactMatches(lookupQuery || command);

    if (!(isShortContactLookup && matches.length === 0)) {
      return buildContactSearchReply(lookupQuery || command, matches);
    }
  }

  if (command === 'routes') {
    const routes = await fetchRoutes(http);
    return summarizeRoutes(routes);
  }

  if (command === 'route') {
    if (!arg) {
      return `Sila isi code atau nama route.\nContoh: ${commandPrefix}route 3PVK04`;
    }

    const routes = await fetchRoutes(http);
    const route = findRoute(routes, arg);
    if (!route) {
      return `Route tidak dijumpai untuk: ${arg}`;
    }

    const timeZone = getCurrentTimeZone(runtime);
    const dateContext = getDateContextInTimeZone(timeZone);
    return summarizeRouteDetail(route, dateContext);
  }

  if (command === 'timezone' || command === 'tz') {
    const timeZone = getCurrentTimeZone(runtime);
    if (!arg) {
      return [
        `Timezone semasa: ${timeZone}`,
        `Guna: ${commandPrefix}timezone Asia/Kuala_Lumpur`,
      ].join('\n');
    }

    const requestedTimeZone = arg.replace(/^set\s+/i, '').trim();
    if (!requestedTimeZone) {
      return `Sila isi timezone. Contoh: ${commandPrefix}timezone Asia/Kuala_Lumpur`;
    }

    if (!isValidTimeZone(requestedTimeZone)) {
      return [
        `Timezone tidak sah: ${requestedTimeZone}`,
        'Sila guna format IANA seperti Asia/Kuala_Lumpur atau Asia/Jakarta.',
      ].join('\n');
    }

    const didUpdate = updateTimeZone(requestedTimeZone, runtime);
    if (!didUpdate) {
      return 'Gagal simpan timezone baru.';
    }

    return `Timezone berjaya ditetapkan ke: ${requestedTimeZone}`;
  }

  if (command === 'timesolat') {
    const targetChatJid = String(runtime.chatJid || '').trim();
    if (!targetChatJid) {
      return 'Command .timesolat hanya boleh digunakan dalam chat WhatsApp.';
    }

    const mode = String(arg || 'status').trim().toLowerCase();
    const prayerConfig = getPrayerReminderConfig(runtime);
    const isEnabled = prayerConfig.enabledChats?.[targetChatJid] === true;
    const targetLabel = targetChatJid.endsWith('@g.us') ? 'group ini' : 'chat ini';

    if (mode === 'status') {
      return isEnabled
        ? `Timesolat untuk ${targetLabel}: ON`
        : `Timesolat untuk ${targetLabel}: OFF\nGuna ${commandPrefix}timesolat on untuk aktifkan.`;
    }

    if (mode === 'on') {
      if (isEnabled) {
        return `Timesolat untuk ${targetLabel} sudah ON.`;
      }

      const didEnable = setPrayerReminderEnabledForChat(targetChatJid, true, runtime);
      if (!didEnable) {
        return 'Gagal simpan tetapan timesolat.';
      }

      return `Timesolat ON untuk ${targetLabel}. Bot akan hantar notifikasi bila masuk waktu solat.`;
    }

    if (mode === 'off') {
      if (!isEnabled) {
        return `Timesolat untuk ${targetLabel} sudah OFF.`;
      }

      const didDisable = setPrayerReminderEnabledForChat(targetChatJid, false, runtime);
      if (!didDisable) {
        return 'Gagal simpan tetapan timesolat.';
      }

      return `Timesolat OFF untuk ${targetLabel}.`;
    }

    return `Guna: ${commandPrefix}timesolat on | off | status`;
  }

  if (command === 'today') {
    const timeZone = getCurrentTimeZone(runtime);
    const dateContext = getDateContextInTimeZone(timeZone);
    const routes = await fetchRoutes(http);
    const details = routes.map((route) => {
      const points = Array.isArray(route.deliveryPoints) ? route.deliveryPoints : [];
      const active = points.filter((point) => isDeliveryActiveToday(point.delivery, dateContext)).length;
      return { route, total: points.length, active };
    });

    const lines = details.slice(0, 20).map((item, idx) => (
      `${idx + 1}. ${item.route.code} ${item.route.name} | Active ${item.active}/${item.total}`
    ));
    const extra = details.length > 20 ? `\n... +${details.length - 20} route lagi` : '';

    return `Active Stops Today (${timeZone})\n\n${lines.join('\n')}${extra}`;
  }

  if (command === 'tts' || command === 'voice') {
    const textToRead = arg || quotedText || 'Halo, bot Routebot siap membantu.';
    return buildTtsCommandResult(textToRead, { lang: 'ms' });
  }

  if (command === 'ss' || command === 'screenshot') {
    const targetLink = arg || quotedText || '';
    return buildScreenshotCommandReply(targetLink, {
      fetchScreenshotBuffer: runtime.fetchScreenshotBuffer,
    });
  }

  if (command === 'vv') {
    const sourceMedia = getMessageMedia(message) || quotedMedia;
    if (!sourceMedia) {
      return `Hantar atau reply media view-once (gambar/video) dan kemudian ${commandPrefix}vv`;
    }

    if (sourceMedia.mediaType !== 'image' && sourceMedia.mediaType !== 'video') {
      return 'Media ini tidak disokong untuk .vv. Guna gambar atau video view-once.';
    }

    if (!isViewOnceMedia(sourceMedia.media)) {
      return 'Media ini bukan view-once. Hantar gambar/video view-once dan cuba lagi.';
    }

    const mediaBuffer = await quotedMediaDownloader(sourceMedia.media, sourceMedia.mediaType);
    if (!mediaBuffer) {
      return 'Gagal memuat turun media view-once.';
    }

    const caption = arg || quotedText || '';

    return {
      type: 'view-once',
      mediaBuffer,
      mediaType: sourceMedia.mediaType,
      mimetype: sourceMedia.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
      caption: caption || undefined,
    };
  }

  if (command === 'qr') {
    const qrText = arg || quotedText || '';
    if (!qrText) {
      return `Sila isi teks untuk QR code. Contoh: ${commandPrefix}qr https://example.com`;
    }

    const qrBuffer = await QRCode.toBuffer(qrText, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      type: 'qrcode',
      imageBuffer: qrBuffer,
      mimetype: 'image/png',
      caption: qrText,
    };
  }

  if (command === 'txt') {
    const textContent = argRaw || quotedText || '';
    if (!textContent) {
      return `Sila isi teks untuk fail .txt. Contoh: ${commandPrefix}txt hello world`;
    }

    return {
      type: 'document',
      document: Buffer.from(textContent, 'utf8'),
      fileName: 'document.txt',
      mimetype: 'text/plain',
    };
  }

  if (command === 'csv') {
    const textContent = arg || quotedText || '';
    if (!textContent) {
      return `Sila isi teks untuk fail .csv. Contoh: ${commandPrefix}csv name,phone\\nAli,60123456789`;
    }

    return {
      type: 'document',
      document: Buffer.from(textContent, 'utf8'),
      fileName: 'document.csv',
      mimetype: 'text/csv',
    };
  }

  if (command === 'md') {
    const textContent = argRaw || quotedText || '';
    if (!textContent) {
      return `Sila isi teks untuk fail .md. Contoh: ${commandPrefix}md # Laporan Hari Ini`;
    }

    return {
      type: 'document',
      document: Buffer.from(textContent, 'utf8'),
      fileName: 'document.md',
      mimetype: 'text/markdown',
    };
  }

  if (command === 'pdf') {
    const textContent = arg || quotedText || '';
    const mediaItems = collectMediaMessages(message);
    const supportedMedia = mediaItems.filter((item) => item.mediaType === 'image');

    const imageBuffers = [];
    for (const item of supportedMedia) {
      const mediaBuffer = await quotedMediaDownloader(item.media, item.mediaType);
      if (mediaBuffer) {
        imageBuffers.push(mediaBuffer);
      }
    }

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (textContent) {
        doc.fontSize(12).text(textContent, { align: 'left' });
        doc.moveDown(1.2);
      }

      if (imageBuffers.length > 0) {
        imageBuffers.forEach((imageBuffer, index) => {
          try {
            if (textContent || index > 0) {
              doc.addPage();
            }

            doc.image(Buffer.from(imageBuffer), doc.page.margins.left, doc.page.margins.top, {
              fit: [
                doc.page.width - doc.page.margins.left - doc.page.margins.right,
                doc.page.height - doc.page.margins.top - doc.page.margins.bottom,
              ],
              align: 'center',
              valign: 'center',
            });
          } catch (error) {
            console.warn('Failed to embed image into PDF:', error);
            doc.fontSize(10).text('Satu atau lebih gambar tidak dapat dimasukkan ke dalam PDF.', { align: 'left' });
          }
        });
      } else if (mediaItems.length > 0) {
        doc.fontSize(10).text('Hanya gambar yang disokong untuk PDF. Video tidak dimasukkan.', { align: 'left' });
      }

      doc.end();
    });

    return {
      type: 'document',
      document: pdfBuffer,
      fileName: 'document.pdf',
      mimetype: 'application/pdf',
      caption: 'Permit for this site',
    };
  }

  if (command === 'sticker' || command === 'stiker') {
    if (!quotedMedia) {
      return `Reply gambar/video dan hantar ${commandPrefix}sticker`;
    }

    if (quotedMedia.mediaType !== 'image' && quotedMedia.mediaType !== 'video') {
      return 'Media tidak disokong untuk sticker. Guna gambar atau video.';
    }

    const mediaBuffer = await quotedMediaDownloader(quotedMedia.media, quotedMedia.mediaType);
    if (!mediaBuffer) {
      return 'Gagal memuat turun media yang direply untuk diproses jadi sticker.';
    }

    const stickerHelpers = await resolveStickerHelpers(runtime);
    if (!stickerHelpers) {
      return 'Fitur sticker belum tersedia pada server ini. Sila pasang dependency sticker dan restart bot.';
    }

    const flags = stickerHelpers.parseStickerCommandFlags(arg);
    const stickerBuilder = stickerHelpers.buildStickerCommandReply;

    return stickerBuilder(mediaBuffer, {
      mediaType: quotedMedia.mediaType,
      removeBackground: flags.removeBackground,
      removeBgApiKey: process.env.REMOVE_BG_API_KEY || '',
    });
  }

  if (command === 'grid') {
    const imageMedias = collectMediaMessages(message).filter((item) => item.mediaType === 'image');

    if (imageMedias.length === 0) {
      return `Sila hantar gambar bersama caption ${commandPrefix}grid atau reply gambar lain untuk digabungkan.`;
    }

    const imageBuffers = [];
    for (const imageMedia of imageMedias) {
      const imageBuffer = await quotedMediaDownloader(imageMedia.media, imageMedia.mediaType);
      if (imageBuffer) {
        imageBuffers.push(imageBuffer);
      }
    }

    if (imageBuffers.length === 0) {
      return 'Gagal memuat turun gambar untuk digabungkan.';
    }

    return buildImageGridCommandReply(imageBuffers);
  }

  if (command === 'zip') {
    const mediaItems = collectMediaMessages(message);

    if (!arg && mediaItems.length > 0) {
      const archiveEntries = [];

      for (const mediaItem of mediaItems) {
        const mediaBuffer = await quotedMediaDownloader(mediaItem.media, mediaItem.mediaType);
        if (mediaBuffer) {
          archiveEntries.push({
            buffer: mediaBuffer,
            entryName: getQuotedMediaFileName(mediaItem.mediaType, mediaItem.media),
          });
        }
      }

      if (archiveEntries.length > 0) {
        const firstEntryName = archiveEntries[0].entryName || 'attachment.bin';
        const archiveName = `${firstEntryName.replace(/\.[^.]+$/, '')}.zip`;
        return buildZipMediaCommandReply(archiveEntries, firstEntryName, archiveName);
      }
    }

    const textToZip = String(arg || quotedText || '').trim();
    if (!textToZip) {
      return 'Sila isi teks untuk di-zip.\nContoh: .zip Halo dunia';
    }

    const zipTextResult = buildZipTextPayloadDetails(textToZip);
    if (!zipTextResult?.payload) {
      return 'Hasil zip kosong.';
    }

    return {
      type: 'zip-text',
      payload: zipTextResult.payload,
      originalBytes: zipTextResult.originalBytes,
      gzipBytes: zipTextResult.gzipBytes,
    };
  }

  if (command === 'unzip') {
    return buildUnzipCommandReply(arg || quotedText);
  }

  if (!arg) {
    try {
      const routes = await fetchRoutes(http);
      const foundLocation = findLocationByCode(routes, command);
      if (foundLocation) {
        return {
          type: 'location',
          route: foundLocation.route,
          point: foundLocation.point,
        };
      }
    } catch (error) {
      console.warn('Failed to resolve location command:', error);
    }
  }

  const chatJid = String(runtime?.chatJid || '').trim();
  const isGroupChat = chatJid.endsWith('@g.us');
  const shouldAutoRespondUnknown = messageBehavior.autoRespondUnknownCommand
    && (isGroupChat
      ? messageBehavior.unknownCommandInGroup !== false
      : messageBehavior.unknownCommandInPrivate !== false);

  if (!shouldAutoRespondUnknown) {
    return null;
  }

  return buildCommandNotFoundReply(commandPrefix, appBaseUrl);
}

export async function startBot(overrides = {}) {
  if (activeBotSocket) {
    return activeBotSocket;
  }

  if (activeBotStartPromise) {
    return activeBotStartPromise;
  }

  const startPromise = (async () => {
  const onQr = typeof overrides.onQr === 'function' ? overrides.onQr : null;
  const onStatus = typeof overrides.onStatus === 'function' ? overrides.onStatus : null;
  const onPairingCode = typeof overrides.onPairingCode === 'function' ? overrides.onPairingCode : null;
  const persistedMessageBehavior = getMessageBehaviorSettings();
  const resolvedAllowedNumbers = String(
    overrides.allowedNumbers ?? persistedMessageBehavior.allowedNumbers ?? process.env.ALLOWED_NUMBERS ?? ''
  ).trim();
  const { appBaseUrl, commandPrefix, authDir, allowedNumbers } = buildRuntimeConfig({
    ...overrides,
    allowedNumbers: resolvedAllowedNumbers,
  });
  let hasRuntimeLock = false;
  if (!appBaseUrl) {
    throw new Error('APP_BASE_URL is required. Example: https://your-app.vercel.app');
  }

  acquireBotRuntimeLock(authDir);
  hasRuntimeLock = true;

  try {

  onStatus?.('starting');

  const http = createHttpClient(appBaseUrl);
  const runtime = { commandPrefix, allowedNumbers, http, appBaseUrl };
  const pairingMethod = await choosePairingMethod(overrides);
  const shouldDisplayQr = pairingMethod !== 'phone';
  let prayerReminderInterval = null;

  const startPrayerReminderLoop = () => {
    if (prayerReminderInterval) return;

    const runCheck = async () => {
      await checkAndSendPrayerReminders(sock, runtime);
      await checkAndSendDateReminders(sock, runtime);
    };
    runCheck().catch((error) => {
      console.warn('Reminder initial check failed:', error?.message || error);
    });

    prayerReminderInterval = setInterval(() => {
      runCheck().catch((error) => {
        console.warn('Reminder check failed:', error?.message || error);
      });
    }, PRAYER_REMINDER_INTERVAL_MS);
  };

  const stopPrayerReminderLoop = () => {
    if (!prayerReminderInterval) return;
    clearInterval(prayerReminderInterval);
    prayerReminderInterval = null;
  };

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();
  const authStatePersistence = createAuthStatePersistenceController(saveCreds);

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger,
    browser: ['Routebot', 'Chrome', '1.0.0'],
  });
  activeBotSocket = sock;

  sock.ev.on('creds.update', authStatePersistence.persist);

  if (!sock.authState.creds.registered) {
    if (pairingMethod === 'phone') {
      const phoneNumber = await choosePairingPhoneNumber(overrides);
      onStatus?.('pairing-phone');
      const pairingCode = await sock.requestPairingCode(phoneNumber);
      onPairingCode?.(pairingCode, phoneNumber);
      onStatus?.('pairing-code');
      console.log(`Pairing code untuk ${phoneNumber}: ${pairingCode}`);
    } else {
      onStatus?.('qr');
    }
  }

  sock.ev.on('connection.update', (update) => {
    if (activeBotSocket !== sock) {
      return;
    }

    const { connection, lastDisconnect, qr } = update;

    if (qr && shouldDisplayQr) {
      onQr?.(qr);
      onStatus?.('qr');
      console.log('\nScan QR ini dalam WhatsApp > Linked Devices > Link a Device\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'open') {
      onStatus?.('connected');
      console.log('WhatsApp bot connected.');
      startPrayerReminderLoop();
    }

    if (connection === 'close') {
      onStatus?.('closed');
      stopPrayerReminderLoop();
      authStatePersistence.disable(sock.ev);
      activeBotSocket = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      const scheduleRestart = ({ clearAuth, failureLabel }) => {
        if (botReconnectInProgress) return;
        botReconnectInProgress = true;
        onStatus?.('reconnecting');

        if (hasRuntimeLock) {
          releaseBotRuntimeLock();
          hasRuntimeLock = false;
        }

        setTimeout(() => {
          if (clearAuth) {
            resetAuthDirectory(authDir);
          }

          startBot(overrides).catch((err) => {
            onStatus?.('error');
            console.error(failureLabel, err);
          }).finally(() => {
            botReconnectInProgress = false;
          });
        }, 0);
      };

      if (shouldReconnect) {
        console.log('Connection closed. Reconnecting...');
        scheduleRestart({ clearAuth: false, failureLabel: 'Reconnect failed:' });
      } else {
        onStatus?.('logged-out');
        console.log('Logged out. Clearing auth session and restarting bot for fresh pairing.');
        scheduleRestart({ clearAuth: true, failureLabel: 'Restart after logout failed:' });
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (activeBotSocket !== sock) {
      return;
    }

    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        void captureMessageForAudit(msg);
        if (!shouldProcessIncomingMessage(msg)) continue;
        if (msg.key.remoteJid === 'status@broadcast') continue;
        const normalizedMessage = normalizeIncomingMessage(msg.message);
        if (!normalizedMessage) continue;

        const remoteJid = msg.key.remoteJid;
        const chatIdentity = getCanonicalChatIdentity(msg.key);
        const senderJid = getCanonicalSenderJid(msg.key);
        const senderIdentity = getCanonicalSenderIdentity(msg.key);
        const messageBehavior = getMessageBehaviorSettings(runtime);
        if (!remoteJid || !senderJid || !chatIdentity) continue;

        const isGroupChat = remoteJid.endsWith('@g.us');
        if (isGroupChat && !messageBehavior.respondInGroup) continue;
        if (!isGroupChat && !messageBehavior.respondInPrivate) continue;
        if (isGroupChat && messageBehavior.respondOnlySelectedGroups && !isAllowedGroup(remoteJid, messageBehavior.allowedGroups)) {
          continue;
        }

        if (!messageBehavior.respondForAnyone && !isAllowedSender(senderIdentity, runtime.allowedNumbers)) {
          continue;
        }

        const text = getTextMessageContent(normalizedMessage).trim();
        if (!text) continue;
        if (!shouldProcessIncomingContent(chatIdentity, senderIdentity, text, normalizedMessage)) continue;

        const reply = await executeCommand(text, { ...runtime, chatJid: remoteJid }, normalizedMessage);
        if (!reply) continue;

        if (typeof reply === 'string') {
          await sock.sendMessage(remoteJid, { text: reply });
          continue;
        }

        if (reply.type === 'text-with-copy') {
          if (!useInteractiveButtons) {
            await sock.sendMessage(remoteJid, { text: reply.text });
            continue;
          }

          try {
            await sock.sendMessage(remoteJid, {
              text: reply.text,
              footer: 'Routebot',
              interactiveButtons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Copy link',
                    copy_code: reply.copyText || '',
                  }),
                },
              ],
            });
          } catch (error) {
            console.warn('Failed to send wlink copy button, fallback to text:', error);
            await sock.sendMessage(remoteJid, { text: reply.text });
          }
          continue;
        }

        if (reply.type === 'zip-file') {
          if (reply.document) {
            await sock.sendMessage(
              remoteJid,
              {
                document: reply.document,
                fileName: reply.fileName || 'attachment.zip',
                mimetype: reply.mimetype || 'application/zip',
              },
            );
            continue;
          }

          await sock.sendMessage(remoteJid, { text: 'Gagal membina zip file untuk media yang direply.' });
          continue;
        }

        if (reply.type === 'zip-text') {
          await sendZipTextWithCopyButton(sock, remoteJid, reply.payload, {
            originalBytes: reply.originalBytes,
            gzipBytes: reply.gzipBytes,
          });
          continue;
        }

        if (reply.type === 'sticker') {
          if (reply.stickerBuffer) {
            await sock.sendMessage(
              remoteJid,
              { sticker: reply.stickerBuffer },
            );
            continue;
          }

          await sock.sendMessage(remoteJid, {
            text: reply.text || 'Gagal membina sticker.',
          });
          continue;
        }

        if (reply.type === 'tts') {
          if (reply.audioBuffer) {
            await sock.sendMessage(
              remoteJid,
              buildTtsAudioMessage(reply.audioBuffer),
            );
            continue;
          }

          const audioMessage = reply.audioUrl
            ? {
                text: `Suara siap: ${reply.audioUrl}`,
              }
            : { text: 'Audio tidak tersedia pada saat ini.' };
          await sock.sendMessage(remoteJid, audioMessage);
          continue;
        }

        if (reply.type === 'view-once') {
          if (reply.mediaBuffer) {
            const payload = reply.mediaType === 'video'
              ? {
                  video: reply.mediaBuffer,
                  mimetype: reply.mimetype || 'video/mp4',
                  caption: reply.caption,
                }
              : {
                  image: reply.mediaBuffer,
                  mimetype: reply.mimetype || 'image/jpeg',
                  caption: reply.caption,
                };
            await sock.sendMessage(remoteJid, payload);
            continue;
          }

          await sock.sendMessage(remoteJid, { text: 'Gagal memuat turun media view-once.' });
          continue;
        }

        if (reply.type === 'qrcode') {
          if (reply.imageBuffer) {
            await sock.sendMessage(
              remoteJid,
              {
                image: reply.imageBuffer,
                mimetype: reply.mimetype || 'image/png',
                caption: reply.caption,
              },
            );
            continue;
          }

          await sock.sendMessage(remoteJid, { text: 'Gagal menghasilkan QR code.' });
          continue;
        }

        if (reply.type === 'image-grid') {
          if (reply.imageBuffer) {
            const payload = {
              image: reply.imageBuffer,
              mimetype: reply.mimetype || 'image/jpeg',
            };
            if (reply.caption) {
              payload.caption = reply.caption;
            }

            await sock.sendMessage(
              remoteJid,
              payload,
            );
            continue;
          }

          await sock.sendMessage(remoteJid, { text: reply.caption || 'Gagal gabungkan dua gambar.' });
          continue;
        }

        if (reply.type === 'screenshot') {
          if (reply.imageBuffer) {
            await sock.sendMessage(
              remoteJid,
              {
                image: reply.imageBuffer,
                mimetype: reply.mimetype || 'image/png',
                caption: reply.caption,
              },
            );
            continue;
          }

          await sock.sendMessage(remoteJid, { text: reply.caption || 'Gagal menghasilkan screenshot.' });
          continue;
        }

        if (reply.type === 'document') {
          if (reply.document) {
            await sock.sendMessage(
              remoteJid,
              {
                document: reply.document,
                fileName: reply.fileName || 'document.txt',
                mimetype: reply.mimetype || 'text/plain',
              },
            );
            continue;
          }

          await sock.sendMessage(remoteJid, { text: 'Gagal menghasilkan dokumen.' });
          continue;
        }

        if (reply.type === 'custom-command') {
          await sendCustomCommandResponse(sock, remoteJid, reply);
          continue;
        }

        if (reply.type === 'contact-search') {
          const buttons = Array.isArray(reply.matches) && reply.matches.length > 0
            ? reply.matches.map((contact) => ({
                type: 'quick_reply',
                label: contact.name,
                value: `contact:${contact.id}`,
              }))
            : [];

          if (buttons.length > 0) {
            await sendCustomButtonsMessage(sock, remoteJid, reply.text, buttons, 'Contact');
            continue;
          }

          await sock.sendMessage(remoteJid, { text: reply.text || 'Tiada contact.' });
          continue;
        }

        if (reply.type === 'contact-card') {
          await sendCustomButtonsMessage(sock, remoteJid, reply.text, reply.buttons, 'Contact');
          continue;
        }

        if (reply.type === 'location' && reply.route && reply.point) {
          await sendLocationResponse(sock, remoteJid, reply.route, reply.point);
          continue;
        }

        if (reply.type === 'command-not-found') {
          await sendCommandNotFoundWithButtons(sock, remoteJid, reply);
          continue;
        }
      } catch (error) {
        onStatus?.('error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Message handling error:', errorMessage);
        try {
          const jid = msg.key.remoteJid;
          if (jid) {
            await sock.sendMessage(jid, {
              text: `Ralat: ${errorMessage}`,
            });
          }
        } catch {
          // Ignore send error for error response.
        }
      }
    }
  });

  sock.ev.on('messages.update', (updates = []) => {
    for (const update of updates) {
      const protocolMessage = update?.update?.message?.protocolMessage;
      if (protocolMessage?.key) {
        recordDeletedMessage({ ...protocolMessage, key: protocolMessage.key, message: update?.update?.message }, 'Pesan dipadam untuk semua');
      }
      const messageStubType = update?.update?.message?.messageStubType;
      if (messageStubType && update?.key) {
        recordDeletedMessage({ ...update, key: update.key, message: update?.message || update?.update?.message }, 'Pesan dipadam untuk semua');
      }
    }
  });

  sock.ev.on('messages.delete', (deleteEvents = []) => {
    const normalizedDeleteEvents = Array.isArray(deleteEvents) ? deleteEvents : [deleteEvents];
    for (const deleteEvent of normalizedDeleteEvents) {
      const deleteKeys = Array.isArray(deleteEvent?.keys) ? deleteEvent.keys : [deleteEvent];
      for (const item of deleteKeys) {
        if (item?.key) {
          recordDeletedMessage({ ...item, key: item.key, message: item.message || deleteEvent?.message || deleteEvent?.update?.message }, 'Pesan dipadam untuk semua');
        } else {
          recordDeletedMessage({ ...item, message: item.message || deleteEvent?.message || deleteEvent?.update?.message }, 'Pesan dipadam untuk semua');
        }
      }
    }
  });

  return sock;
  } finally {
    if (hasRuntimeLock && !activeBotSocket) {
      releaseBotRuntimeLock();
    }
  }
  })();

  activeBotStartPromise = startPromise;
  try {
    return await startPromise;
  } finally {
    if (activeBotStartPromise === startPromise) {
      activeBotStartPromise = null;
    }
  }
}

const entryArg = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryArg) {
  startBot().catch((error) => {
    console.error('Fatal startup error:', error);
    process.exit(1);
  });
}
