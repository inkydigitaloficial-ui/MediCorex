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
    '/((?!api/|_next/|_static/|_vercel/|favicon.ico|_tenants).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:9002';
  
  // Remove a porta para o ambiente de desenvolvimento.
  const cleanHostname = hostname.split(':')[0];

  // Tratamento para desenvolvimento (ex: acme.localhost) e produção (ex: acme.meuapp.com)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devSuffix = '.localhost';
  const prodSuffix = `.${rootDomain.split(':')[0]}`;

  let subdomain = null;

  if (isDevelopment) {
    if (cleanHostname.endsWith(devSuffix)) {
      subdomain = cleanHostname.replace(devSuffix, '');
    }
  } else {
    if (hostname.endsWith(`.${rootDomain}`)) {
      subdomain = hostname.replace(`.${rootDomain}`, '');
    }
  }

  // Domínios que não devem ser tratados como tenants
  const nonTenantHosts = ['www', 'app', 'admin', rootDomain.split(':')[0]];
  if (!subdomain || nonTenantHosts.includes(subdomain) || subdomain.includes('.')) {
    return NextResponse.next();
  }

  // Reescreve a URL para a estrutura de tenants interna
  url.pathname = `/_tenants/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
