
'use server';

import { z } from 'zod';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin'; // Importa as instâncias singleton
import Stripe from 'stripe';

// Inicialização do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

const loginSchema = z.object({
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type LoginFormState = {
    error: string | null;
    success: boolean;
    tenantSlug?: string | null;
};

export async function loginAction(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = loginSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { error: firstError || 'Dados inválidos.', success: false };
    }
    
    const { email } = validatedFields.data;

    try {
        const userRecord = await adminAuth.getUserByEmail(email);
        const tenantUsersSnapshot = await adminFirestore.collection('tenant_users').where('userId', '==', userRecord.uid).limit(1).get();

        if (tenantUsersSnapshot.empty) {
            // Isso pode acontecer se a Cloud Function de criação de usuário ainda não terminou de executar.
            return { error: 'Sua clínica ainda está sendo preparada. Tente novamente em alguns instantes.', success: false };
        }

        const firstTenant = tenantUsersSnapshot.docs[0].data();
        return { success: true, error: null, tenantSlug: firstTenant.tenantId };

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { error: 'Nenhum usuário encontrado com este email.', success: false };
        }
        console.error("Erro durante o login na Action:", error);
        // Para o usuário final, um erro genérico de credenciais é mais seguro.
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }
}


type FindTenantState = {
  error: string | null;
  tenantId: string | null;
};

export async function findUserTenantAction(userId: string): Promise<FindTenantState> {
  if (!userId) {
    return { error: 'ID do usuário não fornecido.', tenantId: null };
  }

  try {
    const tenantUsersSnapshot = await adminFirestore.collection('tenant_users').where('userId', '==', userId).limit(1).get();

    if (tenantUsersSnapshot.empty) {
      // É normal não encontrar imediatamente, a Cloud Function pode estar em execução.
      return { error: 'Tenant não encontrado ainda.', tenantId: null };
    }

    const tenantData = tenantUsersSnapshot.docs[0].data();
    return { error: null, tenantId: tenantData.tenantId };
  } catch (error) {
    console.error('Erro ao buscar tenant do usuário na Action:', error);
    return { error: 'Ocorreu um erro no servidor ao procurar sua clínica.', tenantId: null };
  }
}

// --- Ação de Checkout do Stripe ---

type CheckoutState = {
  error?: string;
  url?: string;
};

export async function createCheckoutSessionAction(tenantId: string, userEmail: string): Promise<CheckoutState> {
  if (!tenantId || !userEmail) {
    return { error: 'Informações essenciais (ID da clínica ou email) não fornecidas.' };
  }

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId) {
      console.error('Variável de ambiente STRIPE_PREMIUM_PRICE_ID não definida.');
      return { error: 'A configuração de preço do plano não foi encontrada.' };
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // URLs dinâmicas baseadas no tenant
      success_url: `http://${tenantId}.${rootDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://${tenantId}.${rootDomain}/billing`,
      customer_email: userEmail,
      // ID de referência do cliente para ligar a sessão de checkout ao tenant no webhook
      client_reference_id: tenantId,
    });

    if (!session.url) {
        console.error('Stripe session URL não foi retornada.');
        return { error: 'Não foi possível criar a sessão de pagamento. Tente novamente.' };
    }

    return { url: session.url };

  } catch (error) {
    console.error('Erro ao criar sessão de checkout no Stripe:', error);
    return { error: 'Ocorreu um erro ao comunicar com nosso provedor de pagamentos.' };
  }
}
