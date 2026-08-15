export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type TTLCacheOptions = {
  ttlMs: number;
  storage?: Storage | null;
  prefix?: string;
};

export function createTTLCache<T>(options: TTLCacheOptions) {
  const ttlMs = options.ttlMs;
  const prefix = options.prefix ?? "app.cache.v1.";
  const memoryStore = new Map<string, CacheEntry<T>>();
  const storage = options.storage ?? (typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage : null);

  function getStorageKey(key: string) {
    return `${prefix}${key}`;
  }

  function now() {
    return Date.now();
  }

  function read(key: string): T | undefined {
    const storageKey = getStorageKey(key);

    if (storage) {
      try {
        const raw = storage.getItem(storageKey);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as CacheEntry<T>;
        if (parsed.expiresAt <= now()) {
          storage.removeItem(storageKey);
          memoryStore.delete(storageKey);
          return undefined;
        }
        return parsed.value;
      } catch {
        // fall back to in-memory cache
      }
    }

    const memoryEntry = memoryStore.get(storageKey);
    if (!memoryEntry) return undefined;
    if (memoryEntry.expiresAt <= now()) {
      memoryStore.delete(storageKey);
      return undefined;
    }
    return memoryEntry.value;
  }

  function write(key: string, value: T) {
    const storageKey = getStorageKey(key);
    const entry: CacheEntry<T> = { value, expiresAt: now() + ttlMs };

    memoryStore.set(storageKey, entry);

    if (!storage) return;

    try {
      storage.setItem(storageKey, JSON.stringify(entry));
    } catch {
      // ignore storage quota issues
    }
  }

  return {
    get(key: string) {
      return read(key);
    },
    set(key: string, value: T) {
      write(key, value);
    },
    delete(key: string) {
      const storageKey = getStorageKey(key);
      memoryStore.delete(storageKey);
      if (!storage) return;
      storage.removeItem(storageKey);
    },
    clear() {
      memoryStore.clear();
      if (!storage) return;
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i += 1) {
        const storageKey = storage.key(i);
        if (storageKey && storageKey.startsWith(prefix)) {
          toRemove.push(storageKey);
        }
      }
      toRemove.forEach((storageKey) => storage.removeItem(storageKey));
    },
  };
}
