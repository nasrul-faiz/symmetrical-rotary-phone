const express = require('express');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const multer = require('multer');
const scheduleStore = require('../services/scheduleStore');
const customCommandStore = require('../services/customCommandStore');
const deletedMessageStore = require('../services/deletedMessageStore');
const chatResponseSettingsStore = require('../services/chatResponseSettingsStore');
const accessControlStore = require('../services/accessControlStore');
const builtInCommandSettingsStore = require('../services/builtInCommandSettingsStore');
const vendingStore = require('../services/vendingStore');
const numverifyService = require('../services/numverifyService');

const uploadDir = path.join(process.cwd(), 'uploads');
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = path
      .basename(file.originalname || 'media', ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-');
    cb(null, `${Date.now()}-${baseName || 'media'}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

function parseClientLocalDateTime(scheduleAt, timezoneOffsetMinutes, repeatType = 'none') {
  const raw = String(scheduleAt || '').trim();
  const dateTimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  const timeMatch = raw.match(/^(\d{2}):(\d{2})$/);

  if (!dateTimeMatch && !timeMatch) return null;

  const isRecurring = repeatType === 'daily' || repeatType === 'weekly';
  const offset = Number.isFinite(Number(timezoneOffsetMinutes))
    ? Number(timezoneOffsetMinutes)
    : 0;

  let year;
  let month;
  let day;
  let hour;
  let minute;

  if (dateTimeMatch) {
    year = Number(dateTimeMatch[1]);
    month = Number(dateTimeMatch[2]);
    day = Number(dateTimeMatch[3]);
    hour = Number(dateTimeMatch[4]);
    minute = Number(dateTimeMatch[5]);
  } else {
    if (!isRecurring) return null;

    // For recurring schedules using HH:mm, anchor to the client's current local date.
    const localNow = new Date(Date.now() - offset * 60 * 1000);
    year = localNow.getUTCFullYear();
    month = localNow.getUTCMonth() + 1;
    day = localNow.getUTCDate();
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2]);
  }

  const utcMs = Date.UTC(year, month - 1, day, hour, minute) + (offset * 60 * 1000);
  const parsed = dayjs(utcMs);

  if (!parsed.isValid()) return null;
  return parsed;
}

function normalizeInteractiveButtons(buttons) {
  if (buttons == null || buttons === '') return [];

  let parsed = buttons;
  if (typeof parsed === 'string') {
    const raw = parsed.trim();
    if (!raw) return [];
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error('Buttons must be valid JSON');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Buttons must be an array');
  }

  const cleaned = parsed
    .filter((item) => item && typeof item === 'object' && item.name)
    .map((item) => ({
      name: String(item.name || '').trim(),
      buttonParamsJson:
        typeof item.buttonParamsJson === 'string'
          ? item.buttonParamsJson
          : JSON.stringify(item.buttonParamsJson || {}),
    }))
    .filter((item) => item.name && item.buttonParamsJson);

  return cleaned;
}

function createDashboardRouter(whatsappService) {
  const router = express.Router();

  async function getDashboardViewData() {
    const schedules = await scheduleStore.listSchedules();
    const waState = whatsappService.getConnectionState();
    const scheduleStats = schedules.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === 'pending') acc.pending += 1;
        if (item.status === 'sent') acc.sent += 1;
        if (item.status === 'failed') acc.failed += 1;
        return acc;
      },
      { total: 0, pending: 0, sent: 0, failed: 0 }
    );

    const customCommands = customCommandStore.listCommands();
    const deletedMessages = deletedMessageStore.listRecords();
    const chatResponseSettings = chatResponseSettingsStore.getSettings();
    const accessControlSettings = accessControlStore.getSettings();
    const builtInCommandSettings = builtInCommandSettingsStore.getSettings();

    return {
      schedules,
      waState,
      scheduleStats,
      dayjs,
      customCommands,
      commandCategories: customCommandStore.ALLOWED_CATEGORIES,
      mediaTypes: customCommandStore.ALLOWED_MEDIA_TYPES,
      deletedMessages,
      chatResponseSettings,
      accessControlSettings,
      builtInCommandSettings,
    };
  }

  router.get('/', async (req, res, next) => {
    try {
      const viewData = await getDashboardViewData();
      res.render('dashboard', viewData);
    } catch (error) {
      next(error);
    }
  });

  router.get('/schedule/create', (req, res) => {
    return res.render('schedule-share', {
      mediaTypes: customCommandStore.ALLOWED_MEDIA_TYPES,
    });
  });

  router.get('/api/custom-commands', (req, res) => {
    return res.json({ commands: customCommandStore.listCommands() });
  });

  router.get('/api/vending/routes', (req, res) => {
    return res.json({ routes: vendingStore.listRoutes() });
  });

  router.post('/api/vending/routes', (req, res) => {
    try {
      const created = vendingStore.createRoute(req.body || {});
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.put('/api/vending/routes/:id', (req, res) => {
    try {
      const updated = vendingStore.updateRoute(req.params.id, req.body || {});
      return res.json(updated);
    } catch (error) {
      const status = error.message === 'Route not found' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  });

  router.delete('/api/vending/routes/:id', (req, res) => {
    try {
      const removed = vendingStore.removeRoute(req.params.id);
      if (!removed) {
        return res.status(404).json({ error: 'Route not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.get('/api/vending/locations', (req, res) => {
    return res.json({ locations: vendingStore.listLocations() });
  });

  router.post('/api/vending/locations', (req, res) => {
    try {
      const created = vendingStore.createLocation(req.body || {});
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.put('/api/vending/locations/:id', (req, res) => {
    try {
      const updated = vendingStore.updateLocation(req.params.id, req.body || {});
      return res.json(updated);
    } catch (error) {
      const status = error.message === 'Location not found' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  });

  router.delete('/api/vending/locations/:id', (req, res) => {
    try {
      const removed = vendingStore.removeLocation(req.params.id);
      if (!removed) {
        return res.status(404).json({ error: 'Location not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.get('/api/vending/route-locations', (req, res) => {
    return res.json({ routeLocations: vendingStore.listRouteLocations() });
  });

  router.post('/api/vending/route-locations', (req, res) => {
    try {
      const created = vendingStore.createRouteLocation(req.body || {});
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.put('/api/vending/route-locations/:id', (req, res) => {
    try {
      const updated = vendingStore.updateRouteLocation(req.params.id, req.body || {});
      return res.json(updated);
    } catch (error) {
      const status = error.message === 'Route Location mapping not found' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  });

  router.delete('/api/vending/route-locations/:id', (req, res) => {
    const removed = vendingStore.removeRouteLocation(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Route Location mapping not found' });
    }
    return res.status(204).send();
  });

  router.post('/api/custom-commands', (req, res) => {
    try {
      const created = customCommandStore.createCommand(req.body || {});
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.post('/api/custom-commands/upload-media', upload.single('mediaFile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const mediaType = String(req.body?.mediaType || '').trim();
      const allowedMedia = new Set(customCommandStore.ALLOWED_MEDIA_TYPES);
      if (!allowedMedia.has(mediaType)) {
        return res.status(400).json({ error: 'Invalid media type for upload' });
      }

      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const mediaUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      return res.status(201).json({
        mediaUrl,
        fileName: req.file.originalname || req.file.filename,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to upload media file' });
    }
  });

  router.put('/api/custom-commands/:trigger', (req, res) => {
    try {
      const updated = customCommandStore.updateCommand(req.params.trigger, req.body || {});
      return res.json(updated);
    } catch (error) {
      const status = error.message === 'Command not found' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
  });

  router.delete('/api/custom-commands/:trigger', (req, res) => {
    const removed = customCommandStore.removeCommand(req.params.trigger);
    if (!removed) {
      return res.status(404).json({ error: 'Command not found' });
    }
    return res.status(204).send();
  });

  router.post('/api/schedules/upload-media', upload.single('mediaFile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const mediaType = String(req.body?.mediaType || '').trim();
      const allowedMedia = new Set(customCommandStore.ALLOWED_MEDIA_TYPES);
      if (!allowedMedia.has(mediaType)) {
        return res.status(400).json({ error: 'Invalid media type for upload' });
      }

      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const mediaUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      return res.status(201).json({
        mediaUrl,
        fileName: req.file.originalname || req.file.filename,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to upload media file' });
    }
  });

  router.post('/api/messages/upload-media', upload.single('mediaFile'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const mediaType = String(req.body?.mediaType || '').trim();
      const allowedMedia = new Set(customCommandStore.ALLOWED_MEDIA_TYPES);
      if (!allowedMedia.has(mediaType)) {
        return res.status(400).json({ error: 'Invalid media type for upload' });
      }

      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const mediaUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      return res.status(201).json({
        mediaUrl,
        fileName: req.file.originalname || req.file.filename,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to upload media file' });
    }
  });

  router.post('/api/schedules', async (req, res, next) => {
    try {
      const {
        targetType,
        targetValue,
        message,
        scheduleAt,
        timezoneOffsetMinutes,
        repeatType,
        repeatDays,
        mediaType,
        mediaUrl,
        fileName,
        buttons,
      } = req.body;
      const normalizedTargetType =
        targetType === 'personal-manual' || targetType === 'personal-chat' ? 'personal' : targetType;

      const normalizedMessage = String(message || '').trim();
      let normalizedButtons = [];
      try {
        normalizedButtons = normalizeInteractiveButtons(buttons);
      } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid buttons payload' });
      }

      if (!normalizedTargetType || !targetValue || !scheduleAt) {
        return res.status(400).json({
          error: 'targetType, targetValue, and scheduleAt are required',
        });
      }

      if (!['personal', 'group'].includes(normalizedTargetType)) {
        return res.status(400).json({ error: 'targetType must be personal or group' });
      }

      const normalizedRepeatType = ['daily', 'weekly'].includes(repeatType) ? repeatType : 'none';
      const normalizedRepeatDays = Array.isArray(repeatDays)
        ? repeatDays.map((day) => Number(day)).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
        : [];

      if (normalizedRepeatType === 'weekly' && !normalizedRepeatDays.length) {
        return res.status(400).json({ error: 'Select at least one day for a weekly repeat schedule' });
      }

      const normalizedMediaType = String(mediaType || '').trim();
      if (normalizedMediaType && normalizedMediaType !== 'none') {
        const allowedMedia = new Set(customCommandStore.ALLOWED_MEDIA_TYPES);
        if (!allowedMedia.has(normalizedMediaType)) {
          return res.status(400).json({ error: 'Invalid media type' });
        }
        if (!String(mediaUrl || '').trim()) {
          return res.status(400).json({ error: 'mediaUrl is required when mediaType is set' });
        }
      }

      const hasMedia = Boolean(normalizedMediaType && normalizedMediaType !== 'none');
      if (!normalizedMessage && !hasMedia && !normalizedButtons.length) {
        return res.status(400).json({
          error: 'At least one of message, media, or buttons is required',
        });
      }

      const parsed = parseClientLocalDateTime(scheduleAt, timezoneOffsetMinutes, normalizedRepeatType);
      if (!parsed || !parsed.isValid()) {
        return res.status(400).json({
          error: 'Invalid scheduleAt format',
        });
      }

      const created = await scheduleStore.createSchedule({
        targetType: normalizedTargetType,
        targetValue,
        message: normalizedMessage,
        scheduleAt: parsed.toISOString(),
        repeatType: normalizedRepeatType,
        repeatDays: normalizedRepeatDays,
        mediaType: normalizedMediaType,
        mediaUrl: String(mediaUrl || '').trim(),
        fileName: String(fileName || '').trim(),
        buttons: normalizedButtons,
      });

      return res.status(201).json(created);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/api/messages/send', async (req, res) => {
    try {
      const { targetType, targetValue, message, mediaType, mediaUrl, fileName, buttons } = req.body || {};
      const normalizedTargetType =
        targetType === 'personal-manual' || targetType === 'personal-chat' ? 'personal' : targetType;
      const normalizedMessage = String(message || '').trim();
      const normalizedMediaType = String(mediaType || '').trim();
      const normalizedMediaUrl = String(mediaUrl || '').trim();
      const normalizedFileName = String(fileName || '').trim();
      let normalizedButtons = [];
      try {
        normalizedButtons = normalizeInteractiveButtons(buttons);
      } catch (error) {
        return res.status(400).json({ error: error.message || 'Invalid buttons payload' });
      }
      const hasMedia = Boolean(normalizedMediaType && normalizedMediaType !== 'none' && normalizedMediaUrl);
      const hasButtons = normalizedButtons.length > 0;

      if (!normalizedTargetType || !targetValue || (!normalizedMessage && !hasMedia && !hasButtons)) {
        return res.status(400).json({
          error: 'targetType, targetValue, and at least one of message, media, or buttons are required',
        });
      }

      if (!['personal', 'group'].includes(normalizedTargetType)) {
        return res.status(400).json({ error: 'targetType must be personal or group' });
      }

      const allowedMedia = new Set(customCommandStore.ALLOWED_MEDIA_TYPES);
      if (normalizedMediaType && normalizedMediaType !== 'none' && !allowedMedia.has(normalizedMediaType)) {
        return res.status(400).json({ error: 'Invalid media type' });
      }

      const deliveryOptions = {
        mediaType: hasMedia ? normalizedMediaType : '',
        mediaUrl: hasMedia ? normalizedMediaUrl : '',
        fileName: hasMedia ? (normalizedFileName || undefined) : undefined,
        buttons: normalizedButtons,
      };

      await whatsappService.sendMessage(
        normalizedTargetType,
        String(targetValue).trim(),
        normalizedMessage,
        deliveryOptions
      );

      return res.status(200).json({ ok: true });
    } catch (error) {
      const status = error.message === 'WhatsApp client is not ready' ? 409 : 400;
      return res.status(status).json({ error: error.message || 'Failed to send message' });
    }
  });

  router.delete('/api/schedules/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const deleted = await scheduleStore.removeSchedule(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.get('/api/deleted-messages', (req, res) => {
    return res.json({ messages: deletedMessageStore.listRecords() });
  });

  router.delete('/api/deleted-messages/:id', (req, res) => {
    const removed = deletedMessageStore.removeRecord(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.status(204).send();
  });

  router.delete('/api/deleted-messages', (req, res) => {
    deletedMessageStore.clearRecords();
    return res.status(204).send();
  });

  router.get('/api/whatsapp/groups', async (req, res, next) => {
    try {
      const groups = await whatsappService.listGroups();
      return res.json({ groups });
    } catch (error) {
      if (error.message === 'WhatsApp client is not ready') {
        return res.status(409).json({ error: error.message });
      }
      return next(error);
    }
  });

  router.get('/api/whatsapp/personal-chats', async (req, res, next) => {
    try {
      const chats = await whatsappService.listPersonalChats();
      return res.json({ chats });
    } catch (error) {
      if (error.message === 'WhatsApp client is not ready') {
        return res.status(409).json({ error: error.message });
      }
      return next(error);
    }
  });

  router.get('/api/whatsapp/state', (req, res) => {
    const waState = whatsappService.getConnectionState();
    return res.json(waState);
  });

  router.post('/api/whatsapp/refresh-qr', async (req, res) => {
    try {
      const state = await whatsappService.refreshQrCode();
      return res.json(state);
    } catch (error) {
      const status = error.message === 'WhatsApp is already connected' ? 409 : 400;
      return res.status(status).json({ error: error.message || 'Failed to refresh QR code' });
    }
  });

  router.get('/api/chat-response-settings', (req, res) => {
    return res.json(chatResponseSettingsStore.getSettings());
  });

  router.put('/api/chat-response-settings', (req, res) => {
    try {
      const payload = req.body || {};
      const knownKeys = ['personalEnabled', 'groupEnabled', 'selfCommandEnabled',
        'groupFilterMode', 'allowedGroupIds', 'allowedSendersMode', 'allowedSenderNumbers'];
      const hasAny = knownKeys.some((k) => Object.prototype.hasOwnProperty.call(payload, k));
      if (!hasAny) {
        return res.status(400).json({ error: 'At least one known setting field is required' });
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'personalEnabled') && typeof payload.personalEnabled !== 'boolean') {
        return res.status(400).json({ error: 'personalEnabled must be a boolean' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'groupEnabled') && typeof payload.groupEnabled !== 'boolean') {
        return res.status(400).json({ error: 'groupEnabled must be a boolean' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'selfCommandEnabled') && typeof payload.selfCommandEnabled !== 'boolean') {
        return res.status(400).json({ error: 'selfCommandEnabled must be a boolean' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'groupFilterMode') &&
          !['all', 'whitelist'].includes(payload.groupFilterMode)) {
        return res.status(400).json({ error: 'groupFilterMode must be "all" or "whitelist"' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'allowedGroupIds') && !Array.isArray(payload.allowedGroupIds)) {
        return res.status(400).json({ error: 'allowedGroupIds must be an array' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'allowedSendersMode') &&
          !['anyone', 'specific'].includes(payload.allowedSendersMode)) {
        return res.status(400).json({ error: 'allowedSendersMode must be "anyone" or "specific"' });
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'allowedSenderNumbers') && !Array.isArray(payload.allowedSenderNumbers)) {
        return res.status(400).json({ error: 'allowedSenderNumbers must be an array' });
      }

      const updated = chatResponseSettingsStore.updateSettings(payload);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to update chat response settings' });
    }
  });

  router.get('/api/whatsapp/groups', async (req, res) => {
    try {
      const groups = await waService.listGroups();
      return res.json({ groups });
    } catch (error) {
      return res.status(409).json({ error: error.message || 'WhatsApp not ready' });
    }
  });

  router.get('/api/built-in-commands/sch-usage', (req, res) => {
    const settings = builtInCommandSettingsStore.getSettings();
    return res.json({
      text: settings.scheduleUsageHelpText,
      buttons: settings.scheduleUsageButtons,
    });
  });

  router.get('/api/built-in-commands', (req, res) => {
    const settings = builtInCommandSettingsStore.getSettings();
    return res.json(settings);
  });

  router.put('/api/built-in-commands/sch-usage', (req, res) => {
    try {
      const payload = req.body || {};
      const hasText = Object.prototype.hasOwnProperty.call(payload, 'text');
      const hasButtons = Object.prototype.hasOwnProperty.call(payload, 'buttons');

      if (!hasText && !hasButtons) {
        return res.status(400).json({ error: 'text or buttons is required' });
      }

      const updated = builtInCommandSettingsStore.updateScheduleUsageSettings({
        scheduleUsageHelpText: hasText ? payload.text : undefined,
        scheduleUsageButtons: hasButtons ? payload.buttons : undefined,
      });
      return res.json({
        text: updated.scheduleUsageHelpText,
        buttons: updated.scheduleUsageButtons,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to update .sch usage text' });
    }
  });

  router.put('/api/built-in-commands', (req, res) => {
    try {
      const payload = req.body || {};
      // Only pass through keys the client actually sent — updateSettings treats a
      // present-but-undefined key as "field was submitted", so building the object
      // with every key up front (even as `undefined`) would incorrectly require
      // every other built-in command's text whenever only one was being edited.
      const allowedKeys = [
        'scheduleUsageHelpText',
        'scheduleUsageButtons',
        'scheduleListEmptyText',
        'scheduleListButtons',
        'scheduleDeleteUsageText',
        'scheduleDeleteButtons',
        'vvUsageHelpText',
        'vvUsageButtons',
        'stickerUsageHelpText',
        'stickerUsageButtons',
        'zipUsageHelpText',
        'zipUsageButtons',
        'unzipUsageHelpText',
        'unzipUsageButtons',
        'pdf2txtUsageHelpText',
        'pdf2txtUsageButtons',
        'maketxtUsageHelpText',
        'maketxtUsageButtons',
        'qrcodeUsageHelpText',
        'qrcodeUsageButtons',
        'imagetopdfUsageHelpText',
        'imagetopdfUsageButtons',
        'ssUsageHelpText',
        'ssUsageButtons',
        'ttsUsageHelpText',
        'ttsUsageButtons',
      ];

      const updatePayload = {};
      for (const key of allowedKeys) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          updatePayload[key] = payload[key];
        }
      }

      if (!Object.keys(updatePayload).length) {
        return res.status(400).json({ error: 'At least one built-in setting field is required' });
      }

      const updated = builtInCommandSettingsStore.updateSettings(updatePayload);

      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to update built-in command settings' });
    }
  });

  router.get('/api/access-control-settings', (req, res) => {
    return res.json(accessControlStore.getSettings());
  });

  router.put('/api/access-control-settings', (req, res) => {
    try {
      const payload = req.body || {};
      const hasOwner = Object.prototype.hasOwnProperty.call(payload, 'ownerNumber');
      const hasMode = Object.prototype.hasOwnProperty.call(payload, 'commandMode');
      const hasTimeZone = Object.prototype.hasOwnProperty.call(payload, 'timeZone');

      if (!hasOwner && !hasMode && !hasTimeZone) {
        return res.status(400).json({ error: 'ownerNumber, commandMode, or timeZone is required' });
      }

      if (hasMode && !['public', 'private'].includes(String(payload.commandMode || '').trim().toLowerCase())) {
        return res.status(400).json({ error: 'commandMode must be public or private' });
      }

      if (hasTimeZone) {
        const rawTimeZone = String(payload.timeZone || '').trim();
        try {
          new Intl.DateTimeFormat('en-GB', { timeZone: rawTimeZone || 'UTC' }).format(new Date());
        } catch (error) {
          return res.status(400).json({ error: 'timeZone must be a valid IANA timezone (example: Asia/Kuala_Lumpur)' });
        }
      }

      const updated = accessControlStore.updateSettings(payload);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to update access control settings' });
    }
  });

  router.post('/api/whatsapp/pairing-code', async (req, res) => {
    try {
      const { phoneNumber } = req.body || {};
      const validation = await numverifyService.validatePhoneNumber(phoneNumber);

      if (validation.enabled && !validation.valid) {
        return res.status(400).json({
          error: validation.error || 'Phone number failed NumVerify validation',
          validation,
        });
      }

      const numberToUse = validation.e164Digits || validation.normalizedDigits || phoneNumber;
      const code = await whatsappService.requestPairingCode(numberToUse);

      return res.json({
        code,
        validation,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  router.post('/api/phone/validate', async (req, res) => {
    try {
      const { phoneNumber, countryCode } = req.body || {};
      const validation = await numverifyService.validatePhoneNumber(phoneNumber, { countryCode });

      if (!validation.enabled) {
        return res.status(200).json(validation);
      }

      if (!validation.valid) {
        return res.status(400).json(validation);
      }

      return res.json(validation);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Failed to validate phone number' });
    }
  });

  // ── OSINT Routes ────────────────────────────────────────────────────────────
  // Rate-limited: max 20 requests per IP per 5 minutes across all OSINT endpoints.

  router.post('/api/osint/wa-lookup', osintRateLimit, async (req, res, next) => {
    try {
      const { phone } = req.body || {};
      if (!phone) {
        return res.status(400).json({ error: 'phone is required' });
      }
      const result = await whatsappService.osintWaLookup(String(phone).trim());
      return res.json(result);
    } catch (error) {
      if (error.message === 'WhatsApp client is not ready') {
        return res.status(409).json({ error: 'WhatsApp is not connected. Please connect first.' });
      }
      return next(error);
    }
  });

  router.post('/api/osint/wa-lookup-batch', osintRateLimit, async (req, res, next) => {
    try {
      const source = req.body?.numbers;
      let numbers = [];

      if (Array.isArray(source)) {
        numbers = source.map((item) => String(item || '').trim()).filter(Boolean);
      } else if (typeof source === 'string') {
        numbers = source
          .split(/\r?\n/)
          .map((item) => String(item || '').trim())
          .filter(Boolean);
      } else {
        return res.status(400).json({ error: 'numbers is required (array or newline string)' });
      }

      if (!numbers.length) {
        return res.status(400).json({ error: 'Provide at least one phone number' });
      }

      if (numbers.length > 25) {
        return res.status(400).json({ error: 'Maximum 25 numbers per batch request' });
      }

      const result = await whatsappService.osintWaLookupBatch(numbers);
      return res.json(result);
    } catch (error) {
      if (error.message === 'WhatsApp client is not ready') {
        return res.status(409).json({ error: 'WhatsApp is not connected. Please connect first.' });
      }
      return next(error);
    }
  });

  router.get('/api/osint/phone-info', osintRateLimit, async (req, res, next) => {
    try {
      const { number } = req.query;
      if (!number) {
        return res.status(400).json({ error: 'number query param is required' });
      }

      if (numverifyService.isEnabled()) {
        const validation = await numverifyService.validatePhoneNumber(String(number).trim());
        if (validation.valid) {
          return res.json({
            valid: true,
            number: validation.e164Digits || validation.normalizedDigits,
            intlFormat: validation.internationalFormat || '',
            localFormat: validation.localFormat || '',
            country: validation.countryName || 'Unknown',
            countryCode: validation.countryPrefix ? `+${validation.countryPrefix}` : '',
            lineType: validation.lineType || 'Unknown',
            carrier: validation.carrier || 'Unknown',
            source: 'numverify',
          });
        }
      }

      const result = await osintParsePhoneNumber(String(number).trim());
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/api/osint/social-footprint', osintRateLimit, async (req, res, next) => {
    try {
      const { phone } = req.query;
      if (!phone) {
        return res.status(400).json({ error: 'phone query param is required' });
      }

      const parsed = await osintParsePhoneNumber(String(phone).trim());
      if (!parsed.valid) {
        return res.status(400).json({ error: parsed.error || 'Invalid phone number format' });
      }

      const result = buildSocialFootprintFromPhone(parsed);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/api/osint/group-info', osintRateLimit, async (req, res, next) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'id query param is required' });
      }
      const result = await whatsappService.osintGroupInfo(String(id).trim());
      return res.json(result);
    } catch (error) {
      if (error.message === 'WhatsApp client is not ready') {
        return res.status(409).json({ error: 'WhatsApp is not connected. Please connect first.' });
      }
      return next(error);
    }
  });

  router.get('/api/osint/ip-info', osintRateLimit, async (req, res, next) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'query param is required' });
      }
      const result = await osintIpLookup(String(query).trim());
      if (!result.success) {
        return res.status(502).json({ error: result.error || 'IP lookup failed' });
      }
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/api/osint/deep-scan', osintRateLimit, async (req, res, next) => {
    try {
      const { phone } = req.body || {};
      if (!phone) return res.status(400).json({ error: 'phone is required' });
      const raw = String(phone).trim();

      // 1. Parse phone info (carrier, timezone, etc.)
      const phoneInfo = await osintParsePhoneNumber(raw);

      // 2. WA lookup (best-effort — doesn't fail the whole scan)
      let waInfo = null;
      try {
        waInfo = await whatsappService.osintWaLookup(raw);
      } catch (e) {
        const msg = e.message || '';
        waInfo = {
          error: msg.includes('not ready')
            ? 'WhatsApp tidak disambungkan — sila scan kod QR dahulu'
            : msg,
        };
      }

      // 3. Social footprint links
      const social = phoneInfo.valid ? buildSocialFootprintFromPhone(phoneInfo) : null;

      return res.json({ phoneInfo, waInfo, social });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

// ── OSINT Helpers ─────────────────────────────────────────────────────────────

// Simple in-memory rate limiter: 20 requests per IP per 5 minutes.
const _osintRateBuckets = new Map();
const OSINT_RATE_LIMIT = 20;
const OSINT_RATE_WINDOW_MS = 5 * 60 * 1000;

function osintRateLimit(req, res, next) {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  const now = Date.now();
  const bucket = _osintRateBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    _osintRateBuckets.set(ip, { count: 1, resetAt: now + OSINT_RATE_WINDOW_MS });
    return next();
  }

  if (bucket.count >= OSINT_RATE_LIMIT) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
    });
  }

  bucket.count += 1;
  return next();
}

// Malaysian mobile prefix → carrier (local number = after stripping +60)
function detectMalaysianCarrier(localNumber) {
  const n = String(localNumber).replace(/\D/g, '');
  if (!n || !n.startsWith('1')) return null; // fixed line or empty

  if (n.startsWith('11')) {
    const p = n.slice(0, 3);
    const m = {
      '111': 'CelcomDigi / Yoodo', '112': 'CelcomDigi / Yoodo',
      '113': 'CelcomDigi', '114': 'CelcomDigi',
      '115': 'U Mobile', '116': 'U Mobile / Boost Mobile',
      '117': 'CelcomDigi', '118': 'Maxis', '119': 'Yes 4G (Altel)',
    };
    return m[p] || 'U Mobile / MVNO';
  }
  if (n.startsWith('14')) {
    return ['141', '142', '143'].includes(n.slice(0, 3)) ? 'U Mobile' : 'CelcomDigi';
  }
  const two = {
    '12': 'Maxis', '13': 'CelcomDigi', '15': 'TM Unifi Mobile',
    '16': 'Maxis', '17': 'CelcomDigi', '18': 'TM Unifi Mobile',
    '19': 'Maxis / Hotlink',
  };
  return two[n.slice(0, 2)] || null;
}

async function osintParsePhoneNumber(raw) {
  // Strip common formatting
  const cleaned = raw.replace(/[\s\-().+]/g, '');

  // Country code map (most common dial codes)
  const countryCodes = {
    '1': { country: 'United States / Canada', code: '+1' },
    '7': { country: 'Russia', code: '+7' },
    '20': { country: 'Egypt', code: '+20' },
    '27': { country: 'South Africa', code: '+27' },
    '30': { country: 'Greece', code: '+30' },
    '31': { country: 'Netherlands', code: '+31' },
    '32': { country: 'Belgium', code: '+32' },
    '33': { country: 'France', code: '+33' },
    '34': { country: 'Spain', code: '+34' },
    '39': { country: 'Italy', code: '+39' },
    '40': { country: 'Romania', code: '+40' },
    '41': { country: 'Switzerland', code: '+41' },
    '43': { country: 'Austria', code: '+43' },
    '44': { country: 'United Kingdom', code: '+44' },
    '45': { country: 'Denmark', code: '+45' },
    '46': { country: 'Sweden', code: '+46' },
    '47': { country: 'Norway', code: '+47' },
    '48': { country: 'Poland', code: '+48' },
    '49': { country: 'Germany', code: '+49' },
    '51': { country: 'Peru', code: '+51' },
    '52': { country: 'Mexico', code: '+52' },
    '54': { country: 'Argentina', code: '+54' },
    '55': { country: 'Brazil', code: '+55' },
    '56': { country: 'Chile', code: '+56' },
    '57': { country: 'Colombia', code: '+57' },
    '58': { country: 'Venezuela', code: '+58' },
    '60': { country: 'Malaysia', code: '+60' },
    '61': { country: 'Australia', code: '+61' },
    '62': { country: 'Indonesia', code: '+62' },
    '63': { country: 'Philippines', code: '+63' },
    '64': { country: 'New Zealand', code: '+64' },
    '65': { country: 'Singapore', code: '+65' },
    '66': { country: 'Thailand', code: '+66' },
    '81': { country: 'Japan', code: '+81' },
    '82': { country: 'South Korea', code: '+82' },
    '84': { country: 'Vietnam', code: '+84' },
    '86': { country: 'China', code: '+86' },
    '90': { country: 'Turkey', code: '+90' },
    '91': { country: 'India', code: '+91' },
    '92': { country: 'Pakistan', code: '+92' },
    '93': { country: 'Afghanistan', code: '+93' },
    '94': { country: 'Sri Lanka', code: '+94' },
    '95': { country: 'Myanmar', code: '+95' },
    '98': { country: 'Iran', code: '+98' },
    '212': { country: 'Morocco', code: '+212' },
    '213': { country: 'Algeria', code: '+213' },
    '216': { country: 'Tunisia', code: '+216' },
    '218': { country: 'Libya', code: '+218' },
    '220': { country: 'Gambia', code: '+220' },
    '221': { country: 'Senegal', code: '+221' },
    '234': { country: 'Nigeria', code: '+234' },
    '254': { country: 'Kenya', code: '+254' },
    '255': { country: 'Tanzania', code: '+255' },
    '256': { country: 'Uganda', code: '+256' },
    '260': { country: 'Zambia', code: '+260' },
    '263': { country: 'Zimbabwe', code: '+263' },
    '351': { country: 'Portugal', code: '+351' },
    '352': { country: 'Luxembourg', code: '+352' },
    '353': { country: 'Ireland', code: '+353' },
    '354': { country: 'Iceland', code: '+354' },
    '358': { country: 'Finland', code: '+358' },
    '380': { country: 'Ukraine', code: '+380' },
    '385': { country: 'Croatia', code: '+385' },
    '386': { country: 'Slovenia', code: '+386' },
    '420': { country: 'Czech Republic', code: '+420' },
    '421': { country: 'Slovakia', code: '+421' },
    '855': { country: 'Cambodia', code: '+855' },
    '880': { country: 'Bangladesh', code: '+880' },
    '886': { country: 'Taiwan', code: '+886' },
    '960': { country: 'Maldives', code: '+960' },
    '966': { country: 'Saudi Arabia', code: '+966' },
    '971': { country: 'UAE', code: '+971' },
    '972': { country: 'Israel', code: '+972' },
    '973': { country: 'Bahrain', code: '+973' },
    '974': { country: 'Qatar', code: '+974' },
    '977': { country: 'Nepal', code: '+977' },
  };

  if (!cleaned || !/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  let countryInfo = null;
  let localNumber = cleaned;

  // Try 3-digit then 2-digit then 1-digit country code
  for (const len of [3, 2, 1]) {
    const prefix = cleaned.slice(0, len);
    if (countryCodes[prefix]) {
      countryInfo = countryCodes[prefix];
      localNumber = cleaned.slice(len);
      break;
    }
  }

  const intlFormat = `+${cleaned}`;

  // Malaysian carrier detection
  let carrier = 'Tidak tersedia (perlukan API berbayar)';
  if (cleaned.startsWith('60') && localNumber) {
    const detected = detectMalaysianCarrier(localNumber);
    if (detected) carrier = detected;
  }

  // Line type
  let lineType = 'Unknown';
  if (cleaned.startsWith('60')) {
    if (localNumber.startsWith('1')) lineType = 'Telefon bimbit (Mobile)';
    else lineType = 'Talian tetap (Fixed line)';
  } else {
    const isLikelyMobile = localNumber.startsWith('1') || localNumber.startsWith('8') || localNumber.startsWith('9');
    lineType = isLikelyMobile ? 'Mobile (estimated)' : 'Unknown';
  }

  // Timezone per country code
  const timezoneByCode = {
    '+60': 'Asia/Kuala_Lumpur', '+65': 'Asia/Singapore', '+62': 'Asia/Jakarta',
    '+66': 'Asia/Bangkok', '+63': 'Asia/Manila', '+84': 'Asia/Ho_Chi_Minh',
    '+91': 'Asia/Kolkata', '+92': 'Asia/Karachi', '+86': 'Asia/Shanghai',
    '+81': 'Asia/Tokyo', '+82': 'Asia/Seoul', '+1': 'America/New_York',
    '+44': 'Europe/London', '+61': 'Australia/Sydney', '+971': 'Asia/Dubai',
    '+966': 'Asia/Riyadh', '+974': 'Asia/Qatar', '+973': 'Asia/Bahrain',
    '+20': 'Africa/Cairo', '+27': 'Africa/Johannesburg', '+234': 'Africa/Lagos',
    '+254': 'Africa/Nairobi', '+49': 'Europe/Berlin', '+33': 'Europe/Paris',
    '+39': 'Europe/Rome', '+34': 'Europe/Madrid', '+7': 'Europe/Moscow',
    '+55': 'America/Sao_Paulo', '+52': 'America/Mexico_City',
    '+880': 'Asia/Dhaka', '+977': 'Asia/Kathmandu', '+94': 'Asia/Colombo',
    '+95': 'Asia/Yangon', '+855': 'Asia/Phnom_Penh', '+886': 'Asia/Taipei',
  };
  const timezone = countryInfo ? (timezoneByCode[countryInfo.code] || null) : null;
  let localTime = null;
  if (timezone) {
    try {
      localTime = new Date().toLocaleString('en-MY', {
        timeZone: timezone, weekday: 'short', year: 'numeric',
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { localTime = null; }
  }

  return {
    valid: cleaned.length >= 7 && cleaned.length <= 15,
    number: cleaned,
    intlFormat,
    localFormat: `0${localNumber}`,
    country: countryInfo?.country || 'Unknown',
    countryCode: countryInfo?.code || `+${cleaned.slice(0, 2)}`,
    lineType,
    carrier,
    timezone,
    localTime,
    note: cleaned.startsWith('60')
      ? 'Pengesanan telco berdasarkan awalan nombor Malaysia (MCMC).'
      : 'Country and line type are estimated from dial code. Carrier lookup requires a paid API.',
  };
}

async function osintIpLookup(query) {
  try {
    const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
    const fetchFn = fetch || globalThis.fetch;

    // ipinfo.io — free tier, HTTPS supported, no API key required for basic lookups.
    // Accepts both IPv4 addresses and domain names.
    const url = `https://ipinfo.io/${encodeURIComponent(query)}/json`;
    const res = await fetchFn(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { success: false, error: `Provider returned HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ''}` };
    }

    const data = await res.json();

    // ipinfo.io returns { ip, hostname, city, region, country, loc, org, postal, timezone }
    // "loc" is "lat,lon" string; "org" is "AS#### OrgName"
    const [lat, lon] = (data.loc || '').split(',');
    const coordinates = lat && lon ? `${lat}, ${lon}` : null;

    return {
      success: true,
      query: data.ip || query,
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
      coordinates,
      timezone: data.timezone || null,
      isp: data.org || null,
      org: data.org || null,
      as: data.org ? data.org.split(' ')[0] : null,
      hostname: data.hostname || null,
      postal: data.postal || null,
    };
  } catch (error) {
    return { success: false, error: `Lookup failed: ${error.message}` };
  }
}

