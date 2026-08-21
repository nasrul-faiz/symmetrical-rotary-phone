const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const qrcode = require('qrcode');
const pdfParse = require('pdf-parse');
const pino = require('pino');
const baileys = require('atexovi-baileys');
const ytSearch = require('yt-search');
const ffmpegPath = require('ffmpeg-static');
const PDFDocument = require('pdfkit');
const Tesseract = require('tesseract.js');

const customCommandStore = require('./customCommandStore');
const deletedMessageStore = require('./deletedMessageStore');
const chatResponseSettingsStore = require('./chatResponseSettingsStore');
const accessControlStore = require('./accessControlStore');
const builtInCommandSettingsStore = require('./builtInCommandSettingsStore');
const scheduleStore = require('./scheduleStore');
const { sendInteractiveButtons } = require('../lib/interactiveButtons');

const uploadDir = path.join(process.cwd(), 'uploads');
const tempDir = path.join(uploadDir, 'tmp');
const execFileAsync = promisify(execFile);

const makeWASocket = baileys.default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  normalizeMessageContent,
  downloadContentFromMessage,
} = baileys;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeTimeoutMs(value, fallbackMs) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1000) return fallbackMs;
  return Math.floor(parsed);
}

function stripCommandPrefix(text) {
  return String(text || '').replace(/^[!.][^\s]+\s*/i, '').trim();
}

