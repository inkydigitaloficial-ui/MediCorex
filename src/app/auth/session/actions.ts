
'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';
import {experimental_taintObjectReference as taintObjectReference} from 'react';


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


/**
 * @summary Obtém a sessão do usuário a partir do cookie e enriquece com dados do tenant.
 * @description Verifica o cookie de sessão, decodifica o token e busca os dados do tenant
 * associado para fornecer um objeto de sessão completo para uso no servidor (Middleware, Server Components).
 * @param {Headers} [headers] - Opcional. Utilizado no middleware para ler os cookies do request.
 * @returns {Promise<Session | null>} - Objeto de sessão completo ou nulo se inválido.
 */
export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Extrai o tenantId dos custom claims. Assume-se que o middleware já validou
    // que o usuário tem acesso ao tenant do subdomínio.
    const userTenants = (decodedToken.tenants as { [key: string]: string }) || {};
    const tenantId = Object.keys(userTenants)[0]; 

    if (!tenantId) {
      console.warn(`Sessão válida para usuário ${decodedToken.uid} mas sem claims de tenant.`);
      return null;
    }

    const userRole = userTenants[tenantId];

    // Busca dados do tenant no Firestore
    const tenantDoc = await adminFirestore.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      console.error(`Tenant com ID ${tenantId} não encontrado no Firestore, mas presente nos claims.`);
      return null;
    }

    const tenantData = tenantDoc.data();

    const session = {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuário',
        picture: decodedToken.picture || '',
      },
      tenant: {
        id: tenantId,
        name: tenantData?.name || 'Clínica',
        subscriptionStatus: tenantData?.subscriptionStatus,
        trialEnds: tenantData?.trialEnds?.toDate?.() || null,
        //... outros dados do tenant que você queira expor
      },
      role: userRole,
      decodedToken, // O token decodificado original para usos avançados
    };
    
    taintObjectReference("Do not pass session object to client component", session)

    return session;

  } catch (error) {
    // Se o cookie for inválido (expirado, etc), o Firebase Admin SDK vai lançar um erro.
    // console.log('Falha ao verificar cookie de sessão:', error.code);
    return null;
  }
}
