
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminFirestore } from '@/lib/firebase/admin'; // Importa a instância singleton

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Processa o evento recebido do Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Evento de checkout.session.completed recebido para a sessão:', session.id);
      
      const tenantId = session.client_reference_id;
      if (!tenantId) {
        console.error('Erro crítico: client_reference_id (tenantId) não encontrado no evento do Stripe.');
        // Retorna 200 para o Stripe para evitar retentativas, pois é um erro de lógica interna.
        return new NextResponse(null, { status: 200 }); 
      }

      try {
        // Usa a instância singleton do adminFirestore
        const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
        const tenantDoc = await tenantRef.get();

        if (!tenantDoc.exists) {
            console.error(`Webhook: Tenant com ID ${tenantId} não encontrado no Firestore.`);
            break; // Sai do switch
        }

        const ownerId = tenantDoc.data()!.ownerId;
        // A ID do documento na coleção 'tenant_users' é uma composição para garantir unicidade.
        const tenantUserRef = adminFirestore.collection('tenant_users').doc(`${ownerId}_${tenantId}`);

        // Utiliza uma transação do Firestore para garantir que ambas as escritas (no tenant e no tenant_user)
        // sejam bem-sucedidas ou falhem juntas, mantendo a consistência dos dados.
        await adminFirestore.runTransaction(async (transaction) => {
            transaction.update(tenantRef, {
                subscriptionStatus: 'active', 
                plan: 'premium', // Define o plano como ativo
            });
            transaction.update(tenantUserRef, {
                role: 'owner', // Restaura a permissão completa do proprietário
            });
        });

        console.log(`Assinatura ativada com sucesso via webhook para o tenant: ${tenantId}`);

      } catch (error) {
        console.error(`Erro ao processar o webhook e atualizar o Firestore para o tenant ${tenantId}:`, error);
        // Retorna um status 500 para indicar ao Stripe que houve um erro no servidor.
        // O Stripe tentará reenviar o webhook algumas vezes.
        return new NextResponse('Internal Server Error', { status: 500 });
      }
      break;

    // TODO: Adicionar manipuladores para outros eventos importantes, como:
    // case 'invoice.payment_failed':
    // case 'customer.subscription.deleted':
    
default:
      console.log(`Evento de webhook não manipulado: ${event.type}`);
  }

  // Confirma ao Stripe que o evento foi recebido com sucesso.
  return new NextResponse(null, { status: 200 });
}
