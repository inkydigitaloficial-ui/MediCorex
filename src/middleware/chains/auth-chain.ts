import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '../utils/token-utils';
import { RouteUtils } from '../utils/route-utils';
import { ChainResult, MiddlewareContext } from '../types';

export class AuthChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, tenantId } = context;
    const pathname = request.nextUrl.pathname;
    
    // 1. Rotas públicas não precisam de verificação de token.
    // Simplesmente enriquecemos o contexto para saber que não há usuário.
    if (RouteUtils.isPublicRoute(pathname)) {
      return { shouldContinue: true, context: { ...context, user: null } };
    }
    
    const token = TokenUtils.extractToken(request);
    
    // 2. Lógica para rotas de autenticação (ex: /auth/login)
    if (RouteUtils.isAuthRoute(pathname)) {
      // Se o usuário já tem um token válido, ele não deveria estar na página de login.
      // Redirecionamos para o dashboard.
      if (token) {
        const authResult = await TokenUtils.validateToken(request, token, tenantId || undefined);
        if (authResult.isValid) {
          const redirectUrl = new URL(tenantId ? '/dashboard' : '/auth/setup-account', request.url);
          if (tenantId) {
             const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
             redirectUrl.host = `${tenantId}.${rootDomain}`;
          }
          return { 
            shouldContinue: false, 
            response: NextResponse.redirect(redirectUrl) 
          };
        }
      }
      // Se não há token ou o token é inválido, permite o acesso à rota de autenticação.
      return { shouldContinue: true, context };
    }
    
    // 3. Lógica para rotas protegidas
    if (!token) {
      // Se não há token, redireciona para o login.
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return { 
        shouldContinue: false, 
        response: NextResponse.redirect(loginUrl) 
      };
    }
    
    // Valida o token usando a API interna.
    const authResult = await TokenUtils.validateToken(request, token, tenantId || undefined);
    
    if (!authResult.isValid) {
        // Se o token expirou ou foi revogado, limpa o cookie e redireciona para o login.
      if (authResult.error?.includes('expired') || authResult.error?.includes('revoked')) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('firebaseIdToken');
        return { shouldContinue: false, response };
      }
       // Se o usuário não tem acesso ao tenant específico, redireciona para não autorizado.
      const unauthorizedUrl = new URL('/auth/unauthorized', request.url);
      return { shouldContinue: false, response: NextResponse.redirect(unauthorizedUrl) };
    }
    
    // Se a validação foi bem-sucedida, enriquece o contexto com os dados do usuário.
    context.user = authResult.user;
    return { shouldContinue: true, context };
  }
}