function buildSocialFootprintFromPhone(parsedPhoneInfo) {
  const phone = String(parsedPhoneInfo?.number || '').trim();
  const intlFormat = String(parsedPhoneInfo?.intlFormat || '').trim() || `+${phone}`;
  const compactIntl = intlFormat.replace(/\s+/g, '');
  const localFormat = String(parsedPhoneInfo?.localFormat || '').trim();
  const country = String(parsedPhoneInfo?.country || 'Unknown');

  const searchTargets = [phone, compactIntl, localFormat]
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const searchPhrase = searchTargets.map((v) => `"${v}"`).join(' OR ');
  const e = encodeURIComponent;

  const categories = [
    {
      name: 'Caller ID & Reverse Lookup',
      links: [
        { platform: 'Truecaller', url: `https://www.truecaller.com/search/my/${phone}` },
        { platform: 'Sync.me', url: `https://sync.me/search/?number=${e(compactIntl)}` },
        { platform: 'Hiya', url: `https://hiya.com/phone-number-reputation/${phone}` },
        { platform: 'GetContact', url: `https://web.getcontact.com/en/number${compactIntl}` },
        { platform: 'WhoCalledMe', url: `https://whocalled.us/lookup/${phone}` },
        { platform: '800notes', url: `https://800notes.com/Phone.aspx/${phone}` },
        { platform: 'CallerID.com', url: `https://www.callerid.com/details/?number=${e(phone)}` },
        { platform: 'SpamCalls', url: `https://spamcalls.net/en/search/${phone}` },
      ],
    },
    {
      name: 'Aplikasi Pesanan',
      links: [
        { platform: 'WhatsApp', url: `https://wa.me/${phone}` },
        { platform: 'Telegram', url: `https://t.me/${compactIntl}` },
        { platform: 'Viber', url: `https://viber.com/act=chat&number=${e(compactIntl)}` },
        { platform: 'Signal', url: `https://signal.me/#p/${compactIntl}` },
      ],
    },
    {
      name: 'Media Sosial',
      links: [
        { platform: 'Facebook', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:facebook.com`)}` },
        { platform: 'Instagram', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:instagram.com`)}` },
        { platform: 'TikTok', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:tiktok.com`)}` },
        { platform: 'X / Twitter', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:x.com OR site:twitter.com`)}` },
        { platform: 'LinkedIn', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:linkedin.com`)}` },
        { platform: 'YouTube', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:youtube.com`)}` },
        { platform: 'Telegram (awam)', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:t.me`)}` },
        { platform: 'Shopee MY', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:shopee.com.my`)}` },
        { platform: 'Carousell', url: `https://www.google.com/search?q=${e(`${searchPhrase} site:carousell.com.my`)}` },
      ],
    },
    {
      name: 'Enjin Carian',
      links: [
        { platform: 'Google', url: `https://www.google.com/search?q=${e(searchPhrase)}` },
        { platform: 'Bing', url: `https://www.bing.com/search?q=${e(searchPhrase)}` },
        { platform: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${e(searchPhrase)}` },
        { platform: 'Yandex', url: `https://yandex.com/search/?text=${e(searchPhrase)}` },
      ],
    },
  ];

  return {
    valid: true,
    phone,
    intlFormat,
    localFormat,
    country,
    note: 'Pautan carian awam sahaja. Akaun peribadi/tidak terindeks tidak dapat dikesan.',
    categories,
    links: categories.flatMap((c) => c.links), // flat list for backward compat
  };
}

module.exports = createDashboardRouter;
