const dayjs = require('dayjs');
const postgres = require('../lib/postgres');

const schedules = [];
let idCounter = 1;
let initialized = false;

const SELECT_COLUMNS = `id, target_type, target_value, message,
              schedule_at::text AS schedule_at,
              status,
              created_at::text AS created_at,
              sent_at::text AS sent_at,
              error,
              repeat_type,
              repeat_days,
              media_type,
              media_url,
              file_name,
              buttons_json`;

function normalizeButtons(buttons) {
  if (!Array.isArray(buttons)) return [];

  return buttons
    .filter((item) => item && typeof item === 'object' && item.name)
    .map((item) => ({
      name: String(item.name || '').trim(),
      buttonParamsJson:
        typeof item.buttonParamsJson === 'string'
          ? item.buttonParamsJson
          : JSON.stringify(item.buttonParamsJson || {}),
    }))
    .filter((item) => item.name && item.buttonParamsJson);
}

function parseButtons(value) {
  if (!value) return [];
  if (Array.isArray(value)) return normalizeButtons(value);

  try {
    const parsed = JSON.parse(String(value));
    return normalizeButtons(parsed);
  } catch (error) {
    return [];
  }
}

function toSchedule(row) {
  return {
    id: Number(row.id),
    targetType: row.target_type,
    targetValue: row.target_value,
    message: row.message,
    scheduleAt: row.schedule_at,
    status: row.status,
    createdAt: row.created_at,
    sentAt: row.sent_at,
    error: row.error,
    repeatType: row.repeat_type || 'none',
    repeatDays: row.repeat_days
      ? String(row.repeat_days)
          .split(',')
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value))
      : [],
    mediaType: row.media_type || '',
    mediaUrl: row.media_url || '',
    fileName: row.file_name || '',
    buttons: parseButtons(row.buttons_json),
  };
}

function normalizeRepeatDays(repeatDays) {
  if (!Array.isArray(repeatDays)) return [];
  return repeatDays
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
}

function computeNextOccurrence(currentScheduleAt, repeatType, repeatDays) {
  let next = dayjs(currentScheduleAt);

  if (repeatType === 'daily') {
    return next.add(1, 'day').toISOString();
  }

  if (repeatType === 'weekly') {
    const days = normalizeRepeatDays(repeatDays);
    if (!days.length) {
      return next.add(1, 'day').toISOString();
    }

    for (let i = 1; i <= 7; i += 1) {
      const candidate = next.add(i, 'day');
      if (days.includes(candidate.day())) {
        return candidate.toISOString();
      }
    }
  }

  return next.add(1, 'day').toISOString();
}

async function init() {
  if (initialized) return;

  if (postgres.hasDatabase()) {
    try {
      await postgres.query(
        `CREATE TABLE IF NOT EXISTS schedules (
          id BIGSERIAL PRIMARY KEY,
          target_type TEXT NOT NULL,
          target_value TEXT NOT NULL,
          message TEXT NOT NULL,
          schedule_at TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          sent_at TIMESTAMPTZ,
          error TEXT
        )`
      );

      await postgres.query(`ALTER TABLE schedules ADD COLUMN IF NOT EXISTS repeat_type TEXT NOT NULL DEFAULT 'none'`);
      await postgres.query('ALTER TABLE schedules ADD COLUMN IF NOT EXISTS repeat_days TEXT');
      await postgres.query('ALTER TABLE schedules ADD COLUMN IF NOT EXISTS media_type TEXT');
      await postgres.query('ALTER TABLE schedules ADD COLUMN IF NOT EXISTS media_url TEXT');
      await postgres.query('ALTER TABLE schedules ADD COLUMN IF NOT EXISTS file_name TEXT');
      await postgres.query('ALTER TABLE schedules ADD COLUMN IF NOT EXISTS buttons_json TEXT');

      console.log('[ScheduleStore] PostgreSQL storage is enabled');
    } catch (error) {
      await postgres.disableDatabase(error.message);
      console.warn('[ScheduleStore] PostgreSQL unavailable, using in-memory schedule storage');
    }
  } else {
    console.log('[ScheduleStore] DATABASE_URL not set, using in-memory schedule storage');
  }

  initialized = true;
}

async function createSchedule({
  targetType,
  targetValue,
  message,
  scheduleAt,
  repeatType = 'none',
  repeatDays = [],
  mediaType = '',
  mediaUrl = '',
  fileName = '',
  buttons = [],
}) {
  await init();

  const normalizedRepeatType = ['daily', 'weekly'].includes(repeatType) ? repeatType : 'none';
  const normalizedRepeatDays = normalizedRepeatType === 'weekly' ? normalizeRepeatDays(repeatDays) : [];
  const normalizedMediaType = mediaType && mediaType !== 'none' ? mediaType : '';
  const normalizedMediaUrl = normalizedMediaType ? String(mediaUrl || '').trim() : '';
  const normalizedFileName = normalizedMediaType ? String(fileName || '').trim() : '';
  const normalizedButtons = normalizeButtons(buttons);
  const buttonsJson = normalizedButtons.length ? JSON.stringify(normalizedButtons) : '';

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `INSERT INTO schedules (target_type, target_value, message, schedule_at, status, repeat_type, repeat_days, media_type, media_url, file_name, buttons_json)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10)
       RETURNING ${SELECT_COLUMNS}`,
      [
        targetType,
        targetValue,
        message,
        scheduleAt,
        normalizedRepeatType,
        normalizedRepeatDays.join(','),
        normalizedMediaType || null,
        normalizedMediaUrl || null,
        normalizedFileName || null,
        buttonsJson || null,
      ]
    );
    return toSchedule(result.rows[0]);
  }

  const newItem = {
    id: idCounter++,
    targetType,
    targetValue,
    message,
    scheduleAt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    sentAt: null,
    error: null,
    repeatType: normalizedRepeatType,
    repeatDays: normalizedRepeatDays,
    mediaType: normalizedMediaType,
    mediaUrl: normalizedMediaUrl,
    fileName: normalizedFileName,
    buttons: normalizedButtons,
  };

  schedules.push(newItem);
  return newItem;
}

