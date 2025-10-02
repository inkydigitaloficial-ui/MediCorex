import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    return NextResponse.json(decodedToken, { status: 200 });
  } catch (error: any) {
    console.error('API Token validation error:', error);
    
    let errorMessage = 'Invalid token';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expired';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Token revoked';
    }

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

// This forces the route to be dynamic and run on the Node.js runtime.
export const dynamic = 'force-dynamic';
