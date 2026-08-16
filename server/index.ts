import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiHandler from '../api/index.js';
import {
  clearDeletedMessageLogs,
  createBotReminder,
  deleteBotReminder,
  getBotMessageBehaviorSettings,
  getDeletedMessageLogs,
  getDeletedMessageMediaPath,
  getBotReminders,
  readBotContacts,
  removeDeletedMessageRecordsByChatId,
  saveBotContacts,
  sendBotDashboardMessage,
  setBotMessageBehaviorSettings,
  startBot,
  updateBotReminder,
} from '../bot/src/index.js';

const apiHandlerFn: any = typeof apiHandler === 'function' ? apiHandler : (apiHandler as { default?: any })?.default;

if (typeof apiHandlerFn !== 'function') {
  throw new Error('Invalid API module export: expected a default function handler at ../api/index.js');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const app: any = express();
const port = Number(process.env.PORT || 3000);

type BotRuntimeState = {
  enabled: boolean;
  status: 'disabled' | 'starting' | 'qr' | 'pairing-phone' | 'pairing-code' | 'connected' | 'closed' | 'reconnecting' | 'logged-out' | 'error';
  qr: string | null;
  pairingMethod: 'qr' | 'phone' | null;
  pairingPhoneNumber: string | null;
  connectedPhoneNumber: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  pairingCode: string | null;
  updatedAt: string | null;
  lastError: string | null;
};

const botState: BotRuntimeState = {
  enabled: false,
  status: 'disabled',
  qr: null,
  pairingMethod: null,
  pairingPhoneNumber: null,
  connectedPhoneNumber: null,
  displayName: null,
  profileImageUrl: null,
  pairingCode: null,
  updatedAt: null,
  lastError: null,
};

const dashboardToken = process.env.BOT_DASHBOARD_TOKEN || '';

function isDashboardAuthorized(req: any): boolean {
  if (!dashboardToken) return true;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : '';
  const headerToken = typeof req.headers['x-bot-dashboard-token'] === 'string' ? req.headers['x-bot-dashboard-token'] : '';
  return queryToken === dashboardToken || headerToken === dashboardToken;
}

function ensureDashboardAuth(req: any, res: any, next: any) {
  if (isDashboardAuthorized(req)) return next();
  return res.status(401).json({ success: false, error: 'Unauthorized dashboard access' });
}

app.disable('x-powered-by');

// Upload endpoint expects raw stream/bytes.
app.all('/api/upload', express.raw({ type: '*/*', limit: '15mb' }));
// JSON payload endpoints.
app.use('/api', express.json({ limit: '10mb' }));
app.use('/api', express.urlencoded({ extended: true }));

app.get('/health', (_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

function buildBotStatusResponse() {
  return {
    success: true,
    data: {
      ...botState,
      qr: botState.status === 'qr' ? botState.qr : null,
      pairingCode: botState.status === 'pairing-code' ? botState.pairingCode : null,
    },
  };
}

app.get('/bot/status', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json(buildBotStatusResponse());
});

app.post('/api/bot/pairing', ensureDashboardAuth, async (req: any, res: any) => {
  try {
    const raw = req?.body && typeof req.body === 'object' ? req.body : {}
    const normalized: { pairingMethod: 'qr' | 'phone'; phoneNumber: string } = (() => {
      const method = String(raw?.pairingMethod || '').trim().toLowerCase()
      const phoneNumber = String(raw?.phoneNumber || '').trim().replace(/\D/g, '')
      return {
        pairingMethod: method === 'phone' ? 'phone' : 'qr',
        phoneNumber,
      }
    })()

    if (normalized.pairingMethod === 'phone' && !normalized.phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required for phone pairing' })
    }

    const nextPairingMethod: 'qr' | 'phone' = normalized.pairingMethod
    const nextPhoneNumber: string | null = nextPairingMethod === 'phone' ? normalized.phoneNumber : null

    botState.status = 'starting'
    botState.qr = null
    botState.pairingMethod = nextPairingMethod
    botState.pairingPhoneNumber = nextPhoneNumber
    botState.connectedPhoneNumber = nextPhoneNumber
    botState.displayName = nextPhoneNumber ? `WhatsApp ${nextPhoneNumber}` : botState.displayName
    botState.pairingCode = null
    botState.lastError = null
    botState.updatedAt = new Date().toISOString()

    const enableBot = String(process.env.ENABLE_WHATSAPP_BOT || 'false').toLowerCase() === 'true'
    if (!enableBot) {
      return res.status(200).json({
        success: true,
        data: {
          pairingMethod: botState.pairingMethod,
          pairingPhoneNumber: botState.pairingPhoneNumber,
          status: botState.status,
        },
      })
    }

    try {
      const { restartBotForPairingSelection } = await import('../bot/src/index.js')
      const authDir = process.env.AUTH_DIR || path.join(rootDir, '.wa-auth')

      await restartBotForPairingSelection({
        authDir,
        pairingMethod: nextPairingMethod,
        pairingPhoneNumber: nextPairingMethod === 'phone' ? nextPhoneNumber || undefined : undefined,
      })
    } catch (error) {
      botState.status = 'error'
      botState.lastError = error instanceof Error ? error.message : 'Failed to restart bot with new pairing selection'
      console.error('[server/bot/restart]', error)
      return res.status(500).json({ success: false, error: 'Failed to restart bot with new pairing selection' })
    }

    return res.status(200).json({
      success: true,
      data: {
        pairingMethod: botState.pairingMethod,
        pairingPhoneNumber: botState.pairingPhoneNumber,
        status: botState.status,
      },
    })
  } catch (error) {
    console.error('[server/bot/pairing]', error)
    return res.status(500).json({ success: false, error: 'Failed to update pairing selection' })
  }
})

app.get('/api/bot-status', ensureDashboardAuth, (_req: any, res: any) => {
  const response = {
    ...buildBotStatusResponse(),
    source: 'api',
  };
  res.status(200).json(response);
});

const botMessageJsonParser = express.json({ limit: '10mb' });

app.post('/api/bot/messages', ensureDashboardAuth, botMessageJsonParser, async (req: any, res: any) => {
  try {
    const result = await sendBotDashboardMessage(req.body ?? {});
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal hantar mesej';
    return res.status(400).json({ success: false, error: message });
  }
});

app.get('/api/bot/contacts', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({ success: true, data: readBotContacts() });
});

app.post('/api/bot/contacts', ensureDashboardAuth, (req: any, res: any) => {
  try {
    const raw = req?.body && typeof req.body === 'object' ? req.body : {};
    const nextContacts = Array.isArray(raw) ? raw : Array.isArray(raw.contacts) ? raw.contacts : [];
    const saved = saveBotContacts(nextContacts);
    return res.status(200).json({ success: true, data: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save bot contacts';
    return res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/bot/deleted-messages', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({ success: true, data: getDeletedMessageLogs() });
});

app.delete('/api/bot/deleted-messages', ensureDashboardAuth, (_req: any, res: any) => {
  clearDeletedMessageLogs();
  return res.status(200).json({ success: true, data: [] });
});

app.delete('/api/bot/deleted-messages/chat/:chatJid', ensureDashboardAuth, (req: any, res: any) => {
  const removed = removeDeletedMessageRecordsByChatId(req.params?.chatJid || '');
  return res.status(200).json({ success: true, removed, data: getDeletedMessageLogs() });
});

app.get('/api/bot/deleted-messages/media/:fileName', ensureDashboardAuth, (req: any, res: any) => {
  const filePath = getDeletedMessageMediaPath(req.params?.fileName);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Fail arkib tidak ditemui' });
  }
  return res.sendFile(filePath);
});

app.get('/bot/settings', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: {
      messageBehavior: getBotMessageBehaviorSettings(),
    },
  });
});

