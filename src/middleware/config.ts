// src/middleware/config.ts
export const middlewareConfig = {
  // Domínio raiz da aplicação em produção.
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000',
  
  // Rotas que não exigem autenticação.
  publicRoutes: [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/create-clinic', // Permitir acesso à criação da clínica
    '/auth/unauthorized',
    '/escolha-seu-plano',
    '/payment/success'
  ],

  // Rotas relacionadas à autenticação.
  authRoutes: [
    '/auth/login',
    '/auth/signup',
    '/auth/create-clinic',
    '/auth/logout'
  ],

  // Prefixo para rotas de API que devem ser ignoradas pelo middleware.
  apiPrefix: '/api',
};
