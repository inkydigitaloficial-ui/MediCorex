import { NextResponse } from 'next/server';
import { RewriteHandler } from '../handlers/rewrite-handler';
import { ChainResult, MiddlewareContext } from '../types';

export class TenantChain {
  async execute(context: MiddlewareContext): Promise<ChainResult> {
    const { request, tenantId, user } = context;

    // Se não há tenantId, a chain não faz nada e continua.
    if (!tenantId) {
      return { shouldContinue: true, context };
    }

    // Se há um tenant mas não há usuário, o authChain já deveria ter redirecionado.
    // Essa verificação é uma segurança extra.
    if (!user) {
      // Apenas continuamos o fluxo aqui.
      return { shouldContinue: true, context };
    }
    
    // Verifica trial expirado
    const userTenants = user.tenants as { [key: string]: string } | undefined;
    const roleInTenant = userTenants?.[tenantId];
    
    if (roleInTenant === 'owner_trial_expired' && !request.nextUrl.pathname.startsWith('/billing')) {
      const billingUrl = new URL(`/_tenants/${tenantId}/billing`, request.url);
      return { 
        shouldContinue: false, 
        response: NextResponse.rewrite(billingUrl) 
      };
    }

    // Aplica o rewrite como passo final.
    const response = RewriteHandler.applyTenantRewrite(request, tenantId, user.uid);
    return { 
      shouldContinue: false, // Interrompe para retornar a resposta com rewrite
      response: response,
      context
    };
  }
}
