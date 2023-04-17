import { CacheStrategy } from "./strategy.js";

export class CacheFirst extends CacheStrategy {
  override async _handle(request: Request) {
    let response = await this.getFromCache(request);

    if (!response) {
      response = await this.getFromNetwork(request);

      if (response) {
        await this.updateCache(request, response.clone());
      }
    }

    const headers = { "X-Remix-Catch": "yes", "X-Remix-Worker": "yes" };

    return response
      ? response
      : new Response("Not found", {
          status: 404,
          headers: this.isLoader ? headers : {},
        });
  }

  private async getFromCache(request: Request): Promise<Response | null> {
    const cache = await caches.open(this.cacheName);
    const cachedResponse = await cache.match(request, {
      ignoreVary: this.matchOptions?.ignoreVary || false,
      ignoreSearch: this.matchOptions?.ignoreSearch || false,
    });

    if (cachedResponse) {
      return cachedResponse;
    }

    return null;
  }

  private async getFromNetwork(request: Request): Promise<Response | null> {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        for (const plugin of this.plugins) {
          if (plugin.fetchDidSucceed) {
            await plugin.fetchDidSucceed({ request, response });
          }
        }

        return response;
      }
    } catch (error) {
      if (error instanceof Error) {
        // logger.error("Error while fetching", request.url, ":", error);
        return this.handleFetchError(request, error);
      } else {
        // logger.error("Error while fetching", request.url, ":", error);
        const err = error as Error;
        return this.handleFetchError(request, err);
      }
    }

    return null;
  }

  private async updateCache(
    request: Request,
    response: Response
  ): Promise<void> {
    const cache = await caches.open(this.cacheName);
    const oldResponse = await cache.match(request);
    await cache.put(request, response.clone());
    await this.removeExpiredEntries(cache);
    this.notifyCacheUpdated(request, response, oldResponse);
  }

  private async handleFetchError(
    request: Request,
    error: Error
  ): Promise<Response | null> {
    for (const plugin of this.plugins) {
      if (plugin.fetchDidFail) {
        await plugin.fetchDidFail({ request, error });
      }
    }

    const cachedResponse = await caches.match(request, {
      ignoreVary: this.matchOptions?.ignoreVary || false,
      ignoreSearch: this.matchOptions?.ignoreSearch || false,
    });

    if (cachedResponse) {
      this.isLoader && cachedResponse.headers.set("X-Remix-Worker", "yes");
      return cachedResponse;
    }

    return null;
  }

  private async removeExpiredEntries(cache: Cache): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.cacheWillExpire) {
        await plugin.cacheWillExpire({ cache });
      }
    }
  }

  private async notifyCacheUpdated(
    request: Request,
    response: Response,
    oldResponse: Response | undefined
  ): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.cacheDidUpdate)
        await plugin.cacheDidUpdate({
          request,
          oldResponse: oldResponse,
          newResponse: response,
          cacheName: this.cacheName,
        });
    }
  }
}