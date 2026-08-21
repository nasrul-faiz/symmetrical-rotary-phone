const { Pool } = require('pg');

function normalizeConnectionString(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  // Guard against quoted env values copied from docs, e.g. 'postgres://...'.
  return trimmed.replace(/^(['"])(.*)\1$/, '$2').trim();
}

function isExampleConnectionString(value) {
  return /postgres(?:ql)?:\/\/user:password@host(?::\d+)?\/dbname(?:\?|$)/i.test(value);
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
let useDatabase = Boolean(connectionString) && !isExampleConnectionString(connectionString);

let pool = null;

if (useDatabase) {
  const shouldUseSsl = !/sslmode=disable/i.test(connectionString);
  const config = {
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
  };

  if (shouldUseSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);

  pool.on('error', (error) => {
    console.error('[Postgres] Unexpected pool error:', error.message);
  });
} else if (isExampleConnectionString(connectionString)) {
  console.warn('[Postgres] DATABASE_URL still uses example placeholder, falling back to in-memory storage');
}

function hasDatabase() {
  return useDatabase;
}

async function disableDatabase(reason) {
  if (!useDatabase) return;

  useDatabase = false;
  if (reason) {
    console.warn(`[Postgres] Disabling PostgreSQL usage: ${reason}`);
  }

  if (!pool) return;

  try {
    await pool.end();
  } catch (error) {
    console.warn('[Postgres] Failed to close pool cleanly:', error.message);
  }

  pool = null;
}

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured or PostgreSQL is disabled');
  }

  return pool.query(text, params);
}

async function close() {
  if (!pool) return;
  await pool.end();
  pool = null;
}

module.exports = {
  hasDatabase,
  disableDatabase,
  query,
  close,
};
