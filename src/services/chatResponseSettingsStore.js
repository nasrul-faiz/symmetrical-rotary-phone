const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'chat-response-settings.json');

const DEFAULT_SETTINGS = {
  personalEnabled: false,
  groupEnabled: false,
  selfCommandEnabled: true,
  groupFilterMode: 'all',       // 'all' | 'whitelist'
  allowedGroupIds: [],           // string[] — group JIDs when whitelist mode
  allowedSendersMode: 'anyone',  // 'anyone' | 'specific'
  allowedSenderNumbers: [],      // string[] — normalized phone digits
};

function normalizePhone(num) {
  return String(num || '').replace(/\D/g, '');
}

function normalizeSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const allowedGroupIds = Array.isArray(source.allowedGroupIds)
    ? source.allowedGroupIds.filter((id) => typeof id === 'string' && id.trim())
    : [];
  const allowedSenderNumbers = Array.isArray(source.allowedSenderNumbers)
    ? source.allowedSenderNumbers.map(normalizePhone).filter(Boolean)
    : [];
  return {
    personalEnabled: source.personalEnabled === true,
    groupEnabled: source.groupEnabled === true,
    selfCommandEnabled: source.selfCommandEnabled !== false,
    groupFilterMode: source.groupFilterMode === 'whitelist' ? 'whitelist' : 'all',
    allowedGroupIds,
    allowedSendersMode: source.allowedSendersMode === 'specific' ? 'specific' : 'anyone',
    allowedSenderNumbers,
  };
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

const settings = loadSettings();

function persistSettings() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('[ChatResponseSettingsStore] Failed to persist settings:', error.message);
  }
}

function getSettings() {
  return {
    personalEnabled: settings.personalEnabled,
    groupEnabled: settings.groupEnabled,
    selfCommandEnabled: settings.selfCommandEnabled,
    groupFilterMode: settings.groupFilterMode,
    allowedGroupIds: [...settings.allowedGroupIds],
    allowedSendersMode: settings.allowedSendersMode,
    allowedSenderNumbers: [...settings.allowedSenderNumbers],
  };
}

function updateSettings(partial) {
  const next = partial && typeof partial === 'object' ? partial : {};
  let changed = false;

  if (Object.prototype.hasOwnProperty.call(next, 'personalEnabled') && typeof next.personalEnabled === 'boolean') {
    if (settings.personalEnabled !== next.personalEnabled) { settings.personalEnabled = next.personalEnabled; changed = true; }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'groupEnabled') && typeof next.groupEnabled === 'boolean') {
    if (settings.groupEnabled !== next.groupEnabled) { settings.groupEnabled = next.groupEnabled; changed = true; }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'selfCommandEnabled') && typeof next.selfCommandEnabled === 'boolean') {
    if (settings.selfCommandEnabled !== next.selfCommandEnabled) { settings.selfCommandEnabled = next.selfCommandEnabled; changed = true; }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'groupFilterMode')) {
    const mode = next.groupFilterMode === 'whitelist' ? 'whitelist' : 'all';
    if (settings.groupFilterMode !== mode) { settings.groupFilterMode = mode; changed = true; }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'allowedGroupIds') && Array.isArray(next.allowedGroupIds)) {
    const ids = next.allowedGroupIds.filter((id) => typeof id === 'string' && id.trim());
    settings.allowedGroupIds = ids;
    changed = true;
  }

  if (Object.prototype.hasOwnProperty.call(next, 'allowedSendersMode')) {
    const mode = next.allowedSendersMode === 'specific' ? 'specific' : 'anyone';
    if (settings.allowedSendersMode !== mode) { settings.allowedSendersMode = mode; changed = true; }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'allowedSenderNumbers') && Array.isArray(next.allowedSenderNumbers)) {
    const nums = next.allowedSenderNumbers.map(normalizePhone).filter(Boolean);
    settings.allowedSenderNumbers = nums;
    changed = true;
  }

  if (changed) persistSettings();
  return getSettings();
}

/**
 * Returns true if the bot should respond in this chat.
 * Applies groupEnabled flag + optional group whitelist.
 */
function isResponseEnabledForChat(chatId) {
  const target = String(chatId || '').trim();
  const isGroup = target.endsWith('@g.us');
  if (isGroup) {
    if (!settings.groupEnabled) return false;
    if (settings.groupFilterMode === 'whitelist' && settings.allowedGroupIds.length > 0) {
      return settings.allowedGroupIds.includes(target);
    }
    return true;
  }
  return settings.personalEnabled;
}

/**
 * Returns true if the sender is allowed to interact with the bot.
 * senderPhone should be digit-only (no @s.whatsapp.net).
 */
function isSenderAllowed(senderPhone) {
  if (settings.allowedSendersMode !== 'specific') return true;
  if (settings.allowedSenderNumbers.length === 0) return true; // empty list = no restriction
  const normalized = normalizePhone(senderPhone);
  if (!normalized) return false;
  return settings.allowedSenderNumbers.includes(normalized);
}

module.exports = {
  getSettings,
  updateSettings,
  isResponseEnabledForChat,
  isSenderAllowed,
};
