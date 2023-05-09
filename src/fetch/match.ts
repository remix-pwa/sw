import { isMethod } from './fetch.js';

export function isAssetRequest(
  request: Request,
  assetUrls: string[] = ['/build/', '/icons']
): boolean {
  return (
    isMethod(request, ['get']) &&
    assetUrls.some((publicPath) => request.url.includes(publicPath))
  );
}

export function isDocumentRequest(request: Request): boolean {
  return isMethod(request, ['get']) && request.mode === 'navigate';
}

export function isLoaderRequest(request: Request): string | false | null {
  const url = new URL(request.url);
  return isMethod(request, ['get']) && url.searchParams.get('_data');
}

export type MatchResponse = 'loader' | 'document' | 'asset' | null;
export type MatchRequest = (
  request: Request,
  assetUrls?: string[]
) => MatchResponse;

export const matchRequest: MatchRequest = (
  request: Request,
  assetUrls = ['/build/', '/icons']
): MatchResponse => {
  if (isAssetRequest(request, assetUrls)) {
    return 'asset';
  } else if (isLoaderRequest(request)) {
    return 'loader';
  } else if (isDocumentRequest(request)) {
    return 'document';
  } else {
    return null;
  }
};
