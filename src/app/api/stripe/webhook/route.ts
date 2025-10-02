
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminFirestore, adminAuth } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function getPlanFromPriceId(priceId: string): Promise<string> {
    // Em um cenário real, você poderia ter uma lógica mais complexa aqui,
    // talvez buscando o produto no Stripe ou em seu banco de dados.
    if (priceId === process.env.STRIPE_PRICE_ID_BASICO) return 'basico';
    if (priceId === process.env.STRIPE_PRICE_ID_PROFISSIONAL) return 'profissional';
    return 'active'; // Fallback
}

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // 1. Verifica se a requisição veio do Stripe
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro na verificação do webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Lida com o evento checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('✅ Sessão de checkout concluída:', session.id);

    const { userId, tenantId } = session.metadata!;
    const priceId = session.line_items?.data[0]?.price?.id;

    if (!userId || !tenantId || !priceId) {
        console.error('❌ Metadados ausentes na sessão de checkout.', { userId, tenantId, priceId });
        return NextResponse.json({ error: 'Metadados ausentes.' }, { status: 400 });
    }

    try {
        // 3. Atualiza o banco de dados e os Custom Claims
        const planName = await getPlanFromPriceId(priceId);
        const tenantRef = adminFirestore.collection('tenants').doc(tenantId);

        // Atualiza o documento do tenant no Firestore
        await tenantRef.update({
            subscriptionStatus: planName,
            stripeSubscriptionId: session.subscription, // Salva o ID da assinatura
            stripeCustomerId: session.customer,       // Salva o ID do cliente Stripe
            trialEnds: null, // Limpa a data de expiração do trial
        });

        // Pega os claims atuais para não sobrescrever outras informações
        const { customClaims } = await adminAuth.getUser(userId);

        // Atualiza o Custom Claim do usuário para reativar o acesso
        await adminAuth.setCustomUserClaims(userId, {
            ...customClaims,
            tenants: {
                ...(customClaims?.tenants as object),
                [tenantId]: 'owner', // Muda o status de owner_trial_expired para owner
            }
        });

        console.log(`✨ Tenant ${tenantId} e usuário ${userId} atualizados para o plano ${planName}.`);

    } catch (dbError: any) {
        console.error('❌ Erro ao atualizar Firestore ou Custom Claims:', dbError);
        return NextResponse.json({ error: 'Erro de banco de dados.' }, { status: 500 });
    }
  }

  // Adicione outros `if (event.type === ...)` para lidar com outros eventos do Stripe,
  // como cancelamentos (`customer.subscription.deleted`) ou falhas de pagamento.

  return NextResponse.json({ received: true });
}
