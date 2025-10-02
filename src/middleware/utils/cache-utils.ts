import { middlewareConfig } from '../config';

const tokenCache = new Map<string, { token: any; expires: number }>();

export class CacheUtils {
  static getToken(token: string) {
    if (!middlewareConfig.cache.enabled) return null;

    const entry = tokenCache.get(token);
    if (entry && entry.expires > Date.now()) {
      return entry.token;
    }

    tokenCache.delete(token);
    return null;
  }

  static setToken(token: string, decodedToken: any) {
    if (!middlewareConfig.cache.enabled) return;

    if (tokenCache.size >= middlewareConfig.cache.maxSize) {
      const oldestKey = tokenCache.keys().next().value;
      tokenCache.delete(oldestKey);
    }

    const expires = Date.now() + middlewareConfig.cache.ttl;
    tokenCache.set(token, { token: decodedToken, expires });
  }
}