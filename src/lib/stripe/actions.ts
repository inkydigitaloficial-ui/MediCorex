
'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getCurrentUser } from '@/utils/session'; // Assumindo que temos como pegar o usuário no servidor
import { adminDb } from '@/lib/firebase/admin';

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Mapeamento dos planos para os Price IDs do Stripe
// Substitua pelos seus IDs de Preço reais do Stripe
const PLAN_PRICE_IDS = {
  basico: process.env.STRIPE_PRICE_ID_BASICO || 'price_basic_placeholder',
  profissional: process.env.STRIPE_PRICE_ID_PROFISSIONAL || 'price_professional_placeholder',
};

type Plan = keyof typeof PLAN_PRICE_IDS;

export async function createCheckoutSession(plan: Plan) {
  const authContext = await getCurrentUser();

  // 1. Validação de autenticação
  if (!authContext) {
    return redirect('/auth/login');
  }

  const { user, tenantId } = authContext;

  if (!tenantId) {
    // Isso seria um estado inesperado, o usuário deve ter um tenant
    throw new Error('ID do Tenant não encontrado na sessão do usuário.');
  }

  const priceId = PLAN_PRICE_IDS[plan];

  if (!priceId) {
    throw new Error('Plano inválido selecionado.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // 2. Criação da Sessão de Checkout no Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription', // Pagamento recorrente
      payment_method_types: ['card'],
      customer_email: user.email, // Preenche o email do cliente
      line_items: [
        { price: priceId, quantity: 1 },
      ],
      // Armazena metadados para identificar o cliente e o tenant após o pagamento (via webhook)
      metadata: {
        userId: user.uid,
        tenantId: tenantId,
      },
      // URLs para redirecionar o usuário após o pagamento
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/escolha-seu-plano?status=cancelled`,
    });

    // 3. Redirecionamento para a URL do Stripe
    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    } else {
      throw new Error('Não foi possível criar a sessão de checkout do Stripe.');
    }

  } catch (error) {
    console.error('Erro ao criar sessão de checkout do Stripe:', error);
    // Em caso de erro, redireciona de volta com uma mensagem
    redirect('/escolha-seu-plano?status=error');
  }
}
