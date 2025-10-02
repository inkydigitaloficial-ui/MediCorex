/**
 * Simulação de um cache em memória para tokens decodificados.
 * Em um ambiente de produção real, considere usar uma solução mais robusta como Redis ou Memcached
 * se o middleware estiver rodando em múltiplas instâncias.
 */

// Define a estrutura de uma entrada no cache.
interface CacheEntry {
  decodedToken: any;
  expires: number; // Timestamp de expiração
}

const tokenCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 500;

export class CacheUtils {
  /**
   * Obtém um token decodificado do cache se ele existir e não estiver expirado.
   */
  static get(token: string): any | null {
    const entry = tokenCache.get(token);

    if (entry && entry.expires > Date.now()) {
      return entry.decodedToken;
    }

    // Se o token expirou, remove do cache.
    if (entry) {
      tokenCache.delete(token);
    }
    
    return null;
  }

  /**
   * Adiciona um token decodificado ao cache com um tempo de vida (TTL).
   */
  static set(token: string, decodedToken: any): void {
    // Limpa o cache se atingir o tamanho máximo para evitar memory leaks.
    if (tokenCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = tokenCache.keys().next().value;
      tokenCache.delete(oldestKey);
    }

    const expires = Date.now() + CACHE_TTL;
    tokenCache.set(token, { decodedToken, expires });
  }
}