async function listSchedules() {
  await init();

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `SELECT ${SELECT_COLUMNS}
       FROM schedules
       ORDER BY schedule_at ASC, created_at ASC, id ASC`
    );
    return result.rows.map(toSchedule);
  }

  return [...schedules].sort((a, b) => {
    const aTime = dayjs(a.scheduleAt).valueOf();
    const bTime = dayjs(b.scheduleAt).valueOf();
    if (aTime !== bTime) return aTime - bTime;

    const aCreated = dayjs(a.createdAt).valueOf();
    const bCreated = dayjs(b.createdAt).valueOf();
    if (aCreated !== bCreated) return aCreated - bCreated;

    return Number(a.id || 0) - Number(b.id || 0);
  });
}

async function getPendingSchedules(now = new Date()) {
  await init();

  if (postgres.hasDatabase()) {
    const nowIso = dayjs(now).toISOString();
    const result = await postgres.query(
      `SELECT ${SELECT_COLUMNS}
       FROM schedules
       WHERE status = 'pending' AND schedule_at <= $1
       ORDER BY schedule_at ASC, created_at ASC, id ASC`,
      [nowIso]
    );
    return result.rows.map(toSchedule);
  }

  const nowMs = dayjs(now).valueOf();
  return schedules
    .filter((item) => {
      if (item.status !== 'pending') return false;
      return dayjs(item.scheduleAt).valueOf() <= nowMs;
    })
    .sort((a, b) => {
      const aTime = dayjs(a.scheduleAt).valueOf();
      const bTime = dayjs(b.scheduleAt).valueOf();
      if (aTime !== bTime) return aTime - bTime;

      const aCreated = dayjs(a.createdAt).valueOf();
      const bCreated = dayjs(b.createdAt).valueOf();
      if (aCreated !== bCreated) return aCreated - bCreated;

      return Number(a.id || 0) - Number(b.id || 0);
    });
}

async function markSent(id) {
  await init();

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `UPDATE schedules
       SET status = 'sent', sent_at = NOW(), error = NULL
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [id]
    );
    return result.rowCount ? toSchedule(result.rows[0]) : null;
  }

  const target = schedules.find((item) => item.id === id);
  if (!target) return null;

  target.status = 'sent';
  target.sentAt = new Date().toISOString();
  target.error = null;
  return target;
}

async function markFailed(id, errorMessage) {
  await init();

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `UPDATE schedules
       SET status = 'failed', error = $2
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [id, errorMessage]
    );
    return result.rowCount ? toSchedule(result.rows[0]) : null;
  }

  const target = schedules.find((item) => item.id === id);
  if (!target) return null;

  target.status = 'failed';
  target.error = errorMessage;
  return target;
}

async function markSentOrRescheduled(item) {
  await init();

  if (item.repeatType !== 'daily' && item.repeatType !== 'weekly') {
    return markSent(item.id);
  }

  const nextScheduleAt = computeNextOccurrence(item.scheduleAt, item.repeatType, item.repeatDays);

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `UPDATE schedules
       SET status = 'pending', schedule_at = $2, sent_at = NOW(), error = NULL
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [item.id, nextScheduleAt]
    );
    return result.rowCount ? toSchedule(result.rows[0]) : null;
  }

  const target = schedules.find((row) => row.id === item.id);
  if (!target) return null;

  target.status = 'pending';
  target.scheduleAt = nextScheduleAt;
  target.sentAt = new Date().toISOString();
  target.error = null;
  return target;
}

async function markFailedOrRescheduled(item, errorMessage) {
  await init();

  if (item.repeatType !== 'daily' && item.repeatType !== 'weekly') {
    return markFailed(item.id, errorMessage);
  }

  const nextScheduleAt = computeNextOccurrence(item.scheduleAt, item.repeatType, item.repeatDays);

  if (postgres.hasDatabase()) {
    const result = await postgres.query(
      `UPDATE schedules
       SET status = 'pending', schedule_at = $2, error = $3
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [item.id, nextScheduleAt, errorMessage]
    );
    return result.rowCount ? toSchedule(result.rows[0]) : null;
  }

  const target = schedules.find((row) => row.id === item.id);
  if (!target) return null;

  target.status = 'pending';
  target.scheduleAt = nextScheduleAt;
  target.error = errorMessage;
  return target;
}

async function removeSchedule(id) {
  await init();

  if (postgres.hasDatabase()) {
    const result = await postgres.query('DELETE FROM schedules WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  const index = schedules.findIndex((item) => item.id === id);
  if (index === -1) return false;

  schedules.splice(index, 1);
  return true;
}

module.exports = {
  init,
  createSchedule,
  listSchedules,
  getPendingSchedules,
  markSent,
  markFailed,
  markSentOrRescheduled,
  markFailedOrRescheduled,
  removeSchedule,
};