app.get('/api/bot-settings', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: {
      messageBehavior: getBotMessageBehaviorSettings(),
      source: 'api',
    },
  });
});

const botSettingsJsonParser = express.json({ limit: '100kb' });

function parseMessageBehaviorPayload(req: any) {
  const raw = req?.body?.messageBehavior && typeof req.body.messageBehavior === 'object'
    ? req.body.messageBehavior
    : (req?.body && typeof req.body === 'object' ? req.body : {});

  return {
    respondInGroup: raw.respondInGroup,
    respondInPrivate: raw.respondInPrivate,
    respondForAnyone: raw.respondForAnyone,
    respondOnlySelectedGroups: raw.respondOnlySelectedGroups,
    allowedNumbers: raw.allowedNumbers,
    allowedGroups: raw.allowedGroups,
    autoRespondUnknownCommand: raw.autoRespondUnknownCommand,
    unknownCommandInPrivate: raw.unknownCommandInPrivate,
    unknownCommandInGroup: raw.unknownCommandInGroup,
  };
}

app.post('/bot/settings', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const nextSettings = parseMessageBehaviorPayload(req);
  const updated = setBotMessageBehaviorSettings(nextSettings);
  if (!updated) {
    return res.status(500).json({ success: false, error: 'Failed to save bot settings' });
  }

  return res.status(200).json({
    success: true,
    data: {
      messageBehavior: updated,
    },
  });
});

