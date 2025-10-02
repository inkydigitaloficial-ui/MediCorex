import { NextRequest, NextResponse } from 'next/server';
import { AuthChain } from './middleware/chains/auth-chain';
import { TenantChain } from './middleware/chains/tenant-chain';
import { ErrorHandler } from './middleware/handlers/error-handler';
import { DomainUtils } from './middleware/utils/domain-utils';
import { RouteUtils } from './middleware/utils/route-utils';
import { MiddlewareContext } from './middleware/types';

// Inicializa as chains
const authChain = new AuthChain();
const tenantChain = new TenantChain();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RouteUtils.isApiRoute(pathname) || RouteUtils.isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  try {
    // 1. SETUP DO CONTEXTO INICIAL
    const hostname = request.headers.get('host') || '';
    const tenantId = DomainUtils.extractSubdomain(hostname);
    
    const context: MiddlewareContext = {
      request,
      response: NextResponse.next(),
      tenantId: tenantId,
      user: null,
      config: {}
    };

    // 2. CHAIN DE AUTENTICAÇÃO
    const authResult = await authChain.execute(context);
    if (!authResult.shouldContinue) {
      return authResult.response!;
    }

    // 3. CHAIN DE LÓGICA DO TENANT
    const tenantResult = await tenantChain.execute(context);
    if (!tenantResult.shouldContinue) {
      return tenantResult.response!;
    }
    
    return tenantResult.response || context.response || NextResponse.next();

  } catch (error) {
    return ErrorHandler.handle(error, request);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)(/)?',
  ],
};
