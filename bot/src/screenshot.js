import axios from 'axios';

const SCREENSHOT_ENDPOINT = 'https://image.thum.io/get/';

function normalizeTargetUrl(value) {
  const input = String(value || '').trim();
  if (!input) {
    return '';
  }

  try {
    const parsed = new URL(input.includes('://') ? input : `https://${input}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

async function fetchScreenshotBuffer(url, options = {}) {
  const fetcher = typeof options.fetcher === 'function' ? options.fetcher : axios.get;
  const response = await fetcher(`${SCREENSHOT_ENDPOINT}${url}`, {
    responseType: 'arraybuffer',
    timeout: 30000,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  return Buffer.from(response.data);
}

export async function buildScreenshotCommandReply(target, options = {}) {
  const targetUrl = normalizeTargetUrl(target);
  if (!targetUrl) {
    return {
      type: 'screenshot',
      imageBuffer: null,
      mimetype: 'image/png',
      caption: 'Sila isi link yang sah. Contoh: .ss https://example.com',
    };
  }

  const fetcher = typeof options.fetchScreenshotBuffer === 'function'
    ? options.fetchScreenshotBuffer
    : fetchScreenshotBuffer;

  try {
    const imageBuffer = await fetcher(targetUrl, options);
    return {
      type: 'screenshot',
      imageBuffer,
      mimetype: 'image/png',
      caption: targetUrl,
    };
  } catch (error) {
    return {
      type: 'screenshot',
      imageBuffer: null,
      mimetype: 'image/png',
      caption: `Gagal ambil screenshot untuk: ${targetUrl}`,
      error,
    };
  }
}
