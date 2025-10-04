
import { NextRequest, NextResponse } from 'next/server';
import { RouteUtils } from '../utils/route-utils';
import { ChainResult, MiddlewareContext } from '../types';

/**
 * Cadeia de Autenticação Simplificada
 *
 * Responsabilidades:
 * 1. Permitir acesso a rotas públicas.
 * 2. Se o usuário estiver tentando acessar uma rota protegida SEM um cookie de sessão,
 *    redirecioná-lo para a página de login.
 * 3. Se o usuário estiver logado e tentar acessar uma rota de autenticação (ex: /login),
 *    redirecioná-lo para o dashboard do seu primeiro tenant.
 *
 * Esta cadeia NÃO valida mais o token. A validação é feita no Server Component (layout).
 */
export class AuthChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request } = context;
    const pathname = request.nextUrl.pathname;
    const sessionCookie = request.cookies.get('__session')?.value;

    // 1. Permitir acesso irrestrito a rotas públicas.
    if (RouteUtils.isPublicRoute(pathname)) {
      return { shouldContinue: true, context };
    }

    // 2. Se for uma rota de autenticação (ex: /auth/login)
    if (RouteUtils.isAuthRoute(pathname)) {
      // Se o usuário já tem uma sessão, redireciona para a home,
      // onde a lógica de redirect para o tenant/dashboard ocorrerá.
      if (sessionCookie) {
        return { 
          shouldContinue: false, 
          response: NextResponse.redirect(new URL('/', request.url)) 
        };
      }
      // Se não tem sessão, permite o acesso à página de login/cadastro.
      return { shouldContinue: true, context };
    }

    // 3. Para todas as outras rotas (protegidas)
    if (!sessionCookie) {
      // Se não há cookie de sessão, redireciona para o login.
      // O subdomínio na URL garantirá que o login aconteça no contexto do tenant correto.
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return { 
        shouldContinue: false, 
        response: NextResponse.redirect(loginUrl) 
      };
    }

    // Se há um cookie de sessão, a cadeia continua. A validação ocorrerá no layout.
    return { shouldContinue: true, context };
  }
}
