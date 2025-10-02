
import { NextResponse } from 'next/server';
import { RewriteHandler } from '../handlers/rewrite-handler';
import { ChainResult, MiddlewareContext } from '../types';
import { RouteUtils } from '../utils/route-utils';

export class TenantChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, tenantId, user } = context;

    // Se não há um tenantId (acesso ao domínio principal), a chain não faz nada.
    if (!tenantId) {
      // Se o usuário está logado no domínio principal e tenta acessar uma rota protegida,
      // ele deve ser direcionado para configurar sua clínica se ainda não tiver uma.
      if (user && !RouteUtils.isPublicRoute(request.nextUrl.pathname)) {
          const userTenants = user.tenants as { [key: string]: string } | undefined;
          const hasTenants = userTenants && Object.keys(userTenants).length > 0;
          
          if (!hasTenants && request.nextUrl.pathname !== '/auth/create-clinic') {
              return {
                  shouldContinue: false,
                  response: NextResponse.redirect(new URL('/auth/create-clinic', request.url))
              };
          }
      }

      return { shouldContinue: true, context };
    }
    
    // Se há um tenantId, mas o usuário não está autenticado, o AuthChain já deveria ter
    // redirecionado. Continuamos para que a página de login do tenant seja exibida.
    if (!user) {
        // A página de login específica do tenant é reescrita para ser renderizada
        const rewrittenUrl = RewriteHandler.applyTenantRewrite(request, tenantId);
        if (request.nextUrl.pathname.endsWith('/auth/login')) {
            return { shouldContinue: false, response: rewrittenUrl };
        }
        // Para outras rotas do tenant, redireciona para a URL de login canônica.
        const loginUrl = new URL(`/auth/login`, request.nextUrl);
        return { shouldContinue: false, response: NextResponse.redirect(loginUrl) };
    }
    
    // Verifica se o usuário tem permissão para o tenantId do subdomínio.
    const userTenants = user.tenants as { [key: string]: string } | undefined;
    const roleInTenant = userTenants?.[tenantId];

    if (!roleInTenant) {
        // Usuário logado, mas tentando acessar um tenant ao qual não pertence.
        return {
            shouldContinue: false,
            response: NextResponse.redirect(new URL('/auth/unauthorized', request.url))
        };
    }

    // Lógica para trial expirado
    if (roleInTenant === 'owner_trial_expired' && !request.nextUrl.pathname.startsWith('/billing') && !request.nextUrl.pathname.startsWith('/escolha-seu-plano')) {
      const billingUrl = new URL(`/_tenants/${tenantId}/billing`, request.url);
      return { 
        shouldContinue: false, 
        response: NextResponse.rewrite(billingUrl) 
      };
    }

    // Se tudo estiver certo, reescreve a URL para a estrutura interna do Next.js.
    const response = RewriteHandler.applyTenantRewrite(request, tenantId, user.uid);
    return { 
      shouldContinue: false, // Interrompe para retornar a resposta com o rewrite
      response: response,
      context
    };
  }
}
