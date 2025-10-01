import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'localhost:9002';


export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  
  // Remove a porta do hostname em ambiente de desenvolvimento (ex: minha-clinica.localhost:3000)
  const cleanHostname = hostname.replace(/:\d+$/, '');
  
  // Extrai o subdomínio
  const subdomain = cleanHostname.endsWith(`.${ROOT_DOMAIN}`)
    ? cleanHostname.replace(`.${ROOT_DOMAIN}`, '')
    : cleanHostname.endsWith('.localhost')
      ? cleanHostname.replace('.localhost', '')
      : null;

  // Hosts que não são tenants (site principal, www, app, etc.)
  const nonTenantHosts = ['www', ROOT_DOMAIN.split(':')[0], 'app', 'localhost'];
  if (!subdomain || nonTenantHosts.includes(subdomain)) {
    return NextResponse.next();
  }

  // Previne loops de reescrita e permite acesso direto em dev (localhost:3000/_tenants/...)
  if (url.pathname.startsWith('/_tenants')) {
      return NextResponse.next();
  }
  
  // Reescreve a URL para a estrutura de pastas interna
  // Ex: `minha-clinica.fluxosaude.com/agenda` -> `fluxosaude.com/_tenants/minha-clinica/agenda`
  url.pathname = `/_tenants/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
