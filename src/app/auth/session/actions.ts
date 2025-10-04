
'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * @summary Cria um cookie de sessão HTTP-Only a partir de um ID Token do Firebase.
 * @param {string} idToken - O ID token JWT fornecido pelo Firebase Auth no lado do cliente.
 * @returns {Promise<{status: string, message: string}>} - Resultado da operação.
 */
export async function createSessionCookie(idToken: string) {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dias
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return { status: 'success', message: 'Sessão criada com sucesso.' };
  } catch (error) {
    console.error('Erro ao criar cookie de sessão:', error);
    return { status: 'error', message: 'Não foi possível iniciar a sessão.' };
  }
}

/**
 * @summary Invalida o cookie de sessão do usuário (efetua o logout no servidor).
 * @returns {Promise<{status: string}>} - Resultado da operação.
 */
export async function revokeSessionCookie() {
  cookies().delete('__session');
  return { status: 'success' };
}
