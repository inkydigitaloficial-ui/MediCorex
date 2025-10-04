# Documentação Técnica Exaustiva do Projeto MedicoRex

**Versão:** 1.0
**Autor:** Assistente de IA Gemini
**Data:** 23 de Maio de 2024

## Seção 1: Visão Geral e Estratégia Arquitetural

### 1.1. Propósito e Modelo de Negócio

O MedicoRex é uma plataforma de software como serviço (SaaS) multi-tenant, concebida para revolucionar a gestão de clínicas médicas e consultórios. O modelo de negócio assenta na oferta de uma aplicação web robusta, onde cada cliente (uma clínica ou profissional de saúde, referido como "tenant") obtém um ambiente de trabalho exclusivo e isolado, acessível através de um subdomínio personalizado (ex: `clinicadojoao.medicorex.app`).

Este modelo elimina a necessidade de infraestrutura local para os clientes, oferecendo uma solução centralizada, atualizável e escalável que abrange:

- **Gestão Integral de Pacientes**: Desde o cadastro inicial, passando por um prontuário eletrônico detalhado com histórico de consultas, até funcionalidades avançadas como a geração de resumos com IA.
- **Otimização da Agenda**: Um sistema de agendamento de consultas intuitivo que minimiza conflitos e otimiza o tempo dos profissionais.
- **Controle Financeiro**: Gestão de assinaturas, pagamentos recorrentes e faturamento, integrada com a plataforma Stripe para processamento seguro.
- **Inteligência de Negócio**: Dashboards analíticos que fornecem insights sobre o desempenho da clínica, como número de atendimentos, faturamento e captação de novos pacientes.

### 1.2. Pilares da Arquitetura

A arquitetura foi desenhada sobre três pilares fundamentais:

1.  **Multi-Tenancy por Subdomínio com Base de Dados Isolada**: A estratégia de usar subdomínios para separar os tenants é o coração do sistema. Cada subdomínio mapeia para um `tenantId` único que é usado como chave de partição nos dados do Firestore. Isso garante que os dados de uma clínica são logicamente inacessíveis por outra, proporcionando segurança e privacidade.
2.  **Jamstack com Next.js e Firebase**: A escolha do Next.js (App Router) permite uma experiência de usuário rica e performática através de Server-Side Rendering (SSR) e Server Components. O Firebase fornece um ecossistema de backend completo e escalável, incluindo:
    - **Firestore**: Como banco de dados NoSQL para armazenar todos os dados da aplicação.
    - **Firebase Authentication**: Para gestão de usuários (login, signup, sessões).
    - **Firebase Hosting**: Para deploy do frontend Next.js.
    - **Cloud Functions**: Para lógica de backend e webhooks (ex: Stripe).
3.  **Middleware como Orquestrador de Roteamento**: O middleware do Next.js é a peça crítica que torna a multi-tenancy transparente. Ele intercepta todas as requisições, analisa o host para identificar o tenant e reescreve a URL internamente, direcionando o usuário para a instância correta da aplicação sem que ele perceba.

---

## Seção 2: Estrutura Detalhada de Pastas e Arquivos

A seguir, uma análise forense da organização do código-fonte. Cada arquivo e pasta foi posicionado para maximizar a coesão e minimizar o acoplamento.

