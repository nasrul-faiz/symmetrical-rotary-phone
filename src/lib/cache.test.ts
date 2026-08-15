import assert from "node:assert/strict";
import test from "node:test";

import { createTTLCache } from "./cache";

test("returns values before they expire", () => {
  const cache = createTTLCache<number>({ ttlMs: 60_000 });

  cache.set("alpha", 1);

  assert.equal(cache.get("alpha"), 1);
});

test("drops values once their ttl has elapsed", () => {
  const cache = createTTLCache<number>({ ttlMs: 0 });

  cache.set("alpha", 1);

  assert.equal(cache.get("alpha"), undefined);
});
