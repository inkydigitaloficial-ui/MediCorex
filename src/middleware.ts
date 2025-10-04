
import { NextRequest, NextResponse } from 'next/server';
import { DomainUtils } from './middleware/utils/domain-utils';
import { RouteUtils } from './middleware/utils/route-utils';
import { AuthChain } from './middleware/chains/auth-chain';
import { TenantChain } from './middleware/chains/tenant-chain';
import { ErrorHandler } from './middleware/handlers/error-handler';
import { MiddlewareContext } from './middleware/types';
import { middlewareConfig } from './middleware/config';

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Ignora rotas de API e assets estáticos para otimizar a performance.
    if (RouteUtils.isStaticAsset(pathname) || pathname.startsWith('/api')) { // Verificação da API movida para cá.
      return NextResponse.next();
    }

    const tenantId = DomainUtils.extractSubdomain(request.headers.get('host'));

    let context: MiddlewareContext = {
      request,
      response: NextResponse.next(),
      tenantId: tenantId,
      user: null, // O usuário será preenchido pela AuthChain
      config: middlewareConfig,
    };
    
    const chains = [
      new AuthChain(),
      new TenantChain(),
    ];

    for (const chain of chains) {
      const result = await chain.execute(context);
      
      if (!result.shouldContinue) {
        return result.response!;
      }
      
      if (result.context) {
        context = { ...context, ...result.context };
      }
    }
    
    return context.response;

  } catch (error) {
    return ErrorHandler.handle(error, request);
  }
}

// Configuração do matcher para definir quais rotas o middleware irá interceptar.
export const config = {
  matcher: [
    /*
     * Faz o match de todas as rotas, exceto as que começam com:
     * - api (rotas de API, tratadas no início do middleware)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone do site)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
