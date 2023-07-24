import { logger } from '../core/logger.js';
import { MessageHandler } from './message.js';
import type { MessageHandlerParams } from './message.js';

export interface RemixNavigationHandlerOptions extends MessageHandlerParams {
  dataCacheName: string;
  documentCacheName: string;
}

export class RemixNavigationHandler extends MessageHandler {
  dataCacheName: string;
  documentCacheName: string;

  constructor({
    plugins,
    dataCacheName,
    documentCacheName,
    state
  }: RemixNavigationHandlerOptions) {
    super({ plugins, state });

    this.dataCacheName = dataCacheName;
    this.documentCacheName = documentCacheName;
    this._handleMessage = this._handleMessage.bind(this);
  }

  override async _handleMessage(
    event: ExtendableMessageEvent
  ): Promise<void> {
    const { data } = event;
    let DATA, PAGES;
    
    DATA = this.dataCacheName;
    PAGES = this.documentCacheName;
    
    this.runPlugins("messageDidReceive", {
      event,
    })
    
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
              logger.debug('Caching data for:', url);
              
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