app.post('/api/bot-settings', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const nextSettings = parseMessageBehaviorPayload(req);
  const updated = setBotMessageBehaviorSettings(nextSettings);
  if (!updated) {
    return res.status(500).json({ success: false, error: 'Failed to save bot settings' });
  }

  return res.status(200).json({
    success: true,
    data: {
      messageBehavior: updated,
      source: 'api',
    },
  });
});

function parseReminderPayload(req: any) {
  const raw = req?.body && typeof req.body === 'object' ? req.body : {};
  return {
    name: raw.name,
    date: raw.date,
    time: raw.time,
    earlyDays: raw.earlyDays,
    targetChats: raw.targetChats,
  };
}

app.get('/bot/reminders', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: getBotReminders(),
  });
});

app.get('/api/bot-reminders', ensureDashboardAuth, (_req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: getBotReminders(),
    source: 'api',
  });
});

app.post('/bot/reminders', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const created = createBotReminder(parseReminderPayload(req));
  if (!created) {
    return res.status(400).json({ success: false, error: 'Invalid reminder payload' });
  }

  return res.status(200).json({
    success: true,
    data: created,
  });
});

app.post('/api/bot-reminders', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const created = createBotReminder(parseReminderPayload(req));
  if (!created) {
    return res.status(400).json({ success: false, error: 'Invalid reminder payload' });
  }

  return res.status(200).json({
    success: true,
    data: created,
    source: 'api',
  });
});

app.put('/bot/reminders/:id', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const updated = updateBotReminder(req.params?.id, parseReminderPayload(req));
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Failed to update reminder' });
  }

  return res.status(200).json({
    success: true,
    data: updated,
  });
});

app.put('/api/bot-reminders/:id', ensureDashboardAuth, botSettingsJsonParser, (req: any, res: any) => {
  const updated = updateBotReminder(req.params?.id, parseReminderPayload(req));
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Failed to update reminder' });
  }

  return res.status(200).json({
    success: true,
    data: updated,
    source: 'api',
  });
});

app.delete('/bot/reminders/:id', ensureDashboardAuth, (req: any, res: any) => {
  const deleted = deleteBotReminder(req.params?.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Reminder not found' });
  }

  return res.status(200).json({
    success: true,
  });
});

app.delete('/api/bot-reminders/:id', ensureDashboardAuth, (req: any, res: any) => {
  const deleted = deleteBotReminder(req.params?.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Reminder not found' });
  }

  return res.status(200).json({
    success: true,
    source: 'api',
  });
});

