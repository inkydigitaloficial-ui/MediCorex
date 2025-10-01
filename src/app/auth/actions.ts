
'use server';

import { z } from 'zod';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { addDays } from 'date-fns';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    // This will not work in local dev without credentials.
    // The logic is being simplified to remove this dependency for now.
    return initializeApp();
}

const signupSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});


type SignupFormState = {
  error: string | null;
  success: boolean;
};

type LoginFormState = {
    error: string | null;
    success: boolean;
    tenantSlug?: string | null; // Adicionado para redirecionamento
};


export async function signupAction(prevState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = signupSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Dados inválidos.', success: false };
  }
  
  const { name, email, password, phone } = validatedFields.data;

  let adminAuth;
  let db;

  try {
    // NOTE: This server-side block is the source of the error in local development
    // due to missing credentials. It will be refactored.
    // For now, we bypass it to allow user creation.
    const adminApp = initializeAdminApp();
    adminAuth = getAdminAuth(adminApp);
    db = getFirestore(adminApp);

    const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        ...(phone && { phoneNumber: phone }),
    });

    const userProfile = {
        uid: userRecord.uid,
        name,
        email,
        phone: phone || null,
        createdAt: Timestamp.now(),
    };
    
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tenantSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    
    const trialEndsDate = addDays(new Date(), 7);

    const newTenant = {
        name: `Clínica de ${name}`,
        slug: tenantSlug,
        ownerId: userRecord.uid,
        active: true,
        plan: 'trial',
        subscriptionStatus: 'trialing',
        trialEnds: Timestamp.fromDate(trialEndsDate),
        settings: { language: 'pt-BR', timezone: 'America/Sao_Paulo' },
        createdAt: Timestamp.now(),
    };

    const tenantRef = db.collection('tenants').doc(tenantSlug);
    const tenantUserRef = db.collection('tenant_users').doc();

    await db.runTransaction(async (transaction) => {
        transaction.set(db.collection('users').doc(userRecord.uid), userProfile);
        transaction.set(tenantRef, newTenant);
        transaction.set(tenantUserRef, {
            tenantId: tenantSlug,
            userId: userRecord.uid,
            email: email,
            role: 'owner',
            joinedAt: Timestamp.now(),
        });
    });

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    if (error.code === 'auth/email-already-exists') {
        return { error: 'Este email já está em uso.', success: false };
    }
    if (error.code === 'auth/invalid-phone-number') {
        return { error: 'O número de telefone fornecido não é válido.', success: false };
    }
    // Generic error for server-side issues
    return { error: 'Ocorreu uma falha na configuração do servidor. Tente novamente.', success: false };
  }

  redirect(`/auth/login?signup=success`);
}


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
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }
    
    const tenantUsersSnapshot = await db.collection('tenant_users').where('userId', '==', userRecord.uid).limit(1).get();

    if (tenantUsersSnapshot.empty) {
        return { error: 'Você não está associado a nenhuma clínica. Por favor, cadastre-se para criar uma.', success: false };
    }

    const firstTenant = tenantUsersSnapshot.docs[0].data();

    return { success: true, error: null, tenantSlug: firstTenant.tenantId };
}
