
import { NextRequest, NextResponse } from 'next/server';

// Caminhos que devem ser ignorados pelo middleware (assets, API routes, etc.)
const STATIC_PATHS = ['/api', '/_next/static', '/_next/image', '/favicon.ico'];

/**
 * Middleware consolidado e simplificado para lidar com o roteamento multi-tenant.
 *
 * Responsabilidades:
 * 1. Extrair o `tenantId` (subdomínio) do host da requisição.
 * 2. Se um `tenantId` for encontrado, reescrever a URL para a estrutura interna de diretório do Next.js
 *    (ex: `acme.dominio.com/dashboard` se torna `/tenants/acme/dashboard`).
 * 3. Ignorar assets estáticos e rotas de API para otimizar a performance.
 *
 * Toda a lógica de autenticação é delegada para os Server Components (layouts/páginas)
 * para evitar erros de 'Invalid URL' no Edge Runtime.
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
  // Esta lógica funciona para `acme.localhost:3000` e `acme.meusite.com`.
  // O slice(0, -2) remove os dois últimos segmentos do domínio (ex: 'medicorex' e 'app').
  const tenantId = host.split('.').slice(0, -2).join('.');

  // Se um tenantId foi encontrado e não é o domínio principal (www), reescreve a URL.
  if (tenantId && tenantId !== 'www') {
    const newPath = `/_tenants/${tenantId}${pathname}`;
    // Usamos new URL(newPath, request.url) que é a forma mais segura de construir a URL de reescrita.
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
