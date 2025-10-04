
# Visão Geral do Projeto

Este documento fornece uma visão geral da arquitetura e estrutura do projeto, com foco especial no sistema de middleware e no fluxo de autenticação multi-tenant. Ele detalha a arquitetura final e documenta a jornada de depuração para resolver erros complexos relacionados a subdomínios, redirecionamentos e renderização no Next.js.

## Estrutura de Arquivos e Pastas (Atualizada)

A seguir, a árvore de diretórios simplificada, refletindo a arquitetura final que adotamos:

```
.
├── src/
│   ├── app/
│   │   ├── (public)/              // Rotas públicas (landing page, preços, etc.), não agrupadas formalmente.
│   │   ├── (tenants)/
│   │   │   └── [tenantId]/         // Grupo de rotas para o tenant (ex: /dashboard)
│   │   │       ├── dashboard/
│   │   │       └── ... (outras rotas do tenant)
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── ... (rotas de API para logout, etc.)
│   │   ├── auth/                    // Rotas de autenticação (login, signup)
│   │   └── ...
│   ├── components/
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   ├── middleware.ts             // <-- PONTO DE ENTRADA ÚNICO E SIMPLIFICADO
│   ├── types/
│   └── utils/
│       └── session.ts            // <-- Lógica de sessão segura no servidor
├── firebase.json
├── firestore.rules
└── package.json
```

## Arquitetura de Middleware e Autenticação (Versão Final)

O sistema de middleware foi drasticamente simplificado para aumentar a robustez e eliminar erros complexos. O padrão inicial com múltiplas cadeias e handlers foi substituído por uma arquitetura enxuta e alinhada com as melhores práticas do Next.js App Router.

**A responsabilidade agora é dividida entre o Middleware e os Server Components (Layouts).**

### 1. Middleware (`src/middleware.ts`)

O middleware agora tem uma **única e exclusiva responsabilidade**: reescrever a URL com base no subdomínio. Ele não lida mais com autenticação, cookies ou redirecionamentos. Isso o torna extremamente rápido, eficiente e à prova de erros de construção de URL.

**Funcionamento:**

1.  A requisição chega (ex: `acme.dominio.com/dashboard`).
2.  O middleware ignora rotas de API e arquivos estáticos (`/api`, `/_next`, etc.).
3.  Ele extrai o `tenantId` (`acme`) do subdomínio do host.
4.  Se um `tenantId` é encontrado, ele **reescreve silenciosamente** a URL para o grupo de rotas interno: `/(tenants)/acme/dashboard`.
5.  O Next.js então processa a requisição como se ela fosse para a pasta `src/app/(tenants)/[tenantId]/dashboard/page.tsx`, acionando o layout e a página corretos.

Isso isola a lógica de roteamento multi-tenant em um único ponto, de forma eficiente e sem efeitos colaterais.

**Código Completo do `middleware.ts` (Final):**

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Caminhos que devem ser ignorados pelo middleware (assets, API routes, etc.)
const STATIC_PATHS = ['/api', '/_next/static', '/_next/image', '/favicon.ico'];

