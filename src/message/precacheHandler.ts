import { AssetsManifest } from '@remix-run/dev';
import { MessageHandler } from './message.js';
import { logger } from '../core/logger.js';
import { EntryRoute } from '@remix-run/react/dist/routes.js';

export class PrecacheHandler extends MessageHandler {
  override async _handleMessage(
    event: ExtendableMessageEvent,
    state: Record<string, any> = {}
  ): Promise<void> {
    let DATA_CACHE, DOCUMENT_CACHE, ASSET_CACHE;

    DATA_CACHE = 'remix-data';
    DOCUMENT_CACHE = 'remix-document';
    ASSET_CACHE = 'remix-asset';

    if (state!['caches'] !== undefined)
      ({ DATA_CACHE, DOCUMENT_CACHE, ASSET_CACHE } = state!['caches']);

    // console.debug('sync manifest');
    const cachePromises: Map<string, Promise<void>> = new Map();
    const [dataCache, documentCache, assetCache] = await Promise.all([
      caches.open(DATA_CACHE),
      caches.open(DOCUMENT_CACHE),
      caches.open(ASSET_CACHE)
    ]);
    const manifest: AssetsManifest = event.data.manifest;
    const routes = Object.values(manifest.routes);

    for (const route of routes) {
      if (route.id.includes('$')) {
        // console.debug('parametrized route', route.id);
        continue;
      }

      cacheRoute(route);
    }

    await Promise.all(cachePromises.values());

    function cacheRoute(route: EntryRoute) {
      const pathname = getPathname(route);
      if (route.hasLoader) {
        cacheLoaderData(route);
      }

      if (route.module) {
        cachePromises.set(route.module, cacheAsset(route.module));
      }

      if (route.imports) {
        for (const assetUrl of route.imports) {
          logger.debug(
            route.index,
            route.parentId,
            route.imports,
            route.module
          );
          if (cachePromises.has(assetUrl)) {
            continue;
          }

          cachePromises.set(assetUrl, cacheAsset(assetUrl));
        }
      }

      cachePromises.set(
        pathname,
        documentCache.add(pathname).catch((error) => {
          // console.debug(`Failed to cache document ${pathname}:`, error);
        })
      );
    }

    function cacheLoaderData(route: EntryRoute) {
      const pathname = getPathname(route);
      const params = new URLSearchParams({ _data: route.id });
      const search = `?${params.toString()}`;
      const url = pathname + search;
      if (!cachePromises.has(url)) {
        // console.debug('Caching data for', url);
        cachePromises.set(
          url,
          dataCache.add(url).catch((error) => {
            // console.debug(`Failed to cache data for ${url}:`, error);
          })
        );
      }
    }

    async function cacheAsset(assetUrl: string) {
      if (await assetCache.match(assetUrl)) {
        return;
      }

      console.debug('Caching asset', assetUrl);
      return assetCache.add(assetUrl).catch((error) => {
        // console.debug(`Failed to cache asset ${assetUrl}:`, error);
      });
    }

    function getPathname(route: EntryRoute) {
      if (route.index) return '/';

      let pathname = '';
      if (route.path && route.path.length > 0) {
        pathname = '/' + route.path;
      }
      if (route.parentId) {
        const parentPath = getPathname(manifest.routes[route.parentId]);
        if (parentPath) {
          pathname = parentPath + pathname;
        }
      }
      return pathname;
    }
  }
}
