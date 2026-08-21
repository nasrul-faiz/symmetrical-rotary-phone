const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'access-control-settings.json');

const DEFAULT_SETTINGS = {
  ownerNumber: '',
  commandMode: 'public',
  timeZone: 'Asia/Kuala_Lumpur',
};

function normalizeOwnerNumber(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  return raw.startsWith('+') ? `+${digits}` : digits;
}

function normalizeCommandMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  return mode === 'private' ? 'private' : 'public';
}

function normalizeTimeZone(value) {
  const fallback = 'Asia/Kuala_Lumpur';
  const raw = String(value || '').trim();
  if (!raw) return fallback;

  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: raw }).format(new Date());
    return raw;
  } catch (error) {
    return fallback;
  }
}

function normalizeSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    ownerNumber: normalizeOwnerNumber(source.ownerNumber),
    commandMode: normalizeCommandMode(source.commandMode),
    timeZone: normalizeTimeZone(source.timeZone),
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
    console.error('[AccessControlStore] Failed to persist settings:', error.message);
  }
}

function getSettings() {
  return {
    ownerNumber: settings.ownerNumber,
    commandMode: settings.commandMode,
    timeZone: settings.timeZone,
  };
}

function updateSettings(partial) {
  const next = partial && typeof partial === 'object' ? partial : {};
  let changed = false;

  if (Object.prototype.hasOwnProperty.call(next, 'ownerNumber')) {
    const normalizedOwner = normalizeOwnerNumber(next.ownerNumber);
    if (settings.ownerNumber !== normalizedOwner) {
      settings.ownerNumber = normalizedOwner;
      changed = true;
    }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'commandMode')) {
    const normalizedMode = normalizeCommandMode(next.commandMode);
    if (settings.commandMode !== normalizedMode) {
      settings.commandMode = normalizedMode;
      changed = true;
    }
  }

  if (Object.prototype.hasOwnProperty.call(next, 'timeZone')) {
    const normalizedTimeZone = normalizeTimeZone(next.timeZone);
    if (settings.timeZone !== normalizedTimeZone) {
      settings.timeZone = normalizedTimeZone;
      changed = true;
    }
  }

  if (changed) {
    persistSettings();
  }

  return getSettings();
}

module.exports = {
  getSettings,
  updateSettings,
  normalizeOwnerNumber,
  normalizeCommandMode,
  normalizeTimeZone,
};