/**
 * Contains global types for this sub-module
 */

import { StrategyPlugin } from '../plugins/interfaces/strategyPlugin.js';

export interface CacheQueryMatchOptions
  extends Omit<CacheQueryOptions, 'cacheName' | 'ignoreMethod'> {}

export interface CacheStrategyOptions {
  cacheName: string;
  plugins?: StrategyPlugin[];
  isLoader?: boolean;
  matchOptions?: CacheQueryMatchOptions;
}

export interface FetchListenerEnvState extends Record<string, any> {
  fetcher?: typeof fetch;
}

export interface FetchListenerEnv {
  event?: FetchEvent;
  state?: FetchListenerEnvState;
}
