
import { RewriteHandler } from '../handlers/rewrite-handler';
import { ChainResult, MiddlewareContext } from '../types';

/**
 * Cadeia de Lógica do Tenant Simplificada
 *
 * Responsabilidades:
 * 1. Se não houver `tenantId` (domínio principal), não faz nada.
 * 2. Se houver `tenantId`, reescreve a URL para a estrutura de diretório interna do Next.js
 *    (ex: `acme.dominio.com/dashboard` -> `acme.dominio.com/_tenants/acme/dashboard`).
 *
 * A validação de permissão do usuário para o tenant e o tratamento de trial expirado
 * agora são responsabilidade do `TenantLayout` no lado do servidor, que tem acesso
 * ao contexto de autenticação completo.
 */
export class TenantChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, tenantId } = context;

    // Se não há um tenantId (acesso ao domínio principal), a chain não faz nada.
    if (!tenantId) {
      return { shouldContinue: true, context };
    }

    // Se há um tenantId, simplesmente reescreve a URL para a estrutura interna.
    // A lógica de proteção (se o usuário pode ver esta página) é feita no layout do servidor.
    const response = RewriteHandler.applyTenantRewrite(request, tenantId);
    
    // Interrompe a cadeia e retorna a resposta com a URL reescrita.
    return {
      shouldContinue: false,
      response: response,
      context
    };
  }
}
