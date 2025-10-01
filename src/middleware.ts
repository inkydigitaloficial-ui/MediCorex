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
    '/((?!api/|_next/|_static/|_vercel/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host');

  // For local development, the host is 'subdomain.localhost:port'.
  // In production, you'd replace 'localhost:9002' with your actual root domain.
  const rootDomain = 'localhost:9002';
  
  let subdomain = '';
  if (host && host.endsWith(rootDomain)) {
    subdomain = host.replace(`.${rootDomain}`, '');
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // If there's no subdomain or it's 'www', show the main landing page.
  if (!subdomain || subdomain === 'www' || subdomain === rootDomain.split(':')[0]) {
    return NextResponse.next();
  }

  // Rewrite to the /_tenants/[tenant] route
  if (subdomain) {
    return NextResponse.rewrite(new URL(`/_tenants/${subdomain}${path}`, req.url));
  }

  return NextResponse.next();
}
