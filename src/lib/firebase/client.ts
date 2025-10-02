
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp;

// Garante que o Firebase seja inicializado apenas uma vez.
// Este é o padrão recomendado para Next.js.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Usa a instância existente se já foi criada.
}

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);

// Exporta as instâncias de serviço para serem usadas em toda a aplicação cliente.
export { app, auth, firestore };

// Mantém a exportação 'db' para compatibilidade com qualquer código existente.
export const db = firestore;
