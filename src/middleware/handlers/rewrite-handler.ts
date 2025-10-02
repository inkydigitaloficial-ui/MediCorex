import { NextRequest, NextResponse } from 'next/server';

export class RewriteHandler {
  /**
   * Reescreve a URL para a estrutura interna de tenants do Next.js.
   * Ex: `app.dominio.com/dashboard` -> `app.dominio.com/_tenants/app/dashboard`
   */
  static applyTenantRewrite(request: NextRequest, tenantId: string, userId?: string): NextResponse {
    const url = request.nextUrl.clone();
    const { pathname } = url;
    
    // Evita reescrever URLs que já estão no formato correto.
    if (pathname.startsWith(`/_tenants/`)) {
      return NextResponse.next();
    }
    
    // Reescreve a URL para o diretório do tenant.
    url.pathname = `/_tenants/${tenantId}${pathname === '/' ? '' : pathname}`;
    
    const response = NextResponse.rewrite(url);
    
    // Adiciona headers de debug para facilitar a depuração em desenvolvimento.
    response.headers.set('x-middleware-rewrite', url.pathname);
    response.headers.set('x-tenant-id', tenantId);
    if (userId) {
      response.headers.set('x-user-id', userId);
    }
    
    return response;
  }
}