```
.
├── .idx/                       # Arquivos de configuração do ambiente de desenvolvimento IDX.
│   ├── dev.nix
│   └── icon.png
├── docs/                       # Documentação do projeto.
│   ├── backend.json
│   └── blueprint.md
├── functions/                  # Código das Cloud Functions do Firebase.
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts            # Ponto de entrada das funções (ex: webhooks do Stripe).
├── public/                     # Arquivos estáticos (imagens, fontes, favicons).
├── src/
│   ├── ai/                     # Módulos de Inteligência Artificial com Genkit.
│   │   ├── dev.ts
│   │   ├── genkit.ts
│   │   └── flows/pacientes/gerarResumoPaciente.ts # Fluxo para gerar resumos de pacientes.
│   ├── app/                    # Coração da aplicação Next.js (App Router).
│   │   ├── (tenants)/          # GRUPO DE ROTAS PRINCIPAL para a aplicação do tenant.
│   │   │   └── [tenantId]/     # Parâmetro dinâmico que recebe o ID do tenant do middleware.
│   │   │       ├── agenda/     # Página de agendamentos.
│   │   │       ├── pacientes/  # Página de gestão de pacientes.
│   │   │       ├── layout.tsx  # Layout específico do tenant, aplica autenticação e provê contexto.
│   │   │       └── page.tsx    # Página inicial do dashboard do tenant.
│   │   ├── _tenants/           # ATENÇÃO: Pasta duplicada/obsoleta. Ignorada pelo roteador do Next.js.
│   │   ├── api/                # Rotas de API do Next.js.
│   │   │   └── auth/           # Endpoints para login, logout, etc.
│   │   ├── auth/               # Páginas públicas de autenticação (login, signup, etc.).
│   │   ├── layout.tsx          # Layout global da aplicação.
│   │   └── page.tsx            # Página inicial pública (landing page).
│   ├── components/             # Componentes React reutilizáveis.
│   │   ├── ui/                 # Componentes de UI primitivos (ex: Button, Card), gerados pelo Shadcn.
│   │   ├── billing/            # Componentes relacionados a faturamento.
│   │   └── providers/          # Provedores de contexto React (ex: TenantProvider).
│   ├── firebase/               # Configurações e utilitários específicos do Firebase.
│   │   ├── error-emitter.ts
│   │   └── errors.ts
│   ├── hooks/                  # Hooks React customizados (ex: use-toast).
│   ├── lib/                    # Funções utilitárias e inicialização de bibliotecas.
│   │   ├── firebase/           # Configuração dos SDKs do Firebase (client e admin).
│   │   └── firestore/          # Conversores de dados do Firestore.
│   ├── middleware/             # Lógica de middleware (análise detalhada na Seção 3).
│   │   ├── chains/             # (OBSOLETO) Implementação antiga em cadeia.
│   │   ├── handlers/           # Manipuladores de erro.
│   │   ├── utils/              # Utilitários de middleware.
│   │   ├── config.ts
│   │   └── types.ts
│   ├── types/                  # Definições de tipos TypeScript para a aplicação.
│   ├── utils/                  # Utilitários gerais.
│   │   └── session.ts        # Funções para gestão de sessão do usuário.
│   ├── description.md        # Este arquivo de documentação.
│   └── middleware.ts         # PONTO DE ENTRADA DO MIDDLEWARE.
├── README.md                   # README geral do projeto.
├── apphosting.yaml             # Configuração de deploy para o Google App Hosting.
├── firebase.json               # Configuração do projeto Firebase (regras do Firestore, Hosting).
├── next.config.ts              # Arquivo de configuração do Next.js.
└── package.json                # Dependências e scripts do projeto.
```

---

## Seção 3: Dissecação Completa do Sistema de Middleware

O middleware é o componente mais crítico para o sucesso da arquitetura multi-tenant. A seguir, o código-fonte integral de todos os 8 arquivos relevantes, com explicações detalhadas.

### 3.1. `src/middleware.ts` (O Orquestrador)

**Propósito:** Este é o único middleware que o Next.js executa, conforme definido pelo `matcher`. Sua função é identificar o tenant a partir do subdomínio e reescrever a URL para uma rota interna que o App Router entende, sem alterar a URL visível para o usuário.

**Código-Fonte:**
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

  // Etapa 1: Otimização. Ignora requisições para assets estáticos e rotas de API.
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Etapa 2: Extração do host. Essencial para determinar o subdomínio.
  const host = request.headers.get('host');
  if (!host) {
    // Sem host, é impossível determinar o tenant. Continua para a página principal.
    return NextResponse.next();
  }

  // Etapa 3: A Lógica Crítica de Extração do Tenant ID. (Ver Seção 4 para detalhes do problema).
  const parts = host.split('.');
  const isLocalhost = host.includes('localhost');
  const tenantId = (isLocalhost && parts.length > 1) || (!isLocalhost && parts.length > 2) ? parts[0] : null;

  // Etapa 4: Reescrevendo a URL para o Grupo de Rotas do Tenant.
  if (tenantId && tenantId !== 'www') {
    // A URL é reescrita para `/(tenants)/[tenantId]/...`
    // O grupo de rotas `(tenants)` organiza os arquivos, mas não aparece na URL final.
    const newPath = `/(tenants)/${tenantId}${pathname}`;
    const newUrl = new URL(newPath, request.url);
    return NextResponse.rewrite(newUrl);
  }

  // Etapa 5: Se nenhum tenant foi identificado, a requisição segue para as páginas públicas.
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware em todas as rotas, exceto as excluídas acima.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 3.2. `src/middleware/config.ts`

**Propósito:** Centralizar as constantes e configurações usadas pela lógica de middleware. Isso evita "números mágicos" e strings espalhadas pelo código.

