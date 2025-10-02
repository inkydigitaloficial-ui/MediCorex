import { NextRequest, NextResponse } from 'next/server';

export class ErrorHandler {
  static handle(error: any, request: NextRequest): NextResponse {
    console.error('[Middleware Error]', {
      pathname: request.nextUrl.pathname,
      error: error.message,
      stack: error.stack,
    });
    
    // Para erros de autenticação, limpa o cookie e redireciona para o login.
    if (error?.code?.startsWith('auth/')) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('firebaseIdToken');
      return response;
    }
    
    // Para outros erros, redireciona para uma página de erro genérica.
    // Em produção, você pode querer uma página de erro mais amigável.
    const errorUrl = new URL('/error', request.url);
    errorUrl.searchParams.set('message', 'Ocorreu um erro inesperado durante o processamento da sua requisição.');
    
    return NextResponse.redirect(errorUrl);
  }
}
