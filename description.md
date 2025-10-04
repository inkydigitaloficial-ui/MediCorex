
# Visão Geral do Projeto

Este documento fornece uma visão geral da arquitetura e estrutura do projeto, com foco especial no sistema de middleware e no fluxo de autenticação multi-tenant.

## Estrutura de Arquivos e Pastas (Atualizada)

A seguir, a árvore de diretórios simplificada, refletindo a arquitetura final:

```
.
├── src/
│   ├── app/
│   │   ├── (public)/              // Rotas públicas como landing page, preços, etc.
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
│   ├── middleware.ts             // <-- PONTO DE ENTRADA ÚNICO DO MIDDLEWARE
│   ├── types/
│   └── utils/
│       └── session.ts            // <-- Lógica de sessão no servidor
├── firebase.json
├── firestore.rules
└── package.json
```

## Arquitetura de Middleware e Autenticação (Versão Final)

O sistema de middleware foi drasticamente simplificado para aumentar a robustez e eliminar erros complexos. O padrão "Chain of Responsibility" foi substituído por uma arquitetura mais enxuta e alinhada com as melhores práticas do Next.js App Router.

**A responsabilidade agora é dividida entre o Middleware e os Server Components (Layouts).**

### 1. Middleware (`src/middleware.ts`)

O middleware agora tem uma **única e exclusiva responsabilidade**: reescrever a URL com base no subdomínio. Ele não lida mais com autenticação, cookies ou redirecionamentos.

**Funcionamento:**

1.  A requisição chega (ex: `acme.dominio.com/dashboard`).
2.  O middleware ignora rotas de API e arquivos estáticos (`/api`, `/_next`, etc.).
3.  Ele extrai o `tenantId` (`acme`) do subdomínio do host.
4.  Se um `tenantId` é encontrado, ele **reescreve silenciosamente** a URL para o grupo de rotas interno: `/(tenants)/acme/dashboard`.
5.  O Next.js então processa a requisição como se ela fosse para a pasta `src/app/(tenants)/[tenantId]/dashboard/page.tsx`.

Isso isola a lógica de roteamento multi-tenant em um único ponto, de forma eficiente e sem efeitos colaterais.

**Código Completo do `middleware.ts`:**

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

A responsabilidade de **proteger as rotas** foi movida para o layout do servidor que envolve todas as páginas do tenant.

**Funcionamento:**

1.  O layout é um Server Component, então ele pode executar código seguro no servidor a cada requisição.
2.  Ele chama a função `getCurrentUser(params.tenantId)` (de `src/utils/session.ts`), que verifica o cookie de sessão `__session` e valida o token do usuário.
3.  **Se `getCurrentUser` retorna `null`** (usuário não logado ou sessão inválida), o layout usa a função `redirect` do Next.js para enviar o usuário para a página de login (`redirect('/auth/login')`). Como a requisição já está no contexto do subdomínio (ex: `acme.dominio.com`), o redirecionamento relativo funciona corretamente, levando-o para `acme.dominio.com/auth/login`.
4.  **Se o usuário está autenticado**, o layout renderiza os `children` (a página solicitada, como o dashboard), envolvendo-os no `TenantProvider` com os dados do usuário e do tenant.

Esta abordagem é a recomendada pelo Next.js App Router, pois é segura, eficiente e evita a complexidade no Edge Runtime do middleware.

---

## Histórico de Erros e Soluções

Durante o desenvolvimento, enfrentamos uma série de erros complexos relacionados à autenticação em subdomínios, principalmente no ambiente de desenvolvimento dinâmico.

### Erro: `TypeError: Invalid URL`

Este foi o erro mais persistente e desafiador.

-   **Causa Raiz:** O erro ocorria no middleware (Edge Runtime) ao tentar construir uma URL de redirecionamento com `new URL()`. O ambiente de desenvolvimento em nuvem (Cloud Workstation) usa nomes de host longos e complexos. Ao tentar construir uma URL (ex: `new URL('/auth/login', request.url)`), o `request.url` fornecido pelo Next.js no Edge Runtime era, por vezes, uma URL interna ou malformada que o construtor `new URL()` não conseguia interpretar, resultando no `TypeError`.
-   **Tentativas de Correção Falhas:**
    1.  Tentar construir a URL "manualmente" a partir de `request.nextUrl.protocol` e `request.headers.get('host')`. Falhou porque o `host` também podia ser inconsistente.
    2.  Tentar clonar a URL com `request.nextUrl.clone()` e modificar o `pathname`. Falhou pela mesma razão de inconsistência da URL base no ambiente dinâmico.
-   **Solução Definitiva:** Eliminar **qualquer** construção de URL para redirecionamento dentro do middleware. A responsabilidade do redirecionamento foi movida para o `TenantLayout` (Server Component), que usa `redirect('/auth/login')` do Next.js. O Server Component tem um contexto mais estável e o `redirect` relativo funciona de forma confiável, pois o navegador já está no subdomínio correto.

### Erro: `404 Not Found` após reescrita de URL

-   **Causa Raiz:** Inicialmente, a pasta que agrupava as rotas do tenant foi nomeada como `src/app/_tenants`. No Next.js, pastas prefixadas com `_` (underscore) são consideradas privadas e não participam do roteamento. Portanto, quando o middleware reescrevia a URL para `/_tenants/acme/dashboard`, o Next.js não conseguia encontrar uma rota correspondente, resultando em um 404.
-   **Solução Definitiva:** Renomear a pasta de `_tenants` para `(tenants)`. Pastas envoltas em parênteses são tratadas pelo Next.js como **Grupos de Rotas**. Elas servem para organizar a estrutura de arquivos, mas são completamente ignoradas no caminho da URL. Isso alinhou nosso projeto com a convenção correta do Next.js e resolveu o erro de roteamento.

### Problemas Gerais de Login e Redirecionamento

-   **Causa Raiz:** A lógica de redirecionamento no lado do cliente, após o login ou criação de clínica, tentava construir a URL do subdomínio manualmente usando `window.location.href` e `process.env.NEXT_PUBLIC_ROOT_DOMAIN`. Isso era complexo e propenso a erros entre os ambientes de `localhost` e produção/desenvolvimento.
-   **Solução Definitiva:** Simplificar radicalmente o redirecionamento. Após um login/cadastro bem-sucedido, o cliente agora sempre executa `router.push('/dashboard')`. Se a página de login já estiver no subdomínio correto (`acme.dominio.com/auth/login`), a navegação relativa funciona perfeitamente. Se o login for feito no domínio principal, a `loginAction` (Server Action) retorna o `tenantSlug`, e o cliente executa um `window.location.href` para a URL do subdomínio, deixando o middleware e o layout lidarem com o resto na nova página. Essa abordagem é mais limpa e robusta.
