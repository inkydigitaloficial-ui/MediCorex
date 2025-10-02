import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const onUserCreate = functions.region('southamerica-east1').auth.user().onCreate(async (user) => {
  const { uid, displayName, email } = user;
  console.log(`Iniciando configuração para novo usuário: ${email} (ID: ${uid})`);

  // Lógica para gerar tenantId único
  const baseSlug = displayName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  let tenantId = baseSlug;
  let counter = 1;
  while (true) {
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) break;
    tenantId = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 10) {
      tenantId = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      break;
    }
  }
  console.log(`Slug final gerado para o tenant: ${tenantId}`);

  // Preparar dados para o batch
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 7);

  const tenantData = {
    id: tenantId,
    name: `Clínica ${displayName || email!.split('@')[0]}`,
    ownerId: uid,
    active: true,
    subscriptionStatus: 'trialing',
    trialEnds: admin.firestore.Timestamp.fromDate(trialEnds),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: { theme: 'light', language: 'pt-BR', timezone: 'America/Sao_Paulo' },
  };

  const tenantUserData = {
    userId: uid,
    tenantId: tenantId,
    email: user.email,
    role: 'owner',
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const userData = {
    uid: uid,
    displayName: displayName || '',
    email: email,
    photoURL: user.photoURL || null,
    disabled: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSignInTime: null,
    tenantIds: [tenantId], // Inicia com o primeiro tenant
  };

  // Referências dos documentos
  const tenantRef = db.collection('tenants').doc(tenantId);
  const tenantUserRef = db.collection('tenant_users').doc(`${uid}_${tenantId}`);
  const userRef = db.collection('users').doc(uid);

  // Executar operações em um batch
  const batch = db.batch();
  batch.set(tenantRef, tenantData);
  batch.set(tenantUserRef, tenantUserData);
  batch.set(userRef, userData, { merge: true }); // Usar merge para evitar sobreescrever dados existentes

  // Definir Custom Claims
  const claims = { tenants: { [tenantId]: 'owner' } };

  try {
    await Promise.all([
      batch.commit(),
      admin.auth().setCustomUserClaims(uid, claims),
    ]);
    functions.logger.info(`Tenant ${tenantId} e usuário ${uid} configurados com sucesso.`);
  } catch (error) {
    functions.logger.error(`Erro crítico ao configurar tenant para usuário ${uid}:`, error);
    throw error;
  }

  return null;
});

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
    expiredTrialsSnapshot.docs.forEach(doc => {
      const tenant = doc.data();
      const tenantId = doc.id;
      const ownerId = tenant.ownerId;
      console.log(`Trial expirado para o tenant: ${tenantId}. Atualizando status.`);
      batch.update(doc.ref, { subscriptionStatus: 'trial_expired' });
      const tenantUserRef = db.collection('tenant_users').doc(`${ownerId}_${tenantId}`);
      batch.update(tenantUserRef, { role: 'owner_trial_expired' });
    });

    await batch.commit();
    console.log(`${expiredTrialsSnapshot.size} tenants foram marcados como trial expirado.`);
  } catch (error) {
    console.error('Erro ao verificar e atualizar trials expirados:', error);
  }

  return null;
});
