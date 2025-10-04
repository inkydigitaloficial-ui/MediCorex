
import { NextRequest, NextResponse } from 'next/server';
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
    if (RouteUtils.isStaticAsset(pathname) || RouteUtils.isApiRoute(pathname)) {
      return NextResponse.next();
    }

    const host = request.headers.get('host');
    const tenantId = host ? host.split('.')[0] : null;

    let context: MiddlewareContext = {
      request,
      response: NextResponse.next(),
      tenantId: tenantId,
      user: null, // O middleware não lida mais com dados do usuário.
      config: middlewareConfig,
    };
    
    // As cadeias agora são mais simples e focadas no roteamento.
    const chains = [
      new AuthChain(),
      new TenantChain(),
    ];

    for (const chain of chains) {
      const result = await chain.execute(context);
      
      if (!result.shouldContinue) {
        return result.response!;
      }
      
      // O contexto é passado, mas raramente modificado, pois a lógica foi movida.
      if (result.context) {
        context = { ...context, ...result.context };
      }
    }
    
    // Se chegou ao fim, significa que é uma rota pública no domínio principal.
    return context.response;

  } catch (error) {
    return ErrorHandler.handle(error, request);
  }
}

// A configuração do matcher permanece a mesma.
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