/**
 * Middleware consolidado e simplificado para lidar com o roteamento multi-tenant.
 *
 * Responsabilidades:
 * 1. Extrair o `tenantId` (subdomínio) do host da requisição.
 * 2. Se um `tenantId` for encontrado, reescrever a URL para a estrutura de grupo de rotas interna
 *    (ex: `acme.dominio.com/dashboard` se torna `/(tenants)/acme/dashboard`).
 * 3. Ignorar assets estáticos e rotas de API para otimizar a performance.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora assets estáticos e rotas de API.
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Extrai o host da requisição.
  const host = request.headers.get('host');
  if (!host) {
    // Se não houver host, não há como determinar o subdomínio.
    return NextResponse.next();
  }

  // Extrai o subdomínio (tenantId).
  // Esta lógica é mais robusta para lidar com localhost e domínios de produção.
  // Ex: 'acme.localhost:9002' -> ['acme']
  // Ex: 'app.medicorex.app' -> ['app']
  const parts = host.split('.');
  const isLocalhost = host.includes('localhost');
  const tenantId = (isLocalhost && parts.length > 1) || (!isLocalhost && parts.length > 2) ? parts[0] : null;

  // Se um tenantId foi encontrado e não é 'www', reescreve a URL.
  if (tenantId && tenantId !== 'www') {
    // Reescreve para o grupo de rotas `(tenants)`. Pastas com `()` são ignoradas pelo roteador.
    const newPath = `/(tenants)/${tenantId}${pathname}`;
    const newUrl = new URL(newPath, request.url);
    return NextResponse.rewrite(newUrl);
  }

  // Para o domínio principal ou se não houver subdomínio, continua a requisição.
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware em todas as rotas relevantes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Proteção de Rota no Layout do Servidor (`src/app/(tenants)/[tenantId]/layout.tsx`)

A responsabilidade de **proteger as rotas** foi movida para o layout do servidor que envolve todas as páginas do tenant. Esta é a prática recomendada pelo Next.js App Router, pois é segura, eficiente e evita a complexidade no Edge Runtime do middleware.

**Funcionamento:**

1.  O layout é um Server Component, então ele pode executar código seguro no servidor a cada requisição.
2.  Ele chama a função `getCurrentUser(params.tenantId)` (de `src/utils/session.ts`), que verifica o cookie de sessão `__session` e valida o token do usuário no lado do servidor.
3.  **Se `getCurrentUser` retorna `null`** (usuário não logado ou sessão inválida), o layout usa a função `redirect` do Next.js para enviar o usuário para a página de login (`redirect('/auth/login')`). Como a requisição já está no contexto do subdomínio (ex: `acme.dominio.com`), o redirecionamento relativo funciona corretamente, levando-o para `acme.dominio.com/auth/login`.
4.  **Se o usuário está autenticado**, o layout renderiza os `children` (a página solicitada, como o dashboard), envolvendo-os no `TenantProvider` com os dados do usuário e do tenant.

---

## Histórico de Erros e Soluções (A Jornada da Depuração)

Durante o desenvolvimento, enfrentamos uma série de erros complexos relacionados à autenticação em subdomínios. A documentação a seguir serve como um registro das lições aprendidas.

### Erro Principal: `TypeError: Invalid URL`

Este foi o erro mais persistente e desafiador. Ele ocorria de forma intermitente, principalmente no ambiente de desenvolvimento em nuvem (Cloud Workstation).

-   **Causa Raiz:** O erro era acionado no **middleware** (Edge Runtime) ao tentar construir uma URL de redirecionamento com `new URL()`. O ambiente de desenvolvimento dinâmico usa nomes de host longos e complexos (ex: `9002-long-hash-string.cloudworkstations.dev`). Ao tentar construir uma URL (ex: `new URL('/auth/login', request.url)`), o `request.url` fornecido pelo Next.js ao Edge Runtime era, por vezes, uma URL interna ou malformada que o construtor `new URL()` não conseguia interpretar, resultando no `TypeError`.
-   **Tentativas de Correção Falhas:**
    1.  **Construção Manual:** Tentar montar a URL "manualmente" a partir de `request.nextUrl.protocol` e `request.headers.get('host')`. Falhou porque o `host` também podia ser inconsistente ou incompleto.
    2.  **Clonagem de URL:** Tentar clonar a URL com `request.nextUrl.clone()` e modificar o `pathname`. Falhou pela mesma razão de inconsistência da URL base no ambiente dinâmico.
    3.  **Redirecionamento Relativo:** Mover a lógica de `redirect` para o Server Layout (`TenantLayout`). Inicialmente, isso também falhou porque a chamada a `redirect('/auth/login')` em um subdomínio ainda causava o `Invalid URL` no servidor, indicando um problema mais profundo em como o Next.js resolve redirecionamentos em conjunto com a reescrita de URL do middleware.
-   **Solução Definitiva:** A solução foi uma mudança arquitetônica radical:
    1.  **Simplificar o Middleware:** Remover **toda** a lógica de autenticação e redirecionamento do `middleware.ts`. Sua única função passou a ser reescrever a URL, sem construir novas URLs para redirecionamento.
    2.  **Mover a Validação para o Layout:** Mover a validação de sessão para o `TenantLayout` (`src/app/(tenants)/[tenantId]/layout.tsx`), que é um Server Component e tem um contexto de requisição mais estável.
    3.  **Corrigir o Redirecionamento:** No `TenantLayout`, ao detectar um usuário não autenticado, a ação correta foi `redirect('/auth/login')`. O erro `Invalid URL` foi finalmente resolvido ao garantir que o middleware *apenas* reescrevesse a URL e não tentasse fazer redirecionamentos, que é a causa raiz do problema no Edge Runtime com hosts dinâmicos.

### Erro: `404 Not Found` após reescrita de URL

-   **Causa Raiz:** Em uma das iterações, a pasta que agrupava as rotas do tenant foi nomeada como `src/app/_tenants`. No Next.js, pastas prefixadas com `_` (underscore) são consideradas privadas e **não participam do roteamento**. Portanto, quando o middleware reescrevia a URL para `/_tenants/acme/dashboard`, o Next.js não conseguia encontrar uma rota correspondente, resultando em um 404.
-   **Solução Definitiva:** Renomear a pasta de `_tenants` para `(tenants)`. Pastas envoltas em parênteses são tratadas pelo Next.js como **Grupos de Rotas**. Elas servem para organizar a estrutura de arquivos, mas são completamente ignoradas no caminho da URL, permitindo que a reescrita do middleware funcione corretamente.

### Problemas de Redirecionamento Pós-Login

-   **Causa Raiz:** A lógica de redirecionamento no lado do cliente (`login/page.tsx` e `create-clinic/page.tsx`), após o login ou criação de clínica, tentava construir a URL do subdomínio manualmente usando `window.location.href`, `window.location.host`, e `process.env.NEXT_PUBLIC_ROOT_DOMAIN`. Isso era complexo e propenso a erros entre os ambientes de `localhost` e produção/desenvolvimento.
-   **Solução Definitiva:** Simplificar radicalmente o redirecionamento. Após um login/cadastro bem-sucedido, o cliente agora sempre executa `router.push('/dashboard')` (se já estiver no subdomínio) ou um `window.location.href` para a URL completa do subdomínio (`${protocol}//${slug}.${rootDomain}/dashboard`) se estiver no domínio principal. Essa abordagem é mais limpa e delega a responsabilidade de roteamento para o navegador e para o middleware na nova página, em vez de o cliente tentar "adivinhar" a URL correta.

### Apêndice: Código dos Arquivos de Middleware (Versões Antigas - Deprecadas)

Para fins de documentação, aqui estão os conteúdos de alguns arquivos da pasta `middleware` que foram usados durante o desenvolvimento, antes de serem simplificados ou eliminados. **Estes arquivos não estão mais em uso ativo pela arquitetura final.**

**`src/middleware/chains/auth-chain.ts` (Versão Antiga e Problemática):**
```typescript
// ATENÇÃO: Este código foi descontinuado e é a fonte do erro "Invalid URL".

import { MiddlewareContext, ChainResult } from '../types';
import { NextResponse } from 'next/server';

export class AuthChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, config, tenantId, user } = context;
    const { pathname } = request.nextUrl;

    const isPublicRoute = config.publicRoutes.some((route) => pathname === route);
    const isAuthRoute = config.authRoutes.some((route) => pathname.startsWith(route));

    // Se o usuário não está logado e a rota não é pública/de autenticação
    if (!user && !isPublicRoute && !isAuthRoute) {
      console.log(`[AuthChain] Usuário não autenticado. Redirecionando para login.`);
      
      // LINHA PROBLEMÁTICA QUE CAUSA O ERRO "INVALID URL"
      const loginUrl = new URL('/auth/login', request.url); 
      
      return {
        shouldContinue: false,
        response: NextResponse.redirect(loginUrl),
      };
    }
    
    return { shouldContinue: true, context };
  }
}
```

**`src/middleware/config.ts` (Arquivo de Configuração):**
```typescript
// src/middleware/config.ts
export const middlewareConfig = {
  // Domínio raiz da aplicação em produção.
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'medicorex.app',
  
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
```
