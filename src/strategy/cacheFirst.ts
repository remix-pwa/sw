import { CacheStrategy } from './strategy.js';

export class CacheFirst extends CacheStrategy {
  override async _handle(request: Request) {
    let response = await this.getFromCache(request);

    if (!response) {
      response = await this.getFromNetwork(request);

      if (response) {
        await this.updateCache(request, response.clone());
      }
    }

    const headers = { 'X-Remix-Catch': 'yes', 'X-Remix-Worker': 'yes' };

    return response
      ? response
      : new Response('Not found', {
          status: 404,
          headers: this.isLoader ? headers : {}
        });
  }

  private async getFromCache(request: Request): Promise<Response | null> {
    const cache = await caches.open(this.cacheName);

    let cachedResponse = await cache.match(request, {
      ignoreVary: this.matchOptions?.ignoreVary || false,
      ignoreSearch: this.matchOptions?.ignoreSearch || false
    });

    if (cachedResponse) {
      let res: Response | null = cachedResponse.clone();

      for (const plugin of this.plugins) {
        if (plugin.cachedResponseWillBeUsed) {
          res = await plugin.cachedResponseWillBeUsed({
            cacheName: this.cacheName,
            request,
            cachedResponse,
            matchOptions: this.matchOptions || {}
          });

          if (!res) {
            break;
          }
        }
      }

      return res;
    }

    return null;
  }

  private async getFromNetwork(request: Request): Promise<Response | null> {
    let req: Request = request.clone();

    for (const plugin of this.plugins) {
      if (plugin.requestWillFetch) {
        req = await plugin.requestWillFetch({ request: req });
      }
    }

    let response = await fetch(req).catch((err) => {
      for (const plugin of this.plugins) {
        if (plugin.fetchDidFail) {
          plugin.fetchDidFail({
            request: req.clone(),
            error: err
          });
        }
      }
    });

    if (response) {
      for (const plugin of this.plugins) {
        if (plugin.fetchDidSucceed) {
          response = await plugin.fetchDidSucceed({ request: req, response });
        }
      }

      return response;
    }

    return null;
  }

  private async updateCache(
    request: Request,
    response: Response
  ): Promise<void> {
    const cache = await caches.open(this.cacheName);
    const oldResponse = await cache.match(request);

    let newResponse: Response | null = response.clone();

    for (const plugin of this.plugins) {
      if (plugin.cacheWillUpdate) {
        newResponse = await plugin.cacheWillUpdate({
          response: newResponse.clone(),
          request
        });

        if (!newResponse) {
          break;
        }
      }
    }

    if (newResponse) {
      await cache.put(request, newResponse.clone());

      for (const plugin of this.plugins) {
        if (plugin.cacheDidUpdate) {
          plugin.cacheDidUpdate({
            cacheName: this.cacheName,
            request,
            oldResponse,
            newResponse
          });
        }
      }
    }
  }
}
