
'use server';

import { z } from 'zod';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import { addDays } from 'date-fns';

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

    // A remoção do try-catch permite que o Firebase lance seus próprios erros,
    // que são mais descritivos e podem ser tratados de forma mais granular se necessário.
    const userRecord = await adminAuth.getUserByEmail(email).catch((error) => {
        if (error.code === 'auth/user-not-found') {
            // Este é um caso esperado, não um erro de sistema.
            // Lançamos um erro específico que a UI pode interpretar.
            throw new Error('Nenhum usuário encontrado com este email.');
        }
        // Para outros erros (ex: rede), relançamos o erro original.
        throw error;
    });

    const tenantUsersSnapshot = await adminFirestore.collection('tenant_users').where('userId', '==', userRecord.uid).limit(1).get();

    if (tenantUsersSnapshot.empty) {
        // Se o usuário existe mas não tem tenant, é um novo cadastro.
        return { success: true, error: null, tenantSlug: null };
    }

    const tenantUserData = tenantUsersSnapshot.docs[0].data();
    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantUserData.tenantId).get();

    if (!tenantDoc.exists) {
        // Isso indica uma inconsistência de dados no banco.
        throw new Error('Clínica associada não encontrada.');
    }
    
    const tenantData = tenantDoc.data();
    // A action retorna o 'slug' do tenant para o cliente usar no redirecionamento
    return { success: true, error: null, tenantSlug: tenantData?.slug };
}


// --- Nova Ação para Criar a Clínica ---

const createClinicSchema = z.object({
  userId: z.string().min(1),
  clinicName: z.string().min(3, { message: 'O nome da clínica deve ter pelo menos 3 caracteres.' }),
  clinicSlug: z.string().min(3, { message: 'O endereço da clínica deve ter pelo menos 3 caracteres.' }).regex(/^[a-z0-9](-?[a-z0-9])*$/, { message: 'Endereço inválido. Use apenas letras minúsculas, números e hífens.' }),
});

type CreateClinicState = {
  error: string | null;
  success: boolean;
};

export async function createClinicAction(
  userId: string,
  clinicName: string,
  clinicSlug: string
): Promise<CreateClinicState> {
    
  const validatedFields = createClinicSchema.safeParse({ userId, clinicName, clinicSlug });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Dados inválidos.', success: false };
  }

  const { clinicSlug: tenantId } = validatedFields.data;

  try {
    // 1. Verificar se o slug já está em uso
    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantId).get();
    if (tenantDoc.exists) {
      return { error: 'Este endereço de clínica já está em uso. Por favor, escolha outro.', success: false };
    }
    
    const user = await adminAuth.getUser(userId);

    const trialEnds = addDays(new Date(), 7);
    const batch = adminFirestore.batch();

    // 2. CRIAR DOCUMENTO DO TENANT
    const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
    batch.set(tenantRef, {
        name: clinicName,
        slug: tenantId,
        ownerId: userId,
        active: true,
        plan: 'trial',
        subscriptionStatus: 'trialing',
        trialEnds: trialEnds,
        createdAt: new Date(),
    });

    // 3. CRIAR ASSOCIAÇÃO TENANT-USUÁRIO
    const tenantUserRef = adminFirestore.collection('tenant_users').doc(`${userId}_${tenantId}`);
    batch.set(tenantUserRef, {
        tenantId: tenantId,
        userId: userId,
        email: user.email, // Campo obrigatório adicionado
        role: 'owner', // Campo obrigatório adicionado
        joinedAt: new Date(),
    });

    await batch.commit();

    // 5. DEFINIR CUSTOM CLAIMS
    await adminAuth.setCustomUserClaims(userId, {
        tenants: { [tenantId]: 'owner' }
    });

    return { error: null, success: true };

  } catch (error: any) {
    console.error('Erro crítico ao criar a clínica:', error);
    return { error: 'Não foi possível criar sua clínica. Por favor, tente novamente ou contate o suporte.', success: false };
  }
}
