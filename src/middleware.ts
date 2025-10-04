
import { NextRequest, NextResponse } from 'next/server';
import { RouteUtils } from './middleware/utils/route-utils';
import { DomainUtils } from './middleware/utils/domain-utils';
import { RewriteHandler } from './middleware/handlers/rewrite-handler';

/**
 * Middleware Simplificado
 *
 * Responsabilidades:
 * 1. Ignorar assets estáticos e rotas de API.
 * 2. Extrair o `tenantId` do subdomínio.
 * 3. Se um `tenantId` existir, reescrever a URL para a estrutura de diretório `/_tenants/[tenantId]`.
 *
 * A lógica de autenticação e redirecionamento para login foi movida para `src/app/_tenants/[tenantId]/layout.tsx`
 * para evitar erros de 'Invalid URL' no Edge runtime.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignora rotas de API e assets estáticos para otimizar a performance.
  if (RouteUtils.isStaticAsset(pathname) || RouteUtils.isApiRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Extrai o subdomínio.
  const host = request.headers.get('host')!;
  const tenantId = DomainUtils.getSubdomain(host);

  // 3. Se houver um tenantId, reescreve a URL.
  if (tenantId) {
    return RewriteHandler.applyTenantRewrite(request, tenantId);
  }

  // Para o domínio principal e outras rotas, continua sem modificação.
  return NextResponse.next();
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
