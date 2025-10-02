import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get('session');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(sessionCookie.value, secret);
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-claims', JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth|api/auth|$).*)',
  ],
};