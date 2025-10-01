
'use server';

import { z } from 'zod';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    // Esta inicialização é um fallback e pode depender de credenciais de ambiente.
    // A Cloud Function terá as credenciais automaticamente. O dev local pode precisar delas.
    return initializeApp();
}

const loginSchema = z.object({
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type LoginFormState = {
    error: string | null;
    success: boolean;
    tenantSlug?: string | null; // Adicionado para redirecionamento
};


// The signupAction is no longer used.
// The signup logic is now handled on the client-side in /auth/signup/page.tsx
// and a Cloud Function handles tenant creation.


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
        // A senha não é validada aqui, apenas a existência do usuário pelo email.
        // A validação da senha é feita no cliente com signInWithEmailAndPassword.
        userRecord = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { error: 'Nenhum usuário encontrado com este email.', success: false };
        }
        console.error("Erro ao buscar usuário:", error);
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }
    
    // Procura o tenant associado ao usuário.
    const tenantUsersSnapshot = await db.collection('tenant_users').where('userId', '==', userRecord.uid).limit(1).get();

    if (tenantUsersSnapshot.empty) {
        // A Cloud Function pode ainda não ter terminado de criar o tenant.
        return { error: 'Sua clínica ainda está sendo preparada. Tente novamente em alguns instantes.', success: false };
    }

    const firstTenant = tenantUsersSnapshot.docs[0].data();

    // Retorna sucesso e o slug do tenant para o cliente fazer o login e redirecionar.
    return { success: true, error: null, tenantSlug: firstTenant.tenantId };
}
