import { isAssetRequest, isDocumentRequest, isLoaderRequest } from "../fetch/match";

export type WorkBoxProps = {
  url: URL;
  request: Request;
  event: Event;
};

export function matchAssetRequest({ request }: WorkBoxProps, assetUrls: string[]) {
  return isAssetRequest(request, assetUrls);
}

export function matchDocumentRequest({ request }: WorkBoxProps) {
  return isDocumentRequest(request);
}

export function matchLoaderRequest({ request }: WorkBoxProps) {
  return isLoaderRequest(request);
}