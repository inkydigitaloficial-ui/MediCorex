
import { App, getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Valida as variáveis de ambiente do Firebase Admin e retorna o objeto de configuração.
 * Lança um erro se alguma variável essencial estiver faltando.
 */
function getAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[Firebase Admin] Variáveis de ambiente críticas não configuradas. Verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.'
    );
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Substitui literais \n por quebras de linha
    }),
  };
}

/**
 * Inicializa o Firebase Admin SDK usando o padrão Singleton para evitar múltiplas instâncias.
 * Inclui tratamento de erro detalhado.
 */
function initializeAdminApp(): App {
  // Se já existe uma instância, retorna ela
  if (getApps().length > 0) {
    return getApp();
  }

  console.log('[Firebase Admin] Inicializando o SDK...');

  try {
    // Tenta inicializar com as configurações validadas
    const adminApp = initializeApp(getAdminConfig());
    console.log('[Firebase Admin] SDK inicializado com sucesso.');
    return adminApp;
  } catch (error) {
    console.error('[Firebase Admin] Erro fatal ao inicializar o SDK:', error);
    // Em um cenário de erro, lançar a exceção impede a aplicação de continuar em um estado inválido.
    throw error;
  }
}

// Exporta as instâncias prontas para uso
export const adminApp = initializeAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