**Código-Fonte:**
```typescript
// src/middleware/config.ts
export const middlewareConfig = {
  // Domínio raiz da aplicação em produção. Usado para diferenciar subdomínios de partes do domínio principal.
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'medicorex.app',
  
  // Lista de rotas que são acessíveis publicamente, mesmo dentro de um tenant.
  publicRoutes: [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/create-clinic',
    '/auth/unauthorized',
    '/escolha-seu-plano',
    '/payment/success'
  ],

  // Rotas que fazem parte do fluxo de autenticação.
  authRoutes: [
    '/auth/login',
    '/auth/signup',
    '/auth/create-clinic',
    '/auth/logout'
  ],

  // Prefixo para rotas de API, para que o middleware possa ignorá-las.
  apiPrefix: '/api',
};
```

### 3.3. `src/middleware/types.ts`

**Propósito:** Definir as estruturas de dados (interfaces TypeScript) usadas na antiga implementação em cadeia do middleware. Embora obsoleto, é importante para entender o design anterior.

**Código-Fonte:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * (OBSOLETO) Representa o contexto que fluía entre as cadeias do middleware.
 */
export interface MiddlewareContext {
  request: NextRequest;
  response: NextResponse;
  tenantId: string | null;
  user: any | null; // Dados do usuário decodificados do token
  config: typeof import('./config').middlewareConfig;
}

/**
 * (OBSOLETO) Representa o resultado da execução de uma cadeia do middleware.
 */
export interface ChainResult {
  shouldContinue: boolean; // Se a próxima cadeia deve ser executada
  response?: NextResponse;    // A resposta a ser retornada (se shouldContinue for false)
  context?: Partial<MiddlewareContext>; // Atualizações para o contexto
}

/**
 * (OBSOLETO) Representa o resultado da validação de um token.
 */
export interface AuthResult {
  isValid: boolean;
  user?: any;
  error?: string;
}
```

### 3.4. `src/middleware/handlers/error-handler.ts`

**Propósito:** Fornecer um manipulador de erros padronizado para ser usado dentro da lógica de middleware. Na prática, com a simplificação, seu uso foi reduzido.

**Código-Fonte:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export class ErrorHandler {
  static handle(error: any, request: NextRequest): NextResponse {
    console.error('[Middleware Error]', {
      pathname: request.nextUrl.pathname,
      error: error.message,
      stack: error.stack,
    });
    
    // Se for um erro de autenticação do Firebase, limpa o cookie e força o login.
    if (error?.code?.startsWith('auth/')) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('firebaseIdToken');
      return response;
    }
    
    // Para todos os outros erros, redireciona para uma página de erro genérica.
    const errorUrl = new URL('/error', request.url);
    errorUrl.searchParams.set('message', 'Ocorreu um erro inesperado durante o processamento da sua requisição.');
    
    return NextResponse.redirect(errorUrl);
  }
}
```

### 3.5. `src/middleware/utils/cache-utils.ts`

**Propósito:** Implementar um cache em memória simples para armazenar tokens decodificados. **AVISO:** Esta implementação é perigosa em produção, pois o cache não é compartilhado entre instâncias serverless.

**Código-Fonte:**
```typescript
/**
 * (ALERTA DE PRODUÇÃO) Simulação de um cache em memória para tokens.
 * Não utilize em produção com múltiplas instâncias. Use Redis ou Memcached.
 */
interface CacheEntry {
  decodedToken: any;
  expires: number;
}

const tokenCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 500;

export class CacheUtils {
  static get(token: string): any | null {
    const entry = tokenCache.get(token);
    if (entry && entry.expires > Date.now()) {
      return entry.decodedToken;
    }
    if (entry) {
      tokenCache.delete(token);
    }
    return null;
  }

  static set(token: string, decodedToken: any): void {
    if (tokenCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = tokenCache.keys().next().value;
      tokenCache.delete(oldestKey);
    }
    const expires = Date.now() + CACHE_TTL;
    tokenCache.set(token, { decodedToken, expires });
  }
}
```

### 3.6 a 3.8. Arquivos Obsoletos (`chains` e `token-utils`)

**Propósito:** Estes arquivos representam uma abordagem de design anterior, provavelmente mais complexa, que foi sabiamente refatorada para a solução mais simples e performática em `src/middleware.ts`.

**Código-Fonte (`src/middleware/chains/auth-chain.ts`):**
```typescript
// ARQUIVO OBSOLETO. PODE E DEVE SER REMOVIDO.
// A lógica de autenticação foi movida para o `(tenants)/[tenantId]/layout.tsx`,
// onde é tratada de forma mais eficiente por Server Components.
export {};
```

