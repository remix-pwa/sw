import { logger } from "../../core/logger";
import { CacheQueryMatchOptions } from "../../strategy/types";
import { StrategyPlugin } from "../interfaces/strategyPlugin";

class ExpirationPlugin implements StrategyPlugin {
  private readonly maxEntries: number;
  private readonly maxAgeSeconds: number;

  constructor({
    maxEntries,
    maxAgeSeconds,
  }: { maxEntries?: number; maxAgeSeconds?: number } = {}) {
    this.maxAgeSeconds = maxAgeSeconds || 30 * 24 * 3_600;
    this.maxEntries = maxEntries || Infinity;
  }

  async cachedResponseWillBeUsed(options: {
    cacheName: string;
    request: Request;
    matchOptions: CacheQueryMatchOptions;
    cachedResponse: Response;
    event?: ExtendableEvent | undefined;
  }): Promise<Response | null> {
    const now = Date.now();

    const expirationDate = options.cachedResponse.headers.get("X-Expires");

    if (expirationDate) {
      const elapsedTime = new Date(expirationDate).getTime() - now;

      if (elapsedTime < 0) {
        const cache = await caches.open(options.cacheName);
        await cache.delete(options.request, options.matchOptions);
        console.log("cacheResponseWillBeUsed", options.request.url);
        return options.cachedResponse;
      }

      options.cachedResponse.headers.set(
        "X-Access-Time",
        new Date(now).toUTCString()
      );

      return options.cachedResponse;
    } else {
      options.cachedResponse.headers.set(
        "X-Access-Time",
        new Date(now).toUTCString()
      );

      return options.cachedResponse;
    }
  }

  async cacheWillUpdate(options: {
    response: Response;
    request: Request;
    event?: ExtendableEvent | undefined;
  }): Promise<Response | null> {
    const now = Date.now();
    console.log("cacheWillUpdate", options.request.url);

    let newResponse = options.response.clone();
    newResponse.headers.set(
      "X-Expires",
      new Date(now + this.maxAgeSeconds * 1_000).toUTCString()
    );

    return newResponse;
  }

  async cacheDidUpdate(options: {
    cacheName: string;
    request: Request;
    oldResponse?: Response | undefined;
    newResponse: Response;
    event?: ExtendableEvent | undefined;
  }) {
    const cache = await caches.open(options.cacheName);

    const keys = await cache.keys();

    console.error(keys.length, this.maxEntries);

    if (keys.length > this.maxEntries) {
      logger.debug("Cache is full, removing oldest entry");
      this.removeLRUEntry(options.newResponse, options.cacheName);
    }
  }

  async removeLRUEntry(response: Response, cacheName: string) {
    const cache = await caches.open(cacheName);

    const keys = await cache.keys();

    let oldestEntry: Response | null = null;

    for (const key of keys) {
      const entry = await cache.match(key);

      if (!entry) {
        continue;
      }

      if (!oldestEntry) {
        oldestEntry = entry;
        continue;
      }

      const oldestEntryDate = oldestEntry.headers.get("X-Access-Time");
      const entryDate = entry.headers.get("X-Access-Time");

      if (!oldestEntryDate || !entryDate) {
        continue;
      }

      if (new Date(oldestEntryDate).getTime() > new Date(entryDate).getTime()) {
        oldestEntry = entry;
      }
    }

    if (oldestEntry) {
      await cache.delete(oldestEntry.url);
    }
  }
}