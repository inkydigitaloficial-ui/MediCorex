
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
      // O token aqui é o cookie de sessão seguro, não um ID token.
      // A validação via API ou SDK Admin é o caminho correto.
      // A lógica de cache pode ser inadequada para cookies de sessão que são revogáveis.
      // Por simplicidade e segurança, vamos validar sempre no servidor.

      // A validação agora é feita pela função `getCurrentUser`, que usa `verifySessionCookie`.
      // Se chegamos aqui, o `getCurrentUser` já foi chamado indiretamente.
      // A lógica de validação de token é implicitamente tratada pela verificação de `user` no middleware.
      // Esta função está se tornando um ponto de potencial confusão.
      // Simplificando: a existência do `user` no contexto já é a validação.
      
      // Para manter a compatibilidade com a `AuthChain` que ainda a chama, vamos delegar
      // a uma API, mas a longo prazo, isso deveria ser refatorado.
      const verifyApiUrl = new URL('/api/auth/verify-token', request.nextUrl.origin);
      
      const response = await fetch(verifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({ token }), // O token aqui é o __session cookie
      });

      if (!response.ok) {
        const data = await response.json();
        return { isValid: false, error: data.error || 'Token validation failed via API' };
      }

      const decodedToken = await response.json();
      
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
   * Extrai o token do cookie '__session'.
   */
  static extractToken(request: NextRequest): string | null {
    return request.cookies.get('__session')?.value || null;
  }
}
