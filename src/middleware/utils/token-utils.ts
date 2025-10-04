
import { NextRequest } from 'next/server';
import { AuthResult } from '../types';

export class TokenUtils {
  /**
   * Valida um token de sessão chamando uma API interna.
   */
  static async validateToken(token: string, headers: Headers): Promise<AuthResult> {
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    try {
      // Constrói a URL absoluta para a rota da API
      const host = headers.get('host');
      const protocol = host?.includes('localhost') ? 'http' : 'https';
      const verifyApiUrl = new URL(`${protocol}://${host}/api/auth/verify-token`);

      const response = await fetch(verifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Encaminha o cookie de sessão para a rota da API
          'Cookie': `__session=${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return { isValid: false, error: data.error || 'Token validation failed via API' };
      }

      const decodedToken = await response.json();
      
      return { isValid: true, user: decodedToken };

    } catch (error: any) {
      console.error('[TokenUtils] Error:', error.message);
      return { isValid: false, error: 'Internal error during token validation' };
    }
  }

  /**
   * Extrai o token do cookie '__session'.
   */
  static extractToken(request: NextRequest): string | null {
    return request.cookies.get('__session')?.value || null;
  }
}
