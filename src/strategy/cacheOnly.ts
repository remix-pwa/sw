import { CacheStrategy } from './strategy.js';

// todo: Should include a way to cache everything at once when the service worker gets loaded
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
    } else {
      let modifiedResponse: Response | null = response.clone();

      for (const plugin of this.plugins) {
        if (plugin.cachedResponseWillBeUsed) {
          modifiedResponse = await plugin.cachedResponseWillBeUsed({
            cacheName: this.cacheName,
            matchOptions: this.matchOptions || {},
            request,
            cachedResponse: response.clone()
          });
        }
      }

      if (!modifiedResponse) {
        // throw new Error(`Unable to find response in cache.`);
        const headers = { 'X-Remix-Catch': 'yes', 'X-Remix-Worker': 'yes' };

        return new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          ...(this.isLoader ? { headers } : {})
        });
      }

      if (this.isLoader) {
        modifiedResponse.headers.set('X-Remix-Worker', 'yes');
      }

      return modifiedResponse;
    }
  }
}
