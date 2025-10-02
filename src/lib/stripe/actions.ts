
'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getCurrentUser } from '@/utils/session';

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Mapeamento dos planos para os Price IDs do Stripe
const PLAN_PRICE_IDS = {
  basico: process.env.STRIPE_PRICE_ID_BASICO || 'price_1PKOE5Cxw83m2M1yZ31xH23B', // Substitua
  profissional: process.env.STRIPE_PRICE_ID_PROFISSIONAL || 'price_1PKOE5Cxw83m2M1yZ31xH23B', // Substitua
  premium: process.env.STRIPE_PRICE_ID_PROFISSIONAL || 'price_1PKOE5Cxw83m2M1yZ31xH23B', // Adicionado
};

type Plan = keyof typeof PLAN_PRICE_IDS;

export async function createCheckoutSession(plan: Plan) {
  // O middleware já garante que o usuário está logado e tem acesso ao tenant.
  // A função getCurrentUser pode ser simplificada se o tenantId for pego do subdomínio.
  const authContext = await getCurrentUser();

  if (!authContext) {
    return redirect('/auth/login');
  }

  const { user, tenantId } = authContext;

  if (!tenantId) {
    throw new Error('ID do Tenant não encontrado na sessão do usuário.');
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId || priceId.includes('placeholder')) {
    console.error(`Stripe Price ID para o plano "${plan}" não está configurado.`);
    throw new Error('Plano de assinatura não configurado corretamente no servidor.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: user.uid,
        tenantId: tenantId,
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/escolha-seu-plano?status=cancelled`,
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    } else {
      throw new Error('Não foi possível criar a sessão de checkout do Stripe.');
    }

  } catch (error) {
    console.error('Erro ao criar sessão de checkout do Stripe:', error);
    redirect('/escolha-seu-plano?status=error');
  }
}
