
import { NextRequest, NextResponse } from 'next/server';
import { DomainUtils } from './middleware/utils/domain-utils';
import { RouteUtils } from './middleware/utils/route-utils';
import { AuthChain } from './middleware/chains/auth-chain';
import { TenantChain } from './middleware/chains/tenant-chain';
import { ErrorHandler } from './middleware/handlers/error-handler';
import { MiddlewareContext } from './middleware/types';
import { middlewareConfig } from './middleware/config';
import { getCurrentUser } from './utils/session'; // Importa a função de sessão do servidor

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Ignora rotas de API e assets estáticos para otimizar a performance.
    if (RouteUtils.isStaticAsset(pathname) || RouteUtils.isApiRoute(pathname)) {
      return NextResponse.next();
    }

    const tenantId = DomainUtils.extractSubdomain(request.headers.get('host'));
    const authContext = await getCurrentUser(tenantId); // Fonte de verdade para autenticação

    let context: MiddlewareContext = {
      request,
      response: NextResponse.next(),
      tenantId: tenantId,
      user: authContext?.user || null,
      config: middlewareConfig,
    };
    
    // A AuthChain agora pode ser simplificada, pois a validação de sessão principal já ocorreu.
    // Vamos manter por enquanto para a lógica de redirecionamento.
    const chains = [
      new AuthChain(),
      new TenantChain(),
    ];

    for (const chain of chains) {
      // Passa o contexto atualizado (com 'user' já preenchido) para a cadeia.
      const result = await chain.execute({ ...context, user: authContext?.user || null });
      
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
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone do site)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
