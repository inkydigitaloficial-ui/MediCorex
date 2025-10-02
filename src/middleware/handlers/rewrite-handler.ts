import { NextRequest, NextResponse } from 'next/server';
import { middlewareConfig } from '../config';

export class RewriteHandler {
  static applyTenantRewrite(request: NextRequest, tenantId: string, userId?: string): NextResponse {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    
    // Não reescreve rotas que já estão na estrutura de tenant
    if (pathname.startsWith('/_tenants/')) {
      return NextResponse.next();
    }
    
    // Aplica rewrite
    url.pathname = `/_tenants/${tenantId}${pathname}`;
    
    const response = NextResponse.rewrite(url);
    
    // Headers de debug (apenas desenvolvimento)
    if (middlewareConfig.features.enableDebugHeaders) {
      response.headers.set('x-tenant-id', tenantId);
      if (userId) {
        response.headers.set('x-user-id', userId); // Agora preenchido!
      }
    }
    
    return response;
  }
}
