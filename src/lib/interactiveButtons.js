const baileys = require('atexovi-baileys');

const { generateWAMessageFromContent, proto } = baileys;

function getInteractiveStepTimeoutMs() {
  const parsed = Number(process.env.WA_INTERACTIVE_STEP_TIMEOUT_MS);
  if (!Number.isFinite(parsed) || parsed < 1000) return 15000;
  return Math.floor(parsed);
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`${label} timed out after ${timeoutMs}ms`);
      error.code = 'WA_STEP_TIMEOUT';
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function isPersonalJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@s.whatsapp.net');
}

function normalizePhone(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function parseButtonParams(button) {
  if (!button || typeof button !== 'object') return {};

  if (typeof button.buttonParamsJson === 'string') {
    try {
      const parsed = JSON.parse(button.buttonParamsJson);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  if (typeof button.buttonParamsJson === 'object' && button.buttonParamsJson) {
    return button.buttonParamsJson;
  }

  return {};
}

function normalizeSingleSelectSections(rawSections, fallbackTitle) {
  const sections = Array.isArray(rawSections) ? rawSections : [];
  const cleanedSections = [];

  for (const section of sections) {
    if (!section || typeof section !== 'object') continue;

    const rows = Array.isArray(section.rows) ? section.rows : [];
    const cleanedRows = rows
      .map((row) => {
        if (!row || typeof row !== 'object') return null;

        const id = String(row.id || '').trim();
        const title = String(row.title || row.display_text || '').trim();
        const header = String(row.header || '').trim();
        const description = String(row.description || '').trim();
        if (!id || !title) return null;

        const cleanedRow = { id, title };
        if (header) cleanedRow.header = header;
        if (description) cleanedRow.description = description;
        return cleanedRow;
      })
      .filter(Boolean);

    if (!cleanedRows.length) continue;

    const sectionTitle = String(section.title || section.section_title || 'Options').trim() || 'Options';
    const highlightLabel = String(section.highlight_label || '').trim();

    const cleanedSection = {
      title: sectionTitle,
      rows: cleanedRows,
    };
    if (highlightLabel) {
      cleanedSection.highlight_label = highlightLabel;
    }

    cleanedSections.push(cleanedSection);
  }

  if (cleanedSections.length) return cleanedSections;

  const fallbackId = String(fallbackTitle || '').trim();
  if (!fallbackId) return [];

  return [
    {
      title: 'Options',
      rows: [{ id: fallbackId, title: fallbackId }],
    },
  ];
}

function normalizeButton(button) {
  if (!button || typeof button !== 'object' || !button.name || !button.buttonParamsJson) return null;

  const name = String(button.name || '').trim();
  const params = parseButtonParams(button);

  const displayText = String(params.display_text || '').trim();

  // `cta_wa` is transformed to `cta_url` so the button reliably opens a WA chat.
  // This keeps behavior consistent even when interactive native payload falls back.
  if (name === 'cta_wa') {
    const phoneNumber = normalizePhone(params.phone_number || params.id || '');
    if (!phoneNumber) return null;

    const presetText = String(params.text || params.message || '').trim();
    const waUrl = presetText
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(presetText)}`
      : `https://wa.me/${phoneNumber}`;

    return {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: displayText || 'WhatsApp',
        url: waUrl,
        merchant_url: waUrl,
      }),
    };
  }

  if (name === 'cta_url') {
    const url = String(params.url || '').trim();
    if (!url) return null;

    return {
      name,
      buttonParamsJson: JSON.stringify({
        ...params,
        display_text: displayText || String(params.title || 'Open link').trim() || 'Open link',
        url,
        merchant_url: String(params.merchant_url || url).trim() || url,
      }),
    };
  }

  if (name === 'cta_call') {
    const phoneNumber = normalizePhone(params.phone_number || '');
    if (!phoneNumber) return null;

    return {
      name,
      buttonParamsJson: JSON.stringify({
        ...params,
        display_text: displayText,
        phone_number: phoneNumber,
      }),
    };
  }

  if (name === 'cta_copy') {
    const copyCode = String(params.copy_code || '').trim();
    if (!copyCode) return null;

    return {
      name,
      buttonParamsJson: JSON.stringify({
        display_text: displayText,
        copy_code: copyCode,
      }),
    };
  }

  if (name === 'single_select') {
    const title = String(params.title || params.display_text || 'Choose option').trim() || 'Choose option';
    const sections = normalizeSingleSelectSections(params.sections, String(params.id || '').trim() || title);
    if (!sections.length) return null;

    return {
      name,
      buttonParamsJson: JSON.stringify({
        title,
        sections,
      }),
    };
  }

  return {
    name,
    buttonParamsJson: JSON.stringify(params),
  };
}

