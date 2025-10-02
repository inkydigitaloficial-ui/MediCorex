import { middlewareConfig } from '../config';

export class RouteUtils {
  /**
   * Verifica se o pathname corresponde a uma rota pública.
   */
  static isPublicRoute(pathname: string): boolean {
    return middlewareConfig.publicRoutes.some(route => pathname === route);
  }

  /**
   * Verifica se o pathname corresponde a uma rota de autenticação.
   */
  static isAuthRoute(pathname: string): boolean {
    return middlewareConfig.authRoutes.some(route => pathname === route);
  }

  /**
   * Verifica se o pathname corresponde a uma rota de API.
   */
  static isApiRoute(pathname: string): boolean {
    return pathname.startsWith(middlewareConfig.apiPrefix);
  }

  /**
   * Verifica se o pathname corresponde a um asset estático do Next.js.
   */
  static isStaticAsset(pathname: string): boolean {
    return pathname.startsWith('/_next') || pathname.includes('/favicon.ico');
  }
}
