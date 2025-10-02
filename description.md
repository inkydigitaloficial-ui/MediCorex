
# Visão Geral do Projeto

Este documento fornece uma visão geral da arquitetura e estrutura do projeto, com foco especial no sistema de middleware.

## Estrutura de Arquivos e Pastas

A seguir, a árvore de diretórios do projeto, destacando a organização dos principais módulos:

```
.
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── _tenants/
│   │   │   └── [tenantId]/
│   │   │       ├── agenda/
│   │   │       ├── auth/
│   │   │       ├── billing/
│   │   │       ├── configuracoes/
│   │   │       ├── dashboard/
│   │   │       ├── financeiro/
│   │   │       └── pacientes/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── verify-token/
│   │   │   │       └── route.ts  // <-- Rota para verificação de token
│   │   │   └── stripe/
│   │   ├── auth/
│   │   ├── escolha-seu-plano/
│   │   └── payment/
│   ├── components/
│   │   ├── providers/
│   │   └── ui/
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   │   ├── firebase/
│   │   ├── firestore/
│   │   └── stripe/
│   ├── middleware/
│   │   ├── chains/
│   │   │   ├── auth-chain.ts
│   │   │   └── tenant-chain.ts
│   │   ├── handlers/
│   │   │   ├── error-handler.ts
│   │   │   └── rewrite-handler.ts
│   │   ├── utils/
│   │   │   ├── cache-utils.ts
│   │   │   ├── domain-utils.ts
│   │   │   ├── route-utils.ts
│   │   │   └── token-utils.ts
│   │   ├── config.ts
│   │   └── types.ts
│   ├── middleware.ts             // <-- Ponto de entrada do Middleware
│   ├── types/
│   └── utils/
├── firebase.json
├── firestore.rules
└── package.json
```

## Arquitetura do Middleware

O sistema de middleware foi refatorado para seguir o padrão de design **Chain of Responsibility**. Esta abordagem modulariza a lógica, tornando o sistema mais organizado, testável e fácil de manter.

A orquestração do fluxo de requisições ocorre no arquivo principal `src/middleware.ts`, que executa uma série de "cadeias" (*chains*) em uma sequência lógica e linear.

### Fluxo de Execução

1.  **Setup Inicial (`src/middleware.ts`):**
    *   O middleware intercepta a requisição.
    *   Rotas de API e assets estáticos são ignorados para otimizar a performance.
    *   O `tenantId` é extraído do subdomínio.
    *   Um objeto de **contexto** é criado, contendo a requisição, a resposta padrão e o `tenantId`.

2.  **Cadeia de Autenticação (`src/middleware/chains/auth-chain.ts`):**
    *   Recebe o contexto inicial.
    *   **Lógica Principal:**
        *   Verifica se a rota é pública ou de autenticação.
        *   Extrai o token JWT do cookie `firebaseIdToken`.
        *   **Delega a validação do token para uma rota de API (`/api/auth/verify-token`), que é executada no ambiente Node.js e pode usar o `firebase-admin` com segurança.**
        *   Se o token for válido, o `user` é adicionado ao contexto.
        *   Se a rota é protegida e o token é inválido, o usuário é redirecionado para a página de login.
    *   **Resultado:** O contexto é enriquecido com as informações do usuário (ou `null`) e passado para a próxima cadeia.

3.  **Cadeia de Lógica do Tenant (`src/middleware/chains/tenant-chain.ts`):**
    *   Recebe o contexto já com os dados de autenticação.
    *   **Lógica Principal:**
        *   Verifica se existe um `tenantId` no contexto. Se não, a cadeia não faz nada.
        *   Valida se o usuário autenticado tem permissão para acessar o tenant.
        *   Verifica o status da assinatura (ex: trial expirado) e redireciona para a página de billing, se necessário.
        *   Reescreve a URL para a estrutura interna do tenant (ex: `app.localhost:3000/dashboard` vira `app.localhost:3000/_tenants/tenant-a/dashboard`), permitindo o roteamento correto no Next.js.
    *   **Resultado:** Retorna a resposta final, que pode ser a continuação da requisição, um redirecionamento ou uma URL reescrita.

### Módulos de Suporte (`src/middleware/*`)

-   **`handlers/`**: Módulos responsáveis por gerar respostas HTTP.
    -   `rewrite-handler.ts`: Constrói a resposta com a URL reescrita para o tenant.
    -   `error-handler.ts`: Captura erros e retorna uma resposta de erro padronizada.
-   **`utils/`**: Funções utilitárias puras e reutilizáveis.
    -   `domain-utils.ts`: Extrai o subdomínio do hostname.
    -   `token-utils.ts`: Faz a chamada `fetch` para a API de verificação de token.
    -   `cache-utils.ts`: Simula um cache em memória para tokens (pode ser substituído por uma solução mais robusta).
    -   `route-utils.ts`: Verifica se uma rota é pública, de API, estática, etc.
-   **`config.ts`**: Centraliza as configurações do middleware, como rotas públicas e features flags.
-   **`types.ts`**: Define as interfaces e tipos TypeScript para garantir a consistência do fluxo de dados.

### API de Verificação de Token (`src/app/api/auth/verify-token/route.ts`)

-   **Propósito:** Isolar o uso do `firebase-admin` do Edge Runtime.
-   **Funcionamento:**
    -   Recebe o token JWT via POST.
    -   Usa o `adminAuth.verifyIdToken()` para validar o token no ambiente seguro do Node.js.
    -   Retorna os dados do token decodificado (sucesso) ou um erro 401 (falha).

Esta arquitetura garante que a lógica de middleware seja desacoplada, fácil de testar e expandir, ao mesmo tempo que contorna as limitações do Edge Runtime movendo operações sensíveis para uma API dedicada.
