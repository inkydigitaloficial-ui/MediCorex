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
    const { pathname, searchParams } = request.nextUrl;

    // Ignora rotas de API e assets estáticos para otimizar a performance.
    if (RouteUtils.isStaticAsset(pathname) || RouteUtils.isApiRoute(pathname)) {
      return NextResponse.next();
    }
    
    // Extrai o tenantId do subdomínio e cria o contexto inicial.
    const tenantId = DomainUtils.extractSubdomain(request.headers.get('host') || '');
    let context: MiddlewareContext = {
      request,
      response: NextResponse.next(),
      tenantId,
      config: middlewareConfig
    };
    
    // Define a sequência de cadeias (chains) a serem executadas.
    const chains = [
      new AuthChain(),
      new TenantChain(),
    ];

    // Executa as cadeias em sequência.
    for (const chain of chains) {
      const result = await chain.execute(context);
      
      // Se a cadeia retornar uma resposta (redirect, rewrite), a execução é interrompida.
      if (!result.shouldContinue) {
        return result.response!;
      }
      
      // Atualiza o contexto com os novos dados para a próxima cadeia.
      if (result.context) {
        context = { ...context, ...result.context };
      }
    }
    
    // Se todas as cadeias permitirem, a requisição continua.
    return context.response;

  } catch (error) {
    // Captura qualquer erro inesperado e retorna uma resposta de erro padronizada.
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
     * Isso garante que o middleware não rode em requisições desnecessárias.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
