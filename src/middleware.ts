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
    '/((?!api/|_next/|_static/|_vercel/|favicon.ico).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:9002';
  
  const cleanHostname = hostname.split(':')[0];

  const isDevelopment = process.env.NODE_ENV === 'development';
  const devSuffix = '.localhost';

  let subdomain = null;

  if (isDevelopment) {
    if (cleanHostname.endsWith(devSuffix)) {
      subdomain = cleanHostname.replace(devSuffix, '');
    } else if (cleanHostname === 'localhost') {
        const pathTenant = url.pathname.match(/^\/_tenants\/([^\/]+)/);
        if (pathTenant) {
            return NextResponse.next();
        }
    }
  } else {
    if (hostname.endsWith(`.${rootDomain}`)) {
      subdomain = hostname.replace(`.${rootDomain}`, '');
    }
  }

  const nonTenantHosts = ['www', 'app', 'admin', rootDomain.split(':')[0]];
  if (url.pathname.startsWith('/_tenants') || !subdomain || nonTenantHosts.includes(subdomain) || subdomain.includes('.')) {
    return NextResponse.next();
  }

  url.pathname = `/_tenants/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
