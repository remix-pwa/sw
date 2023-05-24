import { isHttpRequest } from '../core/helper.js';
import { StrategyPlugin } from '../plugins/interfaces/strategyPlugin.js';
import { CacheQueryMatchOptions, CacheStrategyOptions } from './types.js';

export type StrategyHandlerParams = {
  request: Request;
  options?: CacheQueryMatchOptions;
};

export abstract class CacheStrategy {
  protected cacheName: string;
  protected plugins: StrategyPlugin[];
  protected isLoader: boolean;
  protected matchOptions?: CacheQueryMatchOptions;

  // todo: (ShafSpecs) Fix this!
  constructor({
    cacheName,
    isLoader = false,
    plugins = [],
    matchOptions = {}
  }: CacheStrategyOptions) {
    this.cacheName = cacheName;
    this.isLoader = isLoader;
    this.plugins = plugins;
    this.matchOptions = matchOptions;
  }

  protected abstract _handle(request: Request): Promise<Response>;

  // Can you return null or a custom, handled error???
  async handle(request: Request): Promise<Response> {
    if (!isHttpRequest(request)) {
      // (ShafSpecs) todo: Handle this better. Can't be throwing errors
      // all over the user app if the SW intercepts an extension request
      // throw new Error("The request is not an HTTP request");

      // (ShafSpecs) todo: also improve on this
      return new Response('Not a HTTP request', { status: 403 });
    }

    return this._handle(request);
  }
}
