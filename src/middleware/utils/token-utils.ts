import { CacheUtils } from './cache-utils';
import { NextRequest } from 'next/server';
import { AuthResult } from '../types';

export class TokenUtils {
  static async validateToken(request: NextRequest, token: string, tenantId?: string): Promise<AuthResult> {
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    try {
      // Cache ainda é verificado primeiro no Edge
      const cached = CacheUtils.getToken(token);
      if (cached) {
        return this.validateTenantAccess(cached, tenantId);
      }

      // Chamada para a API interna para validação
      const verifyApiUrl = new URL('/api/auth/verify-token', request.nextUrl.origin);
      
      const response = await fetch(verifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '' // Passa cookies para a API route
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { isValid: false, error: data.error || 'Invalid token' };
      }

      const decodedToken = await response.json();
      
      // Armazena em cache o token decodificado
      CacheUtils.setToken(token, decodedToken);
      
      return this.validateTenantAccess(decodedToken, tenantId);

    } catch (error: any) {
      console.error('Token validation fetch error:', error);
      return { isValid: false, error: 'Token validation failed' };
    }
  }

  private static validateTenantAccess(decodedToken: any, tenantId?: string): AuthResult {
    if (!tenantId) {
      // Se não há tenant, o token é válido por si só
      return { isValid: true, user: decodedToken };
    }

    const userTenants = decodedToken.tenants as { [key: string]: string } | undefined;
    const roleInTenant = userTenants?.[tenantId];

    if (!roleInTenant) {
      return { isValid: false, error: `No access to tenant ${tenantId}` };
    }

    return {
      isValid: true,
      user: decodedToken
    };
  }

  static extractToken(request: NextRequest): string | null {
    return request.cookies.get('firebaseIdToken')?.value || null;
  }
}
