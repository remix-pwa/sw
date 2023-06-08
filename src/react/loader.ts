/// <reference lib="WebWorker" />

import type { AssetsManifest } from '@remix-run/dev';
import { logger } from '../core/logger.js';

declare global {
  interface Window {
    __remixManifest: AssetsManifest;
  }
}

export type LoadServiceWorkerOptions = {
  scope?: string;
  serviceWorkerUrl?: string;
};

/**
 * Load service worker in `entry.client` when the client gets hydrated.
 *
 * All parameters are optional.
 *
 * @param {string} LoadServiceWorkerOptions.scope - Scope of the service worker.
 * @param {string} LoadServiceWorkerOptions.serviceWorkerUrl - URL of the service worker.
 *
 * ```ts
 * loadServiceWorker({
 *  scope: "/",
 *  serviceWorkerUrl: "/entry.worker.js"
 * })
 * ```
 */
export function loadServiceWorker(
  options: LoadServiceWorkerOptions = {
    scope: '/',
    serviceWorkerUrl: '/entry.worker.js'
  }
) {
  if ('serviceWorker' in navigator) {
    async function register() {
      try {
        await navigator.serviceWorker
          //@ts-ignore
          .register(options.serviceWorkerUrl, {
            scope: options.scope
          })
          .then(() => navigator.serviceWorker.ready)
          .then(() => {
            logger.debug('Syncing manifest...');
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SYNC_REMIX_MANIFEST',
                manifest: window.__remixManifest
              });
            } else {
              navigator.serviceWorker.addEventListener(
                'controllerchange',
                () => {
                  logger.debug('Syncing manifest...');
                  navigator.serviceWorker.controller?.postMessage({
                    type: 'SYNC_REMIX_MANIFEST',
                    manifest: window.__remixManifest
                  });
                }
              );
            }
          });
      } catch (error) {
        // console.error('Service worker registration failed', error);
      }
    }

    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      register();
    } else {
      window.addEventListener('load', register);
    }
  }
}
