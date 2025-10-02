import { CacheUtils } from './cache-utils';
import { NextRequest } from 'next/server';
import { AuthResult } from '../types';

export class TokenUtils {
  /**
   * Valida um token JWT, primeiro verificando o cache e, em caso de falha,
   * chamando uma API interna para validação segura com o Firebase Admin SDK.
   */
  static async validateToken(request: NextRequest, token: string, tenantId?: string): Promise<AuthResult> {
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    try {
      // 1. Tenta obter o token decodificado do cache.
      const cachedDecodedToken = CacheUtils.get(token);
      if (cachedDecodedToken) {
        return this.validateTenantAccess(cachedDecodedToken, tenantId);
      }

      // 2. Se não estiver no cache, chama a API de verificação interna.
      const verifyApiUrl = new URL('/api/auth/verify-token', request.nextUrl.origin);
      
      const response = await fetch(verifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Passa o cookie original para a API, caso necessário para outras validações.
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { isValid: false, error: data.error || 'Token validation failed via API' };
      }

      const decodedToken = await response.json();
      
      // 3. Armazena o token decodificado no cache para futuras requisições.
      CacheUtils.set(token, decodedToken);
      
      // 4. Valida se o usuário tem acesso ao tenant específico.
      return this.validateTenantAccess(decodedToken, tenantId);

    } catch (error: any) {
      console.error('[TokenUtils] Error:', error.message);
      return { isValid: false, error: 'Internal error during token validation' };
    }
  }

  /**
   * Valida se os claims do token decodificado permitem acesso ao tenantId fornecido.
   */
  private static validateTenantAccess(decodedToken: any, tenantId?: string): AuthResult {
    // Se não há um tenantId na URL (domínio principal), a validação de acesso ao tenant não é necessária.
    if (!tenantId) {
      return { isValid: true, user: decodedToken };
    }

    const userTenants = decodedToken.tenants as { [key: string]: string } | undefined;
    const hasAccess = userTenants && Object.prototype.hasOwnProperty.call(userTenants, tenantId);

    if (!hasAccess) {
      return { isValid: false, error: `User does not have claims for tenant ${tenantId}` };
    }

    return {
      isValid: true,
      user: decodedToken
    };
  }

  /**
   * Extrai o token do cookie 'firebaseIdToken'.
   */
  static extractToken(request: NextRequest): string | null {
    return request.cookies.get('firebaseIdToken')?.value || null;
  }
}
