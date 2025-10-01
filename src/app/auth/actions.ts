
'use server';

import { z } from 'zod';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    return initializeApp();
}

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

    let adminAuth;
    let db;
    try {
        const adminApp = initializeAdminApp();
        adminAuth = getAdminAuth(adminApp);
        db = getFirestore(adminApp);
    } catch (error: any) {
        console.error('Erro ao inicializar Firebase Admin SDK:', error);
        return { error: 'Falha na configuração do servidor. Tente novamente mais tarde.', success: false };
    }

    let userRecord;
    try {
        userRecord = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { error: 'Nenhum usuário encontrado com este email.', success: false };
        }
        console.error("Erro ao buscar usuário:", error);
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }
    
    const tenantUsersSnapshot = await db.collection('tenant_users').where('userId', '==', userRecord.uid).limit(1).get();

    if (tenantUsersSnapshot.empty) {
        return { error: 'Sua clínica ainda está sendo preparada. Tente novamente em alguns instantes.', success: false };
    }

    const firstTenant = tenantUsersSnapshot.docs[0].data();

    return { success: true, error: null, tenantSlug: firstTenant.tenantId };
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
    const adminApp = initializeAdminApp();
    const db = getFirestore(adminApp);

    const tenantUsersSnapshot = await db.collection('tenant_users').where('userId', '==', userId).limit(1).get();

    if (tenantUsersSnapshot.empty) {
      // É normal não encontrar imediatamente, a Cloud Function pode estar em execução.
      return { error: 'Tenant não encontrado ainda.', tenantId: null };
    }

    const tenantData = tenantUsersSnapshot.docs[0].data();
    return { error: null, tenantId: tenantData.tenantId };
  } catch (error) {
    console.error('Erro ao buscar tenant do usuário:', error);
    // Retorna um erro genérico para o cliente.
    return { error: 'Ocorreu um erro no servidor ao procurar sua clínica.', tenantId: null };
  }
}

