import React from 'react';
import { useLocation, useMatches } from '@remix-run/react';

/**
 * This hook is used to send navigation events to the service worker.
 * It is to be called in the `root` file of your remix application.
 */
export function useSWEffect() {
  let location = useLocation();
  let matches = useMatches();
  const isMount = React.useRef<boolean>(true);

  function isPromise(p: any): boolean {
    if (typeof p === 'object' && typeof p.then === 'function') {
      return true;
    }

    return false;
  }

  return React.useEffect(() => {
    let mounted = isMount.current;
    isMount.current = false;

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
