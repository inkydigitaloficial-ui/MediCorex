'use server';

import { adminFirestore } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const paymentSchema = z.object({
  tenantId: z.string().min(1, "ID do Tenant é obrigatório"),
  plan: z.string().min(1, "Plano é obrigatório"),
});

type PaymentState = {
  success: boolean;
  error?: string | null;
};

/**
 * Simula um processo de pagamento bem-sucedido que seria, na realidade,
 * acionado por um webhook de um gateway de pagamento (Pagar.me, Stripe, etc.).
 * 
 * Esta Server Action:
 * 1. Atualiza o status do tenant para 'active'.
 * 2. Restaura a role do proprietário para 'owner', removendo as restrições de 'trial_expired'.
 * 
 * Isso aciona a Cloud Function `updateUserClaimsOnRoleChange`, que atualiza os
 * Custom Claims do Firebase Auth, efetivamente restaurando o acesso do usuário ao sistema.
 */
export async function simulateSuccessfulPayment(
  tenantId: string,
  plan: string
): Promise<PaymentState> {
    const validation = paymentSchema.safeParse({ tenantId, plan });

    if (!validation.success) {
        const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, error: firstError || "Dados inválidos." };
    }

    try {
        const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
        const tenantDoc = await tenantRef.get();

        if (!tenantDoc.exists) {
            throw new Error("Tenant não encontrado.");
        }

        const tenantData = tenantDoc.data();
        if (!tenantData) {
            throw new Error("Dados do tenant não encontrados.");
        }

        const ownerId = tenantData.ownerId;
        const tenantUserRef = adminFirestore.collection('tenant_users').doc(`${ownerId}_${tenantId}`);

        // Inicia um batch para garantir que ambas as operações ocorram juntas
        const batch = adminFirestore.batch();

        // 1. Atualiza o documento do tenant
        batch.update(tenantRef, {
            subscriptionStatus: 'active',
            plan: plan, // Atualiza para o plano "pago"
        });

        // 2. Atualiza a role do usuário no tenant
        batch.update(tenantUserRef, {
            role: 'owner', // Restaura a role para remover as restrições
        });

        // Executa as operações em lote
        await batch.commit();

        console.log(`[Payment Simulation] Assinatura ativada para o tenant ${tenantId} no plano ${plan}.`);

        // Revalida o path para garantir que o middleware reavalie as permissões
        revalidatePath(`/_tenants/${tenantId}`, 'layout');

        return { success: true };

    } catch (error: any) {
        console.error(`[Payment Simulation] Erro ao ativar assinatura para o tenant ${tenantId}:`, error);
        return { success: false, error: "Ocorreu um erro ao reativar sua conta. Por favor, contate o suporte." };
    }
}
