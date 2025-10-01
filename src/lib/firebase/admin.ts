'use server';

import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Função para inicializar o app do Firebase Admin de forma idempotente.
// Isso garante que, não importa quantas vezes este módulo seja importado,
// a inicialização ocorra apenas uma vez.
function createFirebaseAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    // Retorna a instância existente se já foi inicializada.
    return getApp();
  }

  // Se nenhuma instância existir, inicializa uma nova.
  // O SDK Admin buscará automaticamente as credenciais do ambiente
  // (e.g., GOOGLE_APPLICATION_CREDENTIALS ou FIREBASE_CONFIG).
  return initializeApp();
}

// Inicializa e exporta as instâncias como singletons.
// Estes serão os únicos pontos de acesso para os serviços do Firebase Admin no lado do servidor.
export const adminApp = createFirebaseAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
