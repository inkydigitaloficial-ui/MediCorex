
import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';

// Esta rota agora simula a confirmação de um pagamento pelo Pagar.me
// Em um cenário real, você validaria a assinatura do webhook do Pagar.me.
// https://docs.pagar.me/docs/overview-webhooks#valida%C3%A7%C3%A3o-de-post

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Em um webhook real do Pagar.me, o 'id' do objeto principal (ex: 'charge')
  // estaria no corpo. O 'client_reference_id' que usamos no Stripe
  // pode ser mapeado para o 'metadata' de um pedido no Pagar.me.
  const { event, data } = body;
  const tenantId = data?.customer?.metadata?.tenant_id;

  if (!tenantId) {
    console.error('Webhook Pagar.me: tenant_id não encontrado no metadata.');
    return new NextResponse('tenant_id não encontrado no metadata', { status: 400 });
  }

  // Simula a lógica para diferentes eventos do Pagar.me
  // Ex: 'charge.paid', 'subscription.created', etc.
  if (event === 'charge.paid' || event === 'subscription.active') {
    console.log(`Webhook simulado: Ativando assinatura para o tenant: ${tenantId}`);
    try {
      const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
      const tenantDoc = await tenantRef.get();

      if (!tenantDoc.exists) {
        console.error(`Webhook: Tenant com ID ${tenantId} não encontrado.`);
        return new NextResponse(null, { status: 200 }); // Retorna 200 para evitar retentativas
      }

      const ownerId = tenantDoc.data()!.ownerId;
      const tenantUserRef = adminFirestore.collection('tenant_users').doc(`${ownerId}_${tenantId}`);

      await adminFirestore.runTransaction(async (transaction) => {
        transaction.update(tenantRef, {
          subscriptionStatus: 'active',
          plan: 'premium', // Ou o plano que foi pago
        });
        transaction.update(tenantUserRef, {
          role: 'owner', // Restaura as permissões completas
        });
      });

      console.log(`Assinatura ativada com sucesso para o tenant: ${tenantId}`);

    } catch (error) {
      console.error(`Erro ao processar webhook para o tenant ${tenantId}:`, error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