function parseRelativeScheduleTime(input) {
  const match = String(input || '').trim().toLowerCase().match(/^(\d+)(m|h|d)$/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (unit === 'm') return amount * 60 * 1000;
  if (unit === 'h') return amount * 60 * 60 * 1000;
  if (unit === 'd') return amount * 24 * 60 * 60 * 1000;
  return null;
}

function parseScheduleDateTime(raw) {
  const input = String(raw || '').trim();
  if (!input) return null;

  const relativeMs = parseRelativeScheduleTime(input);
  if (relativeMs) {
    return new Date(Date.now() + relativeMs);
  }

  const normalized = input.replace(/\s+/, 'T');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(`${normalized}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function buildUsageInteractiveButtons(settingsButtons, fallbackUrl = '') {
  const source = Array.isArray(settingsButtons) ? settingsButtons : [];

  return source
    .map((item, index) => {
      // Legacy format: { displayText, url }
      if (!item?.name && Object.prototype.hasOwnProperty.call(item || {}, 'displayText')) {
        const displayText = String(item?.displayText || '').trim() || `Link ${index + 1}`;
        const rawUrl = String(item?.url || '').trim();
        const url = rawUrl || String(fallbackUrl || '').trim();
        if (!url) return null;

        return {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: displayText,
            url,
            merchant_url: url,
          }),
        };
      }

      const name = String(item?.name || '').trim();
      if (!name) return null;

      let params = {};
      if (typeof item?.buttonParamsJson === 'string') {
        try {
          const parsed = JSON.parse(item.buttonParamsJson);
          params = parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
          params = {};
        }
      } else if (item?.buttonParamsJson && typeof item.buttonParamsJson === 'object') {
        params = item.buttonParamsJson;
      }

      // For cta_url we still support automatic fallback URL when empty.
      if (name === 'cta_url') {
        const displayText = String(params.display_text || '').trim() || `Link ${index + 1}`;
        const rawUrl = String(params.url || '').trim();
        const url = rawUrl || String(fallbackUrl || '').trim();
        if (!url) return null;

        return {
          name,
          buttonParamsJson: JSON.stringify({
            ...params,
            display_text: displayText,
            url,
            merchant_url: String(params.merchant_url || url).trim() || url,
          }),
        };
      }

      return {
        name,
        buttonParamsJson: JSON.stringify(params || {}),
      };
    })
    .filter(Boolean);
}

function normalizeGroupJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.endsWith('@g.us')) {
    const local = raw.replace('@g.us', '').replace(/[^0-9-]/g, '');
    return local ? `${local}@g.us` : '';
  }

  const local = raw.replace(/[^0-9-]/g, '');
  return local ? `${local}@g.us` : '';
}

function normalizePersonalJid(value, defaultDialCode) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.endsWith('@s.whatsapp.net')) {
    const localPart = raw.split('@')[0] || '';
    const phone = localPart.split(':')[0].replace(/\D/g, '');
    return phone ? `${phone}@s.whatsapp.net` : '';
  }

  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `${defaultDialCode}${digits.slice(1)}@s.whatsapp.net`;
  return `${digits}@s.whatsapp.net`;
}

function normalizeInteractiveTrigger(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.startsWith('.')) return raw;
  if (raw.startsWith('!')) return `.${raw.slice(1)}`;

  const cleaned = raw.replace(/^[^a-z0-9]+/, '');
  if (!cleaned) return '';
  return `.${cleaned}`;
}

function pickInteractiveSelectionFromParsedParams(parsed) {
  if (!parsed || typeof parsed !== 'object') return '';

  const directCandidates = [
    parsed.selected_id,
    parsed.selectedId,
    parsed.selected_row_id,
    parsed.selectedRowId,
    parsed.single_select_reply?.selected_row_id,
    parsed.single_select_reply?.selectedRowId,
    parsed.singleSelectReply?.selected_row_id,
    parsed.singleSelectReply?.selectedRowId,
    parsed.button_id,
    parsed.buttonId,
    parsed.quick_reply_id,
    parsed.quickReplyId,
    parsed.row_id,
    parsed.rowId,
    parsed.id,
    // Additional fallback candidates for native flow responses
    parsed.button?.id,
    parsed.button?.buttonId,
    parsed.reply?.id,
    parsed.button_reply?.id,
  ];

  for (const candidate of directCandidates) {
    const value = String(candidate || '').trim();
    if (value) return value;
  }

  // Some clients can send compact payloads with an unusual key shape.
  // Search nested values and return the first non-empty scalar string.
  const queue = [parsed];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;
    if (seen.has(current)) continue;
    seen.add(current);

    for (const [key, value] of Object.entries(current)) {
      const keyLower = String(key || '').toLowerCase();
      if (['name', 'title', 'display_text', 'description', 'footer', 'body', 'text', 'message'].includes(keyLower)) {
        continue;
      }

      if (typeof value === 'string') {
        const cleaned = value.trim();
        if (cleaned) return cleaned;
        continue;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return '';
}

function isLikelyUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
}

function parseYouTubeInput(input) {
  try {
    const raw = String(input || '').trim();
    if (!raw) return null;

    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    const isYoutubeHost = hostname === 'youtu.be'
      || hostname === 'youtube.com'
      || hostname === 'music.youtube.com'
      || hostname.endsWith('.youtube.com')
      || hostname.endsWith('youtube-nocookie.com');

    if (!isYoutubeHost) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = parts[0] || '';
    } else if (url.searchParams.get('v')) {
      videoId = url.searchParams.get('v') || '';
    } else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) {
      videoId = parts[1] || '';
    } else if (parts[0] && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
      videoId = parts[0];
    }

    if (videoId && !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      videoId = '';
    }

    return {
      videoId,
      playlistOnly: Boolean(url.searchParams.get('list')) && !videoId,
      canonicalUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : raw,
    };
  } catch (error) {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonWithTimeout(url, timeoutMs = 30000) {
  const response = await fetchWithTimeout(url, {}, timeoutMs);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function sanitizeFileName(value, fallback) {
  const clean = String(value || '').replace(/[\\/:*?"<>|]+/g, '').trim();
  return clean || fallback;
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function normalizeWebUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`;
  return '';
}

function getPublicBaseUrl() {
  const candidateValues = [
    process.env.PUBLIC_URL,
    process.env.APP_URL,
    process.env.SITE_URL,
    process.env.WEBSITE_URL,
    process.env.RAILWAY_STATIC_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN,
    process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : null,
    process.env.REPLIT_DEV_DOMAIN,
  ];

  for (const candidate of candidateValues) {
    const raw = String(candidate || '').trim();
    if (!raw) continue;
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw.replace(/\/$/, '');
    }
    return `https://${raw.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}

function normalizeConnectedJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const atIndex = raw.indexOf('@');
  if (atIndex === -1) return raw;

  const localPart = raw.slice(0, atIndex);
  const domain = raw.slice(atIndex + 1);
  const cleanLocal = localPart.split(':')[0] || localPart;
  return `${cleanLocal}@${domain}`;
}

function extractPhoneFromJid(value) {
  const normalized = normalizeConnectedJid(value);
  if (!normalized) return '';
  const local = normalized.split('@')[0] || '';
  return local.replace(/\D/g, '');
}

function extractDownloadUrlFromPayload(data) {
  if (!data || typeof data !== 'object') return '';

  const candidates = [
    data?.downloadURL,
    data?.download_url,
    data?.dl,
    data?.url,
    data?.result?.url,
    data?.result?.download,
    data?.result?.dl,
    data?.result?.mp3,
    data?.result?.mp4,
    data?.result?.audio,
    data?.result?.video,
    data?.data?.url,
    data?.data?.download,
    data?.data?.download_url,
    data?.data?.dl,
    data?.data?.mp3,
    data?.data?.mp4,
  ];

  for (const candidate of candidates) {
    if (isHttpUrl(candidate)) return String(candidate).trim();
  }

  return '';
}

function extractAudioDownloadUrlFromPayload(data) {
  if (!data || typeof data !== 'object') return '';

  const candidates = [
    data?.audio,
    data?.audioUrl,
    data?.audio_url,
    data?.mp3,
    data?.result?.audio,
    data?.result?.audioUrl,
    data?.result?.audio_url,
    data?.result?.dl_audio,
    data?.result?.mp3,
    data?.result?.download?.audio,
    data?.result?.download?.mp3,
    data?.data?.audio,
    data?.data?.audioUrl,
    data?.data?.audio_url,
    data?.data?.dl_audio,
    data?.data?.mp3,
    data?.data?.download?.audio,
    data?.data?.download?.mp3,
  ];

  for (const candidate of candidates) {
    if (isHttpUrl(candidate)) return String(candidate).trim();
  }

  return extractDownloadUrlFromPayload(data);
}

function extractTitleFromPayload(data) {
  if (!data || typeof data !== 'object') return '';

  const candidates = [
    data?.title,
    data?.result?.title,
    data?.data?.title,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qrCodeDataUrl = null;
    this.qrCodeUpdatedAt = 0;
    this.qrCodeVersion = 0;
    this.ready = false;
    this.lastStatus = 'Initializing...';
    this.reconnectTimer = null;
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.initPromise = null;
    this.authPath = path.join(process.cwd(), '.baileys_auth');
    this.defaultDialCode = String(process.env.DEFAULT_DIAL_CODE || '60').replace(/\D/g, '') || '60';
    this.debugInteractive = process.env.WA_DEBUG_INTERACTIVE === '1';
    this.pairingCode = null;
    this.isRequestingPairingCode = false;
    this.store = null;
    this.connectedProfile = {
      avatarUrl: '',
      about: '',
      updatedAt: 0,
    };
    this.personalFallbackLastReplyByChat = new Map();
    this.personalFallbackCooldownMs = Number(process.env.WA_PERSONAL_FALLBACK_COOLDOWN_MS || 15000);
    this.processedIncomingMessages = new Map();
    this.incomingMessageDedupWindowMs = Number(process.env.WA_INCOMING_DEDUP_WINDOW_MS || 120000);
    this.processedCommandSignatures = new Map();
    this.commandDedupWindowMs = Number(process.env.WA_COMMAND_DEDUP_WINDOW_MS || 8000);
    this.lastConnectionNotificationAt = 0;
    this.connectionNotificationCooldownMs = Number(process.env.WA_CONNECTION_NOTIFY_COOLDOWN_MS || 60000);
    this.extractedTextStorage = new Map();
    this.recentMessageCache = new Map();
    this.recentMessageCacheWindowMs = Number(process.env.WA_RECENT_MESSAGE_CACHE_WINDOW_MS || 15 * 60 * 1000);
    this.lastDisconnectLogAtByReason = new Map();
    this.disconnectLogCooldownMs = sanitizeTimeoutMs(process.env.WA_DISCONNECT_LOG_COOLDOWN_MS, 30000);
  }

  shouldLogDisconnectReason(reason) {
    const key = String(reason || 'unknown').trim() || 'unknown';
    const now = Date.now();
    const previous = this.lastDisconnectLogAtByReason.get(key) || 0;
    if (previous && (now - previous) < this.disconnectLogCooldownMs) {
      return false;
    }
    this.lastDisconnectLogAtByReason.set(key, now);
    return true;
  }

  makeRecentMessageCacheKey(chatId, messageId) {
    const chat = String(chatId || '').trim();
    const id = String(messageId || '').trim();
    if (!chat || !id) return '';
    return `${chat}|${id}`;
  }

  cacheRecentMessage(chatId, message) {
    const cacheKey = this.makeRecentMessageCacheKey(chatId, message?.key?.id);
    if (!cacheKey || !message?.message) return;

    this.recentMessageCache.set(cacheKey, {
      message: message.message,
      pushName: message.pushName || '',
      messageTimestamp: message.messageTimestamp,
      participant: message.key?.participant || '',
      cachedAt: Date.now(),
    });

    if (this.recentMessageCache.size > 5000) {
      const now = Date.now();
      for (const [storedKey, entry] of this.recentMessageCache.entries()) {
        if ((now - entry.cachedAt) > this.recentMessageCacheWindowMs) {
          this.recentMessageCache.delete(storedKey);
        }
      }
    }
  }

  getRecentMessage(chatId, messageId) {
    const cacheKey = this.makeRecentMessageCacheKey(chatId, messageId);
    if (!cacheKey) return null;

    const entry = this.recentMessageCache.get(cacheKey);
    if (!entry) return null;

    if ((Date.now() - entry.cachedAt) > this.recentMessageCacheWindowMs) {
      this.recentMessageCache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  makeIncomingMessageDedupKey(chatId, key) {
    const remote = String(chatId || '').trim();
    const id = String(key?.id || '').trim();
    const participant = String(key?.participant || '').trim();
    const fromMeFlag = key?.fromMe ? '1' : '0';
    if (!remote || !id) return '';
    return `${remote}|${participant}|${fromMeFlag}|${id}`;
  }

  shouldProcessIncomingMessage(chatId, key) {
    const dedupKey = this.makeIncomingMessageDedupKey(chatId, key);
    if (!dedupKey) return true;

    const now = Date.now();
    const previous = this.processedIncomingMessages.get(dedupKey) || 0;
    if (previous && (now - previous) < this.incomingMessageDedupWindowMs) {
      return false;
    }

    this.processedIncomingMessages.set(dedupKey, now);

    if (this.processedIncomingMessages.size > 5000) {
      for (const [storedKey, timestamp] of this.processedIncomingMessages.entries()) {
        if ((now - timestamp) > this.incomingMessageDedupWindowMs) {
          this.processedIncomingMessages.delete(storedKey);
        }
      }
    }

    return true;
  }

  getIncomingCommandSignature(text, interactiveSelectionId) {
    const normalizedText = String(text || '').trim().toLowerCase();
    if (normalizedText.startsWith('.') || normalizedText.startsWith('!')) {
      return `cmd:${normalizedText}`;
    }

    const selection = String(interactiveSelectionId || '').trim().toLowerCase();
    if (selection) {
      return `btn:${selection}`;
    }

    return '';
  }

  shouldProcessCommandSignature(chatId, key, signature) {
    const normalizedSignature = String(signature || '').trim();
    if (!normalizedSignature) return true;

    const sender = String(key?.participant || key?.remoteJid || '').trim().toLowerCase();
    const chat = String(chatId || '').trim().toLowerCase();
    if (!chat) return true;

    const dedupKey = `${chat}|${sender}|${normalizedSignature}`;
    const now = Date.now();
    const previous = this.processedCommandSignatures.get(dedupKey) || 0;
    if (previous && (now - previous) < this.commandDedupWindowMs) {
      return false;
    }

    this.processedCommandSignatures.set(dedupKey, now);

    if (this.processedCommandSignatures.size > 5000) {
      for (const [storedKey, timestamp] of this.processedCommandSignatures.entries()) {
        if ((now - timestamp) > this.commandDedupWindowMs) {
          this.processedCommandSignatures.delete(storedKey);
        }
      }
    }

    return true;
  }

  async refreshQrCode() {
    if (this.ready) {
      throw new Error('WhatsApp is already connected');
    }

    this.lastStatus = 'Refreshing QR session...';
    this.qrCodeDataUrl = null;
    this.qrCodeUpdatedAt = 0;
    this.pairingCode = null;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socketToClose = this.sock;
    this.sock = null;
    this.isInitializing = false;

    try {
      if (socketToClose) {
        socketToClose.end(new Error('manual_qr_refresh'));
      }
    } catch (error) {
      console.warn('[WA] Failed to close socket during manual QR refresh:', error.message);
    }

    await this.init();
    await this.waitForQrOrReady();
    return this.getConnectionState();
  }

  async waitForQrOrReady() {
    const timeoutMs = Math.max(1000, Number(process.env.WA_QR_REFRESH_WAIT_MS || 12000));
    const pollMs = 250;
    const startedAt = Date.now();

    while ((Date.now() - startedAt) < timeoutMs) {
      if (this.ready || this.qrCodeDataUrl) {
        return;
      }
      await sleep(pollMs);
    }
  }

  shouldSendPersonalFallback(chatId) {
    const target = String(chatId || '').trim();
    if (!target || target.endsWith('@g.us')) return false;

    const now = Date.now();
    const previous = this.personalFallbackLastReplyByChat.get(target) || 0;
    if ((now - previous) < this.personalFallbackCooldownMs) return false;

    this.personalFallbackLastReplyByChat.set(target, now);
    return true;
  }

  async maybeReplyPersonalFallback(chatId, text) {
    if (!this.sock) return;
    if (!String(text || '').trim()) return;
    if (!this.shouldSendPersonalFallback(chatId)) return;

    const fallbackText = String(process.env.WA_PERSONAL_FALLBACK_TEXT || '').trim()
      || 'Hi, personal chat aktif. Guna command seperti .alive, .menu1 atau .demobutton.';

    try {
      await this.sock.sendMessage(chatId, { text: fallbackText });
    } catch (error) {
      console.error('[WA] Failed to send personal fallback reply:', error.message);
    }
  }

  async refreshConnectedProfile() {
    if (!this.sock || !this.ready) return;

    const rawUser = this.sock.user || null;
    const jid = normalizeConnectedJid(rawUser?.id || rawUser?.jid || '');
    if (!jid) return;

    let avatarUrl = '';
    let about = '';

    try {
      const photoUrl = await this.sock.profilePictureUrl(jid, 'image');
      avatarUrl = String(photoUrl || '').trim();
    } catch (error) {
      avatarUrl = '';
    }

    try {
      const status = await this.sock.fetchStatus(jid);
      about = String(status?.status || '').trim();
    } catch (error) {
      about = '';
    }

    this.connectedProfile = {
      avatarUrl,
      about,
      updatedAt: Date.now(),
    };
  }

  logInteractiveDebug(message, details = null) {
    if (!this.debugInteractive) return;

    if (details == null) {
      console.log(`[WA][interactive] ${message}`);
      return;
    }

    try {
      console.log(`[WA][interactive] ${message}:`, JSON.stringify(details));
    } catch (error) {
      console.log(`[WA][interactive] ${message}:`, details);
    }
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    if (this.isInitializing) return;

    this.isInitializing = true;
    this.lastStatus = 'Starting WhatsApp client...';

    this.initPromise = this.startSocket()
      .catch((error) => {
        this.lastStatus = `Initialization failed: ${error.message}`;
        this.ready = false;
        this.isInitializing = false;
        console.error('[WA] Initialization error:', error.message);
        this.scheduleReinitialize('initialize_error');
      })
      .finally(() => {
        this.initPromise = null;
      });

    return this.initPromise;
  }

  async startSocket() {
    fs.mkdirSync(this.authPath, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

    let version;
    try {
      ({ version } = await fetchLatestBaileysVersion());
    } catch (error) {
      console.warn('[WA] Failed to fetch latest WA version, using fallback');
    }

    const socketLogger = pino({ level: 'silent' });
    if (!this.store) {
      this.store = makeInMemoryStore({ logger: socketLogger });
    }

    this.sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, socketLogger),
      },
      logger: socketLogger,
      browser: ['ScheduleBot', 'Desktop', '1.0.0'],
      printQRInTerminal: false,
      connectTimeoutMs: sanitizeTimeoutMs(process.env.WA_CONNECT_TIMEOUT_MS, 25000),
      keepAliveIntervalMs: 15000,
      defaultQueryTimeoutMs: sanitizeTimeoutMs(process.env.WA_QUERY_TIMEOUT_MS, 20000),
      version,
    });
    const currentSocket = this.sock;

    this.store.bind(currentSocket.ev);

    currentSocket.ev.on('creds.update', saveCreds);

    currentSocket.ev.on('messages.upsert', async (event) => {
      try {
        await this.handleIncomingMessages(event);
      } catch (error) {
        console.error('[WA] Failed to handle incoming message:', error.message);
      }
    });

    currentSocket.ev.on('messages.update', async (updates) => {
      try {
        await this.handleMessageUpdates(updates);
      } catch (error) {
        console.error('[WA] Failed to handle message update:', error.message);
      }
    });

    currentSocket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCodeDataUrl = await qrcode.toDataURL(qr, {
          errorCorrectionLevel: 'M',
          margin: 1,
          scale: 10,
          color: {
            dark: '#111111',
            light: '#FFFFFF',
          },
        });
        this.qrCodeUpdatedAt = Date.now();
        this.qrCodeVersion += 1;
        this.lastStatus = 'Scan QR from dashboard';
        this.ready = false;
        this.isInitializing = false;
      }

      if (connection === 'connecting' && !qr) {
        this.lastStatus = 'Connecting to WhatsApp...';
      }

      if (connection === 'open') {
        this.lastStatus = 'WhatsApp connected';
        const wasReady = this.ready;
        this.ready = true;
        this.isInitializing = false;
        this.reconnectAttempts = 0;
        this.qrCodeDataUrl = null;
        this.qrCodeUpdatedAt = 0;
        this.pairingCode = null;
        if (!wasReady) {
          console.log('[WA] Client ready');
          this.notifyConnectionEstablished().catch((error) => {
            console.warn('[WA] Failed to send connection notification:', error.message);
          });
        }
        this.refreshConnectedProfile().catch((error) => {
          console.warn('[WA] Failed to refresh connected profile:', error.message);
        });
      }

      if (connection === 'close') {
        if (currentSocket !== this.sock) {
          return;
        }

        this.ready = false;
        this.isInitializing = false;
        this.sock = null;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const disconnectReason = this.describeDisconnectReason(statusCode);
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const isAuthInvalid = statusCode === 405;
        const isRestartRequired = statusCode === DisconnectReason.restartRequired;
        this.lastStatus = `Disconnected: ${disconnectReason}`;
        if (this.shouldLogDisconnectReason(disconnectReason)) {
          console.error('[WA] Disconnected event:', disconnectReason);
        }

        if (isLoggedOut || isAuthInvalid) {
          try {
            fs.rmSync(this.authPath, { recursive: true, force: true });
            fs.mkdirSync(this.authPath, { recursive: true });
          } catch (error) {
            console.error('[WA] Failed to reset auth:', error.message);
          }
          this.qrCodeDataUrl = null;
          this.qrCodeUpdatedAt = 0;
          this.pairingCode = null;
          this.scheduleReinitialize(isAuthInvalid ? 'auth_invalid' : 'logged_out');
          return;
        }

        if (isRestartRequired) {
          this.scheduleReinitialize('restart_required', 0);
          return;
        }

        this.scheduleReinitialize('disconnected');
      }
    });
  }

  describeDisconnectReason(statusCode) {
    if (statusCode === DisconnectReason.restartRequired) return 'restart_required (515)';
    if (statusCode === DisconnectReason.connectionLost) return 'connection_lost (408)';
    if (statusCode === DisconnectReason.connectionClosed) return 'connection_closed (428)';
    if (statusCode === DisconnectReason.connectionReplaced) return 'connection_replaced (440)';
    if (statusCode === DisconnectReason.loggedOut) return 'logged_out (401)';
    if (statusCode === DisconnectReason.badSession) return 'bad_session (500)';
    if (statusCode === DisconnectReason.multideviceMismatch) return 'multidevice_mismatch (411)';
    if (statusCode === DisconnectReason.forbidden) return 'forbidden (403)';
    if (statusCode === 405) return 'auth_invalid (405)';
    if (statusCode === DisconnectReason.unavailableService) return 'unavailable_service (503)';
    return statusCode ? `unknown (${statusCode})` : 'unknown';
  }

  scheduleReinitialize(trigger, delayOverrideMs) {
    if (this.reconnectTimer) return;

    this.reconnectAttempts += 1;
    const reconnectDelayMs = typeof delayOverrideMs === 'number'
      ? delayOverrideMs
      : Math.min(4000 * (2 ** (this.reconnectAttempts - 1)), 60000);

    this.lastStatus = `Reconnecting after ${trigger} in ${Math.round(reconnectDelayMs / 1000)}s...`;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      const socketToClose = this.sock;
      this.sock = null;
      this.isInitializing = false;

      try {
        if (socketToClose) {
          socketToClose.end(new Error('reconnect'));
        }
      } catch (error) {
        console.error('[WA] End socket error:', error.message);
      }

      this.init();
    }, reconnectDelayMs);
  }

  getConnectionState() {
    const rawUser = this.sock?.user || null;
    const jid = normalizeConnectedJid(rawUser?.id || rawUser?.jid || '');
    const phoneNumber = extractPhoneFromJid(jid);
    const displayName = String(rawUser?.name || rawUser?.verifiedName || '').trim();
    const fallbackAvatar = String(rawUser?.imgUrl || '').trim();

    if (this.ready && jid) {
      const profileAge = Date.now() - Number(this.connectedProfile?.updatedAt || 0);
      const hasAvatar = Boolean(String(this.connectedProfile?.avatarUrl || '').trim());
      const shouldRetryMissingAvatar = !hasAvatar && profileAge > 20 * 1000;

      if (!this.connectedProfile?.updatedAt || profileAge > 5 * 60 * 1000 || shouldRetryMissingAvatar) {
        this.refreshConnectedProfile().catch(() => {});
      }
    }

    return {
      ready: this.ready,
      status: this.lastStatus,
      qrCodeDataUrl: this.qrCodeDataUrl,
      qrCodeUpdatedAt: this.qrCodeUpdatedAt,
      qrCodeVersion: this.qrCodeVersion,
      pairingCode: this.pairingCode,
      connectedAccount: {
        jid,
        phoneNumber,
        displayName,
        about: String(this.connectedProfile?.about || '').trim(),
        avatarUrl: String(this.connectedProfile?.avatarUrl || fallbackAvatar).trim(),
      },
    };
  }

  async requestPairingCode(phoneNumber) {
    if (!this.sock) {
      throw new Error('WhatsApp client is not ready yet, please wait a moment');
    }

    if (this.ready) {
      throw new Error('WhatsApp is already connected');
    }

    if (this.sock.authState?.creds?.registered) {
      throw new Error('This session is already registered, restart the connection to re-pair');
    }

    if (this.isRequestingPairingCode) {
      throw new Error('A pairing code request is already in progress');
    }

    const normalized = this.normalizePersonalNumber(phoneNumber);
    if (!normalized || normalized.length < 8) {
      throw new Error('Invalid phone number');
    }

    this.isRequestingPairingCode = true;
    try {
      const code = await this.sock.requestPairingCode(normalized);
      this.pairingCode = code;
      this.lastStatus = 'Enter the pairing code in WhatsApp > Linked Devices';
      return code;
    } finally {
      this.isRequestingPairingCode = false;
    }
  }

  buildChatId(targetType, target) {
    const rawTarget = String(target || '').trim();
    if (!rawTarget) {
      throw new Error('Target cannot be empty');
    }

    if (targetType === 'group') {
      if (rawTarget.endsWith('@g.us')) {
        return rawTarget;
      }

      const normalizedGroup = rawTarget.replace(/[^0-9-]/g, '');
      if (!normalizedGroup) {
        throw new Error('Invalid group ID');
      }

      return `${normalizedGroup}@g.us`;
    }

    if (rawTarget.includes('@')) {
      return rawTarget;
    }

    const normalizedPhone = this.normalizePersonalNumber(rawTarget);
    if (!normalizedPhone) {
      throw new Error('Invalid destination number');
    }

    return `${normalizedPhone}@s.whatsapp.net`;
  }

  normalizePersonalNumber(value) {
    const rawValue = String(value || '').trim();
    if (!rawValue) return '';

    if (rawValue.endsWith('@s.whatsapp.net')) {
      return rawValue.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
    }

    const digitsOnly = rawValue.replace(/\D/g, '');
    if (!digitsOnly) return '';

    if (digitsOnly.startsWith('0')) {
      return `${this.defaultDialCode}${digitsOnly.slice(1)}`;
    }

    if (digitsOnly.startsWith(this.defaultDialCode)) {
      return digitsOnly;
    }

    return digitsOnly;
  }

  extractSenderPhone(chatId, key) {
    const chat = String(chatId || '').trim();
    const participant = String(key?.participant || '').trim();

    if (participant.endsWith('@s.whatsapp.net')) {
      return extractPhoneFromJid(participant);
    }

    if (chat.endsWith('@s.whatsapp.net')) {
      return extractPhoneFromJid(chat);
    }

    return '';
  }

  isCommandAccessAllowed(chatId, key) {
    const settings = accessControlStore.getSettings();
    if (settings.commandMode !== 'private') return true;

    const ownerNormalized = this.normalizePersonalNumber(settings.ownerNumber);
    if (!ownerNormalized) return false;

    const senderPhone = this.extractSenderPhone(chatId, key);
    const senderNormalized = this.normalizePersonalNumber(senderPhone);
    if (!senderNormalized) return false;

    return senderNormalized === ownerNormalized;
  }

  async sendMessage(targetType, target, message, options = null) {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    let chatId = this.buildChatId(targetType, target);
    if (targetType === 'personal' && chatId.endsWith('@s.whatsapp.net')) {
      const result = await this.sock.onWhatsApp(chatId);
      if (!Array.isArray(result) || !result[0] || !result[0].exists) {
        throw new Error('Destination number is not registered on WhatsApp');
      }

      chatId = result[0].jid || chatId;
    }

    console.log(`[WA] Sending message to ${chatId}`);

    const normalizedOptions = options && typeof options === 'object' ? options : {};
    const normalizedButtons = Array.isArray(normalizedOptions.buttons)
      ? normalizedOptions.buttons.filter((item) => item && typeof item === 'object')
      : [];
    const hasButtons = normalizedButtons.length > 0;
    const hasMedia = Boolean(
      normalizedOptions.mediaType
      && normalizedOptions.mediaType !== 'none'
      && normalizedOptions.mediaUrl
    );

    if (hasButtons) {
      const payload = {
        text: String(message || ''),
        buttons: normalizedButtons,
      };

      if (hasMedia) {
        payload.caption = String(message || '');
        payload.media = {
          type: normalizedOptions.mediaType,
          source: { url: normalizedOptions.mediaUrl },
          fileName: normalizedOptions.fileName || 'file',
        };
      }

      await sendInteractiveButtons(this.sock, chatId, payload);
      return;
    }

    if (hasMedia) {
      const caption = String(message || '');
      const payload = { [normalizedOptions.mediaType]: { url: normalizedOptions.mediaUrl }, caption };

      if (normalizedOptions.mediaType === 'audio') {
        payload.mimetype = 'audio/mpeg';
        payload.ptt = false;
        delete payload.caption;
      } else if (normalizedOptions.mediaType === 'document') {
        payload.fileName = normalizedOptions.fileName || 'file';
        payload.mimetype = 'application/octet-stream';
      }

      await this.sock.sendMessage(chatId, payload);
      return;
    }

    await this.sock.sendMessage(chatId, { text: String(message || '') });
  }

  async notifyConnectionEstablished() {
    if (!this.sock || !this.sock.user) {
      return;
    }

    const nowMs = Date.now();
    if ((nowMs - this.lastConnectionNotificationAt) < this.connectionNotificationCooldownMs) {
      return;
    }

    try {
      const ownerJid = normalizePersonalJid(this.sock.user.id || '');
      if (!ownerJid) {
        return;
      }

      const settings = accessControlStore.getSettings();
      const selectedTimeZone = String(settings?.timeZone || 'Asia/Kuala_Lumpur').trim() || 'Asia/Kuala_Lumpur';
      const now = new Date();
      const timeText = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: selectedTimeZone,
      }).format(now);
      const dateText = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: selectedTimeZone,
      }).format(now);

      const notificationMessage = `Bot connected successfully 🤖\n\nTime : ${timeText}\nDate : ${dateText}\n\nTime zone : ${selectedTimeZone}`;

      await this.sock.sendMessage(ownerJid, { text: notificationMessage });
      this.lastConnectionNotificationAt = nowMs;
      console.log('[WA] Connection notification sent to owner');
    } catch (error) {
      console.error('[WA] Error sending connection notification:', error.message);
    }
  }

  async handleIncomingMessages(event) {
    if (!this.sock || event.type !== 'notify') return;

    for (const message of event.messages || []) {
      if (!message?.message) continue;

      const chatId = message.key?.remoteJid;
      if (!chatId) continue;

      this.cacheRecentMessage(chatId, message);

      if (!this.shouldProcessIncomingMessage(chatId, message.key)) {
        continue;
      }

      const content = normalizeMessageContent(message.message) || message.message;
      const interactiveSelectionId = this.extractInteractiveSelectionId(content);
      const text = this.extractMessageText(content);
      const isCommandText = text.trim().startsWith('.') || text.trim().startsWith('!');
      const commandSignature = this.getIncomingCommandSignature(text, interactiveSelectionId);
      if (!this.shouldProcessCommandSignature(chatId, message.key, commandSignature)) {
        continue;
      }
      const isFromMe = Boolean(message.key?.fromMe);
      const isSelfCommandAllowed = this.isSelfCommandMessageAllowed(chatId, message.key, isCommandText);
      if (isFromMe && !isSelfCommandAllowed) continue;

      // Allowed-senders filter: skip non-owner messages from disallowed numbers
      if (!isFromMe) {
        const senderJid = String(message.key?.participant || chatId || '');
        const senderPhone = senderJid.split('@')[0].split(':')[0].replace(/\D/g, '');
        if (!chatResponseSettingsStore.isSenderAllowed(senderPhone)) continue;
      }

      const isSelfCommandMessage = isFromMe && isSelfCommandAllowed;
      const isChatResponseEnabled = chatResponseSettingsStore.isResponseEnabledForChat(chatId);

      // Keep command flow available even when auto-response is disabled.
      if (!isChatResponseEnabled && !isCommandText && !interactiveSelectionId) {
        continue;
      }

      // Self-command mode is limited to explicit command triggers only.
      if (isSelfCommandMessage && !isCommandText) {
        continue;
      }

      if (isCommandText && !this.isCommandAccessAllowed(chatId, message.key)) {
        await this.sock.sendMessage(
          chatId,
          { text: 'Command mode is Private. Only owner number is allowed to use commands.' },
          
        );
        continue;
      }

      if (interactiveSelectionId) {
        this.logInteractiveDebug('incoming selection detected', {
          chatId,
          interactiveSelectionId,
          text,
        });
      }

      let matched = customCommandStore.matchCommand(text);
      if (!matched) {
        matched = this.matchInteractiveCommand(interactiveSelectionId);
      }
      if (interactiveSelectionId) {
        this.logInteractiveDebug('selection match result', {
          interactiveSelectionId,
          matchedTrigger: matched?.trigger || null,
        });
        if (!matched) {
          console.warn(`[WA] Button click received but no matching command found. Selection ID: "${interactiveSelectionId}". Enable WA_DEBUG_INTERACTIVE=1 for more details.`);
        }
      }
      if (!matched) {
        if (!isCommandText && !interactiveSelectionId) {
          await this.maybeReplyPersonalFallback(chatId, text);
        }
        continue;
      }

      if (!this.isCommandAccessAllowed(chatId, message.key)) {
        await this.sock.sendMessage(
          chatId,
          { text: 'Command mode is Private. Only owner number is allowed to use commands.' },
          
        );
        continue;
      }

      await this.replyWithCustomCommand(chatId, matched);
    }
  }

  isSelfCommandMessageAllowed(chatId, key, isCommandText) {
    if (!key?.fromMe) return false;
    if (!isCommandText) return false;

    const settings = chatResponseSettingsStore.getSettings();
    if (!settings.selfCommandEnabled) return false;

    return true;
  }

  extractMessageText(content) {
    if (!content || typeof content !== 'object') return '';

    const interactiveSelectedId = this.extractInteractiveSelectionId(content);

    const candidates = [
      content.conversation,
      content.extendedTextMessage?.text,
      content.imageMessage?.caption,
      content.videoMessage?.caption,
      content.documentMessage?.caption,
      content.buttonsResponseMessage?.selectedButtonId,
      content.buttonsResponseMessage?.selectedDisplayText,
      content.templateButtonReplyMessage?.selectedId,
      content.listResponseMessage?.singleSelectReply?.selectedRowId,
      interactiveSelectedId,
    ];

    for (const candidate of candidates) {
      const value = String(candidate || '').trim();
      if (value) return value;
    }

    return '';
  }

  extractInteractiveSelectionId(content) {
    if (!content || typeof content !== 'object') return '';

    const viewOnceMessage = content.viewOnceMessage?.message || null;

    const directCandidates = [
      content.listResponseMessage?.singleSelectReply?.selectedRowId,
      content.buttonsResponseMessage?.selectedButtonId,
      content.templateButtonReplyMessage?.selectedId,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.id,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.selectedId,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.selected_id,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.button?.id,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.buttons?.[0]?.id,
      viewOnceMessage?.listResponseMessage?.singleSelectReply?.selectedRowId,
      viewOnceMessage?.buttonsResponseMessage?.selectedButtonId,
      viewOnceMessage?.templateButtonReplyMessage?.selectedId,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.id,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.selectedId,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.selected_id,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.button?.id,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.buttons?.[0]?.id,
    ];

    for (const candidate of directCandidates) {
      const value = String(candidate || '').trim();
      if (value) return value;
    }

    const paramsJsonCandidates = [
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson,
      content.interactiveResponseMessage?.nativeFlowResponseMessage?.buttonParamsJson,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson,
      viewOnceMessage?.interactiveResponseMessage?.nativeFlowResponseMessage?.buttonParamsJson,
    ];

    for (const interactiveParamsJson of paramsJsonCandidates) {
      if (!(typeof interactiveParamsJson === 'string' && interactiveParamsJson.trim())) {
        continue;
      }

      try {
        const parsed = JSON.parse(interactiveParamsJson);
        if (typeof parsed === 'string') {
          const selected = parsed.trim();
          if (selected) {
            this.logInteractiveDebug('parsed paramsJson string selection', {
              selected,
              parsed: interactiveParamsJson,
            });
            return selected;
          }
        }

        if (parsed && typeof parsed === 'object') {
          const selected = pickInteractiveSelectionFromParsedParams(parsed);
          if (selected) {
            this.logInteractiveDebug('parsed paramsJson selection', {
              selected,
              parsed,
            });
            return selected;
          }
        }
      } catch (error) {
        this.logInteractiveDebug('failed to parse paramsJson', {
          error: error.message,
          interactiveParamsJson,
        });
        continue;
      }
    }

    return '';
  }

  matchInteractiveCommand(selectionId) {
    const raw = String(selectionId || '').trim();
    if (!raw) return null;

    const normalized = normalizeInteractiveTrigger(raw);

    this.logInteractiveDebug('attempt command match', {
      raw,
      normalized,
    });

    // Try direct matches first
    const directMatch = (
      customCommandStore.findCommand(raw)
      || customCommandStore.matchCommand(raw)
      || customCommandStore.findCommand(normalized)
    );
    if (directMatch) {
      this.logInteractiveDebug('matched via direct command lookup', {
        trigger: directMatch.trigger,
      });
      return directMatch;
    }

    // If no direct match, scan all commands to find one that has this button ID
    // This handles cases where button ID doesn't exactly match trigger
    const commands = customCommandStore.listCommands();

    // Collect all possible matching criteria to try
    const matchCandidates = [raw, normalized];
    // Also try variations: if raw is "button_123", try "button", "123"
    if (raw.includes('_')) {
      matchCandidates.push(...raw.split('_').filter(Boolean));
    }
    if (raw.includes('-')) {
      matchCandidates.push(...raw.split('-').filter(Boolean));
    }

    for (const command of commands) {
      if (!Array.isArray(command.buttons)) continue;

      for (const button of command.buttons) {
        if (!button || typeof button !== 'object') continue;

        try {
          const params = typeof button.buttonParamsJson === 'string'
            ? JSON.parse(button.buttonParamsJson)
            : (button.buttonParamsJson || {});

          if (!params || typeof params !== 'object') continue;

          // Check if button id/selected value matches for quick_reply, cta_copy, cta_call, cta_wa
          const buttonId = String(params.id || params.copy_code || params.phone_number || '').trim();
          const normalizedButtonId = normalizeInteractiveTrigger(buttonId);

          // Try all matching candidates
          for (const candidate of matchCandidates) {
            if (
              candidate === buttonId
              || candidate === normalizedButtonId
              || buttonId === candidate
              || normalizedButtonId === candidate
            ) {
              this.logInteractiveDebug('matched via button id search', {
                trigger: command.trigger,
                buttonType: button.name,
                buttonId,
                selectionId: raw,
              });
              return command;
            }
          }

          // Check if any single_select row matches
          if (button.name === 'single_select' && Array.isArray(params.sections)) {
            for (const section of params.sections) {
              if (!Array.isArray(section.rows)) continue;
              for (const row of section.rows) {
                const rowId = String(row?.id || '').trim();
                const normalizedRowId = normalizeInteractiveTrigger(rowId);

                for (const candidate of matchCandidates) {
                  if (
                    candidate === rowId
                    || candidate === normalizedRowId
                    || rowId === candidate
                    || normalizedRowId === candidate
                  ) {
                    this.logInteractiveDebug('matched via single_select row id', {
                      trigger: command.trigger,
                      rowId,
                      selectionId: raw,
                    });
                    return command;
                  }
                }
              }
            }
          }
        } catch (error) {
          this.logInteractiveDebug('error scanning button in command', {
            error: error.message,
            trigger: command.trigger,
          });
        }
      }
    }

    this.logInteractiveDebug('no command found for selection', { raw, normalized, matchCandidates });
    return null;
  }

  async handleBuiltInCommand(chatId, message, content, text) {
    const normalized = String(text || '').trim();
    const command = normalized.split(/\s+/)[0].toLowerCase();

    if (command === '.schedule' || command === '!schedule' || command === '.sch' || command === '!sch') {
      await this.handleScheduleCommand(chatId, message, normalized);
      return true;
    }

    if (command === '.schedulelist' || command === '!schedulelist' || command === '.schlist' || command === '!schlist') {
      await this.handleScheduleListCommand(chatId, message);
      return true;
    }

    if (command === '.scheduledelete' || command === '!scheduledelete' || command === '.schdel' || command === '!schdel') {
      await this.handleScheduleDeleteCommand(chatId, message, normalized);
      return true;
    }

    if (command === '.sticker' || command === '.s' || command === '!sticker' || command === '!s') {
      await this.handleStickerCommand(chatId, message, content);
      return true;
    }

    if (command === '.timezone' || command === '!timezone' || command === '.tz' || command === '!tz') {
      await this.handleTimeZoneCommand(chatId, normalized);
      return true;
    }

    if (command === '.zip' || command === '!zip') {
      await this.handleZipCommand(chatId, content);
      return true;
    }

    if (command === '.unzip' || command === '!unzip') {
      await this.handleUnzipCommand(chatId, content);
      return true;
    }

    if (command === '.pdf2txt' || command === '!pdf2txt') {
      await this.handlePdfToTextCommand(chatId, content);
      return true;
    }

    if (command === '.maketxt' || command === '!maketxt') {
      await this.handleMakeTxtCommand(chatId, normalized);
      return true;
    }

    if (command === '.qrcode' || command === '!qrcode' || command === '.qr' || command === '!qr') {
      await this.handleQrCodeCommand(chatId, normalized);
      return true;
    }

    if (command === '.ss' || command === '!ss' || command === '.ssweb' || command === '!ssweb' || command === '.screenshot' || command === '!screenshot') {
      await this.handleScreenshotCommand(chatId, normalized);
      return true;
    }

    if (command === '.tts' || command === '!tts') {
      await this.handleTtsCommand(chatId, normalized);
      return true;
    }

    if (command === '.imagetopdf' || command === '!imagetopdf' || command === '.img2pdf' || command === '!img2pdf') {
      await this.handleImageToPdfCommand(chatId, content);
      return true;
    }

    return false;
  }

  async sendBuiltInUsageMessage(chatId, key) {
    if (!this.sock) return;

    const textKey = `${key}UsageHelpText`;
    const buttonsKey = `${key}UsageButtons`;
    const builtInSettings = builtInCommandSettingsStore.getSettings();
    const usageText = builtInSettings[textKey];
    const usageButtons = buildUsageInteractiveButtons(builtInSettings[buttonsKey]);

    if (!usageButtons.length) {
      await this.sock.sendMessage(chatId, { text: usageText });
      return;
    }

    await sendInteractiveButtons(this.sock, chatId, {
      text: usageText,
      buttons: usageButtons,
    });
  }

  normalizeToolFileName(value, fallbackName) {
    const fallback = String(fallbackName || 'file.bin');
    const raw = String(value || '').trim();
    if (!raw) return fallback;

    const sanitized = raw.replace(/[\\/:*?"<>|]+/g, '-').trim();
    const base = path.basename(sanitized);
    return base || fallback;
  }

  resolveFileToolMedia(content, options = {}) {
    const documentOnly = Boolean(options.documentOnly);
    const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    const sources = [quoted, content];

    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;

      if (source.documentMessage) {
        return {
          media: source.documentMessage,
          type: 'document',
          fileName: source.documentMessage.fileName || '',
          mimeType: source.documentMessage.mimetype || '',
        };
      }

      if (documentOnly) continue;

      if (source.imageMessage) {
        return {
          media: source.imageMessage,
          type: 'image',
          fileName: source.imageMessage.fileName || '',
          mimeType: source.imageMessage.mimetype || 'image/jpeg',
        };
      }

      if (source.videoMessage) {
        return {
          media: source.videoMessage,
          type: 'video',
          fileName: source.videoMessage.fileName || '',
          mimeType: source.videoMessage.mimetype || 'video/mp4',
        };
      }

      if (source.audioMessage) {
        return {
          media: source.audioMessage,
          type: 'audio',
          fileName: source.audioMessage.fileName || '',
          mimeType: source.audioMessage.mimetype || 'audio/ogg',
        };
      }

      if (source.stickerMessage) {
        return {
          media: source.stickerMessage,
          type: 'sticker',
          fileName: source.stickerMessage.fileName || 'sticker.webp',
          mimeType: source.stickerMessage.mimetype || 'image/webp',
        };
      }
    }

    return null;
  }

  getFallbackFileNameByType(type) {
    if (type === 'image') return 'image.jpg';
    if (type === 'video') return 'video.mp4';
    if (type === 'audio') return 'audio.ogg';
    if (type === 'sticker') return 'sticker.webp';
    return 'file.bin';
  }

  async createFileToolTempDir(prefix = 'filetool-') {
    await fs.promises.mkdir(tempDir, { recursive: true });
    return fs.promises.mkdtemp(path.join(tempDir, prefix));
  }

  async listFilesRecursive(rootDir) {
    const files = [];
    const stack = [''];

    while (stack.length) {
      const relative = stack.pop();
      const currentPath = path.join(rootDir, relative);
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryRelative = path.join(relative, entry.name);
        if (entry.isDirectory()) {
          stack.push(entryRelative);
          continue;
        }

        files.push(entryRelative);
      }
    }

    return files;
  }

  async handleZipCommand(chatId, content) {
    if (!this.sock) return;

    const target = this.resolveFileToolMedia(content, { documentOnly: false });
    if (!target) {
      await this.sendBuiltInUsageMessage(chatId, 'zip');
      return;
    }

    const workDir = await this.createFileToolTempDir('zip-');

    try {
      const stream = await downloadContentFromMessage(target.media, target.type);
      const buffer = await this.streamToBuffer(stream);
      if (!buffer.length) {
        throw new Error('Media kosong atau gagal dimuat turun.');
      }

      const sourceName = this.normalizeToolFileName(
        target.fileName,
        this.getFallbackFileNameByType(target.type)
      );
      const sourcePath = path.join(workDir, sourceName);
      await fs.promises.writeFile(sourcePath, buffer);

      const zipBase = path.parse(sourceName).name || 'archive';
      const zipName = `${zipBase}.zip`;
      const zipPath = path.join(workDir, zipName);

      await execFileAsync('zip', ['-j', zipPath, sourcePath], {
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      });

      const zipBuffer = await fs.promises.readFile(zipPath);
      await this.sock.sendMessage(chatId, {
        document: zipBuffer,
        fileName: zipName,
        mimetype: 'application/zip',
        caption: `✅ ZIP siap: ${zipName}`,
      });
    } catch (error) {
      console.error('[WA] .zip error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .zip: ${error.message}` });
    } finally {
      await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async handleUnzipCommand(chatId, content) {
    if (!this.sock) return;

    const target = this.resolveFileToolMedia(content, { documentOnly: true });
    if (!target) {
      await this.sendBuiltInUsageMessage(chatId, 'unzip');
      return;
    }

    const sourceFileName = this.normalizeToolFileName(target.fileName, 'archive.zip');
    const isZipName = sourceFileName.toLowerCase().endsWith('.zip');
    const isZipMime = String(target.mimeType || '').toLowerCase().includes('zip');
    if (!isZipName && !isZipMime) {
      await this.sock.sendMessage(chatId, {
        text: 'File ini bukan ZIP. Gunakan fail .zip untuk command .unzip.',
      });
      return;
    }

    const workDir = await this.createFileToolTempDir('unzip-');
    const extractDir = path.join(workDir, 'extracted');

    try {
      const stream = await downloadContentFromMessage(target.media, 'document');
      const zipBuffer = await this.streamToBuffer(stream);
      if (!zipBuffer.length) {
        throw new Error('ZIP kosong atau gagal dimuat turun.');
      }

      await fs.promises.mkdir(extractDir, { recursive: true });
      const zipPath = path.join(workDir, sourceFileName);
      await fs.promises.writeFile(zipPath, zipBuffer);

      await execFileAsync('unzip', ['-o', zipPath, '-d', extractDir], {
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      });

      const files = await this.listFilesRecursive(extractDir);
      if (!files.length) {
        await this.sock.sendMessage(chatId, { text: 'ZIP berjaya dibuka, tetapi tiada fail di dalamnya.' });
        return;
      }

      const limited = files.slice(0, 6);
      await this.sock.sendMessage(chatId, {
        text: `✅ ZIP extracted. Hantar ${limited.length}${files.length > limited.length ? ` daripada ${files.length}` : ''} fail pertama.`,
      });

      for (const relativePath of limited) {
        const fullPath = path.join(extractDir, relativePath);
        const fileBuffer = await fs.promises.readFile(fullPath);
        const outputName = this.normalizeToolFileName(relativePath, 'file.bin');

        await this.sock.sendMessage(chatId, {
          document: fileBuffer,
          fileName: outputName,
          mimetype: 'application/octet-stream',
        });
      }
    } catch (error) {
      console.error('[WA] .unzip error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .unzip: ${error.message}` });
    } finally {
      await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async handlePdfToTextCommand(chatId, content) {
    if (!this.sock) return;

    const target = this.resolveFileToolMedia(content, { documentOnly: true });
    if (!target) {
      await this.sendBuiltInUsageMessage(chatId, 'pdf2txt');
      return;
    }

    const sourceFileName = this.normalizeToolFileName(target.fileName, 'document.pdf');
    const isPdfName = sourceFileName.toLowerCase().endsWith('.pdf');
    const isPdfMime = String(target.mimeType || '').toLowerCase().includes('pdf');
    if (!isPdfName && !isPdfMime) {
      await this.sock.sendMessage(chatId, {
        text: 'File ini bukan PDF. Gunakan fail .pdf untuk command .pdf2txt.',
      });
      return;
    }

    try {
      const stream = await downloadContentFromMessage(target.media, 'document');
      const pdfBuffer = await this.streamToBuffer(stream);
      if (!pdfBuffer.length) {
        throw new Error('PDF kosong atau gagal dimuat turun.');
      }

      const parsed = await pdfParse(pdfBuffer);
      const extractedText = String(parsed?.text || '').replace(/\r/g, '').trim();
      if (!extractedText) {
        await this.sock.sendMessage(chatId, { text: 'PDF berjaya dibaca, tetapi tiada teks yang boleh diekstrak.' });
        return;
      }

      const txtFileName = `${path.parse(sourceFileName).name || 'document'}.txt`;
      const preview = extractedText.length > 700
        ? `${extractedText.slice(0, 700)}...`
        : extractedText;

      await this.sock.sendMessage(chatId, {
        text: `✅ PDF converted ke text. Preview:\n\n${preview}`,
      });

      await this.sock.sendMessage(chatId, {
        document: Buffer.from(extractedText, 'utf8'),
        fileName: txtFileName,
        mimetype: 'text/plain',
      });
    } catch (error) {
      console.error('[WA] .pdf2txt error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .pdf2txt: ${error.message}` });
    }
  }

  async handleMakeTxtCommand(chatId, rawText) {
    if (!this.sock) return;

    const textBody = stripCommandPrefix(rawText);
    if (!textBody) {
      await this.sendBuiltInUsageMessage(chatId, 'maketxt');
      return;
    }

    const fileName = `note-${Date.now()}.txt`;
    await this.sock.sendMessage(chatId, {
      document: Buffer.from(textBody, 'utf8'),
      fileName,
      mimetype: 'text/plain',
      caption: '✅ TXT file generated.',
    });
  }

  async handleQrCodeCommand(chatId, rawText) {
    if (!this.sock) return;

    const payload = stripCommandPrefix(rawText);
    if (!payload) {
      await this.sendBuiltInUsageMessage(chatId, 'qrcode');
      return;
    }

    try {
      const qrBuffer = await qrcode.toBuffer(payload, {
        type: 'png',
        margin: 1,
        scale: 10,
        color: {
          dark: '#111111',
          light: '#FFFFFF',
        },
      });

      await this.sock.sendMessage(chatId, {
        image: qrBuffer,
        caption: `✅ QR generated for: ${payload.slice(0, 120)}`,
      });
    } catch (error) {
      console.error('[WA] .qrcode error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .qrcode: ${error.message}` });
    }
  }

  async handleScreenshotCommand(chatId, rawText) {
    if (!this.sock) return;

    const payload = stripCommandPrefix(rawText);
    const targetUrl = normalizeWebUrl(payload);
    if (!targetUrl) {
      await this.sendBuiltInUsageMessage(chatId, 'ss');
      return;
    }

    try {
      await this.sock.sendMessage(chatId, { text: '⏳ Capturing website screenshot...' });

      const screenshotEndpoint = `https://image.thum.io/get/png/noanimate/width/1280/${targetUrl}`;
      const response = await fetchWithTimeout(screenshotEndpoint, {}, 45000);
      if (!response.ok) {
        throw new Error(`Screenshot request failed (HTTP ${response.status})`);
      }

      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('image')) {
        throw new Error('Screenshot service returned non-image response');
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      if (!imageBuffer.length) {
        throw new Error('Screenshot kosong, cuba semula dengan URL lain');
      }

      await this.sock.sendMessage(chatId, {
        image: imageBuffer,
      });
    } catch (error) {
      console.error('[WA] .ss error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .ss: ${error.message}` });
    }
  }

  async handleTtsCommand(chatId, rawText) {
    if (!this.sock) return;

    const payload = stripCommandPrefix(rawText);
    if (!payload) {
      await this.sendBuiltInUsageMessage(chatId, 'tts');
      return;
    }

    try {
      const text = payload.slice(0, 280);
      const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ms&q=${encodeURIComponent(text)}`;
      const response = await fetchWithTimeout(ttsUrl, {}, 30000);
      if (!response.ok) {
        throw new Error(`TTS request failed (HTTP ${response.status})`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      if (!audioBuffer.length) {
        throw new Error('Audio TTS kosong, cuba teks lain');
      }

      await this.sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
      });
    } catch (error) {
      console.error('[WA] .tts error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .tts: ${error.message}` });
    }
  }

  async handleImageToPdfCommand(chatId, content) {
    if (!this.sock) return;

    const target = this.resolveFileToolMedia(content, { documentOnly: false });
    if (!target || (target.type !== 'image' && target.type !== 'sticker')) {
      await this.sendBuiltInUsageMessage(chatId, 'imagetopdf');
      return;
    }

    try {
      await this.sock.sendMessage(chatId, { text: '⏳ Processing image... extracting text menggunakan OCR...' });

      // Download the image
      const stream = await downloadContentFromMessage(target.media, target.type);
      const imageBuffer = await this.streamToBuffer(stream);

      if (!imageBuffer.length) {
        throw new Error('Image kosong atau gagal dimuat turun.');
      }

      // Extract text from image using Tesseract OCR
      const { data: { text: extractedText } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        { logger: (m) => console.log('[OCR]', m.status, m.progress) }
      );

      if (!extractedText || extractedText.trim().length === 0) {
        await this.sock.sendMessage(chatId, {
          text: '❌ Tidak dapat menemukan teks dalam gambar. Pastikan gambar memiliki teks yang jelas.',
        });
        return;
      }

      // Store extracted text
      this.extractedTextStorage.set(chatId, {
        text: extractedText,
        timestamp: Date.now(),
      });

      // Show preview
      const preview = extractedText.length > 400
        ? `${extractedText.slice(0, 400)}...`
        : extractedText;

      // Send text with interactive buttons
      await sendInteractiveButtons(
        this.sock,
        chatId,
        {
          text: `✅ Text extracted successfully!\n\n📝 Preview:\n\n${preview}`,
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                id: '.imagetopdf_create',
                display_text: '📄 Create PDF',
              }),
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                id: '.imagetopdf_text',
                display_text: '📋 Send as Text',
              }),
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                id: '.imagetopdf_cancel',
                display_text: '❌ Cancel',
              }),
            },
          ],
        }
      );
    } catch (error) {
      console.error('[WA] .imagetopdf error:', error.message);
      await this.sock.sendMessage(chatId, { text: `❌ Gagal proses .imagetopdf: ${error.message}` });
    }
  }

  async handleImageToPdfButtonResponse(chatId, buttonId) {
    if (!this.sock) return;

    const stored = this.extractedTextStorage.get(chatId);
    if (!stored) {
      await this.sock.sendMessage(chatId, {
        text: '❌ Session expired. Please upload image again with .imagetopdf',
      });
      return;
    }

    const { text: extractedText } = stored;

    try {
      if (buttonId === '.imagetopdf_cancel') {
        await this.sock.sendMessage(chatId, { text: '❌ Cancelled.' });
        this.extractedTextStorage.delete(chatId);
        return;
      }

      if (buttonId === '.imagetopdf_text') {
        const txtFileName = `extracted-text-${Date.now()}.txt`;
        await this.sock.sendMessage(chatId, {
          document: Buffer.from(extractedText, 'utf8'),
          fileName: txtFileName,
          mimetype: 'text/plain',
          caption: '✅ Extracted text as TXT file',
        });
        this.extractedTextStorage.delete(chatId);
        return;
      }

      if (buttonId === '.imagetopdf_create') {
        await this.sock.sendMessage(chatId, { text: '⏳ Creating PDF...' });

        // Create PDF with extracted text
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
        });

        const pdfFileName = `image-to-pdf-${Date.now()}.pdf`;
        const pdfPath = path.join(tempDir, pdfFileName);

        // Ensure temp directory exists
        await fs.promises.mkdir(tempDir, { recursive: true });

        const pdfStream = fs.createWriteStream(pdfPath);
        doc.pipe(pdfStream);

        // Add title
        doc.fontSize(14).font('Helvetica-Bold').text('Extracted Text from Image', { underline: true });
        doc.moveDown(0.5);

        // Add timestamp
        doc.fontSize(9).font('Helvetica').text(`Created: ${new Date().toLocaleString()}`);
        doc.moveDown(0.5);

        // Add separator
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        // Add extracted text
        doc.fontSize(11).font('Helvetica').text(extractedText, {
          align: 'left',
          width: 515,
        });

        // Finalize PDF
        doc.end();

        // Wait for PDF to finish writing
        await new Promise((resolve, reject) => {
          pdfStream.on('finish', resolve);
          pdfStream.on('error', reject);
        });

        // Send the PDF file
        const pdfBuffer = await fs.promises.readFile(pdfPath);

        await this.sock.sendMessage(chatId, {
          document: pdfBuffer,
          fileName: pdfFileName,
          mimetype: 'application/pdf',
          caption: '✅ PDF created successfully!',
        });

        // Clean up temp file
        await fs.promises.rm(pdfPath, { force: true }).catch(() => {});
        this.extractedTextStorage.delete(chatId);
      }
    } catch (error) {
      console.error('[WA] .imagetopdf button response error:', error.message);
      await this.sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` });
      this.extractedTextStorage.delete(chatId);
    }
  }

  isValidTimeZone(value) {
    const raw = String(value || '').trim();
    if (!raw) return false;

    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: raw }).format(new Date());
      return true;
    } catch (error) {
      return false;
    }
  }

  formatCurrentTimeForZone(timeZone) {
    const zone = String(timeZone || 'UTC').trim() || 'UTC';
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: zone,
    });
  }

  async handleTimeZoneCommand(chatId, rawText) {
    if (!this.sock) return;

    const args = stripCommandPrefix(rawText);
    const requestedTimeZone = String(args || '').trim();
    const currentSettings = accessControlStore.getSettings();
    const currentTimeZone = String(currentSettings?.timeZone || 'UTC').trim() || 'UTC';

    if (!requestedTimeZone) {
      const nowInZone = this.formatCurrentTimeForZone(currentTimeZone);
      await this.sock.sendMessage(chatId, {
        text: `Current bot timezone: ${currentTimeZone}\nCurrent time: ${nowInZone}\n\nUse: .timezone Asia/Kuala_Lumpur`,
      });
      return;
    }

    if (!this.isValidTimeZone(requestedTimeZone)) {
      await this.sock.sendMessage(chatId, {
        text: 'Invalid timezone. Example: .timezone Asia/Kuala_Lumpur',
      });
      return;
    }

    const updated = accessControlStore.updateSettings({ timeZone: requestedTimeZone });
    const activeTimeZone = String(updated?.timeZone || requestedTimeZone).trim() || 'UTC';
    const nowInZone = this.formatCurrentTimeForZone(activeTimeZone);

    await this.sock.sendMessage(chatId, {
      text: `Timezone updated to ${activeTimeZone}\nCurrent time: ${nowInZone}`,
    });
  }

  async handleScheduleCommand(chatId, message, rawText) {
    if (!this.sock) return;

    const scheduleShareUrl = `${getPublicBaseUrl()}/schedule/create`;
    const builtInSettings = builtInCommandSettingsStore.getSettings();
    const normalizedButtons = (Array.isArray(builtInSettings.scheduleUsageButtons)
      ? builtInSettings.scheduleUsageButtons
      : []).map((item) => {
      // Legacy format compatibility: { displayText, url }
      if (!item?.name && Object.prototype.hasOwnProperty.call(item || {}, 'displayText')) {
        const rawUrl = String(item?.url || '').trim();
        const normalizedUrl = rawUrl.startsWith('/') ? `${getPublicBaseUrl()}${rawUrl}` : rawUrl;
        return {
          displayText: String(item?.displayText || '').trim(),
          url: normalizedUrl,
        };
      }

      const name = String(item?.name || '').trim();
      if (!name) return null;

      let params = {};
      if (typeof item?.buttonParamsJson === 'string') {
        try {
          const parsed = JSON.parse(item.buttonParamsJson);
          params = parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
          params = {};
        }
      } else if (item?.buttonParamsJson && typeof item.buttonParamsJson === 'object') {
        params = item.buttonParamsJson;
      }

      if (name === 'cta_url') {
        const rawUrl = String(params.url || '').trim();
        const normalizedUrl = rawUrl.startsWith('/') ? `${getPublicBaseUrl()}${rawUrl}` : rawUrl;
        return {
          name,
          buttonParamsJson: JSON.stringify({
            ...params,
            url: normalizedUrl,
            merchant_url: String(params.merchant_url || normalizedUrl).trim() || normalizedUrl,
          }),
        };
      }

      return {
        name,
        buttonParamsJson: JSON.stringify(params || {}),
      };
    }).filter(Boolean);
    const usageButtons = buildUsageInteractiveButtons(normalizedButtons, scheduleShareUrl);
    const hasScheduleShareCta = usageButtons.some((button) => {
      if (!button || String(button.name || '').trim() !== 'cta_url') return false;
      try {
        const params = JSON.parse(button.buttonParamsJson || '{}');
        return String(params.url || '').trim() === scheduleShareUrl;
      } catch (error) {
        return false;
      }
    });

    if (!usageButtons.length || !hasScheduleShareCta) {
      usageButtons.push({
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Schedule Web',
          url: scheduleShareUrl,
          merchant_url: scheduleShareUrl,
        }),
      });
    }

    const sendUsageHelp = async (text) => {
      if (!usageButtons.length) {
        await this.sock.sendMessage(chatId, { text });
        return;
      }

      await sendInteractiveButtons(
        this.sock,
        chatId,
        {
          text,
          buttons: usageButtons,
        },
        
      );
    };

    const args = stripCommandPrefix(rawText);
    if (!args) {
      await sendUsageHelp(builtInCommandSettingsStore.getScheduleUsageHelpText());
      return;
    }

    const parts = args.split('|');
    if (parts.length < 2) {
      await sendUsageHelp('Format tidak valid. Guna: .schedule <time> | <message>');
      return;
    }

    const timeRaw = String(parts.shift() || '').trim();
    const textBody = String(parts.join('|') || '').trim();
    if (!timeRaw || !textBody) {
      await this.sock.sendMessage(
        chatId,
        { text: 'Time dan message wajib diisi. Contoh: .schedule 30m | Reminder mesyuarat' },
        
      );
      return;
    }

    const scheduleDate = parseScheduleDateTime(timeRaw);
    if (!scheduleDate) {
      await this.sock.sendMessage(
        chatId,
        { text: 'Format time tidak dikenali. Guna 10m / 2h / 1d atau YYYY-MM-DD HH:mm' },
        
      );
      return;
    }

    if (scheduleDate.getTime() <= Date.now()) {
      await this.sock.sendMessage(
        chatId,
        { text: 'Waktu schedule mesti pada masa depan.' },
        
      );
      return;
    }

    const targetType = String(chatId || '').endsWith('@g.us') ? 'group' : 'personal';

    try {
      const created = await scheduleStore.createSchedule({
        targetType,
        targetValue: chatId,
        message: textBody,
        scheduleAt: scheduleDate.toISOString(),
      });

      const localeTime = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(scheduleDate);

      await this.sock.sendMessage(
        chatId,
        {
          text: `✅ Schedule created\nID: ${created.id}\nType: ${targetType}\nTime: ${localeTime}\nMessage: ${textBody}`,
        },
        
      );
    } catch (error) {
      await this.sock.sendMessage(
        chatId,
        { text: `Gagal create schedule: ${error.message || 'Unknown error'}` },
        
      );
    }
  }

  normalizeScheduleTargetChatId(item) {
    if (!item || typeof item !== 'object') return '';
    const targetType = String(item.targetType || '').trim();
    const targetValue = String(item.targetValue || '').trim();

    if (targetType === 'group') {
      return normalizeGroupJid(targetValue);
    }

    return normalizePersonalJid(targetValue, this.defaultDialCode);
  }

  normalizeIncomingChatId(chatId) {
    const raw = String(chatId || '').trim();
    if (!raw) return '';
    if (raw.endsWith('@g.us')) return normalizeGroupJid(raw);
    return normalizePersonalJid(raw, this.defaultDialCode);
  }

  async handleScheduleListCommand(chatId, message) {
    if (!this.sock) return;

    try {
      const normalizedChatId = this.normalizeIncomingChatId(chatId);
      const list = await scheduleStore.listSchedules();
      const ownSchedules = list
        .filter((item) => this.normalizeScheduleTargetChatId(item) === normalizedChatId)
        .sort((a, b) => {
          const aTime = new Date(a.scheduleAt).getTime();
          const bTime = new Date(b.scheduleAt).getTime();
          if (aTime !== bTime) return aTime - bTime;

          const aCreated = new Date(a.createdAt || 0).getTime();
          const bCreated = new Date(b.createdAt || 0).getTime();
          if (aCreated !== bCreated) return aCreated - bCreated;

          return Number(a.id || 0) - Number(b.id || 0);
        });

      if (!ownSchedules.length) {
        const builtInSettings = builtInCommandSettingsStore.getSettings();
        const usageButtons = buildUsageInteractiveButtons(builtInSettings.scheduleListButtons);
        if (!usageButtons.length) {
          await this.sock.sendMessage(chatId, { text: builtInSettings.scheduleListEmptyText });
        } else {
          await sendInteractiveButtons(
            this.sock,
            chatId,
            {
              text: builtInSettings.scheduleListEmptyText,
              buttons: usageButtons,
            },
            
          );
        }
        return;
      }

      const preview = ownSchedules.slice(0, 10).map((item) => {
        const when = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date(item.scheduleAt));
        return `#${item.id} [${item.status}] ${when} - ${String(item.message || '').slice(0, 60)}`;
      });

      const hasMore = ownSchedules.length > 10;
      const footer = hasMore
        ? `\n...and ${ownSchedules.length - 10} more item(s).`
        : '';

      await this.sock.sendMessage(
        chatId,
        {
          text: `📋 Schedule list for this chat (${ownSchedules.length})\n\n${preview.join('\n')}${footer}`,
        },
        
      );
    } catch (error) {
      await this.sock.sendMessage(chatId, { text: `Failed to list schedules: ${error.message}` });
    }
  }

  async handleScheduleDeleteCommand(chatId, message, rawText) {
    if (!this.sock) return;

    const args = stripCommandPrefix(rawText);
    const id = Number(String(args || '').trim());
    if (!Number.isInteger(id) || id <= 0) {
      const builtInSettings = builtInCommandSettingsStore.getSettings();
      const usageButtons = buildUsageInteractiveButtons(builtInSettings.scheduleDeleteButtons);
      if (!usageButtons.length) {
        await this.sock.sendMessage(
          chatId,
          { text: builtInSettings.scheduleDeleteUsageText },
          
        );
      } else {
        await sendInteractiveButtons(
          this.sock,
          chatId,
          {
            text: builtInSettings.scheduleDeleteUsageText,
            buttons: usageButtons,
          },
          
        );
      }
      return;
    }

    try {
      const normalizedChatId = this.normalizeIncomingChatId(chatId);
      const list = await scheduleStore.listSchedules();
      const item = list.find((entry) => Number(entry.id) === id);
      if (!item) {
        await this.sock.sendMessage(chatId, { text: `Schedule #${id} not found.` });
        return;
      }

      const scheduleChatId = this.normalizeScheduleTargetChatId(item);
      if (!scheduleChatId || scheduleChatId !== normalizedChatId) {
        await this.sock.sendMessage(
          chatId,
          { text: `You can only delete schedules created for this chat. (#${id})` },
          
        );
        return;
      }

      const removed = await scheduleStore.removeSchedule(id);
      if (!removed) {
        await this.sock.sendMessage(chatId, { text: `Failed to delete schedule #${id}.` });
        return;
      }

      await this.sock.sendMessage(chatId, { text: `🗑️ Schedule #${id} deleted.` });
    } catch (error) {
      await this.sock.sendMessage(chatId, { text: `Failed to delete schedule: ${error.message}` });
    }
  }

  async resolveYouTubeTarget(input) {
    const raw = String(input || '').trim();
    if (!raw) {
      throw new Error('Usage: .ytmp3 <judul atau link YouTube>');
    }

    if (isLikelyUrl(raw)) {
      const parsed = parseYouTubeInput(raw);
      if (!parsed || parsed.playlistOnly || !parsed.videoId) {
        throw new Error('Link YouTube tidak valid. Gunakan link video, bukan playlist.');
      }

      let info = null;
      try {
        info = await ytSearch({ videoId: parsed.videoId });
      } catch (error) {
        // Metadata lookup can fail even when the video URL is valid.
      }

      return {
        url: parsed.canonicalUrl,
        title: info?.title || `YouTube ${parsed.videoId}`,
        thumbnail: info?.thumbnail || '',
      };
    }

    const search = await ytSearch(raw);
    const first = Array.isArray(search?.videos) ? search.videos[0] : null;
    if (!first || !first.url) {
      throw new Error('Video tidak ditemukan, coba kata kunci lain.');
    }

    return {
      url: first.url,
      title: first.title || raw,
      thumbnail: first.thumbnail || '',
    };
  }

  async resolveDownloadFromProviders(providers) {
    for (const provider of providers) {
      try {
        const result = await provider();
        if (isHttpUrl(result?.url)) return { ...result, url: String(result.url).trim() };
      } catch (error) {
        console.log(`[WA] Provider failed: ${error.message}`);
      }
      await sleep(300);
    }

    return null;
  }

  async handleYtmp3Command(chatId, message, args) {
    if (!this.sock) return;

    try {
      const target = await this.resolveYouTubeTarget(args);
      const providers = [
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(target.url)}&format=mp3`,
            40000
          );
          return { url: extractAudioDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(target.url)}`,
            40000
          );
          return { url: extractAudioDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(target.url)}`,
            40000
          );
          return { url: extractAudioDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
      ];

      if (target.thumbnail) {
        try {
          await this.sock.sendMessage(
            chatId,
            { image: { url: target.thumbnail }, caption: `🎵 ${target.title}\n⏳ Sedang menyiapkan audio...` },
            
          );
        } catch (error) {
          console.log('[WA] Thumbnail preview skipped:', error.message);
        }
      }

      const picked = await this.resolveDownloadFromProviders(providers);
      if (!picked?.url) {
        await this.sock.sendMessage(
          chatId,
          { text: 'Gagal mengambil link audio. Coba lagi beberapa saat lagi.' },
          
        );
        return;
      }

      const response = await fetchWithTimeout(picked.url, {}, 120000);
      if (!response.ok) throw new Error(`Audio download failed (HTTP ${response.status})`);

      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length) {
        throw new Error('Audio kosong dari provider, coba lagi.');
      }
      const title = sanitizeFileName(picked.title || target.title, 'audio');

      try {
        await this.sock.sendMessage(
          chatId,
          {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false,
          },
          
        );
      } catch (audioSendError) {
        console.log('[WA] Audio send failed, fallback to document:', audioSendError.message);
        await this.sock.sendMessage(
          chatId,
          {
            document: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `🎵 ${picked.title || target.title}`,
          },
          
        );
      }
    } catch (error) {
      console.error('[WA] .ytmp3 error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .ytmp3: ${error.message}` });
    }
  }

  async handleYtmp4Command(chatId, message, args) {
    if (!this.sock) return;

    try {
      const target = await this.resolveYouTubeTarget(args);
      const providers = [
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(target.url)}&format=mp4`,
            40000
          );
          return { url: extractDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(target.url)}`,
            40000
          );
          return { url: extractDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
        async () => {
          const data = await fetchJsonWithTimeout(
            `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(target.url)}`,
            40000
          );
          return { url: extractDownloadUrlFromPayload(data), title: extractTitleFromPayload(data) };
        },
      ];

      const picked = await this.resolveDownloadFromProviders(providers);
      if (!picked?.url) {
        await this.sock.sendMessage(
          chatId,
          { text: 'Gagal mengambil link video. Coba lagi nanti.' },
          
        );
        return;
      }

      const response = await fetchWithTimeout(picked.url, {}, 120000);
      if (!response.ok) throw new Error(`Video download failed (HTTP ${response.status})`);

      const contentLengthHeader = response.headers.get('content-length') || '0';
      const contentLength = Number(contentLengthHeader);
      const maxBytes = 64 * 1024 * 1024;
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new Error('Ukuran video terlalu besar untuk dikirim (maks 64MB).');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > maxBytes) {
        throw new Error('Ukuran video terlalu besar untuk dikirim (maks 64MB).');
      }

      const title = sanitizeFileName(picked.title || target.title, 'video');
      await this.sock.sendMessage(
        chatId,
        {
          video: buffer,
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: `🎬 ${picked.title || target.title}`,
        },
        
      );
    } catch (error) {
      console.error('[WA] .ytmp4 error:', error.message);
      await this.sock.sendMessage(chatId, { text: `Gagal proses .ytmp4: ${error.message}` });
    }
  }

  extractFacebookVideoUrl(data) {
    if (!data || typeof data !== 'object') return '';

    const candidates = [
      data?.result?.media?.video_hd,
      data?.result?.media?.video_sd,
      data?.result?.url,
      data?.result?.download,
      data?.result?.video,
      data?.data?.url,
      data?.data?.download,
      data?.url,
      data?.download,
      data?.video,
    ];

    for (const item of candidates) {
      if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
        return item;
      }
    }

    if (Array.isArray(data?.data)) {
      const fromArray = data.data.find((item) => item?.url);
      if (fromArray?.url) return fromArray.url;
    }

    return '';
  }

  async handleFacebookCommand(chatId, message, args) {
    if (!this.sock) return;

    const url = String(args || '').trim();
    if (!url || !/facebook\.com|fb\.watch/i.test(url)) {
      await this.sock.sendMessage(
        chatId,
        { text: 'Usage: .facebook <link-facebook>\nContoh: .facebook https://www.facebook.com/...' },
        
      );
      return;
    }

    try {
      const data = await fetchJsonWithTimeout(
        `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(url)}`,
        40000
      );
      const videoUrl = this.extractFacebookVideoUrl(data);
      if (!videoUrl) throw new Error('Video tidak ditemukan dari API');

      const title = data?.result?.info?.title || data?.result?.title || data?.title || 'Facebook Video';
      await this.sock.sendMessage(
        chatId,
        { video: { url: videoUrl }, mimetype: 'video/mp4', caption: `📘 ${title}` },
        
      );
    } catch (error) {
      console.error('[WA] .facebook error:', error.message);
      await this.sock.sendMessage(chatId, { text: 'Gagal download video Facebook. Coba link lain.' });
    }
  }

  extractInstagramMediaUrls(data) {
    const links = [];

    if (Array.isArray(data?.result)) {
      for (const item of data.result) {
        if (item?.url) links.push(item.url);
      }
    }

    if (Array.isArray(data?.data)) {
      for (const item of data.data) {
        if (typeof item === 'string' && /^https?:\/\//i.test(item)) links.push(item);
        if (item?.url) links.push(item.url);
      }
    }

    if (typeof data?.url === 'string') links.push(data.url);
    if (typeof data?.download === 'string') links.push(data.download);

    return [...new Set(links.filter((item) => /^https?:\/\//i.test(item)))];
  }

  async handleInstagramCommand(chatId, message, args) {
    if (!this.sock) return;

    const url = String(args || '').trim();
    if (!url || !/instagram\.com|instagr\.am/i.test(url)) {
      await this.sock.sendMessage(
        chatId,
        { text: 'Usage: .instagram <link-instagram>\nContoh: .instagram https://www.instagram.com/reel/...' },
        
      );
      return;
    }

    const endpoints = [
      `https://api.hanggts.xyz/download/instagram?url=${encodeURIComponent(url)}`,
      `https://api.yupra.my.id/api/downloader/instagram?url=${encodeURIComponent(url)}`,
    ];

    try {
      let mediaUrls = [];
      for (const endpoint of endpoints) {
        try {
          const data = await fetchJsonWithTimeout(endpoint, 40000);
          mediaUrls = this.extractInstagramMediaUrls(data);
          if (mediaUrls.length) break;
        } catch (error) {
          console.log('[WA] Instagram provider failed:', error.message);
        }
      }

      if (!mediaUrls.length) {
        throw new Error('Media tidak ditemukan');
      }

      const limited = mediaUrls.slice(0, 5);
      for (const mediaUrl of limited) {
        const lower = mediaUrl.toLowerCase();
        const isVideo = lower.includes('.mp4') || lower.includes('/video');
        if (isVideo) {
          await this.sock.sendMessage(chatId, { video: { url: mediaUrl }, mimetype: 'video/mp4' });
        } else {
          await this.sock.sendMessage(chatId, { image: { url: mediaUrl } });
        }
      }
    } catch (error) {
      console.error('[WA] .instagram error:', error.message);
      await this.sock.sendMessage(chatId, { text: 'Gagal download media Instagram. Pastikan link publik.' });
    }
  }

  resolveStickerMedia(content) {
    const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    const sources = [quoted, content];

    for (const source of sources) {
      if (source?.stickerMessage) return { media: source.stickerMessage, type: 'sticker' };
      if (source?.imageMessage) return { media: source.imageMessage, type: 'image' };
      if (source?.videoMessage) return { media: source.videoMessage, type: 'video' };
    }

    return null;
  }

  async streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  }

  async convertToWebp(inputBuffer, mediaType) {
    if (mediaType === 'sticker') return inputBuffer;
    if (!ffmpegPath) {
      throw new Error('ffmpeg binary tidak tersedia di server');
    }

    await fs.promises.mkdir(tempDir, { recursive: true });
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const inputExt = mediaType === 'video' ? 'mp4' : 'jpg';
    const inputPath = path.join(tempDir, `${id}.${inputExt}`);
    const outputPath = path.join(tempDir, `${id}.webp`);

    try {
      await fs.promises.writeFile(inputPath, inputBuffer);

      const filterBase = 'scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1';
      const videoFilter = `fps=12,${filterBase}`;
      const args = mediaType === 'video'
        ? ['-y', '-i', inputPath, '-t', '7', '-vf', videoFilter, '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '65', '-preset', 'default', '-loop', '0', '-an', '-vsync', '0', outputPath]
        : ['-y', '-i', inputPath, '-vf', filterBase, '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '75', '-preset', 'default', '-loop', '0', '-an', '-vsync', '0', outputPath];

      await execFileAsync(ffmpegPath, args, { windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
      return await fs.promises.readFile(outputPath);
    } finally {
      await fs.promises.unlink(inputPath).catch(() => {});
      await fs.promises.unlink(outputPath).catch(() => {});
    }
  }

  async handleStickerCommand(chatId, message, content) {
    if (!this.sock) return;

    const target = this.resolveStickerMedia(content);
    if (!target) {
      const builtInSettings = builtInCommandSettingsStore.getSettings();
      const usageButtons = buildUsageInteractiveButtons(builtInSettings.stickerUsageButtons);
      if (!usageButtons.length) {
        await this.sock.sendMessage(
          chatId,
          { text: builtInSettings.stickerUsageHelpText },
          
        );
      } else {
        await sendInteractiveButtons(
          this.sock,
          chatId,
          {
            text: builtInSettings.stickerUsageHelpText,
            buttons: usageButtons,
          },
          
        );
      }
      return;
    }

    try {
      const stream = await downloadContentFromMessage(target.media, target.type);
      const sourceBuffer = await this.streamToBuffer(stream);
      const stickerBuffer = await this.convertToWebp(sourceBuffer, target.type);
      await this.sock.sendMessage(chatId, { sticker: stickerBuffer });
    } catch (error) {
      console.error('[WA] .sticker error:', error.message);
      await this.sock.sendMessage(chatId, { text: 'Gagal membuat sticker dari media tersebut.' });
    }
  }

  async handleViewOnceCommand(chatId, content) {
    const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    try {
      if (quotedImage && quotedImage.viewOnce) {
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await this.sock.sendMessage(
          chatId,
          { image: buffer, fileName: 'media.jpg', caption: quotedImage.caption || '' }
        );
      } else if (quotedVideo && quotedVideo.viewOnce) {
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await this.sock.sendMessage(
          chatId,
          { video: buffer, fileName: 'media.mp4', caption: quotedVideo.caption || '' }
        );
      } else {
        const builtInSettings = builtInCommandSettingsStore.getSettings();
        const usageButtons = buildUsageInteractiveButtons(builtInSettings.vvUsageButtons);
        if (!usageButtons.length) {
          await this.sock.sendMessage(chatId, { text: builtInSettings.vvUsageHelpText });
        } else {
          await sendInteractiveButtons(
            this.sock,
            chatId,
            {
              text: builtInSettings.vvUsageHelpText,
              buttons: usageButtons,
            }
          );
        }
      }
    } catch (error) {
      console.error('[WA] Failed to process .vv command:', error.message);
      await this.sock.sendMessage(chatId, { text: 'Failed to reopen that media.' });
    }
  }

  async handleMessageUpdates(updates) {
    if (!this.sock || !Array.isArray(updates)) return;

    for (const item of updates) {
      const isRevoked =
        item?.update?.messageStubType === baileys.WAMessageStubType?.REVOKE ||
        (item?.update && 'message' in item.update && item.update.message === null);

      if (!isRevoked) continue;

      const chatId = item.key?.remoteJid;
      const messageId = item.key?.id;
      if (!chatId || !messageId) continue;

      await this.saveDeletedMessage(chatId, messageId, item.key);
    }
  }

  async saveDeletedMessage(chatId, messageId, key) {
    try {
      const cached = this.getRecentMessage(chatId, messageId);
      const original = cached || (await this.store?.loadMessage?.(chatId, messageId));
      if (!original?.message) return;

      const content = normalizeMessageContent(original.message) || original.message;
      const senderId = key?.participant || (chatId.endsWith('@g.us') ? '' : chatId);
      const senderName = original.pushName || '';
      const isGroup = chatId.endsWith('@g.us');

      let chatName = '';
      if (isGroup) {
        const chat = this.store?.chats?.get?.(chatId);
        chatName = chat?.name || chat?.subject || '';
      }

      const record = {
        chatId,
        chatName,
        senderId,
        senderName,
        isGroup,
        originalTimestamp: original.messageTimestamp
          ? Number(original.messageTimestamp) * 1000
          : null,
      };

      const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        content.documentMessage?.caption ||
        '';

      const mediaField = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage']
        .find((key2) => content[key2]);

      if (mediaField) {
        const mediaTypeMap = {
          imageMessage: 'image',
          videoMessage: 'video',
          audioMessage: 'audio',
          documentMessage: 'document',
          stickerMessage: 'sticker',
        };
        const mediaType = mediaTypeMap[mediaField];
        const mediaMessage = content[mediaField];

        try {
          const downloadType = mediaType === 'sticker' ? 'sticker' : mediaType;
          const stream = await downloadContentFromMessage(mediaMessage, downloadType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

          const extMap = {
            image: '.jpg',
            video: '.mp4',
            audio: '.ogg',
            document: '',
            sticker: '.webp',
          };
          const ext = extMap[mediaType] || '';
          const fileName = `deleted-${Date.now()}${ext}`;
          fs.mkdirSync(uploadDir, { recursive: true });
          fs.writeFileSync(path.join(uploadDir, fileName), buffer);

          record.type = mediaType;
          record.mediaUrl = `/uploads/${fileName}`;
          record.fileName = mediaMessage.fileName || fileName;
          record.text = text;
        } catch (downloadError) {
          console.error('[WA] Failed to download deleted media:', downloadError.message);
          record.type = mediaType;
          record.text = text || '[Media could not be recovered]';
        }
      } else {
        record.type = 'text';
        record.text = text || '[Unsupported message type]';
      }

      deletedMessageStore.addRecord(record);
      console.log(`[WA] Saved deleted message from ${chatId}`);
    } catch (error) {
      console.error('[WA] Failed to save deleted message:', error.message);
    }
  }

  async replyWithCustomCommand(chatId, command) {
    const caption = String(command.response || '').replace(/\\n/g, '\n');
    const options = {};
    const hasButtons = Boolean(command.buttons && command.buttons.length);

    if (command.mediaUrl && command.mediaType) {
      const media = {
        type: command.mediaType,
        source: { url: command.mediaUrl },
        fileName: command.fileName || 'file',
      };

      if (hasButtons) {
        await sendInteractiveButtons(this.sock, chatId, { caption, media, buttons: command.buttons }, options);
        return;
      }

      const payload = { [command.mediaType]: media.source, caption };
      if (command.mediaType === 'audio') {
        payload.mimetype = 'audio/mpeg';
        payload.ptt = false;
      } else if (command.mediaType === 'document') {
        payload.fileName = media.fileName;
        payload.mimetype = 'application/octet-stream';
      }

      await this.sock.sendMessage(chatId, payload, options);
      return;
    }

    if (caption || hasButtons) {
      await sendInteractiveButtons(this.sock, chatId, { text: caption, buttons: command.buttons }, options);
    }
  }

  async listGroups() {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const groupsMap = await this.sock.groupFetchAllParticipating();
    return Object.values(groupsMap)
      .map((group) => ({
        id: group.id || '',
        name: group.subject || 'Untitled',
      }))
      .filter((group) => group.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }

  async osintWaLookup(phone) {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const rawInput = String(phone || '').trim();
    const cleaned = this.normalizePersonalNumber(rawInput);
    if (!cleaned || cleaned.length < 8) {
      throw new Error('Invalid phone number. Use country code format, example: 60123456789');
    }

    const jid = `${cleaned}@s.whatsapp.net`;

    let exists = false;
    let resolvedJid = jid;

    try {
      const result = await this.sock.onWhatsApp(jid);
      exists = Array.isArray(result) && result[0]?.exists === true;
      if (exists && result[0]?.jid) resolvedJid = result[0].jid;
    } catch (error) {
      exists = false;
    }

    let profilePicUrl = null;
    let profilePicStatus = 'Not checked';

    if (exists) {
      try {
        profilePicUrl = await this.sock.profilePictureUrl(resolvedJid, 'image');
        profilePicStatus = profilePicUrl ? 'Available' : 'Hidden / not set';
      } catch (error) {
        profilePicStatus = 'Hidden or privacy restricted';
      }
    } else {
      profilePicStatus = 'Unavailable (number not on WhatsApp)';
    }

    let statusText = null;
    if (exists) {
      try {
        const statusResult = await this.sock.fetchStatus(resolvedJid);
        statusText = statusResult?.status ? String(statusResult.status).trim() : null;
      } catch (error) {
        statusText = null;
      }
    }

    return {
      input: rawInput,
      phone: cleaned,
      jid: resolvedJid,
      exists,
      profilePicUrl,
      profilePicStatus,
      status: statusText,
    };
  }

  async osintWaLookupBatch(phones) {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    if (!Array.isArray(phones)) {
      throw new Error('phones must be an array');
    }

    const trimmed = phones
      .map((item) => String(item || '').trim())
      .filter(Boolean);

    if (!trimmed.length) {
      return {
        total: 0,
        checked: 0,
        found: 0,
        notFound: 0,
        invalid: 0,
        results: [],
      };
    }

    if (trimmed.length > 25) {
      throw new Error('Maximum 25 numbers per batch request');
    }

    const results = [];

    for (const input of trimmed) {
      const normalized = this.normalizePersonalNumber(input);
      if (!normalized || normalized.length < 8) {
        results.push({
          input,
          phone: '',
          jid: '',
          exists: false,
          status: 'invalid',
          error: 'Invalid number format',
        });
        continue;
      }

      const jid = `${normalized}@s.whatsapp.net`;
      let exists = false;
      let resolvedJid = jid;

      try {
        const found = await this.sock.onWhatsApp(jid);
        exists = Array.isArray(found) && found[0]?.exists === true;
        if (exists && found[0]?.jid) {
          resolvedJid = found[0].jid;
        }
      } catch (error) {
        results.push({
          input,
          phone: normalized,
          jid,
          exists: false,
          status: 'error',
          error: error.message || 'Lookup failed',
        });
        continue;
      }

      results.push({
        input,
        phone: normalized,
        jid: resolvedJid,
        exists,
        status: exists ? 'found' : 'not_found',
      });
    }

    const foundCount = results.filter((item) => item.status === 'found').length;
    const invalidCount = results.filter((item) => item.status === 'invalid').length;
    const errorCount = results.filter((item) => item.status === 'error').length;
    const checkedCount = results.length - invalidCount;

    return {
      total: results.length,
      checked: checkedCount,
      found: foundCount,
      notFound: checkedCount - foundCount - errorCount,
      invalid: invalidCount,
      error: errorCount,
      results,
    };
  }

  async osintGroupInfo(groupId) {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    let jid = String(groupId || '').trim();
    if (!jid.includes('@')) {
      jid = `${jid}@g.us`;
    }

    let metadata;
    try {
      metadata = await this.sock.groupMetadata(jid);
    } catch (error) {
      throw new Error(`Could not fetch group info: ${error.message}`);
    }

    if (!metadata) {
      throw new Error('Group not found or bot is not a member');
    }

    const participants = Array.isArray(metadata.participants) ? metadata.participants : [];
    const admins = participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin');

    return {
      id: metadata.id || jid,
      name: metadata.subject || 'Unknown',
      description: metadata.desc || null,
      owner: metadata.owner || null,
      createdAt: metadata.creation ? new Date(metadata.creation * 1000).toISOString() : null,
      memberCount: participants.length,
      adminCount: admins.length,
      participants: participants.map((p) => ({
        jid: p.id || '',
        admin: p.admin || null,
      })),
    };
  }

  async listPersonalChats() {
    if (!this.sock || !this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const normalizePersonalJid = (value) => {
      const raw = String(value || '').trim();
      if (!raw.endsWith('@s.whatsapp.net')) return '';
      const localPart = raw.split('@')[0] || '';
      const phone = localPart.split(':')[0].replace(/\D/g, '');
      if (!phone) return '';
      return `${phone}@s.whatsapp.net`;
    };

    const ownJid = normalizePersonalJid(this.sock?.user?.id || '');
    const contacts = this.store?.contacts || {};
    const chats = this.store?.chats?.all?.() || [];
    const merged = new Map();

    for (const chat of chats) {
      const jid = normalizePersonalJid(chat?.id || '');
      if (!jid || jid === ownJid) continue;

      const hasDirectInteraction = Boolean(
        chat?.conversationTimestamp
        || chat?.lastMessageRecvTimestamp
        || chat?.lastMsgTimestamp
      );
      if (!hasDirectInteraction) continue;

      const phone = this.normalizePersonalNumber(jid);
      const contact = contacts[jid] || contacts[chat?.id] || null;
      merged.set(jid, {
        id: jid,
        name: String(
          chat?.name
          || chat?.notify
          || chat?.pushName
          || contact?.name
          || contact?.notify
          || phone
          || 'Unnamed'
        ),
        phone,
      });
    }

    try {
      const groupsMap = await this.sock.groupFetchAllParticipating();
      for (const group of Object.values(groupsMap || {})) {
        const participants = Array.isArray(group?.participants) ? group.participants : [];

        for (const participant of participants) {
          const rawParticipantId = participant?.id || participant;
          const jid = normalizePersonalJid(rawParticipantId);
          if (!jid || jid === ownJid || merged.has(jid)) continue;

          const phone = this.normalizePersonalNumber(jid);
          const contact = contacts[jid] || contacts[rawParticipantId] || null;
          merged.set(jid, {
            id: jid,
            name: String(contact?.name || contact?.notify || contact?.verifiedName || phone || 'Unnamed'),
            phone,
          });
        }
      }
    } catch (error) {
      console.log('[WA] Failed to enrich personal chats from groups:', error.message);
    }

    return Array.from(merged.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }
}

module.exports = new WhatsAppService();
