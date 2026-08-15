export type PdfStoragePayload = {
  filename?: string;
  mimeType?: string;
  data: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
};

export type NormalizedPdfStoragePayload = {
  filename: string;
  mimeType: string;
  data: string;
  size: number;
  createdAt: string;
  meta: Record<string, unknown>;
};

export function normalizePdfStoragePayload(payload: PdfStoragePayload): NormalizedPdfStoragePayload {
  if (typeof payload?.data !== 'string' || payload.data.trim() === '') {
    throw new Error('PDF data is required');
  }

  const dataUrlMatch = payload.data.match(/^data:(.+);base64,(.+)$/i);
  const rawData = dataUrlMatch ? dataUrlMatch[2] : payload.data;
  const normalizedData = rawData.trim();

  if (!normalizedData) {
    throw new Error('PDF data is required');
  }

  let decodedSize = 0;
  try {
    decodedSize = Buffer.from(normalizedData, 'base64').length;
  } catch {
    throw new Error('PDF data must be valid base64');
  }

  const filename = (payload.filename || 'document.pdf').trim() || 'document.pdf';
  const mimeType = (payload.mimeType || 'application/pdf').trim() || 'application/pdf';
  const createdAt = payload.createdAt || new Date().toISOString();
  const meta = payload.meta && typeof payload.meta === 'object' && !Array.isArray(payload.meta)
    ? payload.meta
    : {};

  return {
    filename,
    mimeType,
    data: normalizedData,
    size: decodedSize,
    createdAt,
    meta,
  };
}
