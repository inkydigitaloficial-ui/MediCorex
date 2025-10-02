import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
