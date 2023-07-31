import type {
  CachedResponseWillBeUsedCallback,
  HandlerDidErrorCallback,
  CachedResponseWillBeUsedCallbackParam,
  FetchDidSucceedCallback,
  FetchDidSucceedCallbackParam
} from 'workbox-core/types.js';

/* Plugins */

export type RemixLoaderPlugin = {
  cachedResponseWillBeUsed: CachedResponseWillBeUsedCallback;
  handlerDidError: HandlerDidErrorCallback;
  fetchDidSucceed: FetchDidSucceedCallback;
};

// Loader Plugin
export const remixLoaderPlugin: RemixLoaderPlugin = {
  fetchDidSucceed: async ({ response }: FetchDidSucceedCallbackParam) => {
    return response;
  },
  cachedResponseWillBeUsed: async ({
    cachedResponse
  }: CachedResponseWillBeUsedCallbackParam) => {
    cachedResponse?.headers.set('X-Remix-Worker', 'yes');
    return cachedResponse;
  },
  handlerDidError: async () => {
    return new Response(JSON.stringify({ message: 'Network Error' }), {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Remix-Catch': 'yes',
        'X-Remix-Worker': 'yes'
      }
    });
  }
};
