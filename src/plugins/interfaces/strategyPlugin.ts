// todo: Add more typings to the callbacks. This is quite ugly, I wasn't in the mood for
// writing all the types for the callbacks. ==TODO==

import { CacheQueryMatchOptions } from '../../strategy/types.js';

export declare interface StrategyPlugin {
  // Called before a request is made to the network or cache.
  // Can be used to modify the request or return a different request, for example.
  /**
   * Called whenever a request is about to go to the network. Useful when you need 
   * to change the Request just before it goes to the network.
   */
  requestWillFetch?: (options: {
    request: Request;
    event?: ExtendableEvent;
  }) => Promise<Request>;

  // Called before a response is stored in the cache.
  /**
   * Called before a Response is used to update a cache. In this method, 
   * the response can be changed before it's added to the cache, or you can 
   * return null to avoid updating the cache entirely.
   */
  cacheWillUpdate?: (options: {
    response: Response;
    request: Request;
    event?: ExtendableEvent;
  }) => Promise<Response | null>;

  // Called after a response is stored in the cache.
  /**
   * Called when a new entry is added to a cache or if an existing entry is updated. 
   * Plugins that use this method may be useful when you want to perform an action after a cache update.
   */
  cacheDidUpdate?: (options: {
    cacheName: string;
    request: Request;
    oldResponse?: Response;
    newResponse: Response;
    event?: ExtendableEvent;
  }) => Promise<void>;

  // Called before a cached response is used to respond to a fetch event.
  /**
   * This is called just before a response from a cache is used, which allows you to examine that 
   * response. At this point in time, you could either return a different response, or return null (fetch from server at all costs?).
   */
  cachedResponseWillBeUsed?: (options: {
    cacheName: string;
    request: Request;
    matchOptions: CacheQueryMatchOptions;
    cachedResponse: Response;
    event?: ExtendableEvent;
  }) => Promise<Response | null>;

  // Called after a fetch request is made and a response is received from the network, but before it's returned to the application.
  // Can be used to modify the response, for example.
  /**
   * Called whenever a network request succeeds, regardless of the HTTP response code.
   */
  fetchDidSucceed?: (options: {
    request: Request;
    response: Response;
    event?: ExtendableEvent;
  }) => Promise<Response>;

  // Called when a request fails to be fetched and stored in the cache.
  // Can be used to register a background sync task, for example.
  /**
   * Called when a network request fails, most likely due to an absence of network connectivity, 
   * and will not fire when the browser has a network connection, but receives an error (for example, 404 Not Found).
   */
  fetchDidFail?: (options: {
    request: Request;
    error: Error;
    event?: ExtendableEvent;
  }) => Promise<void | null | undefined>;
}
