/**
 * @fileoverview Helper functions used across the codebase.
 */

export const isHttpRequest = (request: Request): boolean => {
  return request.url.startsWith('http');
};

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return error as Error;
}
