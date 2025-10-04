
import { NextRequest, NextResponse } from 'next/server';

// Caminhos que devem ser ignorados pelo middleware (assets, API routes, etc.)
const STATIC_PATHS = ['/api', '/_next/static', '/_next/image', '/favicon.ico'];

/**
 * Middleware consolidado e simplificado para lidar com o roteamento multi-tenant.
 *
 * Responsabilidades:
 * 1. Extrair o `tenantId` (subdomínio) do host da requisição.
 * 2. Se um `tenantId` for encontrado, reescrever a URL para a estrutura de grupo de rotas interna
 *    (ex: `acme.dominio.com/dashboard` se torna `/(tenants)/acme/dashboard`).
 * 3. Ignorar assets estáticos e rotas de API para otimizar a performance.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora assets estáticos e rotas de API.
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Extrai o host da requisição.
  const host = request.headers.get('host');
  if (!host) {
    // Se não houver host, não há como determinar o subdomínio.
    return NextResponse.next();
  }

  // Extrai o subdomínio (tenantId).
  // Esta lógica é mais robusta para lidar com localhost e domínios de produção.
  // Ex: 'acme.localhost:9002' -> ['acme']
  // Ex: 'app.medicorex.app' -> ['app']
  const parts = host.split('.');
  const isLocalhost = host.includes('localhost');
  const tenantId = (isLocalhost && parts.length > 1) || (!isLocalhost && parts.length > 2) ? parts[0] : null;


  // Se um tenantId foi encontrado e não é 'www', reescreve a URL.
  if (tenantId && tenantId !== 'www') {
    // Reescreve para o grupo de rotas `(tenants)`. Pastas com `_` são ignoradas pelo roteador.
    const newPath = `/(tenants)/${tenantId}${pathname}`;
    const newUrl = new URL(newPath, request.url);
    return NextResponse.rewrite(newUrl);
  }

  // Para o domínio principal ou se não houver subdomínio, continua a requisição.
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware em todas as rotas relevantes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
