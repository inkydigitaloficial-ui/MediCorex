import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '../utils/token-utils';
import { RouteUtils } from '../utils/route-utils';
import { ChainResult, MiddlewareContext } from '../types';

export class AuthChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, tenantId } = context;
    const pathname = request.nextUrl.pathname;
    
    if (RouteUtils.isPublicRoute(pathname)) {
      return { shouldContinue: true, context: { ...context, user: null } };
    }
    
    const token = TokenUtils.extractToken(request);
    
    if (RouteUtils.isAuthRoute(pathname)) {
      if (token) {
        const authResult = await TokenUtils.validateToken(request, token, tenantId || undefined);
        if (authResult.isValid) {
          const redirectUrl = new URL(tenantId ? `/_tenants/${tenantId}/dashboard` : '/dashboard', request.url);
          return { 
            shouldContinue: false, 
            response: NextResponse.redirect(redirectUrl) 
          };
        }
      }
      return { shouldContinue: true, context };
    }
    
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      return { 
        shouldContinue: false, 
        response: NextResponse.redirect(loginUrl) 
      };
    }
    
    const authResult = await TokenUtils.validateToken(request, token, tenantId || undefined);
    if (!authResult.isValid) {
      if (authResult.error?.includes('expired') || authResult.error?.includes('revoked')) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('firebaseIdToken');
        return { shouldContinue: false, response };
      }
      const unauthorizedUrl = new URL('/auth/unauthorized', request.url);
      return { shouldContinue: false, response: NextResponse.redirect(unauthorizedUrl) };
    }
    
    // Atualiza o contexto com o usuário e retorna
    context.user = authResult.user;
    return { shouldContinue: true, context };
  }
}