**Código-Fonte (`src/middleware/chains/tenant-chain.ts`):**
```typescript
// ARQUIVO OBSOLETO. PODE E DEVE SER REMOVIDO.
// A lógica de reescrita de URL do tenant foi centralizada diretamente em `src/middleware.ts`.
export {};
```

**Código-Fonte (`src/middleware/utils/token-utils.ts`):**
```typescript
// ARQUIVO OBSOLETO. PODE E DEVE SER REMOVIDO.
// A validação de token agora é feita pela função `getUserSession` em `src/utils/session.ts`,
// que usa o Firebase Admin SDK no lado do servidor.
export class TokenUtils {
  // A lógica foi movida e melhorada.
}
```

---

## Seção 4: Análise Forense dos Desafios de Roteamento

### 4.1. O Epicentro do Problema: `localhost` vs. Domínio Real

A maior dor de cabeça em qualquer aplicação multi-tenant baseada em subdomínio é fazer o roteamento funcionar de forma idêntica no ambiente de desenvolvimento local e no ambiente de produção. O `host` da requisição, que é a fonte da verdade para identificar o tenant, comporta-se de maneira diferente.

-   **Cenário de Produção:**
    -   URL: `minhaclinica.medicorex.app`
    -   `host`: `minhaclinica.medicorex.app`
    -   `host.split('.')`: `['minhaclinica', 'medicorex', 'app']` (3+ partes)
    -   `tenantId` esperado: `'minhaclinica'`

-   **Cenário de Desenvolvimento Local:**
    -   URL: `minhaclinica.localhost:3000`
    -   `host`: `minhaclinica.localhost:3000`
    -   `host.split('.')`: `['minhaclinica', 'localhost:3000']` (2 partes)
    -   `tenantId` esperado: `'minhaclinica'`

-   **Cenário do Domínio Raiz (Sem Tenant):**
    -   URL: `medicorex.app`
    -   `host`: `medicorex.app`
    -   `host.split('.')`: `['medicorex', 'app']` (2 partes)
    -   `tenantId` esperado: `null`

Uma lógica de extração de `tenantId` que não levasse em conta essas nuances resultaria em erros catastróficos, como considerar `'medicorex'` um tenant no domínio raiz ou falhar em extrair o tenant em `localhost`. Isso levaria a erros 404, pois o Next.js não encontraria uma rota correspondente a um `tenantId` incorreto ou nulo.

### 4.2. A Anatomia da Solução Robusta

A solução implementada em `src/middleware.ts` é elegante e robusta. Vamos dissecá-la:

```typescript
const host = request.headers.get('host');
const parts = host.split('.');
const isLocalhost = host.includes('localhost');

// A Mágica Acontece Aqui:
const tenantId = (isLocalhost && parts.length > 1) || (!isLocalhost && parts.length > 2) ? parts[0] : null;
```

A expressão booleana faz tudo:
1.  `isLocalhost && parts.length > 1`: Se o host contém `localhost` E tem mais de uma parte (ex: `['acme', 'localhost:3000']`), a condição é verdadeira.
2.  `!isLocalhost && parts.length > 2`: Se o host NÃO contém `localhost` (ou seja, produção) E tem mais de duas partes (ex: `['acme', 'medicorex', 'app']`), a condição é verdadeira.
3.  `? parts[0] : null`: Se qualquer uma das condições acima for verdadeira, o `tenantId` é a primeira parte do array (`parts[0]`). Caso contrário, é `null`, tratando corretamente o domínio raiz.

Esta lógica cobre todos os cenários e é a base que permite que todo o sistema de roteamento funcione de forma coesa entre os diferentes ambientes.

---

## Seção 5: Conclusões e Próximos Passos Recomendados

Esta documentação fornece um retrato fiel e detalhado do estado atual do projeto MedicoRex. A arquitetura é sólida, mas requer manutenção e atenção a certos pontos.

**Recomendações Críticas:**
1.  **Remoção Imediata de Código Morto**: Os arquivos em `src/middleware/chains/` e `src/middleware/utils/token-utils.ts` são obsoletos e devem ser excluídos para evitar confusão e débito técnico.
2.  **Investigação da Pasta `src/app/_tenants`**: Esta pasta parece ser uma duplicata ou uma versão antiga da lógica de tenant e deve ser removida para evitar conflitos e inchaço do projeto.
3.  **Substituir o Cache em Memória**: Se a performance do middleware se tornar um gargalo, o `cache-utils.ts` deve ser substituído por uma solução de cache distribuído como Redis ou Memcached antes do deploy em larga escala.

Este documento deve ser mantido atualizado à medida que o projeto evolui. Ele é a principal fonte de verdade para qualquer desenvolvedor que venha a trabalhar nesta base de código.
