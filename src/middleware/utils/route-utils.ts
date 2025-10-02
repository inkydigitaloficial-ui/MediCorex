import { middlewareConfig } from '../config';

export class RouteUtils {
  static isPublicRoute(pathname: string): boolean {
    return middlewareConfig.security.publicRoutes.has(pathname);
  }

  static isAuthRoute(pathname: string): boolean {
    return middlewareConfig.security.authRoutes.has(pathname);
  }

  static isApiRoute(pathname: string): boolean {
    return pathname.startsWith('/api');
  }

  static isStaticAsset(pathname: string): boolean {
    return pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('/favicon.ico');
  }
}