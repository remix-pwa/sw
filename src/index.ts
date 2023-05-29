// core
export { logger } from './core/logger';

// fetch
export { isMethod, handleFetchRequest } from './fetch/fetch';
export {
  isAssetRequest,
  isDocumentRequest,
  isLoaderRequest,
  matchRequest
} from './fetch/match';
export type { MatchRequest, MatchResponse } from './fetch/match';

// message
export { MessageHandler } from './message/message';
export { PrecacheHandler } from './message/precacheHandler';
export { RemixNavigationHandler } from './message/remixNavigationHandler';

export type { RemixNavigationHandlerOptions } from './message/remixNavigationHandler';
export type { PrecacheHandlerOptions } from './message/precacheHandler';
export type { MessageHandlerParams } from './message/message';

export type { MessageEnv } from './message/types';

// plugins
export { StrategyPlugin } from './plugins/interfaces/strategyPlugin';
export type { MessagePlugin } from './plugins/interfaces/messagePlugin';

export { ExpirationPlugin } from './plugins/cache/expirationPlugin';

// react
export { loadServiceWorker } from './react/loader';
export { unregisterServiceWorker } from './react/registration'
export type { LoadServiceWorkerOptions } from './react/loader';
export { useSWEffect } from './react/useSWEffect';

// strategy
export { CacheStrategy } from './strategy/strategy';
export { CacheFirst } from './strategy/cacheFirst';
export { CacheOnly } from './strategy/cacheOnly';
export { NetworkFirst } from './strategy/networkFirst';
export { NetworkOnly } from './strategy/networkOnly';
// export { StaleWhileRevalidate } from './strategy/staleWhileRevalidate';

export type { StrategyHandlerParams } from './strategy/strategy';
export type { NetworkFirstOptions } from './strategy/networkFirst';
export type { NetworkOnlyOptions } from './strategy/networkOnly';

// workbox
export { remixLoaderPlugin } from './workbox/plugins/loaderPlugin';
export { matchAssetRequest, matchDocumentRequest, matchLoaderRequest } from './workbox/main';

export type { RemixLoaderPlugin } from './workbox/plugins/loaderPlugin';
export type { WorkBoxProps } from './workbox/main';
