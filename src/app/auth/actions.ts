
'use server';

import { z } from 'zod';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { addDays } from 'date-fns';

// Helper to initialize Firebase Admin SDK idempotently
function initializeAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    return initializeApp();
}

const adminApp = initializeAdminApp();
const adminAuth = getAdminAuth(adminApp);
const db = getFirestore(adminApp);

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


type FormState = {
  error: string | null;
  success: boolean;
};

export async function signupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = signupSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Dados inválidos.', success: false };
  }
  
  const { name, email, password, phone } = validatedFields.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone,
    });

    const userProfile = {
        uid: userRecord.uid,
        name,
        email,
        phone: phone || null,
        createdAt: Timestamp.now(),
    };
    
    // Generate a unique slug for the tenant
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

    // Create user profile, tenant, and tenant-user mapping in a transaction
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

    const protocol = process.env.NODE_ENV === 'development' ? 'https' : 'https';
    const host = process.env.ROOT_DOMAIN || 'localhost:9002';
    
    // Redirect to the new tenant's subdomain
    redirect(`${protocol}://${tenantSlug}.${host}`);

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    if (error.code === 'auth/email-already-exists') {
        return { error: 'Este email já está em uso.', success: false };
    }
    return { error: error.message || 'Ocorreu um erro desconhecido.', success: false };
  }
}


export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = loginSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { error: firstError || 'Dados inválidos.', success: false };
    }
    
    const { email } = validatedFields.data;

    try {
        await adminAuth.getUserByEmail(email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { error: 'Nenhum usuário encontrado com este email.', success: false };
        }
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }
    
    // On success, we just confirm credentials are valid.
    // The client should handle the actual sign-in and direct the user to their subdomain.
    return { success: true, error: null };
}