function getButtonDedupKey(button) {
  if (!button || typeof button !== 'object') return '';

  const name = String(button.name || '').trim();
  const params = parseButtonParams(button);

  if (name === 'quick_reply') {
    return `quick_reply:${String(params.id || '').trim()}:${String(params.display_text || '').trim()}`;
  }
  if (name === 'cta_url') {
    return `cta_url:${String(params.url || '').trim()}:${String(params.display_text || '').trim()}`;
  }
  if (name === 'cta_call') {
    return `cta_call:${String(params.phone_number || '').trim()}:${String(params.display_text || '').trim()}`;
  }
  if (name === 'cta_wa') {
    return `cta_wa:${String(params.phone_number || '').trim()}:${String(params.display_text || '').trim()}`;
  }
  if (name === 'cta_copy') {
    return `cta_copy:${String(params.copy_code || '').trim()}:${String(params.display_text || '').trim()}`;
  }
  if (name === 'single_select') {
    return `single_select:${String(params.title || '').trim()}:${JSON.stringify(params.sections || [])}`;
  }

  return `${name}:${JSON.stringify(params)}`;
}

function toNativeFlowButtons(buttons) {
  if (!Array.isArray(buttons)) return [];

  const mapped = [];
  const seen = new Set();

  for (const button of buttons) {
    const normalized = normalizeButton(button);
    if (!normalized) continue;

    const key = getButtonDedupKey(normalized);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    mapped.push(normalized);
  }

  return mapped;
}

