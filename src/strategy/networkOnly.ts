import { toError } from '../core/helper.js';
import { CacheStrategy } from './strategy.js';
import { CacheStrategyOptions, FetchListenerEnv } from './types.js';

export interface NetworkOnlyOptions
  extends Omit<CacheStrategyOptions, 'cacheName' | 'matchOptions'> {
  networkTimeoutSeconds?: number;
}

export class NetworkOnly extends CacheStrategy {
  private fetchListenerEnv: FetchListenerEnv;
  private readonly _networkTimeoutSeconds: number;

  constructor(options: NetworkOnlyOptions = {}, env?: FetchListenerEnv) {
    // this is gonna come back and bite me. 
    // I need to sort this out quick though
    //@ts-ignore
    super(options);

    this.fetchListenerEnv = env || {};
    this._networkTimeoutSeconds = options.networkTimeoutSeconds || 10;
  }

  override async _handle(request: Request) {
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // `fetcher` is a custom fetch function that can de defined and passed to the constructor or just regular fetch
    const fetcher = this.fetchListenerEnv.state!.fetcher || fetch;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Network request timed out after ${
              this._networkTimeoutSeconds * 1000
            } seconds`
          )
        );
      }, this._networkTimeoutSeconds * 1000);
    });

    try {
      for (let plugin of this.plugins) {
        if (plugin.requestWillFetch) {
          plugin.requestWillFetch({
            request
          });
        }
      }

      const fetchPromise: Response = await fetcher(request);

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise
      ])) as Response;

      if (response) {
        for (const plugin of this.plugins) {
          if (plugin.fetchDidSucceed) {
            await plugin.fetchDidSucceed({
              request,
              response
            });
          }
        }

        return response;
      }

      // Re-thrown error to be caught by `catch` block
      throw new Error('Network request failed');
    } catch (error) {
      for (const plugin of this.plugins) {
        if (plugin.fetchDidFail) {
          await plugin.fetchDidFail({
            request,
            error: toError(error)
          });
        }
      }

      const headers = { 'X-Remix-Catch': 'yes', 'X-Remix-Worker': 'yes' };

      return new Response(JSON.stringify({ message: 'Network Error' }), {
        status: 500,
        ...(this.isLoader ? { headers } : {})
      });
    }
  }
}
