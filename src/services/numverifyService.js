const NUMVERIFY_BASE_URL = 'https://apilayer.net/api/validate';

function normalizePhoneInput(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';

  return hasPlus ? `+${digits}` : digits;
}

function digitsOnly(value) {
  return String(value || '').replace(/\D+/g, '');
}

class NumverifyService {
  constructor() {
    this.apiKey = String(process.env.NUMVERIFY_API_KEY || '').trim();
    this.timeoutMs = Number(process.env.NUMVERIFY_TIMEOUT_MS || 8000);
    this.cacheTtlMs = Number(process.env.NUMVERIFY_CACHE_TTL_MS || 10 * 60 * 1000);
    this.cache = new Map();
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  buildCacheKey(normalizedInput, countryCode) {
    return `${normalizedInput}|${String(countryCode || '').trim().toUpperCase()}`;
  }

  getCachedValidation(cacheKey) {
    const item = this.cache.get(cacheKey);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return {
      ...item.value,
      cached: true,
    };
  }

  setCachedValidation(cacheKey, value) {
    this.cache.set(cacheKey, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    });

    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  async validatePhoneNumber(input, options = {}) {
    const normalizedInput = normalizePhoneInput(input);
    if (!normalizedInput) {
      return {
        enabled: this.isEnabled(),
        valid: false,
        error: 'Phone number is required',
        normalizedInput: '',
      };
    }

    if (!this.isEnabled()) {
      return {
        enabled: false,
        valid: true,
        source: 'local-fallback',
        normalizedInput,
        normalizedDigits: digitsOnly(normalizedInput),
        note: 'NUMVERIFY_API_KEY is not configured. External validation was skipped.',
      };
    }

    const params = new URLSearchParams({
      access_key: this.apiKey,
      number: normalizedInput,
      format: '1',
    });

    const countryCode = String(options.countryCode || '').trim();
    const cacheKey = this.buildCacheKey(normalizedInput, countryCode);
    const cached = this.getCachedValidation(cacheKey);
    if (cached) {
      return cached;
    }

    if (countryCode) {
      params.set('country_code', countryCode);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${NUMVERIFY_BASE_URL}?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        return {
          enabled: true,
          valid: false,
          error: `NumVerify HTTP ${response.status}`,
          providerBody: bodyText ? bodyText.slice(0, 240) : undefined,
          normalizedInput,
        };
      }

      const data = await response.json();
      const providerError = data?.error;
      if (providerError) {
        return {
          enabled: true,
          valid: false,
          error: providerError?.info || 'NumVerify API error',
          providerCode: providerError?.code,
          normalizedInput,
        };
      }

      const internationalFormat = String(data?.international_format || '').trim();
      const localFormat = String(data?.local_format || '').trim();
      const e164Digits = digitsOnly(internationalFormat || normalizedInput);

      const result = {
        enabled: true,
        source: 'numverify',
        valid: Boolean(data?.valid),
        normalizedInput,
        normalizedDigits: digitsOnly(normalizedInput),
        e164Digits,
        internationalFormat,
        localFormat,
        countryPrefix: String(data?.country_prefix || ''),
        countryCode: String(data?.country_code || ''),
        countryName: String(data?.country_name || ''),
        location: String(data?.location || ''),
        carrier: String(data?.carrier || ''),
        lineType: String(data?.line_type || ''),
      };

      this.setCachedValidation(cacheKey, result);
      return result;
    } catch (error) {
      const isAbort = error?.name === 'AbortError';
      return {
        enabled: true,
        valid: false,
        error: isAbort ? 'NumVerify request timed out' : `NumVerify request failed: ${error.message}`,
        normalizedInput,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = new NumverifyService();