function toLegacyButtons(nativeButtons) {
  return nativeButtons
    .map((button, index) => {
      try {
        const params = JSON.parse(button.buttonParamsJson || '{}');
        const kind = String(button.name || '').trim();
        let displayText = params.display_text || `Button ${index + 1}`;
        let buttonId = params.id || params.url || params.phone_number || params.copy_code || displayText;

        if (kind === 'single_select') {
          const firstRow = Array.isArray(params.sections)
            ? params.sections
              .flatMap((section) => (Array.isArray(section?.rows) ? section.rows : []))
              .find((row) => row && typeof row === 'object' && (row.id || row.title))
            : null;

          displayText = params.title || params.display_text || firstRow?.title || displayText;
          buttonId = firstRow?.id || firstRow?.title || displayText;
        }

        return { buttonId: String(buttonId), buttonText: { displayText }, type: 1 };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 3);
}

function buildMediaField(media) {
  if (!media || !media.type || !media.source) return null;

  const field = { [media.type]: media.source };
  if (media.type === 'document') {
    field.fileName = media.fileName || 'file';
    field.mimetype = media.mimetype || 'application/octet-stream';
  } else if (media.type === 'audio') {
    field.mimetype = media.mimetype || 'audio/mpeg';
    field.ptt = false;
  }

  return field;
}

async function sendInteractiveButtons(sock, jid, payload, options = {}) {
  const bodyText = payload?.text || payload?.caption || '';
  const footerText = payload?.footer || '';
  const nativeButtons = toNativeFlowButtons(payload?.buttons);
  const shouldStripQuotedFallback = isPersonalJid(jid) && Boolean(options?.quoted);
  const mediaField = buildMediaField(payload?.media);
  const legacyButtons = toLegacyButtons(nativeButtons);
  const buttonMessageText = bodyText || footerText || 'Choose an option:';
  const stepTimeoutMs = getInteractiveStepTimeoutMs();

  async function sendMessageWithTimeout(messagePayload, sendOptions, label) {
    return withTimeout(sock.sendMessage(jid, messagePayload, sendOptions), stepTimeoutMs, label);
  }

  async function relayNativeFlow(text, footer) {
    const msg = generateWAMessageFromContent(
      jid,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: text || ' ' }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || '' }),
              header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: nativeButtons,
              }),
            }),
          },
        },
      },
      {
        userJid: sock?.user?.id,
        quoted: options?.quoted,
      }
    );

    await withTimeout(
      sock.relayMessage(jid, msg.message, { messageId: msg.key.id }),
      stepTimeoutMs,
      'nativeFlow relay'
    );
  }

  // Send media first, then response text together with button message to ensure both are delivered reliably.
  if (mediaField) {
    try {
      await sendMessageWithTimeout({ ...mediaField }, options, 'media send');
    } catch (mediaError) {
      if (shouldStripQuotedFallback) throw mediaError;
      await sendMessageWithTimeout({ ...mediaField }, undefined, 'media send retry');
    }

    try {
      await relayNativeFlow(buttonMessageText, footerText);
      return;
    } catch (nativeFlowError) {
      console.warn('[WA] media follow-up nativeFlow relay failed:', nativeFlowError.message);
    }

    try {
      await sendMessageWithTimeout(
        {
          text: buttonMessageText,
          footer: footerText,
          interactiveButtons: nativeButtons,
        },
        options,
        'media interactiveButtons'
      );
      return;
    } catch (interactiveError) {
      console.warn('[WA] media follow-up interactiveButtons failed:', interactiveError.message);

      if (shouldStripQuotedFallback) {
        try {
          await sendMessageWithTimeout(
            {
              text: buttonMessageText,
              footer: footerText,
              interactiveButtons: nativeButtons,
            },
            undefined,
            'media interactiveButtons retry'
          );
          return;
        } catch (retryInteractiveError) {
          console.warn('[WA] media follow-up interactiveButtons retry failed:', retryInteractiveError.message);
        }
      }
    }

    if (legacyButtons.length) {
      try {
        await sendMessageWithTimeout(
          {
            text: buttonMessageText,
            footer: footerText,
            buttons: legacyButtons,
            headerType: 1,
          },
          options,
          'media legacy buttons'
        );
        return;
      } catch (buttonError) {
        if (!shouldStripQuotedFallback) throw buttonError;

        try {
          await sendMessageWithTimeout(
            {
              text: buttonMessageText,
              footer: footerText,
              buttons: legacyButtons,
              headerType: 1,
            },
            undefined,
            'media legacy buttons retry'
          );
          return;
        } catch (retryButtonError) {
          console.warn('[WA] media follow-up legacy buttons retry failed:', retryButtonError.message);
        }
      }
    }

    // If legacy button format is unavailable, still send a text fallback.
    await sendMessageWithTimeout({ text: buttonMessageText }, options, 'media text fallback');
    return;
  }

  const bodyKey = mediaField ? 'caption' : 'text';

  async function sendFinalFallback() {
    if (mediaField) {
      await sendMessageWithTimeout(
        { ...mediaField, caption: bodyText || undefined },
        options,
        'media final fallback'
      );
      return;
    }
    await sendMessageWithTimeout({ text: bodyText || ' ' }, options, 'text final fallback');
  }

  try {
    await relayNativeFlow(bodyText || ' ', footerText);
    return;
  } catch (nativeFlowError) {
    console.warn('[WA] nativeFlow relay failed, trying interactiveButtons:', nativeFlowError.message);
  }

  try {
    await sendMessageWithTimeout(
      {
        ...mediaField,
        [bodyKey]: bodyText || ' ',
        footer: footerText,
        interactiveButtons: nativeButtons,
      },
      options,
      'interactiveButtons send'
    );
    return;
  } catch (error) {
    // Fallback for Baileys variants that do not support interactiveButtons in sendMessage.
    console.warn('[WA] interactiveButtons via sendMessage failed, trying legacy buttons:', error.message);

    if (shouldStripQuotedFallback) {
      try {
        await sendMessageWithTimeout(
          {
            ...mediaField,
            [bodyKey]: bodyText || ' ',
            footer: footerText,
            interactiveButtons: nativeButtons,
          },
          undefined,
          'interactiveButtons retry without quoted'
        );
        return;
      } catch (retryError) {
        console.warn('[WA] interactiveButtons retry without quoted failed:', retryError.message);
      }
    }

    if (!legacyButtons.length) {
      await sendFinalFallback();
      return;
    }

    try {
      await sendMessageWithTimeout(
        {
          ...mediaField,
          text: bodyText || ' ',
          footer: footerText,
          buttons: legacyButtons,
          headerType: 1,
        },
        options,
        'legacy buttons send'
      );
      return;
    } catch (legacyError) {
      if (shouldStripQuotedFallback) {
        try {
          await sendMessageWithTimeout(
            {
              text: bodyText || ' ',
              footer: footerText,
              buttons: legacyButtons,
              headerType: 1,
            },
            undefined,
            'legacy buttons retry'
          );
          return;
        } catch (retryLegacyError) {
          console.warn('[WA] legacy buttons retry without quoted failed:', retryLegacyError.message);
        }
      }

      // Final fallback when mixed media+buttons payload cannot be composed by the WA client.
      if (mediaField) {
        await sendMessageWithTimeout(
          { ...mediaField, caption: bodyText || undefined },
          options,
          'media split fallback'
        );
        await sendMessageWithTimeout(
          {
            text: footerText || 'Choose an option:',
            buttons: legacyButtons,
            headerType: 1,
          },
          options,
          'legacy split fallback'
        );
        return;
      }

      await sendFinalFallback();
      return;
    }
  }
}

module.exports = {
  sendInteractiveButtons,
  toNativeFlowButtons,
};
