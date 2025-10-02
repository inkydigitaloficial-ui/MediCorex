// src/middleware/config.ts
export const middlewareConfig = {
  domains: {
    development: 'localhost:3000',
    production: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'medicorex.app'
  },
  
  security: {
    reservedSubdomains: new Set([
      'www', 'api', 'admin', 'app', 'dashboard', 'auth',
      'cdn', 'static', 'assets', 'mail', 'blog', 'shop',
      'support', 'help', 'docs', 'status', 'dev', 'staging', 'test'
    ]),
    publicRoutes: new Set([
      '/', '/home', '/about', '/pricing', '/contact',
      '/auth/login', '/auth/signup', '/auth/forgot-password',
      '/auth/reset-password', '/auth/unauthorized',
      '/terms', '/privacy', '/features'
    ]),
    authRoutes: new Set([
      '/auth/login', '/auth/signup', '/auth/forgot-password',
      '/auth/reset-password', '/auth/logout'
    ])
  },
  
  cache: {
    enabled: process.env.NODE_ENV === 'production',
    ttl: 5 * 60 * 1000,
    maxSize: 1000
  },
  
  features: {
    developmentMode: process.env.NODE_ENV === 'development',
    allowMultiLevelSubdomains: false,
    enableDebugHeaders: process.env.NODE_ENV === 'development'
  }
} as const;