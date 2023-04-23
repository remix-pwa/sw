import { CacheStrategy } from '../strategy/strategy';

export function isMethod(request: Request, methods: string[]): boolean {
  return methods.includes(request.method.toLowerCase());
}

export const handleFetchRequest = (
  request: Request,
  strategy: CacheStrategy
) => {
  return strategy.handle(request);
};
