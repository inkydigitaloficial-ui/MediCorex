import { adminAuth } from '@/lib/firebase/admin';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, tenants } = decodedToken;

    const claims = {
      uid,
      tenants,
    };

    const secret = new TextEncoder().encode(JWT_SECRET);
    const jwt = await new SignJWT(claims)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error verifying token or creating session:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
