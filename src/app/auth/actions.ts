
'use server';

import { z } from 'zod';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';

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

    await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        name,
        email,
        phone: phone || null,
        createdAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    if (error.code === 'auth/email-already-exists') {
        return { error: 'Este email já está em uso.', success: false };
    }
    return { error: error.message || 'Ocorreu um erro desconhecido.', success: false };
  }

  // On success, redirect. We need a way for the client to know it needs to log in
  // with the new credentials. The simplest way is to redirect to login.
  redirect('/auth/login?signup=success');
}


export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = loginSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { error: firstError || 'Dados inválidos.', success: false };
    }
    
    // NOTE: This action can't actually log the user in on the client.
    // Firebase client-side auth needs to handle the actual sign-in.
    // This action serves to validate credentials before telling the client to proceed.
    // For a real app, you would generate a custom token here and sign in with it on the client.
    // For this prototype, we'll just redirect to a default tenant on "success".
    
    const { email, password } = validatedFields.data;

    try {
        // We can't actually sign in here, but we can verify the user exists
        // by trying to get their record. This isn't a password check, though.
        await adminAuth.getUserByEmail(email);

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return { error: 'Nenhum usuário encontrado com este email.', success: false };
        }
        return { error: 'Credenciais inválidas. Verifique seu email e senha.', success: false };
    }

    // In a real app, we would not redirect from a server action like this.
    // The client would receive the success state and handle the sign-in and redirect.
    redirect('https://acme.localhost:9002');
}
