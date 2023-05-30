import React from 'react';
import { useLocation, useMatches } from '@remix-run/react';

let isMount = true;

/**
 * This hook is used to send navigation events to the service worker.
 * It is to be called in the `root` file of your remix application.
 */
export function useSWEffect(): void {
  let location = useLocation();
  let matches = useMatches();

  function isPromise(p: any): boolean {
    if (p && typeof p === 'object' && typeof p.then === 'function') {
      return true;
    }

    return false;
  }

  React.useEffect(() => {
    let mounted = isMount;
    isMount = false;

    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: 'REMIX_NAVIGATION',
          isMount: mounted,
          location,
          matches: matches.filter((route) => {
            if (route.data) {
              return (
                Object.values(route.data!).filter((elem) => {
                  return isPromise(elem);
                }).length === 0
              );
            }
            return true;
          }),
          manifest: window.__remixManifest
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: 'REMIX_NAVIGATION',
            isMount: mounted,
            location,
            matches: matches.filter((route) => {
              if (route.data) {
                return (
                  Object.values(route.data!).filter((elem) => {
                    return isPromise(elem);
                  }).length === 0
                );
              }
              return true;
            }),
            manifest: window.__remixManifest
          });
        };
        navigator.serviceWorker.addEventListener('controllerchange', listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            listener
          );
        };
      }
    }

    return () => {};
  }, [location, matches]);
}
