
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * @summary Gatilho do Firebase Auth que é acionado na criação de um novo usuário.
 * @description Esta função é o núcleo do processo de onboarding de um novo tenant (clínica).
 * 1. Gera um ID de tenant único e "humanamente legível" (slug) com verificação de duplicidade.
 * 2. Cria um documento para o novo tenant na coleção `tenants` com configurações padrão.
 * 3. Define um status de trial de 7 dias.
 * 4. Cria um documento na coleção `tenant_users` para associar o novo usuário ao novo tenant com a permissão de 'owner'.
 * 5. Define os Custom Claims no objeto de usuário do Firebase Auth, o que é crucial para o controle de acesso.
 */
export const onUserCreate = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
  const { uid, displayName, email } = user;
  console.log(`Iniciando configuração para novo usuário: ${email} (ID: ${uid})`);

  // 1. GERAR TENANT_ID ÚNICO (Lógica mesclada)
  const baseSlug = displayName
    ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  let tenantId = baseSlug;
  let counter = 1;

  while (true) {
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) break;
    
    tenantId = `${baseSlug}-${counter}`;
    counter++;
    
    // Fallback para evitar loop infinito em caso de muitos nomes iguais
    if (counter > 10) {
      tenantId = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      break;
    }
  }
  console.log(`Slug final gerado para o tenant: ${tenantId}`);

  // 2. CRIAR DOCUMENTO DO TENANT (Lógica mesclada)
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 7);

  const tenantData = {
    id: tenantId,
    name: `Clínica ${displayName || email!.split('@')[0]}`, // Nome mais descritivo
    ownerId: uid,
    active: true,
    subscriptionStatus: 'trialing',
    trialEnds: admin.firestore.Timestamp.fromDate(trialEnds),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: { // Configurações padrão
      theme: 'light',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    }
  };

  // 3. CRIAR RELAÇÃO USER-TENANT
  const tenantUserData = {
    userId: uid,
    tenantId: tenantId,
    email: user.email,
    role: 'owner', // Mantendo 'role' para consistência com o resto do app
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  const tenantRef = db.collection('tenants').doc(tenantId);
  const tenantUserRef = db.collection('tenant_users').doc(`${uid}_${tenantId}`);
  const batch = db.batch();
  batch.set(tenantRef, tenantData);
  batch.set(tenantUserRef, tenantUserData);

  // 4. DEFINIR CUSTOM CLAIMS
  const claims = { tenants: { [tenantId]: 'owner' } };

  try {
    await Promise.all([
      batch.commit(),
      admin.auth().setCustomUserClaims(uid, claims),
    ]);
    functions.logger.info(`Tenant ${tenantId} criado com sucesso para usuário ${uid}.`);
    return null;
  } catch (error) {
    functions.logger.error(`Erro crítico ao criar tenant para usuário ${uid}:`, error);
    throw error; // Lançar o erro força a função a tentar novamente se configurado, e loga o erro.
  }
});

// A função checkTrialEndings permanece a mesma...
export const checkTrialEndings = functions.region('southamerica-east1').pubsub.schedule('every 24 hours').onRun(async (context) => {
  console.log('Executando verificação diária de expiração de trials...');

  const now = admin.firestore.Timestamp.now();

  try {
    const expiredTrialsSnapshot = await db.collection('tenants')
      .where('subscriptionStatus', '==', 'trialing')
      .where('trialEnds', '<', now)
      .get();

    if (expiredTrialsSnapshot.empty) {
      console.log('Nenhum trial expirado encontrado hoje.');
      return null;
    }

    const batch = db.batch();

    for (const doc of expiredTrialsSnapshot.docs) {
        const tenant = doc.data();
        const tenantId = doc.id;
        const ownerId = tenant.ownerId;

        console.log(`Trial expirado para o tenant: ${tenantId}. Atualizando status.`);

        batch.update(doc.ref, { subscriptionStatus: 'trial_expired' });

        const tenantUserRef = db.collection('tenant_users').doc(`${ownerId}_${tenantId}`);
        batch.update(tenantUserRef, { role: 'owner_trial_expired' });
    }

    await batch.commit();
    console.log(`${expiredTrialsSnapshot.size} tenants foram marcados como trial expirado.`);
    return null;
  } catch (error) {
    console.error('Erro ao verificar e atualizar trials expirados:', error);
    return null;
  }
});
