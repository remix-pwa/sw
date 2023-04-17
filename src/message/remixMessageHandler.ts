import { logger } from '../core/logger.js';
import { MessageHandler } from './message.js';

export class RemixMessageHandler extends MessageHandler {
  async _handleMessage(
    event: ExtendableMessageEvent,
    state: Record<string, any>
  ): Promise<void> {
    const { data } = event;
    const { DATA, PAGES } = state['caches'];

    let cachePromises: Map<string, Promise<void>> = new Map();

    if (data.type === 'REMIX_NAVIGATION') {
      let { isMount, location, matches, manifest } = data;
      let documentUrl = location.pathname + location.search + location.hash;

      let [dataCache, documentCache, existingDocument] = await Promise.all([
        caches.open(DATA),
        caches.open(PAGES),
        caches.match(documentUrl)
      ]);

      if (!existingDocument || !isMount) {
        // debug("Caching document for", documentUrl);
        cachePromises.set(
          documentUrl,
          documentCache.add(documentUrl).catch((error) => {
            logger.error(`Failed to cache document for ${documentUrl}:`, error);
          })
        );
      }

      if (isMount) {
        for (let match of matches) {
          if (manifest.routes[match.id].hasLoader) {
            let params = new URLSearchParams(location.search);
            params.set('_data', match.id);
            let search = params.toString();
            search = search ? `?${search}` : '';
            let url = location.pathname + search + location.hash;
            if (!cachePromises.has(url)) {
              logger.log("Caching data for", url);
              cachePromises.set(
                url,
                dataCache.add(url).catch((error) => {
                  logger.error(`Failed to cache data for ${url}:`, error);
                })
              );
            }
          }
        }
      }
    }

    await Promise.all(cachePromises.values());
  }
}