app.get('/bot/dashboard', ensureDashboardAuth, (req: any, res: any) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Routebot WhatsApp Dashboard</title>
    <style>
      :root {
        --bg: #f4f6f8;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --ok: #059669;
        --warn: #d97706;
        --err: #dc2626;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      .wrap {
        max-width: 860px;
        margin: 24px auto;
        padding: 0 14px;
      }
      .card {
        background: var(--card);
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        padding: 18px;
      }
      h1 { margin: 0 0 8px; font-size: 22px; }
      p { margin: 0; color: var(--muted); }
      .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
        margin-top: 14px;
      }
      @media (min-width: 820px) {
        .grid { grid-template-columns: 360px 1fr; }
      }
      .qr-box {
        min-height: 330px;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: #fafafa;
        padding: 16px;
        text-align: center;
      }
      .qr-box img { width: 280px; height: 280px; border-radius: 12px; }
      .pairing-code {
        width: 100%;
        margin-top: 12px;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        background: #fff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 16px;
        letter-spacing: 0.2em;
        word-break: break-all;
      }
      .qr-instructions {
        margin-top: 12px;
        font-size: 14px;
        color: var(--muted);
        line-height: 1.6;
      }
      .status {
        font-weight: 700;
        margin-bottom: 10px;
      }
      .status.ok { color: var(--ok); }
      .status.warn { color: var(--warn); }
      .status.err { color: var(--err); }
      .meta {
        font-size: 13px;
        color: var(--muted);
        line-height: 1.5;
      }
      code {
        display: block;
        white-space: pre-wrap;
        word-break: break-all;
        margin-top: 8px;
        background: #f3f4f6;
        border-radius: 8px;
        padding: 10px;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <div class="card">
        <h1>WhatsApp Bot Dashboard</h1>
        <p>Pair bot melalui QR code atau nombor telefon, kemudian pantau status sambungan.</p>
        <div class="qr-instructions">
          1. Pilih QR code jika mahu scan kod.<br/>
          2. Pilih nombor telefon jika mahu dapat pairing code.<br/>
          3. QR mode guna Linked Devices &gt; Link a Device.<br/>
          4. Phone mode guna Linked Devices &gt; Link with phone number.
        </div>
        <div class="grid">
          <section>
            <div class="qr-box" id="qrBox">Menunggu status bot...</div>
          </section>
          <section>
            <div id="status" class="status warn">Initializing</div>
            <div class="meta" id="meta"></div>
            <code id="debug"></code>
          </section>
        </div>
      </div>
    </main>
    <script>
      const statusEl = document.getElementById('status');
      const metaEl = document.getElementById('meta');
      const qrBox = document.getElementById('qrBox');
      const debugEl = document.getElementById('debug');
      const QR_REFRESH_SECONDS = 20;
      let qrCountdownInterval = null;
      let activeQrValue = null;
      let qrExpiresAt = 0;

      function statusClass(status) {
        if (status === 'connected') return 'status ok';
        if (status === 'error' || status === 'logged-out') return 'status err';
        return 'status warn';
      }

      function statusLabel(status) {
        const labels = {
          disabled: 'Disabled',
          starting: 'Starting',
          qr: 'Waiting QR Scan',
          'pairing-phone': 'Pairing Phone',
          'pairing-code': 'Pairing Code Ready',
          connected: 'Connected',
          closed: 'Connection Closed',
          reconnecting: 'Reconnecting',
          'logged-out': 'Logged Out',
          error: 'Error',
        };
        return labels[status] || status || 'Unknown';
      }

      function stopQrCountdown() {
        if (!qrCountdownInterval) return;
        clearInterval(qrCountdownInterval);
        qrCountdownInterval = null;
      }

      function setQrCountdownValue(value) {
        const countEl = document.getElementById('qrCountdown');
        if (countEl) {
          countEl.textContent = String(value);
        }
      }

      function startQrCountdown(reset = false) {
        if (reset || !qrExpiresAt) {
          qrExpiresAt = Date.now() + (QR_REFRESH_SECONDS * 1000);
        }

        const updateCountdown = () => {
          const remaining = Math.max(0, Math.ceil((qrExpiresAt - Date.now()) / 1000));
          if (remaining <= 0) {
            qrExpiresAt = Date.now() + (QR_REFRESH_SECONDS * 1000);
            refresh();
            setQrCountdownValue(QR_REFRESH_SECONDS);
            return;
          }

          setQrCountdownValue(remaining);
        };

        updateCountdown();

        if (qrCountdownInterval) {
          return;
        }

        qrCountdownInterval = setInterval(updateCountdown, 1000);
      }

      function render(data) {
        statusEl.className = statusClass(data.status);
        statusEl.textContent = 'Status: ' + statusLabel(data.status);
        metaEl.innerHTML = [
          'Bot enabled: <strong>' + (data.enabled ? 'yes' : 'no') + '</strong>',
          'Updated: <strong>' + (data.updatedAt || '-') + '</strong>',
          'Error: <strong>' + (data.lastError || '-') + '</strong>',
          'Pairing method: <strong>' + (data.pairingMethod || '-') + '</strong>',
          'Phone number: <strong>' + (data.pairingPhoneNumber || '-') + '</strong>',
        ].join('<br/>');

        if (data.status === 'pairing-code' && data.pairingCode) {
          stopQrCountdown();
          activeQrValue = null;
          qrExpiresAt = 0;
          qrBox.innerHTML = '<div class="qr-instructions">Masukkan pairing code ini dalam WhatsApp > Linked Devices > Link with phone number.</div><div class="pairing-code">' + data.pairingCode + '</div>';
        } else if (data.status === 'pairing-phone') {
          stopQrCountdown();
          activeQrValue = null;
          qrExpiresAt = 0;
          qrBox.innerHTML = '<div class="qr-instructions">Tunggu seketika, bot sedang minta pairing code daripada WhatsApp.</div>';
        } else if (data.status === 'qr' && data.qr) {
          const hasQrCountdownNode = Boolean(document.getElementById('qrCountdown'));
          const isQrChanged = data.qr !== activeQrValue;

          if (isQrChanged || !hasQrCountdownNode) {
            const src = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(data.qr);
            qrBox.innerHTML = '<img alt="WhatsApp QR" src="' + src + '" /><div class="qr-instructions">Imbas kod ini pada telefon anda untuk sambungkan bot.<br/>QR akan refresh automatik dalam <strong id="qrCountdown">' + QR_REFRESH_SECONDS + '</strong>s.</div>';
            activeQrValue = data.qr;
            startQrCountdown(true);
          } else {
            startQrCountdown(false);
          }
        } else if (data.status === 'connected') {
          stopQrCountdown();
          activeQrValue = null;
          qrExpiresAt = 0;
          qrBox.innerHTML = '<div class="qr-instructions">Bot connected. QR tidak diperlukan lagi.</div>';
        } else {
          stopQrCountdown();
          activeQrValue = null;
          qrExpiresAt = 0;
          qrBox.innerHTML = '<div class="qr-instructions">QR belum tersedia. Tunggu sehingga bot mengeluarkan kod sambungan.</div>';
        }

        debugEl.textContent = JSON.stringify(data, null, 2);
      }

      async function refresh() {
        try {
          const statusUrl = '/bot/status' + tokenParam;
          const response = await fetch(statusUrl);
          const payload = await response.json();
          if (payload?.success) {
            render(payload.data);
          } else {
            statusEl.className = 'status err';
            statusEl.textContent = 'Status: error';
            qrBox.textContent = payload?.error || 'Failed to fetch bot status';
          }
        } catch (error) {
          statusEl.className = 'status err';
          statusEl.textContent = 'Status: error';
          qrBox.textContent = 'Tidak dapat sambung ke endpoint status.';
        }
      }

      refresh();
      setInterval(refresh, 3000);
    </script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

app.all('/api/*', async (req: any, res: any) => {
  try {
    await apiHandlerFn(req as never, res as never);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    console.error('[server/api]', error);
    res.status(500).json({ success: false, error: message });
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get('*', (req: any, res: any) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: `Unknown endpoint: ${req.path}` });
    }

    return res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('*', (_req: any, res: any) => {
    res.status(503).send('Frontend dist not found. Run npm run build first.');
  });
}

app.listen(port, async () => {
  console.log(`Routebot server running on port ${port}`);

  const enableBot = String(process.env.ENABLE_WHATSAPP_BOT || 'false').toLowerCase() === 'true';
  botState.enabled = enableBot;
  botState.updatedAt = new Date().toISOString();
  if (!enableBot) {
    console.log('WhatsApp bot disabled (set ENABLE_WHATSAPP_BOT=true to enable).');
    return;
  }

  try {
    botState.status = 'starting';
    botState.lastError = null;
    botState.updatedAt = new Date().toISOString();

    const appBaseUrl = process.env.APP_BASE_URL || `http://127.0.0.1:${port}`;
    const pairingMethod = String(process.env.BOT_PAIRING_METHOD || process.env.PAIRING_METHOD || '').trim().toLowerCase();
    const pairingPhoneNumber = String(process.env.BOT_PAIRING_PHONE_NUMBER || process.env.PAIRING_PHONE_NUMBER || '').trim();
    const resolvedPairingMethod = pairingMethod === 'phone' || pairingMethod === 'qr' ? pairingMethod : 'qr';

    botState.pairingMethod = resolvedPairingMethod;
    botState.pairingPhoneNumber = resolvedPairingMethod === 'phone' && pairingPhoneNumber ? pairingPhoneNumber : null;
    botState.connectedPhoneNumber = botState.pairingPhoneNumber;
    await startBot({
      appBaseUrl,
      authDir: process.env.AUTH_DIR || path.join(rootDir, '.wa-auth'),
      pairingMethod: resolvedPairingMethod,
      pairingPhoneNumber: pairingPhoneNumber || undefined,
      onQr: (qr: string) => {
        botState.qr = qr;
        botState.status = 'qr';
        botState.pairingCode = null;
        botState.updatedAt = new Date().toISOString();
      },
      onPairingCode: (pairingCode: string, phoneNumber: string) => {
        botState.pairingMethod = 'phone';
        botState.pairingPhoneNumber = phoneNumber;
        botState.connectedPhoneNumber = phoneNumber;
        botState.displayName = botState.displayName || `WhatsApp ${phoneNumber}`;
        botState.pairingCode = pairingCode;
        botState.updatedAt = new Date().toISOString();
      },
      onConnectedProfile: (profile: { displayName?: string | null; phoneNumber?: string | null; profileImageUrl?: string | null } | null) => {
        const nextDisplayName = (profile?.displayName || '').trim();
        const nextPhoneNumber = (profile?.phoneNumber || '').trim();
        const nextImageUrl = (profile?.profileImageUrl || '').trim();
        if (nextDisplayName) {
          botState.displayName = nextDisplayName;
        }
        if (nextPhoneNumber) {
          botState.connectedPhoneNumber = nextPhoneNumber;
          botState.pairingPhoneNumber = botState.pairingPhoneNumber || nextPhoneNumber;
        }
        if (nextImageUrl) {
          botState.profileImageUrl = nextImageUrl;
        }
        botState.updatedAt = new Date().toISOString();
      },
      onStatus: (status: BotRuntimeState['status']) => {
        botState.status = status;
        if (status === 'connected') {
          botState.qr = null;
          botState.pairingCode = null;
        }
        if (status === 'closed' || status === 'logged-out' || status === 'error') {
          botState.pairingCode = null;
        }
        botState.updatedAt = new Date().toISOString();
      },
    });
    console.log('WhatsApp bot startup initialized.');
  } catch (error) {
    botState.status = 'error';
    botState.lastError = error instanceof Error ? error.message : 'Unknown bot startup error';
    botState.updatedAt = new Date().toISOString();
    console.error('Failed to start WhatsApp bot:', error);
  }
});
