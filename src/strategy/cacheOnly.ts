import { CacheStrategy } from './strategy.js';

export class CacheOnly extends CacheStrategy {
  override async _handle(request: Request) {
    const cache = await caches.open(this.cacheName);

    let response = await cache.match(request, {
      ignoreSearch: this.matchOptions?.ignoreSearch ?? false,
      ignoreVary: this.matchOptions?.ignoreVary ?? false
    });

    if (!response) {
      // throw new Error(`Unable to find response in cache.`);
      const headers = { 'X-Remix-Catch': 'yes', 'X-Remix-Worker': 'yes' };

      return new Response(JSON.stringify({ message: 'Not Found' }), {
        status: 404,
        ...(this.isLoader ? { headers } : {})
      });
    }

    for (const plugin of this.plugins) {
      if (plugin.cacheWillExpire) {
        await plugin.cacheWillExpire({ cache });
      }
    }

    if (this.isLoader) {
      response.headers.set('X-Remix-Worker', 'yes');
    }

    return response;
  }
}
