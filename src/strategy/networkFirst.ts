import { toError } from '../core/helper.js';
import { CacheStrategy } from './strategy.js';
import { CacheStrategyOptions, FetchListenerEnv } from './types.js';

export interface NetworkFirstOptions extends CacheStrategyOptions {
  networkTimeoutSeconds?: number;
}

export class NetworkFirst extends CacheStrategy {
  private fetchListenerEnv: FetchListenerEnv;
  private readonly _networkTimeoutSeconds: number;

  constructor(options: NetworkFirstOptions, env: FetchListenerEnv = {}) {
    super(options);

    this.fetchListenerEnv = env;
    // Default timeout of 10 seconds
    this._networkTimeoutSeconds = options.networkTimeoutSeconds || 10;
  }

  override async _handle(request: Request) {
    const cache = await caches.open(this.cacheName);

    try {
      const response = await this.fetchAndCache(request);

      for (const plugin of this.plugins) {
        if (plugin.fetchDidSucceed)
          await plugin.fetchDidSucceed({ request, response });
      }

      return response;
    } catch (error) {
      let err = toError(error);

      for (const plugin of this.plugins) {
        if (plugin.fetchDidFail)
          await plugin.fetchDidFail({ request, error: err });
      }

      const cachedResponse = await cache.match(request, this.matchOptions);

      if (cachedResponse) {
        cachedResponse.headers.set('X-Remix-Worker', 'yes');
        return cachedResponse;
      }

      // throw error;
      return new Response(JSON.stringify({ message: 'Network Error' }), {
        status: 500,
        headers: { 'X-Remix-Catch': 'yes', 'X-Remix-Worker': 'yes' }
      });
    }
  }

  private async fetchAndCache(request: Request): Promise<Response> {
    const cache = await caches.open(this.cacheName);

    const timeoutPromise = this._networkTimeoutSeconds
      ? new Promise<Response>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Network timed out after ${this._networkTimeoutSeconds} seconds`
              )
            );
          }, this._networkTimeoutSeconds * 1000);
        })
      : null;

    const fetcher = this.fetchListenerEnv.state?.fetcher || fetch;

    const fetchPromise = fetcher(request);

    const response = timeoutPromise
      ? await Promise.race([fetchPromise, timeoutPromise])
      : await fetchPromise;

    await cache.put(request, response.clone());

    return response;
  }
}
