import { NextRequest, NextResponse } from 'next/server';

export class ErrorHandler {
  static handle(error: any, request: NextRequest): NextResponse {
    console.error('Middleware error:', error);
    
    // Erro de autenticação Firebase
    if (error?.code?.startsWith('auth/')) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('firebaseIdToken');
      return response;
    }
    
    // Erro genérico - página de erro
    const errorUrl = new URL('/error', request.url);
    errorUrl.searchParams.set('message', 'Ocorreu um erro inesperado');
    
    return NextResponse.redirect(errorUrl);
  }
}